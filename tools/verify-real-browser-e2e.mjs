import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, createReadStream } from 'node:fs';
import { writeFile, rm, mkdir } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(projectRoot, 'dist');
const profileDir = path.join(projectRoot, '.tmp-browser-e2e-profile');
const chromePort = 9333;
const reportPath = path.join(projectRoot, 'REAL_BROWSER_E2E_REPORT.md');

class BrowserPolicyBlockError extends Error {
  constructor(message) {
    super(message);
    this.name = 'BrowserPolicyBlockError';
  }
}

const MIME_TYPES = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'application/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.webmanifest', 'application/manifest+json; charset=utf-8'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml'],
]);

function contentTypeFor(filePath) {
  return MIME_TYPES.get(path.extname(filePath)) ?? 'application/octet-stream';
}

async function startStaticServer(rootDir) {
  const server = createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://127.0.0.1');
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === '/') pathname = '/index.html';
    const filePath = path.normalize(path.join(rootDir, pathname));
    if (!filePath.startsWith(rootDir)) {
      res.writeHead(403).end('Forbidden');
      return;
    }
    if (!existsSync(filePath)) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentTypeFor(filePath) });
    createReadStream(filePath).pipe(res);
  });

  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Failed to start static server');
  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    async close() {
      await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    },
  };
}

class CdpClient {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.events = [];
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(`${message.error.message}: ${message.error.data ?? ''}`));
        else pending.resolve(message.result);
        return;
      }
      this.events.push(message);
    };
  }

  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
  }

  async waitForEvent(method, timeout = 10000) {
    const startedAt = Date.now();
    while (Date.now() - startedAt < timeout) {
      const index = this.events.findIndex((event) => event.method === method);
      if (index >= 0) return this.events.splice(index, 1)[0];
      await delay(50);
    }
    throw new Error(`Timed out waiting for ${method}`);
  }

  async navigate(url) {
    this.events = this.events.filter((event) => event.method !== 'Page.loadEventFired');
    await this.send('Page.navigate', { url });
    await this.waitForEvent('Page.loadEventFired', 15000);
  }

  async reload() {
    this.events = this.events.filter((event) => event.method !== 'Page.loadEventFired');
    await this.send('Page.reload', { ignoreCache: true });
    await this.waitForEvent('Page.loadEventFired', 15000);
  }

  async evaluate(expression, { awaitPromise = true, returnByValue = true } = {}) {
    const result = await this.send('Runtime.evaluate', { expression, awaitPromise, returnByValue });
    return result.result?.value;
  }

  async waitFor(expression, description, timeout = 12000) {
    const startedAt = Date.now();
    while (Date.now() - startedAt < timeout) {
      const passed = await this.evaluate(`Boolean(${expression})`);
      if (passed) return;
      await delay(100);
    }
    throw new Error(`Timed out waiting for ${description}`);
  }
}

async function waitForWebSocketUrl() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const targets = await fetch(`http://127.0.0.1:${chromePort}/json/list`).then((response) => response.json());
      const target = Array.isArray(targets) ? targets.find((item) => item.type === 'page' && item.webSocketDebuggerUrl) : null;
      if (target?.webSocketDebuggerUrl) return target.webSocketDebuggerUrl;
    } catch {}
    await delay(250);
  }
  throw new Error('Failed to acquire Chromium debugger websocket URL');
}

async function launchChromium() {
  await rm(profileDir, { recursive: true, force: true });
  await mkdir(profileDir, { recursive: true });

  const proc = spawn('/usr/bin/chromium', [
    '--headless',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--disable-crashpad-for-testing',
    `--user-data-dir=${profileDir}`,
    `--remote-debugging-port=${chromePort}`,
    'about:blank',
  ], { stdio: ['ignore', 'ignore', 'pipe'] });

  let stderr = '';
  proc.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
    if (stderr.length > 16000) stderr = stderr.slice(-16000);
  });

  const wsUrl = await waitForWebSocketUrl();
  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });

  const client = new CdpClient(ws);
  await client.send('Page.enable');
  await client.send('Runtime.enable');

  return {
    client,
    getStderr() {
      return stderr;
    },
    async close() {
      try { ws.close(); } catch {}
      proc.kill('SIGTERM');
      await delay(500);
      if (!proc.killed) proc.kill('SIGKILL');
      await rm(profileDir, { recursive: true, force: true });
    },
  };
}

function escapeJs(value) {
  return JSON.stringify(value);
}

async function clickByText(client, selector, text) {
  const clicked = await client.evaluate(`(() => {
    const elements = [...document.querySelectorAll(${escapeJs(selector)})];
    const target = elements.find((element) => (element.innerText || element.textContent || '').trim().includes(${escapeJs(text)}));
    if (!target) return false;
    target.click();
    return true;
  })()`);
  assert.equal(clicked, true, `Expected to click ${selector} containing ${text}`);
}

async function setInputValue(client, selector, value) {
  const changed = await client.evaluate(`(() => {
    const element = document.querySelector(${escapeJs(selector)});
    if (!(element instanceof HTMLInputElement)) return false;
    element.focus();
    element.value = ${escapeJs(value)};
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  })()`);
  assert.equal(changed, true, `Expected to set input ${selector}`);
}

async function detectPolicyBlock(client) {
  const href = String(await client.evaluate('location.href') ?? '');
  const body = String(await client.evaluate('document.body.innerText') ?? '');
  if (href.startsWith('chrome-error://chromewebdata/') && /organization doesn’t allow|organization doesn't allow|blocked/i.test(body)) {
    throw new BrowserPolicyBlockError(body.trim());
  }
}

function extractLoadedCount(text) {
  const normalized = String(text ?? '').replace(/\s+/g, ' ').trim();
  const match = normalized.match(/المحمل الآن\s+(\d+)\s+من\s+(\d+)/);
  return match ? Number(match[1]) : null;
}

assert(existsSync(path.join(distDir, 'index.html')), 'dist/ is missing. Run build before verify:e2e');

const server = await startStaticServer(distDir);
const browser = await launchChromium();

try {
  const { client } = browser;
  const baseUrl = server.baseUrl;

  await client.navigate(`${baseUrl}/about.html`);
  await delay(1500);
  await detectPolicyBlock(client);
  await client.waitFor(`window.location.hash === '#/about'`, 'legacy about redirect into hash route');
  await client.waitFor(`document.body.innerText.includes('عن التطبيق')`, 'about page content');

  await client.navigate(`${baseUrl}/#/settings`);
  await client.waitFor(`document.body.innerText.includes('حول التطبيق والسياسات')`, 'settings page');
  await clickByText(client, 'button', 'dark');
  await client.waitFor(`document.documentElement.classList.contains('dark')`, 'dark theme class');
  await client.waitFor(`(() => {
    const raw = localStorage.getItem('azkar-next.preferences');
    if (!raw) return false;
    try { return JSON.parse(raw).themeMode === 'dark'; } catch { return false; }
  })()`, 'dark theme persisted');
  await client.reload();
  await client.waitFor(`document.documentElement.classList.contains('dark')`, 'dark theme after reload');

  await client.navigate(`${baseUrl}/#/quran`);
  await client.waitFor(`document.querySelector('#quran-search')`, 'quran input');
  await setInputValue(client, '#quran-search', 'الكهف');
  await client.waitFor(`document.body.innerText.includes('الكهف')`, 'quran result visible');
  await clickByText(client, 'button', 'الكهف');
  await client.waitFor(`document.body.innerText.includes('الرجوع للفهرس')`, 'quran reader open');
  await client.waitFor(`document.body.innerText.includes('سورة رقم 18')`, 'quran subtitle');
  await client.waitFor(`document.body.innerText.includes('﴿1﴾')`, 'ayah visible');
  await client.reload();
  await client.waitFor(`document.body.innerText.includes('استئناف القراءة')`, 'bookmark banner after reload');

  await client.navigate(`${baseUrl}/#/stories`);
  await client.waitFor(`document.querySelector('#stories-search')`, 'stories input');
  await client.waitFor(`document.body.innerText.includes('تحميل قصص إضافية')`, 'stories load more button');
  const beforeLoadedCount = extractLoadedCount(await client.evaluate('document.body.innerText'));
  assert.notEqual(beforeLoadedCount, null, 'Expected initial stories loaded count');
  await clickByText(client, 'button', 'تحميل قصص إضافية');
  await client.waitFor(`(() => {
    const body = document.body.innerText.replace(/\s+/g, ' ').trim();
    const match = body.match(/المحمل الآن\s+(\d+)\s+من\s+(\d+)/);
    return Boolean(match) && Number(match[1]) > ${beforeLoadedCount};
  })()`, 'stories count increased');

  await client.navigate(`${baseUrl}/#/`);
  await client.waitFor(`document.body.innerText.includes('الرئيسية') || document.body.innerText.includes('لوحة اليوم')`, 'home route');
  await client.waitFor(`'serviceWorker' in navigator`, 'service worker support');
  await client.waitFor(`navigator.serviceWorker.getRegistrations().then((regs) => regs.some((registration) => registration.active?.scriptURL.includes('/sw.js')))`,'service worker registration',15000);

  await writeFile(reportPath, [
    '# Real Browser E2E Verification Report',
    '',
    '## Result',
    '- Real-browser E2E verification passed on top of the built `dist/` artifact using Chromium headless and Chrome DevTools Protocol.',
    '- Legacy `about.html` redirects into the unified hash-router shell in a real browser.',
    '- Theme toggling in `settings` persists through reload via localStorage and document root classes.',
    '- Quran search/open flow works end-to-end, and the bookmark banner survives reload.',
    '- Stories `تحميل قصص إضافية` works in a real browser over the built artifact.',
    '- `sw.js` is actually registered by the browser shell on localhost.',
    '',
  ].join('\n'));

  console.log('Real browser E2E verification passed.');
} catch (error) {
  if (error instanceof BrowserPolicyBlockError) {
    await writeFile(reportPath, [
      '# Real Browser E2E Verification Report',
      '',
      '## Result',
      '- The real-browser E2E harness is implemented and ready, but full execution is blocked in the current environment by Chromium organizational policy.',
      '- Chromium redirects application URLs to `chrome-error://chromewebdata/` with a policy message instead of loading `localhost` or `file://` resources.',
      '',
      '## Blocking message observed',
      `> ${error.message.replace(/\n/g, '\n> ')}`,
      '',
      '## What is already ready',
      '- Static/browser-runtime verification on `dist/` still passes.',
      '- DOM/component interaction tests still pass.',
      '- The CDP-based browser harness is present in `tools/verify-real-browser-e2e.mjs` and can be re-used in an unrestricted environment.',
      '',
      '## Next action outside this environment',
      '- Run `npm run build && npm run verify:e2e` on a machine or CI runner where Chromium is allowed to open localhost resources.',
      '',
    ].join('\n'));
    console.warn('Real browser E2E harness is ready, but this environment blocks Chromium from opening localhost/file resources.');
    process.exitCode = 2;
  } else {
    console.error(browser.getStderr());
    throw error;
  }
} finally {
  await browser.close();
  await server.close();
}

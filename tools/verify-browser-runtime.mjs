import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync, createReadStream } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(projectRoot, 'dist');

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
  if (!address || typeof address === 'string') throw new Error('Failed to acquire static server address');
  return {
    baseUrl: `http://127.0.0.1:${address.port}`,
    async close() {
      await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
    },
  };
}

function extractInlineScript(html) {
  const match = html.match(/<script>([\s\S]*?)<\/script>/i);
  assert(match, 'Expected inline redirect script');
  return match[1];
}

function executeRedirectScript(script, href) {
  let replaced = null;
  const url = new URL(href);
  const location = {
    href,
    origin: url.origin,
    pathname: url.pathname,
    search: url.search,
    hash: url.hash,
    replace(nextHref) { replaced = nextHref; },
  };
  const context = vm.createContext({ URL, window: { location }, location });
  vm.runInContext(script, context, { timeout: 1000 });
  return replaced;
}

const expectedFiles = ['index.html', '404.html', 'about.html', 'privacy.html', 'terms.html', 'contact.html', 'manifest.webmanifest', 'sw.js'];
for (const relativePath of expectedFiles) {
  assert(existsSync(path.join(distDir, relativePath)), `Missing dist artifact: ${relativePath}`);
}

const server = await startStaticServer(distDir);
try {
  const indexHtml = await fetch(`${server.baseUrl}/`).then((response) => response.text());
  assert.match(indexHtml, /<div id="root"><\/div>/, 'Index HTML should contain root mount point');
  assert.match(indexHtml, /manifest\.webmanifest/, 'Index HTML should reference manifest');

  for (const [pathname, hashTarget] of [['/about.html','./#/about'],['/privacy.html','./#/privacy'],['/terms.html','./#/terms'],['/contact.html','./#/contact']]) {
    const html = await fetch(`${server.baseUrl}${pathname}`).then((response) => response.text());
    assert.match(html, new RegExp(hashTarget.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    assert.equal(executeRedirectScript(extractInlineScript(html), `${server.baseUrl}${pathname}`), new URL(hashTarget, `${server.baseUrl}${pathname}`).toString());
  }

  const notFoundHtml = await fetch(`${server.baseUrl}/404.html`).then((response) => response.text());
  assert.equal(
    executeRedirectScript(extractInlineScript(notFoundHtml), `${server.baseUrl}/deep/link/path?foo=1#section`),
    `${server.baseUrl}/deep/#/link/path?foo=1#section`,
  );

  assert.equal(
    executeRedirectScript(extractInlineScript(notFoundHtml), `${server.baseUrl}/privacy?foo=1#section`),
    `${server.baseUrl}/#/privacy?foo=1#section`,
  );

  const manifest = JSON.parse(await fetch(`${server.baseUrl}/manifest.webmanifest`).then((response) => response.text()));
  assert.equal(manifest.start_url, './#/');
  assert.equal(manifest.scope, './');
  assert.ok(manifest.icons.every((icon) => typeof icon.src === 'string' && icon.src.startsWith('./icons/')));

  const sw = await fetch(`${server.baseUrl}/sw.js`).then((response) => response.text());
  assert.match(sw, /APP_SHELL_CACHE/);
  assert.match(sw, /LEGACY_CACHE_PREFIXES/);
  assert.doesNotMatch(sw, /js\/app\.js/);
  assert.doesNotMatch(sw, /ads-config|rewarded|Firestore|firebase-core/);

  await writeFile(path.join(projectRoot, 'BROWSER_RUNTIME_REPORT.md'), [
    '# Browser Runtime Verification Report',
    '',
    '## Result',
    '- Browser/static-hosting verification passed on the built `dist/` artifact.',
    '- Legal redirect shims are present in `dist/`, not only in the source root.',
    '- `404.html` preserves pathname, query, and hash when redirecting into the hash-router shell.',
    '- `manifest.webmanifest` remains hash-router compatible and uses relative icon URLs.',
    '- `sw.js` contains the current cache strategy and no legacy runtime references.',
    '',
    '## Checks executed',
    '- Served `dist/` over a local static HTTP server.',
    '- Fetched `index.html`, legal redirect shims, `404.html`, `manifest.webmanifest`, and `sw.js` over HTTP.',
    '- Executed inline redirect scripts with simulated browser `window.location` state.',
    '',
  ].join('\n'));
  console.log('Browser runtime verification passed.');
} finally {
  await server.close();
}

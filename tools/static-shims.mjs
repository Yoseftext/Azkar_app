import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promises as fs } from 'node:fs';
import { fallbackShim, routeRedirectShims } from './static-shims.config.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectories = [projectRoot, path.join(projectRoot, 'public')];
const mode = process.argv.includes('--check') ? 'check' : 'write';

function buildRouteRedirectShim(route) {
  const target = `./#${route}`;
  return [
    '<!DOCTYPE html>',
    '<html lang="ar" dir="rtl">',
    '<head>',
    '  <meta charset="UTF-8" />',
    `  <meta http-equiv="refresh" content="0; url=${target}" />`,
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    '  <title>جاري تحويلك…</title>',
    '  <script>',
    `    window.location.replace(new URL('${target}', window.location.href).toString());`,
    '  </script>',
    '</head>',
    '<body>',
    '  <p>تم توحيد هذه الصفحة داخل التطبيق. إذا لم يتم التحويل تلقائيًا، استخدم هذا الرابط:</p>',
    `  <p><a href="${target}">${route}</a></p>`,
    '</body>',
    '</html>',
    '',
  ].join('\n');
}

function buildFallbackShim() {
  return [
    '<!DOCTYPE html>',
    '<html lang="ar" dir="rtl">',
    '<head>',
    '  <meta charset="UTF-8" />',
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    '  <title>جاري تحويلك…</title>',
    '  <script>',
    '    (function () {',
    "      var pathSegments = window.location.pathname.split('/').filter(Boolean);",
    '      var hasAppSubpath = pathSegments.length > 1;',
    "      var basePath = hasAppSubpath ? '/' + pathSegments[0] : '';",
    "      var routePath = hasAppSubpath ? '/' + pathSegments.slice(1).join('/') : window.location.pathname;",
    "      var query = window.location.search || '';",
    "      var hash = window.location.hash || '';",
    "      var normalizedRoute = routePath.replace(/\\/index\\.html$/, '').replace(/\\/404\\.html$/, '') || '/';",
    "      var target = basePath + '/#' + normalizedRoute + query + hash;",
    '      window.location.replace(window.location.origin + target);',
    '    })();',
    '  </script>',
    '</head>',
    '<body>',
    '  <p>جاري تحويلك إلى التطبيق…</p>',
    '</body>',
    '</html>',
    '',
  ].join('\n');
}

const expectedFiles = [
  ...routeRedirectShims.map((shim) => ({ filename: shim.filename, content: buildRouteRedirectShim(shim.route) })),
  { filename: fallbackShim.filename, content: buildFallbackShim() },
];

let hasMismatch = false;
for (const directory of outputDirectories) {
  for (const file of expectedFiles) {
    const targetPath = path.join(directory, file.filename);
    const existing = await fs.readFile(targetPath, 'utf8').catch(() => null);
    if (mode === 'check') {
      if (existing !== file.content) {
        hasMismatch = true;
        console.error(`Static shim drift detected: ${path.relative(projectRoot, targetPath)}`);
      }
      continue;
    }

    if (existing !== file.content) {
      await fs.writeFile(targetPath, file.content, 'utf8');
      console.log(`Updated ${path.relative(projectRoot, targetPath)}`);
    }
  }
}

if (mode === 'check' && hasMismatch) {
  process.exitCode = 1;
}

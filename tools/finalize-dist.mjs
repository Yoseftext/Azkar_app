import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promises as fs } from 'node:fs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceIndexPath = path.join(projectRoot, 'index.html');
const distDir = path.join(projectRoot, 'dist');
const assetsDir = path.join(distDir, 'assets');

async function main() {
  const assetFiles = await fs.readdir(assetsDir);
  const entryScript = assetFiles.find((name) => /^index-.*\.js$/.test(name));
  if (!entryScript) {
    throw new Error('Unable to locate built entry chunk matching index-*.js in dist/assets');
  }
  const entryStyles = assetFiles.filter((name) => /^index-.*\.css$/.test(name)).sort();
  const sourceIndex = await fs.readFile(sourceIndexPath, 'utf8');
  const sourceManifestHref = sourceIndex.match(/<link rel="manifest" href="([^"]+)"\s*\/?>/i)?.[1] ?? './manifest.webmanifest';
  const sourceIconHref = sourceIndex.match(/<link rel="icon" href="([^"]+)"\s*\/?>/i)?.[1] ?? './icons/icon-192x192.png';
  const normalizePublicHref = (href) => href.startsWith('/') ? `.${href}` : href;

  const cssLinks = entryStyles.map((name) => `    <link rel="stylesheet" crossorigin href="./assets/${name}" />`).join('\n');
  const html = [
    '<!doctype html>',
    '<html lang="ar" dir="rtl">',
    '  <head>',
    '    <meta charset="UTF-8" />',
    '    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />',
    '    <meta name="theme-color" content="#0f172a" />',
    '    <meta name="description" content="تطبيق أذكار المسلم - نسخة معمارية حديثة قابلة للتوسع" />',
    `    <link rel="manifest" href="${normalizePublicHref(sourceManifestHref)}" />`,
    `    <link rel="icon" href="${normalizePublicHref(sourceIconHref)}" />`,
    '    <title>أذكار المسلم</title>',
    cssLinks,
    '  </head>',
    '  <body>',
    '    <div id="root"></div>',
    `    <script type="module" crossorigin src="./assets/${entryScript}"></script>`,
    '  </body>',
    '</html>',
    '',
  ].filter(Boolean).join('\n');

  await fs.writeFile(path.join(distDir, 'index.html'), html, 'utf8');
  console.log(`Dist finalized with entry ./assets/${entryScript}`);
}

await main();

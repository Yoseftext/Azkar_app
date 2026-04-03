import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assetsDir = path.join(projectRoot, 'dist', 'assets');

const BUDGETS = {
  maxTotalAssets: 200,
  maxJsChunks: 180,
  maxTinyJsChunks: 60,
  maxLargeJsChunks: 18,
  maxLargestJsChunkKb: 320,
};

async function listAssetFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const absolutePath = path.join(directory, entry.name);
    const details = await stat(absolutePath);
    files.push({
      name: entry.name,
      sizeBytes: details.size,
      sizeKb: Number((details.size / 1024).toFixed(2)),
      ext: path.extname(entry.name),
    });
  }
  return files;
}

function classifyAssets(files) {
  const jsFiles = files.filter((file) => file.ext === '.js');
  const cssFiles = files.filter((file) => file.ext === '.css');
  const tinyJsFiles = jsFiles.filter((file) => file.sizeBytes < 2048);
  const largeJsFiles = jsFiles.filter((file) => file.sizeBytes >= 50 * 1024);
  const largestJsChunk = [...jsFiles].sort((left, right) => right.sizeBytes - left.sizeBytes)[0] ?? null;

  return {
    totalAssets: files.length,
    jsCount: jsFiles.length,
    cssCount: cssFiles.length,
    tinyJsCount: tinyJsFiles.length,
    largeJsCount: largeJsFiles.length,
    largestJsChunk,
    top10LargestJs: [...jsFiles].sort((left, right) => right.sizeBytes - left.sizeBytes).slice(0, 10),
  };
}

function evaluateBudgets(summary) {
  const violations = [];
  if (summary.totalAssets > BUDGETS.maxTotalAssets) violations.push(`total assets ${summary.totalAssets} > ${BUDGETS.maxTotalAssets}`);
  if (summary.jsCount > BUDGETS.maxJsChunks) violations.push(`js chunks ${summary.jsCount} > ${BUDGETS.maxJsChunks}`);
  if (summary.tinyJsCount > BUDGETS.maxTinyJsChunks) violations.push(`tiny js chunks ${summary.tinyJsCount} > ${BUDGETS.maxTinyJsChunks}`);
  if (summary.largeJsCount > BUDGETS.maxLargeJsChunks) violations.push(`large js chunks ${summary.largeJsCount} > ${BUDGETS.maxLargeJsChunks}`);
  if (summary.largestJsChunk && summary.largestJsChunk.sizeKb > BUDGETS.maxLargestJsChunkKb) {
    violations.push(`largest js chunk ${summary.largestJsChunk.sizeKb} KB > ${BUDGETS.maxLargestJsChunkKb} KB`);
  }
  return violations;
}

try {
  const files = await listAssetFiles(assetsDir);
  const summary = classifyAssets(files);
  const violations = evaluateBudgets(summary);

  console.log('Build Chunk Audit');
  console.log('=================');
  console.log(`Total assets: ${summary.totalAssets}`);
  console.log(`JavaScript chunks: ${summary.jsCount}`);
  console.log(`CSS assets: ${summary.cssCount}`);
  console.log(`Tiny JS chunks (<2KB): ${summary.tinyJsCount}`);
  console.log(`Large JS chunks (>=50KB): ${summary.largeJsCount}`);
  if (summary.largestJsChunk) {
    console.log(`Largest JS chunk: ${summary.largestJsChunk.name} (${summary.largestJsChunk.sizeKb} KB)`);
  }
  console.log('');
  console.log('Top JavaScript chunks by size:');
  for (const file of summary.top10LargestJs) console.log(`- ${file.name}: ${file.sizeKb} KB`);
  console.log('');
  console.log('Budget thresholds:');
  console.log(`- Total assets <= ${BUDGETS.maxTotalAssets}`);
  console.log(`- JavaScript chunks <= ${BUDGETS.maxJsChunks}`);
  console.log(`- Tiny JS chunks <2KB <= ${BUDGETS.maxTinyJsChunks}`);
  console.log(`- Large JS chunks >=50KB <= ${BUDGETS.maxLargeJsChunks}`);
  console.log(`- Largest JS chunk <= ${BUDGETS.maxLargestJsChunkKb} KB`);

  if (violations.length > 0) {
    console.log('');
    console.log('Budget violations:');
    for (const violation of violations) console.log(`- ${violation}`);
    process.exitCode = 1;
  }
} catch (error) {
  console.error('Chunk audit failed:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
}

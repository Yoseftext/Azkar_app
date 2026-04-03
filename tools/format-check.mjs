import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promises as fs } from 'node:fs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const roots = ['src', 'tests', 'tools', '.github'];
const rootFiles = ['index.html','package.json','tsconfig.json','vite.config.ts','README.md','.gitignore','.env.example','.editorconfig'];
const eligibleExtensions = new Set(['.ts','.tsx','.js','.mjs','.json','.md','.html','.yml','.yaml','.css']);
const shouldWrite = process.argv.includes('--write');
const issues = [];

function normalize(filePath) { return filePath.split(path.sep).join('/'); }
async function exists(filePath) { try { await fs.access(filePath); return true; } catch { return false; } }
async function walk(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') continue;
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else files.push(fullPath);
  }
  return files;
}
function getFormattedText(text) {
  let next = text.replace(/\r\n?/g, '\n').replace(/[ \t]+$/gm, '');
  if (next.length > 0 && !next.endsWith('\n')) next += '\n';
  return next;
}
async function processFile(filePath) {
  const relativePath = normalize(path.relative(projectRoot, filePath));
  const original = await fs.readFile(filePath, 'utf8');
  const formatted = getFormattedText(original);
  if (original === formatted) return;
  const problems = [];
  if (/\r\n?/.test(original)) problems.push('line-endings');
  if (/[ \t]+$/m.test(original)) problems.push('trailing-whitespace');
  if (original.length > 0 && !original.endsWith('\n')) problems.push('missing-final-newline');
  if (shouldWrite) await fs.writeFile(filePath, formatted, 'utf8');
  issues.push({ relativePath, problems });
}
const targets = [];
for (const root of roots) {
  const absoluteRoot = path.join(projectRoot, root);
  if (!await exists(absoluteRoot)) continue;
  const files = await walk(absoluteRoot);
  for (const filePath of files) if (eligibleExtensions.has(path.extname(filePath))) targets.push(filePath);
}
for (const fileName of rootFiles) {
  const absolutePath = path.join(projectRoot, fileName);
  if (await exists(absolutePath)) targets.push(absolutePath);
}
for (const filePath of [...new Set(targets.map((f) => path.resolve(f)))]) await processFile(filePath);
issues.sort((a,b)=>a.relativePath.localeCompare(b.relativePath));
if (issues.length > 0) {
  if (shouldWrite) console.log(`Format applied to ${issues.length} file(s).`);
  else {
    console.error('Format check failed.');
    for (const issue of issues) console.error(`${issue.relativePath}: ${issue.problems.join(', ')}`);
    process.exitCode = 1;
  }
} else {
  console.log(shouldWrite ? 'Format already normalized.' : 'Format check passed.');
}

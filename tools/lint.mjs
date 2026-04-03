import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promises as fs } from 'node:fs';
import ts from 'typescript';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceRoots = ['src', 'tests', 'tools'];
const scriptExtensions = new Set(['.ts', '.tsx', '.js', '.mjs']);
const sourceStorageAllowlist = new Set([
  normalize('src/kernel/storage/local-storage-engine.ts'),
]);
const issues = [];

function normalize(filePath) {
  return filePath.split(path.sep).join('/');
}

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

function addIssue(filePath, line, column, code, message) {
  issues.push({ filePath, line, column, code, message });
}

function isTestFile(relativePath) { return relativePath.startsWith('tests/'); }
function isToolFile(relativePath) { return relativePath.startsWith('tools/'); }
function isSourceFile(relativePath) { return relativePath.startsWith('src/'); }

function checkFile(relativePath, sourceText) {
  const extension = path.extname(relativePath);
  const scriptKind = extension === '.tsx' ? ts.ScriptKind.TSX : extension === '.ts' ? ts.ScriptKind.TS : ts.ScriptKind.JS;
  const sourceFile = ts.createSourceFile(relativePath, sourceText, ts.ScriptTarget.Latest, true, scriptKind);

  function reportNode(node, code, message) {
    const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
    addIssue(relativePath, position.line + 1, position.character + 1, code, message);
  }

  function checkStorageAccess(node) {
    const inAllowedFile = sourceStorageAllowlist.has(relativePath) || isTestFile(relativePath) || isToolFile(relativePath);
    if (inAllowedFile || !isSourceFile(relativePath)) return;

    if (ts.isPropertyAccessExpression(node) && (node.name.text === 'localStorage' || node.name.text === 'sessionStorage')) {
      reportNode(node, 'no-raw-storage', 'Raw browser storage access is forbidden in source files. Route through the storage abstraction instead.');
      return;
    }

    if (ts.isIdentifier(node) && (node.text === 'localStorage' || node.text === 'sessionStorage') && ts.isPropertyAccessExpression(node.parent) && node.parent.expression === node) {
      reportNode(node, 'no-raw-storage', 'Raw browser storage access is forbidden in source files. Route through the storage abstraction instead.');
    }
  }

  function visit(node) {
    if (ts.isJsxAttributes(node)) {
      const seen = new Map();
      for (const property of node.properties) {
        if (!ts.isJsxAttribute(property)) continue;
        const name = property.name.text;
        if (seen.has(name)) reportNode(property, 'no-duplicate-jsx-props', `Duplicate JSX prop \`${name}\` is forbidden.`);
        else seen.set(name, property);
        if (name === 'dangerouslySetInnerHTML') reportNode(property, 'no-dangerous-html', 'dangerouslySetInnerHTML is forbidden in this codebase.');
      }
    }
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'eval') {
      reportNode(node, 'no-eval', 'eval() is forbidden.');
    }
    if (ts.isNewExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 'Function') {
      reportNode(node, 'no-new-function', 'new Function() is forbidden.');
    }
    checkStorageAccess(node);
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
}

for (const root of sourceRoots) {
  const absoluteRoot = path.join(projectRoot, root);
  const files = await walk(absoluteRoot);
  for (const filePath of files) {
    if (!scriptExtensions.has(path.extname(filePath))) continue;
    const relativePath = normalize(path.relative(projectRoot, filePath));
    const text = await fs.readFile(filePath, 'utf8');
    checkFile(relativePath, text);
  }
}

issues.sort((a, b) => a.filePath.localeCompare(b.filePath) || a.line - b.line || a.column - b.column || a.code.localeCompare(b.code));
if (issues.length > 0) {
  console.error('Lint gate failed.');
  for (const issue of issues) console.error(`${issue.filePath}:${issue.line}:${issue.column} [${issue.code}] ${issue.message}`);
  process.exitCode = 1;
} else {
  console.log('Lint gate passed.');
}

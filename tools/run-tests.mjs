import { spawn } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const testsDir = path.join(projectRoot, 'tests');
const entries = await readdir(testsDir);
const testFiles = entries
  .filter((name) => name.endsWith('.test.ts'))
  .sort()
  .map((name) => path.join('tests', name));

function run(command, args) {
  return new Promise((resolve) => {
    const proc = spawn(command, args, { cwd: projectRoot, stdio: 'inherit', shell: false });
    proc.on('exit', (code) => resolve(code ?? 1));
  });
}

for (const file of testFiles) {
  console.log(`\n=== ${file} ===`);
  const code = await run('node', ['--import', './tools/test/register-alias-loader.mjs', '--test', '--test-force-exit', file]);
  if (code !== 0) {
    process.exitCode = code;
    break;
  }
}

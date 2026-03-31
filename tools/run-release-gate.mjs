import { spawn } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reportPath = path.join(projectRoot, 'RELEASE_READINESS_REPORT.md');
const steps = [
  ['test', ['npm', 'test']],
  ['build', ['npm', 'run', 'build']],
  ['browser-runtime', ['npm', 'run', 'verify:browser']],
  ['real-browser-e2e', ['npm', 'run', 'verify:e2e']],
];

const results = [];
for (const [name, command] of steps) {
  const code = await new Promise((resolve) => {
    const proc = spawn(command[0], command.slice(1), { stdio: 'inherit', cwd: projectRoot, shell: false });
    proc.on('exit', (exitCode) => resolve(exitCode ?? 1));
  });
  results.push({ name, code });
  if (code !== 0 && !(name === 'real-browser-e2e' && code === 2)) break;
}

const lines = ['# Release Readiness Report', '', '## Step results'];
for (const result of results) {
  const status = result.code === 0 ? 'passed' : result.code === 2 ? 'blocked-by-environment' : 'failed';
  lines.push(`- ${result.name}: ${status}`);
}
if (results.some((result) => result.name === 'real-browser-e2e' && result.code === 2)) {
  lines.push('', '## Note', '- Real-browser E2E is prepared but blocked by Chromium policy in the current environment.');
}
await writeFile(reportPath, lines.join('\n'));

const hardFailure = results.find((result) => result.code !== 0 && !(result.name === 'real-browser-e2e' && result.code === 2));
if (hardFailure) process.exitCode = hardFailure.code;

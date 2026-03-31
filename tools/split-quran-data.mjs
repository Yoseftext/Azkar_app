import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const sourcePath = path.join(projectRoot, 'tools', 'legacy-content', 'quranData.js');
const outputDir = path.join(projectRoot, 'src', 'content', 'quran', 'surahs');

const source = await readFile(sourcePath, 'utf8');
const marker = 'export const QURAN_JSON =';
const [, rawPayload = ''] = source.split(marker);

if (!rawPayload.trim()) {
  throw new Error('تعذر العثور على QURAN_JSON داخل tools/legacy-content/quranData.js');
}

const payload = JSON.parse(rawPayload.trim().replace(/;\s*$/, ''));
await mkdir(outputDir, { recursive: true });

for (const [surahNumber, ayahs] of Object.entries(payload)) {
  const fileName = `${String(Number(surahNumber)).padStart(3, '0')}.json`;
  const filePath = path.join(outputDir, fileName);
  await writeFile(filePath, `${JSON.stringify(ayahs, null, 2)}\n`, 'utf8');
}

console.log(`Generated ${Object.keys(payload).length} surah files in ${outputDir}`);

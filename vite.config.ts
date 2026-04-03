import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';

const STORY_ITEM_BATCH_SIZE = 25;
const QURAN_SURAH_TARGET_CHUNK_BYTES = 140 * 1024;

function normalizePath(id: string): string {
  return id.split(path.win32.sep).join('/');
}

function createQuranSurahChunkMap(): Map<number, string> {
  const surahsDir = path.resolve(__dirname, 'src/content/quran/surahs');
  const surahFiles = fs
    .readdirSync(surahsDir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => ({
      surahNumber: Number(path.basename(file, '.json')),
      sizeBytes: fs.statSync(path.join(surahsDir, file)).size,
    }))
    .filter((entry) => Number.isFinite(entry.surahNumber))
    .sort((left, right) => left.surahNumber - right.surahNumber);

  const chunkMap = new Map<number, string>();
  let batchSurahNumbers: number[] = [];
  let batchSize = 0;

  function flushBatch(): void {
    if (batchSurahNumbers.length === 0) return;
    const start = batchSurahNumbers[0];
    const end = batchSurahNumbers[batchSurahNumbers.length - 1];
    const chunkName = `quran-surahs-${String(start).padStart(3, '0')}-${String(end).padStart(3, '0')}`;
    for (const surahNumber of batchSurahNumbers) chunkMap.set(surahNumber, chunkName);
    batchSurahNumbers = [];
    batchSize = 0;
  }

  for (const entry of surahFiles) {
    const wouldExceedTarget = batchSurahNumbers.length > 0 && batchSize + entry.sizeBytes > QURAN_SURAH_TARGET_CHUNK_BYTES;
    if (wouldExceedTarget) flushBatch();
    batchSurahNumbers.push(entry.surahNumber);
    batchSize += entry.sizeBytes;
  }

  flushBatch();
  return chunkMap;
}

const quranSurahChunkMap = createQuranSurahChunkMap();

function resolveContentChunk(id: string): string | undefined {
  const normalizedId = normalizePath(id);

  const storyItemMatch = normalizedId.match(/\/src\/content\/stories\/generated\/items\/([^/]+)\/(\d+)\.js$/);
  if (storyItemMatch) {
    const [, categorySlug, itemNumberRaw] = storyItemMatch;
    const itemNumber = Number(itemNumberRaw);
    const batchIndex = Number.isFinite(itemNumber) ? Math.max(0, Math.floor((itemNumber - 1) / STORY_ITEM_BATCH_SIZE)) : 0;
    return `story-items-${categorySlug}-batch-${batchIndex}`;
  }

  const quranSurahMatch = normalizedId.match(/\/src\/content\/quran\/surahs\/(\d+)\.json$/);
  if (quranSurahMatch) {
    return quranSurahChunkMap.get(Number(quranSurahMatch[1]));
  }

  const duasCategoryMatch = normalizedId.match(/\/src\/content\/duas\/generated\/categories\/([^/]+)\.js$/);
  if (duasCategoryMatch) return `dua-category-${duasCategoryMatch[1]}`;

  const azkarCategoryMatch = normalizedId.match(/\/src\/content\/azkar\/generated\/categories\/([^/]+)\.js$/);
  if (azkarCategoryMatch) return `azkar-category-${azkarCategoryMatch[1]}`;

  return undefined;
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const contentChunk = resolveContentChunk(id);
          if (contentChunk) return contentChunk;
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('firebase')) return 'firebase-auth';
          if (id.includes('react-router') || id.includes('@remix-run/router')) return 'router-vendor';
          if (id.includes('react-dom') || id.includes('react/jsx-runtime') || /node_modules\/react\//.test(id)) return 'react-vendor';
          if (id.includes('zustand')) return 'state-vendor';
          return 'vendor';
        },
      },
    },
  },
});

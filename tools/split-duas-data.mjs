import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const manifestPath = path.join(rootDir, 'src/content/sources/duas/manifest.js');
const sourceCategoriesDir = path.join(rootDir, 'src/content/sources/duas/categories');
const outputDir = path.join(rootDir, 'src/content/duas/generated');
const categoriesDir = path.join(outputDir, 'categories');

function toModuleCode(name, value) {
  return `export const ${name} = ${JSON.stringify(value, null, 2)};\nexport default ${name};\n`;
}

function toAsciiSlug(value, fallback) {
  const normalized = String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || fallback;
}

function normalizeReference(reference) {
  if (!reference) return null;
  if (typeof reference === 'string') {
    const value = reference.trim();
    return value || null;
  }
  if (Array.isArray(reference)) {
    const values = reference.map((item) => normalizeReference(item)).filter(Boolean);
    return values.length ? values.join(' • ') : null;
  }
  if (typeof reference === 'object') {
    const surahName = typeof reference.surah?.name === 'string' ? reference.surah.name.trim() : '';
    const surahNumber = reference.surah?.number;
    const ayah = reference.ayah;
    if (surahName && typeof ayah === 'number') {
      return `${surahName}${typeof surahNumber === 'number' ? ` (${surahNumber})` : ''} • آية ${ayah}`;
    }
  }
  return null;
}

function normalizeRepeatTarget(value) {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value;
  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return null;
}

function normalizeSourceItem(item, categoryTitle, index) {
  const text = typeof item.text === 'string' ? item.text.trim() : '';
  if (!text) return null;

  const rawId = item.id ?? `${categoryTitle}-${index + 1}`;
  return {
    id: String(rawId),
    text,
    reference: normalizeReference(item.reference),
    source: typeof item.source === 'string' && item.source.trim() ? item.source.trim() : null,
    repeatTarget: normalizeRepeatTarget(item.repeatTarget),
    description: typeof item.description === 'string' && item.description.trim() ? item.description.trim() : null,
    originalCategory: typeof item.originalCategory === 'string' && item.originalCategory.trim() ? item.originalCategory.trim() : null,
  };
}

const manifestModule = await import(pathToFileURL(manifestPath).href);
const manifest = manifestModule.DUAS_SOURCE_MANIFEST ?? manifestModule.default ?? [];

await rm(outputDir, { recursive: true, force: true });
await mkdir(categoriesDir, { recursive: true });

const summaries = [];
const registryEntries = [];

for (const [index, entry] of manifest.entries()) {
  const sourcePath = path.join(sourceCategoriesDir, entry.fileName);
  const sourceModule = await import(pathToFileURL(sourcePath).href);
  const sourceCategory = sourceModule.DUA_SOURCE_CATEGORY ?? sourceModule.default ?? null;
  if (!sourceCategory) continue;

  const slug = toAsciiSlug(sourceCategory.slug ?? entry.slug, `dua-category-${String(index + 1).padStart(2, '0')}`);
  const title = String(sourceCategory.title ?? entry.title ?? '').trim() || `تصنيف ${index + 1}`;
  const normalizedItems = Array.isArray(sourceCategory.items)
    ? sourceCategory.items
        .map((item, itemIndex) => normalizeSourceItem(item, title, itemIndex))
        .filter(Boolean)
    : [];

  if (!normalizedItems.length) continue;

  const sources = [...new Set(normalizedItems.map((item) => item.source).filter(Boolean))];
  const category = {
    slug,
    title,
    itemCount: normalizedItems.length,
    preview: normalizedItems[0]?.text ?? 'لا يوجد نص تمهيدي لهذه الفئة.',
    sources,
    itemIds: normalizedItems.map((item) => item.id),
    itemsLoaded: true,
    items: normalizedItems,
  };

  summaries.push({
    slug,
    title,
    itemCount: category.itemCount,
    preview: category.preview,
    sources,
    itemIds: category.itemIds,
    itemsLoaded: false,
    items: [],
  });

  const fileName = `${slug}.js`;
  await writeFile(path.join(categoriesDir, fileName), toModuleCode('DUA_CATEGORY', category), 'utf8');
  registryEntries.push(`  '${slug}': () => import('./categories/${fileName}'),`);
}

await writeFile(path.join(outputDir, 'summary.js'), toModuleCode('DUA_CATEGORY_SUMMARY', summaries), 'utf8');
await writeFile(
  path.join(outputDir, 'registry.js'),
  [
    "import { DUA_CATEGORY_SUMMARY } from './summary.js';",
    '',
    'export const DUA_CATEGORY_LOADERS = {',
    registryEntries.join('\n'),
    '};',
    '',
    'export { DUA_CATEGORY_SUMMARY };',
    '',
  ].join('\n'),
  'utf8',
);

console.log(`Generated ${summaries.length} dua categories from source manifest.`);

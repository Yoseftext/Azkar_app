import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const manifestPath = path.join(rootDir, 'src/content/sources/azkar/manifest.js');
const sourceCategoriesDir = path.join(rootDir, 'src/content/sources/azkar/categories');
const outputDir = path.join(rootDir, 'src/content/azkar/generated');
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

function normalizeRepeatTarget(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? Math.floor(numeric) : 1;
}

function normalizeSourceItem(item, categoryTitle, categorySlug, index) {
  const text = typeof item.text === 'string' ? item.text.trim() : '';
  if (!text) return null;

  const numericLegacyId = Number(item.id);
  const legacyId = Number.isFinite(numericLegacyId) ? numericLegacyId : index + 1;

  return {
    id: `${categorySlug}-${legacyId}`,
    legacyId,
    categorySlug,
    categoryTitle,
    text,
    repeatTarget: normalizeRepeatTarget(item.repeatTarget),
    reference: typeof item.reference === 'string' && item.reference.trim() ? item.reference.trim() : undefined,
  };
}

const manifestModule = await import(pathToFileURL(manifestPath).href);
const manifest = manifestModule.AZKAR_SOURCE_MANIFEST ?? manifestModule.default ?? [];

await rm(outputDir, { recursive: true, force: true });
await mkdir(categoriesDir, { recursive: true });

const summaries = [];
const registryEntries = [];

for (const [index, entry] of manifest.entries()) {
  const sourcePath = path.join(sourceCategoriesDir, entry.fileName);
  const sourceModule = await import(pathToFileURL(sourcePath).href);
  const sourceCategory = sourceModule.AZKAR_SOURCE_CATEGORY ?? sourceModule.default ?? null;
  if (!sourceCategory) continue;

  const slug = toAsciiSlug(sourceCategory.slug ?? entry.slug, `azkar-category-${index + 1}`);
  const title = String(sourceCategory.title ?? entry.title ?? '').trim() || `تصنيف ${index + 1}`;
  const normalizedItems = Array.isArray(sourceCategory.items)
    ? sourceCategory.items
        .map((item, itemIndex) => normalizeSourceItem(item, title, slug, itemIndex))
        .filter(Boolean)
    : [];

  if (!normalizedItems.length) continue;

  const category = {
    slug,
    title,
    itemCount: normalizedItems.length,
    preview: normalizedItems[0]?.text ?? 'لا يوجد نص تمهيدي لهذا التصنيف.',
    itemIds: normalizedItems.map((item) => item.id),
    itemsLoaded: true,
    items: normalizedItems,
  };

  summaries.push({
    slug,
    title,
    itemCount: category.itemCount,
    preview: category.preview,
    itemIds: category.itemIds,
    itemsLoaded: false,
    items: [],
  });

  const fileName = `${slug}.js`;
  await writeFile(path.join(categoriesDir, fileName), toModuleCode('AZKAR_CATEGORY', category), 'utf8');
  registryEntries.push(`  '${slug}': () => import('./categories/${fileName}'),`);
}

await writeFile(path.join(outputDir, 'summary.js'), toModuleCode('AZKAR_CATEGORY_SUMMARY', summaries), 'utf8');
await writeFile(
  path.join(outputDir, 'registry.js'),
  [
    "import { AZKAR_CATEGORY_SUMMARY } from './summary.js';",
    '',
    'export const AZKAR_CATEGORY_LOADERS = {',
    registryEntries.join('\n'),
    '};',
    '',
    'export { AZKAR_CATEGORY_SUMMARY };',
    '',
  ].join('\n'),
  'utf8',
);

console.log(`Generated ${summaries.length} azkar categories from source manifest.`);

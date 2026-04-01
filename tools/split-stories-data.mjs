import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const sourceManifestPath = path.join(rootDir, 'src/content/sources/stories/manifest.js');
const sourceCategoriesDir = path.join(rootDir, 'src/content/sources/stories/categories');
const outputDir = path.join(rootDir, 'src/content/stories/generated');
const itemsRootDir = path.join(outputDir, 'items');
const registryBatchesDir = path.join(outputDir, 'category-registries');
const summaryBatchesDir = path.join(outputDir, 'category-summaries');
const DEFAULT_SUMMARY_BATCH_SIZE = 32;

function toAsciiSlug(value, fallback) {
  const normalized = String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || fallback;
}

function makeSlug(title, index) {
  return `story-category-${String(index + 1).padStart(2, '0')}-${toAsciiSlug(title, 'untitled')}`;
}

function makeStoryFileName(id, index) {
  return `${toAsciiSlug(id, `story-${index + 1}`)}.js`;
}

function normalizeText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function buildStoryExcerpt(value) {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (normalized.length <= 160) return normalized;
  return `${normalized.slice(0, 157).trimEnd()}…`;
}

function normalizeLegacyStory(item, categoryTitle, categorySlug, index) {
  const title = normalizeText(item.title);
  const story = normalizeText(item.story);
  if (!title || !story) return null;

  const legacyIdSource = item.id ?? index + 1;
  const parsedLegacyId = Number(legacyIdSource);
  const uniqueId = `${categorySlug}::${legacyIdSource}`;

  return {
    id: uniqueId,
    legacyId: Number.isFinite(parsedLegacyId) ? parsedLegacyId : String(legacyIdSource),
    title,
    story,
    storyLoaded: true,
    lesson: normalizeText(item.lesson) || null,
    source: normalizeText(item.source) || null,
    categorySlug,
    categoryTitle,
    excerpt: buildStoryExcerpt(story),
  };
}

function buildStorySummaryItem(item) {
  return {
    id: item.id,
    legacyId: item.legacyId,
    title: item.title,
    story: '',
    storyLoaded: false,
    lesson: item.lesson,
    source: item.source,
    categorySlug: item.categorySlug,
    categoryTitle: item.categoryTitle,
    excerpt: item.excerpt,
  };
}

function toModuleCode(name, value) {
  return `export const ${name} = ${JSON.stringify(value, null, 2)};\nexport default ${name};\n`;
}

const sourceManifestModule = await import(pathToFileURL(sourceManifestPath).href);
const sourceManifest = sourceManifestModule.STORIES_SOURCE_MANIFEST ?? sourceManifestModule.default ?? [];

await rm(outputDir, { recursive: true, force: true });
await mkdir(itemsRootDir, { recursive: true });
await mkdir(registryBatchesDir, { recursive: true });
await mkdir(summaryBatchesDir, { recursive: true });

const storyManifest = [];

for (const [categoryIndex, manifestEntry] of sourceManifest.entries()) {
  const sourceFileName = manifestEntry.fileName || `${manifestEntry.slug || `category-${categoryIndex + 1}`}.js`;
  const sourceCategoryPath = path.join(sourceCategoriesDir, sourceFileName);
  const sourceCategoryModule = await import(pathToFileURL(sourceCategoryPath).href);
  const sourceCategory = sourceCategoryModule.STORY_SOURCE_CATEGORY ?? sourceCategoryModule.default ?? {};

  const title = normalizeText(sourceCategory.title ?? sourceCategory.name ?? manifestEntry.title) || `قصص ${categoryIndex + 1}`;
  const slug = toAsciiSlug(sourceCategory.slug ?? manifestEntry.slug, makeSlug(title, categoryIndex));
  const itemsDir = path.join(itemsRootDir, slug);
  await mkdir(itemsDir, { recursive: true });

  const items = (sourceCategory.stories ?? [])
    .map((item, itemIndex) => normalizeLegacyStory(item, title, slug, itemIndex))
    .filter(Boolean);

  if (!items.length) continue;

  const summaryBatchSize = Math.max(1, Number(manifestEntry.summaryBatchSize ?? sourceCategory.summaryBatchSize ?? DEFAULT_SUMMARY_BATCH_SIZE));
  const summaryBatchCount = Math.max(1, Math.ceil(items.length / summaryBatchSize));

  const storyItemFileNames = [];
  for (const [itemIndex, item] of items.entries()) {
    const fileName = makeStoryFileName(item.legacyId ?? itemIndex + 1, itemIndex);
    await writeFile(path.join(itemsDir, fileName), toModuleCode('STORY_ITEM', item), 'utf8');
    storyItemFileNames.push(fileName);
  }

  for (let batchIndex = 0; batchIndex < summaryBatchCount; batchIndex += 1) {
    const batchItems = items.slice(batchIndex * summaryBatchSize, (batchIndex + 1) * summaryBatchSize);
    const batchSummary = {
      slug,
      title,
      itemCount: items.length,
      preview: batchItems[0]?.excerpt ?? items[0]?.excerpt ?? 'لا يوجد ملخص متاح لهذه الفئة.',
      summaryBatchCount,
      summaryBatchSize,
      batchIndex,
      itemIds: batchItems.map((item) => item.id),
      items: batchItems.map(buildStorySummaryItem),
    };

    await writeFile(
      path.join(summaryBatchesDir, `${slug}--batch-${batchIndex}.js`),
      toModuleCode('STORY_CATEGORY_SUMMARY_BATCH', batchSummary),
      'utf8',
    );

    const itemLoaders = batchItems.map((item, itemIndex) => {
      const absoluteIndex = batchIndex * summaryBatchSize + itemIndex;
      const fileName = storyItemFileNames[absoluteIndex];
      return `  ${JSON.stringify(item.id)}: () => import('../items/${slug}/${fileName}'),`;
    });

    await writeFile(
      path.join(registryBatchesDir, `${slug}--batch-${batchIndex}.js`),
      ['export const STORY_ITEM_LOADERS = {', itemLoaders.join('\n'), '};', '', 'export default STORY_ITEM_LOADERS;', ''].join('\n'),
      'utf8',
    );
  }

  storyManifest.push({
    slug,
    title,
    itemCount: items.length,
    preview: items[0]?.excerpt ?? 'لا يوجد ملخص متاح لهذه الفئة.',
    itemLegacyIds: items.map((item) => item.legacyId ?? item.id),
    featuredTitle: items[0]?.title ?? 'لا توجد قصة متاحة حالياً.',
    featuredLesson: items[0]?.lesson ?? null,
    summaryBatchCount,
    summaryBatchSize,
  });
}

await writeFile(path.join(outputDir, 'manifest.js'), toModuleCode('STORY_CATEGORY_MANIFEST', storyManifest), 'utf8');

console.log(`Generated ${storyManifest.length} story categories with summary batches + story-level content.`);

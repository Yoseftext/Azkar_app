import './helpers/environment.ts';

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getSearchQuickLinks, searchAppContent } from '@/features/search/domain/search-center';
import { normalizeSearchTerm } from '@/shared/lib/search';

describe('search center domain', () => {
  it('returns grouped quran results for surah queries', async () => {
    const groups = await searchAppContent('الكهف');
    const quranGroup = groups.find((group) => group.sectionKey === 'quran');
    assert.ok(quranGroup);
    assert.match(quranGroup.items[0]?.title ?? '', /الكهف/);
    assert.match(quranGroup.items[0]?.route ?? '', /\/quran\?/);
  });

  it('returns names results with deep-link target', async () => {
    const groups = await searchAppContent('الرزاق');
    const namesGroup = groups.find((group) => group.sectionKey === 'names');
    assert.ok(namesGroup);
    assert.equal(normalizeSearchTerm(namesGroup.items[0]?.title ?? ''), 'الرزاق');
    assert.match(namesGroup.items[0]?.route ?? '', /name=/);
  });

  it('exposes stable quick links for empty search state', () => {
    const links = getSearchQuickLinks();
    assert.equal(links.length, 5);
    assert.match(links[0]?.title ?? '', /ابحث/);
  });
});

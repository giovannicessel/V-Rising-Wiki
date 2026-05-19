import type { WikiCatalog, WikiCategory, WikiEntry } from './wiki-types';
import catalogData from './wiki-catalog.json';

const catalog = catalogData as WikiCatalog;

export const wikiCatalogStats = catalog.stats;
export const wikiEntries: WikiEntry[] = catalog.entries;

export function getWikiByCategory(category: WikiCategory): WikiEntry[] {
  return wikiEntries.filter((e) => e.category === category);
}

export function getWikiForSection(
  section: 'lore' | 'spells' | 'weapons' | 'items' | 'bosses'
): WikiEntry[] {
  switch (section) {
    case 'spells':
      return getWikiByCategory('spell');
    case 'weapons':
      return getWikiByCategory('weapon');
    case 'items':
      return getWikiByCategory('item');
    case 'bosses':
      return [...getWikiByCategory('boss'), ...getWikiByCategory('jewel')];
    case 'lore':
      return wikiEntries
        .filter((e) => e.id === 'v-rising' || e.category === 'boss')
        .slice(0, 8);
    default:
      return [];
  }
}

export function searchWikiEntries(
  query: string,
  options?: { category?: WikiCategory; limit?: number }
): WikiEntry[] {
  const q = query.trim().toLowerCase();
  const limit = options?.limit ?? 48;
  let list = wikiEntries;
  if (options?.category) {
    list = list.filter((e) => e.category === options.category);
  }
  if (!q) return list.slice(0, limit);
  return list
    .filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.nameEn?.toLowerCase().includes(q) ||
        e.gameAssetName?.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q)
    )
    .slice(0, limit);
}

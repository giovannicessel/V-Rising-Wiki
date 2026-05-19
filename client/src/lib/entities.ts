import type { EntitiesFile, EntityType, WikiEntity } from '@/data/entity-types';
import { translateSchool } from '@/data/entity-translations';
import {
  entityDetailPath as pathDetail,
  entityListPath as pathList,
} from '@/lib/entity-paths';
import entitiesData from '@/data/entities.json';

const data = entitiesData as unknown as EntitiesFile;

export const entitiesStats = data.stats;
export const allEntities: WikiEntity[] = data.entities ?? [];

export { entityListPath, entityDetailPath } from '@/lib/entity-paths';

export function getEntitiesByType(type: EntityType): WikiEntity[] {
  return allEntities
    .filter((e) => e.type === type)
    .sort((a, b) => {
      if (a.level != null && b.level != null) return a.level - b.level;
      return a.name.localeCompare(b.name, 'pt');
    });
}

export function getEntityBySlug(type: EntityType, slug: string): WikiEntity | undefined {
  const normalized = decodeURIComponent(slug).replace(/ /g, '_');
  return allEntities.find(
    (e) =>
      e.type === type &&
      (e.slug === normalized || e.id === slug || e.slug === slug)
  );
}

export function searchEntities(
  type: EntityType | 'all',
  query: string,
  limit = 60
): WikiEntity[] {
  const q = query.trim().toLowerCase();
  let list = type === 'all' ? allEntities : allEntities.filter((e) => e.type === type);
  if (!q) return list.slice(0, limit);
  return list
    .filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.nameEn?.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.school?.toLowerCase().includes(q) ||
        translateSchool(e.school)?.toLowerCase().includes(q) ||
        e.location?.toLowerCase().includes(q) ||
        e.region?.toLowerCase().includes(q) ||
        e.weaponType?.toLowerCase().includes(q)
    )
    .slice(0, limit);
}

export interface EntityFilters {
  school?: string;
  region?: string;
  act?: number;
  minLevel?: number;
  maxLevel?: number;
  weaponType?: string;
}

export function filterEntities(
  type: EntityType | 'all',
  filters: EntityFilters
): WikiEntity[] {
  let list = type === 'all' ? allEntities : allEntities.filter((e) => e.type === type);

  if (filters.school) {
    const s = filters.school.toLowerCase();
    list = list.filter(
      (e) =>
        e.school?.toLowerCase() === s ||
        translateSchool(e.school)?.toLowerCase() === s
    );
  }
  if (filters.region) {
    list = list.filter((e) => e.region === filters.region);
  }
  if (filters.act != null) {
    list = list.filter((e) => e.act === filters.act);
  }
  if (filters.minLevel != null) {
    list = list.filter((e) => e.level == null || e.level >= filters.minLevel!);
  }
  if (filters.maxLevel != null) {
    list = list.filter((e) => e.level == null || e.level <= filters.maxLevel!);
  }
  if (filters.weaponType) {
    list = list.filter(
      (e) => e.weaponType?.toLowerCase() === filters.weaponType?.toLowerCase()
    );
  }
  return list;
}

export function getFilterOptions(type: EntityType | 'all') {
  const list = type === 'all' ? allEntities : allEntities.filter((e) => e.type === type);
  const schools = new Set<string>();
  const regions = new Set<string>();
  const weaponTypes = new Set<string>();
  const acts = new Set<number>();

  for (const e of list) {
    if (e.school) schools.add(e.school);
    if (e.region) regions.add(e.region);
    if (e.act != null) acts.add(e.act);
    if (e.weaponType) weaponTypes.add(e.weaponType);
  }

  return {
    schools: Array.from(schools).sort(),
    regions: Array.from(regions).sort(),
    weaponTypes: Array.from(weaponTypes).sort(),
    acts: Array.from(acts).sort((a, b) => a - b),
  };
}

export function globalSearch(query: string, limit = 40): WikiEntity[] {
  return searchEntities('all', query, limit);
}

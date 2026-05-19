import type { EntityType } from '@/data/entity-types';

const LIST_PATHS: Record<EntityType, string> = {
  boss: '/v-bloods',
  spell: '/spells',
  item: '/items',
  jewel: '/jewels',
  weapon: '/weapons',
  building: '/buildings',
};

export function entityListPath(type: EntityType): string {
  return LIST_PATHS[type];
}

export function entityDetailPath(type: EntityType, slug: string): string {
  return `${LIST_PATHS[type]}/${encodeURIComponent(slug)}`;
}

export function entityDetailRoute(type: EntityType): string {
  return `${LIST_PATHS[type]}/:slug`;
}

export const ALL_ENTITY_TYPES: EntityType[] = [
  'boss',
  'spell',
  'weapon',
  'item',
  'jewel',
  'building',
];

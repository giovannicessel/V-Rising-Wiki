import type { WikiEntity } from '@/data/entity-types';

/** Armas lendárias / artefatos com nome próprio (não tiers Copper/Iron/Sanguine). */
const LEGENDARY_IDS = new Set([
  'apocalypse',
  'cloud-dancers',
  'hand-of-winter',
  'lumberjack-s-axes',
  'miner-s-mace',
  'mortira-s-lament',
  'oaksong',
  'talons-of-the-lich-beast',
  'the-endbringers',
  'the-fate-dancers',
  'the-general-s-soul-reaper',
  'the-gravecaller',
  'the-morning-star',
  'the-red-twins',
  'the-siren-s-wail',
  'the-thousand-storms',
  'the-wraithblades',
  'wings-of-the-fallen',
]);

const TIER_PREFIX =
  /^(copper|iron|dark-silver|sanguine|ancestral|bone|reinforced|merciless)-/i;

export function isLegendaryWeapon(entity: WikiEntity): boolean {
  if (entity.type !== 'weapon') return false;
  if (entity.id.startsWith('stunlock_')) return false;
  if (TIER_PREFIX.test(entity.id)) return false;
  if (LEGENDARY_IDS.has(entity.id)) return true;
  if (/^the-/.test(entity.id) && entity.fandomUrl) return true;
  return false;
}

export function getLegendaryWeapons(entities: WikiEntity[]): WikiEntity[] {
  return entities
    .filter(isLegendaryWeapon)
    .sort((a, b) => a.name.localeCompare(b.name, 'pt'));
}

import weaponsGuide from '@/data/weapons-guide.json';
import type { WikiEntity } from '@/data/entity-types';

function legendaryNameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/'/g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export type WeaponAbilityGuide = {
  name: string;
  description: string;
  unlock?: string;
};

export type WeaponTypeGuide = {
  id: string;
  typeEn: string;
  namePt: string;
  emoji: string;
  blurb: string;
  abilities: WeaponAbilityGuide[];
};

const guide = weaponsGuide as {
  intro: string;
  weaponTypes: WeaponTypeGuide[];
  uniqueWeapons: {
    name: string;
    nameEn: string;
    gearLevel: number;
    bonus: string;
    source: string;
  }[];
  ancestral: {
    intro: string;
    forge: { unlock: string; materials: string; bonuses: string[] };
    rarities: { tier: string; craft: string; shards: string }[];
    infusions: { school: string; schoolPt: string; effect: string }[];
    infusionNote: string;
  };
  legendaryArtifacts: { intro: string; note: string };
  riftCrafting?: {
    title: string;
    summary: string;
    prerequisite: string;
    flow: string[];
    tiers: {
      name: string;
      level: string;
      currency: string;
      merchant: string;
      buys: string;
      craftResult: string;
    }[];
    legendaryChance: string;
    ancestralEpicCraft: { rare: string; epic: string; legendaryRoll: string };
    fandomUrl: string;
  };
  removedWeapons: { name: string; gearLevel: number; bonus: string; note: string }[];
};

const byTypeEn = new Map(guide.weaponTypes.map((w) => [w.typeEn, w]));

export function getWeaponTypeGuide(weaponType?: string): WeaponTypeGuide | undefined {
  if (!weaponType) return undefined;
  return (
    byTypeEn.get(weaponType) ??
    byTypeEn.get(weaponType.replace(/s$/, '')) ??
    byTypeEn.get(`${weaponType}s`)
  );
}

export function getUniqueWeaponGuide(entity: WikiEntity) {
  const slug = entity.slug;
  const nameLower = entity.name.toLowerCase();
  return guide.uniqueWeapons.find(
    (u) =>
      legendaryNameToSlug(u.nameEn) === slug ||
      nameLower.includes(u.name.toLowerCase()) ||
      nameLower.includes(u.nameEn.toLowerCase())
  );
}

export function getRemovedWeaponGuide(entity: WikiEntity) {
  return guide.removedWeapons.find(
    (w) =>
      legendaryNameToSlug(w.name) === entity.slug ||
      entity.name.toLowerCase().includes(w.name.toLowerCase())
  );
}

export function isAncestralTierWeapon(entity: WikiEntity): boolean {
  if (entity.type !== 'weapon') return false;
  return /ancestral|merciless|sanguine/i.test(entity.id) || /ancestral|impiedosa|sanguínea/i.test(entity.name);
}

export function getAncestralGuide() {
  return guide.ancestral;
}

export function getLegendaryObtainNote() {
  return guide.legendaryArtifacts.intro;
}

export function getRiftCraftingGuide() {
  return guide.riftCrafting;
}

export function getWeaponsListIntro() {
  return guide.intro;
}

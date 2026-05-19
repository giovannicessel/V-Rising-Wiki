import loreData from '@/data/lore-vardoran.json';
import type { WikiEntity } from '@/data/entity-types';

export interface LoreBossSnippet {
  name: string;
  lore: string;
  regionTitle: string;
}

export interface LoreRegion {
  id: string;
  title: string;
  body: string;
  bosses: { name: string; lore: string }[];
}

export interface LoreFile {
  title: string;
  intro: string;
  sections: {
    id: string;
    title: string;
    body?: string;
    timeline?: { era: string; event: string; description: string }[];
    regions?: LoreRegion[];
    factions?: { faction: string; leader: string; objective: string }[];
  }[];
}

export const lore = loreData as LoreFile;

function normalizeName(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

export function matchBossEntity(
  bosses: WikiEntity[],
  loreBossName: string
): WikiEntity | undefined {
  const n = normalizeName(loreBossName.split(',')[0]);
  return bosses.find((e) => {
    const en = normalizeName(e.nameEn || e.name);
    return en.includes(n) || n.includes(en.slice(0, 15));
  });
}

/** Lore regional do documento PT para um chefe (por nome aproximado). */
export function findBossWorldLore(entity: WikiEntity): LoreBossSnippet | undefined {
  const target = normalizeName(entity.nameEn || entity.name);
  const geo = lore.sections.find((s) => s.regions?.length);
  if (!geo?.regions) return undefined;

  for (const region of geo.regions) {
    for (const boss of region.bosses) {
      const bn = normalizeName(boss.name);
      if (bn.includes(target) || target.includes(bn.split(',')[0])) {
        return { name: boss.name, lore: boss.lore, regionTitle: region.title };
      }
    }
  }
  return undefined;
}

export function getLoreRegions(): LoreRegion[] {
  const geo = lore.sections.find((s) => s.regions?.length);
  return geo?.regions ?? [];
}

export function getTimeline() {
  const sec = lore.sections.find((s) => s.timeline?.length);
  return sec?.timeline ?? [];
}

export function getFactions() {
  const sec = lore.sections.find((s) => s.factions?.length);
  return sec?.factions ?? [];
}

export function cleanIntro(intro: string) {
  return intro
    .replace(/^#\s+.+\n?/m, '')
    .replace(/\*\*/g, '')
    .trim();
}

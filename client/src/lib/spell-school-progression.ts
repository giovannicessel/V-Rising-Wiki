import progressionData from '@/data/spell-school-progression.json';
import type { BossUnlockEntry } from '@/data/entity-types';
import { translateSchool } from '@/data/entity-translations';
import { getEntitiesByType } from '@/lib/entities';
import { ENTITY_NAME_PT } from '@/data/entity-translations';

export type SpellProgressionCategory = 'tier1' | 'tier2' | 'ultimate' | 'dash';

export interface SpellPlacement {
  school: string;
  category: SpellProgressionCategory;
  tier?: 1 | 2 | 3;
}

const schools = progressionData.schools as Record<
  string,
  {
    tier1: string[];
    tier2: string[];
    dash: string[];
    ultimate: string[];
  }
>;

function norm(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

const ALIASES: Record<string, string> = {
  shadowbolt: 'shadow bolt',
  'unholy chains': 'chains of death',
};

function namesMatch(a: string, b: string) {
  const na = norm(a);
  const nb = norm(b);
  if (na === nb) return true;
  if (ALIASES[na] && norm(ALIASES[na]) === nb) return true;
  if (ALIASES[nb] && norm(ALIASES[nb]) === na) return true;
  return false;
}

export function findSpellPlacement(spellNameEn: string): SpellPlacement | null {
  for (const [school, tiers] of Object.entries(schools)) {
    if (tiers.tier1.some((n) => namesMatch(n, spellNameEn))) {
      return { school, category: 'tier1', tier: 1 };
    }
    if (tiers.tier2.some((n) => namesMatch(n, spellNameEn))) {
      return { school, category: 'tier2', tier: 2 };
    }
    if (tiers.ultimate.some((n) => namesMatch(n, spellNameEn))) {
      return { school, category: 'ultimate', tier: 3 };
    }
    if (tiers.dash.some((n) => namesMatch(n, spellNameEn))) {
      return { school, category: 'dash' };
    }
  }
  return null;
}

export function getTierSpellNames(
  school: string,
  category: SpellProgressionCategory
): string[] {
  const s = schools[school];
  if (!s) return [];
  if (category === 'tier1') return s.tier1;
  if (category === 'tier2') return s.tier2;
  if (category === 'ultimate') return s.ultimate;
  if (category === 'dash') return s.dash;
  return [];
}

export function spellPointLabelPt(school: string, tier: 1 | 2 | 3, ultimate?: boolean) {
  const schoolPt = translateSchool(school) ?? school;
  if (ultimate || tier === 3) {
    return `Ponto de ${schoolPt} (Tier 3 — Ultimate)`;
  }
  return `Ponto de ${schoolPt} (Tier ${tier})`;
}

export function tierCategoryLabelPt(category: SpellProgressionCategory) {
  switch (category) {
    case 'tier1':
      return 'Tier 1 — escolha 1 entre 3 feitiços básicos';
    case 'tier2':
      return 'Tier 2 — escolha 1 entre 3 feitiços intermediários';
    case 'ultimate':
      return 'Tier 3 — escolha 1 entre 2 Ultimates';
    case 'dash':
      return 'Dash (Veil) — desbloqueio direto do chefe';
  }
}

export function spellToUnlockEntry(spellNameEn: string): BossUnlockEntry {
  const spells = getEntitiesByType('spell');
  const hit = spells.find(
    (s) =>
      namesMatch(s.nameEn ?? s.name, spellNameEn) ||
      namesMatch(s.name, spellNameEn)
  );
  if (!hit) {
    return {
      name: ENTITY_NAME_PT[spellNameEn] ?? spellNameEn,
      nameEn: spellNameEn,
    };
  }
  return {
    name: hit.name,
    nameEn: hit.nameEn ?? spellNameEn,
    entityId: hit.id,
    entityType: 'spell',
    slug: hit.slug,
    image: hit.image,
    school: hit.school,
  };
}

export function resolveTierChoices(
  school: string,
  category: SpellProgressionCategory
): BossUnlockEntry[] {
  return getTierSpellNames(school, category).map(spellToUnlockEntry);
}

export function getDashBossForSpell(spellNameEn: string) {
  const placement = findSpellPlacement(spellNameEn);
  if (placement?.category !== 'dash') return null;
  const bosses = getEntitiesByType('boss');
  const hit = bosses.find((b) => {
    const dash = b.meta?.rewards?.dashUnlock;
    return dash && namesMatch(dash.nameEn ?? dash.name, spellNameEn);
  });
  if (!hit) return null;
  return { bossId: hit.id, bossName: hit.name, bossSlug: hit.slug };
}

/** Bosses que concedem ponto de feitiço compatível com este feitiço (mesma escola + tier). */
export function getSpellPointBossesForPlacement(placement: SpellPlacement) {
  if (placement.category === 'dash') return [];
  const bosses = getEntitiesByType('boss');
  return bosses
    .filter((b) => {
      const pt = b.meta?.rewards?.spellPoint;
      if (!pt) return false;
      if (pt.school !== placement.school) return false;
      if (placement.category === 'ultimate') return pt.tier === 3 || pt.ultimate;
      if (placement.category === 'tier1') return pt.tier === 1;
      if (placement.category === 'tier2') return pt.tier === 2;
      return false;
    })
    .map((b) => ({
      bossId: b.id,
      bossName: b.name,
      bossSlug: b.slug,
      labelPt: b.meta!.rewards!.spellPoint!.labelPt,
    }));
}

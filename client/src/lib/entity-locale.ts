import type {
  BossSpellPointMeta,
  BossUnlockEntry,
  EntitySection,
  EntityType,
  WikiEntity,
} from '@/data/entity-types';
import { ENTITY_TYPE_PLURAL } from '@/data/entity-types';
import {
  REGION_PT,
  SCHOOL_PT,
  WEAPON_TYPE_PT,
  translateSectionTitle,
} from '@/data/entity-translations';
import type { Locale } from '@/i18n';
import {
  tierCategoryLabelPt,
  type SpellProgressionCategory,
} from '@/lib/spell-school-progression';

export function entityDisplayName(entity: WikiEntity, locale: Locale): string {
  if (locale === 'en') return entity.nameEn?.trim() || entity.name;
  return entity.name;
}

export function unlockEntryName(entry: BossUnlockEntry, locale: Locale): string {
  if (locale === 'en') return entry.nameEn?.trim() || entry.name;
  return entry.name;
}

export function regionLabel(region: string | undefined, locale: Locale): string | undefined {
  if (!region) return undefined;
  if (locale === 'en') return region;
  return REGION_PT[region] ?? region;
}

export function schoolLabel(school: string | undefined, locale: Locale): string | undefined {
  if (!school) return undefined;
  if (locale === 'en') return school;
  return SCHOOL_PT[school] ?? school;
}

export function weaponTypeLabel(
  weaponType: string | undefined,
  locale: Locale
): string | undefined {
  if (!weaponType) return undefined;
  if (locale === 'en') return weaponType;
  return WEAPON_TYPE_PT[weaponType] ?? weaponType;
}

export function sectionDisplayTitle(section: EntitySection, locale: Locale): string {
  if (locale === 'en') return section.title;
  return section.titlePt ?? translateSectionTitle(section.title);
}

export function spellPointLabel(
  spellPoint: BossSpellPointMeta,
  locale: Locale
): string {
  if (locale === 'pt') return spellPoint.labelPt;
  const school = spellPoint.school;
  if (spellPoint.ultimate || spellPoint.tier === 3) {
    return `${school} Spell Point (Tier 3 — Ultimate)`;
  }
  return `${school} Spell Point (Tier ${spellPoint.tier})`;
}

/** Textos longos da Fandom: em PT mostramos aviso se o corpo estiver em inglês. */
export function shouldShowFandomNotice(locale: Locale, text?: string): boolean {
  if (locale !== 'pt' || !text || text.length < 80) return false;
  const sample = text.slice(0, 400).toLowerCase();
  const englishHints =
    /\b(the|and|with|this|that|when|blood|attack|damage|player)\b/g;
  const matches = sample.match(englishHints);
  return (matches?.length ?? 0) >= 4;
}

const ENTITY_TYPE_PLURAL_EN: Record<EntityType, string> = {
  boss: 'V Bloods',
  spell: 'Spells',
  item: 'Items',
  jewel: 'Jewels',
  weapon: 'Weapons',
  building: 'Buildings',
};

export function entityTypePlural(type: EntityType, locale: Locale): string {
  return locale === 'en' ? ENTITY_TYPE_PLURAL_EN[type] : ENTITY_TYPE_PLURAL[type];
}

export function tierCategoryLabel(
  category: SpellProgressionCategory,
  locale: Locale
): string {
  if (locale === 'en') {
    switch (category) {
      case 'tier1':
        return 'Tier 1 — choose 1 of 3 basic spells';
      case 'tier2':
        return 'Tier 2 — choose 1 of 3 intermediate spells';
      case 'ultimate':
        return 'Tier 3 — choose 1 of 2 Ultimates';
      case 'dash':
        return 'Dash (Veil) — direct boss unlock';
    }
  }
  return tierCategoryLabelPt(category);
}

export function entityTypeLabel(type: WikiEntity['type'], locale: Locale): string {
  const labels: Record<WikiEntity['type'], Record<Locale, string>> = {
    boss: { pt: 'V Blood', en: 'V Blood' },
    spell: { pt: 'Feitiço', en: 'Spell' },
    weapon: { pt: 'Arma', en: 'Weapon' },
    item: { pt: 'Item', en: 'Item' },
    jewel: { pt: 'Joia', en: 'Jewel' },
    building: { pt: 'Estrutura', en: 'Building' },
  };
  return labels[type][locale];
}

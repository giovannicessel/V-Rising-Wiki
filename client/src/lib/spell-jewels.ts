import spellJewelData from '@/data/spell-jewel-modifiers.json';
import type { WikiEntity } from '@/data/entity-types';

export { jewelTierImage, jewelTierImages } from '@/lib/jewel-images';

export interface SpellJewelEntry {
  spellNameEn: string;
  school: string;
  modifiers: string[];
  modifiersPt?: string[];
}

const SPELL_JEWELS = spellJewelData.spells as SpellJewelEntry[];

function norm(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

const NAME_CANON: Record<string, string> = {
  shadowbolt: 'shadowbolt',
  chainsofdeath: 'unholychains',
  unholychains: 'unholychains',
};

function namesMatch(a: string, b: string) {
  const na = NAME_CANON[norm(a)] ?? norm(a);
  const nb = NAME_CANON[norm(b)] ?? norm(b);
  return na === nb;
}

export function getSpellJewelModifiers(entity: WikiEntity): SpellJewelEntry | undefined {
  if (entity.type !== 'spell') return undefined;
  const nameEn = entity.nameEn || entity.name;
  return SPELL_JEWELS.find((s) => namesMatch(s.spellNameEn, nameEn));
}

export function formatJewelModifier(text: string): string {
  return text
    .replace(/\{\{Debuff\|([^}]+)\}\}/gi, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function jewelModifiersForLocale(
  entry: SpellJewelEntry,
  locale: 'pt' | 'en'
): string[] {
  if (locale === 'pt' && entry.modifiersPt?.length) return entry.modifiersPt;
  return entry.modifiers;
}

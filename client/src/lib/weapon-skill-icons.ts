import { allEntities } from '@/lib/entities';

const TYPE_PREFIX: Record<string, string> = {
  Axes: 'axe',
  Sword: 'sword',
  Mace: 'mace',
  Spear: 'spear',
  Reaper: 'scythe',
  Slashers: 'slashers',
  Whip: 'whip',
  Greatsword: 'greatsword',
  Crossbow: 'crossbow',
  Longbow: 'bow',
  Pistols: 'pistols',
  Daggers: 'daggers',
  Claws: 'claws',
};

/** Nome da skill (Fandom ou PT entre parênteses) → fragmento do id Stunlock */
const SKILL_ID_PART: Record<string, string> = {
  Primary: 'primary',
  Frenzy: 'frenzy',
  'X-Strike': 'axethrow',
  Whirlwind: 'whirlwind',
  Shockwave: 'shockwave',
  'Crushing Blow': 'crushingblow',
  Smack: 'smack',
  'A Thousand Spears': 'athousandspears',
  'A Thousand<br>Spears': 'athousandspears',
  Harpoon: 'harpoon',
  'Howling Reaper': 'howlingreaper',
  'Tendon Swing': 'tendonswing',
  'Elusive Strike': 'elusivestrike',
  Camouflage: 'camoflauge',
  'Aerial Whip Twirl': 'aerialwhiptwirl',
  'Entangling Whip': 'entanglingwhip',
  'Great Cleaver': 'greatcleaver',
  'Death From Above': 'deathfromabove',
  'Rain of Bolts': 'rainofbolts',
  Snapshot: 'snapshot',
  Multishot: 'multishot',
  'Guided Arrow': 'guidedarrow',
  'Fan the Hammer': 'fanthehammer',
  'Explosive Bullet': 'explosivebullet',
  'Throw Dagger': 'primary',
  'Rain of Daggers': 'rainofdaggers',
  'Release Daggers': 'calldaggers',
  Lunge: 'vaultslash',
  'Skewering Leap': 'skeweringleap',
};

const abilityEntities = allEntities.filter((e) =>
  e.id.startsWith('stunlock_icon_ability_weapon_')
);

/** Extrai nome EN da skill a partir do título (ex.: "Redemoinho (Whirlwind) · Q"). */
export function normalizeSkillNameForIcon(skillName: string): string {
  const fromParen = skillName.match(/\(([^)]+)\)/)?.[1]?.trim();
  if (fromParen) return fromParen;
  if (/prim[aá]rio/i.test(skillName)) return 'Primary';
  const beforeSlot = skillName.split('·')[0].trim();
  return beforeSlot;
}

export function resolveWeaponSkillIcon(
  weaponType: string,
  skillName: string
): string | undefined {
  const prefix = TYPE_PREFIX[weaponType];
  const canonical = normalizeSkillNameForIcon(skillName);
  const part = SKILL_ID_PART[canonical];
  if (!prefix || !part) return undefined;

  const needles = [
    `weapon_${prefix}_${part}`,
    part === 'primary' ? `weapon_${prefix}_primaryattack` : null,
    part === 'primary' ? `weapon_${prefix}_primary_meleeattack` : null,
    part === 'primary' && prefix === 'spear' ? 'weapon_spear_impale' : null,
  ].filter(Boolean) as string[];

  for (const needle of needles) {
    const hit = abilityEntities.find((e) => e.id.includes(needle) && e.image);
    if (hit) return hit.image;
  }

  return undefined;
}

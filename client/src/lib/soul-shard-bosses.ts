/**
 * V Bloods que dropam Soul Shard — borda e acento alinhados à escola de magia da joia.
 */
import { SCHOOL_THEME } from '@/lib/school-theme';

export interface SoulShardBossTheme {
  bossId: string;
  jewelId: string;
  jewelSlug: string;
  jewelNamePt: string;
  schoolLabel: string;
  borderClass: string;
  accent: string;
  accentRgb: string;
}

type SchoolKey = keyof typeof SCHOOL_THEME;

const BORDER: Record<SchoolKey, string> = {
  Blood: 'border-red-500/80',
  Chaos: 'border-purple-500/80',
  Frost: 'border-sky-400/70',
  Storm: 'border-amber-500/80',
  Unholy: 'border-lime-500/80',
  Illusion: 'border-teal-400/75',
  Shadow: 'border-indigo-500/75',
};

const RGB: Record<SchoolKey, string> = {
  Blood: '239, 68, 68',
  Chaos: '168, 85, 247',
  Frost: '56, 189, 248',
  Storm: '251, 191, 36',
  Unholy: '132, 204, 22',
  Illusion: '45, 212, 191',
  Shadow: '129, 140, 248',
};

function shard(
  bossId: string,
  jewelId: string,
  jewelSlug: string,
  jewelNamePt: string,
  school: SchoolKey
): SoulShardBossTheme {
  const s = SCHOOL_THEME[school];
  return {
    bossId,
    jewelId,
    jewelSlug,
    jewelNamePt,
    schoolLabel: s.label,
    borderClass: BORDER[school],
    accent: s.accent,
    accentRgb: RGB[school],
  };
}

const SOUL_SHARD_BOSSES: Record<string, SoulShardBossTheme> = {
  'dracula-the-immortal-king': shard(
    'dracula-the-immortal-king',
    'soul-shard-of-dracula',
    'Soul_Shard_of_Dracula',
    'Fragmento de Alma de Drácula',
    'Blood'
  ),
  'solarus-the-immaculate': shard(
    'solarus-the-immaculate',
    'soul-shard-of-solarus',
    'Soul_Shard_of_Solarus',
    'Fragmento de Alma de Solarus',
    'Unholy'
  ),
  'adam-the-firstborn': shard(
    'adam-the-firstborn',
    'soul-shard-of-the-monster',
    'Soul_Shard_of_the_Monster',
    'Fragmento de Alma do Monstro',
    'Storm'
  ),
  'talzur-the-winged-horror': shard(
    'talzur-the-winged-horror',
    'soul-shard-of-the-winged-horror',
    'Soul_Shard_of_the_Winged_Horror',
    'Fragmento de Alma do Horror Alado',
    'Chaos'
  ),
  'megara-the-serpent-queen': shard(
    'megara-the-serpent-queen',
    'soul-shard-of-the-serpent',
    'Soul_Shard_of_the_Serpent',
    'Fragmento de Alma da Serpente',
    'Illusion'
  ),
};

export function getSoulShardBossTheme(bossId: string): SoulShardBossTheme | null {
  return SOUL_SHARD_BOSSES[bossId] ?? null;
}

export function isSoulShardBoss(bossId: string): boolean {
  return bossId in SOUL_SHARD_BOSSES;
}

export const SOUL_SHARD_BOSS_IDS = Object.keys(SOUL_SHARD_BOSSES);

/** Temas visuais por escola de magia (bordas e acentos). */
export const SCHOOL_THEME: Record<
  string,
  { border: string; bg: string; accent: string; label: string }
> = {
  Blood: {
    border: 'border-red-700/70',
    bg: 'bg-red-950/20',
    accent: '#c41e3a',
    label: 'Sangue',
  },
  Chaos: {
    border: 'border-purple-600/70',
    bg: 'bg-purple-950/25',
    accent: '#a855f7',
    label: 'Caos',
  },
  Frost: {
    border: 'border-sky-400/60',
    bg: 'bg-sky-950/20',
    accent: '#38bdf8',
    label: 'Gelo',
  },
  Storm: {
    border: 'border-amber-500/60',
    bg: 'bg-amber-950/15',
    accent: '#fbbf24',
    label: 'Tempestade',
  },
  Unholy: {
    border: 'border-lime-700/60',
    bg: 'bg-lime-950/15',
    accent: '#84cc16',
    label: 'Profano',
  },
  Illusion: {
    border: 'border-teal-400/70',
    bg: 'bg-teal-950/25',
    accent: '#2dd4bf',
    label: 'Ilusão',
  },
  Shadow: {
    border: 'border-indigo-500/60',
    bg: 'bg-indigo-950/25',
    accent: '#818cf8',
    label: 'Sombra',
  },
};

export const SCHOOL_ORDER = [
  'Blood',
  'Chaos',
  'Frost',
  'Storm',
  'Unholy',
  'Illusion',
  'Shadow',
] as const;

export function getSchoolTheme(school?: string) {
  if (!school) return null;
  return SCHOOL_THEME[school] ?? null;
}

import type { Locale } from '@/i18n';

/** Prefer *_Pt quando locale é pt-BR. */
export function pickLocaleText(
  locale: Locale,
  en?: string | null,
  pt?: string | null
): string {
  const e = (en ?? '').trim();
  const p = (pt ?? '').trim();
  if (locale === 'pt' && p) return p;
  return e || p;
}

export function pickLocaleList(
  locale: Locale,
  en: string[] | undefined,
  pt: string[] | undefined
): string[] {
  if (locale === 'pt' && pt?.length) return pt;
  return en ?? pt ?? [];
}

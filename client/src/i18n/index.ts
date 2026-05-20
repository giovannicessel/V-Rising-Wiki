import { en } from '@/i18n/messages/en';
import { pt } from '@/i18n/messages/pt';

export type Locale = 'pt' | 'en';

export type MessageKey = keyof typeof pt;

const catalogs = { pt, en } as const;

export function translate(
  locale: Locale,
  key: MessageKey,
  vars?: Record<string, string | number>
): string {
  let text: string = catalogs[locale][key] ?? catalogs.pt[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      text = text.replaceAll(`{${k}}`, String(v));
    }
  }
  return text;
}

export { pt, en };

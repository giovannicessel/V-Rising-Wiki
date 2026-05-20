import { useLocale } from '@/contexts/LocaleContext';
import type { Locale } from '@/i18n';

export default function LanguageToggle() {
  const { locale, setLocale, t } = useLocale();

  const btn = (code: Locale, label: string) => (
    <button
      key={code}
      type="button"
      onClick={() => setLocale(code)}
      className={`px-2.5 py-1 text-[11px] font-semibold tracking-wide rounded transition-colors ${
        locale === code
          ? 'bg-[#c41e3a] text-white'
          : 'text-[#888] hover:text-white hover:bg-white/5'
      }`}
      aria-pressed={locale === code}
      aria-label={`${t('lang.switch')}: ${label}`}
    >
      {label}
    </button>
  );

  return (
    <div
      className="flex items-center rounded-md border border-[#333] bg-[#111] p-0.5"
      role="group"
      aria-label={t('lang.switch')}
    >
      {btn('pt', t('lang.pt'))}
      {btn('en', t('lang.en'))}
    </div>
  );
}

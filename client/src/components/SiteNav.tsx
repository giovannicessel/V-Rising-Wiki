import { Link, useLocation } from 'wouter';
import { BookOpen, Crown, Home, Menu, Search, Wand2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import LanguageToggle from '@/components/LanguageToggle';
import { useTranslation } from '@/contexts/LocaleContext';
import type { MessageKey } from '@/i18n';

export default function SiteNav() {
  const [location] = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const { t } = useTranslation();

  const primary = useMemo(
    () =>
      [
        { href: '/', labelKey: 'nav.home' as MessageKey, icon: Home },
        { href: '/v-bloods', labelKey: 'nav.vbloods' as MessageKey, icon: Crown },
        { href: '/spells', labelKey: 'nav.spells' as MessageKey, icon: Wand2 },
        { href: '/search', labelKey: 'nav.search' as MessageKey, icon: Search },
      ] as const,
    []
  );

  const more = useMemo(
    () =>
      [
        { href: '/map', labelKey: 'nav.map' as MessageKey },
        { href: '/lore', labelKey: 'nav.lore' as MessageKey },
        { href: '/weapons', labelKey: 'nav.weapons' as MessageKey },
        { href: '/weapons/legendary', labelKey: 'nav.legendary' as MessageKey },
        { href: '/items', labelKey: 'nav.items' as MessageKey },
        { href: '/jewels', labelKey: 'nav.jewels' as MessageKey },
        { href: '/builds', labelKey: 'nav.builds' as MessageKey },
      ] as const,
    []
  );

  return (
    <nav className="sticky top-0 z-40 border-b border-[#2a2a2a]/80 bg-[#0a0a0a]/95 backdrop-blur-md">
      <div className="container flex items-center justify-between h-14 gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-[#c41e3a] hover:text-white transition-colors shrink-0"
        >
          <BookOpen size={20} />
          <span className="font-gothic font-bold tracking-wider text-sm hidden sm:inline">
            {t('home.heroTitle')}
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {primary.map(({ href, labelKey, icon: Icon }) => {
            const active =
              location === href ||
              (href !== '/' && location.startsWith(`${href}/`));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  active
                    ? 'bg-[#c41e3a]/15 text-[#e85a6f]'
                    : 'text-[#999] hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={15} />
                <span className="hidden md:inline">{t(labelKey)}</span>
              </Link>
            );
          })}

          <div className="relative">
            <button
              type="button"
              onClick={() => setMoreOpen((o) => !o)}
              className={`flex items-center gap-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                more.some((m) => location.startsWith(m.href))
                  ? 'bg-[#c41e3a]/15 text-[#e85a6f]'
                  : 'text-[#999] hover:text-white hover:bg-white/5'
              }`}
            >
              <Menu size={15} />
              <span className="hidden md:inline">{t('nav.more')}</span>
            </button>
            {moreOpen && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-40"
                  aria-label={t('nav.closeMenu')}
                  onClick={() => setMoreOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-50 min-w-[140px] py-1 rounded-lg border border-[#333] bg-[#111] shadow-xl">
                  {more.map(({ href, labelKey }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMoreOpen(false)}
                      className="block px-4 py-2 text-sm text-[#bbb] hover:text-white hover:bg-[#c41e3a]/10"
                    >
                      {t(labelKey)}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>

          <LanguageToggle />
        </div>
      </div>
    </nav>
  );
}

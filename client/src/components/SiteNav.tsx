import { Link, useLocation } from 'wouter';
import { BookOpen, Crown, Home, Menu, Search, Wand2 } from 'lucide-react';
import { useState } from 'react';

const PRIMARY = [
  { href: '/', label: 'Início', icon: Home },
  { href: '/v-bloods', label: 'V Bloods', icon: Crown },
  { href: '/spells', label: 'Feitiços', icon: Wand2 },
  { href: '/search', label: 'Busca', icon: Search },
];

const MORE = [
  { href: '/map', label: 'Mapa' },
  { href: '/lore', label: 'Lore' },
  { href: '/weapons', label: 'Armas' },
  { href: '/weapons/legendary', label: 'Lendárias' },
  { href: '/items', label: 'Itens' },
  { href: '/jewels', label: 'Joias' },
  { href: '/builds', label: 'Builds' },
];

export default function SiteNav() {
  const [location] = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 border-b border-[#2a2a2a]/80 bg-[#0a0a0a]/95 backdrop-blur-md">
      <div className="container flex items-center justify-between h-14 gap-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-[#c41e3a] hover:text-white transition-colors shrink-0"
        >
          <BookOpen size={20} />
          <span className="font-gothic font-bold tracking-wider text-sm hidden sm:inline">
            V Rising Wiki
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {PRIMARY.map(({ href, label, icon: Icon }) => {
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
                <span className="hidden md:inline">{label}</span>
              </Link>
            );
          })}

          <div className="relative">
            <button
              type="button"
              onClick={() => setMoreOpen((o) => !o)}
              className={`flex items-center gap-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                MORE.some((m) => location.startsWith(m.href))
                  ? 'bg-[#c41e3a]/15 text-[#e85a6f]'
                  : 'text-[#999] hover:text-white hover:bg-white/5'
              }`}
            >
              <Menu size={15} />
              <span className="hidden md:inline">Mais</span>
            </button>
            {moreOpen && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-40"
                  aria-label="Fechar menu"
                  onClick={() => setMoreOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-50 min-w-[140px] py-1 rounded-lg border border-[#333] bg-[#111] shadow-xl">
                  {MORE.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMoreOpen(false)}
                      className="block px-4 py-2 text-sm text-[#bbb] hover:text-white hover:bg-[#c41e3a]/10"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

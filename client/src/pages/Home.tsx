import { Link } from 'wouter';
import {
  BookMarked,
  BookOpen,
  Crown,
  Gem,
  Layers,
  Map,
  Package,
  Search,
  Sparkles,
  Sword,
  Wand2,
} from 'lucide-react';
import AnimatedBackground from '@/components/AnimatedBackground';
import SiteNav from '@/components/SiteNav';
import HeroSection from '@/components/HeroSection';
import CategoryCard from '@/components/CategoryCard';
import { entitiesStats } from '@/lib/entities';
import { getWikiArt } from '@/lib/wiki-art';
import { useTranslation } from '@/contexts/LocaleContext';
import type { MessageKey } from '@/i18n';

const CATEGORIES: {
  titleKey: MessageKey;
  descKey: MessageKey;
  artId: string;
  icon: React.ReactNode;
  href: string;
  delay: number;
}[] = [
  { titleKey: 'category.vbloods.title', descKey: 'category.vbloods.desc', artId: 'section-v-bloods', icon: <Crown size={32} />, href: '/v-bloods', delay: 0 },
  { titleKey: 'category.spells.title', descKey: 'category.spells.desc', artId: 'section-spells', icon: <Wand2 size={32} />, href: '/spells', delay: 100 },
  { titleKey: 'category.weapons.title', descKey: 'category.weapons.desc', artId: 'section-weapons', icon: <Sword size={32} />, href: '/weapons', delay: 200 },
  { titleKey: 'category.items.title', descKey: 'category.items.desc', artId: 'section-items', icon: <Package size={32} />, href: '/items', delay: 300 },
  { titleKey: 'category.jewels.title', descKey: 'category.jewels.desc', artId: 'section-jewels', icon: <Gem size={32} />, href: '/jewels', delay: 400 },
  { titleKey: 'category.builds.title', descKey: 'category.builds.desc', artId: 'section-builds', icon: <Layers size={32} />, href: '/builds', delay: 500 },
  { titleKey: 'category.map.title', descKey: 'category.map.desc', artId: 'section-map', icon: <Map size={32} />, href: '/map', delay: 600 },
  { titleKey: 'category.lore.title', descKey: 'category.lore.desc', artId: 'section-lore', icon: <BookMarked size={32} />, href: '/lore', delay: 700 },
  { titleKey: 'category.legendary.title', descKey: 'category.legendary.desc', artId: 'section-weapons-legendary', icon: <Sparkles size={32} />, href: '/weapons/legendary', delay: 800 },
];

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-x-hidden">
      <AnimatedBackground />
      <SiteNav />

      <div className="relative z-10">
        <HeroSection
          backgroundImage={getWikiArt('hero-home')}
          title={t('home.heroTitle')}
          subtitle={t('home.heroSubtitle')}
        />

        <section className="py-20 px-4 relative">
          <div
            className="absolute inset-0 pointer-events-none opacity-30"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(196, 30, 58, 0.12) 0%, transparent 70%)',
            }}
          />
          <div className="container relative z-10">
            <div className="text-center mb-14">
              <h2 className="font-gothic text-4xl md:text-5xl font-bold tracking-wide mb-4">
                {t('home.exploreTitle')}
              </h2>
              <p className="text-[#999] max-w-xl mx-auto">
                {t('home.exploreSubtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {CATEGORIES.map((cat) => (
                <CategoryCard
                  key={cat.href}
                  title={t(cat.titleKey)}
                  description={t(cat.descKey)}
                  image={getWikiArt(cat.artId)}
                  icon={cat.icon}
                  href={cat.href}
                  delay={cat.delay}
                />
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-3 mt-14">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#c41e3a] hover:bg-[#a01729] rounded-lg font-gothic text-sm"
              >
                <Search size={18} />
                {t('home.globalSearch')}
              </Link>
            </div>

            <p className="text-center text-[#555] text-xs mt-10 flex items-center justify-center gap-2">
              <BookOpen size={14} />
              {t('home.stats', {
                total: entitiesStats.total,
                bosses: entitiesStats.bosses,
                spells: entitiesStats.spells,
              })}
            </p>
          </div>
        </section>

        <footer className="border-t border-[#2a2a2a] py-12 text-center text-[#555] text-sm">
          <p className="font-gothic text-[#c41e3a] mb-2">{t('home.footerTagline')}</p>
          <p>{t('home.footerCredit')}</p>
        </footer>
      </div>
    </div>
  );
}

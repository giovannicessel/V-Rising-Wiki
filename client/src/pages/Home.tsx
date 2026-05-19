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

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-x-hidden">
      <AnimatedBackground />
      <SiteNav />

      <div className="relative z-10">
        <HeroSection
          backgroundImage={getWikiArt('hero-home')}
          title="V Rising Wiki"
          subtitle="Grimório das Sombras de Vardoran"
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
                Explore Vardoran
              </h2>
              <p className="text-[#999] max-w-xl mx-auto">
                V Bloods, magias, armas e itens — em atmosfera gótica vampiresca
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <CategoryCard
                title="V Bloods"
                description="Chefes, fases de combate, loot e desbloqueios"
                image={getWikiArt('section-v-bloods')}
                icon={<Crown size={32} />}
                href="/v-bloods"
                delay={0}
              />
              <CategoryCard
                title="Feitiços"
                description="Escolas de magia com identidade visual por elemento"
                image={getWikiArt('section-spells')}
                icon={<Wand2 size={32} />}
                href="/spells"
                delay={100}
              />
              <CategoryCard
                title="Armas"
                description="Tipos, habilidades e variantes"
                image={getWikiArt('section-weapons')}
                icon={<Sword size={32} />}
                href="/weapons"
                delay={200}
              />
              <CategoryCard
                title="Itens"
                description="Materiais, craft e onde obter"
                image={getWikiArt('section-items')}
                icon={<Package size={32} />}
                href="/items"
                delay={300}
              />
              <CategoryCard
                title="Joias"
                description="Soul Shards e bônus"
                image={getWikiArt('section-jewels')}
                icon={<Gem size={32} />}
                href="/jewels"
                delay={400}
              />
              <CategoryCard
                title="Builds"
                description="Monte arma + magias + joia"
                image={getWikiArt('section-builds')}
                icon={<Layers size={32} />}
                href="/builds"
                delay={500}
              />
              <CategoryCard
                title="Mapa de Vardoran"
                description="Pins interativos dos V Bloods"
                image={getWikiArt('section-map')}
                icon={<Map size={32} />}
                href="/map"
                delay={600}
              />
              <CategoryCard
                title="Lore"
                description="História completa de Vardoran em PT"
                image={getWikiArt('section-lore')}
                icon={<BookMarked size={32} />}
                href="/lore"
                delay={700}
              />
              <CategoryCard
                title="Armas lendárias"
                description="Artefatos únicos e efeitos especiais"
                image={getWikiArt('section-weapons-legendary')}
                icon={<Sparkles size={32} />}
                href="/weapons/legendary"
                delay={800}
              />
            </div>

            <div className="flex flex-wrap justify-center gap-3 mt-14">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#c41e3a] hover:bg-[#a01729] rounded-lg font-gothic text-sm"
              >
                <Search size={18} />
                Busca global
              </Link>
            </div>

            <p className="text-center text-[#555] text-xs mt-10 flex items-center justify-center gap-2">
              <BookOpen size={14} />
              {entitiesStats.total} páginas curadas · {entitiesStats.bosses} V Bloods ·{' '}
              {entitiesStats.spells} feitiços
            </p>
          </div>
        </section>

        <footer className="border-t border-[#2a2a2a] py-12 text-center text-[#555] text-sm">
          <p className="font-gothic text-[#c41e3a] mb-2">Forjado nas sombras de Vardoran</p>
          <p>V Rising Dark Wiki · Stunlock Studios</p>
        </footer>
      </div>
    </div>
  );
}

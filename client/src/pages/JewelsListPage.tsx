import { Crown, Gem, Sparkles } from 'lucide-react';
import EntityCard from '@/components/EntityCard';
import JewelCycleThumb, { jewelCyclePhase } from '@/components/JewelCycleThumb';
import ItemThumb from '@/components/ItemThumb';
import WikiPageShell from '@/components/WikiPageShell';
import WikiProse from '@/components/WikiProse';
import jewelryCatalog from '@/data/jewelry-catalog.json';
import { useTranslation } from '@/contexts/LocaleContext';
import { pickLocaleText } from '@/lib/locale-text';
import jewelsGuide from '@/data/jewels-guide.json';
import { getEntitiesByType } from '@/lib/entities';

export default function JewelsListPage() {
  const { locale } = useTranslation();
  const soulShards = getEntitiesByType('jewel');

  const catalog = jewelryCatalog as {
    intro: string;
    introPt?: string;
    items: {
      name: string;
      slug: string;
      gearLevel?: number;
      stats: string;
      statsPt?: string;
      source: string;
      sourcePt?: string;
      materials: string;
      materialsPt?: string;
      imageUrl?: string;
    }[];
  };
  const guide = jewelsGuide as {
    introPt?: string;
    fusionNotePt?: string;
    tiers: { tier: number; image?: string; description: string }[];
    note: string;
  };

  return (
    <WikiPageShell subtle>
      <div className="container py-10 max-w-5xl">
        <header className="mb-10">
          <p className="text-[#c41e3a] text-xs uppercase tracking-[0.25em] mb-2 flex items-center gap-2">
            <Gem size={14} />
            Equipamento mágico
          </p>
          <h1 className="font-gothic text-4xl font-bold mb-3">Joias & Soul Shards</h1>
          <p className="text-[#888] max-w-2xl text-sm leading-relaxed">{guide.note}</p>
        </header>

        <section className="mb-12">
          <h2 className="font-gothic text-2xl text-white mb-4 flex items-center gap-2">
            <Sparkles size={20} className="text-violet-400" />
            Joias de feitiço (Tier 1–4)
          </h2>
          {guide.introPt && (
            <p className="text-sm text-[#aaa] leading-relaxed max-w-3xl mb-6">{guide.introPt}</p>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {guide.tiers.map((t) => (
              <div
                key={t.tier}
                className="rounded-xl border border-violet-500/30 bg-[#111]/80 p-4 flex flex-col items-center text-center"
              >
                <JewelCycleThumb
                  tier={t.tier}
                  size="md"
                  className="mb-3"
                  phaseOffset={jewelCyclePhase(t.tier)}
                  intervalMs={2200 + t.tier * 200}
                />
                <p className="text-violet-300 font-gothic font-bold text-lg mb-2">
                  Tier {t.tier}
                </p>
                <p className="text-sm text-[#aaa] leading-relaxed">{t.description}</p>
              </div>
            ))}
          </div>
          {guide.fusionNotePt && (
            <p className="text-xs text-[#777] leading-relaxed mt-6 max-w-3xl border-t border-[#252525] pt-4">
              {guide.fusionNotePt}
            </p>
          )}
        </section>

        <section className="mb-12">
          <h2 className="font-gothic text-2xl text-white mb-4 flex items-center gap-2">
            <Crown size={20} className="text-amber-400" />
            Soul Shards
          </h2>
          <p className="text-sm text-[#888] mb-4">
            Artefatos únicos de endgame — substituem o ultimate e têm mecânicas de PvP.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {soulShards.map((entity, i) => (
              <EntityCard key={entity.id} entity={entity} index={i} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-gothic text-2xl text-white mb-2">
            Anéis e pingentes (Jewelry)
          </h2>
          <WikiProse text={pickLocaleText(locale, catalog.intro, catalog.introPt)} />
          <p className="text-xs text-[#666] mt-2 mb-4">
            {catalog.items.length} itens · dados da{' '}
            <a
              href="https://vrising.fandom.com/wiki/Jewelry"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#c41e3a] hover:underline"
            >
              Fandom
            </a>
          </p>
          <div className="overflow-x-auto rounded-xl border border-[#333]">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="border-b border-[#333] text-left text-[#888] text-xs uppercase">
                  <th className="px-3 py-2 w-14" />
                  <th className="px-3 py-2">Nome</th>
                  <th className="px-3 py-2">Nv. gear</th>
                  <th className="px-3 py-2">Atributos</th>
                  <th className="px-3 py-2">Fonte</th>
                  <th className="px-3 py-2">Materiais</th>
                </tr>
              </thead>
              <tbody>
                {catalog.items.map((item) => (
                  <tr
                    key={item.slug}
                    className="border-b border-[#252525] hover:bg-[#151515]"
                  >
                    <td className="px-3 py-2">
                      <ItemThumb src={item.imageUrl} alt={item.name} size="sm" />
                    </td>
                    <td className="px-3 py-2 text-white font-medium whitespace-nowrap">
                      {item.name}
                    </td>
                    <td className="px-3 py-2 text-[#aaa] text-center">
                      {item.gearLevel ?? '—'}
                    </td>
                    <td className="px-3 py-2 text-[#ccc] text-xs max-w-[200px]">
                      {pickLocaleText(locale, item.stats, item.statsPt) || '—'}
                    </td>
                    <td className="px-3 py-2 text-[#999] text-xs max-w-[180px]">
                      {pickLocaleText(locale, item.source, item.sourcePt) || '—'}
                    </td>
                    <td className="px-3 py-2 text-[#999] text-xs max-w-[160px]">
                      {pickLocaleText(locale, item.materials, item.materialsPt) || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </WikiPageShell>
  );
}

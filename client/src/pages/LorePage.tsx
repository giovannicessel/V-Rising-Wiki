import { Link } from 'wouter';
import { BookMarked, Crown, Map } from 'lucide-react';
import WikiPageShell from '@/components/WikiPageShell';
import WikiProse from '@/components/WikiProse';
import {
  cleanIntro,
  getFactions,
  getLoreRegions,
  getTimeline,
  lore,
  matchBossEntity,
} from '@/lib/lore';
import { getEntitiesByType } from '@/lib/entities';
import { entityDetailPath } from '@/lib/entity-paths';

function renderBold(text: string) {
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="text-white font-medium">
        {part}
      </strong>
    ) : (
      part
    )
  );
}

export default function LorePage() {
  const timeline = getTimeline();
  const regions = getLoreRegions();
  const factions = getFactions();
  const bosses = getEntitiesByType('boss');

  return (
    <WikiPageShell>
      <article className="container py-10 max-w-3xl">
        <header className="mb-10">
          <p className="text-[#c41e3a] text-xs uppercase tracking-[0.25em] mb-2 flex items-center gap-2">
            <BookMarked size={14} />
            História
          </p>
          <h1 className="font-gothic text-4xl md:text-5xl font-bold text-white tracking-wide">
            Lore de Vardoran
          </h1>
          <p className="text-[#aaa] mt-4 leading-relaxed">
            {renderBold(cleanIntro(lore.intro))}
          </p>
        </header>

        <section className="mb-12">
          <h2 className="font-gothic text-2xl text-white mb-4 border-b border-[#333] pb-2">
            Cronologia
          </h2>
          <div className="space-y-4">
            {timeline.map((row) => (
              <div
                key={row.era}
                className="rounded-lg border border-[#2a2a2a] bg-[#111]/60 p-4"
              >
                <p className="text-[#c41e3a] text-xs uppercase tracking-wider mb-1">
                  {row.era}
                </p>
                <h3 className="font-gothic text-lg text-white font-bold">{row.event}</h3>
                <p className="text-[#aaa] text-sm mt-2 leading-relaxed">{row.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-gothic text-2xl text-white mb-6 border-b border-[#333] pb-2">
            Regiões e chefes
          </h2>
          <div className="space-y-10">
            {regions.map((region) => (
              <div key={region.id} id={region.id}>
                <h3 className="font-gothic text-xl text-[#e85a6f] mb-3">{region.title}</h3>
                <WikiProse text={region.body} />
                {region.bosses.length > 0 && (
                  <ul className="mt-4 space-y-3">
                    {region.bosses.map((b) => {
                      const bossEntity = matchBossEntity(bosses, b.name);
                      return (
                        <li
                          key={b.name}
                          className="rounded-lg border border-[#2a2a2a] bg-[#0f0f0f] p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                            <span className="font-gothic text-white font-semibold flex items-center gap-2">
                              <Crown size={14} className="text-[#c41e3a]" />
                              {b.name}
                            </span>
                            {bossEntity && (
                              <Link
                                href={entityDetailPath('boss', bossEntity.slug)}
                                className="text-xs text-[#c41e3a] hover:underline"
                              >
                                Página do chefe
                              </Link>
                            )}
                          </div>
                          <p className="text-sm text-[#999] leading-relaxed">{b.lore}</p>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>

        {factions.length > 0 && (
          <section className="mb-12">
            <h2 className="font-gothic text-2xl text-white mb-4 border-b border-[#333] pb-2">
              Facções
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left text-[#888] border-b border-[#333]">
                    <th className="py-2 pr-4">Facção</th>
                    <th className="py-2 pr-4">Líder</th>
                    <th className="py-2">Objetivo</th>
                  </tr>
                </thead>
                <tbody>
                  {factions.map((f) => (
                    <tr key={f.faction} className="border-b border-[#222] text-[#bbb]">
                      <td className="py-3 pr-4 text-white font-medium">{f.faction}</td>
                      <td className="py-3 pr-4">{f.leader}</td>
                      <td className="py-3">{f.objective}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className="rounded-xl border border-[#c41e3a]/20 bg-[#111]/50 p-6">
          <h2 className="font-gothic text-lg text-white mb-2">V Blood</h2>
          <WikiProse text="O V Blood é a essência de Drácula espalhada pelo mundo durante a Chuva de Sangue de sete dias após sua derrota. Criaturas e humanos expostos tornaram-se portadores de poderes extraordinários — os chefes que você caça para recuperar força e desbloquear habilidades." />
        </section>

        <p className="text-center text-[#555] text-sm mt-10 flex flex-wrap justify-center gap-4">
          <Link href="/map" className="inline-flex items-center gap-1 text-[#c41e3a] hover:underline">
            <Map size={14} />
            Mapa interativo
          </Link>
          <Link href="/v-bloods" className="text-[#c41e3a] hover:underline">
            Todos os V Bloods
          </Link>
        </p>
      </article>
    </WikiPageShell>
  );
}



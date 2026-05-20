import { Link } from 'wouter';
import { ExternalLink, Sparkles } from 'lucide-react';
import AssetImage from '@/components/AssetImage';
import WikiPageShell from '@/components/WikiPageShell';
import { allEntities } from '@/lib/entities';
import { entityDetailPath } from '@/lib/entity-paths';
import { getLegendaryWeapons } from '@/lib/legendary-weapons';
import { getAncestralGuide, getRiftCraftingGuide } from '@/lib/weapon-guide';
import { WEAPON_TYPE_PT } from '@/data/entity-translations';

export default function LegendaryWeaponsPage() {
  const weapons = getLegendaryWeapons(allEntities);
  const rift = getRiftCraftingGuide();
  const ancestral = getAncestralGuide();

  return (
    <WikiPageShell>
      <div className="container py-10 max-w-5xl">
        <header className="mb-10">
          <p className="text-amber-400/80 text-xs uppercase tracking-[0.25em] mb-2 flex items-center gap-2">
            <Sparkles size={14} />
            Artefatos
          </p>
          <h1 className="font-gothic text-4xl font-bold text-white tracking-wide">
            Armas lendárias
          </h1>
          <p className="text-[#888] mt-3 max-w-2xl text-sm leading-relaxed">
            Artefatos com nome próprio e modificadores exclusivos nas habilidades Q/E. Abaixo:
            como obtê-los via Incursões da Fenda e Forja Ancestral — depois, a lista de cada
            artefato.
          </p>
          <Link href="/weapons" className="text-sm text-[#c41e3a] mt-4 inline-block hover:underline">
            ← Catálogo de armas (tiers e habilidades)
          </Link>
        </header>

        {rift && (
          <section className="mb-12 rounded-2xl border border-violet-500/30 bg-gradient-to-br from-[#12101a] via-[#111] to-[#0a0a0a] p-6 md:p-8">
            <h2 className="font-gothic text-2xl text-violet-200 mb-3">{rift.title}</h2>
            <p className="text-sm text-[#bbb] leading-relaxed mb-6">{rift.summary}</p>

            <p className="text-xs text-violet-300/90 mb-6 border-l-2 border-violet-500/40 pl-3">
              {rift.prerequisite}
            </p>

            <h3 className="font-gothic text-lg text-white mb-3">Ciclo em 3 passos</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-[#ccc] mb-8">
              {rift.flow.map((step) => (
                <li key={step} className="leading-relaxed">
                  {step}
                </li>
              ))}
            </ol>

            <div className="grid md:grid-cols-2 gap-4 mb-8">
              {rift.tiers.map((t) => (
                <div
                  key={t.name}
                  className="rounded-xl border border-[#333] bg-[#0d0d0d]/80 p-4"
                >
                  <p className="text-violet-300 font-gothic font-bold mb-1">{t.name}</p>
                  <p className="text-[10px] text-[#888] mb-3">Recomendado: {t.level}</p>
                  <dl className="space-y-2 text-xs">
                    <div>
                      <dt className="text-[#666] uppercase tracking-wide">Moeda</dt>
                      <dd className="text-[#ddd] mt-0.5">{t.currency}</dd>
                    </div>
                    <div>
                      <dt className="text-[#666] uppercase tracking-wide">Mercador</dt>
                      <dd className="text-[#ddd] mt-0.5">{t.merchant}</dd>
                    </div>
                    <div>
                      <dt className="text-[#666] uppercase tracking-wide">Compra</dt>
                      <dd className="text-[#aaa] mt-0.5">{t.buys}</dd>
                    </div>
                    <div>
                      <dt className="text-[#666] uppercase tracking-wide">Resultado</dt>
                      <dd className="text-emerald-400/90 mt-0.5">{t.craftResult}</dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-amber-500/25 bg-[#1a1408]/50 p-5 mb-6">
              <h3 className="font-gothic text-lg text-amber-200/90 mb-2">
                Forja Ancestral — receitas
              </h3>
              <p className="text-xs text-[#888] mb-3">
                Desbloqueio: {ancestral.forge.unlock}
              </p>
              <ul className="text-sm text-[#bbb] space-y-2">
                <li>
                  <strong className="text-amber-300/90">Ancestral rara:</strong>{' '}
                  {rift.ancestralEpicCraft.rare}
                </li>
                <li>
                  <strong className="text-amber-300/90">Ancestral épica:</strong>{' '}
                  {rift.ancestralEpicCraft.epic}
                </li>
                <li>
                  <strong className="text-amber-300/90">Lendária (artefato):</strong>{' '}
                  {rift.legendaryChance}
                </li>
                <li className="text-[#999] text-xs pt-1">{rift.ancestralEpicCraft.legendaryRoll}</li>
              </ul>
            </div>

            <p className="text-xs text-[#666]">
              Incursões são eventos em Mortium (limpar cristais → ondas → Blood Soul). Não
              detalhamos o combate aqui — foque em farmar estilhaços e trocar nos mercadores.{' '}
              <a
                href={rift.fandomUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#c41e3a] hover:underline inline-flex items-center gap-1"
              >
                Fandom: Rift Incursions
                <ExternalLink size={10} />
              </a>
            </p>
          </section>
        )}

        <section>
          <h2 className="font-gothic text-xl text-white mb-4 pb-2 border-b border-[#333]">
            Lista de artefatos lendários
          </h2>
          <p className="text-sm text-[#777] mb-6">
            Clique em um cartão para ver o modificador exclusivo e as habilidades do tipo de arma.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {weapons.map((w) => (
              <Link
                key={w.id}
                href={entityDetailPath('weapon', w.slug)}
                className="group rounded-xl border border-amber-500/25 bg-gradient-to-b from-[#1a1408] to-[#0f0f0f] p-5 hover:border-amber-400/50 transition-colors"
              >
                {w.image && (
                  <AssetImage
                    src={w.image}
                    alt=""
                    className="w-20 h-20 object-contain mx-auto mb-4 group-hover:scale-105 transition-transform"
                  />
                )}
                <h3 className="font-gothic text-lg text-white text-center font-bold">
                  {w.name}
                </h3>
                <p className="text-center text-xs text-[#888] mt-1">
                  {w.weaponType
                    ? (WEAPON_TYPE_PT[w.weaponType] ?? w.weaponType)
                    : 'Arma'}
                </p>
                {w.description && (
                  <p className="text-[#777] text-xs mt-3 line-clamp-3 leading-relaxed">
                    {w.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </WikiPageShell>
  );
}

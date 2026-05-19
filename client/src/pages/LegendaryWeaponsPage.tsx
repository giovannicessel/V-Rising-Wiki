import { Link } from 'wouter';
import { Sparkles } from 'lucide-react';
import WikiPageShell from '@/components/WikiPageShell';
import { allEntities } from '@/lib/entities';
import { entityDetailPath } from '@/lib/entity-paths';
import { getLegendaryWeapons } from '@/lib/legendary-weapons';
import { WEAPON_TYPE_PT } from '@/data/entity-translations';

export default function LegendaryWeaponsPage() {
  const weapons = getLegendaryWeapons(allEntities);

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
          <p className="text-[#888] mt-3 max-w-xl">
            Armas únicas com efeitos próprios, fora das linhas Copper / Iron / Sanguine.
          </p>
          <Link href="/weapons" className="text-sm text-[#c41e3a] mt-4 inline-block hover:underline">
            ← Todas as armas
          </Link>
        </header>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {weapons.map((w) => (
            <Link
              key={w.id}
              href={entityDetailPath('weapon', w.slug)}
              className="group rounded-xl border border-amber-500/25 bg-gradient-to-b from-[#1a1408] to-[#0f0f0f] p-5 hover:border-amber-400/50 transition-colors"
            >
              {w.image && (
                <img
                  src={w.image}
                  alt=""
                  className="w-20 h-20 object-contain mx-auto mb-4 group-hover:scale-105 transition-transform"
                />
              )}
              <h2 className="font-gothic text-lg text-white text-center font-bold">
                {w.name}
              </h2>
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
      </div>
    </WikiPageShell>
  );
}

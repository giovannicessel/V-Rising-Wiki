import { Link } from 'wouter';
import { BOSS_MAP_PINS } from '@/data/boss-map-pins';
import { REGION_PT } from '@/data/entity-translations';
import { entityDetailPath } from '@/lib/entity-paths';

export default function VardoranMap() {
  return (
    <section className="gothic-card p-6 overflow-hidden">
      <h2 className="font-gothic text-2xl font-bold mb-2">Mapa de Vardoran</h2>
      <p className="text-[#888] text-sm mb-6">
        Posições aproximadas dos V Bloods principais. Clique em um pin para ver a
        página do chefe.
      </p>

      <div
        className="relative w-full aspect-[16/10] rounded-lg border border-[#4a4a4a]/60 overflow-hidden"
        style={{
          background:
            'radial-gradient(ellipse at 30% 40%, #1a1520 0%, #0a0a0a 70%), linear-gradient(180deg, #12121a 0%, #0a0a0a 100%)',
        }}
      >
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 48px, #2a2a2a 48px, #2a2a2a 49px), repeating-linear-gradient(90deg, transparent, transparent 48px, #2a2a2a 48px, #2a2a2a 49px)',
          }}
        />

        {BOSS_MAP_PINS.map((pin) => (
          <Link
            key={pin.slug}
            href={entityDetailPath('boss', pin.slug)}
            className="absolute group -translate-x-1/2 -translate-y-1/2 z-10"
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            title={`${pin.name} — Nv. ${pin.level}`}
          >
            <span className="flex flex-col items-center">
              <span className="w-4 h-4 rounded-full bg-[#c41e3a] border-2 border-white shadow-[0_0_12px_#c41e3a] group-hover:scale-125 transition-transform" />
              <span className="mt-1 px-2 py-0.5 text-[10px] bg-[#0a0a0a]/90 border border-[#4a4a4a] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity text-white">
                Nv.{pin.level}
              </span>
            </span>
          </Link>
        ))}

        <div className="absolute bottom-3 left-3 text-[10px] text-[#666] space-y-1">
          {Object.entries(
            BOSS_MAP_PINS.reduce<Record<string, number>>((acc, p) => {
              acc[p.region] = (acc[p.region] ?? 0) + 1;
              return acc;
            }, {})
          ).map(([region, count]) => (
            <div key={region}>
              {REGION_PT[region] ?? region}: {count} pin(s)
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

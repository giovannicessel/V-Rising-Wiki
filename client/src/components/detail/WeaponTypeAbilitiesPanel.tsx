import type { WeaponTypeGuide } from '@/lib/weapon-guide';
import { WEAPON_TYPE_PT } from '@/data/entity-translations';

interface WeaponTypeAbilitiesPanelProps {
  typeGuide: WeaponTypeGuide;
  compact?: boolean;
}

export default function WeaponTypeAbilitiesPanel({
  typeGuide,
  compact = false,
}: WeaponTypeAbilitiesPanelProps) {
  const label = WEAPON_TYPE_PT[typeGuide.typeEn] ?? typeGuide.namePt;

  return (
    <section className={compact ? '' : 'rounded-xl border border-[#2a2a2a] bg-[#111]/80 overflow-hidden'}>
      {!compact && (
        <div className="px-5 py-4 border-b border-[#252525]">
          <h2 className="font-gothic text-lg text-white flex items-center gap-2">
            <span aria-hidden>{typeGuide.emoji}</span>
            Habilidades — {label}
          </h2>
          <p className="text-sm text-[#888] mt-1">{typeGuide.blurb}</p>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className={`w-full text-sm ${compact ? 'min-w-[400px]' : 'min-w-[480px]'}`}>
          <thead>
            <tr className="text-left text-[10px] uppercase text-[#666] border-b border-[#252525]">
              <th className={`${compact ? 'px-0 py-2' : 'px-5 py-2'} w-[38%]`}>Habilidade</th>
              <th className={compact ? 'px-0 py-2' : 'px-5 py-2'}>Efeito</th>
            </tr>
          </thead>
          <tbody>
            {typeGuide.abilities.map((ab) => (
              <tr key={ab.name} className="border-b border-[#1f1f1f] last:border-0">
                <td
                  className={`${compact ? 'py-2 pr-3' : 'px-5 py-3'} text-violet-200/90 font-medium align-top whitespace-nowrap`}
                >
                  {ab.name}
                </td>
                <td className={`${compact ? 'py-2' : 'px-5 py-3'} text-[#bbb] leading-relaxed`}>
                  {ab.description}
                  {ab.unlock && (
                    <span className="block text-[10px] text-[#666] mt-1">
                      Desbloqueio: {ab.unlock}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

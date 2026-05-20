import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { Search, Sword } from 'lucide-react';
import AssetImage from '@/components/AssetImage';
import WeaponTypeAbilitiesPanel from '@/components/detail/WeaponTypeAbilitiesPanel';
import WikiPageShell from '@/components/WikiPageShell';
import weaponsCatalog from '@/data/weapons-catalog.json';
import weaponsGuide from '@/data/weapons-guide.json';
import { useTranslation } from '@/contexts/LocaleContext';
import { pickLocaleText } from '@/lib/locale-text';
import { entityDetailPath } from '@/lib/entity-paths';
import { getWeaponTypeGuide } from '@/lib/weapon-guide';
import type { WeaponTypeGuide } from '@/lib/weapon-guide';
import {
  normalizeSkillNameForIcon,
  resolveWeaponSkillIcon,
} from '@/lib/weapon-skill-icons';

type CatalogType = {
  typeEn: string;
  namePt: string;
  passive: string;
  passivePt?: string;
  skills: {
    slot: string;
    name: string;
    description: string;
    descriptionPt?: string;
    comboDps?: string;
    unlockWeapon?: string;
    iconUrl?: string;
  }[];
  variants: {
    entityId: string;
    slug: string;
    name: string;
    gearLevel?: number;
    physicalPower?: number;
    bonus: string;
    bonusPt?: string;
    image?: string;
    isLegendary?: boolean;
  }[];
};

const catalog = weaponsCatalog as { types: CatalogType[] };

const SLOT_LABEL: Record<string, string> = {
  primary: 'Primário',
  q: 'Q',
  e: 'E',
};

function guideFallback(typeEn: string): WeaponTypeGuide | undefined {
  const normalized = typeEn.replace(/s$/, '');
  return getWeaponTypeGuide(typeEn) ?? getWeaponTypeGuide(normalized);
}

function SkillCards({
  weaponType,
  skills,
  guide,
  locale,
}: {
  weaponType: string;
  skills: CatalogType['skills'];
  guide?: WeaponTypeGuide;
  locale: 'pt' | 'en';
}) {
  const fromGuide = guide?.abilities ?? [];
  const items =
    skills.length > 0
      ? skills.map((s) => ({
          name: s.name,
          description: pickLocaleText(locale, s.description, s.descriptionPt),
          extra: [s.comboDps && `DPS combo: ${s.comboDps}`, s.unlockWeapon && `Desbloqueio: ${s.unlockWeapon}`]
            .filter(Boolean)
            .join(' · '),
          slot: s.slot,
          icon:
            s.iconUrl ||
            resolveWeaponSkillIcon(weaponType, normalizeSkillNameForIcon(s.name)),
        }))
      : fromGuide.map((a) => ({
          name: a.name,
          description: a.description,
          extra: a.unlock ? `Desbloqueio: ${a.unlock}` : '',
          slot: a.name.includes('· Q') ? 'q' : a.name.includes('· E') ? 'e' : 'primary',
          icon: resolveWeaponSkillIcon(weaponType, normalizeSkillNameForIcon(a.name)),
        }));

  if (!items.length) return null;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
      {items.map((s) => (
        <div
          key={s.name}
          className="rounded-xl border border-violet-500/25 bg-[#0d0d0d]/90 p-4 flex flex-col"
        >
          <div className="flex gap-3 mb-3">
            {s.icon ? (
              <div className="w-14 h-14 shrink-0 rounded-lg bg-[#0a0a0a] border border-[#333] flex items-center justify-center p-1">
                <AssetImage src={s.icon} alt="" className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-14 h-14 shrink-0 rounded-lg bg-[#0a0a0a] border border-[#333] flex items-center justify-center text-[#444] text-xs">
                —
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-violet-500/20 text-violet-300">
                  {SLOT_LABEL[s.slot] ?? s.slot}
                </span>
                <h3 className="font-gothic text-white text-sm font-bold">
                  {s.name.replace(/<br\s*\/?>/gi, ' ')}
                </h3>
              </div>
            </div>
          </div>
          <p className="text-sm text-[#bbb] leading-relaxed flex-1">
            {s.description.replace(/&nbsp;/g, ' ')}
          </p>
          {s.extra && <p className="text-[10px] text-[#666] mt-2">{s.extra}</p>}
        </div>
      ))}
    </div>
  );
}

export default function WeaponsListPage() {
  const { t, locale } = useTranslation();
  const [query, setQuery] = useState('');

  const types = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return catalog.types;
    return catalog.types.filter(
      (type) =>
        type.namePt.toLowerCase().includes(q) ||
        type.typeEn.toLowerCase().includes(q) ||
        type.variants.some((v) => v.name.toLowerCase().includes(q))
    );
  }, [query]);

  const intro = (weaponsGuide as { intro?: string }).intro;

  return (
    <WikiPageShell subtle>
      <div className="container py-10 max-w-5xl">
        <header className="mb-10">
          <p className="text-[#c41e3a] text-xs uppercase tracking-[0.25em] mb-2 flex items-center gap-2">
            <Sword size={14} />
            Combate
          </p>
          <h1 className="font-gothic text-4xl font-bold tracking-wide mb-3">Armas</h1>
          {intro && (
            <p className="text-sm text-[#999] max-w-2xl leading-relaxed">{intro}</p>
          )}
          <Link
            href="/weapons/legendary"
            className="inline-block mt-3 text-sm text-amber-400/90 hover:text-amber-300 hover:underline"
          >
            {t('entity.legendaryLink')}
          </Link>
        </header>

        <div className="relative max-w-md mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar tipo ou arma (ex. machado, ferro)…"
            className="w-full pl-10 pr-4 py-2.5 bg-[#111]/90 border border-[#2a2a2a] rounded-lg text-white text-sm focus:border-[#c41e3a]/60 focus:outline-none"
          />
        </div>

        <div className="space-y-14">
          {types.map((type) => {
            const guide = guideFallback(type.typeEn);
            const variants = type.variants.filter(
              (v) => !query.trim() || v.name.toLowerCase().includes(query.trim().toLowerCase())
            );
            if (query.trim() && variants.length === 0) return null;

            return (
              <section
                key={type.typeEn}
                id={type.typeEn.toLowerCase()}
                className="scroll-mt-24"
              >
                <h2 className="font-gothic text-2xl font-bold text-[#c41e3a] border-b border-[#333] pb-2 mb-6">
                  {type.namePt}
                  <span className="text-sm text-[#666] font-normal ml-2">({type.typeEn})</span>
                </h2>

                {type.passive && (
                  <div className="rounded-xl border border-emerald-500/25 bg-emerald-950/15 px-5 py-4 mb-6">
                    <p className="text-[10px] uppercase tracking-wider text-emerald-400/80 mb-1">
                      Passiva do tipo (todas as {type.namePt.toLowerCase()})
                    </p>
                    <p className="text-sm text-[#ccc] leading-relaxed">
                      {pickLocaleText(locale, type.passive, type.passivePt)}
                    </p>
                  </div>
                )}

                {guide && !type.skills.length && (
                  <WeaponTypeAbilitiesPanel typeGuide={guide} compact />
                )}
                <SkillCards
                  weaponType={type.typeEn}
                  skills={type.skills}
                  guide={guide}
                  locale={locale}
                />

                <h3 className="font-gothic text-lg text-white mb-3">
                  Variantes e dano
                </h3>
                <div className="overflow-x-auto rounded-xl border border-[#2a2a2a]">
                  <table className="w-full text-sm min-w-[640px]">
                    <thead>
                      <tr className="bg-[#111] text-[#888] text-[10px] uppercase text-left">
                        <th className="p-3 w-12" />
                        <th className="p-3">Arma</th>
                        <th className="p-3 text-center">Nv. gear</th>
                        <th className="p-3 text-center">Poder físico</th>
                        <th className="p-3">Bônus / passiva</th>
                      </tr>
                    </thead>
                    <tbody>
                      {variants.map((v) => (
                        <tr
                          key={v.entityId}
                          className={`border-t border-[#222] hover:bg-[#151515] ${
                            v.isLegendary ? 'bg-amber-950/10' : ''
                          }`}
                        >
                          <td className="p-3">
                            {v.image && (
                              <AssetImage
                                src={v.image}
                                alt=""
                                className="w-10 h-10 object-contain"
                              />
                            )}
                          </td>
                          <td className="p-3">
                            <Link
                              href={entityDetailPath('weapon', v.slug)}
                              className="text-white font-medium hover:text-[#c41e3a]"
                            >
                              {v.name}
                              {v.isLegendary && (
                                <span className="ml-2 text-[10px] text-amber-400 uppercase">
                                  lendária
                                </span>
                              )}
                            </Link>
                          </td>
                          <td className="p-3 text-center text-[#aaa]">
                            {v.gearLevel ?? '—'}
                          </td>
                          <td className="p-3 text-center text-[#ccc]">
                            {v.physicalPower != null ? v.physicalPower : '—'}
                          </td>
                          <td className="p-3 text-[#999] text-xs">
                            {pickLocaleText(locale, v.bonus, v.bonusPt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}
        </div>

        {types.length === 0 && (
          <p className="text-center text-[#555] py-16">Nenhum resultado.</p>
        )}
      </div>
    </WikiPageShell>
  );
}

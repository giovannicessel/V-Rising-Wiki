import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, ExternalLink, Sparkles, Sword } from 'lucide-react';
import AssetImage from '@/components/AssetImage';
import EntitySectionContent from '@/components/EntitySectionContent';
import WeaponTypeAbilitiesPanel from '@/components/detail/WeaponTypeAbilitiesPanel';
import WikiProse from '@/components/WikiProse';
import type { WikiEntity } from '@/data/entity-types';
import { WEAPON_TYPE_PT } from '@/data/entity-translations';
import { allEntities } from '@/lib/entities';
import { entityListPath } from '@/lib/entity-paths';
import { isLegendaryWeapon } from '@/lib/legendary-weapons';
import { getSchoolTheme } from '@/lib/school-theme';
import {
  getAncestralGuide,
  getLegendaryObtainNote,
  getRemovedWeaponGuide,
  getUniqueWeaponGuide,
  getWeaponTypeGuide,
  isAncestralTierWeapon,
} from '@/lib/weapon-guide';

type Tab = 'overview' | 'abilities' | 'craft';

function formatAbilityName(id: string) {
  return id
    .replace(/^stunlock_icon_ability_weapon_/i, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function getTypeAbilities(weaponType?: string): WikiEntity[] {
  if (!weaponType) return [];
  const key = weaponType.toLowerCase().replace(/\s/g, '');
  return allEntities.filter(
    (e) =>
      e.type === 'weapon' &&
      e.id.startsWith('stunlock_icon_ability_weapon_') &&
      e.id.toLowerCase().includes(key)
  );
}

export default function WeaponDetailView({ entity }: { entity: WikiEntity }) {
  const legendary = isLegendaryWeapon(entity);
  const ancestral = isAncestralTierWeapon(entity);
  const [tab, setTab] = useState<Tab>('overview');

  const typeGuide = useMemo(() => getWeaponTypeGuide(entity.weaponType), [entity.weaponType]);
  const uniqueGuide = useMemo(() => getUniqueWeaponGuide(entity), [entity]);
  const removedGuide = useMemo(() => getRemovedWeaponGuide(entity), [entity]);
  const ancestralGuide = getAncestralGuide();

  const typeAbilities = useMemo(
    () => getTypeAbilities(entity.weaponType),
    [entity.weaponType]
  );

  const stats = entity.infobox?.stats;
  const style = entity.infobox?.style?.replace(/\\"/g, '"').replace(/^"text-align:[^"]*"\s*\|/, '');

  const craftSections = entity.sections.filter((s) =>
    /recipe|craft|attribute|roll/i.test(s.title)
  );

  return (
    <div className="container py-8 max-w-4xl">
      <Link
        href={legendary ? '/weapons/legendary' : entityListPath('weapon')}
        className="inline-flex items-center gap-2 text-[#888] hover:text-[#c41e3a] mb-8 text-sm"
      >
        <ArrowLeft size={16} />
        {legendary ? 'Armas lendárias' : 'Armas'}
      </Link>

      <div
        className={`relative mb-8 rounded-2xl overflow-hidden border p-8 flex flex-col md:flex-row gap-6 items-center ${
          legendary
            ? 'border-amber-500/40 bg-gradient-to-br from-[#1a1408] via-[#111] to-[#0a0a0a]'
            : 'border-[#333] bg-[#111]/60'
        }`}
      >
        {legendary && (
          <div
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              background:
                'radial-gradient(ellipse at 30% 50%, rgba(212, 175, 55, 0.15) 0%, transparent 60%)',
            }}
          />
        )}
        {entity.image && (
          <AssetImage
            src={entity.image}
            alt={entity.name}
            className={`relative z-10 object-contain drop-shadow-lg ${
              legendary ? 'w-36 h-36' : 'w-28 h-28'
            }`}
          />
        )}
        <div className="relative z-10">
          {legendary && (
            <p className="text-amber-400/90 text-[11px] uppercase tracking-[0.25em] mb-2 flex items-center gap-2">
              <Sparkles size={14} />
              Artefato lendário
            </p>
          )}
          <p className="text-[#888] text-xs uppercase tracking-wider mb-1 flex items-center gap-2">
            <Sword size={12} />
            {entity.weaponType
              ? (WEAPON_TYPE_PT[entity.weaponType] ?? entity.weaponType)
              : 'Arma'}
          </p>
          <h1 className="font-gothic text-4xl font-bold text-white tracking-wide">
            {entity.name}
          </h1>
          {stats && <p className="text-[#c4a35a] text-sm mt-2">{stats}</p>}
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-[#252525] flex-wrap">
        {(['overview', 'abilities', 'craft'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={
              tab === t
                ? 'text-white border-b-2 border-[#c41e3a] px-3 py-2 text-sm'
                : 'text-[#777] px-3 py-2 text-sm hover:text-white'
            }
          >
            {t === 'overview' && 'Visão geral'}
            {t === 'abilities' && 'Habilidades'}
            {t === 'craft' && 'Atributos & craft'}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-6">
          {entity.description && <WikiProse text={entity.description} />}
          {uniqueGuide && (
            <section className="rounded-xl border border-[#333] bg-[#111]/60 p-5">
              <h2 className="font-gothic text-lg text-white mb-2">Arma única</h2>
              <dl className="grid sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-[#666] text-xs uppercase">Nv. gear</dt>
                  <dd className="text-white">{uniqueGuide.gearLevel}</dd>
                </div>
                <div>
                  <dt className="text-[#666] text-xs uppercase">Bônus</dt>
                  <dd className="text-[#ccc]">{uniqueGuide.bonus}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-[#666] text-xs uppercase">Onde obter</dt>
                  <dd className="text-[#aaa]">{uniqueGuide.source}</dd>
                </div>
              </dl>
            </section>
          )}
          {removedGuide && (
            <section className="rounded-xl border border-[#333] bg-[#111]/60 p-5">
              <h2 className="font-gothic text-lg text-[#888] mb-2">Histórico</h2>
              <p className="text-sm text-[#bbb]">{removedGuide.bonus}</p>
              <p className="text-xs text-[#666] mt-2">{removedGuide.note}</p>
            </section>
          )}
          {legendary && !style && (
            <p className="text-sm text-[#888]">{getLegendaryObtainNote()}</p>
          )}
          {style && style.length > 10 && (
            <section className="rounded-xl border border-amber-500/20 bg-[#15120a]/80 p-5">
              <h2 className="font-gothic text-lg text-amber-200/90 mb-2">
                {legendary ? 'Modificador do artefato' : 'Efeito único'}
              </h2>
              <WikiProse text={style} />
            </section>
          )}
        </div>
      )}

      {tab === 'abilities' && (
        <div className="space-y-6">
          {typeGuide && <WeaponTypeAbilitiesPanel typeGuide={typeGuide} />}

          {legendary && style && (
            <section className="rounded-lg border border-amber-500/25 bg-[#1a1408]/40 p-5">
              <h2 className="font-gothic text-white mb-2">Modificador exclusivo deste artefato</h2>
              <WikiProse text={style} />
            </section>
          )}

          {typeAbilities.length > 0 && (
            <section>
              <h2 className="font-gothic text-lg text-[#888] mb-3">
                Ícones de habilidade (jogo)
              </h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {typeAbilities.map((a) => (
                  <div
                    key={a.id}
                    className="flex gap-3 items-center rounded-lg border border-[#2a2a2a] bg-[#111] p-3"
                  >
                    {a.image && (
                      <AssetImage src={a.image} alt="" className="w-12 h-12 object-contain" />
                    )}
                    <div>
                      <p className="text-white text-sm font-medium">
                        {formatAbilityName(a.id)}
                      </p>
                      {a.description && (
                        <p className="text-xs text-[#777] line-clamp-2 mt-0.5">
                          {a.description.slice(0, 120)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {!typeGuide && !style && typeAbilities.length === 0 && (
            <p className="text-[#666] text-sm">Sem habilidades catalogadas para esta arma.</p>
          )}
        </div>
      )}

      {tab === 'craft' && (
        <div className="space-y-6">
          {craftSections.length > 0 ? (
            <EntitySectionContent sections={craftSections} />
          ) : ancestral ? (
            <section className="rounded-xl border border-amber-500/25 bg-[#1a1408]/30 p-5 space-y-5">
              <p className="text-sm text-[#bbb]">{ancestralGuide.intro}</p>
              <div>
                <h3 className="font-gothic text-white mb-2">Forja Ancestral</h3>
                <ul className="text-sm text-[#aaa] space-y-1">
                  <li>
                    <strong className="text-white">Desbloqueio:</strong> {ancestralGuide.forge.unlock}
                  </li>
                  <li>
                    <strong className="text-white">Materiais da estação:</strong>{' '}
                    {ancestralGuide.forge.materials}
                  </li>
                  {ancestralGuide.forge.bonuses.map((b) => (
                    <li key={b}>· {b}</li>
                  ))}
                </ul>
              </div>
              {ancestralGuide.rarities.map((r) => (
                <div key={r.tier} className="border-t border-[#333] pt-4">
                  <p className="text-amber-300/90 text-sm font-medium mb-1">{r.tier}</p>
                  <p className="text-sm text-[#bbb]">{r.craft}</p>
                  <p className="text-xs text-[#777] mt-1">{r.shards}</p>
                </div>
              ))}
              <div>
                <p className="text-xs text-[#777] mb-2">{ancestralGuide.infusionNote}</p>
                <ul className="space-y-1">
                  {ancestralGuide.infusions.map((inf) => {
                    const theme = getSchoolTheme(inf.school);
                    return (
                      <li
                        key={inf.school}
                        className="flex justify-between text-sm border-b border-[#222] pb-1"
                      >
                        <span style={{ color: theme?.accent }}>{inf.schoolPt}</span>
                        <span className="text-[#999]">{inf.effect}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </section>
          ) : legendary ? (
            <section className="rounded-xl border border-amber-500/20 p-5">
              <p className="text-sm text-[#bbb]">{getLegendaryObtainNote()}</p>
            </section>
          ) : (
            <p className="text-[#666] text-sm">
              Dados de craft e atributos variáveis ainda não sincronizados para esta arma.
            </p>
          )}
          {entity.sections.filter((s) => !craftSections.includes(s)).length > 0 && (
            <EntitySectionContent
              sections={entity.sections.filter((s) => !craftSections.includes(s))}
            />
          )}
        </div>
      )}

      {entity.fandomUrl && (
        <footer className="mt-12 pt-6 border-t border-[#252525]">
          <a
            href={entity.fandomUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-[#c41e3a]"
          >
            Artigo na Fandom
            <ExternalLink size={14} />
          </a>
        </footer>
      )}
    </div>
  );
}

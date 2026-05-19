import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, ExternalLink, Sparkles, Sword } from 'lucide-react';
import AssetImage from '@/components/AssetImage';
import EntitySectionContent from '@/components/EntitySectionContent';
import WikiProse from '@/components/WikiProse';
import type { WikiEntity } from '@/data/entity-types';
import { WEAPON_TYPE_PT } from '@/data/entity-translations';
import { allEntities } from '@/lib/entities';
import { entityListPath } from '@/lib/entity-paths';
import { isLegendaryWeapon } from '@/lib/legendary-weapons';

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
  const [tab, setTab] = useState<Tab>('overview');

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
          {style && style.length > 10 && (
            <section className="rounded-xl border border-amber-500/20 bg-[#15120a]/80 p-5">
              <h2 className="font-gothic text-lg text-amber-200/90 mb-2">
                Efeito único
              </h2>
              <WikiProse text={style} />
            </section>
          )}
        </div>
      )}

      {tab === 'abilities' && (
        <div className="space-y-6">
          {legendary && style && (
            <section className="rounded-lg border border-[#333] p-5">
              <h2 className="font-gothic text-white mb-2">Habilidade do artefato</h2>
              <WikiProse text={style} />
            </section>
          )}
          {typeAbilities.length > 0 && (
            <section>
              <h2 className="font-gothic text-lg text-white mb-3">
                Habilidades do tipo {entity.weaponType}
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
          {typeAbilities.length === 0 && !style && (
            <p className="text-[#666] text-sm">Sem habilidades catalogadas para esta arma.</p>
          )}
        </div>
      )}

      {tab === 'craft' && (
        <div className="space-y-6">
          {craftSections.length > 0 ? (
            <EntitySectionContent sections={craftSections} />
          ) : (
            <p className="text-[#666] text-sm">
              Dados de craft e atributos variáveis ainda não sincronizados para esta arma.
            </p>
          )}
          {entity.sections
            .filter((s) => !craftSections.includes(s))
            .length > 0 && (
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


import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, ExternalLink, Skull, Swords } from 'lucide-react';
import EntitySectionContent from '@/components/EntitySectionContent';
import WikiProse from '@/components/WikiProse';
import BossPortrait from '@/components/detail/BossPortrait';
import BossRewardsPanel from '@/components/detail/BossRewardsPanel';
import BossMiniMap from '@/components/map/BossMiniMap';
import type { WikiEntity } from '@/data/entity-types';
import { REGION_PT } from '@/data/entity-translations';
import { assetUrl } from '@/lib/app-path';
import { entityListPath } from '@/lib/entity-paths';
import { getMarkersForBoss } from '@/lib/vardoran-map';
import { getSoulShardBossTheme } from '@/lib/soul-shard-bosses';
import PrismaticSoulShardHero from '@/components/detail/PrismaticSoulShardHero';

type Tab = 'overview' | 'rewards';

function hasRewardsTab(entity: WikiEntity): boolean {
  const r = entity.meta?.rewards;
  return Boolean(
    r?.spellPoint ||
      r?.dashUnlock ||
      r?.spells?.length ||
      r?.mainRewards?.length ||
      r?.recipes?.length ||
      r?.vampirePowers?.length ||
      entity.meta?.loot ||
      getSoulShardBossTheme(entity.id)
  );
}

function StandardBossHero({ entity }: { entity: WikiEntity }) {
  return (
    <div className="relative mb-10 rounded-2xl overflow-hidden border border-[#c41e3a]/30 min-h-[220px] md:min-h-[280px]">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={
          entity.image
            ? { backgroundImage: `url(${assetUrl(entity.image)})`, filter: 'contrast(1.1)' }
            : undefined
        }
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/85 to-transparent" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 20% 50%, rgba(196, 30, 58, 0.25) 0%, transparent 55%)',
        }}
      />
      <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row gap-6 items-end md:items-center">
        <BossPortrait entity={entity} size="lg" />
        <div>
          <p className="text-[#c41e3a] text-[11px] uppercase tracking-[0.25em] mb-2 flex items-center gap-2">
            <Skull size={14} />
            V Blood
          </p>
          <h1 className="font-gothic text-4xl md:text-5xl font-bold text-white tracking-wide">
            {entity.name}
          </h1>
          <div className="flex flex-wrap gap-3 mt-3 text-sm text-[#aaa]">
            {entity.level != null && <span>Nível {entity.level}</span>}
            {entity.act != null && <span>Ato {entity.act}</span>}
            {entity.region && (
              <span>{REGION_PT[entity.region] ?? entity.region}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BossDetailView({ entity }: { entity: WikiEntity }) {
  const meta = entity.meta;
  const soulShard = getSoulShardBossTheme(entity.id);
  const onMap = getMarkersForBoss(entity.id).length > 0;
  const showRewards = hasRewardsTab(entity);

  const [tab, setTab] = useState<Tab>('overview');

  const loreText = meta?.lore || entity.description;
  const hasFight = Boolean(meta?.fightGuide || meta?.phases?.length);

  return (
    <div className="container py-8 max-w-4xl">
      <Link
        href={entityListPath('boss')}
        className="inline-flex items-center gap-2 text-[#888] hover:text-[#c41e3a] mb-8 text-sm"
      >
        <ArrowLeft size={16} />
        V Bloods
      </Link>

      {soulShard ? (
        <PrismaticSoulShardHero entity={entity} theme={soulShard} onMap={onMap} />
      ) : (
        <StandardBossHero entity={entity} />
      )}

      <div className="flex gap-1 mb-8 border-b border-[#252525]">
        <button
          type="button"
          onClick={() => setTab('overview')}
          className={`px-4 py-2.5 text-sm border-b-2 -mb-px ${
            tab === 'overview'
              ? 'border-[#c41e3a] text-white'
              : 'border-transparent text-[#777] hover:text-[#ccc]'
          }`}
        >
          Como enfrentar
        </button>
        {showRewards && (
          <button
            type="button"
            onClick={() => setTab('rewards')}
            className={`px-4 py-2.5 text-sm border-b-2 -mb-px ${
              tab === 'rewards'
                ? 'border-[#c41e3a] text-white'
                : 'border-transparent text-[#777] hover:text-[#ccc]'
            }`}
          >
            Recompensas
          </button>
        )}
      </div>

      {tab === 'overview' && (
        <div className="space-y-8">
          {loreText && (
            <section>
              <h2 className="font-gothic text-lg text-[#c41e3a] mb-3">História</h2>
              <WikiProse text={loreText} />
            </section>
          )}

          {onMap && <BossMiniMap entity={entity} />}

          {hasFight ? (
            <>
              {meta?.fightGuide && (
                <section className="rounded-xl border border-[#333] bg-[#111]/60 p-6">
                  <h2 className="font-gothic text-lg text-white mb-3 flex items-center gap-2">
                    <Swords size={18} className="text-[#c41e3a]" />
                    Como enfrentar
                  </h2>
                  <WikiProse text={meta.fightGuide} />
                </section>
              )}
              {meta?.phases?.map((phase) => (
                <section
                  key={phase.title}
                  className="rounded-lg border border-[#2a2a2a] bg-[#0f0f0f]/80 p-5"
                >
                  <h3 className="font-gothic font-bold text-white mb-2">{phase.title}</h3>
                  <WikiProse text={phase.body} />
                </section>
              ))}
            </>
          ) : (
            <p className="text-[#666] text-sm">
              Dicas de combate ainda não foram extraídas para este chefe. Consulte o artigo na
              Fandom abaixo.
            </p>
          )}

          {entity.youtubeId && (
            <EntitySectionContent sections={[]} pageYoutubeId={entity.youtubeId} />
          )}
        </div>
      )}

      {tab === 'rewards' && showRewards && <BossRewardsPanel entity={entity} />}

      {entity.fandomUrl && (
        <footer className="mt-12 pt-6 border-t border-[#252525]">
          <a
            href={entity.fandomUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-[#c41e3a]"
          >
            Artigo completo na Fandom
            <ExternalLink size={14} />
          </a>
        </footer>
      )}
    </div>
  );
}

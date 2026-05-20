import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, ExternalLink, Gem } from 'lucide-react';
import AssetImage from '@/components/AssetImage';
import CraftRecipePanel from '@/components/detail/CraftRecipePanel';
import EntitySectionContent from '@/components/EntitySectionContent';
import PrismaticSoulShardHero from '@/components/detail/PrismaticSoulShardHero';
import WikiProse from '@/components/WikiProse';
import type { WikiEntity } from '@/data/entity-types';
import { entityDisplayName } from '@/lib/entity-locale';
import { useTranslation } from '@/contexts/LocaleContext';
import { entityListPath } from '@/lib/entity-paths';
import { getSoulShardBossTheme } from '@/lib/soul-shard-bosses';

type Tab = 'overview' | 'mechanics';

export default function JewelDetailView({ entity }: { entity: WikiEntity }) {
  const { locale } = useTranslation();
  const [tab, setTab] = useState<Tab>('overview');
  const soulShard = getSoulShardBossTheme(entity.id);
  const meta = entity.meta;

  return (
    <div className="container py-8 max-w-3xl">
      <Link
        href={entityListPath('jewel')}
        className="inline-flex items-center gap-2 text-[#888] hover:text-[#c41e3a] mb-8 text-sm"
      >
        <ArrowLeft size={16} />
        Joias
      </Link>

      {soulShard ? (
        <PrismaticSoulShardHero entity={entity} theme={soulShard} />
      ) : (
        <header className="flex gap-6 mb-8 pb-6 border-b border-[#252525]">
          <div className="w-20 h-20 shrink-0 rounded-lg bg-[#111] border border-amber-500/30 flex items-center justify-center p-2">
            {entity.image ? (
              <AssetImage src={entity.image} alt="" className="max-w-full max-h-full object-contain" />
            ) : (
              <Gem size={28} className="text-amber-500/60" />
            )}
          </div>
          <div>
            <p className="text-amber-400/90 text-xs uppercase tracking-widest mb-1">Soul Shard</p>
            <h1 className="font-gothic text-3xl font-bold">
              {entityDisplayName(entity, locale)}
            </h1>
          </div>
        </header>
      )}

      <div className="flex gap-1 mb-8 border-b border-[#252525]">
        {(['overview', 'mechanics'] as const).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`px-4 py-2.5 text-sm border-b-2 -mb-px ${
              tab === id ? 'border-[#c41e3a] text-white' : 'border-transparent text-[#777]'
            }`}
          >
            {id === 'overview' ? 'Visão geral' : 'Mecânicas'}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-6">
          {entity.description && (
            <section>
              <h2 className="font-gothic text-lg text-[#c41e3a] mb-3">Descrição</h2>
              <WikiProse text={entity.description} />
            </section>
          )}
          <EntitySectionContent
            sections={entity.sections}
            pageYoutubeId={entity.youtubeId}
          />
        </div>
      )}

      {tab === 'mechanics' && (
        <div className="space-y-6">
          {meta?.requirements && (
            <section>
              <h2 className="font-gothic text-lg text-white mb-3">Mecânicas do Soul Shard</h2>
              <WikiProse text={meta.requirements} />
            </section>
          )}
          {meta?.craftRecipe && <CraftRecipePanel recipe={meta.craftRecipe} />}
          {!meta?.requirements && !meta?.craftRecipe && (
            <p className="text-[#666] text-sm">Sem mecânicas catalogadas.</p>
          )}
        </div>
      )}

      {entity.fandomUrl && (
        <footer className="mt-10">
          <a
            href={entity.fandomUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#c41e3a] inline-flex gap-2 items-center"
          >
            Fandom <ExternalLink size={14} />
          </a>
        </footer>
      )}
    </div>
  );
}

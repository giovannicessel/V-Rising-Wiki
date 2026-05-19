import { useState } from 'react';
import { Link, useRoute } from 'wouter';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import AssetImage from '@/components/AssetImage';
import EntitySectionContent from '@/components/EntitySectionContent';
import WikiProse from '@/components/WikiProse';
import type { EntityType } from '@/data/entity-types';
import { ENTITY_TYPE_PLURAL } from '@/data/entity-types';
import { entityDetailRoute, entityListPath } from '@/lib/entity-paths';
import { getEntityBySlug } from '@/lib/entities';
import NotFound from '@/pages/NotFound';

export default function EntityDetailPageDefault({ type }: { type: EntityType }) {
  const [, params] = useRoute(entityDetailRoute(type));
  const slug = (params as { slug?: string } | null)?.slug ?? '';
  const entity = getEntityBySlug(type, slug);
  const [tab, setTab] = useState<'overview' | 'extra'>('overview');

  if (!entity) return <NotFound />;

  return (
    <div className="container py-8 max-w-3xl">
      <Link
        href={entityListPath(type)}
        className="inline-flex items-center gap-2 text-[#888] hover:text-[#c41e3a] mb-8 text-sm"
      >
        <ArrowLeft size={16} />
        {ENTITY_TYPE_PLURAL[type]}
      </Link>
      <header className="flex gap-6 mb-8">
        {entity.image && (
          <AssetImage src={entity.image} alt="" className="w-24 h-24 object-contain" />
        )}
        <h1 className="font-gothic text-3xl font-bold">{entity.name}</h1>
      </header>
      <div className="flex gap-2 mb-6 border-b border-[#252525]">
        <button
          type="button"
          onClick={() => setTab('overview')}
          className={tab === 'overview' ? 'text-white border-b-2 border-[#c41e3a] px-3 py-2' : 'text-[#777] px-3 py-2'}
        >
          Visão geral
        </button>
        <button
          type="button"
          onClick={() => setTab('extra')}
          className={tab === 'extra' ? 'text-white border-b-2 border-[#c41e3a] px-3 py-2' : 'text-[#777] px-3 py-2'}
        >
          Extras
        </button>
      </div>
      {tab === 'overview' && entity.description && <WikiProse text={entity.description} />}
      {tab === 'extra' && (
        <EntitySectionContent sections={entity.sections} pageYoutubeId={entity.youtubeId} />
      )}
      {entity.fandomUrl && (
        <a href={entity.fandomUrl} target="_blank" rel="noopener noreferrer" className="text-[#c41e3a] text-sm mt-8 inline-flex gap-2">
          Fandom <ExternalLink size={14} />
        </a>
      )}
    </div>
  );
}

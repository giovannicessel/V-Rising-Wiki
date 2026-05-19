import { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import AssetImage from '@/components/AssetImage';
import WikiProse from '@/components/WikiProse';
import type { WikiEntity } from '@/data/entity-types';
import { entityListPath } from '@/lib/entity-paths';

type Tab = 'overview' | 'craft';

export default function ItemDetailView({ entity }: { entity: WikiEntity }) {
  const [tab, setTab] = useState<Tab>('overview');
  const meta = entity.meta;

  return (
    <div className="container py-8 max-w-3xl">
      <Link
        href={entityListPath('item')}
        className="inline-flex items-center gap-2 text-[#888] hover:text-[#c41e3a] mb-8 text-sm"
      >
        <ArrowLeft size={16} />
        Itens
      </Link>

      <header className="flex gap-6 mb-8 pb-6 border-b border-[#252525]">
        <div className="w-20 h-20 shrink-0 rounded-lg bg-[#111] border border-[#2a2a2a] flex items-center justify-center p-2">
          {entity.image && (
            <AssetImage src={entity.image} alt="" className="max-w-full max-h-full object-contain" />
          )}
        </div>
        <div>
          <p className="text-[#888] text-xs uppercase tracking-widest mb-1">Item</p>
          <h1 className="font-gothic text-3xl font-bold">{entity.name}</h1>
        </div>
      </header>

      <div className="flex gap-1 mb-8 border-b border-[#252525]">
        {(['overview', 'craft'] as const).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`px-4 py-2.5 text-sm border-b-2 -mb-px ${
              tab === id ? 'border-[#c41e3a] text-white' : 'border-transparent text-[#777]'
            }`}
          >
            {id === 'overview' ? 'Visão geral' : 'Craft & obtenção'}
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
          {meta?.requirements && (
            <section>
              <h2 className="font-gothic text-lg text-white mb-2">Requisitos</h2>
              <WikiProse text={meta.requirements} />
            </section>
          )}
        </div>
      )}

      {tab === 'craft' && (
        <div className="space-y-6">
          {meta?.crafts && (
            <section>
              <h2 className="font-gothic text-lg text-[#c41e3a] mb-3">Receitas / craft</h2>
              <WikiProse text={meta.crafts} />
            </section>
          )}
          {meta?.drops && (
            <section>
              <h2 className="font-gothic text-lg text-[#c41e3a] mb-3">Onde obter / drops</h2>
              <WikiProse text={meta.drops} />
            </section>
          )}
          {!meta?.crafts && !meta?.drops && (
            <p className="text-[#666] text-sm">Sem dados de craft na wiki curada.</p>
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

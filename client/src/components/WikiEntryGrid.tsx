import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { ExternalLink, Search } from 'lucide-react';
import type { WikiEntry } from '@/data/wiki-types';
import {
  WIKI_CATEGORY_LABELS,
  DESCRIPTION_SOURCE_LABELS,
} from '@/data/wiki-types';
import { allEntities } from '@/lib/entities';
import { entityDetailPath } from '@/lib/entity-paths';

interface WikiEntryGridProps {
  title: string;
  entries: WikiEntry[];
  showSearch?: boolean;
}

function SourceBadge({ source }: { source?: WikiEntry['descriptionSource'] }) {
  if (!source) return null;
  const label = DESCRIPTION_SOURCE_LABELS[source];
  const colors = {
    game: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/50',
    fandom: 'bg-amber-900/30 text-amber-200 border-amber-700/40',
    manual: 'bg-[#2a2a2a] text-[#888] border-[#444]',
  };
  return (
    <span
      className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${colors[source]}`}
    >
      {label}
    </span>
  );
}

export default function WikiEntryGrid({
  title,
  entries,
  showSearch = true,
}: WikiEntryGridProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.nameEn?.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        e.gameAssetName?.toLowerCase().includes(q)
    );
  }, [entries, query]);

  if (entries.length === 0) return null;

  return (
    <section className="mt-16 pt-12 border-t border-[#4a4a4a]/50">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-1 h-10 bg-gradient-to-b from-[#c41e3a] to-transparent" />
          <div>
            <h2 className="font-gothic text-2xl font-bold text-white tracking-wide">
              {title}
            </h2>
            <p className="text-[#6a6a6a] text-sm mt-1">
              {filtered.length} de {entries.length} ·{' '}
              <Link href="/v-bloods" className="text-[#c41e3a] hover:underline">
                páginas individuais
              </Link>
            </p>
          </div>
        </div>

        {showSearch && (
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6a6a6a]" />
            <input
              type="search"
              placeholder="Buscar no catálogo..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#0f0f0f] border border-[#4a4a4a] rounded text-white text-sm placeholder:text-[#555] focus:border-[#c41e3a] focus:outline-none"
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {filtered.map((entry, index) => {
          const entity = allEntities.find(
            (e) => e.id === entry.id || e.slug === entry.slug
          );

          const card = (
            <article
              className="gothic-card overflow-hidden group fade-in-up flex flex-col sm:flex-row gap-0 sm:gap-4 p-0 h-full"
              style={{ animationDelay: `${Math.min(index, 12) * 60}ms` }}
            >
              <div className="relative w-full sm:w-36 h-36 shrink-0 bg-[#0f0f0f] overflow-hidden flex items-center justify-center">
                {entry.image ? (
                  <img
                    src={entry.image}
                    alt={entry.name}
                    className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-[#444] text-xs">Sem imagem</span>
                )}
                {entry.level != null && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 text-xs font-gothic bg-[#c41e3a]/90 text-white rounded z-10">
                    Nv. {entry.level}
                  </span>
                )}
              </div>

              <div className="p-5 flex flex-col flex-1 min-w-0">
                <h3 className="font-gothic text-lg font-bold text-white group-hover:text-[#c41e3a] transition-colors mb-2">
                  {entry.name}
                </h3>
                <SourceBadge source={entry.descriptionSource} />
                <p className="text-[#b0b0b0] text-sm leading-relaxed flex-1 line-clamp-5 mt-3">
                  {entry.description || 'Sem descrição — ver página na Fandom.'}
                </p>
                <p className="text-xs text-[#c41e3a] mt-3">Ver página →</p>
              </div>
            </article>
          );

          if (entity) {
            return (
              <Link
                key={entry.id}
                href={entityDetailPath(entity.type, entity.slug)}
                className="block"
              >
                {card}
              </Link>
            );
          }
          return <div key={entry.id}>{card}</div>;
        })}
      </div>
    </section>
  );
}

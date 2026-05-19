import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { Search } from 'lucide-react';
import AssetImage from '@/components/AssetImage';
import WikiPageShell from '@/components/WikiPageShell';
import { ENTITY_TYPE_LABELS } from '@/data/entity-types';
import { globalSearch } from '@/lib/entities';
import { entityDetailPath } from '@/lib/entity-paths';
import { searchWikiEntries } from '@/data/wiki-entries';
import { WIKI_CATEGORY_LABELS } from '@/data/wiki-types';

export default function GlobalSearchPage() {
  const [query, setQuery] = useState('');

  const entityResults = useMemo(
    () => (query.trim() ? globalSearch(query, 30) : []),
    [query]
  );
  const catalogResults = useMemo(
    () => (query.trim() ? searchWikiEntries(query, { limit: 20 }) : []),
    [query]
  );

  return (
    <WikiPageShell>
      <div className="container py-10 max-w-3xl">
        <h1 className="font-gothic text-4xl font-bold mb-6">Busca global</h1>

        <div className="relative mb-10">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666]" />
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Boss, feitiço, item, arma…"
            className="w-full pl-12 pr-4 py-4 bg-[#111] border border-[#2a2a2a] rounded-lg text-lg focus:border-[#c41e3a]/60 focus:outline-none"
          />
        </div>

        {!query.trim() && (
          <p className="text-[#666] text-sm">Digite para buscar nas páginas curadas.</p>
        )}

        {query.trim() && (
          <>
            <section className="mb-10">
              <h2 className="font-gothic text-lg mb-4 text-[#c41e3a]">
                Páginas ({entityResults.length})
              </h2>
              {entityResults.length === 0 ? (
                <p className="text-[#666] text-sm">Nenhuma página.</p>
              ) : (
                <ul className="space-y-2">
                  {entityResults.map((e) => (
                    <li key={`${e.type}-${e.id}`}>
                      <Link
                        href={entityDetailPath(e.type, e.slug)}
                        className="block rounded-lg border border-[#252525] bg-[#111]/80 px-4 py-3 hover:border-[#c41e3a]/40"
                      >
                        <span className="text-[10px] uppercase text-[#c41e3a]">
                          {ENTITY_TYPE_LABELS[e.type]}
                        </span>
                        <p className="font-gothic font-bold">{e.name}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h2 className="font-gothic text-lg mb-4 text-[#666]">
                Catálogo ({catalogResults.length})
              </h2>
              {catalogResults.length === 0 ? (
                <p className="text-[#666] text-sm">Nenhum item.</p>
              ) : (
                <ul className="space-y-2">
                  {catalogResults.map((e) => (
                    <li
                      key={e.id}
                      className="rounded-lg border border-[#252525] px-4 py-3 flex gap-3 items-center"
                    >
                      {e.image && (
                        <AssetImage src={e.image} alt="" className="w-10 h-10 object-contain" />
                      )}
                      <div>
                        <span className="text-[10px] uppercase text-[#555]">
                          {WIKI_CATEGORY_LABELS[e.category]}
                        </span>
                        <p className="font-medium">{e.name}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </WikiPageShell>
  );
}

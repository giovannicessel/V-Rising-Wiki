import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { Search } from 'lucide-react';
import AssetImage from '@/components/AssetImage';
import WikiPageShell from '@/components/WikiPageShell';
import { useTranslation } from '@/contexts/LocaleContext';
import { entityDisplayName, entityTypeLabel } from '@/lib/entity-locale';
import { globalSearch } from '@/lib/entities';
import { entityDetailPath } from '@/lib/entity-paths';
import { searchWikiEntries } from '@/data/wiki-entries';
import { WIKI_CATEGORY_LABELS } from '@/data/wiki-types';

export default function GlobalSearchPage() {
  const { t, locale } = useTranslation();
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
        <h1 className="font-gothic text-4xl font-bold mb-6">{t('search.title')}</h1>

        <div className="relative mb-10">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#666]" />
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.placeholder')}
            className="w-full pl-12 pr-4 py-4 bg-[#111] border border-[#2a2a2a] rounded-lg text-lg focus:border-[#c41e3a]/60 focus:outline-none"
          />
        </div>

        {!query.trim() && (
          <p className="text-[#666] text-sm">{t('search.hint')}</p>
        )}

        {query.trim() && (
          <>
            <section className="mb-10">
              <h2 className="font-gothic text-lg mb-4 text-[#c41e3a]">
                {t('search.pages', { count: entityResults.length })}
              </h2>
              {entityResults.length === 0 ? (
                <p className="text-[#666] text-sm">{t('search.pagesEmpty')}</p>
              ) : (
                <ul className="space-y-2">
                  {entityResults.map((e) => (
                    <li key={`${e.type}-${e.id}`}>
                      <Link
                        href={entityDetailPath(e.type, e.slug)}
                        className="block rounded-lg border border-[#252525] bg-[#111]/80 px-4 py-3 hover:border-[#c41e3a]/40"
                      >
                        <span className="text-[10px] uppercase text-[#c41e3a]">
                          {entityTypeLabel(e.type, locale)}
                        </span>
                        <p className="font-gothic font-bold">
                          {entityDisplayName(e, locale)}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h2 className="font-gothic text-lg mb-4 text-[#666]">
                {t('search.catalog', { count: catalogResults.length })}
              </h2>
              {catalogResults.length === 0 ? (
                <p className="text-[#666] text-sm">{t('search.catalogEmpty')}</p>
              ) : (
                <ul className="space-y-2">
                  {catalogResults.map((e) => (
                    <li
                      key={e.id}
                      className="rounded-lg border border-[#252525] bg-[#111]/60 px-4 py-3"
                    >
                      <span className="text-[10px] uppercase text-[#666]">
                        {WIKI_CATEGORY_LABELS[e.category]}
                      </span>
                      <p className="font-gothic font-bold">{e.name}</p>
                      {e.image && (
                        <AssetImage
                          src={e.image}
                          alt=""
                          className="w-8 h-8 object-contain mt-2 opacity-70"
                        />
                      )}
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

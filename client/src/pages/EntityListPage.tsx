import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import AssetImage from '@/components/AssetImage';
import EntityCard from '@/components/EntityCard';
import EntityFiltersBar from '@/components/EntityFiltersBar';
import WikiPageShell from '@/components/WikiPageShell';
import type { EntityType, WikiEntity } from '@/data/entity-types';
import { useTranslation } from '@/contexts/LocaleContext';
import { entityTypePlural, schoolLabel } from '@/lib/entity-locale';
import {
  filterEntities,
  getEntitiesByType,
  searchEntities,
  type EntityFilters,
} from '@/lib/entities';
import { SCHOOL_ORDER, getSchoolTheme } from '@/lib/school-theme';
import { entityDetailPath } from '@/lib/entity-paths';
import { getWeaponsListIntro } from '@/lib/weapon-guide';
import { Link } from 'wouter';

interface EntityListPageProps {
  type: EntityType;
}

function groupWeapons(list: WikiEntity[]) {
  const groups = new Map<string, WikiEntity[]>();
  for (const w of list) {
    const key = w.weaponType || w.name.split(' ')[0] || 'Outros';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(w);
  }
  return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
}

export default function EntityListPage({ type }: EntityListPageProps) {
  const { t, locale } = useTranslation();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<EntityFilters>({});
  const all = getEntitiesByType(type);

  const filtered = useMemo(() => {
    let list = filterEntities(type, filters);
    if (query.trim()) {
      const ids = new Set(searchEntities(type, query, 500).map((e) => e.id));
      list = list.filter((e) => ids.has(e.id));
    }
    return list;
  }, [type, query, filters, all]);

  const spellsBySchool = useMemo(() => {
    if (type !== 'spell') return null;
    const map = new Map<string, WikiEntity[]>();
    for (const s of SCHOOL_ORDER) map.set(s, []);
    for (const e of filtered) {
      const school = e.school || 'Outros';
      if (!map.has(school)) map.set(school, []);
      map.get(school)!.push(e);
    }
    return map;
  }, [type, filtered]);

  const weaponGroups = useMemo(
    () => (type === 'weapon' ? groupWeapons(filtered) : []),
    [type, filtered]
  );

  return (
    <WikiPageShell subtle>
      <div className="container py-10">
        <header className="mb-8 max-w-xl">
          <h1 className="font-gothic text-4xl font-bold tracking-wide mb-3">
            {entityTypePlural(type, locale)}
          </h1>
          <p className="text-[#888] text-sm">
            {t('entity.entries', { count: filtered.length })}
          </p>
          {type === 'weapon' && (
            <>
              <p className="text-sm text-[#999] mt-3 max-w-2xl leading-relaxed">
                {getWeaponsListIntro()}
              </p>
              <Link
                href="/weapons/legendary"
                className="inline-block mt-3 text-sm text-amber-400/90 hover:text-amber-300 hover:underline"
              >
                {t('entity.legendaryLink')}
              </Link>
            </>
          )}
        </header>

        <div className="relative max-w-md mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('entity.filter.search')}
            className="w-full pl-10 pr-4 py-2.5 bg-[#111]/90 border border-[#2a2a2a] rounded-lg text-white text-sm focus:border-[#c41e3a]/60 focus:outline-none"
          />
        </div>

        <EntityFiltersBar type={type} filters={filters} onChange={setFilters} />

        {type === 'spell' && spellsBySchool && (
          <div className="space-y-10 mt-8">
            {SCHOOL_ORDER.map((school) => {
              const list = spellsBySchool.get(school) ?? [];
              if (!list.length) return null;
              const theme = getSchoolTheme(school);
              return (
                <section key={school}>
                  <h2
                    className={`font-gothic text-2xl font-bold mb-4 pb-2 border-b-2 ${theme?.border ?? 'border-[#333]'}`}
                    style={{ color: theme?.accent }}
                  >
                    {schoolLabel(school, locale)}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {list.map((entity, i) => (
                      <div
                        key={entity.id}
                        className={`rounded-xl border-2 ${theme?.border} ${theme?.bg} overflow-hidden`}
                      >
                        <EntityCard entity={entity} index={i} />
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}

        {type === 'weapon' && (
          <div className="space-y-10 mt-8">
            {weaponGroups.map(([group, list]) => (
              <section key={group}>
                <h2 className="font-gothic text-2xl font-bold mb-4 text-[#c41e3a] border-b border-[#333] pb-2">
                  {group}
                </h2>
                <div className="overflow-x-auto rounded-xl border border-[#2a2a2a]">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-[#111] text-[#888] uppercase text-[10px]">
                      <tr>
                        <th className="p-3">Habilidade</th>
                        <th className="p-3 hidden sm:table-cell">Descrição</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.map((w: WikiEntity) => (
                        <tr key={w.id} className="border-t border-[#222] hover:bg-[#151515]">
                          <td className="p-3">
                            <Link
                              href={entityDetailPath('weapon', w.slug)}
                              className="flex items-center gap-3"
                            >
                              {w.image && (
                                <AssetImage src={w.image} alt="" className="w-10 h-10 object-contain" />
                              )}
                              <span className="text-white font-medium">{w.name}</span>
                            </Link>
                          </td>
                          <td className="p-3 text-[#888] hidden sm:table-cell line-clamp-2">
                            {w.description || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}
          </div>
        )}

        {type !== 'spell' && type !== 'weapon' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">
            {filtered.map((entity, i) => (
              <EntityCard key={entity.id} entity={entity} index={i} />
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <p className="text-center text-[#555] py-16 text-sm">Nenhum resultado.</p>
        )}
      </div>
    </WikiPageShell>
  );
}

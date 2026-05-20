import type { EntityFilters } from '@/lib/entities';
import { getFilterOptions } from '@/lib/entities';
import type { EntityType } from '@/data/entity-types';
import { useTranslation } from '@/contexts/LocaleContext';
import { regionLabel, schoolLabel } from '@/lib/entity-locale';

interface EntityFiltersBarProps {
  type: EntityType;
  filters: EntityFilters;
  onChange: (f: EntityFilters) => void;
}

export default function EntityFiltersBar({
  type,
  filters,
  onChange,
}: EntityFiltersBarProps) {
  const { t, locale } = useTranslation();
  const opts = getFilterOptions(type);

  const selectClass =
    'bg-[#0f0f0f] border border-[#4a4a4a] rounded px-3 py-2 text-sm text-white focus:border-[#c41e3a] focus:outline-none';

  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {opts.schools.length > 0 && (
        <select
          className={selectClass}
          value={filters.school ?? ''}
          onChange={(e) =>
            onChange({ ...filters, school: e.target.value || undefined })
          }
        >
          <option value="">{t('filter.allSchools')}</option>
          {opts.schools.map((s) => (
            <option key={s} value={s}>
              {schoolLabel(s, locale) ?? s}
            </option>
          ))}
        </select>
      )}

      {opts.regions.length > 0 && (
        <select
          className={selectClass}
          value={filters.region ?? ''}
          onChange={(e) =>
            onChange({ ...filters, region: e.target.value || undefined })
          }
        >
          <option value="">{t('filter.allRegions')}</option>
          {opts.regions.map((r) => (
            <option key={r} value={r}>
              {regionLabel(r, locale) ?? r}
            </option>
          ))}
        </select>
      )}

      {opts.acts.length > 0 && (
        <select
          className={selectClass}
          value={filters.act ?? ''}
          onChange={(e) =>
            onChange({
              ...filters,
              act: e.target.value ? Number(e.target.value) : undefined,
            })
          }
        >
          <option value="">{t('filter.allActs')}</option>
          {opts.acts.map((a) => (
            <option key={a} value={a}>
              {t('filter.act', { act: a })}
            </option>
          ))}
        </select>
      )}

      {opts.weaponTypes.length > 0 && type === 'weapon' && (
        <select
          className={selectClass}
          value={filters.weaponType ?? ''}
          onChange={(e) =>
            onChange({ ...filters, weaponType: e.target.value || undefined })
          }
        >
          <option value="">{t('filter.allTypes')}</option>
          {opts.weaponTypes.map((w) => (
            <option key={w} value={w}>
              {w}
            </option>
          ))}
        </select>
      )}

      {(filters.school || filters.region || filters.act || filters.weaponType) && (
        <button
          type="button"
          onClick={() => onChange({})}
          className="px-3 py-2 text-sm text-[#c41e3a] border border-[#c41e3a]/40 rounded hover:bg-[#c41e3a]/10"
        >
          {t('filter.clear')}
        </button>
      )}
    </div>
  );
}

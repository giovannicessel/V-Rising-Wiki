import { Link, useSearch } from 'wouter';
import { Map } from 'lucide-react';
import WikiPageShell from '@/components/WikiPageShell';
import VardoranMap from '@/components/map/VardoranMap';
import { useTranslation } from '@/contexts/LocaleContext';

export default function MapPage() {
  const { t } = useTranslation();
  const search = useSearch();
  const highlightBossId = new URLSearchParams(
    search.startsWith('?') ? search : `?${search}`
  ).get('boss') ?? undefined;
  return (
    <WikiPageShell>
      <div className="container py-10 max-w-5xl">
        <header className="mb-8">
          <p className="text-[#c41e3a] text-xs uppercase tracking-[0.25em] mb-2 flex items-center gap-2">
            <Map size={14} />
            Vardoran
          </p>
          <h1 className="font-gothic text-4xl md:text-5xl font-bold text-white tracking-wide">
            {t('map.pageTitle')}
          </h1>
          <p className="text-[#888] mt-3 max-w-2xl">
            {t('map.pageSubtitle')}{' '}
            <a
              href="https://vrising.fandom.com/wiki/Map:Vardoran"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#c41e3a] hover:underline"
            >
              Fandom
            </a>
            .
          </p>
        </header>

        <VardoranMap highlightBossId={highlightBossId} />

        <p className="text-center text-[#555] text-sm mt-8">
          <Link href="/v-bloods" className="text-[#c41e3a] hover:underline">
            {t('map.viewBossList')}
          </Link>
          {' · '}
          <Link href="/lore" className="text-[#c41e3a] hover:underline">
            {t('map.viewLore')}
          </Link>
        </p>
      </div>
    </WikiPageShell>
  );
}

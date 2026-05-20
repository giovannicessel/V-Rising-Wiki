import { useRoute } from 'wouter';
import BossDetailView from '@/components/detail/BossDetailView';
import SpellDetailView from '@/components/detail/SpellDetailView';
import ItemDetailView from '@/components/detail/ItemDetailView';
import WeaponDetailView from '@/components/detail/WeaponDetailView';
import WikiPageShell from '@/components/WikiPageShell';
import type { EntityType } from '@/data/entity-types';
import { entityDetailRoute } from '@/lib/entity-paths';
import { getEntityBySlug } from '@/lib/entities';
import JewelDetailView from '@/components/detail/JewelDetailView';
import EntityDetailPageDefault from '@/pages/EntityDetailPageDefault';
import NotFound from '@/pages/NotFound';

interface EntityDetailPageProps {
  type: EntityType;
}

/** Fallback genérico para jewel, building */
function GenericDetail({ type }: { type: EntityType }) {
  return <EntityDetailPageDefault type={type} />;
}

export default function EntityDetailPage({ type }: EntityDetailPageProps) {
  const [, params] = useRoute(entityDetailRoute(type));
  const slug = (params as { slug?: string } | null)?.slug ?? '';
  const entity = getEntityBySlug(type, slug);

  if (!entity) return <NotFound />;

  return (
    <WikiPageShell subtle>
      {type === 'boss' && <BossDetailView entity={entity} />}
      {type === 'spell' && <SpellDetailView entity={entity} />}
      {type === 'item' && <ItemDetailView entity={entity} />}
      {type === 'weapon' && <WeaponDetailView entity={entity} />}
      {type === 'jewel' && <JewelDetailView entity={entity} />}
      {type === 'building' && <GenericDetail type={type} />}
    </WikiPageShell>
  );
}

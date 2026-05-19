import { Link } from 'wouter';
import { MAP_IMAGE_SRC, getMarkersForBoss } from '@/lib/vardoran-map';
import { entityDetailPath } from '@/lib/entity-paths';
import type { WikiEntity } from '@/data/entity-types';

interface BossMiniMapProps {
  entity: WikiEntity;
}

export default function BossMiniMap({ entity }: BossMiniMapProps) {
  const markers = getMarkersForBoss(entity.id);
  const marker = markers[0];

  if (!marker) return null;

  return (
    <section className="rounded-xl border border-[#2a2a2a] bg-[#0a0a0a] overflow-hidden">
      <div className="px-4 py-3 border-b border-[#252525] flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-gothic text-sm text-white uppercase tracking-wider">
          Localização em Vardoran
        </h2>
        <Link
          href={`/map?boss=${encodeURIComponent(entity.id)}`}
          className="text-xs text-[#c41e3a] hover:underline"
        >
          Abrir mapa completo
        </Link>
      </div>
      <div className="relative aspect-[4/3] max-h-[280px] overflow-hidden bg-[#050505]">
        <img
          src={MAP_IMAGE_SRC}
          alt="Mapa de Vardoran"
          className="w-full h-full object-cover opacity-90"
        />
        {markers.map((m) => (
          <span
            key={m.id}
            className="absolute z-10 w-3 h-3 -translate-x-1/2 translate-y-1/2 rounded-full bg-[#fa005a] border-2 border-white shadow-[0_0_10px_rgba(250,0,90,0.9)]"
            style={{ left: `${m.x}%`, bottom: `${m.y}%` }}
            title={m.title}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 p-3 text-xs text-[#bbb]">
          {entity.location && <p className="mb-1">{entity.location}</p>}
          <p className="text-[#666]">
            Pin{markers.length > 1 ? 's' : ''} do chefe no mapa
            {marker.level != null ? ` · Nv. ${marker.level}` : ''}
          </p>
        </div>
      </div>
    </section>
  );
}


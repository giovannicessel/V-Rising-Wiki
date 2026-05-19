import { useMemo, useRef, useState } from 'react';
import { Link } from 'wouter';
import { Crown, MapPin, ZoomIn, ZoomOut } from 'lucide-react';
import {
  MAP_IMAGE_SRC,
  getMapMarkers,
  resolveBossFromMarker,
  type MapMarker,
} from '@/lib/vardoran-map';
import { entityDetailPath } from '@/lib/entity-paths';

interface VardoranMapProps {
  highlightBossId?: string;
  className?: string;
}

export default function VardoranMap({ highlightBossId, className = '' }: VardoranMapProps) {
  const markers = useMemo(() => getMapMarkers(), []);
  const [selected, setSelected] = useState<MapMarker | null>(null);
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedBoss = selected ? resolveBossFromMarker(selected) : undefined;

  const zoom = (delta: number) => {
    setScale((s) => Math.min(2.5, Math.max(0.6, Math.round((s + delta) * 10) / 10)));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[#888] flex items-center gap-2">
          <MapPin size={14} className="text-[#c41e3a]" />
          {markers.length} V Bloods · clique no pin para detalhes
        </p>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => zoom(-0.2)}
            className="p-2 rounded border border-[#333] text-[#aaa] hover:text-white hover:border-[#c41e3a]/50"
            aria-label="Diminuir zoom"
          >
            <ZoomOut size={16} />
          </button>
          <button
            type="button"
            onClick={() => zoom(0.2)}
            className="p-2 rounded border border-[#333] text-[#aaa] hover:text-white hover:border-[#c41e3a]/50"
            aria-label="Aumentar zoom"
          >
            <ZoomIn size={16} />
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative overflow-auto rounded-xl border border-[#c41e3a]/25 bg-[#0a0a0a] max-h-[min(72vh,720px)] shadow-[inset_0_0_60px_rgba(0,0,0,0.8)]"
      >
        <div
          className="relative origin-top-left transition-transform duration-200"
          style={{ transform: `scale(${scale})`, width: `${100 / scale}%` }}
        >
          <img
            src={MAP_IMAGE_SRC}
            alt="Mapa de Vardoran"
            className="w-full h-auto block select-none"
            draggable={false}
          />
          {markers.map((m) => {
            const active =
              selected?.id === m.id ||
              (highlightBossId && m.bossId === highlightBossId);
            return (
              <button
                key={m.id}
                type="button"
                title={m.title}
                onClick={() => setSelected(m)}
                className={`absolute z-10 -translate-x-1/2 translate-y-1/2 w-3 h-3 md:w-3.5 md:h-3.5 rounded-full border-2 transition-all ${
                  active
                    ? 'bg-[#c41e3a] border-white scale-150 shadow-[0_0_12px_rgba(196,30,58,0.9)]'
                    : 'bg-[#fa005a] border-[#1a1a1a] hover:scale-125 hover:border-white/80'
                }`}
                style={{ left: `${m.x}%`, bottom: `${m.y}%` }}
              />
            );
          })}
        </div>
      </div>

      {selected && (
        <div className="rounded-xl border border-[#333] bg-[#111]/90 p-4 flex flex-col sm:flex-row gap-4 items-start">
          {selectedBoss?.image && (
            <img
              src={selectedBoss.image}
              alt=""
              className="w-16 h-16 object-contain shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-[#c41e3a] mb-1 flex items-center gap-1">
              <Crown size={12} />
              V Blood
              {selected.level != null && (
                <span className="text-[#666] ml-2">Nível {selected.level}</span>
              )}
            </p>
            <h3 className="font-gothic text-xl text-white font-bold truncate">
              {selectedBoss?.name ?? selected.title}
            </h3>
            {selectedBoss?.region && (
              <p className="text-sm text-[#888] mt-1">{selectedBoss.region}</p>
            )}
            <div className="flex flex-wrap gap-3 mt-3">
              {selectedBoss && (
                <Link
                  href={entityDetailPath('boss', selectedBoss.slug)}
                  className="text-sm px-4 py-2 rounded bg-[#c41e3a] hover:bg-[#a01729] text-white"
                >
                  Ver chefe
                </Link>
              )}
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-sm px-3 py-2 text-[#888] hover:text-white"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { Link } from 'wouter';
import { Gem, MapPin, Skull } from 'lucide-react';
import type { WikiEntity } from '@/data/entity-types';
import { REGION_PT } from '@/data/entity-translations';
import { entityDetailPath } from '@/lib/entity-paths';
import type { SoulShardBossTheme } from '@/lib/soul-shard-bosses';

interface PrismaticSoulShardHeroProps {
  entity: WikiEntity;
  theme: SoulShardBossTheme;
  onMap?: boolean;
}

export default function PrismaticSoulShardHero({
  entity,
  theme,
  onMap,
}: PrismaticSoulShardHeroProps) {
  return (
    <div
      className={`prismatic-hero relative mb-10 rounded-2xl overflow-hidden border-2 ${theme.borderClass} min-h-[240px] md:min-h-[300px]`}
      style={
        {
          '--shard-accent': theme.accent,
          '--shard-rgb': theme.accentRgb,
        } as React.CSSProperties
      }
    >
      <div className="prismatic-hero__band prismatic-hero__band--1 pointer-events-none" aria-hidden />
      <div className="prismatic-hero__band prismatic-hero__band--2 pointer-events-none" aria-hidden />
      <div className="prismatic-hero__band prismatic-hero__band--3 pointer-events-none" aria-hidden />
      <div className="prismatic-hero__noise pointer-events-none" aria-hidden />

      <div
        className="absolute inset-0 bg-cover bg-center opacity-35 mix-blend-luminosity"
        style={
          entity.image
            ? { backgroundImage: `url(${entity.image})`, filter: 'contrast(1.15) saturate(0.7)' }
            : undefined
        }
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/95 via-[#0a0a0a]/75 to-[#0a0a0a]/40" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 25% 55%, rgba(${theme.accentRgb}, 0.22) 0%, transparent 58%)`,
        }}
      />

      <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row gap-6 items-end md:items-center">
        {entity.image && (
          <div className="relative shrink-0">
            <div
              className="absolute -inset-3 rounded-full opacity-60 blur-xl prismatic-hero__portrait-glow"
              style={{ background: `rgba(${theme.accentRgb}, 0.45)` }}
            />
            <img
              src={entity.image}
              alt={entity.name}
              className="relative w-32 h-32 md:w-44 md:h-44 object-contain"
              style={{
                filter: `drop-shadow(0 0 28px rgba(${theme.accentRgb}, 0.65))`,
              }}
            />
          </div>
        )}
        <div className="min-w-0">
          <p
            className="text-[11px] uppercase tracking-[0.28em] mb-2 flex flex-wrap items-center gap-2"
            style={{ color: theme.accent }}
          >
            <Gem size={14} />
            V Blood lendário · {theme.schoolLabel}
          </p>
          <p className="text-[10px] uppercase tracking-widest text-[#888] mb-2 flex items-center gap-2">
            <Skull size={12} />
            Portador de Soul Shard
          </p>
          <h1 className="font-gothic text-4xl md:text-5xl font-bold text-white tracking-wide">
            {entity.name}
          </h1>
          <Link
            href={entityDetailPath('jewel', theme.jewelSlug)}
            className="inline-flex items-center gap-1.5 mt-2 text-sm hover:underline"
            style={{ color: theme.accent }}
          >
            <Gem size={13} />
            {theme.jewelNamePt}
          </Link>
          <div className="flex flex-wrap gap-3 mt-3 text-sm text-[#aaa]">
            {entity.level != null && <span>Nível {entity.level}</span>}
            {entity.act != null && <span>Ato {entity.act}</span>}
            {entity.region && (
              <span>{REGION_PT[entity.region] ?? entity.region}</span>
            )}
          </div>
          {entity.location && (
            <p className="flex items-center gap-2 mt-2 text-[#888] text-sm">
              <MapPin size={14} style={{ color: theme.accent }} />
              {entity.location}
            </p>
          )}
          {onMap && (
            <Link
              href={`/map?boss=${encodeURIComponent(entity.id)}`}
              className="inline-flex items-center gap-2 mt-3 text-sm hover:underline"
              style={{ color: theme.accent }}
            >
              <MapPin size={14} />
              Ver no mapa de Vardoran
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}



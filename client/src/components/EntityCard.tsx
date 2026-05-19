import { Link } from 'wouter';
import AssetImage from '@/components/AssetImage';
import type { WikiEntity } from '@/data/entity-types';
import { translateSchool } from '@/data/entity-translations';
import { entityDetailPath } from '@/lib/entity-paths';
import { getBossPortraitBorder } from '@/lib/boss-portrait';
import { getSoulShardBossTheme } from '@/lib/soul-shard-bosses';
import { isLowQualityText, sanitizeWikiText } from '@/lib/wiki-sanitize';

interface EntityCardProps {
  entity: WikiEntity;
  index?: number;
}

export default function EntityCard({ entity, index = 0 }: EntityCardProps) {
  const soulShard =
    entity.type === 'boss' ? getSoulShardBossTheme(entity.id) : null;
  const portraitBorder =
    entity.type === 'boss' ? getBossPortraitBorder(entity) : null;
  const desc = sanitizeWikiText(entity.description || '');
  const preview =
    desc && !isLowQualityText(desc)
      ? desc.length > 120
        ? `${desc.slice(0, 120)}…`
        : desc
      : 'Abrir página';

  return (
    <Link href={entityDetailPath(entity.type, entity.slug)}>
      <article
        className={`group flex gap-4 rounded-xl p-4 h-full transition-all duration-200 ${
          soulShard
            ? `prismatic-card border-2 ${soulShard.borderClass} bg-[#0c0c0e]/95 hover:shadow-lg`
            : 'border border-[#252525] bg-[#0f0f0f]/90 hover:border-[#c41e3a]/35 hover:bg-[#141414]'
        }`}
        style={
          soulShard
            ? ({
                animationDelay: `${Math.min(index, 8) * 40}ms`,
                boxShadow: `0 0 20px rgba(${soulShard.accentRgb}, 0.12)`,
                ['--shard-rgb' as string]: soulShard.accentRgb,
              } as React.CSSProperties)
            : { animationDelay: `${Math.min(index, 8) * 40}ms` }
        }
      >
        <div
          className={`w-16 h-16 shrink-0 rounded-lg bg-[#0a0a0a] flex items-center justify-center overflow-hidden p-0.5 ${
            portraitBorder?.show
              ? portraitBorder.borderClass
              : 'border border-[#222]'
          }`}
          style={
            portraitBorder?.show
              ? { boxShadow: `0 0 10px ${portraitBorder.accent}35` }
              : undefined
          }
        >
          {entity.image ? (
            <AssetImage
              src={entity.image}
              alt=""
              className="w-full h-full object-contain p-1"
              loading="lazy"
            />
          ) : (
            <span className="text-[#333] text-[10px]">—</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-gothic text-base font-bold text-white group-hover:text-[#e85a6f] transition-colors line-clamp-2">
            {entity.name}
          </h2>
          <p className="text-[11px] text-[#666] mt-1 uppercase tracking-wide">
            {soulShard && (
              <span style={{ color: soulShard.accent }} className="mr-1">
                Soul Shard ·
              </span>
            )}
            {entity.level != null && `Nv. ${entity.level}`}
            {entity.school && ` · ${translateSchool(entity.school)}`}
          </p>
          <p className="text-[#888] text-sm mt-2 line-clamp-2 leading-snug">
            {preview}
          </p>
        </div>
      </article>
    </Link>
  );
}

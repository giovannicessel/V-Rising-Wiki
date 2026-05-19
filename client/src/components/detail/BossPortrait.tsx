import type { WikiEntity } from '@/data/entity-types';
import { getBossPortraitBorder } from '@/lib/boss-portrait';

interface BossPortraitProps {
  entity: WikiEntity;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZES = {
  sm: 'w-16 h-16',
  md: 'w-32 h-32 md:w-40 md:h-40',
  lg: 'w-36 h-36 md:w-44 md:h-44',
};

export default function BossPortrait({ entity, size = 'md', className = '' }: BossPortraitProps) {
  const border = getBossPortraitBorder(entity);

  return (
    <div
      className={`relative shrink-0 rounded-xl p-1 ${border?.show ? border.borderClass : ''} ${className}`}
      style={
        border?.show
          ? { boxShadow: `0 0 20px ${border.accent}40` }
          : undefined
      }
    >
      {entity.image ? (
        <img
          src={entity.image}
          alt={entity.name}
          className={`${SIZES[size]} object-contain rounded-lg bg-[#0a0a0a]/80`}
          style={
            border?.show
              ? { filter: `drop-shadow(0 0 12px ${border.accent}55)` }
              : undefined
          }
        />
      ) : (
        <div className={`${SIZES[size]} rounded-lg bg-[#111]`} />
      )}
    </div>
  );
}

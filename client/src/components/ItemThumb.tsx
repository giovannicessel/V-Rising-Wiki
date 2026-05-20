import { assetUrl } from '@/lib/app-path';
import { jewelTierImage } from '@/lib/jewel-images';

interface ItemThumbProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md';
  className?: string;
  /** Usa a joia de sangue tier 1 como placeholder visual de joia de feitiço. */
  jewelFallback?: boolean;
  /** Cor de borda (ex.: accent da escola de magia). */
  accentColor?: string;
}

const sizes = {
  sm: 'w-10 h-10',
  md: 'w-14 h-14',
};

function resolveThumbSrc(src?: string, jewelFallback?: boolean): string {
  if (src) {
    return /^https?:\/\//i.test(src) ? src : assetUrl(src);
  }
  if (jewelFallback) return jewelTierImage();
  return '';
}

/** Miniatura de item (Fandom CDN ou asset local em `public/`). */
export default function ItemThumb({
  src,
  alt,
  size = 'sm',
  className = '',
  jewelFallback = false,
  accentColor,
}: ItemThumbProps) {
  const resolved = resolveThumbSrc(src, jewelFallback);

  return (
    <div
      className={`${sizes[size]} shrink-0 rounded-lg bg-[#0a0a0a] border border-[#333] flex items-center justify-center overflow-hidden ${className}`}
      style={{
        borderColor: accentColor ? `${accentColor}55` : undefined,
        boxShadow: accentColor ? `0 0 12px ${accentColor}18` : undefined,
      }}
    >
      {resolved ? (
        <img
          src={resolved}
          alt={alt}
          className="w-full h-full object-contain p-0.5"
          loading="lazy"
        />
      ) : (
        <span className="text-[#444] text-[10px]">—</span>
      )}
    </div>
  );
}

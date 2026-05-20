import { useEffect, useMemo, useState } from 'react';
import { jewelTierCycleSources } from '@/lib/jewel-images';
import { getSchoolTheme, SCHOOL_ORDER } from '@/lib/school-theme';

const SIZES = {
  sm: 'w-10 h-10',
  md: 'w-14 h-14',
} as const;

interface JewelCycleThumbProps {
  tier: number;
  size?: keyof typeof SIZES;
  className?: string;
  /** Intervalo entre trocas de escola (ms). */
  intervalMs?: number;
  /** Desloca o índice inicial (evita todos os cards sincronizados). */
  phaseOffset?: number;
  showSchoolLabel?: boolean;
}

export default function JewelCycleThumb({
  tier,
  size = 'md',
  className = '',
  intervalMs = 2400,
  phaseOffset = 0,
  showSchoolLabel = false,
}: JewelCycleThumbProps) {
  const sources = useMemo(() => jewelTierCycleSources(tier), [tier]);
  const [index, setIndex] = useState(phaseOffset % Math.max(sources.length, 1));
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (reduceMotion || sources.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % sources.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs, reduceMotion, sources.length]);

  const active = sources[index] ?? sources[0];
  const theme = active ? getSchoolTheme(active.school) : null;

  if (!active) {
    return (
      <div
        className={`${SIZES[size]} shrink-0 rounded-lg bg-[#0a0a0a] border border-[#333] ${className}`}
      />
    );
  }

  const displayIndex = reduceMotion ? 0 : index;

  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      <div
        className={`relative ${SIZES[size]} shrink-0 rounded-lg bg-[#0a0a0a] border overflow-hidden mb-0`}
        style={{
          borderColor: `${theme?.accent ?? '#8b5cf6'}55`,
          boxShadow: theme ? `0 0 18px ${theme.accent}22` : undefined,
        }}
      >
        {sources.map((item, i) => (
          <img
            key={item.school}
            src={item.src}
            alt=""
            aria-hidden={i !== displayIndex}
            className="absolute inset-0 w-full h-full object-contain p-0.5 transition-opacity duration-700 ease-in-out"
            style={{ opacity: i === displayIndex ? 1 : 0 }}
            loading={i === 0 ? 'eager' : 'lazy'}
          />
        ))}
      </div>
      {showSchoolLabel && (
        <span
          className="text-[9px] uppercase tracking-wider font-medium transition-colors duration-500"
          style={{ color: theme?.accent ?? '#888' }}
        >
          {theme?.label ?? active.school}
        </span>
      )}
    </div>
  );
}

/** Índice de fase estável por tier para dessincronizar os cards. */
export function jewelCyclePhase(tier: number): number {
  const n = SCHOOL_ORDER.length;
  return (tier - 1) % n;
}

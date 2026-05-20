import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const WHEEL_STEP = 0.15;
const BUTTON_STEP = 0.25;

interface ZoomableMapViewportProps {
  children: ReactNode;
  className?: string;
  /** Origem do zoom em % (ex.: pin do chefe) */
  transformOrigin?: string;
  hint?: string;
}

export default function ZoomableMapViewport({
  children,
  className = '',
  transformOrigin = '50% 50%',
  hint = 'Scroll do mouse para aproximar · arraste para mover',
}: ZoomableMapViewportProps) {
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const viewportRef = useRef<HTMLDivElement>(null);

  const clampScale = (value: number) =>
    Math.min(MAX_SCALE, Math.max(MIN_SCALE, Math.round(value * 100) / 100));

  const changeScale = useCallback((delta: number) => {
    setScale((current) => {
      const next = clampScale(current + delta);
      if (next <= MIN_SCALE) setPan({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      changeScale(e.deltaY < 0 ? WHEEL_STEP : -WHEEL_STEP);
    },
    [changeScale]
  );

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (scale <= MIN_SCALE) return;
    dragging.current = true;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastPointer.current.x;
    const dy = e.clientY - lastPointer.current.y;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    setPan((p) => ({ x: p.x + dx, y: p.y + dy }));
  };

  const onPointerUp = (e: React.PointerEvent) => {
    dragging.current = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const zoomed = scale > MIN_SCALE;

  return (
    <div className={`relative ${className}`}>
      <div className="absolute top-2 right-2 z-20 flex gap-1">
        <button
          type="button"
          onClick={() => changeScale(-BUTTON_STEP)}
          disabled={scale <= MIN_SCALE}
          className="p-1.5 rounded-md border border-[#333] bg-[#0a0a0a]/90 text-[#aaa] hover:text-white hover:border-[#c41e3a]/50 disabled:opacity-30 disabled:pointer-events-none"
          aria-label="Afastar"
        >
          <ZoomOut size={14} />
        </button>
        <button
          type="button"
          onClick={() => changeScale(BUTTON_STEP)}
          disabled={scale >= MAX_SCALE}
          className="p-1.5 rounded-md border border-[#333] bg-[#0a0a0a]/90 text-[#aaa] hover:text-white hover:border-[#c41e3a]/50 disabled:opacity-30 disabled:pointer-events-none"
          aria-label="Aproximar"
        >
          <ZoomIn size={14} />
        </button>
      </div>
      <div
        ref={viewportRef}
        className={`relative w-full h-full overflow-hidden touch-none ${
          zoomed ? 'cursor-grab active:cursor-grabbing' : 'cursor-zoom-in'
        }`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className="relative w-full h-full will-change-transform"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin,
          }}
        >
          {children}
        </div>
      </div>
      {hint && (
        <p className="absolute top-2 left-2 z-20 text-[10px] text-[#888] bg-[#0a0a0a]/80 px-2 py-1 rounded border border-[#252525] pointer-events-none max-w-[70%]">
          {hint}
        </p>
      )}
    </div>
  );
}
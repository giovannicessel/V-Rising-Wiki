import { useEffect, useMemo, useState, type ReactNode } from 'react';

interface Bat {
  id: number;
  size: number;
  layer: 'far' | 'mid' | 'near';
  duration: number;
  delay: number;
  yStart: number;
  flip: boolean;
}

interface Ember {
  id: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
}

function BatIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size * 0.55}
      viewBox="0 0 48 28"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M24 6c-1.5 0-3 .6-4 1.8C17 5.2 13.5 3 9 1 7.5 4 5.5 7 4.5 10.5c-1.2-.8-2.5-1.2-4-1.2-2 0-3.5.8-4.5 2.2C2 14 4 18 8 20.5c2.5 1.5 5.5 2 8.5 1.5-1 2.5-1.5 5-1.5 7.5h4c0-2.5-.5-5-1.5-7.5 3 .5 6 0 8.5-1.5 4-2.5 6-6.5 4-9.3-1-1.4-2.5-2.2-4.5-2.2-1.5 0-2.8.4-4 1.2C27 6.6 25.5 6 24 6z" />
    </svg>
  );
}

function BackgroundShell({ children }: { children?: ReactNode }) {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#0c0a0b] to-[#050505]" />
      <div className="absolute inset-0 blood-pulse">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 900px 500px at 50% 40%, rgba(196, 30, 58, 0.1) 0%, transparent 65%)',
          }}
        />
      </div>
      {children}
    </div>
  );
}

export default function AnimatedBackground() {
  const [mounted, setMounted] = useState(false);

  const bats = useMemo<Bat[]>(() => {
    const layers: Bat['layer'][] = ['far', 'mid', 'near'];
    return Array.from({ length: 28 }, (_, i) => ({
      id: i,
      size:
        layers[i % 3] === 'far'
          ? 14 + (i % 4) * 2
          : layers[i % 3] === 'mid'
            ? 20 + (i % 5) * 3
            : 28 + (i % 4) * 4,
      layer: layers[i % 3],
      duration: 14 + (i % 7) * 3,
      delay: (i * 1.7) % 22,
      yStart: 5 + ((i * 13) % 85),
      flip: i % 3 === 0,
    }));
  }, []);

  const embers = useMemo<Ember[]>(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: (i * 17 + 7) % 100,
        size: 2 + (i % 3),
        delay: (i * 2.3) % 12,
        duration: 6 + (i % 5) * 2,
      })),
    []
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <BackgroundShell />;
  }

  return (
    <BackgroundShell>
      <div
        className="absolute top-[6%] right-[8%] w-28 h-28 md:w-36 md:h-36 rounded-full moon-glow"
        style={{
          background:
            'radial-gradient(circle at 35% 35%, #f0e6d8 0%, #c9b8a8 25%, #6b5d52 60%, transparent 72%)',
          boxShadow:
            '0 0 60px rgba(196, 30, 58, 0.25), 0 0 120px rgba(196, 30, 58, 0.08), inset -8px -8px 20px rgba(0,0,0,0.4)',
        }}
      />
      <div
        className="absolute top-[6%] right-[8%] w-28 h-28 md:w-36 md:h-36 rounded-full moon-pulse pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(196, 30, 58, 0.12) 0%, transparent 70%)',
        }}
      />

      <div className="absolute inset-0 opacity-25">
        <div className="absolute inset-0 fog-animation mist-layer-1" />
        <div
          className="absolute inset-0 fog-animation mist-layer-2"
          style={{ animationDelay: '-25s' }}
        />
        <div
          className="absolute inset-0 fog-animation mist-layer-3"
          style={{ animationDelay: '-50s' }}
        />
      </div>

      {embers.map((e) => (
        <span
          key={e.id}
          className="absolute rounded-full ember-float bg-[#c41e3a]/60"
          style={{
            left: `${e.left}%`,
            bottom: '-4%',
            width: e.size,
            height: e.size,
            animationDuration: `${e.duration}s`,
            animationDelay: `${e.delay}s`,
            boxShadow: '0 0 6px rgba(196, 30, 58, 0.8)',
          }}
        />
      ))}

      {bats.map((bat) => (
        <div
          key={bat.id}
          className={`absolute bat-flight bat-layer-${bat.layer} ${bat.flip ? 'scale-x-[-1]' : ''}`}
          style={{
            top: `${bat.yStart}vh`,
            width: `${bat.size}px`,
            animationDuration: `${bat.duration}s`,
            animationDelay: `${bat.delay}s`,
            opacity:
              bat.layer === 'far' ? 0.2 : bat.layer === 'mid' ? 0.35 : 0.55,
            filter:
              bat.layer === 'near'
                ? 'drop-shadow(0 0 6px rgba(196, 30, 58, 0.35))'
                : undefined,
          }}
        >
          <div className="bat-wing-flap">
            <BatIcon
              size={bat.size}
              className={
                bat.layer === 'near'
                  ? 'text-[#7a7a7a]'
                  : bat.layer === 'mid'
                    ? 'text-[#505050]'
                    : 'text-[#333333]'
              }
            />
          </div>
        </div>
      ))}

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.65) 100%)',
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-1/3 pointer-events-none gothic-top-glow" />
    </BackgroundShell>
  );
}

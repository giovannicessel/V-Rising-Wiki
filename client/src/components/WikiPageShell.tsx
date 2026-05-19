import type { ReactNode } from 'react';
import AnimatedBackground from '@/components/AnimatedBackground';
import SiteNav from '@/components/SiteNav';

interface WikiPageShellProps {
  children: ReactNode;
  /** Fundo animado mais suave nas páginas internas */
  subtle?: boolean;
}

export default function WikiPageShell({ children, subtle = true }: WikiPageShellProps) {
  return (
    <div className="min-h-screen bg-[#080808] text-white relative">
      <AnimatedBackground />
      {subtle && (
        <div
          className="pointer-events-none fixed inset-0 z-[1] bg-[#080808]/40"
          aria-hidden
        />
      )}
      <SiteNav />
      <main className="relative z-10">{children}</main>
    </div>
  );
}

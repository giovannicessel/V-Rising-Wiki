import React from 'react';

interface HeroSectionProps {
  backgroundImage: string;
  title: string;
  subtitle: string;
}

export default function HeroSection({
  backgroundImage,
  title,
  subtitle,
}: HeroSectionProps) {
  return (
    <div className="relative w-full min-h-screen flex flex-col overflow-hidden">
      {/* Background image with dramatic effect */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          filter: 'brightness(0.35) contrast(1.2) saturate(1.1)',
        }}
      />

      {/* Overlay with blood gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a]" />

      {/* Additional red glow overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(196, 30, 58, 0.15) 0%, transparent 70%)',
        }}
      />

      {/* Hero copy — centro da tela, sem o indicador de scroll */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 pb-28 pt-24">
        <div className="text-center max-w-5xl mx-auto fade-in-up">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-[#c41e3a]" />
            <div
              className="w-2 h-2 bg-[#c41e3a] rounded-full shadow-lg"
              style={{ boxShadow: '0 0 10px #c41e3a' }}
            />
            <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-[#c41e3a]" />
          </div>

          <h1 className="hero-title mb-6 inline-block relative">
            {title}
            <div
              className="absolute -inset-8 blur-3xl opacity-30 -z-10"
              style={{
                background: 'radial-gradient(ellipse at center, #c41e3a 0%, transparent 70%)',
              }}
            />
          </h1>

          <p className="hero-subtitle mb-8 font-display tracking-widest">{subtitle}</p>

          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-[#c41e3a]" />
            <div
              className="w-2 h-2 bg-[#c41e3a] rounded-full shadow-lg"
              style={{ boxShadow: '0 0 10px #c41e3a' }}
            />
            <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-[#c41e3a]" />
          </div>

          <p className="text-[#b0b0b0] text-lg md:text-xl font-display italic tracking-wide max-w-2xl mx-auto">
            Desperte como um vampiro e reconstrua seu império
          </p>
        </div>
      </div>

      {/* Scroll — faixa fixa no rodapé do hero, abaixo do texto */}
      <div className="relative z-10 shrink-0 pb-10 flex flex-col items-center gap-2 pointer-events-none">
        <p className="text-[#c41e3a] text-xs font-gothic tracking-widest uppercase">Scroll</p>
        <div className="animate-bounce">
          <svg
            className="w-6 h-6 text-[#c41e3a]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{
              filter: 'drop-shadow(0 0 8px rgba(196, 30, 58, 0.4))',
            }}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>

      {/* Atmospheric particles effect */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[#c41e3a] rounded-full opacity-0"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `fade-in-up ${2 + Math.random() * 3}s ease-out infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

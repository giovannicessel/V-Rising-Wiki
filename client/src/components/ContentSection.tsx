import React from 'react';
import { X } from 'lucide-react';
import type { WikiCatalogStats as CatalogStats, WikiEntry } from '@/data/wiki-types';
import WikiCatalogStats from '@/components/WikiCatalogStats';
import WikiEntryGrid from '@/components/WikiEntryGrid';

interface ContentItem {
  title: string;
  description: string;
  details?: string;
}

interface ContentSectionProps {
  title: string;
  backgroundImage: string;
  items: ContentItem[];
  wikiEntries?: WikiEntry[];
  wikiGridTitle?: string;
  catalogStats?: CatalogStats;
  onClose: () => void;
}

export default function ContentSection({
  title,
  backgroundImage,
  items,
  wikiEntries,
  wikiGridTitle = 'Catálogo da Wiki',
  catalogStats,
  onClose,
}: ContentSectionProps) {
  return (
    <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto backdrop-blur-sm">
      {/* Close button with glow */}
      <button
        onClick={onClose}
        className="fixed top-6 right-6 z-60 p-3 bg-[#c41e3a] hover:bg-[#a01729] rounded-full transition-all duration-200 group glow-pulse"
      >
        <X size={24} className="text-white group-hover:rotate-90 transition-transform duration-300" />
      </button>

      {/* Hero banner */}
      <div
        className="relative w-full h-96 bg-cover bg-center"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          filter: 'brightness(0.4) contrast(1.1)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a0a0a]" />
        
        {/* Red glow overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(196, 30, 58, 0.2) 0%, transparent 70%)',
          }}
        />

        <div className="absolute inset-0 flex items-end justify-center pb-8">
          <h1 className="font-gothic text-5xl font-bold text-white drop-shadow-lg text-center tracking-wider">
            {title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div
        className={`relative z-10 mx-auto px-4 py-16 ${wikiEntries?.length ? 'max-w-6xl' : 'max-w-4xl'}`}
      >
        <div className="space-y-8">
          {items.map((item, index) => (
            <div
              key={index}
              className="gothic-card fade-in-up group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Title with accent */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-1 h-8 bg-gradient-to-b from-[#c41e3a] to-transparent mt-1" />
                <h2 className="font-gothic text-3xl font-bold text-white group-hover:text-[#c41e3a] transition-colors duration-300 tracking-wide">
                  {item.title}
                </h2>
              </div>

              {/* Description */}
              <p className="text-[#e8e8e8] mb-6 leading-relaxed text-lg">
                {item.description}
              </p>

              {/* Details box */}
              {item.details && (
                <div className="mt-6 p-5 bg-gradient-to-r from-[#0f0f0f] to-[#1a1a1a] border-l-3 border-[#c41e3a] rounded-r">
                  <p className="text-[#b0b0b0] text-sm italic leading-relaxed">
                    ✦ {item.details}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {catalogStats && <WikiCatalogStats stats={catalogStats} />}

        {wikiEntries && wikiEntries.length > 0 && (
          <WikiEntryGrid title={wikiGridTitle} entries={wikiEntries} />
        )}

        {/* Divider */}
        <div className="section-divider my-12" />

        {/* Footer */}
        <div className="text-center py-8">
          <p className="font-display text-2xl text-[#c41e3a] mb-2 tracking-widest">
            Forjado nas sombras de Vardoran
          </p>
          <p className="text-[#4a4a4a] text-sm">
            V Rising Dark Wiki © 2024 | Stunlock Studios
          </p>
        </div>
      </div>

      {/* Background atmospheric effect */}
      <div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, rgba(196, 30, 58, 0.05) 0%, transparent 70%)',
        }}
      />
    </div>
  );
}

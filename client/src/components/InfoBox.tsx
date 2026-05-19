import React from 'react';

interface InfoBoxProps {
  title: string;
  items: Array<{
    label: string;
    value: string;
  }>;
}

export default function InfoBox({ title, items }: InfoBoxProps) {
  return (
    <div className="gothic-card max-w-3xl mx-auto mb-12 glow-pulse">
      {/* Title with decorative elements */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-[#c41e3a]" />
          <div className="w-2 h-2 bg-[#c41e3a] rounded-full" />
          <div className="w-8 h-0.5 bg-gradient-to-l from-transparent to-[#c41e3a]" />
        </div>
        <h2 className="font-gothic text-4xl font-bold text-white tracking-wider">
          {title}
        </h2>
      </div>

      {/* Info items grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item, index) => (
          <div
            key={index}
            className="group p-4 rounded border border-[#4a4a4a] hover:border-[#c41e3a] transition-all duration-300 hover:bg-[#0f0f0f]"
          >
            <span className="font-display text-[#c41e3a] font-semibold text-sm uppercase tracking-widest block mb-2">
              {item.label}
            </span>
            <span className="text-[#e8e8e8] text-lg group-hover:text-white transition-colors duration-300">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom decorative line */}
      <div className="mt-8 pt-6 border-t border-[#4a4a4a]">
        <div className="flex items-center justify-center gap-3">
          <div className="w-8 h-0.5 bg-gradient-to-r from-transparent to-[#c41e3a]" />
          <div className="w-2 h-2 bg-[#c41e3a] rounded-full" />
          <div className="w-8 h-0.5 bg-gradient-to-l from-transparent to-[#c41e3a]" />
        </div>
      </div>
    </div>
  );
}

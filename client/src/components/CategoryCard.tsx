import React from 'react';
import { Link } from 'wouter';
import AssetImage from '@/components/AssetImage';
import { ChevronRight } from 'lucide-react';

interface CategoryCardProps {
  title: string;
  description: string;
  image: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  delay?: number;
}

function CardInner({
  title,
  description,
  image,
  icon,
}: Pick<CategoryCardProps, 'title' | 'description' | 'image' | 'icon'>) {
  return (
    <>
      <div className="absolute inset-0 opacity-20 group-hover/card:opacity-40 transition-opacity duration-300">
        <AssetImage src={image} alt={title} className="w-full h-full object-cover" />
      </div>
      <div
        className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(196, 30, 58, 0.1) 0%, transparent 70%)',
        }}
      />
      <div className="relative z-10 flex flex-col h-full p-6">
        <div className="text-[#c41e3a] mb-6 group-hover/card:text-white transition-all duration-300 group-hover/card:scale-110">
          {icon}
        </div>
        <h3 className="font-gothic text-2xl font-bold text-white mb-3 group-hover/card:text-[#c41e3a] transition-colors tracking-wide">
          {title}
        </h3>
        <p className="text-[#b0b0b0] text-sm mb-6 flex-grow leading-relaxed">{description}</p>
        <div className="flex items-center text-[#c41e3a] group-hover/card:text-white font-gothic text-sm">
          <span className="mr-2">Explorar</span>
          <ChevronRight size={20} />
        </div>
      </div>
    </>
  );
}

export default function CategoryCard({
  title,
  description,
  image,
  icon,
  href,
  onClick,
  delay = 0,
}: CategoryCardProps) {
  const shell = (
    <div
      className="gothic-card relative overflow-hidden h-full flex flex-col group/card cursor-pointer min-h-[280px]"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardInner title={title} description={description} image={image} icon={icon} />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="stagger-item group block h-full fade-in-up">
        {shell}
      </Link>
    );
  }

  return (
    <div
      className="stagger-item group h-full fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {shell}
    </div>
  );
}

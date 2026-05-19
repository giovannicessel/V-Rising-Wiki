import type { WikiCatalogStats as Stats } from '@/data/wiki-types';

interface WikiCatalogStatsProps {
  stats: Stats;
}

export default function WikiCatalogStats({ stats }: WikiCatalogStatsProps) {
  const items = [
    { label: 'Entradas no catálogo', value: stats.total },
    { label: 'Imagens do jogo', value: stats.withGameImage },
    { label: 'Textos em PT (jogo)', value: stats.descriptionsGame },
    { label: 'Feitiços', value: stats.byCategory.spell ?? 0 },
    { label: 'Armas', value: stats.byCategory.weapon ?? 0 },
    { label: 'V Bloods', value: stats.byCategory.boss ?? 0 },
    { label: 'Itens', value: stats.byCategory.item ?? 0 },
    { label: 'Com descrição', value: stats.withDescription ?? 0 },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
      {items.map((item) => (
        <div
          key={item.label}
          className="gothic-card text-center py-4 px-2 border border-[#4a4a4a]/40"
        >
          <p className="font-gothic text-2xl text-[#c41e3a]">{item.value}</p>
          <p className="text-[#6a6a6a] text-xs mt-1 leading-tight">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

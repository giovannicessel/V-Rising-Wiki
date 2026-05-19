export type WikiCategory =
  | 'boss'
  | 'spell'
  | 'item'
  | 'jewel'
  | 'weapon'
  | 'building';

export type DescriptionSource = 'game' | 'fandom' | 'manual';

export interface WikiEntry {
  id: string;
  slug: string;
  name: string;
  nameEn?: string;
  category: WikiCategory;
  level?: number;
  image: string;
  imageRemote?: string;
  gameAssetName?: string;
  description: string;
  descriptionSource?: DescriptionSource;
  details?: string;
  fandomUrl?: string;
}

export interface WikiCatalogStats {
  total: number;
  withGameImage: number;
  descriptionsGame: number;
  descriptionsFandom: number;
  withDescription?: number;
  byCategory: Record<string, number>;
}

export interface WikiCatalog {
  stats: WikiCatalogStats;
  entries: WikiEntry[];
}

export const WIKI_CATEGORY_LABELS: Record<WikiCategory, string> = {
  boss: 'V Blood',
  spell: 'Feitiço',
  item: 'Item',
  jewel: 'Joia / Soul Shard',
  weapon: 'Arma / Habilidade',
  building: 'Estrutura',
};

export const DESCRIPTION_SOURCE_LABELS: Record<DescriptionSource, string> = {
  game: 'Texto do jogo (PT)',
  fandom: 'Wiki Fandom',
  manual: 'Sem descrição',
};

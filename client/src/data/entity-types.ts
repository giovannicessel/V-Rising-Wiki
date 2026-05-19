export type EntityType =
  | 'boss'
  | 'spell'
  | 'item'
  | 'jewel'
  | 'weapon'
  | 'building';

export interface EntitySection {
  title: string;
  titlePt?: string;
  body: string;
  kind?: 'text' | 'video' | 'list';
  youtubeId?: string;
}

export interface BossPhase {
  title: string;
  body: string;
}

export interface BossUnlockEntry {
  name: string;
  nameEn?: string;
  entityId?: string;
  entityType?: EntityType;
  slug?: string;
  image?: string;
  school?: string;
  /** Descrição curta para pop-up de recompensa */
  description?: string;
}

export type SpellProgressionCategory = 'tier1' | 'tier2' | 'ultimate' | 'dash';

/** Progressão v1.1: pontos de feitiço por escola e tier (não feitiços individuais). */
export interface BossSpellPointMeta {
  school: string;
  tier: 1 | 2 | 3;
  ultimate?: boolean;
  labelPt: string;
  category: SpellProgressionCategory;
  /** Feitiços que o jogador pode escolher ao gastar este ponto (3 ou 2 opções). */
  choices: BossUnlockEntry[];
}

export interface SpellProgressionMeta {
  school: string;
  category: SpellProgressionCategory;
  tier?: 1 | 2 | 3;
  labelPt: string;
  /** Outros feitiços do mesmo tier na mesma escola */
  peers: BossUnlockEntry[];
}

export interface SpellPointBossRef {
  bossId: string;
  bossName: string;
  bossSlug: string;
  labelPt: string;
}

export interface BossRewardsMeta {
  primarySchool?: string;
  hasSpellSchoolUnlock: boolean;
  /** Fonte dos dados de recompensa */
  source?: 'v1.1' | 'fandom';
  /** Ponto de feitiço (Tier 1–3) concedido ao derrotar o chefe */
  spellPoint?: BossSpellPointMeta;
  /** Dash (Veil) desbloqueado diretamente pelo chefe — único, sem lista */
  dashUnlock?: BossUnlockEntry;
  /** @deprecated usar dashUnlock */
  spells: BossUnlockEntry[];
  /** Estruturas, receitas e itens principais (rótulos PT) */
  mainRewards?: BossUnlockEntry[];
  /** @deprecated preferir mainRewards — legado Fandom */
  recipes: BossUnlockEntry[];
  vampirePowers: BossUnlockEntry[];
}

export interface EntityMeta {
  /** Texto de lore / overview do chefe */
  lore?: string;
  /** Como enfrentar (Attacks + The Fight) */
  fightGuide?: string;
  /** Fases do combate */
  phases?: BossPhase[];
  /** Drops, itens, receitas desbloqueadas */
  loot?: string;
  /** @deprecated usar rewards */
  unlocks?: string[];
  /** Recompensas estruturadas (feitiços, receitas, formas) */
  rewards?: BossRewardsMeta;
  /** Requisito de desbloqueio (feitiços) */
  unlockRequirement?: string;
  /** Progressão v1.1: tier e escola do feitiço */
  spellProgression?: SpellProgressionMeta;
  /** Chefes que concedem o ponto de feitiço para desbloquear este tier */
  spellPointBosses?: SpellPointBossRef[];
  /** Chefe que concede este Veil (dash) diretamente */
  dashBoss?: SpellPointBossRef;
  /** Joias que modificam o feitiço */
  jewels?: string;
  /** O que crafta (itens) */
  crafts?: string;
  /** Onde obter / drops (itens) */
  drops?: string;
  /** Requisitos para obter */
  requirements?: string;
}

export interface WikiEntity {
  id: string;
  slug: string;
  type: EntityType;
  name: string;
  nameEn?: string;
  school?: string;
  weaponType?: string;
  level?: number;
  act?: number;
  region?: string;
  location?: string;
  description: string;
  descriptionSource: 'fandom' | 'game' | 'none';
  image: string;
  imageSource: 'game' | 'fandom' | 'none';
  gameAssetName?: string;
  fandomUrl: string;
  infobox: Record<string, string>;
  sections: EntitySection[];
  meta?: EntityMeta;
  youtubeId?: string;
  syncedAt?: string;
}

export interface EntitiesFile {
  stats: Record<string, number>;
  entities: WikiEntity[];
}

export const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  boss: 'V Blood',
  spell: 'Feitiço',
  item: 'Item',
  jewel: 'Joia / Soul Shard',
  weapon: 'Arma / Habilidade',
  building: 'Estrutura',
};

export const ENTITY_TYPE_PLURAL: Record<EntityType, string> = {
  boss: 'V Bloods',
  spell: 'Feitiços',
  item: 'Itens',
  jewel: 'Joias',
  weapon: 'Armas',
  building: 'Estruturas',
};

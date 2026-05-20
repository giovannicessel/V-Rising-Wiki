/** Traduções PT-BR para títulos e rótulos comuns (Fandom em inglês). */
export const ENTITY_NAME_PT: Record<string, string> = {
  'Blood Rage': 'Fúria de Sangue',
  'Blood Fountain': 'Fonte de Sangue',
  'Veil of Shadow': 'Véu das Sombras',
  'Veil of Blood': 'Véu de Sangue',
  'Veil of Frost': 'Véu de Gelo',
  'Veil of Chaos': 'Véu de Caos',
  'Veil of Bones': 'Véu de Ossos',
  'Veil of Illusion': 'Véu de Ilusão',
  'Veil of Storm': 'Véu de Tempestade',
  'Blood Storm': 'Tempestade de Sangue',
  'Blood Rite': 'Rito de Sangue',
  'Carrion Swarm': 'Enxame de Carniça',
  'Shadowbolt': 'Projétil Sombrio',
  'Shadow Bolt': 'Projétil Sombrio',
  'Frost Bat': 'Morcego de Gelo',
  'Cold Snap': 'Estalo Gelado',
  'Ice Nova': 'Nova de Gelo',
  'Chaos Volley': 'Rajada de Caos',
  'Merciless Charge': 'Investida Impiedosa',
  'Chaos Barrage': 'Barragem de Caos',
  'Chains of Death': 'Correntes da Morte',
  'Unholy Chains': 'Correntes da Morte',
  'Alpha the White Wolf': 'Alpha, o Lobo Branco',
  'Keely the Frost Archer': 'Keely, a Arqueira do Gelo',
  'Vincent the Frostbringer': 'Vincent, o Portador do Gelo',
  'Tristan the Vampire Hunter': 'Tristan, o Caçador de Vampiros',
  'Solarus the Immaculate': 'Solarus, o Imaculado',
  'Dracula the Immortal King': 'Drácula, o Rei Imortal',
  'Blood Essence': 'Essência de Sangue',
  'Primal Blood Essence': 'Essência de Sangue Primordial',
  'Soul Shard of Dracula': 'Fragmento de Alma de Drácula',
  'Soul Shard of Solarus': 'Fragmento de Alma de Solarus',
  'Copper Ingot': 'Lingote de Cobre',
  'Iron Ingot': 'Lingote de Ferro',
};

export const SECTION_TITLE_PT: Record<string, string> = {
  Overview: 'Visão geral',
  'Video Showcase': 'Demonstração em vídeo',
  'Video Showcase (Purgatory)': 'Demonstração (Purgatório)',
  'Unlock Requirement': 'Requisito de desbloqueio',
  History: 'Histórico',
  Location: 'Localização',
  Rewards: 'Recompensas',
  Items: 'Itens',
  Loot: 'Saque',
  Drops: 'Drops',
  Notes: 'Notas',
  Trivia: 'Curiosidades',
};

export const SCHOOL_PT: Record<string, string> = {
  Blood: 'Sangue',
  Chaos: 'Caos',
  Frost: 'Gelo',
  Storm: 'Tempestade',
  Unholy: 'Profano',
  Illusion: 'Ilusão',
  Shadow: 'Sombra',
};

export const WEAPON_TYPE_PT: Record<string, string> = {
  Axes: 'Machados',
  Claws: 'Garras',
  Crossbow: 'Besta',
  Daggers: 'Adagas',
  Greatsword: 'Espadão',
  Longbow: 'Arco longo',
  Mace: 'Maça',
  Pistols: 'Pistolas',
  Reaper: 'Ceifador',
  Slashers: 'Talhador',
  Spear: 'Lança',
  Sword: 'Espada',
  Whip: 'Chicote',
};

export const REGION_PT: Record<string, string> = {
  'Farbane Woods': 'Floresta de Farbane',
  'Dunley Farmlands': 'Terras Agrícolas de Dunley',
  'Hallowed Mountains': 'Montanhas Sagradas',
  'Ruins of Mortium': 'Ruínas de Mortium',
  'Cursed Forest': 'Floresta Amaldiçoada',
  Gloomrot: 'Gloomrot',
  'Silverlight Hills': 'Colinas de Silverlight',
  'Oakveil Woodlands': 'Bosques de Oakveil',
};

export function translateEntityName(nameEn: string): string {
  return ENTITY_NAME_PT[nameEn] ?? nameEn;
}

export function translateSectionTitle(title: string): string {
  return SECTION_TITLE_PT[title] ?? title;
}

export function translateSchool(school?: string): string | undefined {
  if (!school) return undefined;
  return SCHOOL_PT[school] ?? school;
}

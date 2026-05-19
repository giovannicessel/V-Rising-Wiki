/** Pins aproximados no mapa de Vardoran (coordenadas % do container). */
export interface BossMapPin {
  slug: string;
  name: string;
  level: number;
  region: string;
  act: 1 | 2 | 3 | 4;
  x: number;
  y: number;
}

export const BOSS_MAP_PINS: BossMapPin[] = [
  { slug: 'Alpha_the_White_Wolf', name: 'Alpha, o Lobo Branco', level: 16, region: 'Farbane Woods', act: 1, x: 28, y: 62 },
  { slug: 'Keely_the_Frost_Archer', name: 'Keely, a Arqueira do Gelo', level: 20, region: 'Farbane Woods', act: 1, x: 35, y: 48 },
  { slug: 'Rufus_the_Foreman', name: 'Rufus, o Capataz', level: 20, region: 'Dunley Farmlands', act: 2, x: 52, y: 55 },
  { slug: 'Vincent_the_Frostbringer', name: 'Vincent, o Portador do Gelo', level: 46, region: 'Dunley Farmlands', act: 2, x: 58, y: 42 },
  { slug: 'Tristan_the_Vampire_Hunter', name: 'Tristan, o Caçador de Vampiros', level: 46, region: 'Dunley Farmlands', act: 2, x: 48, y: 38 },
  { slug: 'Solarus_the_Immaculate', name: 'Solarus, o Imaculado', level: 68, region: 'Silverlight Hills', act: 3, x: 72, y: 35 },
  { slug: 'Dracula_the_Immortal_King', name: 'Drácula, o Rei Imortal', level: 91, region: 'Ruins of Mortium', act: 4, x: 78, y: 72 },
];

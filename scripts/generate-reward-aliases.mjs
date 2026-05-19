/**
 * Gera client/src/data/reward-item-aliases.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bosses = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../client/src/data/boss-rewards-v11.json'), 'utf8')
).bosses;
const labels = new Set();
for (const b of Object.values(bosses)) (b.mainRewardsPt ?? []).forEach((l) => labels.add(l));

const D = (gameAsset, descriptionPt, nameEn) => ({ gameAsset, descriptionPt, nameEn });
const E = (entity, descriptionPt) => ({ entity, descriptionPt });

const MAP = {
  Curtume: D('Stunlock_Icon_Structure_Tannery', 'Curtume para converter peles em couro na sua base.'),
  Couro: D('Item_Ingredient_BatLeather', 'Couro usado em receitas de armaduras e equipamentos.', 'Leather'),
  'Couro Grosso': E('Thick Hide', 'Material de curtume de tier superior.'),
  'Couro Prístino': D(
    'Stunlock_Icon_Structure_Tannery',
    'Couro de alta qualidade para equipamentos avançados.'
  ),
  'Couro de Morcego': E('Bat Hide', 'Pele de morcego usada em crafting.'),
  'Armazenamento de Gemas': D(
    'Stunlock_Icon_Structure_StoneCutting',
    'Estrutura para armazenar e trabalhar gemas.'
  ),
  'Bancada de Marcenaria': D('Stunlock_Icon_Structure_Sawmill', 'Serraria para processar madeira.'),
  'Besta de Cobre': E('Copper Crossbow', 'Arma de distância de cobre desbloqueada na forja.'),
  'Piso de Oficina': D('Stunlock_Icon_Structure_Floor_Forge01', 'Piso de forja para estação de trabalho.'),
  'Pedra de Amolar': D('Stunlock_Icon_Structure_WorkshopSet01_Clean', 'Estação de afiação e oficina.'),
  Túmulo: D('Stunlock_Icon_Structure_Coffin', 'Decoração e estrutura de túmulo.'),
  'Pó de Túmulo': { descriptionPt: 'Ingrediente de alquimia obtido em cemitérios.', gameAssetHint: 'tumulo' },
  'O Devorador': D('Stunlock_Icon_Structure_BloodFountain', 'Fonte de sangue — estrutura de coleta.'),
  'Bolsa de Couro': D('Stunlock_Icon_Structure_Stash_Tailoring02', 'Bolsa extra de inventário (couro).'),
  'Mesa de Alquimia': D('Stunlock_Icon_Structure_Floor_AlchemyLab01', 'Laboratório de alquimia.'),
  'Vara de Pescar': D('Stunlock_Icon_Structure_Stash_Fish', "Permite pescar em corpos d'água."),
  'Estruturas de Jardim': D('Stunlock_Icon_Structure_GardenUrn01', 'Conjunto de decorações de jardim.'),
  'Prensa de Papel': D('Stunlock_Icon_Structure_BloodPress', 'Prensa para criar pergaminhos e papel.'),
  Ferraria: D('Stunlock_Icon_Structure_ForgeFloor', 'Forja para armas e armaduras de ferro.'),
  Alfaiataria: D('Stunlock_Icon_Structure_Loom', 'Tear para tecidos e armaduras de tecido.'),
  Ferro: E('Iron Ingot', 'Lingote de ferro para crafting avançado.'),
  Tear: D('Stunlock_Icon_Structure_Loom', 'Tear — produção de tecido.'),
  Tecido: { descriptionPt: 'Tecido para armaduras e decoração.', gameAssetHint: 'tear' },
  'Fio de Algodão': { descriptionPt: 'Fio básico para alfaiataria.', gameAssetHint: 'tear' },
  'Fio de Lã': { descriptionPt: 'Fio de lã para receitas de tecido.', gameAssetHint: 'tear' },
  'Bolsa de Fio de Prata': D('Stunlock_Icon_Structure_Stash_Tailoring02', 'Bolsa de materiais de alfaiataria.'),
  'Célula de Prisão': D('Stunlock_Icon_Structure_PrisonCell', 'Cela para confinar servos.'),
  'Tábua Reforçada': { descriptionPt: 'Tábua reforçada para construção.', gameAssetHint: 'marcenaria' },
  Estábulos: D('Stunlock_Icon_Structure_StableFence', 'Cercado e estábulo para cavalos.'),
  'Foice (Ceifador)': E('Iron Reaper', 'Arma Ceifador (Reaper) desbloqueada.'),
  'Mesa de Artesão': D('Stunlock_Icon_Structure_WorkshopSet01_Clean', 'Mesa de artesão para crafting.'),
  'Pedra do Flagelo': { descriptionPt: 'Material profano para crafting.', gameAssetHint: 'artesao' },
  Pergaminho: { descriptionPt: 'Pergaminho para pesquisa e receitas.', gameAssetHint: 'papel' },
  'Forma Humana': { descriptionPt: 'Transformação vampírica — aparência humana.' },
  Slashers: E('Iron Slashers', 'Arma Talhador (Slashers).'),
  Vidro: E('Glass', 'Vidro para frascos e decoração.'),
  'Poção de Rosa de Sangue': {
    descriptionPt: 'Receita de poção de cura com rosa de sangue.',
    gameAssetHint: 'alquimia',
  },
  'Poção de Resistência Sagrada': {
    descriptionPt: 'Poção contra dano sagrado.',
    gameAssetHint: 'alquimia',
  },
  'Mesa de Corte de Gemas': D('Stunlock_Icon_Structure_StoneCutting', 'Bancada de lapidação de gemas.'),
  'Golem de Cerco': { descriptionPt: 'Golem invocável para cerco de castelos.', gameAssetHint: 'gemas' },
  'Altar do Despertar (Estágio)': { descriptionPt: 'Melhoria do Altar do Despertar.', gameAssetHint: 'altar' },
  'Estação de Arena': D('Stunlock_Icon_Structure_ArenaStation', 'Arena para combates e treino.'),
  'Espadas Gêmeas': E('Iron Twinblade', 'Arma de lâminas gêmeas.'),
  'Espadas Gêmeas (Twinblades)': E('Iron Twinblade', 'Arma Twinblades desbloqueada.'),
  'Círculo de Invocação (Estágio)': {
    descriptionPt: 'Círculo de invocação aprimorado.',
    gameAssetHint: 'invocacao',
  },
  'Prensa de Sangue Avançada': D('Stunlock_Icon_Structure_BloodPress', 'Prensa de sangue de tier superior.'),
  Pistolas: E('Iron Pistols', 'Armas de fogo — pistolas.'),
  'Mesa de Joalheria': D('Stunlock_Icon_Structure_Floor_JewelCrafting02', 'Mesa de joalheria.'),
  'Forja Ancestral': D('Stunlock_Icon_Structure_ForgeFloor02', 'Forja ancestral de tier alto.'),
  Fabricador: D('Stunlock_Icon_Structure_SimpleCraftingBench', 'Bancada de fabricação industrial.'),
  'Liga de Rádio': { descriptionPt: 'Liga usada em estruturas de Gloomrot.', gameAssetHint: 'fabricador' },
  'Triturador Avançado': D('Stunlock_Icon_Structure_Furnace', 'Triturador para recursos.'),
  Teletransportador: D('Stunlock_Icon_Structure_TeleporterRed', 'Teletransporte entre bases.'),
  'Conjunto Dawnthorn': {
    descriptionPt: 'Armadura lendária Dawnthorn — receitas completas.',
    gameAssetHint: 'forja',
  },
  Seda: { descriptionPt: 'Seda de aranha para crafting.', gameAssetHint: 'tear' },
  'Pó Espectral': { descriptionPt: 'Pó para magias e alquimia profana.', gameAssetHint: 'alquimia' },
  Banshee: { descriptionPt: 'Unidade profana invocável.', gameAssetHint: 'profano' },
  Cunhagem: D('Stunlock_Icon_Structure_Stash_Coins01', 'Moedas e cunhagem na base.'),
  'Poção de Resistência à Prata': {
    descriptionPt: 'Reduz dano de prata.',
    gameAssetHint: 'alquimia',
  },
  'Forno Avançado': D('Stunlock_Icon_Structure_Furnace', 'Forno para lingotes avançados.'),
  'Lingote de Prata Escura': E('Dark Silver Ingot', 'Lingote de prata escura.'),
  'Véu do Fantasma': E('Veil of Shadow', 'Feitiço Dash — Véu das Sombras.'),
  'Merlot de Sangue': { descriptionPt: 'Bebida / buff de Merlot de Sangue.', gameAssetHint: 'sangue' },
  'Disfarce de Barril': { descriptionPt: 'Disfarce em forma de barril.', gameAssetHint: 'barril' },
  'Gemas Impecáveis': { descriptionPt: 'Gemas de qualidade máxima.', gameAssetHint: 'gemas' },
  'Frasco de Resistência Sagrada': {
    descriptionPt: 'Frasco contra dano sagrado.',
    gameAssetHint: 'alquimia',
  },
  'Joias Maiores': D('Stunlock_Icon_Structure_Stash_Jewels01', 'Receitas de joias maiores.'),
  Ateneu: { descriptionPt: 'Estrutura de conhecimento em Gloomrot North.', gameAssetHint: 'oficina' },
  Esquema: { descriptionPt: 'Esquema de pesquisa desbloqueado.', gameAssetHint: 'ateneu' },
  'Slot de Passiva': { descriptionPt: 'Slot extra para passiva vampírica.' },
  'Elixir do Salgueiro Torcido': { descriptionPt: 'Elixir de Oakveil.', gameAssetHint: 'alquimia' },
  'Homogeneizador de Sangue': D('Stunlock_Icon_Structure_BloodPress', 'Processa sangue em recursos.'),
  'Enxame de Carniça': E('Carrion Swarm', 'Feitiço de Sangue tier 2.'),
  'Tear Avançado': D('Stunlock_Icon_Structure_Loom', 'Tear avançado.'),
  'Fio Fantasma': { descriptionPt: 'Fio espectral para alfaiataria.', gameAssetHint: 'tear' },
  'Curtume Avançado': D('Stunlock_Icon_Structure_Tannery', 'Curtume de tier superior.'),
  'Lingote de Ouro': E('Gold Ingot', 'Lingote de ouro.'),
  'Núcleo de Energia': { descriptionPt: 'Núcleo para estruturas elétricas.', gameAssetHint: 'fabricador' },
  EMP: { descriptionPt: 'Pulso eletromagnético — estrutura ou habilidade.', gameAssetHint: 'energia' },
  'Chicote Sanguíneo': E('Iron Whip', 'Chicote sanguíneo de Simon Belmont.'),
  'Forja de Fusão': D('Stunlock_Icon_Structure_ForgeFloor02', 'Forja de fusão lendária.'),
  'Lágrima de Ônix': { descriptionPt: 'Lágrima de ônix — crafting lendário.', gameAssetHint: 'gemas' },
  Brasão: { descriptionPt: 'Brasão de clã / decoração de castelo.', gameAssetHint: 'castelo' },
  'Trama Sombria': { descriptionPt: 'Material de armadura sombria.', gameAssetHint: 'sombria' },
  'Estilhaço de Solarus': E('Soul Shard of Solarus', 'Soul Shard — Solarus, o Imaculado.'),
  'Botas de Drácula': { descriptionPt: 'Peça do set Drácula (botas).', gameAssetHint: 'dracula' },
  'Estilhaço do Horror Alado': E('Soul Shard of the Winged Horror', 'Soul Shard — Talzur.'),
  'Luvas de Drácula': { descriptionPt: 'Peça do set Drácula (luvas).', gameAssetHint: 'dracula' },
  'Estilhaço do Monstro': E('Soul Shard of the Monster', 'Soul Shard — Adam.'),
  'Calças de Drácula': { descriptionPt: 'Peça do set Drácula (calças).', gameAssetHint: 'dracula' },
  'Estilhaço da Serpente': E('Soul Shard of the Serpent', 'Soul Shard — Megara.'),
  'Pedestal de Megara': { descriptionPt: 'Pedestal decorativo de Megara.', gameAssetHint: 'serpente' },
  'Estilhaço de Drácula': E('Soul Shard of Dracula', 'Soul Shard — Drácula.'),
  'Peitoral de Drácula': { descriptionPt: 'Peça do set Drácula (peitoral).', gameAssetHint: 'dracula' },
  'Essência de Sangue Maior': E('Greater Blood Essence', 'Essência para crafting de sangue.'),
  'Fome de Sangue': { descriptionPt: 'Mecânica ligada à fome de sangue.', gameAssetHint: 'sangue' },
  'Bolsa de Couro de Morcego': D(
    'Stunlock_Icon_Structure_Stash_Tailoring02',
    'Bolsa extra de couro de morcego.'
  ),
  'Manto da Floresta': { descriptionPt: 'Capa da floresta amaldiçoada.', gameAssetHint: 'floresta' },
};

const items = {};
for (const label of [...labels].sort()) {
  items[label] = MAP[label] ?? {
    descriptionPt: `Recompensa desbloqueada: ${label}.`,
    gameAssetHint: label,
  };
}

const out = path.join(__dirname, '../client/src/data/reward-item-aliases.json');
fs.writeFileSync(out, JSON.stringify({ version: 1, items }, null, 2));
console.log('✓', out, Object.keys(items).length, 'itens');

/**
 * Resolve recompensas PT (estruturas, itens) → ícone + descrição.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { lookupUnlockAssetImage } from './unlock-asset-resolve.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ALIASES_PATH = path.join(__dirname, '../client/src/data/reward-item-aliases.json');

let _aliases = null;
export function loadRewardAliases() {
  if (!_aliases) {
    _aliases = JSON.parse(fs.readFileSync(ALIASES_PATH, 'utf-8')).items;
  }
  return _aliases;
}

function norm(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]/g, '');
}

function pickDescription(entity, fallback) {
  const d = entity?.description?.trim();
  if (d && d.length > 15 && d.length < 500) return d;
  return fallback;
}

function findManifestAsset(name, manifestByName) {
  if (!manifestByName) return null;
  const direct = manifestByName.get(name);
  if (direct) return direct.path;
  for (const [key, entry] of manifestByName) {
    if (key === name) return entry.path;
  }
  return null;
}

function fuzzyManifest(labelPt, manifestByName) {
  if (!manifestByName) return null;
  const n = norm(labelPt);
  const hints = [
    ['curtume', 'Tannery'],
    ['tear', 'Loom'],
    ['marcenaria', 'Sawmill'],
    ['serraria', 'Sawmill'],
    ['forja', 'ForgeFloor'],
    ['ferraria', 'ForgeFloor'],
    ['alquimia', 'AlchemyLab'],
    ['gemas', 'StoneCutting'],
    ['joalheria', 'Floor_JewelCrafting'],
    ['prensa', 'BloodPress'],
    ['papel', 'BloodPress'],
    ['prisao', 'PrisonCell'],
    ['celula', 'PrisonCell'],
    ['arena', 'ArenaStation'],
    ['teletransport', 'Teleporter'],
    ['forno', 'Furnace'],
    ['tumulo', 'Coffin'],
    ['estabulo', 'Stable'],
    ['pescar', 'Stash_Fish'],
    ['fabricador', 'SimpleCraftingBench'],
    ['triturador', 'Furnace'],
    ['homogeneizador', 'BloodPress'],
    ['oficina', 'WorkshopSet01'],
    ['artesao', 'WorkshopSet01'],
    ['cunhagem', 'Stash_Coins'],
    ['devorador', 'BloodFountain'],
  ];
  for (const [needle, assetPart] of hints) {
    if (!n.includes(needle)) continue;
    for (const [key, entry] of manifestByName) {
      if (key.includes(assetPart) && key.startsWith('Stunlock_Icon_Structure_')) {
        return entry.path;
      }
    }
  }
  return null;
}

/**
 * @param {string} labelPt
 * @param {Map} entitiesByName
 * @param {Map} [manifestByName]
 * @param {Record<string,string>} [namePt]
 */
export function resolveMainRewardPt(labelPt, entitiesByName, manifestByName, namePt = {}) {
  const aliases = loadRewardAliases();
  const alias = aliases[labelPt];

  const base = { name: labelPt };

  const unlockIcon = lookupUnlockAssetImage({
    namePt: labelPt,
    nameEn: alias?.nameEn,
    manifestByName,
  });
  if (unlockIcon) {
    return {
      ...base,
      nameEn: alias?.nameEn || labelPt,
      image: unlockIcon,
      description: alias?.descriptionPt || `Recompensa desbloqueada: ${labelPt}.`,
    };
  }

  if (alias?.entity) {
    const key = norm(alias.entity);
    let hit = entitiesByName.get(key);
    if (!hit) {
      for (const e of entitiesByName.values()) {
        if (norm(e.nameEn || '') === key || norm(e.name || '') === key) {
          hit = e;
          break;
        }
      }
    }
    if (hit) {
      return {
        ...base,
        name: namePt[hit.nameEn] ?? hit.name ?? labelPt,
        nameEn: hit.nameEn || alias.entity,
        entityId: hit.id,
        entityType: hit.type,
        slug: hit.slug,
        image: hit.image || '',
        description: pickDescription(hit, alias.descriptionPt),
      };
    }
  }

  if (alias?.gameAsset) {
    const image = findManifestAsset(alias.gameAsset, manifestByName) || '';
    return {
      ...base,
      nameEn: alias.nameEn || labelPt,
      image,
      description: alias.descriptionPt,
    };
  }

  if (alias?.descriptionPt) {
    const image = alias.gameAssetHint
      ? fuzzyManifest(alias.gameAssetHint, manifestByName)
      : fuzzyManifest(labelPt, manifestByName);
    return { ...base, image: image || '', description: alias.descriptionPt };
  }

  const fuzzyImg = fuzzyManifest(labelPt, manifestByName);
  if (fuzzyImg) {
    return {
      ...base,
      image: fuzzyImg,
      description: `Receita ou estrutura desbloqueada: ${labelPt}.`,
    };
  }

  const guessKey = norm(labelPt);
  const hit = entitiesByName.get(guessKey);
  if (hit) {
    return {
      ...base,
      name: namePt[hit.nameEn] ?? hit.name,
      nameEn: hit.nameEn,
      entityId: hit.id,
      entityType: hit.type,
      slug: hit.slug,
      image: hit.image || '',
      description: pickDescription(hit, `Item desbloqueado: ${labelPt}.`),
    };
  }

  return {
    ...base,
    description: `Recompensa desbloqueada ao derrotar este chefe: ${labelPt}.`,
  };
}

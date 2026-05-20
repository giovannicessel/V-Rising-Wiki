/**
 * Mescla Fandom (textos) + assets do jogo (imagens) → entities.json
 * Uso: node scripts/build-entities.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  sanitizeWikiText,
  sanitizeInfobox,
  pickReadableSections,
  pickBossSections,
  cleanLocationText,
  isLowQualityText,
} from '../shared/wiki-sanitize.mjs';
import { resolveMainRewardPt } from '../shared/resolve-reward-item.mjs';
import { lookupUnlockAssetImage } from '../shared/unlock-asset-resolve.mjs';
import { parseCraftTable } from '../shared/parse-wiki-craft.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAW = path.join(__dirname, '../client/src/data/entities.raw.json');
const MANIFEST = path.join(__dirname, '../client/public/assets/game/manifest.json');
const OUT = path.join(__dirname, '../client/src/data/entities.json');
const CURATED_V11_PATH = path.join(__dirname, '../client/src/data/boss-rewards-v11.json');
const SPELL_PROGRESSION_PATH = path.join(
  __dirname,
  '../client/src/data/spell-school-progression.json'
);

const SCHOOL_PT_LABEL = {
  Blood: 'Sangue',
  Chaos: 'Caos',
  Frost: 'Gelo',
  Storm: 'Tempestade',
  Unholy: 'Profano',
  Illusion: 'Ilusão',
  Shadow: 'Sombra',
};

const CURATED_V11 = JSON.parse(fs.readFileSync(CURATED_V11_PATH, 'utf8')).bosses;
const SPELL_PROGRESSION = JSON.parse(fs.readFileSync(SPELL_PROGRESSION_PATH, 'utf8')).schools;

const SPELL_NAME_ALIASES = {
  'Shadow Bolt': 'Shadowbolt',
  'Chains of Death': 'Unholy Chains',
};

const PORTRAIT_ALIASES = {
  'Alpha the White Wolf': 'AlphaWolf',
  'Keely the Frost Archer': 'KeelyFrostArcher',
  'Vincent the Frostbringer': 'VincentFrostbringer',
  'Tristan the Vampire Hunter': 'TristanVampireHunter',
  'Solarus the Immaculate': 'SolarusImmaculate',
  'Dracula the Immortal King': 'Dracula',
  'Adam the Firstborn': 'Adam',
  'Jade the Vampire Hunter': 'JadeVampireHunter',
};

const SPELL_ALIASES = {
  'Veil of Blood': 'VeilOfBlood',
  'Veil of Frost': 'VeilOfFrost',
  'Veil of Chaos': 'VeilOfChaos',
  'Veil of Bones': 'VeilOfBones',
  'Veil of Illusion': 'VeilOfIllusion',
  'Veil of Storm': 'VeilOfStorm',
  'Veil of Shadow': 'VeilOfShadow',
  'Blood Rage': 'BloodRage',
  'Blood Rite': 'BloodRite',
  'Blood Storm': 'BloodStorm',
  'Blood Fountain': 'BloodFountain',
  'Wolf Form': 'WolfForm',
  'Rat Form': 'RatForm',
  'Bear Form': 'BearForm',
  'Spider Form': 'SpiderForm',
  'Toad Form': 'ToadForm',
  'Bat Form': 'BatForm',
  'Human Form': 'HumanForm',
  'Shadow Bolt': 'Shadowbolt',
  'Chains of Death': 'Unholy Chains',
};

const NAME_PT = {
  'Blood Rage': 'Fúria de Sangue',
  'Blood Fountain': 'Fonte de Sangue',
  'Veil of Shadow': 'Véu das Sombras',
  'Veil of Blood': 'Véu de Sangue',
  'Veil of Frost': 'Véu de Gelo',
  'Veil of Chaos': 'Véu de Caos',
  'Veil of Bones': 'Véu de Ossos',
  'Veil of Illusion': 'Véu de Ilusão',
  'Veil of Storm': 'Véu de Tempestade',
  'Wolf Form': 'Forma de Lobo',
  'Rat Form': 'Forma de Rato',
  'Bear Form': 'Forma de Urso',
  'Spider Form': 'Forma de Aranha',
  'Toad Form': 'Forma de Sapo',
  'Bat Form': 'Forma de Morcego',
  'Human Form': 'Forma Humana',
  'Blood Storm': 'Tempestade de Sangue',
  'Blood Rite': 'Rito de Sangue',
  'Alpha the White Wolf': 'Alpha, o Lobo Branco',
  'Keely the Frost Archer': 'Keely, a Arqueira do Gelo',
  'Vincent the Frostbringer': 'Vincent, o Portador do Gelo',
  'Tristan the Vampire Hunter': 'Tristan, o Caçador de Vampiros',
  'Solarus the Immaculate': 'Solarus, o Imaculado',
  'Dracula the Immortal King': 'Drácula, o Rei Imortal',
  'Blood Essence': 'Essência de Sangue',
  'Primal Blood Essence': 'Essência de Sangue Primordial',
  'Soul Shard of Dracula': 'Fragmento de Alma de Drácula',
};

const SECTION_TITLE_PT = {
  Overview: 'Visão geral',
  'Video Showcase': 'Demonstração em vídeo',
  'Unlock Requirement': 'Requisito de desbloqueio',
  History: 'Histórico',
  Location: 'Localização',
  Rewards: 'Recompensas',
  Items: 'Itens',
};

const REGION_FROM_LOCATION = [
  { match: /farbane/i, region: 'Farbane Woods', act: 1 },
  { match: /dunley/i, region: 'Dunley Farmlands', act: 2 },
  { match: /silverlight/i, region: 'Silverlight Hills', act: 3 },
  { match: /mortium/i, region: 'Ruins of Mortium', act: 4 },
  { match: /cursed forest/i, region: 'Cursed Forest', act: 3 },
  { match: /gloomrot/i, region: 'Gloomrot', act: 3 },
  { match: /oakveil/i, region: 'Oakveil Woodlands', act: 4 },
  { match: /hallowed/i, region: 'Hallowed Mountains', act: 3 },
];

function inferRegionAct(entity) {
  const loc = `${entity.location || ''} ${entity.description || ''}`;
  for (const r of REGION_FROM_LOCATION) {
    if (r.match.test(loc)) return { region: r.region, act: r.act };
  }
  if (entity.level != null) {
    if (entity.level <= 30) return { region: 'Farbane Woods', act: 1 };
    if (entity.level <= 55) return { region: 'Dunley Farmlands', act: 2 };
    if (entity.level <= 75) return { region: 'Silverlight Hills', act: 3 };
    return { region: 'Ruins of Mortium', act: 4 };
  }
  return {};
}

function buildAssetPatterns(entity) {
  const compact =
    PORTRAIT_ALIASES[entity.title] ||
    SPELL_ALIASES[entity.title] ||
    entity.title.replace(/[^a-zA-Z0-9]/g, '');
  const title = compact;
  const patterns = [];

  if (entity.type === 'boss') {
    patterns.push(`Portrait_Small_Normal_${title}`);
    patterns.push(`Portrait_Small_Normal_${title.replace(/the/gi, '')}`);
  }

  if (entity.type === 'spell') {
    const school = (entity.school || '').replace(/\s/g, '');
    const spell = title.replace(/^(Blood|Chaos|Frost|Storm|Shadow|Unholy|Illusion)/i, '');
    if (school) {
      patterns.push(`Stunlock_Icon_Ability_Spell_${school}_${spell}`);
      patterns.push(`Stunlock_Icon_Ability_Spell_${school}_${title}`);
    }
    patterns.push(`Stunlock_Icon_Ability_Spell_Blood_${title}`);
    patterns.push(`Stunlock_Icon_Ability_${title}`);
  }

  if (entity.type === 'weapon') {
    patterns.push(`Stunlock_Icon_Ability_Weapon_${title}`);
    patterns.push(`Stunlock_Icon_Ability_Weapon_${title.replace(/\s/g, '')}`);
    const wt = (entity.weaponType || '').replace(/\s/g, '');
    if (wt) patterns.push(`Stunlock_Icon_Ability_Weapon_${wt}_${title}`);
  }

  if (entity.type === 'item' || entity.type === 'jewel') {
    patterns.push(`Stunlock_Icon_Item_${title}`);
    patterns.push(`MapIcon_SoulShard_${title}`);
    patterns.push(`Jewelry_${title}`);
  }

  patterns.push(title);
  return patterns;
}

function loadManifestIndex() {
  if (!fs.existsSync(MANIFEST)) return new Map();
  const list = JSON.parse(fs.readFileSync(MANIFEST, 'utf-8'));
  const byName = new Map();
  for (const item of list) {
    if (item.name) byName.set(item.name, item);
  }
  return byName;
}

function isBadSpellAsset(name) {
  return (
    name.includes('Structure_') ||
    name.includes('Structure') ||
    name.includes('MapIcon_') ||
    name.includes('Portrait_')
  );
}

function resolveGameImage(entity, byName) {
  for (const pat of buildAssetPatterns(entity)) {
    const direct = byName.get(pat);
    if (direct) {
      if (entity.type === 'spell' && isBadSpellAsset(direct.name)) continue;
      return direct;
    }
    for (const [name, entry] of byName) {
      if (
        name.includes(pat) &&
        !name.includes('Smoke') &&
        !name.includes('Disabled') &&
        !name.includes('Frame')
      ) {
        if (entity.type === 'boss' && name.includes('Portrait')) return entry;
        if (entity.type === 'spell' || entity.type === 'weapon') {
          if (!name.includes('Icon')) continue;
          if (entity.type === 'spell' && isBadSpellAsset(name)) continue;
          return entry;
        }
        if (
          (entity.type === 'item' || entity.type === 'jewel') &&
          (name.includes('Icon') || name.includes('SoulShard') || name.includes('Jewelry'))
        )
          return entry;
      }
    }
  }
  return null;
}

function findSection(sections, pattern) {
  return sections?.find((s) => pattern.test(s.title));
}

function mergeSectionBodies(sections, pattern) {
  return sections
    ?.filter((s) => pattern.test(s.title))
    .map((s) => sanitizeWikiText(s.body || ''))
    .filter((b) => b.length > 10)
    .join('\n\n');
}

function parseListLines(text) {
  if (!text) return [];
  return text
    .split('\n')
    .map((l) => l.replace(/^[\*#:\-\s]+/, '').trim())
    .filter((l) => l.length > 2 && l !== '*');
}

function resolveUnlockName(name, entitiesByName, manifestByName) {
  const alias = SPELL_ALIASES[name];
  const key = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const aliasKey = alias?.toLowerCase().replace(/[^a-z0-9]/g, '');
  const hit =
    entitiesByName.get(key) ||
    (aliasKey && entitiesByName.get(aliasKey)) ||
    entitiesByName.get(name.toLowerCase().replace(/\s/g, ''));

  const manifestImage = lookupUnlockAssetImage({
    nameEn: name,
    namePt: NAME_PT[name],
    manifestByName,
  });

  if (!hit) {
    return {
      name: NAME_PT[name] ?? name,
      nameEn: name,
      image: manifestImage || '',
      description: manifestImage
        ? `Poder ou habilidade vampírica: ${NAME_PT[name] ?? name}.`
        : undefined,
    };
  }

  return {
    name: NAME_PT[name] ?? hit.name,
    nameEn: hit.nameEn || name,
    entityId: hit.id,
    entityType: hit.type,
    slug: hit.slug,
    image: hit.image || manifestImage || '',
    school: hit.school,
  };
}

function spellPointLabelPt(spellPoint) {
  const school = SCHOOL_PT_LABEL[spellPoint.school] || spellPoint.school;
  if (spellPoint.ultimate || spellPoint.tier === 3) {
    return `Ponto de ${school} (Tier 3 — Ultimate)`;
  }
  return `Ponto de ${school} (Tier ${spellPoint.tier})`;
}

function normSpellName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function namesMatchSpell(a, b) {
  const na = normSpellName(a);
  const nb = normSpellName(b);
  if (na === nb) return true;
  const aliasA = SPELL_NAME_ALIASES[a] ?? a;
  const aliasB = SPELL_NAME_ALIASES[b] ?? b;
  return normSpellName(aliasA) === nb || normSpellName(aliasB) === na;
}

function resolveSpellCatalogName(name) {
  return SPELL_NAME_ALIASES[name] ?? name;
}

function spellPointCategory(spellPoint) {
  if (spellPoint.ultimate || spellPoint.tier === 3) return 'ultimate';
  if (spellPoint.tier === 2) return 'tier2';
  return 'tier1';
}

function choicesForSpellPoint(spellPoint, idx, manifestByName) {
  const school = SPELL_PROGRESSION[spellPoint.school];
  if (!school) return [];
  let names = [];
  if (spellPoint.tier === 1) names = school.tier1;
  else if (spellPoint.tier === 2) names = school.tier2;
  else if (spellPoint.tier === 3 || spellPoint.ultimate) names = school.ultimate;
  return names.map((n) =>
    resolveUnlockName(resolveSpellCatalogName(n), idx, manifestByName)
  );
}

function findSpellPlacementInProgression(nameEn) {
  for (const [school, tiers] of Object.entries(SPELL_PROGRESSION)) {
    if (tiers.tier1?.some((n) => namesMatchSpell(n, nameEn)))
      return { school, category: 'tier1', tier: 1 };
    if (tiers.tier2?.some((n) => namesMatchSpell(n, nameEn)))
      return { school, category: 'tier2', tier: 2 };
    if (tiers.ultimate?.some((n) => namesMatchSpell(n, nameEn)))
      return { school, category: 'ultimate', tier: 3 };
    if (tiers.dash?.some((n) => namesMatchSpell(n, nameEn)))
      return { school, category: 'dash' };
  }
  return null;
}

function tierNamesForPlacement(placement) {
  const s = SPELL_PROGRESSION[placement.school];
  if (!s) return [];
  if (placement.category === 'tier1') return s.tier1;
  if (placement.category === 'tier2') return s.tier2;
  if (placement.category === 'ultimate') return s.ultimate;
  if (placement.category === 'dash') return s.dash;
  return [];
}

function spellProgressionLabelPt(placement) {
  const school = SCHOOL_PT_LABEL[placement.school] || placement.school;
  switch (placement.category) {
    case 'tier1':
      return `Feitiço de ${school} — Tier 1`;
    case 'tier2':
      return `Feitiço de ${school} — Tier 2`;
    case 'ultimate':
      return `Ultimate de ${school} — Tier 3`;
    case 'dash':
      return `Dash (Veil) de ${school}`;
    default:
      return school;
  }
}

function enrichSpellMeta(entities) {
  const idx = buildEntitiesIndex(
    entities.filter((e) => ['spell', 'item', 'jewel', 'building'].includes(e.type))
  );
  const bosses = entities.filter((e) => e.type === 'boss');

  for (const entity of entities) {
    if (entity.type !== 'spell') continue;
    const nameEn = entity.nameEn || entity.name;
    const placement = findSpellPlacementInProgression(nameEn);
    if (!placement) continue;

    const tierNames = tierNamesForPlacement(placement);
    const peers = tierNames
      .filter((n) => !namesMatchSpell(n, nameEn))
      .map((n) => resolveUnlockName(resolveSpellCatalogName(n), idx));

    const spellPointBosses = bosses
      .filter((b) => {
        const pt = b.meta?.rewards?.spellPoint;
        if (!pt) return false;
        if (pt.school !== placement.school) return false;
        if (placement.category === 'ultimate') return pt.tier === 3 || pt.ultimate;
        if (placement.category === 'tier1') return pt.tier === 1;
        if (placement.category === 'tier2') return pt.tier === 2;
        return false;
      })
      .map((b) => ({
        bossId: b.id,
        bossName: b.name,
        bossSlug: b.slug,
        labelPt: b.meta.rewards.spellPoint.labelPt,
      }));

    let dashBoss;
    if (placement.category === 'dash') {
      const db = bosses.find((b) => {
        const d = b.meta?.rewards?.dashUnlock;
        return d && namesMatchSpell(d.nameEn ?? d.name, nameEn);
      });
      if (db) {
        dashBoss = {
          bossId: db.id,
          bossName: db.name,
          bossSlug: db.slug,
          labelPt: 'Dash (Veil) — desbloqueio direto',
        };
      }
    }

    entity.meta = {
      ...(entity.meta ?? {}),
      spellProgression: {
        school: placement.school,
        category: placement.category,
        tier: placement.tier,
        labelPt: spellProgressionLabelPt(placement),
        peers,
      },
      spellPointBosses: placement.category !== 'dash' ? spellPointBosses : undefined,
      dashBoss,
    };
  }
}

function buildCuratedBossRewards(entity, idx, manifestByName) {
  const c = CURATED_V11[entity.id];
  if (!c) return null;

  const rewards = {
    source: 'v1.1',
    hasSpellSchoolUnlock: false,
    spells: [],
    recipes: [],
    mainRewards: [],
    vampirePowers: [],
    primarySchool: undefined,
    spellPoint: undefined,
  };

  if (c.spellPoint) {
    const category = spellPointCategory(c.spellPoint);
    rewards.spellPoint = {
      school: c.spellPoint.school,
      tier: c.spellPoint.tier,
      ultimate: Boolean(c.spellPoint.ultimate),
      labelPt: spellPointLabelPt(c.spellPoint),
      category,
      choices: choicesForSpellPoint(c.spellPoint, idx, manifestByName),
    };
    rewards.primarySchool = c.spellPoint.school;
    rewards.hasSpellSchoolUnlock = true;
  }

  const VEIL_SCHOOL = {
    'Veil of Blood': 'Blood',
    'Veil of Frost': 'Frost',
    'Veil of Chaos': 'Chaos',
    'Veil of Bones': 'Unholy',
    'Veil of Illusion': 'Illusion',
    'Veil of Storm': 'Storm',
    'Veil of Shadow': 'Shadow',
  };

  if (c.veilSpellEn) {
    const veil = resolveUnlockName(c.veilSpellEn, idx, manifestByName);
    const veilSchool = veil.school || VEIL_SCHOOL[c.veilSpellEn] || rewards.primarySchool;
    rewards.dashUnlock = { ...veil, school: veilSchool };
    if (!rewards.primarySchool && veilSchool) rewards.primarySchool = veilSchool;
    rewards.hasSpellSchoolUnlock = true;
  }

  for (const en of c.vampirePowersEn ?? []) {
    rewards.vampirePowers.push(resolveUnlockName(en, idx, manifestByName));
  }

  const vampirePowerPt = new Set(
    (c.vampirePowersEn ?? []).map((en) => NAME_PT[en] ?? en)
  );

  if (c.mainRewardsPt?.length) {
    rewards.mainRewards = c.mainRewardsPt
      .filter((name) => !vampirePowerPt.has(name))
      .map((name) => resolveMainRewardPt(name, idx, manifestByName, NAME_PT));
  }

  return rewards;
}

function getCuratedBossFields(entity) {
  const c = CURATED_V11[entity.id];
  if (!c) return {};
  return {
    act: c.act,
    locationPt: c.locationPt,
  };
}

function buildEntitiesIndex(allEntities) {
  const map = new Map();
  for (const e of allEntities) {
    const keys = [
      e.nameEn?.toLowerCase().replace(/[^a-z0-9]/g, ''),
      e.name?.toLowerCase().replace(/[^a-z0-9]/g, ''),
      e.slug?.toLowerCase().replace(/[^a-z0-9]/g, ''),
      e.id?.replace(/-/g, ''),
    ].filter(Boolean);
    for (const k of keys) map.set(k, e);
  }
  return map;
}

function extractMeta(entity, rawSections, entitiesByName, manifestByName) {
  const sections = rawSections ?? [];
  const infobox = entity.infobox ?? {};

  if (entity.type === 'boss') {
    const parsed = entity.parsedBoss ?? {};
    const parsedCombat = parsed.combat ?? {};
    const parsedRewards = parsed.rewards ?? {};

    const attacks = findSection(sections, /^attacks$/i)?.body;
    const fight =
      findSection(sections, /the fight/i)?.body ||
      findSection(sections, /equipment and abilities/i)?.body;
    const phasesFromSections = sections
      .filter((s) => /^phase \d/i.test(s.title))
      .map((s) => ({
        title: s.title,
        body: sanitizeWikiText(s.body || ''),
      }))
      .filter((p) => p.body.length > 20);

    const phases =
      parsedCombat.phases?.length > 0
        ? parsedCombat.phases.map((p) => ({
            title: p.title,
            body: sanitizeWikiText(p.body || ''),
          }))
        : phasesFromSections;

    const fightFromParsed = sanitizeWikiText(parsedCombat.fightGuide || '');
    const fightFromSections = [attacks, fight]
      .filter(Boolean)
      .map(sanitizeWikiText)
      .join('\n\n');
    const fightGuide = fightFromParsed || fightFromSections || undefined;

    const lootParts = [
      mergeSectionBodies(sections, /loot|drops/i),
      mergeSectionBodies(sections, /^items$/i),
    ].filter(Boolean);

    const idx = entitiesByName ?? new Map();
    const curated = buildCuratedBossRewards(entity, entitiesByName, manifestByName);

    let rewards = curated;
    if (!rewards) {
      const spells = (parsedRewards.spells ?? []).map((n) =>
        resolveUnlockName(n, idx, manifestByName)
      );
      const recipes = (parsedRewards.recipes ?? []).map((n) =>
        resolveUnlockName(n, idx, manifestByName)
      );
      const vampirePowers = (parsedRewards.vampirePowers ?? []).map((n) =>
        resolveUnlockName(n, idx, manifestByName)
      );

      let primarySchool = parsedRewards.primarySchool;
      if (spells.length) {
        const schoolCounts = {};
        for (const s of spells) {
          if (s.school) schoolCounts[s.school] = (schoolCounts[s.school] || 0) + 1;
        }
        const top = Object.entries(schoolCounts).sort((a, b) => b[1] - a[1])[0];
        if (top) primarySchool = top[0];
      }

      rewards = {
        source: 'fandom',
        primarySchool,
        hasSpellSchoolUnlock: Boolean(
          parsedRewards.hasSpellSchoolUnlock || primarySchool || spells.length
        ),
        spells,
        recipes,
        vampirePowers,
      };
    }

    return {
      lore: sanitizeWikiText(infobox.description || entity.description || ''),
      fightGuide: fightGuide || undefined,
      phases: phases.length ? phases : undefined,
      loot: lootParts.join('\n\n') || undefined,
      rewards,
    };
  }

  if (entity.type === 'spell') {
    const jewelSec = sections.filter((s) => /jewel/i.test(s.title));
    const jewels = jewelSec
      .map((s) => sanitizeWikiText(s.body || ''))
      .filter((b) => b.length > 5)
      .join('\n\n');

    return {
      unlockRequirement: sanitizeWikiText(
        findSection(sections, /unlock/i)?.body || infobox.requirements || ''
      ),
      jewels: jewels || undefined,
    };
  }

  if (entity.type === 'item' || entity.type === 'weapon') {
    const craftBody =
      findSection(sections, /^crafting$/i)?.body ||
      findSection(sections, /^recipes?$/i)?.body ||
      '';
    const craftRecipe = parseCraftTable(craftBody);
    const craftsFromSections = mergeSectionBodies(sections, /recipes?|crafting/i);
    const crafts =
      craftRecipe?.summary ||
      craftsFromSections ||
      sanitizeWikiText(infobox.recipe || infobox.crafting || '') ||
      undefined;

    return {
      craftRecipe: craftRecipe || undefined,
      crafts: crafts || undefined,
      drops: mergeSectionBodies(sections, /drop|source|obtain/i) || undefined,
      requirements:
        sanitizeWikiText(
          findSection(sections, /unlock|requirement/i)?.body ||
            infobox.requirements ||
            infobox.unlock ||
            ''
        ) || undefined,
    };
  }

  if (entity.type === 'jewel') {
    const craftRecipe = parseCraftTable(
      findSection(sections, /^crafting$/i)?.body || ''
    );
    return {
      craftRecipe: craftRecipe || undefined,
      requirements:
        sanitizeWikiText(
          findSection(sections, /soul shard mechanics/i)?.body ||
            findSection(sections, /mechanics|usage/i)?.body ||
            ''
        ).slice(0, 4000) || undefined,
    };
  }

  return {};
}

function infoboxLocation(e) {
  return e.infobox?.location || '';
}

function pickDescription(entity) {
  const direct = sanitizeWikiText(entity.description || '');
  if (direct && !isLowQualityText(direct) && direct.length > 15) return direct;
  const section = entity.sections?.find((s) =>
    /description|about|overview|visão/i.test(s.title)
  );
  const fromSection = sanitizeWikiText(section?.body || '');
  if (fromSection && !isLowQualityText(fromSection)) return fromSection.slice(0, 800);
  return '';
}

function normalizeWeaponType(e) {
  let wt = (e.weaponType || '').replace(/\}\}/g, '').trim();
  if (!wt || /structure/i.test(wt)) {
    wt = (e.infobox?.weapon_type || e.infobox?.type || '').trim();
  }
  return wt || undefined;
}

function mapEntity(e, byName, unlockIndex) {
  const asset = resolveGameImage(e, byName);
  let image = asset?.path ?? '';
  let imageSource = asset ? 'game' : 'none';

  if (
    e.type === 'spell' &&
    (!image || (asset?.name && isBadSpellAsset(asset.name)))
  ) {
    if (e.imageRemote) {
      image = e.imageRemote;
      imageSource = 'fandom';
    }
  } else if (!image && e.imageRemote) {
    image = e.imageRemote;
    imageSource = 'fandom';
  }

  const description = pickDescription(e);
  const nameEn = e.title;
  const name = NAME_PT[nameEn] ?? nameEn;
  const curatedFields = e.type === 'boss' ? getCuratedBossFields(e) : {};
  const { region, act: inferredAct } = inferRegionAct(e);
  const act = curatedFields.act ?? inferredAct;

  const rawSections = e.sections ?? [];
  const sectionSource =
    e.type === 'boss' ? pickBossSections(rawSections) : pickReadableSections(rawSections);

  const sections = sectionSource.map((s) => ({
    ...s,
    titlePt: SECTION_TITLE_PT[s.title] ?? s.title,
  }));

  const meta = extractMeta(e, rawSections, unlockIndex, byName);
  const location =
    curatedFields.locationPt ||
    cleanLocationText(e.location || infoboxLocation(e)) ||
    undefined;

  const youtubeId =
    e.youtubeId ||
    sections.find((s) => s.youtubeId)?.youtubeId ||
    sections.find((s) => /video/i.test(s.title))?.youtubeId;

  return {
    id: e.id,
    slug: e.slug,
    type: e.type,
    name,
    nameEn,
    school: e.school || undefined,
    weaponType: e.type === 'weapon' ? normalizeWeaponType(e) : e.weaponType || undefined,
    level: e.level,
    act,
    region,
    location,
    meta: Object.keys(meta).length ? meta : undefined,
    description,
    descriptionSource: description ? 'fandom' : 'none',
    image,
    imageSource,
    gameAssetName: asset?.name,
    fandomUrl: e.fandomUrl,
    infobox: sanitizeInfobox(e.infobox),
    sections,
    youtubeId,
    syncedAt: e.syncedAt,
  };
}

/** Habilidades de arma do manifest sem página Fandom dedicada */
function appendManifestWeapons(byName, existingIds) {
  const added = [];
  for (const [name, asset] of byName) {
    if (!name.startsWith('Stunlock_Icon_Ability_Weapon_')) continue;
    if (name.includes('Smoke') || name.includes('Disabled') || name.includes('Frame'))
      continue;
    const id = name.toLowerCase().replace(/[^\w]+/g, '-');
    if (existingIds.has(id)) continue;

    const suffix = name.replace('Stunlock_Icon_Ability_Weapon_', '');
    const display = suffix.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ');

    added.push({
      id,
      slug: name,
      type: 'weapon',
      name: display,
      nameEn: display,
      description: '',
      descriptionSource: 'none',
      image: asset.path,
      imageSource: 'game',
      gameAssetName: name,
      fandomUrl: '',
      infobox: {},
      sections: [],
      syncedAt: new Date().toISOString(),
    });
    existingIds.add(id);
  }
  return added;
}

function main() {
  if (!fs.existsSync(RAW)) {
    console.error('Execute primeiro: node scripts/sync-fandom-entities.mjs');
    process.exit(1);
  }

  const { entities: raw } = JSON.parse(fs.readFileSync(RAW, 'utf-8'));
  const byName = loadManifestIndex();

  const unlockSource = raw.filter((e) =>
    ['spell', 'item', 'jewel', 'building', 'weapon'].includes(e.type)
  );
  const unlockIndex = buildEntitiesIndex(unlockSource.map((e) => mapEntity(e, byName)));

  const entities = raw.map((e) => mapEntity(e, byName, unlockIndex));
  const ids = new Set(entities.map((e) => e.id));
  entities.push(...appendManifestWeapons(byName, ids));

  enrichSpellMeta(entities);

  const stats = {
    total: entities.length,
    bosses: entities.filter((e) => e.type === 'boss').length,
    spells: entities.filter((e) => e.type === 'spell').length,
    items: entities.filter((e) => e.type === 'item').length,
    jewels: entities.filter((e) => e.type === 'jewel').length,
    weapons: entities.filter((e) => e.type === 'weapon').length,
    buildings: entities.filter((e) => e.type === 'building').length,
    gameImages: entities.filter((e) => e.imageSource === 'game').length,
    fandomImages: entities.filter((e) => e.imageSource === 'fandom').length,
    withDescription: entities.filter((e) => e.description?.length > 20).length,
    withVideo: entities.filter((e) => e.youtubeId || e.sections?.some((s) => s.youtubeId))
      .length,
  };

  fs.writeFileSync(OUT, JSON.stringify({ stats, entities }, null, 2));
  console.log('✓ entities.json', stats);
}

main();

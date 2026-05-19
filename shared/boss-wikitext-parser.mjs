/**
 * Extrai recompensas e combate do wikitext bruto de páginas V Blood (Fandom).
 */

const SPELL_SCHOOLS = [
  'Blood',
  'Chaos',
  'Frost',
  'Storm',
  'Unholy',
  'Illusion',
  'Shadow',
];

function stripTemplates(text) {
  let t = text;
  let prev;
  do {
    prev = t;
    t = t.replace(/\{\{[^{}]*\}\}/g, '');
    t = t.replace(/\{\{[\s\S]*?\}\}/g, '');
  } while (t !== prev);
  return t;
}

function cleanListText(raw) {
  return stripTemplates(raw)
    .replace(/<[^>]+>/g, '')
    .replace(/''+/g, '')
    .replace(/\[\[([^\]|#]+)(?:#[^\]|]+)?\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]|#]+)\]\]/g, '$1')
    .replace(/^[\s#:*]+/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function parseTemplateName(block, template) {
  const re = new RegExp(`\\{\\{${template}\\|([^}|#]+)(?:\\|display=([^}|]+))?`, 'gi');
  const out = [];
  let m;
  while ((m = re.exec(block)) !== null) {
    const name = (m[2] || m[1]).trim();
    if (name && name.length > 1) out.push(name);
  }
  return out;
}

function schoolFromAbilityName(name) {
  const n = name.trim();
  for (const school of SPELL_SCHOOLS) {
    if (new RegExp(`^${school}\\s+Tier\\s*\\d`, 'i').test(n)) return school;
    if (new RegExp(`^${school}\\s+Tier`, 'i').test(n)) return school;
  }
  return undefined;
}

function isSpellSchoolUnlock(name) {
  if (/tier\s*\d/i.test(name) && SPELL_SCHOOLS.some((s) => name.includes(s))) return true;
  if (/spell\s*point/i.test(name)) return true;
  return false;
}

function isVampirePowerOnly(names) {
  if (!names.length) return false;
  return names.every(
    (n) =>
      /form$/i.test(n) ||
      /vampire\s*power/i.test(n) ||
      (!isSpellSchoolUnlock(n) &&
        !SPELL_SCHOOLS.some((s) => n.toLowerCase().includes(s.toLowerCase())))
  );
}

/**
 * @returns {{
 *   spells: string[];
 *   recipes: string[];
 *   vampirePowers: string[];
 *   primarySchool?: string;
 *   hasSpellSchoolUnlock: boolean;
 * }}
 */
export function parseBossRewards(wikitext) {
  if (!wikitext) {
    return { spells: [], recipes: [], vampirePowers: [], hasSpellSchoolUnlock: false };
  }

  const rewardsBlock = wikitext.split(/==\s*Rewards\s*==/i)[1] ?? wikitext;
  const infoboxBlock = wikitext.slice(0, 4000);

  const abilities = [
    ...parseTemplateName(infoboxBlock, 'Ability'),
    ...parseTemplateName(rewardsBlock, 'Ability'),
  ];
  const items = [
    ...parseTemplateName(infoboxBlock, 'ItemFrame'),
    ...parseTemplateName(rewardsBlock, 'ItemFrame'),
  ];

  const spells = [];
  const vampirePowers = [];
  const seen = new Set();

  for (const name of abilities) {
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    if (isSpellSchoolUnlock(name)) continue;

    if (/form$/i.test(name) || /shapeshift/i.test(name)) {
      vampirePowers.push(name);
    } else if (!/spell\s*point/i.test(name) && !/tier\s*\d\s*$/i.test(name)) {
      spells.push(name);
    }
  }

  const recipes = [];
  const seenItems = new Set();
  for (const name of items) {
    const key = name.toLowerCase();
    if (seenItems.has(key)) continue;
    if (/recipebook|tier\s*\d\s*armour\s*recipe/i.test(name)) continue;
    seenItems.add(key);
    recipes.push(name);
  }

  let primarySchool;
  for (const name of abilities) {
    const s = schoolFromAbilityName(name);
    if (s) {
      primarySchool = s;
      break;
    }
  }

  const hasSpellSchoolUnlock = Boolean(primarySchool) || spells.length > 0;

  return {
    spells: [...new Set(spells)],
    recipes: [...new Set(recipes)],
    vampirePowers: [...new Set(vampirePowers)],
    primarySchool,
    hasSpellSchoolUnlock,
  };
}

/**
 * @returns {{ fightGuide: string; phases: { title: string; body: string }[] }}
 */
export function parseBossCombat(wikitext) {
  if (!wikitext) return { fightGuide: '', phases: [] };

  const parts = wikitext.split(/^==+([^=]+)==+/gm);
  let attacks = '';
  const phases = [];
  const fightParts = [];

  for (let i = 1; i < parts.length; i += 2) {
    const title = (parts[i] || '').trim();
    const rawBody = parts[i + 1] ?? '';
    const body = cleanListText(rawBody);
    if (body.length < 20) continue;

    if (/^attacks$/i.test(title)) attacks = body;
    else if (/^phase\s+\d/i.test(title)) phases.push({ title, body });
    else if (/the fight|equipment and abilities/i.test(title)) fightParts.push(body);
  }

  const fightGuide = [attacks, ...fightParts].filter(Boolean).join('\n\n');

  return { fightGuide, phases };
}

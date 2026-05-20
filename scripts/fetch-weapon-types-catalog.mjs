/**
 * Catálogo por tipo de arma: skills, passiva comum, variantes (gear + poder físico).
 * Saída: client/src/data/weapons-catalog.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sanitizeWikiText } from '../shared/wiki-sanitize.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENTITIES = path.join(__dirname, '../client/src/data/entities.json');
const OUT = path.join(__dirname, '../client/src/data/weapons-catalog.json');
const API = 'https://vrising.fandom.com/api.php';

/** Página Fandom real (plurais como Swords/Reapers são #REDIRECT para singular). */
const TYPE_FANDOM_PAGE = {
  Sword: 'Sword',
  Axes: 'Axes',
  Mace: 'Mace',
  Spear: 'Spear',
  Reaper: 'Reaper',
  Slashers: 'Slashers',
  Whip: 'Whip',
  Greatsword: 'Greatsword',
  Crossbow: 'Crossbow',
  Longbow: 'Longbow',
  Pistols: 'Pistols',
  Daggers: 'Daggers',
  Claws: 'Claws',
};

const TYPE_PT = {
  Sword: 'Espadas',
  Axes: 'Machados',
  Mace: 'Maças',
  Spear: 'Lanças',
  Reaper: 'Ceifadoras',
  Slashers: 'Lâminas',
  Whip: 'Chicotes',
  Greatsword: 'Espadões',
  Crossbow: 'Bestas',
  Longbow: 'Arcos longos',
  Pistols: 'Pistolas',
  Daggers: 'Adagas',
  Claws: 'Garras',
};

const TIER_ORDER = [
  'bone',
  'reinforced',
  'copper',
  'merciless-copper',
  'iron',
  'merciless-iron',
  'rare-ancestral',
  'dark-silver',
  'sanguine',
  'epic-ancestral',
  'legendary',
  'other',
];

function tierSortKey(id) {
  const lower = id.toLowerCase();
  for (let i = 0; i < TIER_ORDER.length; i++) {
    if (TIER_ORDER[i] === 'other') return 99;
    if (lower.includes(TIER_ORDER[i].replace(/-/g, '')) || lower.startsWith(TIER_ORDER[i]))
      return i;
  }
  if (/^the-/.test(lower) || /lumberjack|miner/.test(lower)) return 90;
  return 50;
}

function parsePassive(wikitext) {
  const q = wikitext.match(/\{\{Quote\|([^|]+)/);
  if (!q) return '';
  return sanitizeWikiText(q[1].replace(/<br\s*\/?>/gi, ' '))
    .replace(/\[\[([^\]|#]+)(?:\|[^\]]*)?\]\]/g, '$1')
    .replace(/'''\+25%'''/g, '+25%')
    .replace(/'''/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function extractIconFile(row) {
  const m = row.match(/\[\[File:([^|\]]+\.(?:png|webp|jpg|gif))/i);
  return m ? m[1].trim().replace(/ /g, '_') : null;
}

function parseSkillTables(wikitext) {
  const block =
    wikitext.match(/==[^=\n]+ Skills==([\s\S]*?)(?===List of|==List of|$)/i)?.[1] ?? '';
  const skills = [];
  const rows = block.split(/\|-/).slice(1);
  for (const row of rows) {
    const lines = row.split('\n').map((l) => l.replace(/^\|/, '').trim()).filter(Boolean);
    if (!lines.length) continue;
    const titleLine = lines.find((l) => /'''/.test(l)) ?? lines[0];
    const nameMatch = titleLine.match(/'''([^']+)'''/);
    const name = nameMatch?.[1]?.trim() ?? '';
    if (!name || /Skill|Description/i.test(name)) continue;

    const descLine = lines.find((l) => l.includes("style=\"text-align: left\"") || /physical damage/i.test(l)) ?? '';
    const description = sanitizeWikiText(
      descLine.replace(/style="text-align: left"\s*\|/i, '').replace(/'''/g, '')
    );

    const comboDps = lines.find((l) => /\d+\.?\d*%/.test(l) && /Blue|DPS/i.test(l))?.match(/([\d.]+%)/)?.[1];
    const unlockMatch = row.match(/\[\[([^\]|#]+)/g);
    const unlockNames = unlockMatch?.map((m) => m.replace(/\[\[/, '').replace(/_/g, ' ')) ?? [];
    const unlockWeapon = unlockNames.filter((n) => !/\.(png|webp)/i.test(n)).pop();

    const iconFile = extractIconFile(row);

    const cleanName = name.replace(/<br\s*\/?>/gi, ' ').trim();
    const slot =
      cleanName === 'Primary'
        ? 'primary'
        : cleanName.match(
            /^(Frenzy|Whirlwind|Crushing|Multishot|Howling|A Thousand|Elusive|Fan the|Rain of Bolts|Throw Dagger|Lunge)/i
          )
          ? 'q'
          : 'e';

    skills.push({
      slot,
      name: cleanName,
      description,
      comboDps: comboDps || undefined,
      unlockWeapon: unlockWeapon || undefined,
      iconFile: iconFile || undefined,
    });
  }
  return skills;
}

async function fetchFandomImageUrls(fileNames) {
  const map = new Map();
  const unique = [...new Set(fileNames.filter(Boolean))];
  for (let i = 0; i < unique.length; i += 20) {
    const batch = unique.slice(i, i + 20);
    const titles = batch.map((f) => `File:${f}`).join('|');
    const res = await fetch(
      `${API}?${new URLSearchParams({
        action: 'query',
        titles,
        prop: 'imageinfo',
        iiprop: 'url',
        format: 'json',
      })}`,
      { headers: { 'User-Agent': 'VRisingDarkWiki/1.0' } }
    );
    const data = await res.json();
    for (const page of Object.values(data.query?.pages ?? {})) {
      const url = page.imageinfo?.[0]?.url;
      if (!url || !page.title) continue;
      const file = page.title.replace(/^File:/, '').replace(/ /g, '_');
      for (const orig of batch) {
        if (orig.replace(/ /g, '_') === file) map.set(orig, url);
      }
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  return map;
}

function parseWeaponInfobox(wikitext) {
  const gear = wikitext.match(/\|\s*gear_level\s*=\s*(\d+)/i)?.[1];
  const power = wikitext.match(/\|\s*physical_power\s*=\s*([\d.]+)/i)?.[1];
  const stats = wikitext.match(/\|\s*stats\s*=\s*([^\n|]+)/i)?.[1];
  return {
    gearLevel: gear ? Number(gear) : undefined,
    physicalPower: power ? Number(power) : undefined,
    bonus: stats ? sanitizeWikiText(stats) : undefined,
  };
}

async function fetchWikitext(page) {
  const res = await fetch(
    `${API}?${new URLSearchParams({ action: 'parse', page, prop: 'wikitext', format: 'json' })}`,
    { headers: { 'User-Agent': 'VRisingDarkWiki/1.0' } }
  );
  const data = await res.json();
  return data.parse?.wikitext?.['*'] ?? '';
}

function isCategoryPage(entity, weaponType) {
  if (entity.id.startsWith('stunlock_')) return true;
  const slug = entity.slug.toLowerCase();
  const type = weaponType.toLowerCase();
  return slug === type || entity.id === type;
}

function isLegendaryId(id) {
  if (/^the-/.test(id)) return true;
  if (/lumberjack|miner-s-mace|apocalypse|oaksong|gravecaller/i.test(id)) return true;
  return false;
}

async function main() {
  const { entities } = JSON.parse(fs.readFileSync(ENTITIES, 'utf-8'));
  const weapons = entities.filter((e) => e.type === 'weapon' && !e.id.startsWith('stunlock_'));

  const byType = new Map();
  for (const w of weapons) {
    const t = w.weaponType;
    if (!t) continue;
    if (!byType.has(t)) byType.set(t, []);
    byType.get(t).push(w);
  }

  const types = [];

  for (const [weaponType, list] of [...byType.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    const fandomPage = TYPE_FANDOM_PAGE[weaponType];
    if (!fandomPage) continue;

    const variants = list
      .filter((e) => !isCategoryPage(e, weaponType))
      .sort((a, b) => tierSortKey(a.id) - tierSortKey(b.id) || a.name.localeCompare(b.name));

    console.log(`… ${weaponType} (${variants.length} variantes)`);

    let passive = '';
    let skills = [];
    try {
      const typeWiki = await fetchWikitext(fandomPage);
      passive = parsePassive(typeWiki);
      skills = parseSkillTables(typeWiki);
      const iconFiles = skills.map((s) => s.iconFile).filter(Boolean);
      if (iconFiles.length) {
        const iconUrls = await fetchFandomImageUrls(iconFiles);
        for (const s of skills) {
          if (s.iconFile) {
            const url = iconUrls.get(s.iconFile);
            if (url) s.iconUrl = url;
            delete s.iconFile;
          }
        }
      }
      await new Promise((r) => setTimeout(r, 200));
    } catch (e) {
      console.warn(`  aviso skills ${weaponType}:`, e.message);
    }

    const variantRows = [];
    for (const v of variants) {
      let gearLevel;
      let physicalPower;
      let bonus = v.infobox?.stats;

      const page = v.slug.replace(/ /g, '_');
      try {
        const wiki = await fetchWikitext(page);
        const box = parseWeaponInfobox(wiki);
        gearLevel = box.gearLevel;
        physicalPower = box.physicalPower;
        if (box.bonus) bonus = box.bonus;
        await new Promise((r) => setTimeout(r, 120));
      } catch {
        /* usa só entidade */
      }

      variantRows.push({
        entityId: v.id,
        slug: v.slug,
        name: v.name,
        gearLevel,
        physicalPower,
        bonus: bonus || v.infobox?.stats || '—',
        image: v.image || undefined,
        isLegendary: isLegendaryId(v.id),
      });
    }

    types.push({
      typeEn: weaponType,
      namePt: TYPE_PT[weaponType] ?? weaponType,
      fandomPage,
      passive: passive || variants[0]?.infobox?.stats || '',
      skills,
      variants: variantRows,
    });
  }

  const payload = {
    syncedAt: new Date().toISOString(),
    types,
  };

  fs.writeFileSync(OUT, JSON.stringify(payload, null, 2));
  console.log(`✓ ${types.length} tipos → ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

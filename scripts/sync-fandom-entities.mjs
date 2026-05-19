/**
 * Sincroniza entidades completas da Fandom (V Bloods, feitiços, itens, etc.)
 * Gera: client/src/data/entities.raw.json
 *
 * Uso: node scripts/sync-fandom-entities.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  sanitizeWikiText,
  shouldSkipSection,
} from '../shared/wiki-sanitize.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '../client/src/data/entities.raw.json');
const API = 'https://vrising.fandom.com/api.php';
const USER_AGENT = 'VRisingDarkWiki/1.0 (fan project; educational)';
const DELAY_MS = 350;

const CATEGORIES = [
  { cmtitle: 'Category:V_Blood_Carriers', type: 'boss' },
  { cmtitle: 'Category:Blood_Spells', type: 'spell', school: 'Blood' },
  { cmtitle: 'Category:Chaos_Spells', type: 'spell', school: 'Chaos' },
  { cmtitle: 'Category:Frost_Spells', type: 'spell', school: 'Frost' },
  { cmtitle: 'Category:Storm_Spells', type: 'spell', school: 'Storm' },
  { cmtitle: 'Category:Unholy_Spells', type: 'spell', school: 'Unholy' },
  { cmtitle: 'Category:Illusion_Spells', type: 'spell', school: 'Illusion' },
  { cmtitle: 'Category:Shadow_Spells', type: 'spell', school: 'Shadow' },
  { cmtitle: 'Category:Soul_Shards', type: 'jewel' },
  { cmtitle: 'Category:Materials', type: 'item' },
  { cmtitle: 'Category:Consumables', type: 'item' },
  { cmtitle: 'Category:Weapons', type: 'weapon' },
];

const SKIP_TITLES = new Set([
  'V Blood Carriers',
  'Abilities',
  'Jewels',
  'Spells',
  'Bosses',
  'Consumables',
  'Weapons',
  'Materials',
  'Equipment',
  'Structures',
  'Soul Shards',
  'Armours',
  'Bags',
  'Hats',
]);

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchJson(params) {
  const url = `${API}?${new URLSearchParams({ ...params, format: 'json' })}`;
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function fetchAllCategoryMembers(cmtitle) {
  const titles = [];
  let continueParams = {};
  do {
    const data = await fetchJson({
      action: 'query',
      list: 'categorymembers',
      cmtitle,
      cmlimit: '500',
      ...continueParams,
    });
    for (const m of data.query?.categorymembers ?? []) {
      if (m.ns === 0 && !m.title.startsWith('Category:')) {
        titles.push(m.title);
      }
    }
    continueParams = data.continue ?? {};
    if (data.continue) await sleep(200);
  } while (Object.keys(continueParams).length > 0);
  return titles;
}

function slugify(title) {
  return title.replace(/ /g, '_');
}

function toId(slug) {
  return slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function extractYoutubeIds(text) {
  const ids = [];
  const videoTpl = /\{\{Video\|([a-zA-Z0-9_-]+)/gi;
  let m;
  while ((m = videoTpl.exec(text)) !== null) {
    if (m[1] && !ids.includes(m[1])) ids.push(m[1]);
  }
  return ids;
}

function cleanWikitextValue(raw) {
  return sanitizeWikiText(raw);
}

function isInterwikiOnlyBody(body) {
  const lines = body.split('\n').filter((l) => l.trim());
  if (!lines.length) return true;
  return lines.every((l) => /^[a-z]{2}(-[a-z]{2})?:/i.test(l.trim()));
}

function parseInfoboxFields(wikitext) {
  const fields = {};
  const templates = [
    'Boss Infobox',
    'Ability Infobox',
    'Item Infobox',
    'Spell Infobox',
    'Weapon Infobox',
  ];
  let block = wikitext;
  for (const tpl of templates) {
    const idx = wikitext.indexOf(`{{${tpl}`);
    if (idx >= 0) {
      block = wikitext.slice(idx, idx + 8000);
      fields._template = tpl;
      break;
    }
  }

  const fieldRe = /\|([^=\n|]+?)\s*=\s*([\s\S]*?)(?=\n\||\n}})/g;
  let m;
  while ((m = fieldRe.exec(block)) !== null) {
    const key = m[1].trim().toLowerCase();
    fields[key] = cleanWikitextValue(m[2]);
  }
  return fields;
}

function extractSections(wikitext) {
  const sections = [];
  const parts = wikitext.split(/^==+([^=]+)==+/gm);
  const pageVideos = extractYoutubeIds(wikitext);

  for (let i = 1; i < parts.length; i += 2) {
    const title = cleanWikitextValue(parts[i]);
    const rawBody = parts[i + 1] ?? '';
    const sectionVideos = extractYoutubeIds(rawBody);
    const body = cleanWikitextValue(rawBody).slice(0, 4000);

    if (!title) continue;

    const isVideoSection = /video showcase/i.test(title);
    const youtubeId = sectionVideos[0] ?? (isVideoSection ? pageVideos[0] : undefined);

    if (isVideoSection && youtubeId) {
      sections.push({
        title,
        body: '',
        kind: 'video',
        youtubeId,
      });
      continue;
    }

    if (shouldSkipSection(title, body)) {
      if (youtubeId) sections.push({ title, body: '', kind: 'video', youtubeId });
      continue;
    }

    if (!body || isInterwikiOnlyBody(body)) {
      if (youtubeId) sections.push({ title, body: '', kind: 'video', youtubeId });
      continue;
    }

    const kind = /^(\*|:)/m.test(rawBody) ? 'list' : 'text';
    sections.push({ title, body, kind });
  }

  return sections.slice(0, 12);
}

async function fetchEntityPage(title) {
  const slug = slugify(title);
  const [parseData, imageData] = await Promise.all([
    fetchJson({ action: 'parse', page: slug, prop: 'wikitext' }),
    fetchJson({
      action: 'query',
      titles: title,
      prop: 'pageimages',
      piprop: 'thumbnail',
      pithumbsize: 512,
    }),
  ]);

  const wikitext = parseData?.parse?.wikitext?.['*'] ?? '';
  const infobox = parseInfoboxFields(wikitext);
  const pages = imageData?.query?.pages ?? {};
  const page = Object.values(pages)[0];
  const imageRemote = page?.thumbnail?.source ?? '';

  const levelRaw = infobox.level ?? infobox['min level'];
  const level = levelRaw ? parseInt(levelRaw.replace(/\D/g, ''), 10) : undefined;
  const youtubeId = extractYoutubeIds(wikitext)[0];

  return {
    id: toId(slug),
    slug,
    title: parseData?.parse?.title ?? title,
    description: infobox.description || infobox.desc || '',
    level: Number.isFinite(level) ? level : undefined,
    location: infobox.location || '',
    school: infobox.school || infobox.magic_school || '',
    weaponType: infobox.weapon || infobox.type || '',
    infobox,
    sections: extractSections(wikitext),
    youtubeId,
    imageRemote,
    fandomUrl: `https://vrising.fandom.com/wiki/${encodeURIComponent(slug)}`,
    syncedAt: new Date().toISOString(),
  };
}

async function main() {
  const titleToMeta = new Map();

  for (const cat of CATEGORIES) {
    console.log(`Categoria: ${cat.cmtitle}`);
    const titles = await fetchAllCategoryMembers(cat.cmtitle);
    for (const title of titles) {
      if (SKIP_TITLES.has(title)) continue;
      if (!titleToMeta.has(title)) {
        titleToMeta.set(title, {
          type: cat.type,
          school: cat.school ?? '',
          weaponType: cat.type === 'weapon' ? title : '',
        });
      }
    }
    await sleep(300);
  }

  console.log(`\n${titleToMeta.size} páginas únicas para sincronizar\n`);

  const entities = [];
  let i = 0;
  for (const [title, meta] of titleToMeta) {
    i++;
    try {
      console.log(`[${i}/${titleToMeta.size}] ${title}`);
      const page = await fetchEntityPage(title);
      entities.push({
        ...page,
        type: meta.type,
        school: meta.school || page.school,
        weaponType: page.weaponType || meta.weaponType || undefined,
      });
    } catch (err) {
      console.warn(`  ✗ ${err.message}`);
    }
    await sleep(DELAY_MS);
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({ syncedAt: new Date().toISOString(), entities }, null, 2));
  console.log(`\n✓ ${entities.length} entidades → ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

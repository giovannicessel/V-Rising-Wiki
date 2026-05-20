/**
 * Extrai modificadores de joias por feitiço (Template:Jewel_Table).
 * Saída: client/src/data/spell-jewel-modifiers.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sanitizeWikiText } from '../shared/wiki-sanitize.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '../client/src/data/spell-jewel-modifiers.json');
const API = 'https://vrising.fandom.com/api.php';

const SCHOOLS = ['Blood', 'Chaos', 'Frost', 'Storm', 'Unholy', 'Illusion', 'Shadow'];

const TIER_IMAGES = {
  1: '/images/jewels/blood-tier1.png',
  2: '/images/jewels/blood-tier2.png',
  3: '/images/jewels/blood-tier3.png',
  4: '/images/jewels/blood-tier4.png',
};

/** Preserva nomes de debuffs/buffs antes do sanitize genérico (que apaga {{…}}). */
function cleanJewelModifier(raw) {
  let t = String(raw)
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/''+/g, '');
  const templateToLabel = [
    /\{\{Debuff\|([^}|]+)[^}]*\}\}/gi,
    /\{\{Buff\|([^}|]+)[^}]*\}\}/gi,
    /\{\{Ability\|([^}|]+)[^}]*\}\}/gi,
    /\{\{Status\|([^}|]+)[^}]*\}\}/gi,
  ];
  for (const re of templateToLabel) {
    t = t.replace(re, '$1');
  }
  return sanitizeWikiText(t).replace(/\s{2,}/g, ' ').trim();
}

function parseModifiersFromBody(body) {
  return body
    .split(/\|-/)
    .map((chunk) => {
      const lines = chunk
        .split('\n')
        .map((l) => l.replace(/^\|/, '').trim())
        .filter(Boolean);
      const cell = lines.find((l) => !/rowspan|Ability\{|section (begin|end)|^\{\|/i.test(l));
      return cell ? cleanJewelModifier(cell) : '';
    })
    .filter((t) => t.length > 6 && !/^Spell$/i.test(t));
}

function parseSchoolBlock(block, school) {
  const spells = [];
  const chunks = block.split(/<section begin="([^"]+)"\s*\/>/i);
  for (let i = 1; i < chunks.length; i += 2) {
    const spellNameEn = chunks[i].trim();
    let body = chunks[i + 1] ?? '';
    const endTag = `<section end="${spellNameEn}"`;
    const endIdx = body.indexOf(endTag);
    if (endIdx >= 0) body = body.slice(0, endIdx);

    const modifiers = parseModifiersFromBody(body);
    if (modifiers.length) {
      spells.push({ spellNameEn, school, modifiers });
    }
  }
  return spells;
}

function splitSchoolSections(wikitext) {
  const sections = new Map();
  for (let si = 0; si < SCHOOLS.length; si++) {
    const school = SCHOOLS[si];
    const marker = `|-|${school}=`;
    const start = wikitext.indexOf(marker);
    if (start < 0) continue;
    let end = wikitext.length;
    for (let sj = si + 1; sj < SCHOOLS.length; sj++) {
      const next = wikitext.indexOf(`|-|${SCHOOLS[sj]}=`, start + marker.length);
      if (next >= 0) {
        end = next;
        break;
      }
    }
    sections.set(school, wikitext.slice(start, end));
  }
  return sections;
}

async function fetchTemplate() {
  const res = await fetch(
    `${API}?${new URLSearchParams({ action: 'parse', page: 'Template:Jewel_Table', prop: 'wikitext', format: 'json' })}`,
    { headers: { 'User-Agent': 'VRisingDarkWiki/1.0' } }
  );
  const data = await res.json();
  return data.parse?.wikitext?.['*'] ?? '';
}

async function main() {
  const wikitext = await fetchTemplate();
  const allSpells = [];

  for (const [school, block] of splitSchoolSections(wikitext)) {
    allSpells.push(...parseSchoolBlock(block, school));
  }

  const payload = {
    syncedAt: new Date().toISOString(),
    fandomUrl: 'https://vrising.fandom.com/wiki/Jewels',
    tierImages: TIER_IMAGES,
    spells: allSpells,
  };

  fs.writeFileSync(OUT, JSON.stringify(payload, null, 2));
  console.log(`✓ ${allSpells.length} feitiços com modificadores → ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

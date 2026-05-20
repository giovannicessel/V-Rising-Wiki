/**
 * Importa traduções do markdown PT-BR para entities.json, catálogos e cache.
 *
 * npm run import:md
 * npm run import:md -- --md="caminho/arquivo.md"
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { hashText, looksEnglish } from '../shared/gemini-translate.mjs';
import { applyToEntity, cacheKey, setCacheEntry } from '../shared/apply-pt-entities.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const DEFAULT_MD = path.join(
  process.env.USERPROFILE || '',
  'Downloads',
  'V Rising Wiki - Tradução Completa (PT-BR).md'
);

function loadEntityNamePt() {
  const fromFile = {};
  const trPath = path.join(ROOT, 'client/src/data/entity-translations.ts');
  if (fs.existsSync(trPath)) {
    const src = fs.readFileSync(trPath, 'utf-8');
    const re = /'([^']+)':\s*'([^']+)'/g;
    let m;
    while ((m = re.exec(src))) {
      if (m[1].length > 2 && m[2].length > 2) fromFile[m[1]] = m[2];
    }
  }
  return fromFile;
}

const SPELL_PT_TO_EN = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'client/src/data/spell-pt-names.json'), 'utf-8')
);

const ENTITY_NAME_PT = {
  ...loadEntityNamePt(),
  'Blood Rage': 'Fúria Sanguínea',
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
  Shadowbolt: 'Projétil Sombrio',
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
  'Adam the Firstborn': 'Adam, o Primogênito',
  'Keely the Frost Archer': 'Keely, a Arqueira do Gelo',
  'Vincent the Frostbringer': 'Vincent, o Portador do Gelo',
  'Tristan the Vampire Hunter': 'Tristan, o Caçador de Vampiros',
  'Solarus the Immaculate': 'Solarus, o Imaculado',
  'Dracula the Immortal King': 'Drácula, o Rei Imortal',
  'Blood Essence': 'Essência de Sangue',
  'Primal Blood Essence': 'Essência de Sangue Primordial',
};

const WEAPON_HEADER_TO_TYPE = [
  ['machados', 'Axes'],
  ['garras', 'Claws'],
  ['bestas', 'Crossbow'],
  ['adagas', 'Daggers'],
  ['espadões', 'Greatsword'],
  ['espadão', 'Greatsword'],
  ['arcos longos', 'Longbow'],
  ['arco longo', 'Longbow'],
  ['maças', 'Mace'],
  ['maça', 'Mace'],
  ['pistolas', 'Pistols'],
  ['ceifador', 'Reaper'],
  ['lâminas', 'Slashers'],
  ['talhador', 'Slashers'],
  ['lanças', 'Spear'],
  ['lança', 'Spear'],
  ['espadas', 'Sword'],
  ['espada', 'Sword'],
  ['chicotes', 'Whip'],
  ['chicote', 'Whip'],
];

const JEWELRY_PT_BY_SLUG = {
  'bone-ring': ['anel de osso', 'bone ring'],
  'blood-bone-ring': ['anel osso sangrento', 'blood bone'],
  'gravedigger-ring': ['anel do coveiro', 'gravedigger'],
  'ring-of-the-warrior': ['anel do guerreiro'],
  'ring-of-the-warlock': ['anel do feiticeiro'],
  'ring-of-the-sorcerer': ['anel do feérico', 'anel do feirico'],
  'ring-of-the-dawnrunner': ['anel do corredor do amanhecer'],
  'ring-of-the-spellweaver': ['anel do tecelão', 'anel do tecelao'],
  'ring-of-the-duskwatcher': ['anel do vigilante do crepúsculo', 'vigilante do crepusculo'],
  'scourgestone-pendant': ['pingente pedra flageladora', 'scourgestone'],
  'pendant-of-the-warrior': ['pingente do guerreiro'],
  'pendant-of-the-warlock': ['pingente do feiticeiro'],
  'pendant-of-the-sorcerer': ['pingente do feérico'],
  'pendant-of-the-dawnrunner': ['pingente do corredor'],
  'pendant-of-the-spellweaver': ['pingente do tecelão'],
  'pendant-of-the-duskwatcher': ['pingente do vigilante'],
  'blood-merlot-amulet': ['amuleto merlot', 'merlot sangrento'],
  'amulet-of-the-crimson-commander': ['amuleto do comandante carmesim'],
  'amulet-of-the-arch-warlock': ['amuleto do arquifeiticeiro'],
  'amulet-of-the-wicked-prophet': ['amuleto do profeta maligno'],
  'amulet-of-the-unyielding-charger': ['amuleto do cavaleiro inflexível', 'cavaleiro inflexivel'],
  'amulet-of-the-master-spellweaver': ['amuleto do mestre teurgo'],
  'amulet-of-the-blademaster': ['amuleto do mestre das lâminas', 'mestre das laminas'],
  'blood-key': ['chave de sangue'],
};

function norm(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]/g, '');
}

function cleanText(s) {
  return (s || '')
    .replace(/^#{1,6}\s*BLOCO\s*\d+\s*/gim, '')
    .replace(/^BLOCO\s*\d+\s*/gim, '')
    .replace(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/Abrir página/gi, '')
    .replace(/…/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function sliceSection(md, startMarker, endMarker) {
  const start = md.indexOf(startMarker);
  if (start < 0) return '';
  const end = endMarker ? md.indexOf(endMarker, start + startMarker.length) : md.length;
  return md.slice(start, end < 0 ? md.length : end);
}

function buildEntityLookups(entities) {
  const byNorm = new Map();
  const ptLabels = [];

  for (const e of entities) {
    byNorm.set(norm(e.nameEn || e.name), e);
    byNorm.set(norm(e.name), e);
    byNorm.set(norm(e.id), e);
    const pt = ENTITY_NAME_PT[e.nameEn || e.name];
    if (pt) {
      byNorm.set(norm(pt), e);
      ptLabels.push({ pt, entity: e, normPt: norm(pt) });
    }
  }

  ptLabels.sort((a, b) => b.normPt.length - a.normPt.length);
  return { byNorm, ptLabels };
}

function matchBossByPtName(namePt, bosses) {
  const n = norm(namePt);
  for (const b of bosses) {
    const pt = ENTITY_NAME_PT[b.nameEn || b.name] || (b.name?.includes(',') ? b.name : '');
    if (pt && norm(pt) === n) return b;
  }
  const first = norm(namePt.split(',')[0] || '');
  for (const b of bosses) {
    const en = norm(b.nameEn || b.name);
    const pt = norm(ENTITY_NAME_PT[b.nameEn || b.name] || '');
    if (first.length >= 4 && (en.startsWith(first) || pt.startsWith(first))) return b;
  }
  return null;
}

function parseBossCardsFromLines(section, bosses) {
  const results = new Map();
  const lines = section.split('\n');
  let count = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.length > 72 || !/,\s*o\s+|,\s*a\s+/i.test(line)) continue;
    if (/^(V Rising|Início|Feitiços|Buscar|Mais|PT|EN|Todas|Ato \d|\d+ entradas|Floresta|Terras|Bosques|Gloomrot|Montanhas|Ruínas|Colinas|URL:|---)/i.test(line)) {
      continue;
    }

    let desc = '';
    for (let j = i + 1; j < Math.min(i + 7, lines.length); j++) {
      const l = lines[j].trim();
      if (!l) continue;
      if (/^NV\.\s*\d+|^FRAGMENTO|^BLOCO\s*\d+/i.test(l)) continue;
      if (/,\s*o\s+|,\s*a\s+/i.test(l) && j > i + 1) break;
      if (l.length >= 30) {
        desc = cleanText(l);
        break;
      }
    }

    if (desc.length < 30) continue;
    const boss = matchBossByPtName(line, bosses);
    if (boss) {
      results.set(boss.id, desc);
      count++;
    }
  }

  return { results, count };
}

function matchSpellByName(nameLine, spells) {
  const n = norm(nameLine);
  for (const s of spells) {
    const pt = ENTITY_NAME_PT[s.nameEn || s.name] || s.name;
    if (norm(pt) === n) return s;
  }
  for (const s of spells) {
    const en = norm(s.nameEn || s.name);
    if (n.length >= 5 && (en.includes(n.slice(0, 8)) || n.includes(en.slice(0, 8)))) return s;
  }
  return null;
}

function collectSpellCardsFromLines(section) {
  const cards = [];
  const seen = new Set();

  const add = (namePt, desc) => {
    const d = cleanText(desc);
    const key = norm(namePt);
    if (!key || d.length < 15 || seen.has(key)) return;
    seen.add(key);
    cards.push({ namePt: namePt.trim(), desc: d });
  };

  const boldRe =
    /\*\*([^*]+)\*\*\s*\n\s*·\s*[A-ZÁÉÍÓÚ]+\s*\n+([\s\S]*?)(?=\n\*\*|\n---|\n## |\n[A-ZÁÉÍÓÚ]{3,}\s*\n\*\*|$)/gi;
  let m;
  while ((m = boldRe.exec(section))) {
    add(m[1], m[2].split('\n')[0] || m[2]);
  }

  const lines = section.split('\n');
  for (let i = 0; i < lines.length - 2; i++) {
    const line = lines[i].trim().replace(/^\*\*|\*\*$/g, '');
    const next = lines[i + 1]?.trim() || '';
    const next2 = lines[i + 2]?.trim() || '';
    if (/^Feitiços|\d+ entradas|Todas as escolas|^Sangue$|^Caos$|^Gelo$|^Ilusão$|^Profano$|^Sombra$|^Tempestade$/i.test(line)) {
      continue;
    }
    if (next.startsWith('·') && line && !line.startsWith('·')) {
      const desc = next2.startsWith('·') ? '' : cleanText(next2 || lines[i + 3] || '');
      if (desc.length >= 15) add(line, desc);
    }
    if (line.startsWith('·') && i > 0) {
      const prev = lines[i - 1].trim().replace(/^\*\*|\*\*$/g, '');
      const desc = cleanText(lines[i + 1] || '');
      if (prev && desc.length >= 15) add(prev, desc);
    }
  }

  return cards;
}

function mapSpellCardsToEntities(cards, spells) {
  const results = new Map();

  for (const card of cards) {
    const en = SPELL_PT_TO_EN[card.namePt];
    const spell =
      (en && spells.find((s) => norm(s.nameEn) === norm(en))) ||
      spells.find((s) => norm(ENTITY_NAME_PT[s.nameEn] || '') === norm(card.namePt)) ||
      spells.find((s) => norm(s.name) === norm(card.namePt));

    if (spell) results.set(spell.id, card.desc);
  }

  return results;
}

function extractItemDescriptions(section) {
  const results = new Map();
  let count = 0;
  const re = /\*\*([^*]+)\*\*\s*\n+([^\n*#|][^\n]*(?:\n(?!\*\*|#|\|)[^\n]*)*)/g;
  let m;
  while ((m = re.exec(section))) {
    const name = m[1].trim();
    let desc = cleanText(m[2].replace(/\n/g, ' '));
    if (desc.length < 15 || /^abrir/i.test(desc)) continue;
    results.set(norm(name), { name, desc });
    count++;
  }
  return { results, count };
}

function detectWeaponType(headerLine) {
  const h = norm(headerLine);
  for (const [key, typeEn] of WEAPON_HEADER_TO_TYPE) {
    if (h.includes(key)) return typeEn;
  }
  return null;
}

function parseWeaponBlocks(weaponsSection) {
  const blocks = [];
  const lines = weaponsSection.split('\n');
  let current = null;
  let buf = [];

  const flush = () => {
    if (current) blocks.push({ typeEn: current, text: buf.join('\n') });
    buf = [];
  };

  for (const line of lines) {
    if (/^#{1,3}\s+/.test(line) && !/VARIANTES|PRIMÁRIO|PASSIVA/i.test(line)) {
      const type = detectWeaponType(line);
      if (type) {
        flush();
        current = type;
        continue;
      }
    }
    if (current) buf.push(line);
  }
  flush();
  return blocks;
}

function parseWeaponBlock(text) {
  const passiveMatch = text.match(
    /PASSIVA DO TIPO[^\n]*\n+([\s\S]*?)(?=\n---|\n###|\n\*\*PRIMÁRIO|\nPRIMÁRIO)/i
  );
  const passive = passiveMatch ? cleanText(passiveMatch[1].replace(/\n/g, ' ')) : '';

  const skillChunks = [];
  const skillRe =
    /(?:###\s*)?(?:\*\*)?(PRIMÁRIO|Primário|Primary|\*\*Q\*\*|Q|\*\*E\*\*|E)(?:\s*\*\*)?[^\n]*\n+([\s\S]*?)(?=\n---|\n(?:###\s*)?(?:\*\*)?(?:PRIMÁRIO|Q|E)\b|\n### Variantes|\nVariantes e dano)/gi;
  let sm;
  while ((sm = skillRe.exec(text))) {
    let body = sm[2];
    body = body
      .replace(/^\*\*[^*]+\*\*\s*/m, '')
      .replace(/Desbloqueio:.*$/gim, '')
      .replace(/DPS.*$/gim, '')
      .replace(/\n+/g, ' ');
    body = cleanText(body);
    if (body.length > 10) skillChunks.push(body);
  }

  const variantBonuses = new Map();
  const tableLines = text.split('\n').filter((l) => l.includes('|') && !/^\|[-\s|]+\|/.test(l));
  for (const line of tableLines) {
    const cols = line
      .split('|')
      .map((c) => c.trim())
      .filter(Boolean);
    if (cols.length < 4) continue;
    const name = cols[0].replace(/\*\*/g, '').replace(/LENDÁRIA|LENDA/gi, '').trim();
    const bonus = cols[3] && cols[3] !== '—' ? cols[3] : '';
    if (name && bonus) variantBonuses.set(norm(name), bonus);
  }

  return { passive, skills: skillChunks, variantBonuses };
}

function abilityMatchesSkill(ab, skill) {
  const an = ab.name.toLowerCase();
  const sn = skill.name.toLowerCase();
  if (norm(an).includes(norm(sn)) || norm(sn).includes(norm(an.split('·')[0]))) return true;
  if (skill.slot === 'primary' && /primário|primary/i.test(an)) return true;
  if (skill.slot === 'q' && /\bq\b|· q/i.test(an)) return true;
  if (skill.slot === 'e' && /\be\b|· e/i.test(an)) return true;
  return false;
}

function mergeWeaponsGuide(catalog, guide) {
  let n = 0;

  for (const t of catalog.types) {
    const g = guide.weaponTypes?.find(
      (w) =>
        w.typeEn === t.typeEn ||
        `${w.typeEn}s` === t.typeEn ||
        w.typeEn === t.typeEn.replace(/s$/, '')
    );
    if (!g) continue;

    if (!t.passivePt && g.blurb) {
      t.passivePt = g.blurb;
      n++;
    }

    for (const skill of t.skills || []) {
      if (skill.descriptionPt) continue;
      const ab = g.abilities?.find((a) => abilityMatchesSkill(a, skill));
      if (ab?.description) {
        skill.descriptionPt = ab.description;
        n++;
      }
    }
  }
  return n;
}

function parseJewelryRows(section) {
  const rows = [];
  const lines = section.split('\n');
  for (const line of lines) {
    if (line.includes('```')) continue;
    const parts = line.split(/\t+/).map((p) => p.trim()).filter(Boolean);
    if (parts.length >= 3 && /^\d+$/.test(parts[1])) {
      rows.push({
        namePt: parts[0],
        gearLevel: Number(parts[1]),
        statsPt: parts[2] || '',
        sourcePt: parts[3] || '',
        materialsPt: parts[4] || '',
      });
    }
  }
  return rows;
}

function matchJewelryItem(row, catalogItems) {
  const n = norm(row.namePt);
  for (const item of catalogItems) {
    const aliases = JEWELRY_PT_BY_SLUG[item.slug] || [];
    if (aliases.some((a) => n.includes(norm(a)) || norm(a).includes(n))) {
      if (item.gearLevel === row.gearLevel) return item;
    }
  }
  for (const item of catalogItems) {
    if (item.gearLevel === row.gearLevel && norm(item.name).includes(n.slice(0, 8))) {
      return item;
    }
  }
  return catalogItems.find((i) => i.gearLevel === row.gearLevel && !i.statsPt);
}

function parseLegendaryDescriptions(section) {
  const map = new Map();
  const re = /###\s+([^\n]+)\n+\*\*([^*]+)\*\*\s*\n+([^\n#]+)/g;
  let m;
  while ((m = re.exec(section))) {
    const name = m[1].trim();
    const desc = cleanText(m[3]);
    if (desc.length > 20) map.set(norm(name), { name, desc });
  }
  return map;
}

function resolveMdPath(arg) {
  if (arg) {
    const resolved = path.resolve(arg);
    if (fs.existsSync(resolved)) return resolved;
  }
  const candidates = [
    path.join(ROOT, 'docs/TRADUCAO-PT-BR.md'),
    DEFAULT_MD,
  ];
  for (const c of candidates) {
    if (c && fs.existsSync(c)) return c;
  }
  const dl = path.join(process.env.USERPROFILE || '', 'Downloads');
  if (fs.existsSync(dl)) {
    const hit = fs
      .readdirSync(dl)
      .find((f) => /tradu.*completa/i.test(f) && /\.md$/i.test(f));
    if (hit) return path.join(dl, hit);
  }
  return null;
}

function main() {
  const mdArg = process.argv.find((a) => a.startsWith('--md='))?.split('=').slice(1).join('=');
  const mdPath = resolveMdPath(mdArg);

  if (!mdPath) {
    console.error('✗ Markdown não encontrado. Use --md="caminho/arquivo.md"');
    process.exit(1);
  }
  console.log(`📄 ${mdPath}`);

  const md = fs.readFileSync(mdPath, 'utf-8');
  const docsCopy = path.join(ROOT, 'docs/TRADUCAO-PT-BR.md');
  if (path.resolve(mdPath) !== path.resolve(docsCopy)) {
    fs.mkdirSync(path.dirname(docsCopy), { recursive: true });
    fs.copyFileSync(mdPath, docsCopy);
    console.log(`✓ Cópia salva em ${docsCopy}`);
  }

  const entitiesPath = path.join(ROOT, 'client/src/data/entities.json');
  const cachePath = path.join(ROOT, 'client/src/data/content-pt-cache.json');
  const catalogPath = path.join(ROOT, 'client/src/data/weapons-catalog.json');
  const guidePath = path.join(ROOT, 'client/src/data/weapons-guide.json');
  const jewelryPath = path.join(ROOT, 'client/src/data/jewelry-catalog.json');

  const data = JSON.parse(fs.readFileSync(entitiesPath, 'utf-8'));
  const cache = fs.existsSync(cachePath)
    ? JSON.parse(fs.readFileSync(cachePath, 'utf-8'))
    : { version: 1, entries: {} };
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
  const guide = JSON.parse(fs.readFileSync(guidePath, 'utf-8'));
  const jewelry = JSON.parse(fs.readFileSync(jewelryPath, 'utf-8'));

  const entities = data.entities;
  const { ptLabels } = buildEntityLookups(entities);
  const bosses = entities.filter((e) => e.type === 'boss');
  const spells = entities.filter((e) => e.type === 'spell');
  const items = entities.filter((e) => e.type === 'item');
  const weapons = entities.filter((e) => e.type === 'weapon');

  const stats = { cache: 0, catalog: 0, jewelry: 0, guide: 0 };

  const bossSection = sliceSection(md, '## V Sangues', '## Feitiços');
  const { results: bossDesc } = parseBossCardsFromLines(bossSection, bosses);
  for (const [id, text] of bossDesc) {
    if (setCacheEntry(cache, id, 'description', text, 'md')) stats.cache++;
  }

  const spellSection = sliceSection(md, '## Feitiços', '## Armas');
  const spellCards = collectSpellCardsFromLines(spellSection);
  const spellDesc = mapSpellCardsToEntities(spellCards, spells);
  for (const [id, text] of spellDesc) {
    if (setCacheEntry(cache, id, 'description', text, 'md')) stats.cache++;
  }
  console.log(`  Feitiços no MD: ${spellCards.length} cartões → ${spellDesc.size} entidades`);

  const itemSection = sliceSection(md, '## Itens', '## Joias');
  const { results: itemDescMap } = extractItemDescriptions(itemSection);
  for (const item of items) {
    const ptName = ENTITY_NAME_PT[item.nameEn || item.name];
    const hit =
      itemDescMap.get(norm(ptName || '')) ||
      itemDescMap.get(norm(item.name)) ||
      itemDescMap.get(norm(item.nameEn || ''));
    if (hit && setCacheEntry(cache, item.id, 'description', hit.desc, 'md')) stats.cache++;
  }

  const weaponsSection = sliceSection(md, '## Armas (Weapons)', '## Itens');
  const blocks = parseWeaponBlocks(weaponsSection);
  const catalogByType = new Map(catalog.types.map((t) => [t.typeEn, t]));

  for (const block of blocks) {
    const t = catalogByType.get(block.typeEn);
    if (!t) continue;
    const parsed = parseWeaponBlock(block.text);
    if (parsed.passive.length > 15) {
      t.passivePt = parsed.passive;
      stats.catalog++;
    }
    parsed.skills.forEach((desc, i) => {
      const skill = t.skills?.[i];
      if (skill && desc) {
        skill.descriptionPt = desc;
        stats.catalog++;
      }
    });
    for (const v of t.variants || []) {
      const bonus = parsed.variantBonuses.get(norm(v.name));
      if (bonus) {
        v.bonusPt = bonus;
        stats.catalog++;
      }
    }
  }

  stats.guide = mergeWeaponsGuide(catalog, guide);
  for (const t of catalog.types) {
    if (!t.passivePt && t.passive && !looksEnglish(t.passive)) t.passivePt = t.passive;
    for (const s of t.skills || []) {
      if (!s.descriptionPt && s.description && !looksEnglish(s.description)) {
        s.descriptionPt = s.description.replace(/&nbsp;/g, ' ');
      }
    }
  }

  const jewelrySection = sliceSection(md, '## Joias', '## Planejador');
  for (const row of parseJewelryRows(jewelrySection)) {
    const item = matchJewelryItem(row, jewelry.items);
    if (!item) continue;
    if (row.statsPt) item.statsPt = row.statsPt.replace(/\s+/g, ' ').trim();
    if (row.sourcePt) item.sourcePt = row.sourcePt;
    if (row.materialsPt) item.materialsPt = row.materialsPt;
    stats.jewelry++;
  }

  const legSection = sliceSection(md, '## Lista de artefatos', '---\n\n---') || sliceSection(md, '## Lista de artefatos', '');
  const legMap = parseLegendaryDescriptions(md.slice(md.indexOf('## Lista de artefatos')));
  for (const w of weapons) {
    if (!w.isLegendary && !/lendár|legendary|the |apocalypse|oaksong/i.test(w.name)) continue;
    const hit =
      legMap.get(norm(w.nameEn || w.name)) ||
      legMap.get(norm(w.name));
    if (hit && setCacheEntry(cache, w.id, 'description', hit.desc, 'md')) stats.cache++;
  }

  cache.updatedAt = new Date().toISOString();
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));

  data.entities = entities.map((e) => applyToEntity(e, cache));
  fs.writeFileSync(entitiesPath, JSON.stringify(data, null, 2));
  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));
  fs.writeFileSync(jewelryPath, JSON.stringify(jewelry, null, 2));

  console.log('\n✓ Importação concluída');
  console.log(`  Entidades (cache/descrições): ${stats.cache}`);
  console.log(`  weapons-catalog (MD): ${stats.catalog}`);
  console.log(`  weapons-catalog (guia PT): +${stats.guide} campos`);
  console.log(`  jewelry-catalog: ${stats.jewelry} itens`);
  console.log(`  Cache total: ${Object.keys(cache.entries).length} entradas`);
}

main();

/**
 * Converte o markdown de lore em JSON estruturado para a wiki.
 * Uso: node scripts/build-lore.mjs [caminho-do-md]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DEFAULT_MD = path.join(
  ROOT,
  'client/src/content/lore-vardoran.md'
);
const OUT = path.join(ROOT, 'client/src/data/lore-vardoran.json');

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function parseTable(lines) {
  const rows = [];
  for (const line of lines) {
    if (!line.trim().startsWith('|')) continue;
    if (/^\|[-:\s|]+\|$/.test(line.replace(/\s/g, ''))) continue;
    const cells = line
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim().replace(/\*\*/g, ''));
    if (cells.length >= 2 && !cells[0].includes(':---')) rows.push(cells);
  }
  return rows;
}

function parseMarkdown(md) {
  const lines = md.split(/\r?\n/);
  const intro = [];
  let i = 0;
  while (i < lines.length && !lines[i].startsWith('## ')) {
    if (lines[i].trim() && lines[i] !== '---') intro.push(lines[i]);
    i++;
  }
  const introText = intro.join('\n').trim();

  const sections = [];
  let current = null;

  const flush = () => {
    if (current) sections.push(current);
    current = null;
  };

  for (; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('## ')) {
      flush();
      current = {
        id: slugify(line.replace(/^##\s+/, '').replace(/[🧛⏳🗺️🩸]/gu, '').trim()),
        title: line.replace(/^##\s+/, '').trim(),
        level: 2,
        content: [],
        regions: [],
        table: [],
        factions: [],
      };
      continue;
    }
    if (!current) continue;

    if (line.startsWith('### ')) {
      const title = line.replace(/^###\s+/, '').trim();
      const region = {
        id: slugify(title.replace(/[🌲🌾🏔️🌫️🏛️🧪🏰🐍]/gu, '').trim()),
        title,
        paragraphs: [],
        bosses: [],
      };
      current.regions.push(region);
      continue;
    }

    const activeRegion = current.regions[current.regions.length - 1];

    if (line.startsWith('|') && activeRegion) {
      if (!activeRegion._tableLines) activeRegion._tableLines = [];
      activeRegion._tableLines.push(line);
      continue;
    }

    if (line.trim() === '---') continue;

    if (line.trim()) {
      if (activeRegion) activeRegion.paragraphs.push(line);
      else current.content.push(line);
    }
  }
  flush();

  for (const sec of sections) {
    for (const reg of sec.regions) {
      if (reg._tableLines) {
        const rows = parseTable(reg._tableLines);
        reg.bosses = rows
          .map(([name, lore]) => ({ name, lore }))
          .filter(
            (b) =>
              b.name &&
              !/chefe notável|notable|lore e motiva/i.test(b.name)
          );
        delete reg._tableLines;
      }
      reg.body = reg.paragraphs.join('\n').trim();
      delete reg.paragraphs;
    }
    if (sec.id.includes('cronologia') || sec.title.includes('Cronologia')) {
      const tableLines = sec.content.filter((l) => l.startsWith('|'));
      sec.timeline = parseTable(tableLines)
        .map(([era, event, desc]) => ({
          era,
          event,
          description: desc,
        }))
        .filter((r) => r.era && !/^era$/i.test(r.era));
      sec.content = sec.content.filter((l) => !l.startsWith('|'));
    }
    if (sec.id.includes('fac') || sec.title.includes('Facções')) {
      const tableLines = sec.content.filter((l) => l.startsWith('|'));
      sec.factions = parseTable(tableLines)
        .map(([faction, leader, objective]) => ({
          faction,
          leader,
          objective,
        }))
        .filter((f) => f.faction && !/^fac/i.test(f.faction));
      sec.content = sec.content.filter((l) => !l.startsWith('|'));
    }
    sec.body = sec.content.join('\n').trim();
    delete sec.content;
  }

  return {
    title: 'V Rising: A Lore Completa de Vardoran',
    intro: introText,
    sections,
    builtAt: new Date().toISOString(),
  };
}

function main() {
  const mdPath = process.argv[2] || DEFAULT_MD;
  if (!fs.existsSync(mdPath)) {
    console.error(`Arquivo não encontrado: ${mdPath}`);
    process.exit(1);
  }
  const md = fs.readFileSync(mdPath, 'utf8');
  const data = parseMarkdown(md);
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(data, null, 2));
  console.log(`✓ ${OUT} — ${data.sections.length} seções`);
}

main();

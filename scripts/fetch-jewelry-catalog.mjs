/**
 * Catálogo de anéis/pingentes (página Jewelry da Fandom).
 * Saída: client/src/data/jewelry-catalog.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sanitizeWikiText } from '../shared/wiki-sanitize.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '../client/src/data/jewelry-catalog.json');
const API = 'https://vrising.fandom.com/api.php';

function extractFileFromCell(cell) {
  const m = cell.match(/File:([^|\]]+\.(?:png|webp|jpg))/i);
  return m ? m[1].trim() : null;
}

async function fetchFandomImageUrls(fileNames) {
  const map = new Map();
  const unique = [...new Set(fileNames.filter(Boolean))];
  for (let i = 0; i < unique.length; i += 20) {
    const batch = unique.slice(i, i + 20);
    const titles = batch.map((f) => `File:${f.replace(/ /g, '_')}`).join('|');
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
      if (url && page.title) {
        const file = page.title.replace(/^File:/, '').replace(/_/g, ' ');
        map.set(file, url);
        for (const orig of batch) {
          if (orig.replace(/ /g, '_') === page.title.replace(/^File:/, '')) {
            map.set(orig, url);
          }
        }
      }
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  return map;
}

function parseTableRows(wikitext) {
  const rows = [];
  const parts = wikitext.split(/\|-/);
  for (const part of parts.slice(1)) {
    const cells = part
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.startsWith('|') && !l.startsWith('|-') && !l.startsWith('|}'));
    if (cells.length < 3) continue;

    const links = [...cells[0].matchAll(/\[\[([^|\]#]+)(?:\|[^\]]*)?\]\]/gi)];
    const name = links
      .map((m) => m[1].trim())
      .filter((n) => n && !/^file:/i.test(n))
      .pop()
      ?.replace(/_/g, ' ');
    if (!name) continue;

    const imageFile = extractFileFromCell(cells[0]);

    const gearMatch = cells[1].match(/(\d+)/);
    const gearLevel = gearMatch ? Number(gearMatch[1]) : undefined;

    const stats = sanitizeWikiText(
      cells[2]
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/'''+/g, '')
    );

    const source = sanitizeWikiText(cells[3] || '');
    const materials = sanitizeWikiText(cells[4] || '');

    rows.push({
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      gearLevel,
      stats,
      source,
      materials,
      imageFile,
    });
  }
  return rows;
}

async function main() {
  const res = await fetch(
    `${API}?${new URLSearchParams({ action: 'parse', page: 'Jewelry', prop: 'wikitext', format: 'json' })}`,
    { headers: { 'User-Agent': 'VRisingDarkWiki/1.0' } }
  );
  const data = await res.json();
  const wikitext = data.parse?.wikitext?.['*'] ?? '';
  const intro = sanitizeWikiText(wikitext.split('{|')[0] ?? '');
  const rawItems = parseTableRows(wikitext);

  const imageMap = await fetchFandomImageUrls(rawItems.map((i) => i.imageFile));
  const items = rawItems.map(({ imageFile, ...item }) => ({
    ...item,
    imageUrl: imageFile ? imageMap.get(imageFile) ?? imageMap.get(imageFile.replace(/_/g, ' ')) : undefined,
  }));

  const introPt =
    'Jewelry (joalheria) amplifica feitiços vampíricos e pode conceder bônus como Poder Físico. Itens de nível mais alto exigem receitas e estações (Simple Workbench, Artisan Table). Para modificadores de feitiço encaixáveis, veja Joias (spell jewels) tier 1–4.';

  const payload = {
    syncedAt: new Date().toISOString(),
    fandomUrl: 'https://vrising.fandom.com/wiki/Jewelry',
    intro,
    introPt,
    items,
  };

  fs.writeFileSync(OUT, JSON.stringify(payload, null, 2));
  const withImg = items.filter((i) => i.imageUrl).length;
  console.log(`✓ ${items.length} jewelry (${withImg} com ícone) → ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

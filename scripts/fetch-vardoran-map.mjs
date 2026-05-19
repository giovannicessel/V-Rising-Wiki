/**
 * Extrai marcadores do mapa Vardoran (Fandom) e grava client/src/data/vardoran-map.json
 * Uso: node scripts/fetch-vardoran-map.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'client/src/data/vardoran-map.json');

const API = 'https://vrising.fandom.com/api.php';

function toId(slug) {
  return slug
    .replace(/_/g, '-')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '');
}

async function fetchJson(params) {
  const url = `${API}?${new URLSearchParams({ format: 'json', ...params })}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'v-rising-wiki/1.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.json();
}

async function getMapImageUrl(filename) {
  const title = filename.startsWith('File:') ? filename : `File:${filename}`;
  const data = await fetchJson({
    action: 'query',
    titles: title,
    prop: 'imageinfo',
    iiprop: 'url',
  });
  const page = Object.values(data.query?.pages ?? {})[0];
  return page?.imageinfo?.[0]?.url ?? '';
}

async function main() {
  const parse = await fetchJson({
    action: 'parse',
    page: 'Map:Vardoran',
    prop: 'wikitext',
  });
  const raw = parse?.parse?.wikitext?.['*'] ?? '';
  const mapData = JSON.parse(raw);

  const [w, h] = mapData.mapBounds[1];
  const imageUrl = await getMapImageUrl(mapData.mapImage);

  const vbloodCategory = mapData.categories.find((c) => /v blood/i.test(c.name))?.id ?? '4';

  const markers = mapData.markers
    .filter((m) => m.categoryId === vbloodCategory)
    .map((m) => {
      const [x, y] = m.position;
      const linkSlug = m.popup?.link?.url?.replace(/ /g, '_') ?? '';
      const bossId = linkSlug ? toId(linkSlug) : toId(m.popup?.title ?? m.id);
      const levelMatch = (m.popup?.description ?? '').match(/Level\s+(\d+)/i);
      return {
        id: String(m.id),
        bossId,
        title: m.popup?.title ?? '',
        level: levelMatch ? parseInt(levelMatch[1], 10) : undefined,
        x: Math.round((x / w) * 10000) / 100,
        y: Math.round((y / h) * 10000) / 100,
        fandomSlug: linkSlug || undefined,
      };
    });

  const payload = {
    source: 'https://vrising.fandom.com/wiki/Map:Vardoran',
    mapImage: mapData.mapImage,
    imageUrl,
    bounds: { width: w, height: h },
    origin: mapData.origin,
    markers,
    fetchedAt: new Date().toISOString(),
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(payload, null, 2));
  console.log(`✓ ${OUT} — ${markers.length} V Bloods`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

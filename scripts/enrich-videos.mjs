/**
 * Adiciona youtubeId e seções de vídeo nas entidades já sincronizadas.
 * Uso: node scripts/enrich-videos.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAW = path.join(__dirname, '../client/src/data/entities.raw.json');
const API = 'https://vrising.fandom.com/api.php';
const DELAY = 300;

function extractYoutubeIds(text) {
  const ids = [];
  const re = /\{\{Video\|([a-zA-Z0-9_-]+)/gi;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (!ids.includes(m[1])) ids.push(m[1]);
  }
  return ids;
}

async function fetchWikitext(slug) {
  const res = await fetch(
    `${API}?${new URLSearchParams({ action: 'parse', page: slug, prop: 'wikitext', format: 'json' })}`,
    { headers: { 'User-Agent': 'VRisingDarkWiki/1.0' } }
  );
  const data = await res.json();
  return data?.parse?.wikitext?.['*'] ?? '';
}

async function main() {
  const raw = JSON.parse(fs.readFileSync(RAW, 'utf-8'));
  let updated = 0;

  for (const e of raw.entities) {
    if (e.type !== 'spell' && e.type !== 'weapon') continue;
    if (e.youtubeId) continue;

    try {
      const wt = await fetchWikitext(e.slug);
      const ids = extractYoutubeIds(wt);
      if (!ids.length) continue;

      e.youtubeId = ids[0];
      const vs = e.sections?.find((s) => /video showcase/i.test(s.title));
      if (vs) {
        vs.youtubeId = ids[0];
        vs.kind = 'video';
        vs.body = '';
      } else {
        e.sections = [
          ...(e.sections ?? []),
          { title: 'Video Showcase', kind: 'video', youtubeId: ids[0], body: '' },
        ];
      }
      updated++;
      console.log('✓', e.title, ids[0]);
    } catch (err) {
      console.warn('✗', e.title, err.message);
    }
    await new Promise((r) => setTimeout(r, DELAY));
  }

  fs.writeFileSync(RAW, JSON.stringify(raw, null, 2));
  console.log(`\n${updated} entidades com vídeo`);
}

main();

/**
 * Sincroniza imagens e descrições da V Rising Fandom Wiki.
 * Uso: node scripts/sync-fandom.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS_DIR = path.join(__dirname, '../client/public/assets/wiki');
const DATA_FILE = path.join(__dirname, '../client/src/data/wiki-entries.generated.json');

const USER_AGENT = 'VRisingDarkWiki/1.0 (fan project; educational)';
const API = 'https://vrising.fandom.com/api.php';

const PAGES = [
  { slug: 'Dracula_the_Immortal_King', category: 'boss', namePt: 'Drácula, o Rei Imortal' },
  { slug: 'Alpha_the_White_Wolf', category: 'boss', namePt: 'Alpha, o Lobo Branco' },
  { slug: 'Keely_the_Frost_Archer', category: 'boss', namePt: 'Keely, a Arqueira do Gelo' },
  { slug: 'Vincent_the_Frostbringer', category: 'boss', namePt: 'Vincent, o Portador do Gelo' },
  { slug: 'Tristan_the_Vampire_Hunter', category: 'boss', namePt: 'Tristan, o Caçador de Vampiros' },
  { slug: 'Solarus_the_Immaculate', category: 'boss', namePt: 'Solarus, o Imaculado' },
  { slug: 'Blood_Rite', category: 'spell', namePt: 'Rito de Sangue' },
  { slug: 'Veil_of_Blood', category: 'spell', namePt: 'Véu de Sangue' },
  { slug: 'Blood_Rage', category: 'spell', namePt: 'Fúria de Sangue' },
  { slug: 'Veil_of_Shadow', category: 'spell', namePt: 'Véu das Sombras' },
  { slug: 'Blood_Essence', category: 'item', namePt: 'Essência de Sangue' },
  { slug: 'Primal_Blood_Essence', category: 'item', namePt: 'Essência de Sangue Primal' },
  { slug: 'Blood_Orb', category: 'item', namePt: 'Orbe de Sangue' },
  { slug: 'Soul_Shard_of_Dracula', category: 'jewel', namePt: 'Fragmento de Alma de Drácula' },
  { slug: 'Jewels', category: 'jewel', namePt: 'Joias (Soul Shards)' },
  { slug: 'V_Rising', category: 'item', namePt: 'V Rising' },
];

function extractField(wikitext, field) {
  const re = new RegExp(`\\|${field}=([^\\n|]+)`, 'i');
  const m = wikitext.match(re);
  if (!m) return undefined;
  return m[1]
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g, '$1')
    .replace(/{{[^}]+}}/g, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json();
}

async function fetchPage(slug) {
  const titles = encodeURIComponent(slug.replace(/_/g, ' '));
  const [parseData, imageData] = await Promise.all([
    fetchJson(
      `${API}?action=parse&page=${slug}&prop=wikitext&format=json`
    ),
    fetchJson(
      `${API}?action=query&titles=${titles}&prop=pageimages&piprop=thumbnail&pithumbsize=400&format=json`
    ),
  ]);

  const wikitext = parseData?.parse?.wikitext?.['*'] ?? '';
  const pages = imageData?.query?.pages ?? {};
  const page = Object.values(pages)[0];
  const imageUrl = page?.thumbnail?.source;

  return {
    description: extractField(wikitext, 'description') ?? '',
    level: extractField(wikitext, 'level'),
    imageUrl,
    title: parseData?.parse?.title ?? slug.replace(/_/g, ' '),
  };
}

async function downloadImage(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`Download failed: ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
}

async function main() {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
  const entries = [];

  for (const page of PAGES) {
    try {
      console.log(`→ ${page.slug}`);
      const data = await fetchPage(page.slug);
      const id = page.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      let localImage = '';

      if (data.imageUrl) {
        const ext = data.imageUrl.includes('.png') ? 'png' : 'jpg';
        const filename = `${id}.${ext}`;
        const dest = path.join(ASSETS_DIR, filename);
        await downloadImage(data.imageUrl, dest);
        localImage = `/assets/wiki/${filename}`;
        console.log(`  ✓ imagem: ${filename}`);
      }

      entries.push({
        id,
        slug: page.slug,
        name: page.namePt || data.title,
        nameEn: data.title,
        category: page.category,
        level: data.level ? Number(data.level) : undefined,
        image: localImage,
        imageRemote: data.imageUrl ?? '',
        description: data.description,
        fandomUrl: `https://vrising.fandom.com/wiki/${page.slug}`,
      });
    } catch (err) {
      console.warn(`  ✗ ${page.slug}: ${err.message}`);
    }
  }

  fs.writeFileSync(DATA_FILE, JSON.stringify(entries, null, 2));
  console.log(`\n✓ ${entries.length} entradas → ${DATA_FILE}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

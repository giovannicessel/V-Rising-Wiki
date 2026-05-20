/**
 * Guia de Joias + manifest de imagens por escola/tier.
 * Saída: jewels-guide.json, jewel-school-images.json, PNGs em public/images/jewels/
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '../client/src/data/jewels-guide.json');
const MANIFEST_OUT = path.join(__dirname, '../client/src/data/jewel-school-images.json');
const IMG_DIR = path.join(__dirname, '../client/public/images/jewels');
const API = 'https://vrising.fandom.com/api.php';

const SCHOOLS = ['Blood', 'Chaos', 'Frost', 'Storm', 'Unholy', 'Illusion', 'Shadow'];
const TIERS = [1, 2, 3, 4];

function fandomFile(school, tier) {
  return `Jewel_${school}Tier${tier}.png`;
}

function localPath(school, tier) {
  return `/images/jewels/${school.toLowerCase()}-tier${tier}.png`;
}

function parseTierUnlocks(wikitext) {
  const lines = [];
  const re =
    /(?:Greater |Primal )?Tier (\d) Jewelcrafting requires slaying \[\[([^\]]+)\]\] \(level (\d+)\)/gi;
  let m;
  while ((m = re.exec(wikitext))) {
    lines.push({
      tier: Number(m[1]),
      boss: m[2].replace(/_/g, ' '),
      level: Number(m[3]),
    });
  }
  return lines;
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

async function downloadSchoolJewels(urls) {
  fs.mkdirSync(IMG_DIR, { recursive: true });
  const images = {};
  const schoolsAvailable = [];
  let downloaded = 0;

  for (const school of SCHOOLS) {
    images[school] = {};
    let schoolOk = false;
    for (const tier of TIERS) {
      const file = fandomFile(school, tier);
      const remote = urls.get(file);
      if (!remote) continue;
      const dest = path.join(IMG_DIR, `${school.toLowerCase()}-tier${tier}.png`);
      try {
        const res = await fetch(remote, { headers: { 'User-Agent': 'VRisingDarkWiki/1.0' } });
        if (res.ok) {
          fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
          downloaded++;
          images[school][String(tier)] = localPath(school, tier);
          schoolOk = true;
        }
      } catch {
        /* ignora */
      }
      await new Promise((r) => setTimeout(r, 80));
    }
    if (schoolOk) schoolsAvailable.push(school);
    else delete images[school];
  }

  return { images, schoolsAvailable, downloaded };
}

function buildTiers(unlocks) {
  const byTier = Object.fromEntries(unlocks.map((u) => [u.tier, u]));
  return TIERS.map((tier) => ({
    tier,
    description:
      tier === 1
        ? '1 modificador aleatório. Encontrada em baús dourados, V Bloods e incursões de fenda.'
        : tier === 4
          ? byTier[4]
            ? `4 modificadores (primal). Craft: ${byTier[4].boss} (nível ${byTier[4].level}).`
            : '4 modificadores aleatórios — tier mais alto.'
          : byTier[tier]
            ? `${tier} modificadores. Craft: ${byTier[tier].boss} (nível ${byTier[tier].level}).`
            : `${tier} modificadores aleatórios.`,
  }));
}

async function main() {
  const res = await fetch(
    `${API}?${new URLSearchParams({ action: 'parse', page: 'Jewels', prop: 'wikitext', format: 'json' })}`,
    { headers: { 'User-Agent': 'VRisingDarkWiki/1.0' } }
  );
  const data = await res.json();
  const wikitext = data.parse?.wikitext?.['*'] ?? '';

  let unlocks = parseTierUnlocks(wikitext);
  if (!unlocks.length) {
    unlocks = [
      { tier: 2, boss: 'Raziel the Shepherd', level: 57 },
      { tier: 3, boss: 'Mairwyn the Elementalist', level: 70 },
      { tier: 4, boss: 'General Valencia the Depraved', level: 84 },
    ];
  }

  const allFiles = SCHOOLS.flatMap((s) => TIERS.map((t) => fandomFile(s, t)));
  const imageUrls = await fetchFandomImageUrls(allFiles);
  const { images, schoolsAvailable, downloaded } = await downloadSchoolJewels(imageUrls);
  const tiers = buildTiers(unlocks);

  const tierImages = Object.fromEntries(
    TIERS.map((t) => [String(t), localPath('Blood', t)])
  );

  const manifest = {
    syncedAt: new Date().toISOString(),
    schools: schoolsAvailable,
    images,
  };

  const payload = {
    syncedAt: manifest.syncedAt,
    fandomUrl: 'https://vrising.fandom.com/wiki/Jewels',
    introPt:
      'Joias de feitiço amplificam habilidades não-ultimate e podem ser trocadas sem custo. Cada escola de magia tem uma cor — os ícones abaixo alternam entre as escolas no mesmo tier.',
    fusionNotePt:
      'Joias também podem ser fundidas (transferir modificadores entre tiers do mesmo feitiço) ou desmanchadas por materiais nas estações de jewelcrafting.',
    tierImages,
    tiers,
    note: 'Joias (spell jewels) são diferentes de Jewelry (anéis/pingentes). Soul Shards são artefatos únicos de endgame.',
  };

  fs.writeFileSync(OUT, JSON.stringify(payload, null, 2));
  fs.writeFileSync(MANIFEST_OUT, JSON.stringify(manifest, null, 2));
  console.log(`✓ ${downloaded} imagens de joia → ${IMG_DIR}`);
  console.log(`✓ jewel-school-images.json · jewels-guide.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

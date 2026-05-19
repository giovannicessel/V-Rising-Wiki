/**
 * Enriquece bosses em entities.raw.json com recompensas e combate do wikitext Fandom.
 * Uso: node scripts/enrich-boss-rewards.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseBossCombat, parseBossRewards } from '../shared/boss-wikitext-parser.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAW_PATH = path.join(__dirname, '../client/src/data/entities.raw.json');
const API = 'https://vrising.fandom.com/api.php';
const DELAY_MS = 350;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchWikitext(slug) {
  const url = `${API}?${new URLSearchParams({
    action: 'parse',
    page: slug,
    prop: 'wikitext',
    format: 'json',
  })}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'VRisingDarkWiki/1.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data?.parse?.wikitext?.['*'] ?? '';
}

async function main() {
  const raw = JSON.parse(fs.readFileSync(RAW_PATH, 'utf8'));
  const bosses = raw.entities.filter((e) => e.type === 'boss');
  let updated = 0;

  for (let i = 0; i < bosses.length; i++) {
    const boss = bosses[i];
    const slug = boss.slug || boss.title?.replace(/ /g, '_');
    process.stdout.write(`[${i + 1}/${bosses.length}] ${boss.title}… `);

    try {
      const wikitext = await fetchWikitext(slug);
      const rewards = parseBossRewards(wikitext);
      const combat = parseBossCombat(wikitext);
      boss.parsedBoss = { rewards, combat };
      updated++;
      console.log(
        `✓ school=${rewards.primarySchool ?? '-'} spells=${rewards.spells.length} recipes=${rewards.recipes.length}`
      );
    } catch (e) {
      console.log(`✗ ${e.message}`);
    }

    await sleep(DELAY_MS);
  }

  raw.syncedAt = new Date().toISOString();
  fs.writeFileSync(RAW_PATH, JSON.stringify(raw, null, 2));
  console.log(`\n✓ ${updated} bosses enriquecidos → ${RAW_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

/**
 * Traduz JSONs auxiliares (catálogo de armas, joias de feitiço, jewelry).
 * Cache compartilhado: client/src/data/content-pt-cache.json
 *
 * npm run translate:json
 * npm run translate:json:apply
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { hashText, looksEnglish } from '../shared/gemini-translate.mjs';
import { runTranslationQueue } from '../shared/translate-runner.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
dotenv.config({ path: path.join(ROOT, '.env') });
dotenv.config({ path: path.join(ROOT, '.env.local') });

const CACHE_PATH = path.join(ROOT, 'client/src/data/content-pt-cache.json');
const DELAY_MS = Number(process.env.GOOGLE_TRANSLATE_DELAY_MS || 6000);
const BATCH_SIZE = Number(process.env.GOOGLE_TRANSLATE_JSON_BATCH || 2);

function parseArgs() {
  return {
    apply: process.argv.includes('--apply'),
    force: process.argv.includes('--force'),
    limit: Number(process.argv.find((a) => a.startsWith('--limit='))?.split('=')[1] || 0),
  };
}

function loadCache() {
  if (!fs.existsSync(CACHE_PATH)) return { version: 1, entries: {} };
  return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));
}

function saveCache(cache) {
  cache.updatedAt = new Date().toISOString();
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
}

function addJob(jobs, key, text) {
  const trimmed = (text || '').trim();
  if (!trimmed || trimmed.length < 8) return;
  if (!looksEnglish(trimmed)) return;
  jobs.push({ key, text: trimmed });
}

function collectWeaponsCatalogJobs() {
  const file = path.join(ROOT, 'client/src/data/weapons-catalog.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
  const jobs = [];
  data.types?.forEach((t, ti) => {
    addJob(jobs, `weapons-catalog::${ti}::passive`, t.passive);
    t.skills?.forEach((s, si) => {
      addJob(jobs, `weapons-catalog::${ti}::skills::${si}::description`, s.description);
    });
    t.variants?.forEach((v, vi) => {
      addJob(jobs, `weapons-catalog::${ti}::variants::${vi}::bonus`, v.bonus);
    });
  });
  return { file, data, jobs };
}

function collectSpellJewelJobs() {
  const file = path.join(ROOT, 'client/src/data/spell-jewel-modifiers.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
  const jobs = [];
  data.spells?.forEach((sp, i) => {
    const enMods = (sp.modifiers || []).filter((m) => looksEnglish(m));
    if (!enMods.length) return;
    const text = enMods.map((m, j) => `${j + 1}. ${m}`).join('\n');
    addJob(jobs, `spell-jewel-modifiers::${i}::modifiers`, text);
  });
  return { file, data, jobs };
}

function collectJewelryJobs() {
  const file = path.join(ROOT, 'client/src/data/jewelry-catalog.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
  const jobs = [];
  data.items?.forEach((it, i) => {
    for (const field of ['stats', 'source', 'materials']) {
      addJob(jobs, `jewelry-catalog::${i}::${field}`, it[field]);
    }
  });
  return { file, data, jobs };
}

function applyWeaponsCatalog(data, cache) {
  data.types?.forEach((t, ti) => {
    const passive = cache.entries[`weapons-catalog::${ti}::passive`];
    if (passive?.text) t.passivePt = passive.text;
    t.skills?.forEach((s, si) => {
      const hit = cache.entries[`weapons-catalog::${ti}::skills::${si}::description`];
      if (hit?.text) s.descriptionPt = hit.text.replace(/&nbsp;/g, ' ');
    });
    t.variants?.forEach((v, vi) => {
      const hit = cache.entries[`weapons-catalog::${ti}::variants::${vi}::bonus`];
      if (hit?.text) v.bonusPt = hit.text;
    });
  });
  return data;
}

function applySpellJewels(data, cache) {
  data.spells?.forEach((sp, i) => {
    const hit = cache.entries[`spell-jewel-modifiers::${i}::modifiers`];
    if (!hit?.text) return;
    const lines = hit.text
      .split('\n')
      .map((l) => l.replace(/^\d+\.\s*/, '').trim())
      .filter(Boolean);
    if (lines.length === sp.modifiers?.length) {
      sp.modifiersPt = lines;
    } else {
      sp.modifiersPt = lines;
    }
  });
  return data;
}

function applyJewelry(data, cache) {
  data.items?.forEach((it, i) => {
    for (const field of ['stats', 'source', 'materials']) {
      const hit = cache.entries[`jewelry-catalog::${i}::${field}`];
      if (hit?.text) it[`${field}Pt`] = hit.text;
    }
  });
  return data;
}

async function main() {
  const { apply, force, limit } = parseArgs();
  const cache = loadCache();
  const save = () => saveCache(cache);

  const sets = [
    { label: 'weapons-catalog', ...collectWeaponsCatalogJobs() },
    { label: 'spell-jewel-modifiers', ...collectSpellJewelJobs() },
    { label: 'jewelry-catalog', ...collectJewelryJobs() },
  ];

  let allJobs = sets.flatMap((s) => s.jobs);
  if (limit > 0) allJobs = allJobs.slice(0, limit);

  await runTranslationQueue({
    jobs: allJobs,
    cache,
    saveCache: save,
    force,
    batchSize: BATCH_SIZE,
    delayMs: DELAY_MS,
    label: 'JSON',
  });

  if (apply) {
    for (const set of sets) {
      let data = set.data;
      if (set.label === 'weapons-catalog') data = applyWeaponsCatalog(data, cache);
      if (set.label === 'spell-jewel-modifiers') data = applySpellJewels(data, cache);
      if (set.label === 'jewelry-catalog') data = applyJewelry(data, cache);
      fs.writeFileSync(set.file, JSON.stringify(data, null, 2));
      console.log(`✓ ${set.label} atualizado`);
    }
  } else {
    console.log('Execute com --apply para gravar nos JSONs');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

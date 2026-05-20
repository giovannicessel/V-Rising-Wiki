/**
 * Traduz textos das entidades para pt-BR via Gemini (blocos).
 * Cache: client/src/data/content-pt-cache.json
 *
 * Uso:
 *   node scripts/translate-content-pt.mjs
 *   node scripts/translate-content-pt.mjs --dry-run
 *   node scripts/translate-content-pt.mjs --limit=20
 *   node scripts/translate-content-pt.mjs --apply   # grava em entities.json
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

const ENTITIES_PATH = path.join(ROOT, 'client/src/data/entities.json');
const CACHE_PATH = path.join(ROOT, 'client/src/data/content-pt-cache.json');
const DELAY_MS = Number(process.env.GOOGLE_TRANSLATE_DELAY_MS || 6000);
const BATCH_SIZE = Number(process.env.GOOGLE_TRANSLATE_BATCH || 1);
const MAX_CONSECUTIVE_FAILS = Number(process.env.GOOGLE_TRANSLATE_MAX_FAILS || 8);

const MAX_BLOCK = 2800;

function parseArgs() {
  return {
    dryRun: process.argv.includes('--dry-run'),
    apply: process.argv.includes('--apply'),
    cacheOnly: process.argv.includes('--cache-only'),
    limit: Number(process.argv.find((a) => a.startsWith('--limit='))?.split('=')[1] || 0),
    force: process.argv.includes('--force'),
  };
}

function collectJobs(entities) {
  const jobs = [];

  const add = (entityId, field, text) => {
    const trimmed = (text || '').trim();
    if (!trimmed || trimmed.length < 15) return;
    if (!looksEnglish(trimmed)) return;
    if (trimmed.length > MAX_BLOCK) {
      const chunks = trimmed.match(/[\s\S]{1,2400}(?:\n\n|$)/g) || [trimmed];
      chunks.forEach((chunk, i) => {
        if (chunk.trim().length >= 15 && looksEnglish(chunk)) {
          jobs.push({
            entityId,
            field: `${field}__${i}`,
            text: chunk.trim(),
          });
        }
      });
      return;
    }
    jobs.push({ entityId, field, text: trimmed });
  };

  for (const e of entities) {
    add(e.id, 'description', e.description);
    add(e.id, 'location', e.location);
    if (e.meta?.lore) add(e.id, 'meta.lore', e.meta.lore);
    if (e.meta?.fightGuide) add(e.id, 'meta.fightGuide', e.meta.fightGuide);
    if (e.meta?.loot) add(e.id, 'meta.loot', e.meta.loot);
    if (e.meta?.crafts) add(e.id, 'meta.crafts', e.meta.crafts);
    if (e.meta?.drops) add(e.id, 'meta.drops', e.meta.drops);
    if (e.meta?.requirements) add(e.id, 'meta.requirements', e.meta.requirements);
    if (e.meta?.unlockRequirement) add(e.id, 'meta.unlockRequirement', e.meta.unlockRequirement);
    if (e.meta?.jewels) add(e.id, 'meta.jewels', e.meta.jewels);
    e.meta?.phases?.forEach((p, i) => {
      add(e.id, `meta.phases.${i}.title`, p.title);
      add(e.id, `meta.phases.${i}.body`, p.body);
    });
    e.sections?.forEach((s, i) => {
      add(e.id, `sections.${i}.body`, s.body);
    });
  }

  return jobs;
}

function loadCache() {
  if (!fs.existsSync(CACHE_PATH)) return { version: 1, entries: {} };
  return JSON.parse(fs.readFileSync(CACHE_PATH, 'utf-8'));
}

function saveCache(cache) {
  cache.updatedAt = new Date().toISOString();
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
}

function cacheKey(entityId, field) {
  return `${entityId}::${field}`;
}

function applyToEntity(entity, cache) {
  const get = (field) => cache.entries[`${entity.id}::${field}`]?.text;

  const next = { ...entity };
  if (get('description')) next.description = get('description');
  if (get('location')) next.location = get('location');

  if (entity.meta) {
    const meta = { ...entity.meta };
    for (const key of [
      'lore',
      'fightGuide',
      'loot',
      'crafts',
      'drops',
      'requirements',
      'unlockRequirement',
      'jewels',
    ]) {
      const v = get(`meta.${key}`);
      if (v) meta[key] = v;
    }
    if (meta.phases) {
      meta.phases = meta.phases.map((p, i) => ({
        title: get(`meta.phases.${i}.title`) || p.title,
        body: get(`meta.phases.${i}.body`) || p.body,
      }));
    }
    if (meta.craftRecipe?.summary && get('meta.crafts')) {
      meta.craftRecipe = {
        ...meta.craftRecipe,
        summaryPt: get('meta.crafts'),
      };
    }
    next.meta = meta;
  }

  if (entity.sections?.length) {
    next.sections = entity.sections.map((s, i) => ({
      ...s,
      body: get(`sections.${i}.body`) || s.body,
    }));
  }

  return next;
}

async function main() {
  const { dryRun, apply, cacheOnly, limit, force } = parseArgs();
  const { entities } = JSON.parse(fs.readFileSync(ENTITIES_PATH, 'utf-8'));
  const cache = loadCache();

  if (cacheOnly) {
    const merged = entities.map((e) => applyToEntity(e, cache));
    const data = JSON.parse(fs.readFileSync(ENTITIES_PATH, 'utf-8'));
    data.entities = merged;
    fs.writeFileSync(ENTITIES_PATH, JSON.stringify(data, null, 2));
    console.log(
      `✓ entities.json atualizado (${Object.keys(cache.entries).length} entradas no cache)`
    );
    return;
  }

  const jobs = collectJobs(entities);

  const pending = jobs.filter((j) => {
    const key = cacheKey(j.entityId, j.field);
    const h = hashText(j.text);
    const hit = cache.entries[key];
    return force || !hit || hit.sourceHash !== h;
  });

  const queueJobs = pending.map((j) => ({
    key: cacheKey(j.entityId, j.field),
    text: j.text,
  }));
  const toRun = limit > 0 ? queueJobs.slice(0, limit) : queueJobs;

  console.log(`Jobs: ${jobs.length} total, ${pending.length} pendentes, traduzindo ${toRun.length}`);

  if (dryRun) {
    toRun.slice(0, 5).forEach((j) => console.log(`  ${j.key} (${j.text.length} chars)`));
    return;
  }

  try {
    await runTranslationQueue({
      jobs: toRun,
      cache,
      saveCache,
      force,
      batchSize: BATCH_SIZE,
      delayMs: DELAY_MS,
      maxConsecutiveFails: MAX_CONSECUTIVE_FAILS,
      label: 'Entidades',
    });
  } catch (err) {
    console.error(
      `\n✗ ${err.message}\n` +
        'Habilite a API em https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com\n' +
        'Aguarde alguns minutos e rode: npm run translate:all:apply'
    );
  }

  console.log(`\n✓ Cache: ${CACHE_PATH} (${Object.keys(cache.entries).length} entradas)`);

  if (apply) {
    const merged = entities.map((e) => applyToEntity(e, cache));
    const data = JSON.parse(fs.readFileSync(ENTITIES_PATH, 'utf-8'));
    data.entities = merged;
    fs.writeFileSync(ENTITIES_PATH, JSON.stringify(data, null, 2));
    console.log('✓ entities.json atualizado com traduções PT');
  } else {
    console.log('Execute com --apply para gravar em entities.json');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

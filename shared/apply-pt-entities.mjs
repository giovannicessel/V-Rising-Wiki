import { hashText } from './gemini-translate.mjs';

export function cacheKey(entityId, field) {
  return `${entityId}::${field}`;
}

export function setCacheEntry(cache, entityId, field, text, source = 'import') {
  const trimmed = (text || '').trim();
  if (!trimmed || trimmed.length < 12) return false;
  if (/^abrir página$/i.test(trimmed)) return false;
  cache.entries[cacheKey(entityId, field)] = {
    sourceHash: hashText(trimmed),
    text: trimmed,
    translatedAt: new Date().toISOString(),
    source,
  };
  return true;
}

export function applyToEntity(entity, cache) {
  const get = (field) => cache.entries[cacheKey(entity.id, field)]?.text;

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

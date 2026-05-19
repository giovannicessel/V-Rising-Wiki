import type { EntitySection } from '@/data/entity-types';

const SKIP_SECTION_TITLES =
  /^(version history|recipes?|crafting|building|recipe|navbox|gallery|see also|categories?)$/i;

const TABLE_SECTION_TITLES = /^(recipes?|crafting|building|recipe|drops?|loot table)$/i;

function stripWikiTables(text: string): string {
  let t = text;
  let prev: string;
  do {
    prev = t;
    t = t.replace(/\{\|[^]*?\|\}/g, '');
  } while (t !== prev);
  return t;
}

function stripWikiTemplates(text: string): string {
  let t = text;
  let prev: string;
  do {
    prev = t;
    t = t.replace(/\{\{[^{}]*\}\}/g, '');
    t = t.replace(/\{\{[\s\S]*?\}\}/g, '');
  } while (t !== prev);
  return t;
}

export function sanitizeWikiText(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';

  let t = raw
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/''+/g, '');

  t = stripWikiTables(t);
  t = stripWikiTemplates(t);

  t = t
    .replace(/\[\[([^\]|#]+)(?:#[^\]|]+)?\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]|#]+)(?:#([^\]]+))?\]\]/g, (_, page, anchor) => {
      const label = anchor || page.split('/').pop() || page;
      return label.replace(/_/g, ' ');
    })
    .replace(/^Category:[^\n]+\n?/gim, '')
    .replace(/^[\s]*[\*#:]+\s*/gm, '')
    .replace(/^\|+.*$/gm, '')
    .replace(/^!+.*$/gm, '')
    .replace(/^[-]{2,}.*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .trim();

  return t;
}

export function cleanLocationText(raw: string): string {
  if (!raw) return '';
  let t = String(raw);
  t = t.replace(
    /\[(?:https?:\/\/[^\s\]]+)?\s*([^\]]+)\]/gi,
    (_, inner: string) => {
      const parts = inner.trim().split(/\s+/).filter(Boolean);
      if (
        parts.some((p) => /fandom\.com|Map:Vardoran/i.test(p)) &&
        parts.length > 1
      ) {
        return parts.slice(1).join(' ');
      }
      return inner.replace(/Map:Vardoran\?marker=\d+/gi, '').trim();
    }
  );
  t = t.replace(/Map:Vardoran\?marker=\d+\s*/gi, '');
  t = t.replace(/https?:\/\/\S+/g, '');
  t = sanitizeWikiText(t);
  if (/fandom\.com|Map:Vardoran|\?marker=/i.test(t)) return '';
  return t;
}

export function isLowQualityText(text: string): boolean {
  if (!text || text.length < 8) return true;
  if (/^\{\|/.test(text.trim())) return true;
  if (/class="fandom-table"/i.test(text)) return true;
  if (/class="wikitable"/i.test(text)) return true;
  if (/^\|[-!]/.test(text.trim())) return true;

  const letters = (text.match(/[a-zA-ZÀ-ÿ]/g) || []).length;
  if (letters / text.length < 0.25 && text.length > 40) return true;

  const junk = (text.match(/[|{}=[\]]/g) || []).length;
  if (junk > text.length * 0.15) return true;

  return false;
}

export function shouldSkipSection(title: string, body: string): boolean {
  const t = (title || '').trim();
  if (SKIP_SECTION_TITLES.test(t)) return true;
  if (/video showcase/i.test(t)) return false;
  const cleaned = sanitizeWikiText(body);
  if (!cleaned || cleaned.length < 12) return true;
  if (TABLE_SECTION_TITLES.test(t) && isLowQualityText(body)) return true;
  if (isLowQualityText(cleaned)) return true;
  return false;
}

function sanitizeSection(section: EntitySection): EntitySection | null {
  if (section.kind === 'video' && section.youtubeId) return section;
  const body = sanitizeWikiText(section.body || '');
  if (shouldSkipSection(section.title, section.body || body)) return null;
  return { ...section, body };
}

export function sanitizeInfobox(
  infobox: Record<string, string>
): Record<string, string> {
  if (!infobox || typeof infobox !== 'object') return {};
  const out: Record<string, string> = {};
  const skipKeys = new Set(['_template', 'title', 'image', 'image1', 'image2', 'caption']);
  for (const [key, val] of Object.entries(infobox)) {
    if (skipKeys.has(key)) continue;
    const cleaned = sanitizeWikiText(String(val ?? ''));
    if (!cleaned || isLowQualityText(cleaned)) continue;
    if (cleaned.length > 600) continue;
    out[key] = cleaned;
  }
  return out;
}

export function pickReadableSections(sections: EntitySection[]): EntitySection[] {
  if (!Array.isArray(sections)) return [];
  const priority = [
    /^overview$/i,
    /^location$/i,
    /^unlock/i,
    /^rewards?$/i,
    /^history$/i,
    /^notes?$/i,
    /^trivia$/i,
    /video showcase/i,
  ];

  const cleaned = sections.map(sanitizeSection).filter(Boolean) as EntitySection[];

  cleaned.sort((a, b) => {
    const ai = priority.findIndex((p) => p.test(a.title));
    const bi = priority.findIndex((p) => p.test(b.title));
    return (ai === -1 ? 50 : ai) - (bi === -1 ? 50 : bi);
  });

  return cleaned.slice(0, 6);
}

const BOSS_SECTION_KEEP =
  /^(overview|location|attacks|phase \d|the fight|equipment|loot|drops|items|blueprint|recipes|other notes|reward|abilities)/i;

export function pickBossSections(sections: EntitySection[]): EntitySection[] {
  if (!Array.isArray(sections)) return [];
  return sections
    .map((s) => {
      if (s.kind === 'video' && s.youtubeId) return s;
      const body = sanitizeWikiText(s.body || '');
      if (!body || body.length < 15) return null;
      if (isLowQualityText(body) && !BOSS_SECTION_KEEP.test(s.title)) return null;
      return { ...s, body };
    })
    .filter((s): s is EntitySection => s !== null)
    .filter((s) => BOSS_SECTION_KEEP.test(s.title) || /phase \d/i.test(s.title))
    .slice(0, 12);
}

/**
 * Extrai receitas de tabelas wikitext (seção Crafting da Fandom).
 */
import { sanitizeWikiText } from './wiki-sanitize.mjs';

function parseItemFrame(line) {
  const frames = [...line.matchAll(/\{\{ItemFrame\|([^}|]+)(?:\|(\d+))?[^}]*\}\}/gi)];
  return frames.map((m) => ({
    name: m[1].trim().replace(/_/g, ' '),
    quantity: m[2] ? Number(m[2]) : 1,
  }));
}

/**
 * @param {string} wikitext — corpo da seção Crafting ou tabela {| ...
 * @returns {{ output?: string, structure?: string, materials: { name: string, quantity: number }[] } | null}
 */
export function parseCraftTable(wikitext) {
  if (!wikitext || !/\{\|/.test(wikitext)) return null;

  const rows = wikitext.split(/\|-/).slice(1);
  if (!rows.length) return null;

  const first = rows[0];
  const cells = first.split(/\n/).filter((l) => l.trim().startsWith('|'));

  if (cells.length < 2) return null;

  const outputFrames = parseItemFrame(cells[0]);
  const materials = parseItemFrame(cells[1] || '');
  const structureFrames = cells[2] ? parseItemFrame(cells[2]) : [];

  const output = outputFrames[0]?.name;
  const structure = structureFrames[0]?.name;

  if (!materials.length && !output) return null;

  return {
    output,
    structure,
    materials: materials.length ? materials : [],
    summary: sanitizeWikiText(
      [
        output ? `Produz: ${output}` : '',
        structure ? `Estrutura: ${structure}` : '',
        materials.length
          ? `Materiais: ${materials.map((m) => `${m.quantity}x ${m.name}`).join(', ')}`
          : '',
      ]
        .filter(Boolean)
        .join('\n')
    ),
  };
}

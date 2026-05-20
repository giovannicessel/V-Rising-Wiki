/**
 * Tradução em lote via Gemini (texto).
 * Requer GOOGLE_API_KEY ou GEMINI_API_KEY no .env
 */
import crypto from 'crypto';

const MODEL_FALLBACKS = [
  process.env.GOOGLE_TEXT_MODEL,
  'gemini-2.5-flash',
  'gemini-2.0-flash',
].filter(Boolean);

export function hashText(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex').slice(0, 16);
}

export function looksEnglish(text) {
  if (!text || text.length < 12) return false;
  const sample = text.slice(0, 500).toLowerCase();
  const ptHints = /\b(não|você|chefe|feitiço|recompensa|nível|ataque|sangue)\b/g;
  const enHints = /\b(the|and|with|this|that|when|damage|player|spell|boss)\b/g;
  const pt = (sample.match(ptHints) || []).length;
  const en = (sample.match(enHints) || []).length;
  if (pt >= 2 && pt > en) return false;
  return en >= 2 || (en >= 1 && pt === 0);
}

function getApiKey() {
  const key = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error(
      'Defina GOOGLE_API_KEY no .env (https://aistudio.google.com/apikey)'
    );
  }
  return key;
}

async function callGemini(model, prompt, { retries = 4 } = {}) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': getApiKey(),
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 8192 },
      }),
    });
    const data = await res.json();
    if (res.ok) {
      return data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ?? '';
    }
    const msg = data?.error?.message || `API ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.quota = /quota|rate limit|429|resource exhausted|high demand|try again later/i.test(
      String(msg)
    );
    lastErr = err;
    if (err.quota && attempt < retries) {
      const retrySec = Number(String(msg).match(/retry in ([\d.]+)s/i)?.[1]);
      const wait = retrySec
        ? Math.ceil(retrySec * 1000) + 2000
        : Math.min(90000, 12000 * (attempt + 1));
      await sleep(wait);
      continue;
    }
    throw err;
  }
  throw lastErr ?? new Error('Falha na API Gemini');
}

function parseBatchResponse(raw, expectedCount) {
  const clean = raw.trim();
  if (expectedCount === 1) return [clean];

  let parts = clean
    .split(/---BLOCK---/i)
    .map((s) => s.replace(/^###\s*BLOCO\s*\d+\s*/i, '').trim())
    .filter(Boolean);
  if (parts.length === expectedCount) return parts;

  const byHeader = [];
  const re = /###\s*BLOCO\s*(\d+)\s*\n([\s\S]*?)(?=###\s*BLOCO\s*\d+|$)/gi;
  let m;
  while ((m = re.exec(clean))) {
    byHeader[Number(m[1]) - 1] = m[2].trim();
  }
  if (byHeader.filter(Boolean).length === expectedCount) {
    return byHeader;
  }

  return null;
}

async function translateOne(text, { model } = {}) {
  const prompt = `Traduza o texto abaixo para português brasileiro (wiki do jogo V Rising).
Mantenha nomes de chefes/itens em inglês se não houver tradução oficial clara.
Preserve números, listas e quebras de linha. Responda só com a tradução, sem comentários.

${text.trim()}`;

  const models = model ? [model, ...MODEL_FALLBACKS] : MODEL_FALLBACKS;
  let lastErr;
  for (const m of [...new Set(models)]) {
    try {
      return (await callGemini(m, prompt)).trim();
    } catch (e) {
      lastErr = e;
      const retryable =
        e.quota || /not found|not supported|high demand|try again later/i.test(e.message || '');
      if (retryable) continue;
      throw e;
    }
  }
  throw lastErr ?? new Error('Falha na tradução');
}

export async function translateBlocksToPt(blocks, { model } = {}) {
  if (!blocks.length) return [];
  if (blocks.length === 1) return [await translateOne(blocks[0], { model })];

  const numbered = blocks
    .map((b, i) => `### BLOCO ${i + 1}\n${b.trim()}`)
    .join('\n\n');

  const prompt = `Traduza cada bloco para português brasileiro (pt-BR), wiki V Rising.
Regras: preserve números e formatação; nomes próprios podem ficar em inglês.
Responda com exatamente ${blocks.length} blocos, nesta ordem, separados pela linha: ---BLOCK---

${numbered}`;

  const models = model ? [model, ...MODEL_FALLBACKS] : MODEL_FALLBACKS;
  for (const m of [...new Set(models)]) {
    try {
      const raw = await callGemini(m, prompt);
      const parts = parseBatchResponse(raw, blocks.length);
      if (parts) return parts;
    } catch (e) {
      if (!e.quota) {
        // fallback abaixo
      }
    }
  }

  const out = [];
  for (const block of blocks) {
    out.push(await translateOne(block, { model }));
  }
  return out;
}

export function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

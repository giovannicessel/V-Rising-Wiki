/**
 * Testa se GOOGLE_API_KEY aceita requisições de texto.
 * Uso: node scripts/check-gemini-key.mjs
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(root, '.env') });

const key = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
if (!key) {
  console.error('✗ GOOGLE_API_KEY não definida em .env');
  process.exit(1);
}

const model = process.env.GOOGLE_TEXT_MODEL || 'gemini-2.5-flash';
const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

const res = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
  body: JSON.stringify({
    contents: [{ parts: [{ text: 'Responda apenas: OK' }] }],
  }),
});

const data = await res.json();
if (!res.ok) {
  const msg = data?.error?.message || res.statusText;
  console.error(`✗ API ${res.status}: ${msg}`);
  if (/leaked/i.test(msg)) {
    console.error(
      '\nEsta chave foi bloqueada pela Google (vazamento detectado).\n' +
        'Crie uma NOVA em https://aistudio.google.com/apikey e atualize só o .env local.'
    );
  } else if (/permission|not been used in project|has not been enabled/i.test(msg)) {
    console.error(
      '\nHabilite a API "Generative Language API" no seu projeto Google Cloud:\n' +
        'https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com\n' +
        'Ou crie a chave em https://aistudio.google.com/apikey (recomendado para este projeto).'
    );
  }
  process.exit(1);
}

const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
console.log(`✓ Chave válida (modelo ${model}). Resposta: ${text.trim()}`);

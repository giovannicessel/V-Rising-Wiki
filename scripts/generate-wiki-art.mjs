/**
 * Gera artes da wiki via Gemini (imagem nativa).
 *
 * Uso:
 *   1. Copie .env.example → .env e defina GOOGLE_API_KEY
 *   2. npm run generate:wiki-art
 *   3. npm run generate:wiki-art -- --only=hero-home
 *   4. npm run generate:wiki-art -- --dry-run
 *
 * Nunca commite a chave. Revogue em https://aistudio.google.com/apikey ao terminar.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

dotenv.config({ path: path.join(ROOT, '.env') });
dotenv.config({ path: path.join(ROOT, '.env.local') });

const PROMPTS_PATH = path.join(ROOT, 'client/src/data/wiki-art-prompts.json');
const OUT_DIR = path.join(ROOT, 'client/public/assets/wiki');
const MANIFEST_PATH = path.join(ROOT, 'client/src/data/wiki-art.json');

const MODEL = process.env.GOOGLE_IMAGE_MODEL || 'gemini-2.5-flash-image';
const DELAY_MS = Number(process.env.GOOGLE_AI_DELAY_MS || 8000);
const API_KEY = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function parseArgs() {
  const only = process.argv.find((a) => a.startsWith('--only='))?.split('=')[1];
  const dryRun = process.argv.includes('--dry-run');
  const force = process.argv.includes('--force');
  return { only, dryRun, force };
}

async function generateImage(prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE'],
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': API_KEY,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error?.message || res.statusText;
    throw new Error(`API ${res.status}: ${msg}`);
  }

  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  for (const part of parts) {
    if (part.inlineData?.data) {
      return {
        buffer: Buffer.from(part.inlineData.data, 'base64'),
        mimeType: part.inlineData.mimeType || 'image/png',
      };
    }
  }
  throw new Error('Resposta sem imagem (parts: ' + parts.map((p) => Object.keys(p)).join(', ') + ')');
}

function extFromMime(mime) {
  if (mime.includes('webp')) return '.webp';
  if (mime.includes('jpeg') || mime.includes('jpg')) return '.jpg';
  return '.png';
}

function buildManifest(assets) {
  const images = {};
  for (const a of assets) {
    images[a.id] = `/assets/wiki/${a.file}`;
  }
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    model: MODEL,
    images,
  };
}

async function main() {
  const { only, dryRun, force } = parseArgs();

  if (!API_KEY && !dryRun) {
    console.error(`
✗ Defina GOOGLE_API_KEY no arquivo .env (na raiz do projeto).

  GOOGLE_API_KEY=sua_chave_aqui
  GOOGLE_AI_DELAY_MS=8000
  GOOGLE_IMAGE_MODEL=gemini-2.0-flash-preview-image-generation

Obtenha a chave em: https://aistudio.google.com/apikey
Não cole a chave no chat — rode: npm run generate:wiki-art
`);
    process.exit(1);
  }

  const { stylePrefix, assets: allAssets } = JSON.parse(fs.readFileSync(PROMPTS_PATH, 'utf8'));
  const assets = only ? allAssets.filter((a) => a.id === only) : allAssets;

  if (only && assets.length === 0) {
    console.error(`✗ ID não encontrado: ${only}`);
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(path.join(OUT_DIR, 'sections'), { recursive: true });

  console.log(`Modelo: ${MODEL}`);
  console.log(`Intervalo: ${DELAY_MS}ms entre imagens`);
  console.log(`Saída: ${OUT_DIR}`);
  if (dryRun) console.log('(dry-run — sem chamadas à API)\n');

  const completed = [];

  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    const outPath = path.join(OUT_DIR, asset.file);
    const fullPrompt = `${stylePrefix} ${asset.aspectNote}. ${asset.prompt}`;

    if (fs.existsSync(outPath) && !force) {
      console.log(`[${i + 1}/${assets.length}] ⊘ ${asset.id} (já existe, use --force)`);
      completed.push(asset);
      continue;
    }

    console.log(`[${i + 1}/${assets.length}] … ${asset.id}`);
    if (dryRun) {
      console.log(`   Prompt: ${fullPrompt.slice(0, 120)}…`);
      completed.push(asset);
      continue;
    }

    try {
      const { buffer, mimeType } = await generateImage(fullPrompt);
      let finalPath = outPath;
      let fileKey = asset.file;
      const wantExt = path.extname(asset.file);
      const gotExt = extFromMime(mimeType);
      if (wantExt !== gotExt) {
        finalPath = outPath.replace(/\.[^.]+$/, gotExt);
        fileKey = path.relative(OUT_DIR, finalPath).replace(/\\/g, '/');
      }
      fs.writeFileSync(finalPath, buffer);
      console.log(`   ✓ ${finalPath} (${(buffer.length / 1024).toFixed(1)} KB, ${mimeType})`);
      completed.push({ ...asset, file: fileKey });
    } catch (e) {
      console.error(`   ✗ ${asset.id}: ${e.message}`);
      if (String(e.message).includes('429') || String(e.message).includes('RESOURCE_EXHAUSTED')) {
        console.error('   → Rate limit: aumente GOOGLE_AI_DELAY_MS ou aguarde 1 minuto.');
      }
        if (String(e.message).includes('quota') || String(e.message).includes('paid plans')) {
        console.error('\n   → Plano gratuito sem cota de imagem. Ative billing em https://ai.google.dev/ ou use artes já geradas em public/assets/wiki/');
        break;
      }
      process.exitCode = 1;
    }

    if (i < assets.length - 1) {
      await sleep(DELAY_MS);
    }
  }

  if (!dryRun && completed.length) {
    const manifest = buildManifest(
      only ? JSON.parse(fs.readFileSync(PROMPTS_PATH, 'utf8')).assets.filter((a) => completed.some((c) => c.id === a.id)) : allAssets
    );
    const existing = fs.existsSync(MANIFEST_PATH)
      ? JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'))
      : { images: {} };
    manifest.images = { ...existing.images, ...manifest.images };
    manifest.generatedAt = new Date().toISOString();
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
    console.log(`\n✓ Manifesto → ${MANIFEST_PATH}`);
  }

  console.log('\nConcluído. Revogue a API key no Google AI Studio se foi temporária.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

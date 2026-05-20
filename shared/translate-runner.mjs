/**
 * Fila de tradução com cache, lotes e pausa entre requisições.
 */
import {
  hashText,
  translateBlocksToPt,
  sleep,
} from './gemini-translate.mjs';

export function isApiBlockedError(msg) {
  return /permission|not been used in project|has not been enabled|API key not valid/i.test(
    msg || ''
  );
}

export function isRateLimitError(msg) {
  return /429|rate limit|resource exhausted|quota|high demand|try again later/i.test(
    msg || ''
  );
}

/**
 * @param {object} opts
 * @param {{ key: string, text: string }[]} opts.jobs
 * @param {{ version: number, entries: Record<string, { sourceHash: string, text: string }> }} opts.cache
 * @param {(cache: object) => void} opts.saveCache
 * @param {boolean} [opts.force]
 * @param {number} [opts.batchSize]
 * @param {number} [opts.delayMs]
 * @param {number} [opts.maxConsecutiveFails]
 * @param {string} [opts.label]
 */
export async function runTranslationQueue({
  jobs,
  cache,
  saveCache,
  force = false,
  batchSize = 1,
  delayMs = 3500,
  maxConsecutiveFails = 8,
  label = 'Tradução',
}) {
  const pending = jobs.filter((j) => {
    const hit = cache.entries[j.key];
    return force || !hit || hit.sourceHash !== hashText(j.text);
  });

  console.log(
    `${label}: ${jobs.length} total, ${pending.length} pendentes, lote=${batchSize}, pausa=${delayMs}ms`
  );

  let consecutiveFails = 0;

  for (let i = 0; i < pending.length; i += batchSize) {
    if (consecutiveFails >= maxConsecutiveFails) {
      throw new Error(
        `Interrompido após ${maxConsecutiveFails} falhas seguidas. Aguarde alguns minutos e rode de novo.`
      );
    }

    const batch = pending.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(pending.length / batchSize);
    if (batchNum === 1 || batchNum % 10 === 0 || batchNum === totalBatches) {
      console.log(`  ${label} lote ${batchNum}/${totalBatches}…`);
    }

    try {
      const translated = await translateBlocksToPt(batch.map((b) => b.text));
      batch.forEach((job, idx) => {
        cache.entries[job.key] = {
          sourceHash: hashText(job.text),
          text: translated[idx],
          translatedAt: new Date().toISOString(),
        };
      });
      saveCache(cache);
      consecutiveFails = 0;
    } catch (err) {
      if (isApiBlockedError(err.message) || isRateLimitError(err.message)) {
        consecutiveFails++;
      }
      console.warn(`  Lote falhou (${err.message}); item a item…`);
      for (const job of batch) {
        try {
          const [translated] = await translateBlocksToPt([job.text]);
          cache.entries[job.key] = {
            sourceHash: hashText(job.text),
            text: translated,
            translatedAt: new Date().toISOString(),
          };
          saveCache(cache);
          consecutiveFails = 0;
          await sleep(Math.min(delayMs, 2500));
        } catch (inner) {
          if (isApiBlockedError(inner.message) || isRateLimitError(inner.message)) {
            consecutiveFails++;
            if (isRateLimitError(inner.message)) {
              const wait = Math.min(90000, 20000 + consecutiveFails * 10000);
              console.warn(`  Rate limit / demanda — pausa ${wait / 1000}s…`);
              await sleep(wait);
            }
          }
          console.error(`  ✗ ${job.key}: ${inner.message}`);
        }
      }
    }

    if (i + batchSize < pending.length) await sleep(delayMs);
  }

  const failed = pending.filter((j) => {
    const hit = cache.entries[j.key];
    return !hit || hit.sourceHash !== hashText(j.text);
  });
  if (failed.length) {
    console.warn(`⚠ ${failed.length} blocos não traduzidos (${label}).`);
  }
  return { pending: pending.length, failed: failed.length };
}

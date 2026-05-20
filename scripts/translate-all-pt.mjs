/**
 * Traduz entidades + JSONs auxiliares (pt-BR via Gemini, em blocos com pausa).
 *
 * npm run translate:all
 * npm run translate:all:apply
 * npm run translate:all:apply -- --limit=50
 */
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

function runNode(script) {
  const pass = process.argv.slice(2);

  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(ROOT, 'scripts', script), ...pass], {
      cwd: ROOT,
      stdio: 'inherit',
      env: process.env,
    });
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`${script} exit ${code}`))));
  });
}

async function main() {
  console.log('=== 1/2 Entidades (descrições, lore, craft…) ===\n');
  await runNode('translate-content-pt.mjs');
  console.log('\n=== 2/2 JSONs (armas, joias de feitiço, jewelry) ===\n');
  await runNode('translate-json-pt.mjs');
  console.log('\n✓ Tradução completa (revise blocos com falha e rode de novo se necessário).');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

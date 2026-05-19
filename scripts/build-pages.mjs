import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "dist", "public");
const BASE = "/V-Rising-Wiki";

process.env.GITHUB_PAGES = "true";

const result = spawnSync("npx", ["vite", "build"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
  cwd: ROOT,
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

/** Garante paths absolutos `/assets/` no bundle (entities.json, etc.). */
function rewriteAssetPaths(dir) {
  for (const name of fs.readdirSync(dir)) {
    const filePath = path.join(dir, name);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      rewriteAssetPaths(filePath);
      continue;
    }
    if (!/\.(js|css|html|json)$/i.test(name)) continue;
    let content = fs.readFileSync(filePath, "utf8");
    const updated = content
      .replaceAll('"/assets/', `"${BASE}/assets/`)
      .replaceAll("'/assets/", `'${BASE}/assets/`);
    if (updated !== content) {
      fs.writeFileSync(filePath, updated, "utf8");
    }
  }
}

if (fs.existsSync(OUT)) {
  rewriteAssetPaths(OUT);
}

process.exit(0);

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

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

process.exit(0);

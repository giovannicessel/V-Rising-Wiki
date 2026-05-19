import { spawnSync } from "node:child_process";

process.env.GITHUB_PAGES = "true";

spawnSync("npx", ["vite", "preview", "--host", "--port", "4173"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

/** Caminho absoluto respeitando `import.meta.env.BASE_URL` (ex.: GitHub Pages). */
export function appPath(path: string): string {
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  const base = import.meta.env.BASE_URL;
  return `${base}${normalized}`.replace(/\/{2,}/g, '/');
}

/** URL de arquivo em `client/public` (paths que começam com `/assets/`). */
export function assetUrl(path: string | undefined | null): string {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;

  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (base && (path === base || path.startsWith(`${base}/`))) {
    return path;
  }

  return appPath(path.startsWith('/') ? path : `/${path}`);
}

/** Base sem barra final, para o Router do wouter. */
export function routerBase(): string {
  return import.meta.env.BASE_URL.replace(/\/$/, '') || '';
}

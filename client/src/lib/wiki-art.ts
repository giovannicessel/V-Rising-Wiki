import wikiArt from '@/data/wiki-art.json';
import { assetUrl } from '@/lib/app-path';

const images = wikiArt.images as Record<string, string>;

export function getWikiArt(id: string, fallback?: string): string {
  const path =
    images[id] ?? fallback ?? images['hero-home'] ?? '/assets/wiki/hero-home.png';
  return assetUrl(path);
}

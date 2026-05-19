import wikiArt from '@/data/wiki-art.json';

const images = wikiArt.images as Record<string, string>;

export function getWikiArt(id: string, fallback?: string): string {
  return images[id] ?? fallback ?? images['hero-home'] ?? '/assets/wiki/hero-home.png';
}

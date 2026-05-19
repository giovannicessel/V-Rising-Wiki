export function sanitizeWikiText(raw: string): string;
export function isLowQualityText(text: string): boolean;
export function shouldSkipSection(title: string, body: string): boolean;
export function sanitizeInfobox(infobox: Record<string, string>): Record<string, string>;
export function pickReadableSections(
  sections: Array<{ title: string; body?: string; kind?: string; youtubeId?: string }>
): Array<{ title: string; body: string; kind?: string; youtubeId?: string }>;

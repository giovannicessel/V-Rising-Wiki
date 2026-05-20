import jewelManifest from '@/data/jewel-school-images.json';
import { assetUrl } from '@/lib/app-path';
import { SCHOOL_ORDER } from '@/lib/school-theme';

type JewelManifest = {
  schools: string[];
  images: Record<string, Record<string, string>>;
};

const manifest = jewelManifest as JewelManifest;

function normalizeSchool(school?: string): string {
  if (school && manifest.images[school]?.['1']) return school;
  return manifest.schools[0] ?? 'Blood';
}

export function jewelTierImage(tier?: number | string, school?: string): string {
  const s = normalizeSchool(school);
  const key = String(tier ?? 1);
  const path =
    manifest.images[s]?.[key] ??
    manifest.images.Blood?.[key] ??
    manifest.images.Blood?.['1'] ??
    '/images/jewels/blood-tier1.png';
  return assetUrl(path);
}

export function jewelTierCycleSources(tier: number | string): { school: string; src: string }[] {
  const key = String(tier);
  const schools = manifest.schools.length ? manifest.schools : [...SCHOOL_ORDER];
  return schools
    .filter((school) => manifest.images[school]?.[key])
    .map((school) => ({
      school,
      src: jewelTierImage(key, school),
    }));
}

/** Tier → imagem (sangue) — compatibilidade com código legado. */
export const jewelTierImages: Record<string, string> = {
  '1': jewelTierImage(1),
  '2': jewelTierImage(2),
  '3': jewelTierImage(3),
  '4': jewelTierImage(4),
};

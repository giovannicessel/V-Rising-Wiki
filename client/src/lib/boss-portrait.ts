import type { WikiEntity } from '@/data/entity-types';
import { getSchoolTheme } from '@/lib/school-theme';

/** Borda colorida na miniatura só se o chefe desbloqueia magia de escola (não só forma vampírica). */
export function getBossPortraitBorder(entity: WikiEntity): {
  borderClass: string;
  accent: string;
  show: boolean;
} | null {
  if (entity.type !== 'boss') return null;

  const rewards = entity.meta?.rewards;
  if (!rewards?.hasSpellSchoolUnlock || !rewards.primarySchool) {
    return { borderClass: '', accent: '', show: false };
  }

  const theme = getSchoolTheme(rewards.primarySchool);
  if (!theme) return { borderClass: '', accent: '', show: false };

  return {
    borderClass: `border-2 ${theme.border}`,
    accent: theme.accent,
    show: true,
  };
}

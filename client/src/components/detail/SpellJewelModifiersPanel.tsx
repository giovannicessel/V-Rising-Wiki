import { Link } from 'wouter';
import { Gem } from 'lucide-react';
import ItemThumb from '@/components/ItemThumb';
import {
  formatJewelModifier,
  jewelModifiersForLocale,
  jewelTierImage,
  type SpellJewelEntry,
} from '@/lib/spell-jewels';
import { getSchoolTheme } from '@/lib/school-theme';
import { useTranslation } from '@/contexts/LocaleContext';

interface SpellJewelModifiersPanelProps {
  entry: SpellJewelEntry;
  compact?: boolean;
}

export default function SpellJewelModifiersPanel({
  entry,
  compact = false,
}: SpellJewelModifiersPanelProps) {
  const { t, locale } = useTranslation();
  const theme = getSchoolTheme(entry.school);
  const accent = theme?.accent ?? '#8b5cf6';
  const modifiers = jewelModifiersForLocale(entry, locale);

  return (
    <section
      className={`rounded-xl border p-5 ${compact ? 'p-4' : ''}`}
      style={{
        borderColor: `${accent}40`,
        background: `linear-gradient(135deg, ${accent}10 0%, transparent 70%)`,
      }}
    >
      <h2
        className={`font-gothic text-white mb-3 flex items-center gap-2 ${compact ? 'text-base' : 'text-lg'}`}
      >
        <Gem size={compact ? 16 : 18} style={{ color: accent }} />
        {t('spell.jewelsMods')} ({modifiers.length})
        {theme && (
          <span
            className="text-[10px] font-normal uppercase tracking-wider ml-1"
            style={{ color: accent }}
          >
            · {theme.label}
          </span>
        )}
      </h2>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {([1, 2, 3, 4] as const).map((tier) => (
          <span
            key={tier}
            className="flex items-center gap-1.5 text-[10px] text-[#888]"
            title={`Tier ${tier} — ${tier} modificador${tier > 1 ? 'es' : ''}`}
          >
            <ItemThumb
              src={jewelTierImage(tier, entry.school)}
              alt={`Joia ${theme?.label ?? entry.school} tier ${tier}`}
              size="sm"
              accentColor={accent}
            />
            <span>T{tier}</span>
          </span>
        ))}
        <Link
          href="/jewels"
          className="text-[10px] text-[#c41e3a] hover:underline ml-auto"
        >
          {t('spell.jewelsGuideLink')}
        </Link>
      </div>
      <p className="text-xs text-[#888] mb-4">{t('spell.jewelsModsNote')}</p>
      <ul className={`space-y-2 ${compact ? 'text-sm' : ''}`}>
        {modifiers.map((mod, i) => (
          <li
            key={i}
            className="flex gap-2 rounded-lg border border-[#2a2a2a] bg-[#0d0d0d]/80 px-3 py-2.5 text-[#ddd] leading-relaxed"
          >
            <span
              className="shrink-0 w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold mt-0.5"
              style={{
                background: `${accent}25`,
                color: accent,
              }}
            >
              {i + 1}
            </span>
            <span>{formatJewelModifier(mod)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

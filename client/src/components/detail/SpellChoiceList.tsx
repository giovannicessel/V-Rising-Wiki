import { Link } from 'wouter';
import { Wand2 } from 'lucide-react';
import type { BossUnlockEntry } from '@/data/entity-types';
import { entityDetailPath } from '@/lib/entity-paths';
import { getSchoolTheme } from '@/lib/school-theme';

export default function SpellChoiceList({
  choices,
  school,
  compact = false,
}: {
  choices: BossUnlockEntry[];
  school?: string;
  compact?: boolean;
}) {
  const theme = school ? getSchoolTheme(school) : null;

  if (!choices.length) {
    return (
      <p className="text-sm text-[#666] italic">
        Opções desta escola ainda não catalogadas na wiki.
      </p>
    );
  }

  return (
    <ul className={compact ? 'space-y-1.5' : 'space-y-2'}>
      {choices.map((entry) => {
        const href =
          entry.entityId && entry.entityType && entry.slug
            ? entityDetailPath(entry.entityType, entry.slug)
            : null;
        const row = (
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 shrink-0 rounded-md bg-[#0a0a0a] border flex items-center justify-center overflow-hidden ${
                theme ? theme.border : 'border-[#333]'
              }`}
            >
              {entry.image ? (
                <img src={entry.image} alt="" className="w-full h-full object-contain p-0.5" />
              ) : (
                <Wand2 size={16} className="text-[#555]" />
              )}
            </div>
            <span className="text-sm text-white font-medium truncate">{entry.name}</span>
          </div>
        );

        return (
          <li key={entry.nameEn ?? entry.name}>
            {href ? (
              <Link
                href={href}
                className="flex rounded-lg border border-[#2a2a2a] bg-[#0d0d0d]/80 px-3 py-2 hover:border-[#c41e3a]/40 transition-colors"
              >
                {row}
              </Link>
            ) : (
              <div className="flex rounded-lg border border-[#2a2a2a] bg-[#0d0d0d]/80 px-3 py-2">
                {row}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

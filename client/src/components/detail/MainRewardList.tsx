import { useState } from 'react';
import { Package } from 'lucide-react';
import AssetImage from '@/components/AssetImage';
import type { BossUnlockEntry } from '@/data/entity-types';
import RewardItemDialog from '@/components/detail/RewardItemDialog';
import { unlockEntryName } from '@/lib/entity-locale';
import type { Locale } from '@/i18n';

function MainRewardThumb({ entry }: { entry: BossUnlockEntry }) {
  return (
    <div className="w-11 h-11 shrink-0 rounded-lg bg-[#0a0a0a] border border-[#333] flex items-center justify-center overflow-hidden">
      {entry.image ? (
        <AssetImage src={entry.image} alt="" className="w-full h-full object-contain p-0.5" />
      ) : (
        <Package size={18} className="text-[#555]" />
      )}
    </div>
  );
}

export default function MainRewardList({
  rewards,
  locale,
}: {
  rewards: BossUnlockEntry[];
  locale: Locale;
}) {
  const [selected, setSelected] = useState<BossUnlockEntry | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const openEntry = (entry: BossUnlockEntry) => {
    setSelected(entry);
    setDialogOpen(true);
  };

  return (
    <>
      <ul className="grid sm:grid-cols-2 gap-2">
        {rewards.map((entry) => (
          <li key={entry.name}>
            <button
              type="button"
              onClick={() => openEntry(entry)}
              className="w-full flex items-center gap-3 rounded-lg border border-[#2a2a2a] bg-[#111]/80 px-3 py-2.5 text-left hover:border-[#c41e3a]/50 hover:bg-[#151515] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c41e3a]/60"
            >
              <MainRewardThumb entry={entry} />
              <span className="text-sm text-white font-medium leading-snug min-w-0">
                {unlockEntryName(entry, locale)}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <RewardItemDialog
        entry={selected}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}

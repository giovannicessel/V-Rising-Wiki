import { Link } from 'wouter';
import { ExternalLink, Package } from 'lucide-react';
import type { BossUnlockEntry } from '@/data/entity-types';
import AssetImage from '@/components/AssetImage';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { entityDetailPath } from '@/lib/entity-paths';

export default function RewardItemDialog({
  entry,
  open,
  onOpenChange,
}: {
  entry: BossUnlockEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  if (!entry) return null;

  const href =
    entry.entityId && entry.entityType && entry.slug
      ? entityDetailPath(entry.entityType, entry.slug)
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-[#0f0f0f] border-[#333] text-white sm:max-w-md p-0 gap-0 overflow-hidden"
        showCloseButton
      >
        <div className="p-6 pb-4">
          <DialogHeader className="text-left gap-4">
            <div className="mx-auto sm:mx-0 w-28 h-28 rounded-xl bg-[#0a0a0a] border border-[#333] flex items-center justify-center p-3">
              {entry.image ? (
                <AssetImage
                  src={entry.image}
                  alt=""
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <Package size={40} className="text-[#555]" />
              )}
            </div>
            <DialogTitle className="font-gothic text-xl text-white text-center sm:text-left">
              {entry.name}
            </DialogTitle>
          </DialogHeader>
        </div>
        <div className="px-6 pb-6 space-y-4">
          {entry.description && (
            <p className="text-sm text-[#bbb] leading-relaxed">{entry.description}</p>
          )}
          {!entry.description && (
            <p className="text-sm text-[#666] italic">
              Descrição detalhada em breve na wiki.
            </p>
          )}
          {href && (
            <Link
              href={href}
              onClick={() => onOpenChange(false)}
              className="inline-flex items-center gap-2 text-sm text-[#c41e3a] hover:underline"
            >
              Ver página completa
              <ExternalLink size={14} />
            </Link>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

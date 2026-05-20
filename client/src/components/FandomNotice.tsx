import { useTranslation } from '@/contexts/LocaleContext';

export default function FandomNotice() {
  const { t } = useTranslation();
  return (
    <p className="text-xs text-[#888] border border-[#333] bg-[#111]/80 rounded-lg px-3 py-2 mb-4 leading-relaxed">
      {t('content.fandomNotice')}
    </p>
  );
}

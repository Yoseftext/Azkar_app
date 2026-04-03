import type { QuranAyah } from '@/content/loaders/load-quran';
import { AppCard } from '@/shared/ui/primitives/AppCard';
import { AppButton } from '@/shared/ui/primitives/AppButton';
import { LoadStateNotice } from '@/shared/ui/feedback/LoadStateNotice';

interface QuranReaderPanelProps {
  surahName: string;
  surahNumber: number;
  verses: QuranAyah[];
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
}

export function QuranReaderPanel({ surahName, surahNumber, verses, isLoading, error, onClose }: QuranReaderPanelProps) {
  return (
    <AppCard title={surahName} subtitle={`سورة رقم ${surahNumber} • تحميل عند الطلب مع استئناف سريع من آخر موضع.`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500 dark:text-slate-400">{verses.length} آية</p>
        <AppButton variant="outline" size="sm" onClick={onClose}>الرجوع للفهرس</AppButton>
      </div>

      {isLoading ? <LoadStateNotice title="جاري تحميل السورة" body="نحمّل الآيات لتبدأ القراءة دون فقدان موضعك الحالي." /> : null}
      {error ? <LoadStateNotice title="تعذر تحميل السورة" body={error} tone="error" /> : null}

      <div className="app-reading-surface max-h-[60vh] space-y-3 overflow-y-auto rounded-[var(--ui-radius-card)] border p-[var(--ui-card-padding)]">
        {verses.map((ayah) => (
          <p key={`${ayah.chapter}-${ayah.verse}`} className="app-reading-card app-reading-text rounded-[var(--ui-radius-panel)] border px-4 py-4 text-base text-slate-900 shadow-sm dark:text-slate-50">
            {ayah.text} <span className="app-reading-accent">﴿{ayah.verse}﴾</span>
          </p>
        ))}
      </div>
    </AppCard>
  );
}

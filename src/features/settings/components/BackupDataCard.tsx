import { useRef, useState } from 'react';
import { AppCard } from '@/shared/ui/primitives/AppCard';
import { AppButton } from '@/shared/ui/primitives/AppButton';
import { showToast } from '@/shared/ui/feedback/toast-store';
import {
  applyBackupFile,
  buildBackupFile,
  getBackupFileName,
  getBackupSummary,
  parseBackupFile,
  serializeBackupFile,
} from '@/kernel/backup/backup-service';
import { downloadTextFile, readTextFile, reloadApplication } from '@/kernel/backup/backup-runtime';

function formatArabicDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return 'غير معروف';
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function BackupDataCard() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = () => {
    const file = buildBackupFile();
    const exported = downloadTextFile(getBackupFileName(file.exportedAt), serializeBackupFile(file));
    if (!exported) {
      showToast('تعذّر إنشاء ملف النسخة الاحتياطية على هذا الجهاز', 'error');
      return;
    }
    showToast('تم إنشاء ملف النسخة الاحتياطية', 'success');
  };

  const handleImport = async (file: File | null) => {
    if (!file) return;
    setIsImporting(true);
    try {
      const raw = await readTextFile(file);
      const backup = parseBackupFile(raw);
      if (!backup) {
        showToast('ملف النسخة الاحتياطية غير صالح', 'error');
        return;
      }
      applyBackupFile(backup);
      const summary = getBackupSummary(backup);
      showToast(`تمت استعادة ${summary.includedSections} أقسام من نسخة ${formatArabicDate(summary.exportedAt)}`, 'success');
      reloadApplication();
    } catch {
      showToast('تعذّر استيراد النسخة الاحتياطية', 'error');
    } finally {
      if (inputRef.current) inputRef.current.value = '';
      setIsImporting(false);
    }
  };

  return (
    <AppCard
      title="النسخ الاحتياطي والاستعادة"
      subtitle="صدّر بياناتك المحلية إلى ملف JSON واستعدها لاحقًا. هذا يرفع الثقة ولا يعتمد على مزامنة سحابية."
    >
      <div className="space-y-4">
        <div className="rounded-[var(--ui-radius-panel)] bg-slate-50 p-[var(--ui-panel-padding)] text-sm leading-6 text-slate-600 dark:bg-slate-800/70 dark:text-slate-300">
          يشمل: الإعدادات، ورد اليوم، المسبحة، موضع القراءة، التقدم، المفضلة، التنبيهات، والإنجازات المحلية.
        </div>

        <div className="flex flex-wrap gap-3">
          <AppButton onClick={handleExport}>تصدير نسخة احتياطية</AppButton>
          <AppButton variant="outline" onClick={() => inputRef.current?.click()} disabled={isImporting}>
            {isImporting ? 'جارٍ الاستيراد…' : 'استيراد نسخة احتياطية'}
          </AppButton>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(event) => void handleImport(event.target.files?.[0] ?? null)}
        />

        <p className="text-xs leading-6 text-slate-500 dark:text-slate-400">
          الاستيراد يستبدل الحالة المحلية الحالية بالقيم الموجودة داخل الملف ثم يعيد تحميل التطبيق لضمان الاتساق.
        </p>
      </div>
    </AppCard>
  );
}

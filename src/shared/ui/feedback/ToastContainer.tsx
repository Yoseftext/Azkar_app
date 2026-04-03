/**
 * ====================================================================
 * ToastContainer — حاوية الإشعارات المرئية
 * ====================================================================
 * تُوضع مرة واحدة في AppProviders وتعرض جميع الـ toasts.
 * ====================================================================
 */
import { useToastStore } from '@/shared/ui/feedback/toast-store';
import type { ToastItem } from '@/shared/ui/feedback/toast-store';

const TYPE_STYLES: Record<string, string> = {
  success: 'bg-emerald-600 text-white',
  error:   'bg-rose-600 text-white',
  warning: 'bg-amber-500 text-white',
  info:    'bg-sky-600 text-white',
};

const TYPE_ICONS: Record<string, string> = {
  success: '✅',
  error:   '❌',
  warning: '⚠️',
  info:    'ℹ️',
};

function ToastChip({ toast, onDismiss }: { toast: ToastItem; onDismiss: () => void }) {
  const style = TYPE_STYLES[toast.type] ?? TYPE_STYLES.info;
  const icon  = TYPE_ICONS[toast.type]  ?? TYPE_ICONS.info;

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 shadow-lg text-sm font-medium max-w-xs animate-in slide-in-from-bottom-2 fade-in ${style}`}
      role="status"
      aria-live="polite"
    >
      <span aria-hidden="true">{icon}</span>
      <span className="flex-1">{toast.message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 rounded-full p-1 opacity-70 hover:opacity-100 transition"
        aria-label="إغلاق"
      >
        ✕
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts  = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="الإشعارات"
      className="fixed bottom-24 inset-x-0 z-50 flex flex-col items-center gap-2 px-4 pointer-events-none"
    >
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastChip toast={t} onDismiss={() => dismiss(t.id)} />
        </div>
      ))}
    </div>
  );
}

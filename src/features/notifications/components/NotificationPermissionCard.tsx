import { AppCard } from '@/shared/ui/primitives/AppCard';
import { AppButton } from '@/shared/ui/primitives/AppButton';

interface NotificationPermissionCardProps {
  hasPermission: boolean;
  isSupported: boolean;
  onRequestPermission: () => Promise<boolean> | void;
}

export function NotificationPermissionCard({ hasPermission, isSupported, onRequestPermission }: NotificationPermissionCardProps) {
  if (!isSupported) {
    return (
      <AppCard title="إشعارات الأذكار" subtitle="هذا المتصفح لا يدعم إشعارات الويب بشكل كامل.">
        <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
          يمكنك متابعة التطبيق يدويًا من الصفحة الرئيسية أو استخدام البحث للوصول السريع إلى جلساتك اليومية.
        </p>
      </AppCard>
    );
  }

  return (
    <AppCard
      title="إشعارات الأذكار"
      subtitle={hasPermission ? 'التنبيهات مفعّلة. عدّل الأوقات من البطاقات التالية.' : 'فعّل الإشعارات للحصول على تذكيرات هادئة للأذكار أثناء استخدام التطبيق.'}
    >
      {hasPermission ? (
        <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200">
          ✅ الإشعارات مفعّلة. تعمل التذكيرات داخل جلسة التطبيق الحالية وفق قيود المتصفح.
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
            فعّل الإذن مرة واحدة، ثم اختر وقت الصباح والمساء والنوم بالطريقة التي تناسبك.
          </p>
          <AppButton onClick={() => void onRequestPermission()} fullWidth>
            السماح بالإشعارات
          </AppButton>
        </div>
      )}
    </AppCard>
  );
}

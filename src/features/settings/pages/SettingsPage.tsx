import { AppCard } from '@/shared/ui/primitives/AppCard';
import { AppButton } from '@/shared/ui/primitives/AppButton';
import { InteractiveTile } from '@/shared/ui/primitives/InteractiveTile';
import { MUTED_PANEL_CLASS } from '@/shared/ui/design/ui-classes';
import { usePreferencesStore } from '@/kernel/preferences/preferences-store';
import { useAuthStore } from '@/kernel/auth/auth-store';
import type {
  ColorTheme,
  LineSpacing,
  MotionMode,
  ReadingDensity,
  TextSize,
  ThemeMode,
} from '@/kernel/preferences/preferences-types';
import {
  COLOR_THEME_LABELS,
  LINE_SPACING_LABELS,
  MOTION_MODE_LABELS,
  READING_DENSITY_LABELS,
  TEXT_SIZE_LABELS,
  THEME_MODE_LABELS,
} from '@/kernel/preferences/preferences-labels';
import { showToast } from '@/shared/ui/feedback/toast-store';
import { PreferenceOptionGroup } from '@/features/settings/components/PreferenceOptionGroup';
import { ReadingPreviewCard } from '@/features/settings/components/ReadingPreviewCard';
import { BackupDataCard } from '@/features/settings/components/BackupDataCard';

const LEGAL_LINKS = [
  { to: '/about', title: 'عن التطبيق', body: 'الرؤية والفريق' },
  { to: '/privacy', title: 'سياسة الخصوصية', body: 'بياناتك وكيف نحميها' },
  { to: '/terms', title: 'شروط الاستخدام', body: 'حدود الاستخدام والمحتوى' },
  { to: '/contact', title: 'تواصل معنا', body: 'الدعم والاقتراحات' },
] as const;

const THEME_MODE_OPTIONS = ['light', 'dark', 'system'] as const satisfies readonly ThemeMode[];
const COLOR_THEME_OPTIONS = ['sky', 'sand', 'emerald', 'night'] as const satisfies readonly ColorTheme[];
const TEXT_SIZE_OPTIONS = ['base', 'large', 'xlarge'] as const satisfies readonly TextSize[];
const READING_DENSITY_OPTIONS = ['comfortable', 'compact'] as const satisfies readonly ReadingDensity[];
const LINE_SPACING_OPTIONS = ['relaxed', 'spacious'] as const satisfies readonly LineSpacing[];
const MOTION_MODE_OPTIONS = ['full', 'reduced'] as const satisfies readonly MotionMode[];

export function SettingsPage() {
  const themeMode = usePreferencesStore((s) => s.themeMode);
  const colorTheme = usePreferencesStore((s) => s.colorTheme);
  const textSize = usePreferencesStore((s) => s.textSize);
  const readingDensity = usePreferencesStore((s) => s.readingDensity);
  const lineSpacing = usePreferencesStore((s) => s.lineSpacing);
  const motionMode = usePreferencesStore((s) => s.motionMode);
  const setThemeMode = usePreferencesStore((s) => s.setThemeMode);
  const setColorTheme = usePreferencesStore((s) => s.setColorTheme);
  const setTextSize = usePreferencesStore((s) => s.setTextSize);
  const setReadingDensity = usePreferencesStore((s) => s.setReadingDensity);
  const setLineSpacing = usePreferencesStore((s) => s.setLineSpacing);
  const setMotionMode = usePreferencesStore((s) => s.setMotionMode);
  const isConfigured = useAuthStore((s) => s.isConfigured);
  const user = useAuthStore((s) => s.user);
  const signIn = useAuthStore((s) => s.signIn);
  const signOut = useAuthStore((s) => s.signOut);

  return (
    <div className="space-y-4">
      <AppCard title="المظهر" subtitle="افصل بين وضع الإضاءة ولوحة الألوان حتى تحصل على ثيم مريح يوميًا لا مجرد فاتح/داكن.">
        <div className="space-y-4">
          <PreferenceOptionGroup
            label="وضع الإضاءة"
            helper="اختيار سريع بين الفاتح والداكن أو اتباع النظام."
            options={THEME_MODE_OPTIONS}
            value={themeMode}
            getLabel={(option) => THEME_MODE_LABELS[option]}
            onChange={setThemeMode}
          />
          <PreferenceOptionGroup
            label="لوحة الألوان"
            helper="Sky متوازن، Sand للقراءة الدافئة، Emerald هادئ، Night أعمق في القراءة الليلية."
            options={COLOR_THEME_OPTIONS}
            value={colorTheme}
            getLabel={(option) => COLOR_THEME_LABELS[option]}
            onChange={setColorTheme}
          />
        </div>
      </AppCard>

      <AppCard title="تجربة القراءة" subtitle="هذه الإعدادات تضبط القراءة اليومية عبر القرآن والأذكار والأدعية والقصص دون تشتيت.">
        <div className="space-y-4">
          <PreferenceOptionGroup
            label="حجم النص"
            helper="اضبط الحجم العام للتطبيق والنصوص القرائية الطويلة."
            options={TEXT_SIZE_OPTIONS}
            value={textSize}
            getLabel={(option) => TEXT_SIZE_LABELS[option]}
            onChange={setTextSize}
          />
          <PreferenceOptionGroup
            label="كثافة العناصر"
            helper="الوضع المريح يعطي فراغًا أكثر بين البطاقات واللوحات، والمضغوط يزيد كثافة المعلومات."
            options={READING_DENSITY_OPTIONS}
            value={readingDensity}
            getLabel={(option) => READING_DENSITY_LABELS[option]}
            onChange={setReadingDensity}
          />
          <PreferenceOptionGroup
            label="تباعد السطور"
            helper="مفيد خصوصًا في القراءة الطويلة داخل القرآن والقصص والأدعية."
            options={LINE_SPACING_OPTIONS}
            value={lineSpacing}
            getLabel={(option) => LINE_SPACING_LABELS[option]}
            onChange={setLineSpacing}
          />
          <PreferenceOptionGroup
            label="الحركة"
            helper="قلّل الانتقالات والحركة إذا أردت واجهة أهدأ أو أكثر راحة للعين."
            options={MOTION_MODE_OPTIONS}
            value={motionMode}
            getLabel={(option) => MOTION_MODE_LABELS[option]}
            onChange={setMotionMode}
          />
        </div>
      </AppCard>

      <ReadingPreviewCard />

      <BackupDataCard />

      <AppCard title="الحساب" subtitle="إدارة الجلسة الحالية والحساب المستخدم داخل هذا الجهاز.">
        {!isConfigured ? (
          <p className="text-sm leading-6 text-amber-700 dark:text-amber-300">تسجيل الدخول غير متاح حالياً.</p>
        ) : user ? (
          <div className="space-y-3">
            <div className={MUTED_PANEL_CLASS}>
              <p className="text-xs text-slate-500 dark:text-slate-400">مسجّل كـ</p>
              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-50">
                {user.displayName ?? user.email ?? 'مستخدم'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <AppButton variant="danger" onClick={() => void signOut().then(() => showToast('تم تسجيل الخروج', 'info'))}>
                تسجيل الخروج
              </AppButton>
              <InteractiveTile to="/profile" title="الملف الشخصي" subtitle="استعرض حالة الحساب والروابط المهمة" className="min-w-[220px] flex-1 px-4 py-3" />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">سجّل دخولك لتخصيص حسابك داخل هذا الجهاز.</p>
            <AppButton fullWidth onClick={() => void signIn().catch(() => showToast('تعذّر تسجيل الدخول', 'error'))}>
              تسجيل الدخول عبر Google
            </AppButton>
          </div>
        )}
      </AppCard>

      <AppCard title="التنبيهات" subtitle="راجع أوقات التذكير ونمط التنبيه من صفحة مستقلة.">
        <InteractiveTile to="/notifications" title="ضبط تنبيهات الأذكار" subtitle="الصباح والمساء والنوم" trailing="←" />
      </AppCard>

      <AppCard title="معلومات" subtitle="روابط أساسية متعلقة بالتطبيق والخصوصية والدعم.">
        <div className="grid gap-3 md:grid-cols-2">
          {LEGAL_LINKS.map((item) => (
            <InteractiveTile key={item.to} to={item.to} title={item.title} subtitle={item.body} trailing="←" />
          ))}
        </div>
      </AppCard>
    </div>
  );
}

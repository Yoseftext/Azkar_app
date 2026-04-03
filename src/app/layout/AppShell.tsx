/**
 * ====================================================================
 * AppShell — الهيكل العام للتطبيق
 * ====================================================================
 * subtitle اختياري الآن — يُعرض فقط للأقسام التي لديها وصف مفيد.
 * ====================================================================
 */
import { Outlet, useLocation } from 'react-router-dom';
import { Header }    from '@/app/layout/Header';
import { BottomNav } from '@/app/layout/BottomNav';
import { appSections } from '@/kernel/sections/section-registry';

// أقسام لا تحتاج subtitle (وصف قصير كافٍ من الاسم)
const SECTIONS_WITHOUT_SUBTITLE = new Set(['home', 'masbaha', 'quran', 'azkar']);

export function AppShell() {
  const location = useLocation();
  const currentSection = appSections.find((s) => s.route === location.pathname) ?? appSections[0];
  const showSubtitle = !SECTIONS_WITHOUT_SUBTITLE.has(currentSection.key);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 pb-28 pt-4 sm:max-w-lg">
      <Header
        title={currentSection.title}
        subtitle={showSubtitle ? currentSection.subtitle : undefined}
      />
      <main className="mt-4 flex-1">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}

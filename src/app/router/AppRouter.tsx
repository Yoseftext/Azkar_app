import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/app/layout/AppShell';
import { appSections } from '@/kernel/sections/section-registry';
import { AppErrorBoundary } from '@/app/error/AppErrorBoundary';

function RouteSkeleton() {
  return (
    <div className="rounded-[28px] border border-white/60 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/85">
      <p className="text-sm text-slate-600 dark:text-slate-300">جاري تحميل القسم…</p>
    </div>
  );
}

export function AppRouter() {
  return (
    <AppErrorBoundary>
      <Routes>
        <Route element={<AppShell />}>
          {appSections.map((section) => {
            const Page = lazy(section.loader);
            return (
              <Route
                key={section.key}
                path={section.route}
                element={
                  <Suspense fallback={<RouteSkeleton />}>
                    <Page />
                  </Suspense>
                }
              />
            );
          })}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </AppErrorBoundary>
  );
}

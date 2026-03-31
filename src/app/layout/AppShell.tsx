import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '@/app/layout/Header';
import { BottomNav } from '@/app/layout/BottomNav';
import { appSections } from '@/kernel/sections/section-registry';

export function AppShell() {
  const location = useLocation();
  const currentSection = appSections.find((section) => section.route === location.pathname) ?? appSections[0];

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 pb-28 pt-4 sm:max-w-lg">
      <Header title={currentSection.title} subtitle={currentSection.description} />
      <main className="mt-4 flex-1">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}

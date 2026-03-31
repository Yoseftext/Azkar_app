import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { AppCard } from '@/shared/ui/primitives/AppCard';
import type { LegalCallout, LegalHeroStat, LegalPageContent, LegalSectionBlock } from '@/features/legal/content/legal-page-content';

interface LegalPageLayoutProps {
  content: LegalPageContent;
  actions?: readonly { title: string; description: string; href: string }[];
  children?: ReactNode;
}

export function LegalPageLayout({ content, actions = [], children }: LegalPageLayoutProps) {
  return (
    <div className="space-y-4">
      <AppCard title={content.title} subtitle={content.updatedAt ? `آخر تحديث: ${content.updatedAt}` : undefined}>
        <p className="text-sm leading-7 text-slate-700 dark:text-slate-200">{content.lead}</p>
        {content.heroStats?.length ? <HeroStatsGrid stats={content.heroStats} /> : null}
        {content.callout ? <CalloutCard callout={content.callout} /> : null}
      </AppCard>

      {actions.length ? (
        <AppCard title="إجراءات سريعة" subtitle="قنوات واضحة بدل روابط مشتتة أو صفحات منفصلة خارج التطبيق.">
          <div className="grid gap-3 md:grid-cols-3">
            {actions.map((action) => (
              <a
                key={action.href}
                href={action.href}
                className="rounded-[28px] border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-sky-300 hover:bg-sky-50 dark:border-slate-700 dark:bg-slate-800/70 dark:hover:border-sky-700 dark:hover:bg-slate-800"
              >
                <p className="text-sm font-bold text-slate-900 dark:text-slate-50">{action.title}</p>
                <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">{action.description}</p>
              </a>
            ))}
          </div>
        </AppCard>
      ) : null}

      {content.sections.map((section) => (
        <SectionCard key={section.heading} section={section} />
      ))}

      {children}

      {content.quickLinks?.length ? (
        <AppCard title="روابط موحدة داخل التطبيق" subtitle="كل الصفحات التعريفية والقانونية أصبحت داخل router نفسه.">
          <div className="grid gap-3 md:grid-cols-2">
            {content.quickLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="rounded-[28px] border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-sky-300 hover:bg-sky-50 dark:border-slate-700 dark:bg-slate-800/70 dark:hover:border-sky-700 dark:hover:bg-slate-800"
              >
                <p className="text-sm font-bold text-slate-900 dark:text-slate-50">{item.label}</p>
                <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">{item.description}</p>
              </NavLink>
            ))}
          </div>
        </AppCard>
      ) : null}
    </div>
  );
}

function HeroStatsGrid({ stats }: { stats: readonly LegalHeroStat[] }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-3xl bg-slate-50 p-4 text-center dark:bg-slate-800/70">
          <p className="text-lg font-bold text-slate-900 dark:text-slate-50">{stat.value}</p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

function CalloutCard({ callout }: { callout: LegalCallout }) {
  return (
    <div className="mt-4 rounded-[28px] border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/70 dark:bg-amber-950/30">
      <p className="text-sm font-bold text-amber-900 dark:text-amber-200">{callout.title}</p>
      <p className="mt-2 text-sm leading-7 text-amber-900/90 dark:text-amber-100">{callout.body}</p>
    </div>
  );
}

function SectionCard({ section }: { section: LegalSectionBlock }) {
  return (
    <AppCard title={section.heading}>
      {section.body?.map((paragraph) => (
        <p key={paragraph} className="text-sm leading-7 text-slate-700 dark:text-slate-200">
          {paragraph}
        </p>
      ))}

      {section.bullets?.length ? (
        <ul className="space-y-2 text-sm leading-7 text-slate-700 marker:text-sky-600 dark:text-slate-200 dark:marker:text-sky-400">
          {section.bullets.map((bullet) => (
            <li key={bullet} className="mr-5 list-disc">{bullet}</li>
          ))}
        </ul>
      ) : null}
    </AppCard>
  );
}

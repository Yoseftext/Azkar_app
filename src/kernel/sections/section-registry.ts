/**
 * ====================================================================
 * Section Registry — سجل أقسام التطبيق
 * ====================================================================
 * BUG-V3-07: description للمطور فقط، subtitle للمستخدم.
 * ====================================================================
 */
import type { AppSection } from '@/kernel/sections/section-contract';

export const appSections: AppSection[] = [
  {
    key: 'home', route: '/', order: 0,
    title: 'الرئيسية', shortTitle: 'الرئيسية',
    description: 'Dashboard مشتق من stores runtime',
    icon: '🏠', showInBottomNav: true,
    loader: () => import('@/features/home/pages/HomePage').then((m) => ({ default: m.HomePage })),
  },
  {
    key: 'search', route: '/search', order: 1,
    title: 'البحث', shortTitle: 'البحث',
    description: 'Unified app search across core content sections',
    subtitle: 'ابحث بسرعة عبر القرآن والأذكار والأدعية والقصص والأسماء',
    icon: '🔎', showInBottomNav: false,
    loader: () => import('@/features/search/pages/SearchPage').then((m) => ({ default: m.SearchPage })),
  },
  {
    key: 'azkar', route: '/azkar', order: 2,
    title: 'الأذكار', shortTitle: 'الأذكار',
    description: 'Feature-sliced azkar module',
    subtitle: 'أذكار الصباح والمساء والنوم',
    icon: '☀️', showInBottomNav: true,
    loader: () => import('@/features/azkar/pages/AzkarPage').then((m) => ({ default: m.AzkarPage })),
  },
  {
    key: 'masbaha', route: '/masbaha', order: 3,
    title: 'المسبحة', shortTitle: 'المسبحة',
    description: 'Isolated counter module with debounced persistence',
    icon: '📿', showInBottomNav: true,
    loader: () => import('@/features/masbaha/pages/MasbahaPage').then((m) => ({ default: m.MasbahaPage })),
  },
  {
    key: 'quran', route: '/quran', order: 4,
    title: 'القرآن', shortTitle: 'القرآن',
    description: 'Per-surah lazy loading + bookmark/resume',
    icon: '📖', showInBottomNav: true,
    loader: () => import('@/features/quran/pages/QuranPage').then((m) => ({ default: m.QuranPage })),
  },
  {
    key: 'tasks', route: '/tasks', order: 5,
    title: 'المهام', shortTitle: 'المهام',
    description: 'Task management with daily completions tracking',
    subtitle: 'وردك اليومي والمهام الشخصية',
    icon: '✅', showInBottomNav: true,
    loader: () => import('@/features/tasks/pages/TasksPage').then((m) => ({ default: m.TasksPage })),
  },
  {
    key: 'plans', route: '/plans', order: 5.5,
    title: 'البرامج', shortTitle: 'البرامج',
    description: 'Short guided plans and habit tracks',
    subtitle: 'برامج قصيرة جاهزة لتثبيت العادة خطوة بخطوة',
    icon: '🧭', showInBottomNav: false,
    loader: () => import('@/features/plans/pages/PlansPage').then((m) => ({ default: m.PlansPage })),
  },
  {
    key: 'duas', route: '/duas', order: 6,
    title: 'الأدعية', shortTitle: 'الأدعية',
    description: 'Lazy-loaded duas with favorites and daily tracking',
    subtitle: 'أدعية مأثورة مع المفضلة والتتبع',
    icon: '🤲', showInBottomNav: false,
    loader: () => import('@/features/duas/pages/DuasPage').then((m) => ({ default: m.DuasPage })),
  },
  {
    key: 'stories', route: '/stories', order: 7,
    title: 'القصص', shortTitle: 'القصص',
    description: 'Summary-first story loading with per-category lazy chunks',
    subtitle: 'قصص إسلامية مختارة للتأمل والعبرة',
    icon: '📚', showInBottomNav: false,
    loader: () => import('@/features/stories/pages/StoriesPage').then((m) => ({ default: m.StoriesPage })),
  },
  {
    key: 'names', route: '/names-of-allah', order: 8,
    title: 'أسماء الله الحسنى', shortTitle: 'الأسماء',
    description: 'Names module with search, favorites, daily progress',
    subtitle: 'تعلّم أسماء الله الـ 99 وراجعها يومياً',
    icon: '✨', showInBottomNav: false,
    loader: () => import('@/features/names-of-allah/pages/NamesOfAllahPage').then((m) => ({ default: m.NamesOfAllahPage })),
  },
  {
    key: 'achievements', route: '/achievements', order: 9,
    title: 'الإنجازات', shortTitle: 'الإنجازات',
    description: 'Achievement system ported from V2 with 12 definitions',
    subtitle: 'تابع مسيرتك وافتح إنجازات جديدة',
    icon: '🏆', showInBottomNav: false,
    loader: () => import('@/features/achievements/pages/AchievementsPage').then((m) => ({ default: m.AchievementsPage })),
  },
  {
    key: 'notifications', route: '/notifications', order: 10,
    title: 'التنبيهات', shortTitle: 'التنبيهات',
    description: 'Web Notifications API for azkar reminders',
    subtitle: 'تذكيرات أذكار الصباح والمساء والنوم',
    icon: '🔔', showInBottomNav: false,
    loader: () => import('@/features/notifications/pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage })),
  },
  {
    key: 'stats', route: '/stats', order: 11,
    title: 'الإحصائيات', shortTitle: 'الإحصائيات',
    description: 'Aggregated stats from all feature stores',
    subtitle: 'نشاطك اليومي والأسبوعي والشهري',
    icon: '📊', showInBottomNav: false,
    loader: () => import('@/features/stats/pages/StatsPage').then((m) => ({ default: m.StatsPage })),
  },
  {
    key: 'settings', route: '/settings', order: 12,
    title: 'الإعدادات', shortTitle: 'الإعدادات',
    description: 'Theme, auth, and app preferences',
    icon: '⚙️', showInBottomNav: false,
    loader: () => import('@/features/settings/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
  },
  {
    key: 'profile', route: '/profile', order: 13,
    title: 'الملف الشخصي', shortTitle: 'الملف',
    description: 'Read-only account snapshot',
    icon: '👤', showInBottomNav: false,
    loader: () => import('@/features/profile/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })),
  },
  {
    key: 'about', route: '/about', order: 14,
    title: 'عن التطبيق', shortTitle: 'عن التطبيق',
    description: 'About page with legal layout',
    icon: 'ℹ️', showInBottomNav: false,
    loader: () => import('@/features/legal/pages/AboutPage').then((m) => ({ default: m.AboutPage })),
  },
  {
    key: 'privacy', route: '/privacy', order: 15,
    title: 'سياسة الخصوصية', shortTitle: 'الخصوصية',
    description: 'Privacy policy',
    icon: '🔒', showInBottomNav: false,
    loader: () => import('@/features/legal/pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage })),
  },
  {
    key: 'terms', route: '/terms', order: 16,
    title: 'شروط الاستخدام', shortTitle: 'الشروط',
    description: 'Terms of use',
    icon: '📜', showInBottomNav: false,
    loader: () => import('@/features/legal/pages/TermsPage').then((m) => ({ default: m.TermsPage })),
  },
  {
    key: 'contact', route: '/contact', order: 17,
    title: 'تواصل معنا', shortTitle: 'تواصل',
    description: 'Contact page',
    icon: '✉️', showInBottomNav: false,
    loader: () => import('@/features/legal/pages/ContactPage').then((m) => ({ default: m.ContactPage })),
  },
].sort((a, b) => a.order - b.order);

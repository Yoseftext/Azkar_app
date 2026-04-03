export interface HomeQuickAccessItem {
  id: string;
  to: string;
  title: string;
  icon: string;
  body: string;
  baseRank?: number;
}

export const FEATURED_QUICK_ACCESS: HomeQuickAccessItem[] = [
  { id: 'search', to: '/search', title: 'البحث', icon: '🔎', body: 'ابحث عبر الأقسام بسرعة', baseRank: 30 },
  { id: 'azkar', to: '/azkar', title: 'الأذكار', icon: '☀️', body: 'ابدأ جلسة الصباح أو المساء', baseRank: 24 },
  { id: 'quran', to: '/quran', title: 'القرآن', icon: '📖', body: 'تابع القراءة أو ورد اليوم', baseRank: 24 },
  { id: 'tasks', to: '/tasks', title: 'ورد اليوم', icon: '✅', body: 'رتّب خطواتك اليومية الشخصية', baseRank: 22 },
  { id: 'plans', to: '/plans', title: 'البرامج', icon: '🧭', body: 'ابدأ برنامجًا قصيرًا جاهزًا', baseRank: 18 },
  { id: 'masbaha', to: '/masbaha', title: 'المسبحة', icon: '📿', body: 'جلسة تسبيح سريعة وواضحة', baseRank: 14 },
  { id: 'duas', to: '/duas', title: 'الأدعية', icon: '🤲', body: 'دعاء اليوم والوصول السريع', baseRank: 14 },
];

export const SECONDARY_QUICK_ACCESS: HomeQuickAccessItem[] = [
  { id: 'stories', to: '/stories', title: 'القصص', icon: '📚', body: 'قصة اليوم والقراءة الهادئة', baseRank: 12 },
  { id: 'names', to: '/names-of-allah', title: 'الأسماء الحسنى', icon: '✨', body: 'اسم اليوم والمراجعة', baseRank: 14 },
  { id: 'stats', to: '/stats', title: 'الإحصائيات', icon: '📊', body: 'نظرة أسبوعية وتقدمك', baseRank: 10 },
  { id: 'achievements', to: '/achievements', title: 'الإنجازات', icon: '🏆', body: 'ثباتك ومراحل التقدم', baseRank: 8 },
  { id: 'notifications', to: '/notifications', title: 'التنبيهات', icon: '🔔', body: 'ذكّر نفسك بلطف وفي الوقت المناسب', baseRank: 6 },
  { id: 'settings', to: '/settings', title: 'الإعدادات', icon: '⚙️', body: 'الثيم والنسخ الاحتياطي والقراءة', baseRank: 4 },
];

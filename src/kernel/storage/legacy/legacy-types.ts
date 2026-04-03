export interface LegacyTaskItem {
  id?: string;
  text?: string;
  completed?: boolean;
  isDefault?: boolean;
}

export interface LegacyState {
  dailyTasbeeh?: number;
  totalTasbeeh?: number;
  currentSessionTasbeeh?: number;
  tasks?: LegacyTaskItem[];
  completedTasks?: string[];
  lastDate?: string;
  streakCount?: number;
  quranBookmark?: { surahNum?: number; surahName?: string };
  azkarProgress?: Record<string, unknown>;
  settings?: {
    masbahaTarget?: number;
    silentMode?: boolean;
    theme?: string;
    dailyTasbeehTarget?: number;
  };
}

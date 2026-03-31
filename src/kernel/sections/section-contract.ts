import type { ComponentType } from 'react';

export interface AppSection {
  key: string;
  route: string;
  title: string;
  shortTitle: string;
  description: string;
  icon: string;
  order: number;
  showInBottomNav: boolean;
  loader: () => Promise<{ default: ComponentType }>;
}

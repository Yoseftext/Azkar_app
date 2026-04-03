/**
 * ====================================================================
 * AppSection Contract
 * ====================================================================
 * BUG-V3-07: فُصل حقل description (للمطور) عن subtitle (للمستخدم).
 *   description: توثيق هندسي — لا يظهر للمستخدم أبداً.
 *   subtitle:    نص اختياري يظهر في Header — يجب أن يكون بالعربية.
 * ====================================================================
 */
import type { ComponentType } from 'react';

export interface AppSection {
  key:            string;
  route:          string;
  title:          string;
  shortTitle:     string;
  /** توثيق داخلي للمطور — لا يُعرض في الواجهة */
  description:    string;
  /** نص اختياري يظهر أسفل العنوان في Header */
  subtitle?:      string;
  icon:           string;
  order:          number;
  showInBottomNav: boolean;
  loader:         () => Promise<{ default: ComponentType }>;
}

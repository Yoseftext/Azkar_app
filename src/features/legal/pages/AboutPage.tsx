import { LegalPageLayout } from '@/features/legal/pages/LegalPageLayout';
import { aboutPageContent } from '@/features/legal/content/legal-page-content';

export function AboutPage() {
  return <LegalPageLayout content={aboutPageContent} />;
}

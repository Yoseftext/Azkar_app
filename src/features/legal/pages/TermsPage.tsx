import { LegalPageLayout } from '@/features/legal/pages/LegalPageLayout';
import { termsPageContent } from '@/features/legal/content/legal-page-content';

export function TermsPage() {
  return <LegalPageLayout content={termsPageContent} />;
}

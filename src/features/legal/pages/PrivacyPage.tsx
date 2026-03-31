import { LegalPageLayout } from '@/features/legal/pages/LegalPageLayout';
import { privacyPageContent } from '@/features/legal/content/legal-page-content';

export function PrivacyPage() {
  return <LegalPageLayout content={privacyPageContent} />;
}

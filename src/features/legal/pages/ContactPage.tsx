import { LegalPageLayout } from '@/features/legal/pages/LegalPageLayout';
import { contactActions, contactPageContent } from '@/features/legal/content/legal-page-content';

export function ContactPage() {
  return <LegalPageLayout content={contactPageContent} actions={contactActions} />;
}

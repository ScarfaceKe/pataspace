import { QuickVerifyWidget } from '@/components/quick-verify/QuickVerifyWidget';

export const metadata = { title: 'Quick Verify — PataSpace' };

/**
 * Quick Verify Page
 * 
 * Accessed via WhatsApp link. Property managers confirm vacancies with one tap.
 * URL: /quick-verify?propertyId=xxx&name=Sunrise+Apartments
 */
export default async function QuickVerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ propertyId?: string; name?: string }>;
}) {
  const params = await searchParams;
  const propertyId = params.propertyId || '';
  const propertyName = decodeURIComponent(params.name || 'Your Property');

  if (!propertyId) {
    return (
      <main className="qv-page">
        <div className="qv-container">
          <div className="qv-error">
            <div className="qv-error-icon">⚠️</div>
            <h1>Invalid Link</h1>
            <p>This verification link is invalid or expired. Please check your WhatsApp message for the correct link.</p>
            <a href="/" className="qv-home-link">Go to PataSpace</a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="qv-page">
      <QuickVerifyWidget propertyId={propertyId} propertyName={propertyName} />
    </main>
  );
}

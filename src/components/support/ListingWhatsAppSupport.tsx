const PATASPACE_LISTING_SUPPORT_WHATSAPP = '254740413458';

const SUPPORT_MESSAGES = {
  general: 'Hello PataSpace Support, I need help with listing or managing a property on PataSpace. Please help me with my issue.',
  listing: 'Hello PataSpace Support, I need help completing my property listing. Please help me.',
  location: 'Hello PataSpace Support, I need help with the property location verification step. Please help me.',
  dashboard: 'Hello PataSpace Support, I need help managing my property listing on PataSpace. Please help me.'
} as const;

export type ListingSupportContext = keyof typeof SUPPORT_MESSAGES;

export function getListingWhatsAppSupportUrl(context: ListingSupportContext = 'general'): string {
  const message = SUPPORT_MESSAGES[context];
  return `https://wa.me/${PATASPACE_LISTING_SUPPORT_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

export function ListingWhatsAppSupport({ context = 'general' }: { context?: ListingSupportContext }) {
  const helperText = context === 'location'
    ? 'Need help verifying the exact property location?'
    : context === 'dashboard'
      ? 'Need a hand managing your property listing?'
      : 'Having trouble listing your property?';

  return (
    <aside className="listing-whatsapp-support" aria-label="Property listing WhatsApp support">
      <div>
        <strong>{helperText}</strong>
        <p>Talk directly to PataSpace support on WhatsApp so your property can be listed correctly.</p>
      </div>
      <a className="secondary-action listing-whatsapp-action" href={getListingWhatsAppSupportUrl(context)} target="_blank" rel="noopener noreferrer">
        💬 Get Listing Help on WhatsApp
      </a>
    </aside>
  );
}

import type { TrustSignalId } from './types';

export const TRUST_PRINCIPLES: readonly { id: TrustSignalId; label: string; description: string }[] = [
  {
    id: 'verified-property',
    label: 'Verified properties',
    description: 'Listings should be checked before they are trusted by customers.'
  },
  {
    id: 'vacancy-confirmed',
    label: 'Accurate vacancy confirmation',
    description: 'Availability should be clear and kept current to reduce wasted calls and visits.'
  },
  {
    id: 'transparent-reviews',
    label: 'Transparent reviews',
    description: 'Reviews should help users make honest rental decisions.'
  },
  {
    id: 'honest-information',
    label: 'Honest property information',
    description: 'Prices, amenities, location, and suitability must be presented clearly.'
  },
  {
    id: 'verified-manager',
    label: 'Verified property managers',
    description: 'People responsible for listings should be identifiable and trustworthy.'
  },
  {
    id: 'clear-payments',
    label: 'Clear payment flows',
    description: 'Any payment-related experience must be transparent and easy to understand.'
  },
  {
    id: 'reliable-notifications',
    label: 'Reliable notifications',
    description: 'Users should receive timely, useful, and dependable updates.'
  }
] as const;

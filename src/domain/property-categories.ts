import type { PropertyCategory } from './types';

export const PROPERTY_CATEGORIES: readonly PropertyCategory[] = [
  {
    id: 'houses',
    label: 'Houses',
    description: 'Residential rentals for Kenyan tenants, from single rooms to larger homes.',
    supportedTypes: [
      'Single Rooms',
      'Bedsitters',
      'One Bedrooms',
      'Two Bedrooms',
      'Three Bedrooms',
      'Four Bedrooms',
      'Five Bedrooms',
      'Mixed residential properties'
    ]
  },
  {
    id: 'shops',
    label: 'Shops',
    description: 'Rental shop spaces with different sizes and business suitability.',
    supportedTypes: ['Small shops', 'Medium shops', 'Large shops', 'Business-suitable shop spaces']
  },
  {
    id: 'offices',
    label: 'Offices',
    description: 'Office rentals with different sizes and office types.',
    supportedTypes: ['Private offices', 'Shared offices', 'Small offices', 'Medium offices', 'Large offices']
  },
  {
    id: 'event-halls',
    label: 'Event Halls',
    description: 'Halls for events, filtered by capacity and event suitability.',
    supportedTypes: ['Small halls', 'Medium halls', 'Large halls', 'Event-suitable halls']
  }
] as const;

export const PROPERTY_CATEGORY_IDS = PROPERTY_CATEGORIES.map((category) => category.id);

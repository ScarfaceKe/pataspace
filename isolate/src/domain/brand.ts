import type { PropertyCategoryId } from './types';

export const BRAND_IDENTITY = {
  officialName: 'PataSpace',
  brandPosition: "Kenya's smart rental discovery platform",
  audience: 'People searching for rentals in Kenya',
  promise:
    'PataSpace helps people find houses, shops, offices, and event halls through guided matching and verified rental listings.',
  namingRule: 'Use PataSpace consistently. Do not use alternative names or abbreviations.'
} as const;

export type OfficialEntryPointId = 'find-my-home' | 'find-my-shop' | 'find-my-office' | 'find-my-hall';

export interface OfficialEntryPoint {
  id: OfficialEntryPointId;
  categoryId: PropertyCategoryId;
  icon: '🏠' | '🏪' | '🏢' | '🎉';
  label: 'Find My Home' | 'Find My Shop' | 'Find My Office' | 'Find My Hall';
  description: string;
  matchWorkflow: 'House Match' | 'Shop Match' | 'Office Match' | 'Hall Match';
}

export const OFFICIAL_ENTRY_POINTS: readonly OfficialEntryPoint[] = [
  {
    id: 'find-my-home',
    categoryId: 'houses',
    icon: '🏠',
    label: 'Find My Home',
    description: 'Start a guided path for single rooms, bedsitters, apartments, and homes in Kenya.',
    matchWorkflow: 'House Match'
  },
  {
    id: 'find-my-shop',
    categoryId: 'shops',
    icon: '🏪',
    label: 'Find My Shop',
    description: 'Find shop spaces by location, size, budget, and business suitability.',
    matchWorkflow: 'Shop Match'
  },
  {
    id: 'find-my-office',
    categoryId: 'offices',
    icon: '🏢',
    label: 'Find My Office',
    description: 'Discover offices that fit your team, setup, budget, and preferred area.',
    matchWorkflow: 'Office Match'
  },
  {
    id: 'find-my-hall',
    categoryId: 'event-halls',
    icon: '🎉',
    label: 'Find My Hall',
    description: 'Search for event halls by capacity, event type, location, and availability.',
    matchWorkflow: 'Hall Match'
  }
] as const;

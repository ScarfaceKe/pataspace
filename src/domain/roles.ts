import type { UserRole } from './types';

export const USER_ROLES: readonly UserRole[] = [
  {
    id: 'customer',
    label: 'Customer',
    description: 'Finds suitable rental houses, shops, offices, or event halls.'
  },
  {
    id: 'property-owner',
    label: 'Property Owner',
    description: 'Owns rental spaces and is responsible for accurate property information.'
  },
  {
    id: 'property-manager',
    label: 'Property Manager',
    description: 'Manages listings, vacancies, updates, and tenant-facing property details.'
  },
  {
    id: 'leasing-agent',
    label: 'Leasing Agent',
    description: 'Supports rental enquiries, viewings, and successful property matches.'
  },
  {
    id: 'platform-admin',
    label: 'Platform Admin',
    description: 'Oversees platform trust, verification, health, and administrative workflows.'
  }
] as const;

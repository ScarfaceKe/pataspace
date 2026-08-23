import type { AuthProfileFoundation } from '@/domain/auth';

export const DEFAULT_PUBLIC_PROFILE: AuthProfileFoundation = {
  userId: 'public-user',
  fullName: 'Guest User',
  email: 'guest@pataspace.local',
  phoneNumber: '',
  role: 'property-owner',
  status: 'active',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

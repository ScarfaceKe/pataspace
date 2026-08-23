import type { UserRoleId } from './types';

export type PublicRegistrationRoleId = Exclude<UserRoleId, 'platform-admin'>;
export type AccountStatus = 'active' | 'pending-verification' | 'suspended' | 'closed';
export type ProductionAccountType =
  | 'customer-tenant'
  | 'property-owner'
  | 'property-manager'
  | 'leasing-agent'
  | 'administrator'
  | 'founder'
  // Legacy Phase 2 account-type ids kept for backward compatibility with already-applied migrations/data.
  | 'tenant'
  | 'property-owner-landlord'
  | 'property-agent'
  | 'admin'
  | 'super-admin';

export interface PublicRegistrationRole {
  id: PublicRegistrationRoleId;
  icon: '👤' | '👑' | '🏢' | '🤝';
  label: 'Customer' | 'Property Owner' | 'Property Manager' | 'Leasing Agent';
  description: string;
}

export interface AuthProfileFoundation {
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: UserRoleId;
  status: AccountStatus;
  county?: string;
  profilePhoto?: string;
  accountType?: ProductionAccountType;
  lastLoginAt?: string;
  emailVerifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegistrationInput {
  role: PublicRegistrationRoleId;
  fullName: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  email?: string;
  county?: string;
  profilePhoto?: string;
}

export interface LoginInput {
  phoneNumber: string;
  password: string;
  rememberMe?: boolean;
}

export const PUBLIC_REGISTRATION_ROLES: readonly PublicRegistrationRole[] = [
  {
    id: 'customer',
    icon: '👤',
    label: 'Customer',
    description: 'Find houses, shops, offices, or event halls in Kenya.'
  },
  {
    id: 'property-owner',
    icon: '👑',
    label: 'Property Owner',
    description: 'Register and manage rental spaces you own.'
  },
  {
    id: 'property-manager',
    icon: '🏢',
    label: 'Property Manager',
    description: 'Manage listings, vacancies, and rental enquiries professionally.'
  },
  {
    id: 'leasing-agent',
    icon: '🤝',
    label: 'Leasing Agent',
    description: 'Support viewing requests and rental matching workflows.'
  }
] as const;

export const AUTHENTICATION_STANDARDS = {
  philosophy: ['Fast', 'Secure', 'Simple', 'Mobile-first', 'Professional'] as const,
  accountModel: 'Every user creates one account and selects one public role during registration.',
  platformAdminPublicRegistration: false,
  requiredRegistrationFields: ['Full Name', 'Phone Number', 'Password', 'Confirm Password'] as const,
  loginMethods: ['Phone Number', 'Password', 'Google Sign-In'] as const,
  passwordControls: ['Show/Hide Password option'] as const,
  profileFoundationStores: [
    'Basic personal information',
    'Account role',
    'Account type',
    'Contact information',
    'Account status',
    'County',
    'Profile Photo',
    'Last Login'
  ] as const,
  sessionRule: 'Authenticated users remain signed in until logout or secure session expiry.',
  sensitiveErrorsVisibleToUsers: false
} as const;

export const DASHBOARD_ROUTES: Record<UserRoleId, string> = {
  customer: '/customer/home',
  'property-owner': '/owner/dashboard',
  'property-manager': '/manager/dashboard',
  'leasing-agent': '/agent/dashboard',
  'platform-admin': '/admin/dashboard'
};

export const PASSWORD_RULES = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSymbol: true
} as const;

export function isPublicRegistrationRole(role: string): role is PublicRegistrationRoleId {
  return PUBLIC_REGISTRATION_ROLES.some((item) => item.id === role);
}

export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normaliseKenyanPhoneNumber(phoneNumber: string): string | null {
  const compact = phoneNumber.replace(/[\s()-]/g, '');
  if (/^\+254[17]\d{8}$/.test(compact)) return compact;
  if (/^254[17]\d{8}$/.test(compact)) return `+${compact}`;
  if (/^0[17]\d{8}$/.test(compact)) return `+254${compact.slice(1)}`;
  return null;
}

export function validatePassword(password: string): string[] {
  const errors: string[] = [];
  if (password.length < PASSWORD_RULES.minLength) errors.push('Use at least 8 characters.');
  if (!/[A-Z]/.test(password)) errors.push('Add at least one uppercase letter.');
  if (!/[a-z]/.test(password)) errors.push('Add at least one lowercase letter.');
  if (!/\d/.test(password)) errors.push('Add at least one number.');
  if (!/[^A-Za-z0-9]/.test(password)) errors.push('Add at least one symbol.');
  return errors;
}

export function validateRegistrationInput(input: RegistrationInput): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  if (!isPublicRegistrationRole(input.role)) errors.role = 'Choose the account type that fits you.';
  if (input.fullName.trim().length < 2) errors.fullName = 'Enter your full name.';
  if (!normaliseKenyanPhoneNumber(input.phoneNumber)) {
    errors.phoneNumber = 'Enter a valid Kenyan phone number, for example 0712345678 or +254712345678.';
  }
  if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normaliseEmail(input.email))) {
    errors.email = 'Enter a valid email address.';
  }
  const passwordErrors = validatePassword(input.password);
  if (passwordErrors.length) errors.password = passwordErrors.join(' ');
  if (input.password !== input.confirmPassword) errors.confirmPassword = 'Passwords do not match.';
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateLoginInput(input: LoginInput): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  if (!normaliseKenyanPhoneNumber(input.phoneNumber)) errors.phoneNumber = 'Enter a valid Kenyan phone number, for example 0712345678.';
  if (!input.password) errors.password = 'Enter your password.';
  return { valid: Object.keys(errors).length === 0, errors };
}

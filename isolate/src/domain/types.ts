export type KenyaScope = 'KE';

export type PropertyCategoryId = 'houses' | 'shops' | 'offices' | 'event-halls';

export type HouseTypeId =
  | 'single-room'
  | 'bedsitter'
  | 'one-bedroom'
  | 'two-bedroom'
  | 'three-bedroom'
  | 'four-bedroom'
  | 'five-bedroom'
  | 'mixed-residential';

export type UserRoleId =
  | 'customer'
  | 'property-owner'
  | 'property-manager'
  | 'leasing-agent'
  | 'platform-admin';

export type TrustSignalId =
  | 'verified-property'
  | 'vacancy-confirmed'
  | 'transparent-reviews'
  | 'honest-information'
  | 'verified-manager'
  | 'clear-payments'
  | 'reliable-notifications';

export type LocationLevel = 'country' | 'county' | 'town' | 'area' | 'estate' | 'village' | 'market-centre';

export interface KenyaLocationNode {
  id: string;
  name: string;
  level: LocationLevel;
  parentId?: string;
  county?: string;
  aliases?: string[];
  children?: KenyaLocationNode[];
}

export interface PropertyCategory {
  id: PropertyCategoryId;
  label: string;
  description: string;
  supportedTypes: readonly string[];
}

export interface UserRole {
  id: UserRoleId;
  label: string;
  description: string;
}

export interface GuidedInterviewQuestion {
  id: string;
  label: string;
  helperText: string;
  appliesTo: readonly PropertyCategoryId[];
  options?: readonly string[];
}

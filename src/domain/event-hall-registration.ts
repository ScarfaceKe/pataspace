import type { EventHallSystemPreparation } from './event-hall-system-preparation';
import type { PropertyLocationInput, PropertyOwnershipRole, PropertyRegistrationAction } from './property-registration';
import { canRegisterProperties } from './property-registration';
import type { UserRoleId } from './types';

export type HallCategoryId = 'wedding-hall' | 'meeting-hall' | 'training-hall' | 'church-event-hall' | 'party-hall' | 'community-hall' | 'general-event-hall';
export type HallSizeId = 'small' | 'medium' | 'large';
export type HallRoadVisibilityId = 'facing-main-road' | 'along-main-road' | 'facing-inner-road' | 'along-inner-road' | 'inside-commercial-building' | 'inside-shopping-complex' | 'inside-estate' | 'other';
export type HallAvailabilityAnswer = 'yes' | 'no';
export type HallNearbyPlaceId = 'main-road' | 'bus-stage' | 'shopping-centre' | 'hotel' | 'hospital';
export type HallDayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type HallTimeStatus = 'open-and-available' | 'open-but-booked' | 'closed';

export interface HallWorkingHours {
  day: HallDayOfWeek;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface HallBooking {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  customerName?: string;
  customerPhone?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export interface HallCategoryOption { id: HallCategoryId; label: string; description: string }
export interface HallRoadVisibilityOption { id: HallRoadVisibilityId; label: string }
export interface HallNearbyPlaceDistanceInput { place: HallNearbyPlaceId; approximateDistance?: string }
export interface HallPhotoInput { fileName: string; represents?: 'Front of Property' | 'Hall Entrance' | 'Hall Interior' | 'Stage' | 'Seating Arrangement' | 'Gate' | 'Parking Area' | 'Surrounding Environment' }

export interface HallWhatsAppContact {
  whatsappNumber: string;
  role: PropertyOwnershipRole;
  fullName?: string;
}

export interface EventHallRegistrationInput {
  hallSize: HallSizeId;
  hallName: string;
  hallCategory?: HallCategoryId;
  location: PropertyLocationInput;
  roadVisibility: HallRoadVisibilityId;
  numberOfHalls: number | null;
  hallCapacity?: number | null;
  hallIdentifiers: string[];
  isAvailableForBookings: HallAvailabilityAnswer;
  bookingPrice?: number | null;
  additionalPricingArrangements?: string;
  workingHours: HallWorkingHours[];
  nearbyPlaces: HallNearbyPlaceDistanceInput[];
  entrancePhotos: HallPhotoInput[];
  buildingPhotos: HallPhotoInput[];
  photos: HallPhotoInput[];
  whatsappContacts: HallWhatsAppContact[];
  description: string;
  ownershipRole: PropertyOwnershipRole;
  action: PropertyRegistrationAction;
}

export interface RegisteredEventHallFoundation extends EventHallRegistrationInput {
  id: string;
  propertyFoundationId: string;
  registeredByUserId: string;
  registeredByRole: UserRoleId;
  duplicateCandidateIds: string[];
  reviewFlags: string[];
  bookings: HallBooking[];
  systemPreparation: EventHallSystemPreparation;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

export const EVENT_HALL_REGISTRATION_FOUNDATION = {
  purpose: 'Collect and organize event hall information only.',
  authorizedRoles: ['property-owner', 'property-manager', 'leasing-agent'] as const,
  blockedRoles: ['customer'] as const,
  inheritsRegistrationUserExperienceStandard: true,
  hallMatchExcludesWaterInformation: true,
  hallMatchExcludesElectricityInformation: true,
  inheritsVacantUnitIdentification: true,
  successMessage: 'Your event hall has been successfully registered.',
  doesNotImplement: ['Hall Match', 'Verification', 'Search Ranking', 'Notifications', 'Reviews', 'Payments', 'AI Admin Assistant logic', 'Platform Health Monitor logic'] as const
} as const;

export const HALL_SIZE_OPTIONS: readonly { id: HallSizeId; label: string; description: string }[] = [
  { id: 'small', label: 'Small Hall', description: 'A smaller hall, suitable for intimate gatherings of up to about 100 guests.' },
  { id: 'medium', label: 'Medium Hall', description: 'A mid-sized hall, good for events with 100 to 300 guests.' },
  { id: 'large', label: 'Large Hall', description: 'A large hall or garden space, suitable for big events with over 300 guests.' }
] as const;

export const HALL_CATEGORIES: readonly HallCategoryOption[] = [
  { id: 'wedding-hall', label: 'Wedding Hall', description: 'A hall suitable for weddings and receptions.' },
  { id: 'meeting-hall', label: 'Meeting Hall', description: 'A hall suitable for meetings and formal gatherings.' },
  { id: 'training-hall', label: 'Training Hall', description: 'A hall suitable for trainings and workshops.' },
  { id: 'church-event-hall', label: 'Church Event Hall', description: 'A hall suitable for church or fellowship events.' },
  { id: 'party-hall', label: 'Party Hall', description: 'A hall suitable for parties and celebrations.' },
  { id: 'community-hall', label: 'Community Hall', description: 'A hall suitable for community events.' },
  { id: 'general-event-hall', label: 'General Event Hall', description: 'A general-purpose event hall.' }
] as const;

export const HALL_ROAD_VISIBILITY_OPTIONS: readonly HallRoadVisibilityOption[] = [
  { id: 'facing-main-road', label: 'Facing the Main Road' },
  { id: 'along-main-road', label: 'Along the Main Road' },
  { id: 'facing-inner-road', label: 'Facing an Inner Road' },
  { id: 'along-inner-road', label: 'Along an Inner Road' },
  { id: 'inside-commercial-building', label: 'Inside a Commercial Building' },
  { id: 'inside-shopping-complex', label: 'Inside a Shopping Complex' },
  { id: 'inside-estate', label: 'Inside an Estate' },
  { id: 'other', label: 'Other' }
] as const;

export const HALL_NEARBY_PLACES = [
  { id: 'main-road', label: 'Main Road' },
  { id: 'bus-stage', label: 'Bus Stage' },
  { id: 'shopping-centre', label: 'Shopping Centre' },
  { id: 'hotel', label: 'Hotel' },
  { id: 'hospital', label: 'Hospital' }
] as const;

export const HALL_PHOTO_GUIDANCE = ['Front of the property', 'Hall entrance', 'Hall interior', 'Stage if available', 'Seating arrangement', 'Gate', 'Parking area', 'Surrounding environment'] as const;
export function canRegisterEventHalls(role: UserRoleId): boolean { return canRegisterProperties(role); }

export const ALL_HALL_DAYS: readonly HallDayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

export const DAY_LABELS: Record<HallDayOfWeek, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday'
};

export function createDefaultWorkingHours(): HallWorkingHours[] {
  return ALL_HALL_DAYS.map((day) => ({
    day,
    isOpen: day !== 'sunday',
    openTime: '08:00',
    closeTime: '18:00'
  }));
}

export function isHallOpenAt(workingHours: HallWorkingHours[], requestedTime: string): boolean {
  const dayNames: Record<string, HallDayOfWeek> = {
    '0': 'sunday', '1': 'monday', '2': 'tuesday', '3': 'wednesday',
    '4': 'thursday', '5': 'friday', '6': 'saturday'
  };
  const now = new Date();
  const dayOfWeek = dayNames[String(now.getDay())];
  const hours = workingHours.find((wh) => wh.day === dayOfWeek);
  if (!hours || !hours.isOpen) return false;
  if (!requestedTime) {
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    return currentTime >= hours.openTime && currentTime < hours.closeTime;
  }
  return requestedTime >= hours.openTime && requestedTime < hours.closeTime;
}

export function getHallTimeStatus(workingHours: HallWorkingHours[], bookings: HallBooking[], requestedDate?: string, requestedTime?: string): HallTimeStatus {
  if (!isHallOpenAt(workingHours, requestedTime ?? '')) return 'closed';
  const now = requestedDate ? new Date(requestedDate) : new Date();
  const todayStr = now.toISOString().split('T')[0];
  const activeBooking = bookings.find((b) => b.date === todayStr && b.status === 'confirmed');
  if (activeBooking) return 'open-but-booked';
  return 'open-and-available';
}

export const HALL_TIME_STATUS_COPY: Record<HallTimeStatus, { label: string; description: string }> = {
  'open-and-available': { label: 'Open and Available', description: 'The hall is open and available for booking right now.' },
  'open-but-booked': { label: 'Open but Booked', description: 'The hall is open but currently reserved for another event.' },
  'closed': { label: 'Closed', description: 'The hall is currently outside its working hours.' }
};

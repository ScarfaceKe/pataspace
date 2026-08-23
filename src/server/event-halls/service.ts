import { randomUUID } from 'node:crypto';
import type { AuthProfileFoundation } from '@/domain/auth';
import { prepareEventHallSystems } from '@/domain/event-hall-system-preparation';
import { EVENT_HALL_REGISTRATION_FOUNDATION, HALL_CATEGORIES, HALL_NEARBY_PLACES, HALL_ROAD_VISIBILITY_OPTIONS, ALL_HALL_DAYS, canRegisterEventHalls, type EventHallRegistrationInput, type RegisteredEventHallFoundation, type HallWorkingHours } from '@/domain/event-hall-registration';
import { registerPropertyFoundation } from '@/server/properties/service';
import { readEventHallStore, writeEventHallStore } from './store';

function nowIso(): string { return new Date().toISOString(); }
function normalise(value: string): string { return value.trim().toLowerCase().replace(/\s+/g, ' '); }
function validMoney(value: number | null | undefined): boolean { return value !== null && value !== undefined && !Number.isNaN(value) && value >= 0; }
function hasHallIdentifiers(ids: string[] | undefined, expected: number | null): boolean { const clean = ids?.map((x) => x.trim()).filter(Boolean) ?? []; if (!clean.length) return false; if (expected && clean.length < expected) return false; return true; }

function validateWorkingHours(hours: HallWorkingHours[] | undefined): boolean {
  if (!hours?.length) return true;
  for (const entry of hours) {
    if (!ALL_HALL_DAYS.includes(entry.day)) return false;
    if (entry.isOpen) {
      if (!entry.openTime || !entry.closeTime) return false;
      if (entry.openTime >= entry.closeTime) return false;
    }
  }
  return true;
}

export function validateEventHallInput(input: EventHallRegistrationInput): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  if (!input.hallName?.trim()) errors.hallName = 'Enter the hall name.';
  if (input.hallCategory && !HALL_CATEGORIES.some((item) => item.id === input.hallCategory)) errors.hallCategory = 'Choose a valid hall category.';
  if (!input.location?.county?.trim()) errors.county = 'Enter the county.';
  if (!input.location?.townOrCity?.trim()) errors.townOrCity = 'Enter the town or city.';
  if (!input.location?.estateOrAreaOrNeighbourhood?.trim()) errors.estateOrArea = 'Enter the estate or area.';
  if (!HALL_ROAD_VISIBILITY_OPTIONS.some((item) => item.id === input.roadVisibility)) errors.roadVisibility = 'Choose where the event hall is located.';
  if (input.numberOfHalls === null || Number.isNaN(input.numberOfHalls) || input.numberOfHalls < 1) errors.numberOfHalls = 'Enter the number of halls available.';
  if (input.hallCapacity !== null && input.hallCapacity !== undefined && input.hallCapacity < 1) errors.hallCapacity = 'Enter a valid hall capacity.';
  if (!hasHallIdentifiers(input.hallIdentifiers, input.numberOfHalls)) errors.hallIdentifiers = 'Enter the real-world hall identifier for every hall exactly as it appears on the property.';
  if (input.workingHours && !validateWorkingHours(input.workingHours)) errors.workingHours = 'Please set valid working hours for each open day.';
  if (input.isAvailableForBookings !== 'yes' && input.isAvailableForBookings !== 'no') errors.isAvailableForBookings = 'Choose whether the hall is available for bookings.';
  if (input.isAvailableForBookings === 'yes' && !validMoney(input.bookingPrice)) errors.bookingPrice = 'Enter a valid hall booking price.';
  for (const place of input.nearbyPlaces) if (!HALL_NEARBY_PLACES.some((item) => item.id === place.place)) errors.nearbyPlaces = 'Choose valid nearby places.';
  if (!input.description?.trim() || input.description.trim().length < 30) errors.description = 'Add an honest description with at least 30 characters.';
  if (input.action !== 'save-draft' && input.action !== 'submit-registration') errors.action = 'Choose whether to save or submit.';
  return { valid: Object.keys(errors).length === 0, errors };
}

function findDuplicateHallCandidates(existing: RegisteredEventHallFoundation[], input: EventHallRegistrationInput, userId: string): string[] {
  const key = [input.hallName, input.location.county, input.location.townOrCity, input.location.estateOrAreaOrNeighbourhood, input.location.landmark ?? '', input.roadVisibility].map(normalise).join('|');
  return existing.filter((hall) => hall.registeredByUserId === userId).filter((hall) => [hall.hallName, hall.location.county, hall.location.townOrCity, hall.location.estateOrAreaOrNeighbourhood, hall.location.landmark ?? '', hall.roadVisibility].map(normalise).join('|') === key).map((hall) => hall.id);
}

export async function registerEventHallFoundation(profile: AuthProfileFoundation, input: EventHallRegistrationInput): Promise<
  | { ok: true; eventHall: RegisteredEventHallFoundation; message: string; nextRoute: string }
  | { ok: false; status: number; message: string; fieldErrors?: Record<string, string> }
> {
  if (!canRegisterEventHalls(profile.role)) return { ok: false, status: 403, message: 'Customers cannot register event halls. Please use an authorized property account.' };
  const validation = validateEventHallInput(input);
  if (!validation.valid) return { ok: false, status: 400, message: 'Please check the highlighted event hall details and try again.', fieldErrors: validation.errors };
  const store = await readEventHallStore();
  const duplicateCandidateIds = findDuplicateHallCandidates(store.eventHalls, input, profile.userId);
  const reviewFlags: string[] = [];
  if (duplicateCandidateIds.length) reviewFlags.push('possible-duplicate');
  if (input.isAvailableForBookings === 'no' && input.bookingPrice) reviewFlags.push('logical-consistency-review');
  if (input.description.length < 45) reviewFlags.push('description-review');
  const cleanHallIds = input.hallIdentifiers.map((identifier) => identifier.trim()).filter(Boolean);
  const propertyResult = await registerPropertyFoundation(profile, {
    category: 'event-halls',
    location: input.location,
    description: input.description,
    ownershipRole: input.ownershipRole,
    hasVacantUnits: input.isAvailableForBookings,
    vacancy: input.isAvailableForBookings === 'yes' ? { summary: `Event hall availability: ${input.numberOfHalls ?? 0} hall(s) available for booking.`, unitsAvailable: input.numberOfHalls ?? undefined, unitIdentifiers: cleanHallIds } : undefined,
    photos: input.photos.map((photo) => ({ fileName: photo.fileName, qualityNote: photo.represents })),
    action: input.action
  });
  if (!propertyResult.ok) return propertyResult;
  const timestamp = nowIso();
  const eventHall: RegisteredEventHallFoundation = { ...input, hallIdentifiers: cleanHallIds, id: randomUUID(), propertyFoundationId: propertyResult.property.id, registeredByUserId: profile.userId, registeredByRole: profile.role, duplicateCandidateIds, reviewFlags, bookings: [], systemPreparation: prepareEventHallSystems({ ...input, hallIdentifiers: cleanHallIds }, propertyResult.property.status), createdAt: timestamp, updatedAt: timestamp, submittedAt: input.action === 'submit-registration' ? timestamp : undefined };
  store.eventHalls.push(eventHall);
  await writeEventHallStore(store);
  return { ok: true, eventHall, message: input.action === 'submit-registration' ? EVENT_HALL_REGISTRATION_FOUNDATION.successMessage : 'Event hall saved as draft. You can continue later.', nextRoute: input.action === 'save-draft' ? '/properties/register/event-hall' : propertyResult.nextRoute };
}

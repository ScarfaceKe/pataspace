import { randomUUID } from 'node:crypto';
import type { AuthProfileFoundation } from '@/domain/auth';
import { prepareOfficeSystems } from '@/domain/office-system-preparation';
import {
  OFFICE_NEARBY_PLACES,
  OFFICE_REGISTRATION_FOUNDATION,
  OFFICE_ROAD_VISIBILITY_OPTIONS,
  OFFICE_TYPES,
  canRegisterOffices,
  officeWaterHasConnection,
  type OfficeRegistrationInput,
  type RegisteredOfficeFoundation
} from '@/domain/office-registration';
import { registerPropertyFoundation } from '@/server/properties/service';
import { createVacancyConfirmationRecords } from '@/server/vacancy-confirmation/service';
import { readOfficeStore, writeOfficeStore } from './store';

function nowIso(): string { return new Date().toISOString(); }
function normalise(value: string): string { return value.trim().toLowerCase().replace(/\s+/g, ' '); }
function validateMoney(value: number | null, field: string, errors: Record<string, string>) { if (value === null || Number.isNaN(value) || value < 0) errors[field] = 'Enter a valid amount.'; }
function hasUnitIdentifiers(unitIdentifiers: string[] | undefined, expectedQuantity: number | null): boolean {
  const identifiers = unitIdentifiers?.map((item) => item.trim()).filter(Boolean) ?? [];
  if (!identifiers.length) return false;
  if (expectedQuantity && identifiers.length < expectedQuantity) return false;
  return true;
}

export function validateOfficeInput(input: OfficeRegistrationInput): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  if (!OFFICE_TYPES.some((item) => item.id === input.officeType)) errors.officeType = 'Choose the office type.';
  if (!input.location?.county?.trim()) errors.county = 'Enter the county.';
  if (!input.location?.townOrCity?.trim()) errors.townOrCity = 'Enter the town or city.';
  if (!input.location?.estateOrAreaOrNeighbourhood?.trim()) errors.estateOrArea = 'Enter the estate or area.';
  if (!OFFICE_ROAD_VISIBILITY_OPTIONS.some((item) => item.id === input.roadVisibility)) errors.roadVisibility = 'Choose where the office is located.';
  if (input.numberOfOfficeUnits === null || Number.isNaN(input.numberOfOfficeUnits) || input.numberOfOfficeUnits < 1) errors.numberOfOfficeUnits = 'Enter the number of office units.';
  if (input.numberOfFloors !== null && input.numberOfFloors !== undefined && input.numberOfFloors < 1) errors.numberOfFloors = 'Number of floors should be at least 1.';
  if (input.vacantOfficeFloor !== null && input.vacantOfficeFloor !== undefined && input.vacantOfficeFloor < 0) errors.vacantOfficeFloor = 'Enter a valid floor number.';
  validateMoney(input.rent.monthlyRent, 'monthlyRent', errors);
  validateMoney(input.rent.depositAmount, 'depositAmount', errors);
  if (input.hasVacantOfficeUnits !== 'yes' && input.hasVacantOfficeUnits !== 'no') errors.hasVacantOfficeUnits = 'Choose whether there are vacant office units.';
  if (input.hasVacantOfficeUnits === 'yes') {
    if (!input.vacancy) errors.vacancy = 'Add vacancy information.';
    if (input.vacancy) {
      validateMoney(input.vacancy.monthlyRent, 'vacancyMonthlyRent', errors);
      validateMoney(input.vacancy.depositAmount, 'vacancyDepositAmount', errors);
      if (input.vacancy.quantityAvailable === null || Number.isNaN(input.vacancy.quantityAvailable) || input.vacancy.quantityAvailable < 1) errors.quantityAvailable = 'Enter a quantity of at least 1.';
      if (!hasUnitIdentifiers(input.vacancy.unitIdentifiers, input.vacancy.quantityAvailable)) errors.unitIdentifiers = 'Enter the real-world unit identifier for every vacant office exactly as it appears on the property.';
    }
  }
  if (!input.water?.availability) errors.water = 'Choose the water availability.';
  if (input.water.availability === 'specific-days' && !input.water.specificDays?.trim()) errors.specificDays = 'Enter the days when water is available.';
  if (officeWaterHasConnection(input.water.availability) && !input.water.rentInclusion) errors.waterRentInclusion = 'Choose whether water is included in rent or paid separately.';
  if (!input.electricity || (input.electricity.isElectricityAvailable !== 'yes' && input.electricity.isElectricityAvailable !== 'no')) errors.electricity = 'Choose whether electricity is available.';
  if (input.electricity?.isElectricityAvailable === 'yes') {
    if (!input.electricity.billingType) errors.electricityBilling = 'Choose how electricity is billed.';
    if (input.electricity.billingType === 'other' && !input.electricity.otherBillingDescription?.trim()) errors.electricityOtherBilling = 'Briefly describe the electricity billing arrangement.';
  }
  for (const place of input.nearbyPlaces) if (!OFFICE_NEARBY_PLACES.some((item) => item.id === place.place)) errors.nearbyPlaces = 'Choose valid nearby places.';
  if (!input.description?.trim() || input.description.trim().length < 30) errors.description = 'Add an accurate description with at least 30 characters.';
  if (input.action !== 'save-draft' && input.action !== 'submit-registration') errors.action = 'Choose whether to save or submit.';
  return { valid: Object.keys(errors).length === 0, errors };
}

function findDuplicateOfficeCandidates(existing: RegisteredOfficeFoundation[], input: OfficeRegistrationInput, userId: string): string[] {
  const key = [input.officeType, input.officeName ?? '', input.location.county, input.location.townOrCity, input.location.estateOrAreaOrNeighbourhood, input.location.landmark ?? '', input.roadVisibility].map(normalise).join('|');
  return existing.filter((office) => office.registeredByUserId === userId).filter((office) => [office.officeType, office.officeName ?? '', office.location.county, office.location.townOrCity, office.location.estateOrAreaOrNeighbourhood, office.location.landmark ?? '', office.roadVisibility].map(normalise).join('|') === key).map((office) => office.id);
}

export async function registerOfficeFoundation(profile: AuthProfileFoundation, input: OfficeRegistrationInput): Promise<
  | { ok: true; office: RegisteredOfficeFoundation; message: string; nextRoute: string }
  | { ok: false; status: number; message: string; fieldErrors?: Record<string, string> }
> {
  if (!canRegisterOffices(profile.role)) return { ok: false, status: 403, message: 'Customers cannot register offices. Please use an authorized property account.' };
  const validation = validateOfficeInput(input);
  if (!validation.valid) return { ok: false, status: 400, message: 'Please check the highlighted office details and try again.', fieldErrors: validation.errors };

  const store = await readOfficeStore();
  const duplicateCandidateIds = findDuplicateOfficeCandidates(store.offices, input, profile.userId);
  const reviewFlags: string[] = [];
  if (duplicateCandidateIds.length) reviewFlags.push('possible-duplicate');
  if (input.hasVacantOfficeUnits === 'no' && input.vacancy) reviewFlags.push('logical-consistency-review');
  if (input.description.length < 45) reviewFlags.push('description-review');

  const propertyResult = await registerPropertyFoundation(profile, {
    category: 'offices',
    location: input.location,
    description: input.description,
    ownershipRole: input.ownershipRole,
    hasVacantUnits: input.hasVacantOfficeUnits,
    electricity: input.electricity,
    vacancy: input.hasVacantOfficeUnits === 'yes' && input.vacancy ? {
      summary: `Office vacancy: ${input.vacancy.quantityAvailable ?? 0} unit(s) available.`,
      unitsAvailable: input.vacancy.quantityAvailable ?? undefined,
      unitIdentifiers: input.vacancy.unitIdentifiers.map((identifier) => identifier.trim()).filter(Boolean)
    } : undefined,
    photos: input.photos.map((photo) => ({ fileName: photo.fileName, qualityNote: photo.represents })),
    action: input.action
  });
  if (!propertyResult.ok) return propertyResult;

  const timestamp = nowIso();
  const office: RegisteredOfficeFoundation = {
    ...input,
    vacancy: input.hasVacantOfficeUnits === 'yes' && input.vacancy ? { ...input.vacancy, unitIdentifiers: input.vacancy.unitIdentifiers.map((identifier) => identifier.trim()).filter(Boolean) } : undefined,
    id: randomUUID(),
    propertyFoundationId: propertyResult.property.id,
    registeredByUserId: profile.userId,
    registeredByRole: profile.role,
    duplicateCandidateIds,
    reviewFlags,
    systemPreparation: prepareOfficeSystems(input, propertyResult.property.status),
    createdAt: timestamp,
    updatedAt: timestamp,
    submittedAt: input.action === 'submit-registration' ? timestamp : undefined
  };
  store.offices.push(office);
  await writeOfficeStore(store);
  if (office.hasVacantOfficeUnits === 'yes' && office.vacancy) {
    await createVacancyConfirmationRecords({
      propertyId: propertyResult.property.id,
      sourceRegistrationId: office.id,
      category: 'offices',
      unitIdentifiers: office.vacancy.unitIdentifiers
    });
  }
  return {
    ok: true,
    office,
    message: input.action === 'submit-registration' ? OFFICE_REGISTRATION_FOUNDATION.successMessage : 'Office property saved as draft. You can continue later.',
    nextRoute: input.action === 'save-draft' ? '/properties/register/office' : propertyResult.nextRoute
  };
}

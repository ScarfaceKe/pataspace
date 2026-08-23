import { randomUUID } from 'node:crypto';
import type { AuthProfileFoundation } from '@/domain/auth';
import { prepareResidentialSystems } from '@/domain/house-system-preparation';
import {
  canRegisterHouses,
  getAllowedVacancyCategories,
  HOUSE_REGISTRATION_FOUNDATION,
  isMixedResidentialProperty,
  NEARBY_PLACES,
  RESIDENTIAL_CATEGORIES,
  waterHasConnection,
  type HouseRegistrationInput,
  type RegisteredHouseFoundation
} from '@/domain/house-registration';
import { registerPropertyFoundation } from '@/server/properties/service';
import { createVacancyConfirmationRecords } from '@/server/vacancy-confirmation/service';
import { readHouseStore, writeHouseStore } from './store';

function nowIso(): string {
  return new Date().toISOString();
}

function normalise(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function validateMoney(value: number | null, field: string, errors: Record<string, string>) {
  if (value === null || Number.isNaN(value) || value < 0) errors[field] = 'Enter a valid amount.';
}

function hasUnitIdentifiers(unitIdentifiers: string[] | undefined, expectedQuantity: number | null): boolean {
  const identifiers = unitIdentifiers?.map((item) => item.trim()).filter(Boolean) ?? [];
  if (!identifiers.length) return false;
  if (expectedQuantity && identifiers.length < expectedQuantity) return false;
  return true;
}

function validateHouseInput(input: HouseRegistrationInput): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  if (!RESIDENTIAL_CATEGORIES.some((item) => item.id === input.residentialCategory)) {
    errors.residentialCategory = 'Choose the residential category.';
  }
  if (!input.location?.county?.trim()) errors.county = 'Enter the county.';
  if (!input.location?.townOrCity?.trim()) errors.townOrCity = 'Enter the town or city.';
  if (!input.location?.estateOrAreaOrNeighbourhood?.trim()) errors.estateOrAreaOrNeighbourhood = 'Enter the estate or neighbourhood.';
  if (input.numberOfUnits === null || Number.isNaN(input.numberOfUnits) || input.numberOfUnits < 1) {
    errors.numberOfUnits = 'Enter the number of units.';
  }
  if (input.numberOfFloors !== null && input.numberOfFloors !== undefined && input.numberOfFloors < 1) {
    errors.numberOfFloors = 'Number of floors should be at least 1.';
  }
  if (input.vacantUnitFloor !== null && input.vacantUnitFloor !== undefined && input.vacantUnitFloor < 0) {
    errors.vacantUnitFloor = 'Enter a valid floor number.';
  }
  validateMoney(input.rent.monthlyRent, 'monthlyRent', errors);
  validateMoney(input.rent.depositAmount, 'depositAmount', errors);
  if (input.hasVacantUnits !== 'yes' && input.hasVacantUnits !== 'no') errors.hasVacantUnits = 'Choose whether there are vacant units.';
  if (input.hasVacantUnits === 'yes') {
    if (!input.vacancies.length) errors.vacancies = 'Add at least one vacant unit.';
    const allowed = getAllowedVacancyCategories(input.residentialCategory).map((item) => item.id);
    input.vacancies.forEach((vacancy, index) => {
      if (!allowed.includes(vacancy.residentialCategory)) {
        errors[`vacancy-${index}-residentialCategory`] = 'Choose a vacancy category allowed under this property.';
      }
      validateMoney(vacancy.monthlyRent, `vacancy-${index}-monthlyRent`, errors);
      validateMoney(vacancy.depositAmount, `vacancy-${index}-depositAmount`, errors);
      if (vacancy.quantityAvailable === null || Number.isNaN(vacancy.quantityAvailable) || vacancy.quantityAvailable < 1) {
        errors[`vacancy-${index}-quantityAvailable`] = 'Enter a quantity of at least 1.';
      }
      if (!hasUnitIdentifiers(vacancy.unitIdentifiers, vacancy.quantityAvailable)) {
        errors[`vacancy-${index}-unitIdentifiers`] = 'Enter the real-world unit identifier for every vacant unit exactly as it appears on the property.';
      }
    });
  }
  if (!input.water?.availability) errors.water = 'Choose the water availability.';
  if (input.water.availability === 'specific-days' && !input.water.specificDays?.trim()) {
    errors.specificDays = 'Enter the days when water is available.';
  }
  if (waterHasConnection(input.water.availability) && !input.water.rentInclusion) {
    errors.waterRentInclusion = 'Choose whether water is included in rent or paid separately.';
  }
  if (!input.electricity || (input.electricity.isElectricityAvailable !== 'yes' && input.electricity.isElectricityAvailable !== 'no')) {
    errors.electricity = 'Choose whether electricity is available.';
  }
  if (input.electricity?.isElectricityAvailable === 'yes') {
    if (!input.electricity.billingType) errors.electricityBilling = 'Choose how electricity is billed.';
    if (input.electricity.billingType === 'other' && !input.electricity.otherBillingDescription?.trim()) {
      errors.electricityOtherBilling = 'Briefly describe the electricity billing arrangement.';
    }
  }
  for (const place of input.nearbyPlaces) {
    if (!NEARBY_PLACES.some((item) => item.id === place.place)) errors.nearbyPlaces = 'Choose valid nearby places.';
  }
  if (!input.description?.trim() || input.description.trim().length < 30) {
    errors.description = 'Add an accurate description with at least 30 characters.';
  }
  if (input.action !== 'save-draft' && input.action !== 'submit-registration') errors.action = 'Choose whether to save or submit.';
  return { valid: Object.keys(errors).length === 0, errors };
}

function findDuplicateHouseCandidates(existing: RegisteredHouseFoundation[], input: HouseRegistrationInput, userId: string): string[] {
  const key = [
    input.residentialCategory,
    input.propertyName ?? '',
    input.location.county,
    input.location.townOrCity,
    input.location.estateOrAreaOrNeighbourhood,
    input.location.landmark ?? ''
  ].map(normalise).join('|');
  return existing
    .filter((house) => house.registeredByUserId === userId)
    .filter((house) => [
      house.residentialCategory,
      house.propertyName ?? '',
      house.location.county,
      house.location.townOrCity,
      house.location.estateOrAreaOrNeighbourhood,
      house.location.landmark ?? ''
    ].map(normalise).join('|') === key)
    .map((house) => house.id);
}

export async function registerHouseFoundation(profile: AuthProfileFoundation, input: HouseRegistrationInput): Promise<
  | { ok: true; house: RegisteredHouseFoundation; message: string; nextRoute: string }
  | { ok: false; status: number; message: string; fieldErrors?: Record<string, string> }
> {
  if (!canRegisterHouses(profile.role)) {
    return { ok: false, status: 403, message: 'Customers cannot register houses. Please use an authorized property account.' };
  }

  const validation = validateHouseInput(input);
  if (!validation.valid) {
    return { ok: false, status: 400, message: 'Please check the highlighted house details and try again.', fieldErrors: validation.errors };
  }

  const store = await readHouseStore();
  const duplicateCandidateIds = findDuplicateHouseCandidates(store.houses, input, profile.userId);
  const reviewFlags: string[] = [];
  if (duplicateCandidateIds.length) reviewFlags.push('possible-duplicate');
  if (input.hasVacantUnits === 'no' && input.vacancies.length) reviewFlags.push('logical-consistency-review');
  if (input.description.length < 45) reviewFlags.push('description-review');

  const totalVacantQuantity = input.hasVacantUnits === 'yes'
    ? input.vacancies.reduce((sum, vacancy) => sum + (vacancy.quantityAvailable ?? 0), 0)
    : 0;

  const propertyResult = await registerPropertyFoundation(profile, {
    category: 'houses',
    location: input.location,
    description: input.description,
    ownershipRole: input.ownershipRole,
    hasVacantUnits: input.hasVacantUnits,
    electricity: input.electricity,
    vacancy: input.hasVacantUnits === 'yes'
      ? {
          summary: `Residential vacancies: ${totalVacantQuantity} unit(s) available.`,
          unitsAvailable: totalVacantQuantity || undefined,
          unitIdentifiers: input.vacancies.flatMap((vacancy) => vacancy.unitIdentifiers.map((identifier) => identifier.trim()).filter(Boolean))
        }
      : undefined,
    photos: input.photos.map((photo) => ({ fileName: photo.fileName, qualityNote: photo.represents })),
    action: input.action
  });

  if (!propertyResult.ok) return propertyResult;

  const timestamp = nowIso();
  const house: RegisteredHouseFoundation = {
    ...input,
    vacancies: input.hasVacantUnits === 'yes'
      ? input.vacancies.map((vacancy) => ({
          ...vacancy,
          unitIdentifiers: vacancy.unitIdentifiers.map((identifier) => identifier.trim()).filter(Boolean)
        }))
      : [],
    id: randomUUID(),
    propertyFoundationId: propertyResult.property.id,
    registeredByUserId: profile.userId,
    registeredByRole: profile.role,
    duplicateCandidateIds,
    reviewFlags,
    systemPreparation: prepareResidentialSystems(input, propertyResult.property.status),
    createdAt: timestamp,
    updatedAt: timestamp,
    submittedAt: input.action === 'submit-registration' ? timestamp : undefined
  };

  store.houses.push(house);
  await writeHouseStore(store);
  if (house.hasVacantUnits === 'yes') {
    await createVacancyConfirmationRecords({
      propertyId: propertyResult.property.id,
      sourceRegistrationId: house.id,
      category: 'houses',
      unitIdentifiers: house.vacancies.flatMap((vacancy) => vacancy.unitIdentifiers)
    });
  }

  return {
    ok: true,
    house,
    message: input.action === 'submit-registration'
      ? HOUSE_REGISTRATION_FOUNDATION.successMessage
      : 'Residential property saved as draft. You can continue later.',
    nextRoute: input.action === 'save-draft' ? '/properties/register/house' : propertyResult.nextRoute
  };
}

export { validateHouseInput };

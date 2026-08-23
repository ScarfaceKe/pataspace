import { randomUUID } from 'node:crypto';
import type { AuthProfileFoundation } from '@/domain/auth';
import {
  canRegisterMixedUseBuildings,
  MIXED_USE_BUILDING_FOUNDATION,
  type MixedUseBuildingRegistrationInput,
  type MixedUseUnitInput,
  type RegisteredMixedUseBuilding,
} from '@/domain/mixed-use-building-registration';
import { registerPropertyFoundation } from '@/server/properties/service';
import { readMixedUseBuildingStore, writeMixedUseBuildingStore } from './store';

function nowIso(): string {
  return new Date().toISOString();
}

function validateUnitInput(unit: MixedUseUnitInput, index: number, errors: Record<string, string>) {
  if (!unit.unitIdentifier.trim()) errors[`unit-${index}-identifier`] = 'Enter a unit identifier.';
  if (!unit.category) errors[`unit-${index}-category`] = 'Select a category for this unit.';

  if (unit.rent.monthlyRent !== null && (unit.rent.monthlyRent < 0 || Number.isNaN(unit.rent.monthlyRent))) {
    errors[`unit-${index}-rent`] = 'Enter a valid rent amount.';
  }
  if (unit.rent.depositAmount !== null && (unit.rent.depositAmount < 0 || Number.isNaN(unit.rent.depositAmount))) {
    errors[`unit-${index}-deposit`] = 'Enter a valid deposit amount.';
  }

  if (unit.category === 'shops') {
    if (!unit.commercialUnitType) errors[`unit-${index}-shop-type`] = 'Select a commercial unit type.';
  }
  if (unit.category === 'offices') {
    if (!unit.officeType) errors[`unit-${index}-office-type`] = 'Select an office type.';
  }
  if (unit.category === 'event-halls') {
    if (!unit.hallCategory) errors[`unit-${index}-hall-category`] = 'Select a hall category.';
  }
  if (unit.category === 'houses') {
    if (!unit.residentialCategory) errors[`unit-${index}-house-category`] = 'Select a residential category.';
  }
}

function validateInput(input: MixedUseBuildingRegistrationInput): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!input.buildingName.trim()) errors.buildingName = 'Enter a building name.';
  if (!input.location.county.trim()) errors.county = 'Enter the county.';
  if (!input.location.townOrCity.trim()) errors.townOrCity = 'Enter the town or city.';
  if (!input.location.estateOrAreaOrNeighbourhood.trim()) errors.estateOrArea = 'Enter the estate or area.';
  if (!input.description.trim()) errors.description = 'Enter a description.';
  if (!input.units.length) errors.units = 'Add at least one unit.';

  for (let i = 0; i < input.units.length; i++) {
    validateUnitInput(input.units[i], i, errors);
  }

  const identifiers = input.units.map((u) => u.unitIdentifier.trim().toLowerCase());
  const seen = new Set<string>();
  for (let i = 0; i < identifiers.length; i++) {
    if (!identifiers[i]) continue;
    if (seen.has(identifiers[i])) {
      errors[`unit-${i}-duplicate`] = `Unit identifier "${input.units[i].unitIdentifier}" is already used. Each unit must have a unique identifier.`;
    }
    seen.add(identifiers[i]);
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export async function registerMixedUseBuilding(
  profile: AuthProfileFoundation,
  input: MixedUseBuildingRegistrationInput,
): Promise<{ ok: boolean; status?: number; message?: string; fieldErrors?: Record<string, string>; building?: RegisteredMixedUseBuilding }> {
  if (!canRegisterMixedUseBuildings(profile.role)) {
    return { ok: false, status: 403, message: 'Your account type cannot register properties.' };
  }

  const validation = validateInput(input);
  if (!validation.valid) {
    return { ok: false, status: 400, message: 'Please check the highlighted details and try again.', fieldErrors: validation.errors };
  }

  const propertyResult = await registerPropertyFoundation(profile, {
    category: 'shops', // Mixed-use buildings use 'shops' as the base property category for the foundation record
    location: input.location,
    description: input.description,
    ownershipRole: input.ownershipRole,
    whatsappContacts: input.whatsappContacts,
    hasVacantUnits: input.units.some((u) => u.isVacant) ? 'yes' : 'no',
    entrancePhotos: input.entrancePhotos,
    buildingPhotos: input.buildingPhotos,
    action: input.action,
  });

  if (!propertyResult.ok) {
    return { ok: false, status: propertyResult.status, message: propertyResult.message };
  }

  const buildingId = randomUUID();
  const now = nowIso();

  const building: RegisteredMixedUseBuilding = {
    ...input,
    id: buildingId,
    propertyFoundationId: propertyResult.property!.id,
    registeredByUserId: profile.userId,
    registeredByRole: profile.role,
    status: input.action === 'submit-registration' ? 'waiting-for-verification' : 'draft',
    createdAt: now,
    updatedAt: now,
    submittedAt: input.action === 'submit-registration' ? now : undefined,
  };

  const store = await readMixedUseBuildingStore();
  store.buildings.push(building);
  await writeMixedUseBuildingStore(store);

  return {
    ok: true,
    building,
    message: input.action === 'submit-registration'
      ? `${MIXED_USE_BUILDING_FOUNDATION.successMessage} ${input.units.some((u) => u.isVacant) ? 'Vacant units will appear in search results after admin approval. You will be notified via WhatsApp to upload photos for each individual vacant unit.' : 'Your building has been registered.'}`
      : 'Building draft saved successfully.',
  };
}

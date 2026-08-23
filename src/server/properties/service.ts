import { randomUUID } from 'node:crypto';
import { analyseKenyaPropertyLocation } from '@/domain/kenya-location-intelligence';
import {
  canRegisterProperties,
  createVacancyVerificationFoundation,
  getInitialPropertyStatus,
  PROPERTY_REGISTRATION_CATEGORIES,
  type PropertyRegistrationInput,
  type PropertyReviewFlagReason,
  type RegisteredPropertyFoundation
} from '@/domain/property-registration';
import { DASHBOARD_ROUTES, type AuthProfileFoundation } from '@/domain/auth';
import { learnGeographicLocation } from '@/server/unified-platform/geography-service';
import { createVerificationWorkflow } from '@/server/verification/service';
import { trackAnalyticsEvent } from '@/server/analytics/service';
import { readPropertyStore, writePropertyStore } from './store';

function nowIso(): string {
  return new Date().toISOString();
}

function normalise(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function hasValidUnitIdentifiers(unitIdentifiers: string[] | undefined, expectedQuantity?: number): boolean {
  const identifiers = unitIdentifiers?.map((item) => item.trim()).filter(Boolean) ?? [];
  if (!identifiers.length) return false;
  if (expectedQuantity && identifiers.length < expectedQuantity) return false;
  return true;
}

function validateElectricityInformation(input: PropertyRegistrationInput, errors: Record<string, string>) {
  if (input.category === 'event-halls') return;
  if (!input.electricity || (input.electricity.isElectricityAvailable !== 'yes' && input.electricity.isElectricityAvailable !== 'no')) {
    errors.electricity = 'Choose whether electricity is available.';
    return;
  }
  if (input.electricity.isElectricityAvailable === 'yes') {
    if (!input.electricity.billingType) errors.electricityBilling = 'Choose how electricity is billed.';
    if (input.electricity.billingType === 'other' && !input.electricity.otherBillingDescription?.trim()) {
      errors.electricityOtherBilling = 'Briefly describe the electricity billing arrangement.';
    }
  }
}

function validatePropertyRegistrationInput(input: PropertyRegistrationInput): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  if (!PROPERTY_REGISTRATION_CATEGORIES.some((category) => category.id === input.category)) {
    errors.category = 'Choose the type of property you would like to register.';
  }
  if (!input.location?.county?.trim()) errors.county = 'Enter the county.';
  if (!input.location?.townOrCity?.trim()) errors.townOrCity = 'Enter the town or city.';
  if (!input.location?.estateOrAreaOrNeighbourhood?.trim()) {
    errors.estateOrAreaOrNeighbourhood = 'Enter the estate, area or neighbourhood.';
  }
  if (!input.description?.trim() || input.description.trim().length < 20) {
    errors.description = 'Add a helpful description with at least 20 characters.';
  }
  if (input.ownershipRole !== 'owner' && input.ownershipRole !== 'property-manager' && input.ownershipRole !== 'leasing-agent') {
    errors.ownershipRole = 'Choose whether you are the owner, property manager or leasing agent.';
  }
  validateElectricityInformation(input, errors);
  if (input.hasVacantUnits !== 'yes' && input.hasVacantUnits !== 'no') {
    errors.hasVacantUnits = 'Choose whether the property currently has vacant units.';
  }
  if (input.hasVacantUnits === 'yes') {
    if (!input.vacancy?.summary?.trim()) errors.vacancySummary = 'Add basic vacancy information.';
    if (input.vacancy?.unitsAvailable !== undefined && input.vacancy.unitsAvailable < 1) {
      errors.unitsAvailable = 'Vacant units should be at least 1 when vacancies are available.';
    }
    if (!hasValidUnitIdentifiers(input.vacancy?.unitIdentifiers, input.vacancy?.unitsAvailable)) {
      errors.unitIdentifiers = 'Enter the real-world unit identifier for every vacant unit exactly as it appears on the property.';
    }
  }
  if (input.hasVacantUnits === 'no' && input.vacancy?.unitsAvailable && input.vacancy.unitsAvailable > 0) {
    errors.unitsAvailable = 'If the property has no vacancies, vacant units should not be added.';
  }
  if (input.action !== 'save-draft' && input.action !== 'submit-registration') {
    errors.action = 'Choose whether to save as draft or submit registration.';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

function findDuplicateCandidates(
  existing: RegisteredPropertyFoundation[],
  input: PropertyRegistrationInput,
  userId: string
): string[] {
  const candidateKey = [
    input.category,
    input.location.county,
    input.location.townOrCity,
    input.location.estateOrAreaOrNeighbourhood,
    input.location.street ?? '',
    input.location.landmark ?? ''
  ]
    .map(normalise)
    .join('|');

  return existing
    .filter((property) => property.registeredByUserId === userId)
    .filter((property) => {
      const existingKey = [
        property.category,
        property.location.county,
        property.location.townOrCity,
        property.location.estateOrAreaOrNeighbourhood,
        property.location.street ?? '',
        property.location.landmark ?? ''
      ]
        .map(normalise)
        .join('|');
      return existingKey === candidateKey;
    })
    .map((property) => property.id);
}

function detectObviousMistakes(input: PropertyRegistrationInput): boolean {
  const joined = [input.location.county, input.location.townOrCity, input.location.estateOrAreaOrNeighbourhood].join(' ');
  return /test|unknown|n\/a|none/i.test(joined) || input.description.trim().length < 35;
}

export async function registerPropertyFoundation(
  profile: AuthProfileFoundation,
  input: PropertyRegistrationInput
): Promise<
  | { ok: true; property: RegisteredPropertyFoundation; message: string; nextRoute: string }
  | { ok: false; status: number; message: string; fieldErrors?: Record<string, string> }
> {
  if (!canRegisterProperties(profile.role)) {
    return {
      ok: false,
      status: 403,
      message: 'This account cannot register properties. Please use a Property Owner, Property Manager or Leasing Agent account.'
    };
  }

  const validation = validatePropertyRegistrationInput(input);
  if (!validation.valid) {
    return { ok: false, status: 400, message: 'Please check the highlighted property details and try again.', fieldErrors: validation.errors };
  }

  const data = await readPropertyStore();
  const locationIntelligence = analyseKenyaPropertyLocation(input.location);
  const duplicateCandidateIds = findDuplicateCandidates(data.properties, input, profile.userId);
  const reviewFlags: PropertyReviewFlagReason[] = [];
  if (locationIntelligence.quietlyFlagForReview) reviewFlags.push('new-location-review');
  if (duplicateCandidateIds.length > 0) reviewFlags.push('possible-duplicate');
  if (detectObviousMistakes(input)) reviewFlags.push('obvious-mistake-review');
  if (input.hasVacantUnits === 'no' && input.action === 'submit-registration') reviewFlags.push('logical-consistency-review');

  const timestamp = nowIso();
  const property: RegisteredPropertyFoundation = {
    ...input,
    location: {
      county: input.location.county.trim(),
      townOrCity: input.location.townOrCity.trim(),
      estateOrAreaOrNeighbourhood: input.location.estateOrAreaOrNeighbourhood.trim(),
      street: input.location.street?.trim() || undefined,
      landmark: input.location.landmark?.trim() || undefined,
      verification: input.location.verification
    },
    description: input.description.trim(),
    electricity: input.category === 'event-halls' || !input.electricity
      ? undefined
      : {
          isElectricityAvailable: input.electricity.isElectricityAvailable,
          billingType: input.electricity.isElectricityAvailable === 'yes' ? input.electricity.billingType : undefined,
          otherBillingDescription: input.electricity.billingType === 'other' ? input.electricity.otherBillingDescription?.trim() : undefined,
          powerAvailabilityNotes: input.electricity.powerAvailabilityNotes?.trim() || undefined
        },
    vacancy: input.hasVacantUnits === 'yes' && input.vacancy
      ? { ...input.vacancy, unitIdentifiers: input.vacancy.unitIdentifiers?.map((item) => item.trim()).filter(Boolean) }
      : undefined,
    photos: input.photos?.filter((photo) => photo.fileName.trim()).map((photo) => ({ ...photo, fileName: photo.fileName.trim() })) ?? [],
    id: randomUUID(),
    registeredByUserId: profile.userId,
    registeredByRole: profile.role,
    status: getInitialPropertyStatus(input),
    verificationStatus: 'waiting-for-verification',
    locationReviewRequired: locationIntelligence.quietlyFlagForReview,
    reviewFlags,
    duplicateCandidateIds,
    vacancyVerification: createVacancyVerificationFoundation(input.hasVacantUnits),
    createdAt: timestamp,
    updatedAt: timestamp,
    submittedAt: input.action === 'submit-registration' ? timestamp : undefined
  };

  await learnGeographicLocation({ name: property.location.county, type: 'county', registrationEvidence: [property.id], acceptedWithoutRejection: true });
  await learnGeographicLocation({ name: property.location.townOrCity, type: 'town', county: property.location.county, registrationEvidence: [property.id], acceptedWithoutRejection: true });
  await learnGeographicLocation({ name: property.location.estateOrAreaOrNeighbourhood, type: 'estate', county: property.location.county, registrationEvidence: [property.id], acceptedWithoutRejection: true });
  data.properties.push(property);
  await writePropertyStore(data);
  await trackAnalyticsEvent({ eventType: 'property-registration', actorUserId: profile.userId, actorRole: profile.role, propertyId: property.id, propertyCategory: property.category, location: { county: property.location.county, townOrCity: property.location.townOrCity, estateOrNeighbourhood: property.location.estateOrAreaOrNeighbourhood } });
  const verificationRecord = await createVerificationWorkflow(property);
  property.verificationStatus = verificationRecord.status;
  await writePropertyStore(data);

  return {
    ok: true,
    property,
    message: input.action === 'save-draft' ? 'Property saved as draft. You can continue later.' : 'Property successfully registered.',
    nextRoute: input.action === 'save-draft' ? '/properties/register' : DASHBOARD_ROUTES[profile.role]
  };
}

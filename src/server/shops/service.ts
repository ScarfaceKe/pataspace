import { randomUUID } from 'node:crypto';
import type { AuthProfileFoundation } from '@/domain/auth';
import { prepareShopSystems } from '@/domain/shop-system-preparation';
import {
  BUSINESS_SUITABILITY_OPTIONS,
  COMMERCIAL_UNIT_TYPES,
  SHOP_PRICING_CATEGORIES,
  ROAD_VISIBILITY_OPTIONS,
  SHOP_NEARBY_PLACES,
  SHOP_REGISTRATION_FOUNDATION,
  SHOP_TYPES,
  canRegisterShops,
  shopWaterHasConnection,
  type RegisteredShopFoundation,
  type ShopRegistrationInput
} from '@/domain/shop-registration';
import { registerPropertyFoundation } from '@/server/properties/service';
import { createVacancyConfirmationRecords } from '@/server/vacancy-confirmation/service';
import { readShopStore, writeShopStore } from './store';

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

export function validateShopInput(input: ShopRegistrationInput): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  if (!Array.isArray(input.shopType) || input.shopType.length === 0) errors.shopType = 'Choose at least one shop type.';
  if (Array.isArray(input.shopType) && input.shopType.length > 2) errors.shopType = 'Choose at most two shop types.';
  if (Array.isArray(input.shopType)) {
    for (const st of input.shopType) {
      if (!SHOP_TYPES.some((item) => item.id === st)) errors.shopType = 'Choose valid shop types.';
    }
  }
  if (!COMMERCIAL_UNIT_TYPES.some((item) => item.id === input.commercialUnitType)) errors.commercialUnitType = 'Choose the commercial unit type.';
  if (input.commercialUnitType === 'other-commercial-unit-type' && !input.customCommercialUnitType?.trim()) errors.customCommercialUnitType = 'Enter the custom commercial unit type.';
  if (!SHOP_PRICING_CATEGORIES.some((item) => item.id === input.pricingCategory)) errors.pricingCategory = 'Choose the pricing category used for PataSpace pricing.';
  if (!input.location?.county?.trim()) errors.county = 'Enter the county.';
  if (!input.location?.townOrCity?.trim()) errors.townOrCity = 'Enter the town or city.';
  if (!input.location?.estateOrAreaOrNeighbourhood?.trim()) errors.estateOrArea = 'Enter the estate or area.';
  if (!ROAD_VISIBILITY_OPTIONS.some((item) => item.id === input.roadVisibility)) errors.roadVisibility = 'Choose where the shop is located.';
  if (input.numberOfShopUnits === null || Number.isNaN(input.numberOfShopUnits) || input.numberOfShopUnits < 1) {
    errors.numberOfShopUnits = 'Enter the number of shop units.';
  }
  if (input.numberOfFloors !== null && input.numberOfFloors !== undefined && input.numberOfFloors < 1) {
    errors.numberOfFloors = 'Number of floors should be at least 1.';
  }
  if (input.vacantShopFloor !== null && input.vacantShopFloor !== undefined && input.vacantShopFloor < 0) {
    errors.vacantShopFloor = 'Enter a valid floor number.';
  }
  validateMoney(input.rent.monthlyRent, 'monthlyRent', errors);
  validateMoney(input.rent.depositAmount, 'depositAmount', errors);
  if (input.hasVacantShopUnits !== 'yes' && input.hasVacantShopUnits !== 'no') errors.hasVacantShopUnits = 'Choose whether there are vacant shop units.';
  if (input.hasVacantShopUnits === 'yes') {
    if (!input.vacancy) errors.vacancy = 'Add vacancy information.';
    if (input.vacancy) {
      validateMoney(input.vacancy.monthlyRent, 'vacancyMonthlyRent', errors);
      validateMoney(input.vacancy.depositAmount, 'vacancyDepositAmount', errors);
      if (input.vacancy.quantityAvailable === null || Number.isNaN(input.vacancy.quantityAvailable) || input.vacancy.quantityAvailable < 1) {
        errors.quantityAvailable = 'Enter a quantity of at least 1.';
      }
      if (!hasUnitIdentifiers(input.vacancy.unitIdentifiers, input.vacancy.quantityAvailable)) {
        errors.unitIdentifiers = 'Enter the real-world unit identifier for every vacant shop exactly as it appears on the property.';
      }
    }
  }
  if (!input.water?.availability) errors.water = 'Choose the water availability.';
  if (input.water.availability === 'specific-days' && !input.water.specificDays?.trim()) errors.specificDays = 'Enter the days when water is available.';
  if (shopWaterHasConnection(input.water.availability) && !input.water.rentInclusion) {
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
  if (!input.businessSuitability.length) errors.businessSuitability = 'Choose at least one suitable business.';
  for (const suitability of input.businessSuitability) {
    if (!BUSINESS_SUITABILITY_OPTIONS.some((item) => item.id === suitability)) errors.businessSuitability = 'Choose valid business suitability options.';
  }
  for (const place of input.nearbyPlaces) {
    if (!SHOP_NEARBY_PLACES.some((item) => item.id === place.place)) errors.nearbyPlaces = 'Choose valid nearby places.';
  }
  if (!input.description?.trim() || input.description.trim().length < 30) errors.description = 'Add a clear description with at least 30 characters.';
  if (input.action !== 'save-draft' && input.action !== 'submit-registration') errors.action = 'Choose whether to save or submit.';
  return { valid: Object.keys(errors).length === 0, errors };
}

function findDuplicateShopCandidates(existing: RegisteredShopFoundation[], input: ShopRegistrationInput, userId: string): string[] {
  const shopTypesKey = Array.isArray(input.shopType) ? [...input.shopType].sort().join(',') : String(input.shopType);
  const key = [
    shopTypesKey,
    input.commercialUnitType,
    input.customCommercialUnitType ?? '',
    input.pricingCategory,
    input.shopName ?? '',
    input.location.county,
    input.location.townOrCity,
    input.location.estateOrAreaOrNeighbourhood,
    input.location.landmark ?? '',
    input.roadVisibility
  ].map(normalise).join('|');
  return existing
    .filter((shop) => shop.registeredByUserId === userId)
    .filter((shop) => {
      const existingShopTypes = Array.isArray(shop.shopType) ? [...shop.shopType].sort().join(',') : String(shop.shopType);
      return [
        existingShopTypes,
        shop.commercialUnitType,
        shop.customCommercialUnitType ?? '',
        shop.pricingCategory,
        shop.shopName ?? '',
        shop.location.county,
        shop.location.townOrCity,
        shop.location.estateOrAreaOrNeighbourhood,
        shop.location.landmark ?? '',
        shop.roadVisibility
      ].map(normalise).join('|') === key;
    })
    .map((shop) => shop.id);
}

export async function registerShopFoundation(profile: AuthProfileFoundation, input: ShopRegistrationInput): Promise<
  | { ok: true; shop: RegisteredShopFoundation; message: string; nextRoute: string }
  | { ok: false; status: number; message: string; fieldErrors?: Record<string, string> }
> {
  if (!canRegisterShops(profile.role)) {
    return { ok: false, status: 403, message: 'Customers cannot register shops. Please use an authorized property account.' };
  }

  const validation = validateShopInput(input);
  if (!validation.valid) return { ok: false, status: 400, message: 'Please check the highlighted shop details and try again.', fieldErrors: validation.errors };

  const store = await readShopStore();
  const duplicateCandidateIds = findDuplicateShopCandidates(store.shops, input, profile.userId);
  const reviewFlags: string[] = [];
  if (duplicateCandidateIds.length) reviewFlags.push('possible-duplicate');
  if (input.hasVacantShopUnits === 'no' && input.vacancy) reviewFlags.push('logical-consistency-review');
  if (input.description.length < 45) reviewFlags.push('description-review');

  const propertyResult = await registerPropertyFoundation(profile, {
    category: 'shops',
    location: input.location,
    description: input.description,
    ownershipRole: input.ownershipRole,
    hasVacantUnits: input.hasVacantShopUnits,
    electricity: input.electricity,
    vacancy: input.hasVacantShopUnits === 'yes' && input.vacancy
      ? {
          summary: `Shop vacancy: ${input.vacancy.quantityAvailable ?? 0} unit(s) available.`,
          unitsAvailable: input.vacancy.quantityAvailable ?? undefined,
          unitIdentifiers: input.vacancy.unitIdentifiers.map((identifier) => identifier.trim()).filter(Boolean)
        }
      : undefined,
    photos: input.photos.map((photo) => ({ fileName: photo.fileName, qualityNote: photo.represents })),
    action: input.action
  });

  if (!propertyResult.ok) return propertyResult;

  const timestamp = nowIso();
  const shop: RegisteredShopFoundation = {
    ...input,
    vacancy: input.hasVacantShopUnits === 'yes' && input.vacancy
      ? {
          ...input.vacancy,
          unitIdentifiers: input.vacancy.unitIdentifiers.map((identifier) => identifier.trim()).filter(Boolean)
        }
      : undefined,
    id: randomUUID(),
    propertyFoundationId: propertyResult.property.id,
    registeredByUserId: profile.userId,
    registeredByRole: profile.role,
    duplicateCandidateIds,
    reviewFlags,
    systemPreparation: prepareShopSystems(input, propertyResult.property.status),
    createdAt: timestamp,
    updatedAt: timestamp,
    submittedAt: input.action === 'submit-registration' ? timestamp : undefined
  };

  store.shops.push(shop);
  await writeShopStore(store);
  if (shop.hasVacantShopUnits === 'yes' && shop.vacancy) {
    await createVacancyConfirmationRecords({
      propertyId: propertyResult.property.id,
      sourceRegistrationId: shop.id,
      category: 'shops',
      unitIdentifiers: shop.vacancy.unitIdentifiers
    });
  }

  return {
    ok: true,
    shop,
    message: input.action === 'submit-registration' ? SHOP_REGISTRATION_FOUNDATION.successMessage : 'Shop property saved as draft. You can continue later.',
    nextRoute: input.action === 'save-draft' ? '/properties/register/shop' : propertyResult.nextRoute
  };
}

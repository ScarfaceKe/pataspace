import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const shopDomain = readFileSync(new URL('../src/domain/shop-registration.ts', import.meta.url), 'utf8');
const shopService = readFileSync(new URL('../src/server/shops/service.ts', import.meta.url), 'utf8');
const shopForm = readFileSync(new URL('../src/components/shops/ShopRegistrationForm.tsx', import.meta.url), 'utf8');
const shopPage = readFileSync(new URL('../app/properties/register/shop/page.tsx', import.meta.url), 'utf8');
const foundationSource = readFileSync(new URL('../src/lib/foundation.ts', import.meta.url), 'utf8');
const propertyForm = readFileSync(new URL('../src/components/properties/PropertyRegistrationForm.tsx', import.meta.url), 'utf8');
const dashboardShell = readFileSync(new URL('../src/components/dashboard/DashboardShell.tsx', import.meta.url), 'utf8');

for (const role of ["'property-owner'", "'property-manager'", "'leasing-agent'"]) {
  assert.ok(shopDomain.includes(role), `Shop registration authorized role missing: ${role}`);
}
assert.ok(shopDomain.includes("blockedRoles: ['customer']"), 'Customers must be blocked from shop registration');
assert.ok(shopService.includes('canRegisterShops(profile.role)'), 'Server must enforce shop registration authorization');
assert.ok(shopPage.includes('Customers cannot register shops'), 'Customer blocked message must exist');

assert.ok(shopForm.includes('What type of shop are you registering?'), 'Screen 1 shop type question missing');
assert.ok(shopDomain.includes('CommercialUnitTypeId'), 'Commercial Unit Type domain missing');
assert.ok(shopDomain.includes('ShopPricingCategoryId'), 'Pricing Category domain missing');
for (const unit of ['Kiosk', 'Stall', 'Shop', 'Showroom', 'Warehouse', 'Godown', 'Container Shop', 'Mini Shop', 'Boutique', 'Salon / Barbershop', 'Restaurant / Café Space', 'Pharmacy Space', 'Supermarket Space', 'Hardware Shop', 'Office-Shop Combination', 'Other Commercial Unit Type']) {
  assert.ok(shopDomain.includes(unit), `Missing commercial unit type: ${unit}`);
}
for (const pricingCategory of ['Small Shop', 'Medium Shop', 'Large Shop']) {
  assert.ok(shopDomain.includes(pricingCategory), `Missing pricing category: ${pricingCategory}`);
}
assert.ok(shopDomain.includes('commercialUnitTypeUsedForSearchFilteringMatchingAndDisplay: true'), 'Commercial Unit Type use rule missing');
assert.ok(shopDomain.includes('pricingCategoryUsedOnlyForFounderApprovedUnlockAndVerifiedAccessPricing: true'), 'Pricing Category use rule missing');
assert.ok(shopService.includes('commercialUnitType'), 'Shop service must validate/store Commercial Unit Type');
assert.ok(shopService.includes('pricingCategory'), 'Shop service must validate/store Pricing Category');
assert.ok(shopForm.includes('Commercial Unit Type Identification'), 'Shop form must collect Commercial Unit Type');
assert.ok(shopForm.includes('Pricing Category'), 'Shop form must collect Pricing Category');
assert.ok(shopForm.includes('SHOP_TYPES.map'), 'Form must render shop type cards');
assert.ok(shopForm.includes('datalist'), 'Location fields should be searchable');
assert.ok(shopForm.includes('KENYA_COUNTIES') && shopForm.includes('KNOWN_KENYA_LOCATION_TERMS'), 'Kenya searchable locations missing');

for (const road of [
  'Facing the Main Road',
  'Along the Main Road',
  'Facing an Inner Road',
  'Along an Inner Road',
  'Inside a Shopping Complex',
  'Inside a Building',
  'Inside an Estate',
  'Other'
]) {
  assert.ok(shopDomain.includes(road), `Missing road visibility option: ${road}`);
}
assert.ok(shopForm.includes('Where is the shop located?'), 'Road visibility question missing');

for (const field of ['Shop Name (optional)', 'Number of Shop Units', 'Number of Floors (if applicable)', 'Floor where vacant shop exists (if applicable)']) {
  assert.ok(shopForm.includes(field), `Missing shop information field: ${field}`);
}
for (const field of ['Monthly Rent', 'Deposit Amount', 'One Month', 'Two Months', 'Three Months', 'Any custom deposit amount']) {
  assert.ok(shopDomain.includes(field) || shopForm.includes(field), `Missing rent/deposit field: ${field}`);
}

for (const field of ['Are there currently vacant shop units?', 'Quantity Available', 'Deposit amount filled directly']) {
  assert.ok(shopForm.includes(field), `Missing vacancy field: ${field}`);
}
for (const water of ['Daily Water', 'Water on Specific Days', 'Water Purchased Separately', 'No Water Connection', 'Included', 'Paid Separately']) {
  assert.ok(shopDomain.includes(water) || shopForm.includes(water), `Missing water option: ${water}`);
}
assert.ok(shopService.includes('shopWaterHasConnection'), 'Water rent inclusion validation missing');

assert.ok(shopForm.includes('Which businesses is the shop suitable for?'), 'Business suitability question missing');
assert.ok(shopForm.includes('BUSINESS_SUITABILITY_OPTIONS.map'), 'Business suitability toggles missing');
for (const business of ['Retail', 'Salon or Barber', 'Food Business', 'Boutique', 'Chemist or Pharmacy', 'Hardware', 'M-Pesa or Agent Shop']) {
  assert.ok(shopDomain.includes(business), `Missing business suitability option: ${business}`);
}

for (const place of ['Bus Stage', 'Market', 'Main Road', 'Shopping Centre', 'Bank', 'Hospital']) {
  assert.ok(shopDomain.includes(place), `Missing nearby place: ${place}`);
}
assert.ok(shopForm.includes('SHOP_NEARBY_PLACES.map'), 'Nearby places UI missing');

for (const photo of ['front of the building', 'shop entrance', 'shop interior', 'shop frontage', 'gate', 'surrounding environment', 'Shared parking or common areas']) {
  assert.ok(shopDomain.toLowerCase().includes(photo.toLowerCase()) || shopForm.toLowerCase().includes(photo.toLowerCase()), `Missing photo guidance: ${photo}`);
}
assert.ok(shopForm.includes('type="file"') && shopForm.includes('accept="image/*"'), 'Photo uploads missing');
assert.ok(shopForm.includes('Avoid exaggerated marketing language'), 'Description guidance missing');

assert.ok(shopDomain.includes('unitIdentifiers: string[]'), 'Shop vacancies must store real-world unit identifiers');
assert.ok(shopService.includes('unitIdentifiers'), 'Shop service must validate and preserve unit identifiers');
assert.ok(shopForm.includes('Real-world vacant shop identifiers'), 'Shop form must collect real-world unit identifiers');
assert.ok(shopForm.includes('exactly as it appears'), 'Shop unit identifier wording must preserve actual property identifiers');
assert.ok(shopDomain.includes('electricity: ElectricityInformationInput'), 'Registration must inherit platform-wide electricity information');
assert.ok(shopService.includes('electricity'), 'Service must validate and preserve electricity information');
assert.ok(shopForm.includes('Is electricity available?'), 'Form must collect electricity availability');
assert.ok(shopForm.includes('How is electricity billed?'), 'Form must collect electricity billing');
assert.ok(shopForm.includes('Power availability notes'), 'Form must collect power availability notes');
assert.ok(shopForm.includes('Save Draft'), 'Save Draft missing');
assert.ok(shopForm.includes('Continue Later'), 'Continue Later missing');
assert.ok(shopForm.includes('Submit Registration'), 'Submit Registration missing');
assert.ok(shopDomain.includes('Your shop property has been successfully registered.'), 'Success message missing');
assert.ok(shopService.includes('duplicateCandidateIds'), 'Duplicate detection foundation missing');
assert.ok(shopService.includes('logical-consistency-review'), 'Logical consistency validation missing');
assert.ok(shopService.includes('registerPropertyFoundation'), 'Shop registration must build on Property Registration Foundation');
assert.ok(foundationSource.includes('shopRegistration: SHOP_REGISTRATION_FOUNDATION'), 'Foundation snapshot must include shop registration');
assert.ok(propertyForm.includes('Continue to Shop Registration'), 'Property foundation Shop card must connect to Shop Registration');
assert.ok(dashboardShell.includes('/properties/register/shop'), 'Dashboard must link to shop registration');

console.log('PataSpace shop registration checks passed.');

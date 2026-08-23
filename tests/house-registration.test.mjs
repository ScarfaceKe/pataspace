import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const houseDomain = readFileSync(new URL('../src/domain/house-registration.ts', import.meta.url), 'utf8');
const houseService = readFileSync(new URL('../src/server/houses/service.ts', import.meta.url), 'utf8');
const houseForm = readFileSync(new URL('../src/components/houses/HouseRegistrationForm.tsx', import.meta.url), 'utf8');
const housePage = readFileSync(new URL('../app/properties/register/house/page.tsx', import.meta.url), 'utf8');
const foundationSource = readFileSync(new URL('../src/lib/foundation.ts', import.meta.url), 'utf8');
const dashboardShell = readFileSync(new URL('../src/components/dashboard/DashboardShell.tsx', import.meta.url), 'utf8');
const propertyForm = readFileSync(new URL('../src/components/properties/PropertyRegistrationForm.tsx', import.meta.url), 'utf8');

for (const role of ["'property-owner'", "'property-manager'", "'leasing-agent'"]) {
  assert.ok(houseDomain.includes(role), `House registration authorized role missing: ${role}`);
}
assert.ok(houseDomain.includes("blockedRoles: ['customer']"), 'Customers must be blocked from house registration');
assert.ok(houseService.includes('canRegisterHouses(profile.role)'), 'Server must enforce house registration authorization');
assert.ok(housePage.includes('Customers cannot register houses'), 'Customer blocked message must exist');

for (const category of [
  'Single Room',
  'Bedsitter',
  'One Bedroom',
  'Two Bedroom',
  'Three Bedroom',
  'Four Bedroom',
  'Five Bedroom',
  'Mixed Residential Property'
]) {
  assert.ok(houseDomain.includes(category), `Missing residential category: ${category}`);
}
assert.ok(houseForm.includes('RESIDENTIAL_CATEGORIES.map'), 'Form must render residential category cards from the residential foundation');
assert.ok(houseDomain.includes('mixed-residential-property'), 'Mixed Residential Property id missing');
assert.ok(houseDomain.includes('getAllowedVacancyCategories'), 'Adaptive vacancy category helper missing');
assert.ok(houseForm.includes('Add another residential category'), 'Mixed residential vacancy addition missing');

for (const field of ['County', 'Town / City', 'Estate / Neighbourhood', 'Landmark (optional)']) {
  assert.ok(houseForm.includes(field), `Missing location field ${field}`);
}
assert.ok(houseForm.includes('datalist'), 'Location fields should be searchable');
assert.ok(houseForm.includes('KENYA_COUNTIES') && houseForm.includes('KNOWN_KENYA_LOCATION_TERMS'), 'Kenya searchable location support missing');

for (const field of ['Property Name (optional)', 'Number of Units', 'Number of Floors (if applicable)', 'Floor where vacant unit exists (if applicable)']) {
  assert.ok(houseForm.includes(field), `Missing property information field: ${field}`);
}
for (const field of ['Monthly Rent', 'Deposit Amount', 'One Month', 'Two Months', 'Three Months', 'Any other amount']) {
  assert.ok(houseDomain.includes(field) || houseForm.includes(field), `Missing rent/deposit field: ${field}`);
}
assert.ok(houseForm.includes('Do not restrict deposit values'), 'Deposit values must not be restricted');

for (const field of ['Are there currently vacant units?', 'Residential Category', 'Quantity Available']) {
  assert.ok(houseForm.includes(field), `Missing vacancy field: ${field}`);
}
for (const water of ['Daily Water', 'Water Available on Specific Days', 'Water Purchased Separately', 'No Water Connection', 'Included', 'Paid Separately']) {
  assert.ok(houseDomain.includes(water) || houseForm.includes(water), `Missing water option: ${water}`);
}
assert.ok(houseService.includes('waterHasConnection'), 'Water rent inclusion validation missing');

for (const place of ['Primary School', 'Secondary School', 'Hospital', 'Shopping Centre', 'Bus Stage', 'Market', 'Police Station']) {
  assert.ok(houseDomain.includes(place), `Missing nearby place: ${place}`);
}
assert.ok(houseForm.includes('NEARBY_PLACES.map'), 'Form must render nearby places from the residential foundation');

assert.ok(houseForm.includes('type="file"') && houseForm.includes('accept="image/*"'), 'Photo upload foundation missing');
assert.ok(houseForm.includes('Avoid exaggerated marketing language'), 'Description guidance missing');
assert.ok(houseDomain.includes('unitIdentifiers: string[]'), 'House vacancies must store real-world unit identifiers');
assert.ok(houseService.includes('unitIdentifiers'), 'House service must validate and preserve unit identifiers');
assert.ok(houseForm.includes('Real-world unit identifiers'), 'House form must collect real-world unit identifiers');
assert.ok(houseForm.includes('exactly as it appears'), 'House unit identifier wording must preserve actual property identifiers');
assert.ok(houseDomain.includes('electricity: ElectricityInformationInput'), 'Registration must inherit platform-wide electricity information');
assert.ok(houseService.includes('electricity'), 'Service must validate and preserve electricity information');
assert.ok(houseForm.includes('Is electricity available?'), 'Form must collect electricity availability');
assert.ok(houseForm.includes('How is electricity billed?'), 'Form must collect electricity billing');
assert.ok(houseForm.includes('Power availability notes'), 'Form must collect power availability notes');
assert.ok(houseForm.includes('Save as Draft'), 'Save draft missing');
assert.ok(houseForm.includes('Continue Later'), 'Continue later missing');
assert.ok(houseForm.includes('Submit when ready'), 'Submit action missing');
assert.ok(houseDomain.includes('Your residential property has been successfully registered.'), 'Success message missing');
assert.ok(houseService.includes('duplicateCandidateIds'), 'Duplicate detection foundation missing');
assert.ok(houseService.includes('logical-consistency-review'), 'Logical consistency validation foundation missing');
assert.ok(houseService.includes('registerPropertyFoundation'), 'House registration must build on Property Registration Foundation');
assert.ok(foundationSource.includes('houseRegistration: HOUSE_REGISTRATION_FOUNDATION'), 'Foundation snapshot must include house registration');
assert.ok(dashboardShell.includes('/properties/register/house'), 'Dashboard must link to house registration');
assert.ok(propertyForm.includes('Continue to House Registration'), 'Property foundation House card must connect to House Registration');

console.log('PataSpace house registration checks passed.');

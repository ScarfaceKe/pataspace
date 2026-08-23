import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const officeDomain = readFileSync(new URL('../src/domain/office-registration.ts', import.meta.url), 'utf8');
const officeService = readFileSync(new URL('../src/server/offices/service.ts', import.meta.url), 'utf8');
const officeForm = readFileSync(new URL('../src/components/offices/OfficeRegistrationForm.tsx', import.meta.url), 'utf8');
const officePage = readFileSync(new URL('../app/properties/register/office/page.tsx', import.meta.url), 'utf8');
const foundationSource = readFileSync(new URL('../src/lib/foundation.ts', import.meta.url), 'utf8');
const propertyForm = readFileSync(new URL('../src/components/properties/PropertyRegistrationForm.tsx', import.meta.url), 'utf8');
const dashboardShell = readFileSync(new URL('../src/components/dashboard/DashboardShell.tsx', import.meta.url), 'utf8');

for (const role of ["'property-owner'", "'property-manager'", "'leasing-agent'"]) assert.ok(officeDomain.includes(role), `Office registration role missing: ${role}`);
assert.ok(officeDomain.includes("blockedRoles: ['customer']"), 'Customers must be blocked');
assert.ok(officeService.includes('canRegisterOffices(profile.role)'), 'Server must enforce authorization');
assert.ok(officePage.includes('Customers cannot register offices'), 'Customer blocked page missing');

assert.ok(officeForm.includes('What type of office space are you registering?'), 'Office type question missing');
assert.ok(officeForm.includes('OFFICE_TYPES.map'), 'Office type cards missing');
assert.ok(officeForm.includes('datalist'), 'Searchable location fields missing');
assert.ok(officeForm.includes('KENYA_COUNTIES') && officeForm.includes('KNOWN_KENYA_LOCATION_TERMS'), 'Kenya searchable locations missing');

for (const road of ['Facing the Main Road', 'Along the Main Road', 'Facing an Inner Road', 'Along an Inner Road', 'Inside an Office Building', 'Inside a Commercial Complex', 'Inside an Estate', 'Other']) {
  assert.ok(officeDomain.includes(road), `Missing road visibility: ${road}`);
}
assert.ok(officeForm.includes('Where is the office located?'), 'Road visibility question missing');

for (const field of ['Office Name (optional)', 'Number of Office Units', 'Number of Floors (if applicable)', 'Floor where vacant office exists (if applicable)']) assert.ok(officeForm.includes(field), `Missing office field ${field}`);
for (const field of ['Monthly Rent', 'Deposit Amount', 'One Month', 'Two Months', 'Three Months', 'Any custom deposit amount']) assert.ok(officeDomain.includes(field) || officeForm.includes(field), `Missing rent/deposit ${field}`);
assert.ok(officeForm.includes('Do not restrict deposit values'), 'Deposit values must not be restricted');

for (const field of ['Are there currently vacant office units?', 'Quantity Available', 'Real-world vacant office identifiers']) assert.ok(officeForm.includes(field), `Missing vacancy field ${field}`);
assert.ok(officeDomain.includes('unitIdentifiers: string[]'), 'Vacant Unit Identification must be inherited');
assert.ok(officeService.includes('unitIdentifiers'), 'Office service must preserve unit identifiers');
assert.ok(officeForm.includes('exactly as it appears'), 'Unit identifier wording must preserve real-world identifiers');

for (const water of ['Daily Water', 'Water Available on Specific Days', 'Water Purchased Separately', 'No Water Connection', 'Included', 'Paid Separately']) assert.ok(officeDomain.includes(water) || officeForm.includes(water), `Missing water option ${water}`);
assert.ok(officeService.includes('officeWaterHasConnection'), 'Water inclusion validation missing');

for (const place of ['Bus Stage', 'Main Road', 'Shopping Centre', 'Bank', 'Hospital']) assert.ok(officeDomain.includes(place), `Missing nearby place ${place}`);
assert.ok(officeForm.includes('OFFICE_NEARBY_PLACES.map'), 'Nearby places UI missing');

for (const photo of ['Front of the building', 'Office entrance', 'Office interior', 'Building frontage', 'Gate where applicable', 'Parking area if applicable', 'Shared reception or common areas if applicable', 'Surrounding environment']) assert.ok(officeDomain.includes(photo), `Missing photo guidance ${photo}`);
assert.ok(officeForm.includes('type="file"') && officeForm.includes('accept="image/*"'), 'Photo uploads missing');
assert.ok(officeForm.includes('Avoid exaggerated marketing language'), 'Description guidance missing');

assert.ok(officeDomain.includes('electricity: ElectricityInformationInput'), 'Registration must inherit platform-wide electricity information');
assert.ok(officeService.includes('electricity'), 'Service must validate and preserve electricity information');
assert.ok(officeForm.includes('Is electricity available?'), 'Form must collect electricity availability');
assert.ok(officeForm.includes('How is electricity billed?'), 'Form must collect electricity billing');
assert.ok(officeForm.includes('Power availability notes'), 'Form must collect power availability notes');
assert.ok(officeForm.includes('Save as Draft'), 'Save as Draft missing');
assert.ok(officeForm.includes('Continue Later'), 'Continue Later missing');
assert.ok(officeForm.includes('Submit Registration'), 'Submit Registration missing');
assert.ok(officeDomain.includes('Your office property has been successfully registered.'), 'Success message missing');
assert.ok(officeService.includes('duplicateCandidateIds'), 'Duplicate detection missing');
assert.ok(officeService.includes('logical-consistency-review'), 'Logical consistency review missing');
assert.ok(officeService.includes('registerPropertyFoundation'), 'Must build on Property Registration Foundation');
assert.ok(foundationSource.includes('officeRegistration: OFFICE_REGISTRATION_FOUNDATION'), 'Foundation snapshot missing office registration');
assert.ok(propertyForm.includes('Continue to Office Registration'), 'Property foundation Office card must connect');
assert.ok(dashboardShell.includes('/properties/register/office'), 'Dashboard must link to office registration');

console.log('PataSpace office registration checks passed.');

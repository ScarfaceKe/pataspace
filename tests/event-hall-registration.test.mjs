import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const hallDomain = readFileSync(new URL('../src/domain/event-hall-registration.ts', import.meta.url), 'utf8');
const hallService = readFileSync(new URL('../src/server/event-halls/service.ts', import.meta.url), 'utf8');
const hallForm = readFileSync(new URL('../src/components/event-halls/EventHallRegistrationForm.tsx', import.meta.url), 'utf8');
const hallPage = readFileSync(new URL('../app/properties/register/event-hall/page.tsx', import.meta.url), 'utf8');
const foundationSource = readFileSync(new URL('../src/lib/foundation.ts', import.meta.url), 'utf8');
const propertyForm = readFileSync(new URL('../src/components/properties/PropertyRegistrationForm.tsx', import.meta.url), 'utf8');
const dashboardShell = readFileSync(new URL('../src/components/dashboard/DashboardShell.tsx', import.meta.url), 'utf8');

for (const role of ["'property-owner'", "'property-manager'", "'leasing-agent'"]) assert.ok(hallDomain.includes(role), `Event hall role missing: ${role}`);
assert.ok(hallDomain.includes("blockedRoles: ['customer']"), 'Customers must be blocked');
assert.ok(hallPage.includes('Customers cannot register event halls'), 'Customer blocked page missing');
assert.ok(hallService.includes('canRegisterEventHalls(profile.role)'), 'Server must enforce authorization');
assert.ok(hallDomain.includes('inheritsRegistrationUserExperienceStandard: true'), 'Must inherit Registration UX Standard');
assert.ok(hallDomain.includes('hallMatchExcludesWaterInformation: true'), 'Event halls must exclude Water Information');
assert.ok(hallDomain.includes('hallMatchExcludesElectricityInformation: true'), 'Event halls must exclude Electricity Information');
assert.ok(hallDomain.includes('inheritsVacantUnitIdentification: true'), 'Must inherit Vacant Unit Identification');

for (const screen of ['Hall Information', 'Property Location', 'Where is the event hall located?', 'Hall Details', 'Availability', 'Pricing', 'Nearby Places', 'Property Photos', 'Property Description']) {
  assert.ok(hallForm.includes(screen), `Missing screen: ${screen}`);
}
assert.ok(hallForm.includes('progress-steps'), 'Progress indicator missing');
assert.ok(hallForm.includes('datalist'), 'Searchable location fields missing');
assert.ok(hallForm.includes('KENYA_COUNTIES') && hallForm.includes('KNOWN_KENYA_LOCATION_TERMS'), 'Kenya searchable locations missing');

for (const road of ['Facing the Main Road', 'Along the Main Road', 'Facing an Inner Road', 'Along an Inner Road', 'Inside a Commercial Building', 'Inside a Shopping Complex', 'Inside an Estate', 'Other']) assert.ok(hallDomain.includes(road), `Missing road visibility ${road}`);
for (const field of ['Number of Halls available', 'Hall Capacity (where applicable)', 'Real-world hall identifiers']) assert.ok(hallForm.includes(field), `Missing hall detail ${field}`);
assert.ok(hallForm.includes('exactly as it appears'), 'Hall identifiers must preserve real-world identifiers');
assert.ok(hallService.includes('unitIdentifiers: cleanHallIds'), 'Property foundation must receive hall identifiers');

assert.ok(hallForm.includes('Is this hall currently available for bookings?'), 'Availability question missing');
assert.ok(hallForm.includes('Hall Booking Price'), 'Booking price missing');
assert.ok(hallForm.includes('Additional pricing arrangements'), 'Additional pricing arrangements missing');
assert.ok(!hallForm.includes('Water Information'), 'Event Hall Registration must not show Water Information');
assert.ok(!hallForm.includes('Electricity Information'), 'Event Hall Registration must not show Electricity Information');
assert.ok(!hallForm.includes('Is electricity available?'), 'Event Hall Registration must not ask about electricity');
assert.ok(!hallDomain.includes('HallWaterInformationInput'), 'Event Hall domain must not define hall water input');
for (const place of ['Main Road', 'Bus Stage', 'Shopping Centre', 'Hotel', 'Hospital']) assert.ok(hallDomain.includes(place), `Missing nearby place ${place}`);
for (const photo of ['Front of the property', 'Hall entrance', 'Hall interior', 'Stage if available', 'Seating arrangement', 'Gate', 'Parking area', 'Surrounding environment']) assert.ok(hallDomain.includes(photo), `Missing photo guidance ${photo}`);
assert.ok(hallForm.includes('type="file"') && hallForm.includes('accept="image/*"'), 'Photo uploads missing');
assert.ok(hallForm.includes('Avoid exaggerated marketing language'), 'Description guidance missing');
assert.ok(hallForm.includes('Save as Draft'), 'Save as Draft missing');
assert.ok(hallForm.includes('Continue Later'), 'Continue Later missing');
assert.ok(hallForm.includes('Submit Registration'), 'Submit Registration missing');
assert.ok(hallDomain.includes('Your event hall has been successfully registered.'), 'Success message missing');
assert.ok(hallService.includes('duplicateCandidateIds'), 'Duplicate detection missing');
assert.ok(hallService.includes('logical-consistency-review'), 'Logical consistency review missing');
assert.ok(hallService.includes('registerPropertyFoundation'), 'Must build on Property Registration Foundation');
assert.ok(foundationSource.includes('eventHallRegistration: EVENT_HALL_REGISTRATION_FOUNDATION'), 'Foundation snapshot missing event hall registration');
assert.ok(propertyForm.includes('Continue to Event Hall Registration'), 'Property foundation Event Hall card must connect');
assert.ok(dashboardShell.includes('/properties/register/event-hall'), 'Dashboard must link to event hall registration');

console.log('PataSpace event hall registration checks passed.');

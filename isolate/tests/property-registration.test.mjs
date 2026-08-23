import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const propertyDomain = readFileSync(new URL('../src/domain/property-registration.ts', import.meta.url), 'utf8');
const locationIntelligence = readFileSync(new URL('../src/domain/kenya-location-intelligence.ts', import.meta.url), 'utf8');
const propertyService = readFileSync(new URL('../src/server/properties/service.ts', import.meta.url), 'utf8');
const propertyForm = readFileSync(new URL('../src/components/properties/PropertyRegistrationForm.tsx', import.meta.url), 'utf8');
const propertyPage = readFileSync(new URL('../app/properties/register/page.tsx', import.meta.url), 'utf8');
const dashboardShell = readFileSync(new URL('../src/components/dashboard/DashboardShell.tsx', import.meta.url), 'utf8');
const foundationSource = readFileSync(new URL('../src/lib/foundation.ts', import.meta.url), 'utf8');

for (const role of ["'property-owner'", "'property-manager'", "'leasing-agent'"]) {
  assert.ok(propertyDomain.includes(role), `Authorized role missing: ${role}`);
}
assert.ok(propertyDomain.includes("blockedRoles: ['customer']"), 'Customers must remain blocked from property registration');
assert.ok(
  propertyDomain.includes("role === 'property-owner' || role === 'property-manager' || role === 'leasing-agent'"),
  'Owners, managers and leasing agents may register properties'
);
assert.ok(propertyDomain.includes('Register properties on behalf of the Property Owner'), 'Leasing Agent responsibility missing');
assert.ok(propertyDomain.includes('Assign or link a Leasing Agent'), 'Owner leasing agent linking responsibility missing');
assert.ok(propertyDomain.includes('Manage vacancies and perform daily vacancy confirmations'), 'Manager vacancy responsibility missing');
assert.ok(propertyService.includes('canRegisterProperties(profile.role)'), 'Server registration must enforce role authorization');
assert.ok(propertyPage.includes('canRegisterProperties(profile.role)'), 'Property registration page must check authorization');

for (const label of ['House', 'Shop', 'Office', 'Event Hall']) {
  assert.ok(propertyDomain.includes(`label: '${label}'`), `Missing property registration category ${label}`);
}
for (const icon of ['🏠', '🏪', '🏢', '🎉']) {
  assert.ok(propertyDomain.includes(icon), `Missing category icon ${icon}`);
}

for (const field of ['County', 'Town / City', 'Estate / Area / Neighbourhood', 'Street (if applicable)', 'Landmark (optional)']) {
  assert.ok(propertyDomain.includes(field), `Missing location field: ${field}`);
}
assert.ok(
  propertyDomain.includes('Tell us anything else that will help people find the right home, shop, office or hall.'),
  'Large description label must be exact'
);
assert.ok(propertyForm.includes('textarea') && propertyForm.includes('large-description-field'), 'Form must include large description text boxes');

assert.ok(locationIntelligence.includes('KENYA_COUNTIES'), 'Kenya counties must support location intelligence');
assert.ok(locationIntelligence.includes('quietlyFlagForReview'), 'Unrecognised locations must be quietly flagged');
assert.ok(locationIntelligence.includes('identify-new-location'), 'AI Admin Assistant location action must be prepared');
assert.ok(!propertyForm.includes("We don't recognise this area"), 'User must not see unrecognised-area message');
assert.ok(!propertyForm.includes("We don’t recognise this area"), 'User must not see unrecognised-area message');

for (const status of ['draft', 'active', 'waiting-for-verification', 'occupied']) {
  assert.ok(propertyDomain.includes(`'${status}'`), `Missing property status ${status}`);
}
assert.ok(propertyDomain.includes('createVacancyVerificationFoundation'), 'Vacancy verification foundation must exist');
for (const future of [
  'preparedForDailyConfirmations',
  'preparedForGracePeriods',
  'preparedForWaitingForVerification',
  'preparedForSearchPriority',
  'preparedForPlatformHealthMonitor'
]) {
  assert.ok(propertyDomain.includes(future), `Missing vacancy verification preparation: ${future}`);
}

assert.ok(propertyForm.includes('type="file"') && propertyForm.includes('accept="image/*"'), 'Photo upload foundation must be present');
assert.ok(propertyDomain.includes('customerAccessControlStandard'), 'Customer Access Control Standard missing');
assert.ok(propertyDomain.includes('CUSTOMER_ACCESS_CONTROL_STANDARD'), 'Property registration must inherit customer access control standard');
assert.ok(propertyDomain.includes('registrationUserExperienceStandard'), 'Registration UX standard missing');
assert.ok(propertyDomain.includes('intelligent-guided-experience-not-traditional-form'), 'Registration must be an intelligent guided experience, not a traditional form');
for (const pattern of ['Toggle buttons', 'Selectable chips', 'Option cards', 'Multi-select choices', 'Yes / No switches']) {
  assert.ok(propertyDomain.includes(pattern), `Missing guided UX interaction pattern: ${pattern}`);
}
assert.ok(propertyDomain.includes('Questions should appear only when they become relevant'), 'Adaptive question behaviour must be encoded');
assert.ok(propertyDomain.includes('Text inputOnlyWhenNeededFor') || propertyDomain.includes('textInputOnlyWhenNeededFor'), 'Text input restriction must be encoded');
assert.ok(propertyDomain.includes('electricityInformation'), 'Electricity Information standard missing');
assert.ok(propertyDomain.includes('mandatory: true'), 'Electricity availability must be mandatory');
assert.ok(propertyDomain.includes("appliesTo: ['Houses', 'Shops', 'Offices']"), 'Electricity must apply to Houses, Shops and Offices');
assert.ok(propertyDomain.includes("excludes: ['Event Halls']"), 'Electricity must exclude Event Halls');
for (const option of ['Individual Meter', 'Shared Meter', 'Included in Rent', 'Other']) {
  assert.ok(propertyDomain.includes(option), `Missing electricity billing option: ${option}`);
}
assert.ok(propertyService.includes('validateElectricityInformation'), 'Property service must validate electricity information');
assert.ok(propertyForm.includes('Is electricity available?'), 'Property form must collect electricity availability');
assert.ok(propertyForm.includes('How is electricity billed?'), 'Property form must collect electricity billing');
assert.ok(propertyForm.includes('Power availability notes'), 'Property form must collect power availability notes');
assert.ok(propertyDomain.includes('vacantUnitIdentification'), 'Vacant unit identification standard missing');
assert.ok(propertyDomain.includes('platformGeneratesIdentifiers: false'), 'Platform must not generate unit identifiers');
for (const example of ['A1', 'Shop 14', 'Office 203', 'Hall A', 'Stall 3', 'Unit 12', 'Room 7']) {
  assert.ok(propertyDomain.includes(example), `Missing vacant unit identifier example: ${example}`);
}
assert.ok(propertyService.includes('unitIdentifiers'), 'Property registration service must preserve unit identifiers');
assert.ok(propertyForm.includes('Real-world vacant unit identifiers'), 'Property registration form must collect real-world unit identifiers');
assert.ok(propertyForm.includes('exactly as it appears'), 'Unit identifier instructions must preserve real-world wording');
assert.ok(propertyForm.includes('Save as Draft'), 'Save as Draft action missing');
assert.ok(propertyForm.includes('Submit Registration'), 'Submit Registration action missing');
assert.ok(propertyForm.includes('Property successfully registered.'), 'Completion success message missing');
assert.ok(propertyService.includes('duplicateCandidateIds'), 'Duplicate property detection foundation missing');
assert.ok(propertyService.includes('obvious-mistake-review'), 'Obvious mistake review foundation missing');
assert.ok(propertyService.includes('logical-consistency-review'), 'Logical consistency review foundation missing');
assert.ok(propertyForm.includes('I am the Leasing Agent'), 'Leasing Agent relationship option missing');
assert.ok(propertyForm.includes('Link the Property Owner'), 'Property owner linking UI missing');
assert.ok(propertyForm.includes('Assign or link a Property Manager'), 'Property manager linking UI missing');
assert.ok(propertyForm.includes('Assign or link a Leasing Agent'), 'Leasing agent linking UI missing');
assert.ok(dashboardShell.includes('/properties/register'), 'Authorized role dashboards should link to property registration');
assert.ok(foundationSource.includes('propertyRegistration: PROPERTY_REGISTRATION_FOUNDATION'), 'Foundation snapshot must include property registration');

console.log('PataSpace property registration checks passed.');

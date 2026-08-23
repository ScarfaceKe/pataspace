import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const domain = readFileSync(new URL('../src/domain/unified-platform.ts', import.meta.url), 'utf8');
const geoService = readFileSync(new URL('../src/server/unified-platform/geography-service.ts', import.meta.url), 'utf8');
const propertyService = readFileSync(new URL('../src/server/properties/service.ts', import.meta.url), 'utf8');
const foundation = readFileSync(new URL('../src/lib/foundation.ts', import.meta.url), 'utf8');
const customerHome = readFileSync(new URL('../src/components/CustomerHomeStart.tsx', import.meta.url), 'utf8');
const houseMatch = readFileSync(new URL('../src/components/match/HouseMatchSearch.tsx', import.meta.url), 'utf8');
const shopMatch = readFileSync(new URL('../src/components/match/ShopMatchSearch.tsx', import.meta.url), 'utf8');

for (const system of ['match-intelligence','search-intelligence','geographic-intelligence','verification-intelligence','fraud-detection','customer-support-intelligence','moderator-intelligence','finance-intelligence','notification-intelligence','business-opportunity-intelligence','executive-intelligence','platform-health-intelligence']) {
  assert.ok(domain.includes(`'${system}'`), `Missing shared intelligence system ${system}`);
}
for (const item of ['Customer searches','Saved searches','Property registrations','Property verification','Viewing outcomes','Search success','Failed searches','Platform analytics','County performance','Business goals','Founder-approved decisions']) {
  assert.ok(domain.includes(item), `Missing shared knowledge source ${item}`);
}
for (const geo of ['Counties','Cities','Towns','Estates','Neighbourhoods','Trading Centres','Other recognised localities']) assert.ok(domain.includes(geo), `Missing geography type ${geo}`);
assert.ok(domain.includes('neverRejectLegitimateRegistrationForUnknownLocation: true'), 'Unknown legitimate locations must not be rejected');
assert.ok(domain.includes('addsValidatedLocationsToDatabase: true'), 'Validated locations must be added');
for (const founder of ['founderMayAddLocations','founderMayEditLocations','founderMayRenameLocations','founderMayCorrectSpelling','founderMayMergeDuplicateLocations','founderMayRemoveInvalidLocations','founderDecisionsOverrideAutomatedUpdates']) assert.ok(domain.includes(`${founder}: true`), `Missing Founder geographic authority ${founder}`);
assert.ok(domain.includes('noAutomatedSystemOverridesFounderDecision: true'), 'No automated system may override Founder');
assert.ok(domain.includes("customerFacingTechnologyTermsForbidden: ['AI', 'Artificial Intelligence', 'Invisible Intelligence']"), 'Technology visibility standard missing');
assert.ok(domain.includes('appliesToNormalCustomerExperience: true'), 'Technology visibility must apply to normal customer experience');
assert.ok(geoService.includes('learnGeographicLocation'), 'Geographic learning service missing');
assert.ok(geoService.includes('founderUpsertLocation'), 'Founder geographic management service missing');
assert.ok(propertyService.includes('learnGeographicLocation'), 'Property registration must feed geographic learning');
assert.ok(foundation.includes('unifiedPlatformIntelligence: UNIFIED_PLATFORM_INTELLIGENCE_FRAMEWORK'), 'Foundation snapshot must expose unified platform framework');
for (const component of [customerHome, houseMatch, shopMatch]) {
  assert.ok(!component.includes('AI Summary'), 'Normal customer UI must not expose AI Summary');
  assert.ok(!component.includes('AI Search Description'), 'Normal customer UI must not expose AI Search Description');
  assert.ok(!component.includes('Artificial Intelligence'), 'Normal customer UI must not expose Artificial Intelligence');
  assert.ok(!component.includes('Invisible Intelligence'), 'Normal customer UI must not expose Invisible Intelligence');
}

console.log('PataSpace unified platform framework checks passed.');

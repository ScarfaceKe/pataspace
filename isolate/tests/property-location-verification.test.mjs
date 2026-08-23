import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const domain = readFileSync(new URL('../src/domain/location-verification.ts', import.meta.url), 'utf8');
const propertyDomain = readFileSync(new URL('../src/domain/property-registration.ts', import.meta.url), 'utf8');
const component = readFileSync(new URL('../src/components/properties/PropertyLocationVerificationStep.tsx', import.meta.url), 'utf8');
const propertyForm = readFileSync(new URL('../src/components/properties/PropertyRegistrationForm.tsx', import.meta.url), 'utf8');
const forms = [
  readFileSync(new URL('../src/components/houses/HouseRegistrationForm.tsx', import.meta.url), 'utf8'),
  readFileSync(new URL('../src/components/shops/ShopRegistrationForm.tsx', import.meta.url), 'utf8'),
  readFileSync(new URL('../src/components/offices/OfficeRegistrationForm.tsx', import.meta.url), 'utf8'),
  readFileSync(new URL('../src/components/event-halls/EventHallRegistrationForm.tsx', import.meta.url), 'utf8')
].join('\n');
const service = readFileSync(new URL('../src/server/properties/service.ts', import.meta.url), 'utf8');
const migration = readFileSync(new URL('../supabase/migrations/0008_property_location_verification.sql', import.meta.url), 'utf8');

assert.ok(domain.includes('PropertyLocationVerification') && domain.includes('gpsAccuracyMeters'), 'Location verification domain must store coordinates and GPS accuracy');
assert.ok(propertyDomain.includes('verification?: PropertyLocationVerification'), 'Property location input must include verification metadata');
for (const phrase of ['Property Location Verification','I am standing at this property now','Use my current location','Your location accuracy is currently low','Property location verified successfully']) assert.ok(component.includes(phrase), `Location verification UI missing: ${phrase}`);
assert.ok(component.includes('navigator.geolocation') && component.includes('enableHighAccuracy: true'), 'Location capture must use high accuracy geolocation');
assert.ok(component.includes('reverse?format=jsonv2'), 'Reverse geocoding must be prepared');
assert.ok(component.includes('adjust(') && component.includes('map-placeholder'), 'Map marker adjustment UI must be implemented');
assert.ok(propertyForm.includes('PropertyLocationVerificationStep'), 'Generic property form must include location verification');
assert.ok((forms.match(/PropertyLocationVerificationStep/g) ?? []).length >= 4, 'All property-specific registration forms must include location verification');
assert.ok((forms.match(/verification: locationVerification/g) ?? []).length >= 4, 'All property-specific forms must submit location verification');
assert.ok(service.includes('verification: input.location.verification'), 'Property service must persist verification object with property location');
for (const column of ['location_latitude','location_longitude','location_gps_accuracy_meters','location_human_readable_address','location_verified','location_verification_mode']) assert.ok(migration.includes(column), `Migration missing ${column}`);
console.log('PataSpace property location verification checks passed.');

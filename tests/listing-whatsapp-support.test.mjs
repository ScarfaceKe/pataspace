import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const component = readFileSync(new URL('../src/components/support/ListingWhatsAppSupport.tsx', import.meta.url), 'utf8');
const generic = readFileSync(new URL('../src/components/properties/PropertyRegistrationForm.tsx', import.meta.url), 'utf8');
const house = readFileSync(new URL('../src/components/houses/HouseRegistrationForm.tsx', import.meta.url), 'utf8');
const shop = readFileSync(new URL('../src/components/shops/ShopRegistrationForm.tsx', import.meta.url), 'utf8');
const office = readFileSync(new URL('../src/components/offices/OfficeRegistrationForm.tsx', import.meta.url), 'utf8');
const hall = readFileSync(new URL('../src/components/event-halls/EventHallRegistrationForm.tsx', import.meta.url), 'utf8');
const dashboard = readFileSync(new URL('../src/components/dashboard/DashboardShell.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');

assert.ok(component.includes("'254740413458'"), 'Listing WhatsApp support must use the approved international-format support number');
assert.ok(!component.includes('0740413458'), 'Raw local phone number must not be publicly displayed in component text');
assert.ok(component.includes('https://wa.me/') && component.includes('encodeURIComponent'), 'Support link must open WhatsApp with encoded pre-filled message');
assert.ok(component.includes('Hello PataSpace Support, I need help with listing or managing a property on PataSpace. Please help me with my issue.'), 'General listing support message missing');
assert.ok(component.includes('I need help with the property location verification step'), 'Location contextual message missing');
assert.ok(component.includes('I need help completing my property listing'), 'Listing contextual message missing');
for (const source of [generic, house, shop, office, hall]) {
  assert.ok(source.includes('ListingWhatsAppSupport'), 'Every property listing workflow must show listing WhatsApp support');
  assert.ok(source.includes('context="listing"'), 'Property workflows must include general listing help');
  assert.ok(source.includes('context="location"'), 'Property workflows must include contextual location help');
}
assert.ok(dashboard.includes('canRegisterProperties(profile.role)') && dashboard.includes('ListingWhatsAppSupport context="dashboard"'), 'Listing support must appear only for authorized property dashboard roles');
assert.ok(css.includes('listing-whatsapp-support') && css.includes('listing-whatsapp-action'), 'Listing WhatsApp support must have mobile-friendly styling');
console.log('PataSpace listing WhatsApp support checks passed.');

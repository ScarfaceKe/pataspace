import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const categoriesSource = readFileSync(new URL('../src/domain/property-categories.ts', import.meta.url), 'utf8');
const platformSource = readFileSync(new URL('../src/domain/platform.ts', import.meta.url), 'utf8');
const rolesSource = readFileSync(new URL('../src/domain/roles.ts', import.meta.url), 'utf8');
const guidedSource = readFileSync(new URL('../src/domain/guided-interviews.ts', import.meta.url), 'utf8');
const locationsSource = readFileSync(new URL('../src/domain/locations.ts', import.meta.url), 'utf8');

for (const required of ['houses', 'shops', 'offices', 'event-halls']) {
  assert.ok(categoriesSource.includes(`id: '${required}'`), `Missing category ${required}`);
}

for (const forbidden of ['hotel', 'airbnb', 'sale']) {
  assert.ok(!categoriesSource.toLowerCase().includes(`id: '${forbidden}'`), `Forbidden category ${forbidden} found`);
}

assert.ok(platformSource.includes("countryCode: 'KE'"), 'Kenya country code must be fixed to KE');
assert.ok(platformSource.includes('structured-guided-interviews'), 'Guided interview policy must be present');
assert.ok(platformSource.includes('usersShouldFeelTheyAreChattingWithAi: false'), 'AI chat feeling must be disabled');

for (const role of ['customer', 'property-owner', 'property-manager', 'leasing-agent', 'platform-admin']) {
  assert.ok(rolesSource.includes(`id: '${role}'`), `Missing role ${role}`);
}

assert.ok(guidedSource.includes('openEndedAiChat: false'), 'Open-ended AI chat must not be enabled');
for (const location of ['Nairobi', 'Mombasa', 'Kisumu', 'Eldoret', 'Nakuru', 'Kitengela', 'Machakos', 'Thika', 'Naivasha', 'Nyeri', 'Embu', 'Meru', 'Kakamega', 'Kisii', 'Malindi', 'Nanyuki']) {
  assert.ok(locationsSource.includes(location), `Missing foundation location ${location}`);
}

console.log('PataSpace foundation checks passed.');

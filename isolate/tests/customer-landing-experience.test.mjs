import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const entry = readFileSync(new URL('../src/components/EntryPointCards.tsx', import.meta.url), 'utf8');
const customerHome = readFileSync(new URL('../src/components/CustomerHomeStart.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');
const matchComponents = [
  readFileSync(new URL('../src/components/match/HouseMatchSearch.tsx', import.meta.url), 'utf8'),
  readFileSync(new URL('../src/components/match/ShopMatchSearch.tsx', import.meta.url), 'utf8'),
  readFileSync(new URL('../src/components/match/OfficeMatchSearch.tsx', import.meta.url), 'utf8'),
  readFileSync(new URL('../src/components/match/EventHallMatchSearch.tsx', import.meta.url), 'utf8')
].join('\n');

assert.ok(page.includes('Begin guided search'), 'Landing hero must include prominent guided search CTA');
assert.ok(page.includes('helps Kenyans quickly find houses, shops, offices, and event halls'), 'Landing hero must immediately explain PataSpace');
assert.ok(page.includes('trust-chip-row') || page.includes('hero-trust-chips'), 'Landing hero must quietly communicate trust');
assert.ok(entry.includes('WORKFLOW_ROUTES') && entry.includes('/match/house') && entry.includes('/match/shop') && entry.includes('/match/office') && entry.includes('/match/event-hall'), 'Entry choices must launch approved match workflows');
assert.ok(entry.includes('What would you like to find?'), 'Landing entry panel must keep search first');
assert.ok(customerHome.includes('customer-choice-card'), 'Customer home choices must use premium mobile app cards');
assert.ok(customerHome.includes('Open My Dashboard'), 'Dashboard remains accessible without becoming the first screen');
for (const label of ['🏠 Find a Home', '🏪 Find a Shop', '🏢 Find an Office', '🎉 Find an Event Hall']) {
  assert.ok(customerHome.includes(label) || readFileSync(new URL('../src/domain/customer-home.ts', import.meta.url), 'utf8').includes(label), `Customer home missing ${label}`);
}
for (const token of ['property-result-card', 'property-image-frame', 'property-location', 'property-price', 'match-score']) {
  assert.ok(matchComponents.includes(token), `Modern property cards missing ${token}`);
}
assert.ok(matchComponents.includes('Contact details, WhatsApp') && matchComponents.includes('unlock after access is granted'), 'Locked contact rules must remain visible and preserved');
for (const token of ['customer-start-card', 'search-first-panel', 'property-result-card', 'match-score']) {
  assert.ok(css.includes(token), `Customer visual CSS missing ${token}`);
}
assert.ok(css.includes('trust-chip-row') || css.includes('hero-trust-chips'), 'Customer visual CSS must have trust chip styles');
assert.ok(css.includes('customer-dashboard-strip'), 'Customer dashboard strip CSS must exist');
console.log('PataSpace customer landing experience checks passed.');

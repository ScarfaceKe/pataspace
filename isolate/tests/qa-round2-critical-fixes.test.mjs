import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');
const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
const hook = readFileSync(new URL('../src/components/match/usePersistentMatchState.ts', import.meta.url), 'utf8');
const house = readFileSync(new URL('../src/components/match/HouseMatchSearch.tsx', import.meta.url), 'utf8');
const shop = readFileSync(new URL('../src/components/match/ShopMatchSearch.tsx', import.meta.url), 'utf8');
const office = readFileSync(new URL('../src/components/match/OfficeMatchSearch.tsx', import.meta.url), 'utf8');
const hall = readFileSync(new URL('../src/components/match/EventHallMatchSearch.tsx', import.meta.url), 'utf8');
const register = readFileSync(new URL('../src/components/auth/RegisterForm.tsx', import.meta.url), 'utf8');
const login = readFileSync(new URL('../src/components/auth/LoginForm.tsx', import.meta.url), 'utf8');
const houseDomain = readFileSync(new URL('../src/domain/house-registration.ts', import.meta.url), 'utf8');

assert.ok(hook.includes('sessionStorage') && hook.includes('usePersistentMatchState'), 'Search forms must persist state during interaction');
for (const source of [house, shop, office, hall]) {
  assert.ok(source.includes('usePersistentMatchState'), 'Every match form must preserve entered values');
  assert.ok(source.includes('match-progress') && source.includes('Review and submit'), 'Every match form must be a wizard');
  assert.ok(source.includes('Tell us your maximum') || source.includes('Maximum Deposit <small>(optional)</small>'), 'Budget wording must be useful and KES-only');
}
for (const label of ['Single Room','Bedsitter','One Bedroom','Two Bedroom','Three Bedroom','Four Bedroom','Maisonette','Bungalow']) assert.ok(houseDomain.includes(label), `House type missing: ${label}`);
assert.ok(register.includes('Continue with Google') && register.includes('Business / Property Professional') && !register.includes('Platform Admin'), 'Registration must be Kenya-first and hide Platform Admin');
assert.ok(login.includes('Continue with Google') && login.includes('phoneNumber'), 'Login must support Google option and phone number password login');
assert.ok(!layout.includes('PremiumMotion'), 'Global motion observer must be disabled to avoid scroll flicker');
assert.ok(css.includes('content-visibility: visible'), 'Scroll stability CSS must disable content-visibility flicker');
assert.ok(!page.includes('USER_ROLES') && !page.includes('Platform Admin'), 'Landing page must not expose Platform Admin');
assert.ok(page.includes('site-footer') && page.includes('© {new Date().getFullYear()} PataSpace. All rights reserved.'), 'Landing page must have professional auto-year footer');
assert.ok(css.includes('font-size: clamp(1.35rem') && css.includes('width: clamp(48px'), 'Branding must be prominent');
console.log('PataSpace QA Round 2 critical fixes checks passed.');

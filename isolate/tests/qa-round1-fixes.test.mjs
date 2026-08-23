import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');
const register = readFileSync(new URL('../src/components/auth/RegisterForm.tsx', import.meta.url), 'utf8');
const authDomain = readFileSync(new URL('../src/domain/auth.ts', import.meta.url), 'utf8');
const motion = readFileSync(new URL('../src/components/system/PremiumMotion.tsx', import.meta.url), 'utf8');
const matchComponents = [
  readFileSync(new URL('../src/components/match/HouseMatchSearch.tsx', import.meta.url), 'utf8'),
  readFileSync(new URL('../src/components/match/ShopMatchSearch.tsx', import.meta.url), 'utf8'),
  readFileSync(new URL('../src/components/match/OfficeMatchSearch.tsx', import.meta.url), 'utf8'),
  readFileSync(new URL('../src/components/match/EventHallMatchSearch.tsx', import.meta.url), 'utf8')
].join('\n');

assert.ok(css.includes('font-size: clamp(1.35rem') && css.includes('width: clamp(48px'), 'Brand logo/name must be larger and premium');
assert.ok(register.includes('Customer') && register.includes('Business / Property Professional'), 'Registration must first show Customer and Business / Property Professional');
assert.ok(register.includes('Property Owner') && register.includes('Property Manager') && register.includes('Leasing Agent'), 'Business registration must expose approved professional roles');
assert.ok(!register.includes('Platform Admin'), 'Platform Admin must not appear in public registration');
assert.ok(authDomain.includes('platformAdminPublicRegistration: false'), 'Platform admin public registration must remain disabled');
assert.ok(register.includes('continueStep') && register.includes('Continue with Google'), 'Registration flow must have working continue flow and Google option support');
for (const label of ['Step {searchStep} of 4', 'match-progress', 'wizard-controls', 'Review and submit']) assert.ok(matchComponents.includes(label), `Match forms must be multi-step and include ${label}`);
assert.ok((matchComponents.match(/Maximum Deposit <small>\(optional\)<\/small>/g) ?? []).length >= 3, 'Maximum Deposit must be clearly optional in property match forms');
assert.ok(css.includes('content-visibility: visible') && css.includes("opacity: 1;\n  transform: translate3d(0, 0, 0) scale(1);"), 'Scrolling flicker mitigations must keep content stable while scrolling');
assert.ok(motion.includes('IntersectionObserver'), 'Motion infrastructure remains available without causing scroll flicker');
console.log('PataSpace QA Round 1 critical fixes checks passed.');

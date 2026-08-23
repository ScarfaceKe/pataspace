import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');
const motion = readFileSync(new URL('../src/components/system/PremiumMotion.tsx', import.meta.url), 'utf8');
const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
const template = readFileSync(new URL('../app/template.tsx', import.meta.url), 'utf8');

assert.ok(!layout.includes('PremiumMotion'), 'PremiumMotion must not be mounted globally until scroll flicker QA is fully cleared');
assert.ok(motion.includes('IntersectionObserver'), 'Scroll entrance animation must use IntersectionObserver');
assert.ok(motion.includes('MutationObserver'), 'Dynamic content such as search results must be motion-enhanced');
assert.ok(motion.includes('prefers-reduced-motion: reduce'), 'Motion system must respect reduced motion');
assert.ok(motion.includes('saveData') && motion.includes('hardwareConcurrency'), 'Motion system must reduce intensity on constrained devices');
assert.ok(template.includes('page-transition-shell'), 'Page transitions must be applied through app template');
for (const token of [
  'page-enter',
  '[data-motion-reveal',
  'motion-visible',
  'property-result-card:hover',
  'button-loading-sheen',
  'message-enter',
  'status-sheen',
  'nav-drop',
  'result-card-enter',
  '@media (prefers-reduced-motion: reduce)'
]) {
  assert.ok(css.includes(token), `Premium motion CSS missing ${token}`);
}
assert.ok(css.includes('transform: translate3d') && css.includes('will-change'), 'Animations must use hardware-friendly transforms');
console.log('PataSpace premium motion design checks passed.');

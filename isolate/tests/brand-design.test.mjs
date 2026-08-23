import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const brandSource = readFileSync(new URL('../src/domain/brand.ts', import.meta.url), 'utf8');
const designSource = readFileSync(new URL('../src/domain/design-system.ts', import.meta.url), 'utf8');
const pageSource = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const entryComponentSource = readFileSync(new URL('../src/components/EntryPointCards.tsx', import.meta.url), 'utf8');
const guidedSource = readFileSync(new URL('../src/domain/guided-interviews.ts', import.meta.url), 'utf8');
const foundationSource = readFileSync(new URL('../src/lib/foundation.ts', import.meta.url), 'utf8');

assert.ok(brandSource.includes("officialName: 'PataSpace'"), 'Official brand name must be PataSpace');
assert.ok(
  brandSource.includes("brandPosition: \"Kenya's smart rental discovery platform\""),
  'Brand position must be encoded exactly'
);

const requiredLabels = ['Find My Home', 'Find My Shop', 'Find My Office', 'Find My Hall'];
const requiredIcons = ['🏠', '🏪', '🏢', '🎉'];
const requiredWorkflowNames = ['House Match', 'Shop Match', 'Office Match', 'Hall Match'];

for (const value of [...requiredLabels, ...requiredIcons, ...requiredWorkflowNames]) {
  assert.ok(brandSource.includes(value), `Missing official entry point value: ${value}`);
}
assert.ok(
  entryComponentSource.includes('OFFICIAL_ENTRY_POINTS.map'),
  'Entry point component must render all official entry points from the brand standard'
);
assert.ok(entryComponentSource.includes('aria-live="polite"'), 'Entry point feedback must be announced politely');

const entryIdCount = (brandSource.match(/id: 'find-my-/g) ?? []).length;
assert.equal(entryIdCount, 4, 'There must be exactly four official entry points');
assert.ok(pageSource.includes('EntryPointCards') || pageSource.includes('HeroEntryCards'), 'Primary customer screen must render official entry cards');

for (const standard of ['Clean', 'Modern', 'Spacious', 'Fast', 'Easy to scan', 'Mobile-first', 'Responsive', 'Accessible']) {
  assert.ok(designSource.includes(standard), `Missing global design standard: ${standard}`);
}

for (const interaction of ['Cards', 'Toggles', 'Radio buttons', 'Dropdowns', 'Search fields', 'Simple selection interfaces']) {
  assert.ok(designSource.includes(interaction), `Missing interaction standard: ${interaction}`);
}

assert.ok(designSource.includes('Use sliders only where previously approved'), 'Slider restriction must be present');
assert.ok(designSource.includes('technicalErrorsVisibleToUsers: false'), 'Technical errors must not be user visible');
assert.ok(designSource.includes('immediateFeedbackFor'), 'Immediate feedback standards must be encoded');
assert.ok(designSource.includes('Trust should be reinforced visually and functionally'), 'Trust through design rule missing');

assert.ok(guidedSource.includes('openEndedAiChat: false'), 'Prompt 1 guided interview rule must remain intact');
assert.ok(designSource.includes('asksEveryQuestion: false'), 'Adaptive interview must not ask every question');
assert.ok(foundationSource.includes('brand: BRAND_IDENTITY'), 'Foundation snapshot must include brand identity');
assert.ok(foundationSource.includes('entryPoints: OFFICIAL_ENTRY_POINTS'), 'Foundation snapshot must include official entry points');

console.log('PataSpace brand and global design checks passed.');

import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const domain = readFileSync(new URL('../src/domain/platform-constitution.ts', import.meta.url), 'utf8');
const docs = readFileSync(new URL('../docs/pataspace-platform-constitution.md', import.meta.url), 'utf8');
const foundation = readFileSync(new URL('../src/lib/foundation.ts', import.meta.url), 'utf8');

assert.ok(domain.includes('PataSpace connects the right people to the right rental space at the right time through a simple, affordable, trusted, and reliable experience.'), 'Founder Vision missing');
for (const principle of ['solveCustomerProblemsFirst','protectHonestUsers','keepExperienceSimpleAffordableTrustedReliable','founderAuthority']) assert.ok(domain.includes(principle), `Missing constitution principle ${principle}`);
for (const module of ['Customer Experience','Property Registration','Property Verification','House Match','Shop Match','Office Match','Event Hall Match','Unlock This Listing','Verified Access','Viewing Workflow','Notifications','Geographic Intelligence','Business Opportunity Intelligence','Executive Intelligence','Platform Analytics','Security']) assert.ok(domain.includes(module), `Missing unified platform module ${module}`);
assert.ok(domain.includes("normalCustomerExperienceMustNeverExpose: ['AI', 'Artificial Intelligence', 'Invisible Intelligence']"), 'Technology Visibility Standard missing');
for (const learn of ['Better search quality','Better property matching','Better geographic knowledge','Better fraud detection','Better verification accuracy','Better recommendation quality','Better customer support','Better platform performance']) assert.ok(domain.includes(learn), `Missing continuous learning item ${learn}`);
assert.ok(domain.includes('neverRejectLegitimateRegistrationBecauseLocationIsMissing: true'), 'Geographic evolution no-rejection rule missing');
for (const geo of ['Add locations','Edit locations','Rename locations','Correct spelling','Merge duplicate locations','Remove invalid locations']) assert.ok(domain.includes(geo), `Missing Founder geographic authority ${geo}`);
assert.ok(domain.includes('founderDecisionsOverrideAutomatedGeographicUpdates: true'), 'Founder geographic override missing');
for (const standard of ['Extend existing modules','Reuse existing platform intelligence','Preserve platform consistency','Avoid duplicate functionality','Maintain scalability','Maintain security','Improve customer experience']) assert.ok(domain.includes(standard), `Missing long-term development standard ${standard}`);
assert.ok(domain.includes('constitutionTakesPrecedenceOnConflict: true'), 'Governance precedence missing');
assert.ok(domain.includes('masterPrompts1To30BFormOfficialFounderBlueprint: true'), 'Blueprint preservation missing');
assert.ok(domain.includes('noFutureDevelopmentMayContradictWithoutExplicitFounderApproval: true'), 'No contradiction without Founder approval missing');
assert.ok(foundation.includes('platformConstitution: PLATFORM_CONSTITUTION'), 'Foundation snapshot must expose Platform Constitution');
assert.ok(foundation.includes('founderVision: PATASPACE_FOUNDER_VISION'), 'Foundation snapshot must expose Founder Vision');
assert.ok(docs.includes('Final Founder Declaration'), 'Constitution docs must include final declaration');

console.log('PataSpace platform constitution checks passed.');

import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const policy = readFileSync(new URL('../src/domain/image-authenticity.ts', import.meta.url), 'utf8');
const storage = readFileSync(new URL('../src/server/storage/supabase-storage.ts', import.meta.url), 'utf8');
const migration = readFileSync(new URL('../supabase/migrations/0010_property_image_authenticity.sql', import.meta.url), 'utf8');
const storageDomain = readFileSync(new URL('../src/domain/storage.ts', import.meta.url), 'utf8');

for (const required of [
  'THIS IS NOT A GENERATIVE IMAGE SYSTEM',
  'Better photograph of the SAME property',
  'originalMustBePreservedSeparately: true',
  'enhancedVersionMustRemainVisuallyFaithful: true',
  'ifUnsafeLeaveSubstantiallyUnchanged: true'
]) {
  assert.ok(policy.includes(required) || policy.includes(required.replace('THIS IS NOT A GENERATIVE IMAGE SYSTEM', 'Improve only the technical quality')), `Authenticity policy missing ${required}`);
}
for (const forbidden of ['Do NOT add furniture', 'Do NOT remove defects', 'Do NOT hide cracks', 'Do NOT make an old property look new', 'Do NOT make a small room appear larger', 'Do NOT use generative AI to redesign the photograph']) {
  assert.ok(policy.includes(forbidden), `Forbidden image manipulation missing: ${forbidden}`);
}
assert.ok(storage.includes("import sharp from 'sharp'"), 'Technical non-generative image processing must use sharp');
assert.ok(storage.includes('evaluateAndMaybeEnhancePropertyImage'), 'Quality evaluation and conditional enhancement function missing');
assert.ok(storage.includes('no-processing-needed') && storage.includes('minimal-technical-correction-needed'), 'System must decide between no processing and minimal correction');
assert.ok(storage.includes('NO PROCESSING NEEDED') && storage.includes('needsTechnicalCorrection'), 'Good photos must remain untouched');
assert.ok(storage.includes('modulate') && storage.includes('sharpen'), 'Allowed technical exposure/sharpness enhancement missing');
assert.ok(!storage.includes('generate_image') && !storage.includes('openai') && !storage.includes('stability'), 'Generative image tooling must not be used');
assert.ok(storage.includes('originalStoragePath') && storage.includes('enhancedStoragePath'), 'Original and enhanced paths must both be used');
for (const column of ['original_storage_path', 'enhanced_storage_path', 'enhancement_applied', 'processing_status', 'enhancement_mode', 'authenticity_policy_version', 'enhancement_notes']) {
  assert.ok(migration.includes(column), `Migration missing ${column}`);
  assert.ok(storage.includes(column), `Storage service missing ${column}`);
}
for (const field of ['originalStoragePath', 'enhancedStoragePath', 'enhancementApplied', 'authenticityPolicyVersion', 'originalSignedUrl']) {
  assert.ok(storageDomain.includes(field), `Storage metadata missing ${field}`);
}
console.log('PataSpace property image authenticity checks passed.');

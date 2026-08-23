import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');
const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
const home = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const loading = readFileSync(new URL('../app/loading.tsx', import.meta.url), 'utf8');
const nextConfig = readFileSync(new URL('../next.config.mjs', import.meta.url), 'utf8');
const offline = readFileSync(new URL('../src/components/system/OfflineResilience.tsx', import.meta.url), 'utf8');

assert.ok(layout.includes('width: \'device-width\'') && layout.includes('initialScale: 1'), 'Viewport must be mobile-first');
assert.ok(!layout.includes('OfflineResilience'), 'Offline draft restoration must not be globally mounted while QA reset bug is being fixed');
assert.ok(layout.includes('manifest: \'/manifest.webmanifest\''), 'Future mobile app manifest must be configured');
assert.ok(home.includes('next/dynamic'), 'Client-heavy landing components must be route-code-split with dynamic imports');
assert.ok(loading.includes('skeleton-card') && loading.includes('aria-busy'), 'Global loading route must provide skeleton feedback');
assert.ok(offline.includes('navigator.onLine') && offline.includes('sessionStorage') && offline.includes('SKIPPED_TYPES'), 'Offline resilience component remains available but is not mounted globally during form-reset stabilization');
for (const token of ['overflow-x: hidden', 'touch-action: manipulation', 'content-visibility: auto', 'min-width: 44px', '@media (max-width: 520px)', 'offline-banner', 'skeleton-shimmer']) {
  assert.ok(css.includes(token), `Mobile/performance CSS missing: ${token}`);
}
assert.ok(nextConfig.includes("formats: ['image/avif', 'image/webp']"), 'Next image optimisation must serve modern formats');
assert.ok(nextConfig.includes('remotePatterns') && nextConfig.includes('supabase.co') && nextConfig.includes('/storage/v1/**'), 'Supabase Storage images must be allowed for optimisation');
assert.ok(nextConfig.includes('Cache-Control') && nextConfig.includes('max-age'), 'Browser caching headers must be configured where appropriate');
assert.ok(nextConfig.includes('compress: true'), 'Compression must be enabled');
console.log('PataSpace mobile responsiveness and performance checks passed.');

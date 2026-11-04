import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const scene = readFileSync(new URL('../src/components/landing/KenyaScene.tsx', import.meta.url), 'utf8');
const cinema = readFileSync(new URL('../src/components/landing/KenyaCinema.tsx', import.meta.url), 'utf8');
const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../app/atlas.css', import.meta.url), 'utf8');
const featuredRoute = readFileSync(new URL('../app/api/landing/featured/route.ts', import.meta.url), 'utf8');
const reviewsRoute = readFileSync(new URL('../app/api/landing/reviews/route.ts', import.meta.url), 'utf8');
const featuredCard = readFileSync(new URL('../src/components/landing/AtlasFeatured.tsx', import.meta.url), 'utf8');

assert.ok(page.includes('KenyaCinema') && page.includes('ps-cinema__pin'), 'Landing must render the pinned Kenya hero');
assert.ok(!page.includes('<video') && !page.includes('<audio'), 'The hero must not introduce video or audio');
assert.ok(
  page.includes('Scroll to raise the city. Reverse to return to the map.'),
  'Hero must explain the scroll-controlled city state'
);

assert.ok(
  cinema.includes('prefers-reduced-motion: reduce') && cinema.includes("getContext('webgl2'"),
  'Kenya scene loading must retain reduced-motion and WebGL capability checks'
);
assert.ok(cinema.includes("import('./KenyaScene')") && cinema.includes('onFail'), 'Kenya scene must stay lazily loaded with a fallback');

assert.ok(scene.includes('new THREE.InstancedMesh'), 'City must use real instanced geometry');
assert.ok(scene.includes('const cityBuildings: BuildingWorld[]') && scene.includes('const cityPanels: WindowPanelWorld[]'), 'City must generate building and window instances');
assert.ok(scene.includes('const cityPhase = smoothstep(0.12, 0.94, eased);'), 'City growth must be driven by scroll progress');
assert.ok(scene.includes('updateCity(cityPhase);') && scene.includes('const rise = smoothstep(building.delay, 1, phase);'), 'Buildings must rise from scroll progress in staggered waves');
assert.ok(scene.includes("window.addEventListener('scroll', onScroll, { passive: true });"), 'Hero must listen to real scroll');
assert.ok(
  scene.includes('currentProgress += (targetProgress - currentProgress) * damping;'),
  'Hero must damp scroll progress so reversing scroll reverses the city'
);
assert.ok(scene.includes('windowMaterial.opacity = smoothstep(0.18, 0.92, phase);'), 'City windows must fade in with growth');
assert.ok(scene.includes('roadMaterial.opacity = phase * 0.28;'), 'City street network must fade in with growth');

assert.ok(css.includes('.ps-cinema__pin') && css.includes('position: sticky'), 'Cinematic hero must remain pinned during scroll');
assert.ok(css.includes('top: var(--ps-header-h)'), 'Pinned hero must clear the sticky header');
assert.ok(css.includes('.ps-kenya.is-ready .ps-kenya__canvas'), 'WebGL canvas must only appear when ready');
assert.ok(css.includes('@media (prefers-reduced-motion: reduce)') && css.includes('.ps-cinema__staticHint'), 'Reduced-motion path must remain explicit');

assert.ok(
  featuredRoute.includes("property.verificationStatus === 'verified'"),
  'Landing featured cards must only show fully verified properties'
);
assert.ok(
  featuredRoute.includes('featured: []') && featuredRoute.includes('catch'),
  'Landing featured API must fail open to an honest empty board'
);
assert.ok(reviewsRoute.includes('reviews: []') && reviewsRoute.includes('catch'), 'Landing reviews API must fail open');
assert.ok(
  featuredCard.includes('dialogRef') && featuredCard.includes("event.key !== 'Tab'") && featuredCard.includes('aria-describedby'),
  'Featured listing dialog must trap keyboard focus and expose its description'
);

console.log('PataSpace landing hero/city checks passed.');

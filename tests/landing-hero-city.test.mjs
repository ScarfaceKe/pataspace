import { readFileSync, statSync } from 'node:fs';
import assert from 'node:assert/strict';

const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const heroFilm = readFileSync(new URL('../src/components/landing/HeroFilm.tsx', import.meta.url), 'utf8');
const filmRoute = readFileSync(new URL('../app/api/hero-film/route.ts', import.meta.url), 'utf8');
const filmModule = readFileSync(new URL('../src/server/hero-film.ts', import.meta.url), 'utf8');
const css = readFileSync(new URL('../app/atlas.css', import.meta.url), 'utf8');
const featuredRoute = readFileSync(new URL('../app/api/landing/featured/route.ts', import.meta.url), 'utf8');
const reviewsRoute = readFileSync(new URL('../app/api/landing/reviews/route.ts', import.meta.url), 'utf8');
const featuredCard = readFileSync(new URL('../src/components/landing/AtlasFeatured.tsx', import.meta.url), 'utf8');

assert.ok(page.includes('HeroFilm') && page.includes('ps-cinema__pin'), 'Landing must render the pinned hero film');
assert.ok(!page.includes('KenyaCinema'), 'The flat Kenya fallback must not be the hero artwork');
assert.ok(!page.includes('<audio'), 'The hero must never attach an audio element');
assert.equal(
  (page.match(/ps-cinema__chapter ps-cinema__chapter--/g) ?? []).length,
  5,
  'The hero must contain five scroll-synchronized messages'
);
assert.ok(
  page.includes('Discover a better way to find property') &&
    page.includes('Find houses, shops, offices and event halls') &&
    page.includes('Explore genuine available properties') &&
    page.includes('Know what is available before making your move') &&
    page.includes('Find your next space with PataSpace'),
  'All five PataSpace messages must be present in the hero'
);
assert.ok(
  page.includes('data-act="1"') && page.includes('ps-cinema__route') && page.includes('Flight path'),
  'The hero must expose the initial act and the film flight path'
);
assert.ok(
  page.includes('Scroll to move through the city. Reverse to rewind.'),
  'Hero must explain the scroll-controlled film'
);

assert.ok(
  heroFilm.includes('<video') &&
    heroFilm.includes('muted') &&
    heroFilm.includes('playsInline') &&
    heroFilm.includes('preload="auto"') &&
    heroFilm.includes("const FILM_SRC = '/api/hero-film?v=3'"),
  'Hero film must be a silent, inline, preloaded video served by the film route'
);
assert.ok(
  !heroFilm.includes('autoPlay') && !heroFilm.includes('loop'),
  'The city film must advance from scroll, not autoplay or loop'
);
assert.ok(
  heroFilm.includes("window.addEventListener('scroll', onScroll, { passive: true })"),
  'The city film must listen to real scroll'
);
assert.ok(
  heroFilm.includes('const FILM_START = 0;'),
  'The hero must scrub from the first frame of the film'
);
assert.ok(
  heroFilm.includes("String(Math.min(4, Math.floor(progress * 5)) + 1)"),
  'Five message beats must be derived from the same eased progress as the film'
);
assert.ok(
  heroFilm.includes('video.currentTime = time') &&
    heroFilm.includes('requestAnimationFrame(tick)') &&
    heroFilm.includes('const time = FILM_START + (end - FILM_START) * clamp01(progress);') &&
    heroFilm.includes('const SETTLE_TAU = 0.24;') &&
    heroFilm.includes('Math.exp(-dt / tau)') &&
    heroFilm.includes('clamp01(current + delta *') &&
    heroFilm.includes('current = target;'),
  'Scroll progress must reach the film through a clamped, decaying settle that ends exactly on the target'
);
assert.ok(
  !heroFilm.includes('setInterval') && !heroFilm.includes('setTimeout'),
  'The settle must be frame-driven, not timer-driven'
);
assert.ok(
  heroFilm.includes("addEventListener('canplay', onCanPlay)"),
  'The film must re-seek after enough data is buffered to paint'
);
assert.ok(
  !heroFilm.includes('current = 0.62') && !heroFilm.includes('if (reducedMotion)') && !heroFilm.includes('prefers-reduced-motion'),
  'The film must scrub for every visitor, including reduced-motion users'
);
assert.ok(
  !heroFilm.includes('if (!started) return'),
  'The hero must follow scroll even when the film has not loaded yet'
);
assert.ok(
  heroFilm.includes('ps-film__canvas') && heroFilm.includes('context.drawImage(video'),
  'The film must paint decoded frames to a canvas so Safari does not hold the poster'
);
assert.ok(
  page.includes('ps-cinema__filmCue') && page.includes('Scroll to play'),
  'The hero must make the silent, scroll-controlled film explicit'
);

const encodedFilm = filmModule.match(/HERO_FILM_BASE64\s*=\s*`([\s\S]*?)`/)?.[1]?.replace(/\s+/g, '');
assert.ok(encodedFilm, 'The hero film must have an ASCII-safe base64 payload');
const filmAsset = Buffer.from(encodedFilm, 'base64');
const posterAsset = statSync(new URL('../public/hero/pataspace-city-poster.jpg', import.meta.url));
assert.ok(filmAsset.length > 0, 'The city film asset must be present');
assert.ok(filmAsset.length < 7_000_000, 'The city film must stay within the source export size');
assert.ok(posterAsset.size < 250_000, 'The city film poster must stay lightweight');
assert.ok(filmAsset.includes(Buffer.from('vide')), 'The city film must carry a video track');
assert.ok(!filmAsset.includes(Buffer.from('soun')), 'The city film must have no audio track');
assert.ok(posterAsset.size > 0, 'The city film poster must be present');
assert.ok(
  filmRoute.includes("'Content-Type': 'video/mp4'") &&
    filmRoute.includes("'Accept-Ranges': 'bytes'") &&
    filmRoute.includes("bytes ${range.start}-${range.end}/${FILM.byteLength}"),
  'The city film route must serve video with byte ranges for seeking'
);
assert.equal(
  heroFilm.match(/\/api\/hero-film\?v=(\d+)/)?.[1],
  filmRoute.match(/hero-film-v(\d+)/)?.[1],
  'The film cache-busting version and ETag must stay in sync'
);

assert.ok(
  css.includes('--ps-panel-inset: clamp(10px, 1.8vw, 30px)') &&
    css.includes('inset: var(--ps-panel-inset)') &&
    css.includes('border-radius: clamp(14px, 1.6vw, 26px)'),
  'The hero film must sit in a contained, framed panel rather than bleeding edge to edge'
);
assert.ok(
  css.includes('.ps-film__video') &&
    css.includes('object-fit: contain') &&
    css.includes('object-position: center') &&
    !/\.ps-film__video[\s\S]{0,200}?scale\(/.test(css),
  'The portrait film must be contained in the hero, never cropped or upscaled'
);

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

console.log('PataSpace landing hero/film checks passed.');

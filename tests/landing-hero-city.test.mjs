import { readFileSync, statSync } from 'node:fs';
import assert from 'node:assert/strict';

const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const header = readFileSync(new URL('../src/components/landing/AtlasHeader.tsx', import.meta.url), 'utf8');
const heroFilm = readFileSync(new URL('../src/components/landing/HeroFilm.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../app/atlas.css', import.meta.url), 'utf8');
const featuredRoute = readFileSync(new URL('../app/api/landing/featured/route.ts', import.meta.url), 'utf8');
const reviewsRoute = readFileSync(new URL('../app/api/landing/reviews/route.ts', import.meta.url), 'utf8');
const featuredCard = readFileSync(new URL('../src/components/landing/AtlasFeatured.tsx', import.meta.url), 'utf8');

assert.ok(page.includes('HeroFilm') && page.includes('ps-cinema__pin'), 'Landing must render the framed hero film');
assert.ok(!page.includes('KenyaCinema'), 'The flat Kenya fallback must not be the hero artwork');
assert.ok(!page.includes('<audio'), 'The hero must never attach an audio element');
assert.equal(
  (page.match(/ps-cinema__chapter ps-cinema__chapter--/g) ?? []).length,
  5,
  'The hero must keep its five messages'
);
assert.ok(
  page.includes('Discover a better way to find property') &&
    page.includes('Find houses, shops, offices and event halls') &&
    page.includes('Explore genuine available properties') &&
    page.includes('Know what is available before making your move') &&
    page.includes('Find your next space with PataSpace'),
  'All five PataSpace messages must remain in the hero'
);
assert.ok(
  page.includes('data-act="1"') && page.includes('ps-cinema__route') && page.includes('Flight path'),
  'The hero must expose the initial act and the film flight path'
);
assert.ok(
  !page.includes('Silent city film') && !page.includes('No sound') && !page.includes('ps-cinema__filmCue'),
  'The hero must not label the film with a cue'
);
assert.ok(
  !header.includes('/auth/login') && !header.includes('/auth/register') && !/sign in|sign up/i.test(header),
  'The header must not offer sign in or sign up'
);
assert.ok(
  !page.includes('/auth/login') &&
    !page.includes('/auth/register') &&
    !page.includes('Create an account') &&
    !page.includes('Sign in'),
  'The landing page must not offer sign in or sign up'
);
assert.ok(
  !page.includes('Plays once · scroll back to the top to replay') &&
    !page.includes('Plays once, then holds') &&
    !page.includes('Silent film'),
  'The hero must not explain its own playback in the copy'
);
assert.ok(
  !page.includes('Scroll to play') && !page.includes('Reverse to rewind'),
  'The hero must not ask the visitor to scroll in order to play or rewind the film'
);

assert.ok(
  heroFilm.includes('<video') &&
    heroFilm.includes('muted') &&
    heroFilm.includes('playsInline') &&
    heroFilm.includes('preload="auto"') &&
    heroFilm.includes("const FILM_SRC = '/api/hero-film?v=4'"),
  'Hero film must be a silent, inline, preloaded static video'
);
assert.ok(heroFilm.includes('autoPlay'), 'The city film must start on its own when the page opens');
assert.ok(!heroFilm.includes('loop'), 'The city film must play once and rest, not loop');
assert.ok(!heroFilm.includes('controls'), 'The city film must not expose playback controls');
assert.ok(
  heroFilm.includes("window.addEventListener('scroll', onScroll, { passive: true })") &&
    heroFilm.includes('window.scrollY') &&
    heroFilm.includes('video.currentTime = 0'),
  'Returning to the top of the page must start the film over from its first frame'
);
assert.ok(
  !heroFilm.includes('--cinema-p') && !heroFilm.includes('data-act') && !heroFilm.includes('requestAnimationFrame'),
  'The film must not be scrubbed, settled, or advanced from scroll'
);
assert.ok(
  !heroFilm.includes('setInterval') && !heroFilm.includes('setTimeout'),
  'The film must be driven by playback, not timers'
);
assert.ok(
  heroFilm.includes('video.play()') && heroFilm.includes("addEventListener('pointerdown'"),
  'Playback must retry on the first input if a browser blocks autoplay'
);
assert.ok(
  !heroFilm.includes('ps-film__canvas'),
  'A normally playing film needs no canvas frame copying'
);

const filmAsset = readFileSync(new URL('../public/hero/pataspace-city-film.mp4', import.meta.url));
const posterAsset = statSync(new URL('../public/hero/pataspace-city-poster.jpg', import.meta.url));
assert.ok(filmAsset.length > 0, 'The city film asset must be present');
assert.ok(filmAsset.length < 2_500_000, 'The city film must stay light enough to stream smoothly');
assert.ok(posterAsset.size < 250_000, 'The city film poster must stay lightweight');
assert.ok(filmAsset.includes(Buffer.from('vide')), 'The city film must carry a video track');
assert.ok(!filmAsset.includes(Buffer.from('soun')), 'The city film must have no audio track');
assert.ok(posterAsset.size > 0, 'The city film poster must be present');

assert.ok(
  /\.ps-cinema\s*\{\s*position: relative;\s*height: auto;/.test(css) &&
    !/\.ps-cinema__pin\s*\{[^}]*position:\s*sticky/.test(css),
  'The hero must sit at the top of a normally scrolling page instead of pinning a scroll runway'
);
assert.ok(
  css.includes('--ps-panel-inset: clamp(10px, 1.8vw, 30px)') &&
    css.includes('inset: var(--ps-panel-inset)') &&
    css.includes('border-radius: clamp(14px, 1.6vw, 26px)'),
  'The hero film must sit in a contained, framed panel rather than bleeding edge to edge'
);
assert.ok(
  /\.ps-film__video\s*\{[^}]*object-fit:\s*contain/.test(css) &&
    /\.ps-film\s*\{[^}]*background:[^;]*center \/ contain/.test(css) &&
    !/\.ps-film__video\s*\{[^}]*scale\(/.test(css),
  'The whole film frame must stay inside the framed panel, never cropped'
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

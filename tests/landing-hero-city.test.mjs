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
assert.ok(
  page.includes('Scroll to move through the city. Reverse to rewind.'),
  'Hero must explain the scroll-controlled film'
);

assert.ok(
  heroFilm.includes('<video') &&
    heroFilm.includes('muted') &&
    heroFilm.includes('playsInline') &&
    heroFilm.includes('preload="auto"') &&
    heroFilm.includes("const FILM_SRC = '/api/hero-film?v=1'"),
  'Hero film must be a silent, inline, preloaded video served by the film route'
);
assert.ok(
  !heroFilm.includes('autoPlay') && !heroFilm.includes('loop'),
  'The city film must advance from scroll, not autoplay or loop'
);
assert.ok(
  heroFilm.includes("window.addEventListener('scroll', readScroll, { passive: true })"),
  'The city film must listen to real scroll'
);
assert.ok(
  heroFilm.includes('video.currentTime = time') &&
    heroFilm.includes('requestAnimationFrame(tick)') &&
    heroFilm.includes('current += (target - current) * damping'),
  'The film must be seekable and reversible from damped scroll progress'
);
assert.ok(
  heroFilm.includes("addEventListener('canplay', onCanPlay)"),
  'The film must re-seek after enough data is buffered to paint'
);
assert.ok(
  heroFilm.includes('prefers-reduced-motion: reduce') && heroFilm.includes('current = 0.62'),
  'Reduced motion must hold a composed city frame'
);

const encodedFilm = filmModule.match(/HERO_FILM_BASE64\s*=\s*`([\s\S]*?)`/)?.[1]?.replace(/\s+/g, '');
assert.ok(encodedFilm, 'The hero film must have an ASCII-safe base64 payload');
const filmAsset = Buffer.from(encodedFilm, 'base64');
const posterAsset = statSync(new URL('../public/hero/pataspace-city-poster.jpg', import.meta.url));
assert.ok(filmAsset.length > 0, 'The city film asset must be present');
assert.ok(filmAsset.length < 2_000_000, 'The city film must stay mobile-friendly');
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

assert.ok(
  css.includes('.ps-film__video') &&
    css.includes('object-fit: cover') &&
    css.includes("object-position: 50% 36%"),
  'The city film must fill the hero and adapt its crop on mobile'
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

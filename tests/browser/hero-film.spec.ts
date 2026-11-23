import { expect, test, type Page } from '@playwright/test';

/** The styled hero, ready for layout measurements. */
async function openHero(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(
    () => {
      const cinema = document.querySelector<HTMLElement>('.ps-cinema');
      return Boolean(cinema && getComputedStyle(cinema).backgroundColor !== 'rgba(0, 0, 0, 0)');
    },
    undefined,
    { timeout: 20_000 }
  );
}

async function waitForFilmData(page: Page) {
  await page.waitForFunction(
    () => {
      const film = document.querySelector<HTMLVideoElement>('.ps-film__video');
      return Boolean(film && film.readyState >= 1 && Number.isFinite(film.duration) && film.duration > 9);
    },
    undefined,
    { timeout: 30_000 }
  );
}

const currentTime = (page: Page) =>
  page.locator('.ps-film__video').evaluate((element) => (element as HTMLVideoElement).currentTime);

const isPaused = (page: Page) =>
  page.locator('.ps-film__video').evaluate((element) => (element as HTMLVideoElement).paused);

/** The film fills the framed panel; the whole frame is still reachable inside it. */
async function expectWholeFilmInPanel(page: Page) {
  const art = await page.locator('.ps-cinema__art').boundingBox();
  const film = await page.locator('.ps-film').boundingBox();
  const video = await page.locator('.ps-film__video').boundingBox();
  expect(art).not.toBeNull();
  expect(film).not.toBeNull();
  expect(video).not.toBeNull();
  if (!art || !film || !video) throw new Error('The framed film panel is not laid out');

  expect(Math.abs(film.x - art.x)).toBeLessThan(3);
  expect(Math.abs(film.y - art.y)).toBeLessThan(3);
  expect(Math.abs(film.width - art.width)).toBeLessThan(3);
  expect(Math.abs(film.height - art.height)).toBeLessThan(3);
  expect(Math.abs(video.width - art.width)).toBeLessThan(3);
  expect(Math.abs(video.height - art.height)).toBeLessThan(3);

  const fit = await page.locator('.ps-film__video').evaluate((element) => {
    const media = element as HTMLVideoElement;
    const scale = Math.min(media.clientWidth / media.videoWidth, media.clientHeight / media.videoHeight);
    return {
      width: Math.round(media.videoWidth * scale),
      height: Math.round(media.videoHeight * scale),
      boxWidth: media.clientWidth,
      boxHeight: media.clientHeight,
      objectFit: getComputedStyle(media).objectFit
    };
  });

  expect(fit.objectFit).toBe('cover');
  // Cover fills the box in at least one dimension, so the image is never smaller than the box.
  expect(Math.max(fit.width / fit.boxWidth, fit.height / fit.boxHeight)).toBeGreaterThanOrEqual(0.99);
  return fit;
}

test('plays the silent film by itself, shows the whole frame, holds the last frame, and replays from the top', async ({ page }) => {
  test.setTimeout(80_000);
  await openHero(page);

  const video = page.locator('.ps-film__video');
  await expect(video).toBeVisible();
  await expect(page.locator('.ps-cinema__filmCue')).toHaveCount(0);
  await expect(page.locator('a[href="/auth/login"], a[href="/auth/register"]')).toHaveCount(0);
  await expect(page.getByRole('link', { name: /sign in|sign up|create an account/i })).toHaveCount(0);
  await expect(page.locator('.ps-cinema__chapter--1 .ps-hero__actions')).toBeVisible();
  await expect(page.locator('.ps-cinema')).toHaveAttribute('data-act', '1');
  await waitForFilmData(page);

  const media = await video.evaluate((element) => {
    const film = element as HTMLVideoElement;
    return {
      error: film.error?.code ?? null,
      muted: film.muted,
      loop: film.loop,
      controls: film.controls,
      duration: film.duration,
      width: film.videoWidth,
      height: film.videoHeight
    };
  });
  expect(media.error).toBeNull();
  expect(media.duration).toBeGreaterThan(9);
  expect(media.width).toBe(720);
  expect(media.height).toBe(1280);
  expect(media.muted).toBe(true);
  expect(media.loop).toBe(false);
  expect(media.controls).toBe(false);

  // It starts on its own, without a gesture or a scroll.
  await expect.poll(() => currentTime(page), { timeout: 20_000 }).toBeGreaterThan(1);
  expect(await isPaused(page)).toBe(false);
  await expectWholeFilmInPanel(page);
  expect(await page.evaluate(() => window.scrollY)).toBe(0);

  // It plays through once and rests on the final frame.
  await expect
    .poll(() => video.evaluate((element) => (element as HTMLVideoElement).ended), {
      timeout: 40_000,
      intervals: [250, 500, 1000]
    })
    .toBe(true);

  const rest = await video.evaluate((element) => {
    const film = element as HTMLVideoElement;
    return { currentTime: film.currentTime, duration: film.duration, paused: film.paused };
  });
  expect(rest.paused).toBe(true);
  expect(rest.currentTime).toBeGreaterThan(rest.duration - 0.25);

  await page.waitForTimeout(1500);
  const held = await video.evaluate((element) => {
    const film = element as HTMLVideoElement;
    return { currentTime: film.currentTime, paused: film.paused };
  });
  expect(held.paused).toBe(true);
  expect(Math.abs(held.currentTime - rest.currentTime)).toBeLessThan(0.05);

  // The page scrolls normally under the resting film and must not rewind it.
  await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' }));
  await page.waitForTimeout(600);
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(800);
  expect(await currentTime(page)).toBeCloseTo(rest.currentTime, 1);

  // Returning to the top after it has ended starts the film over.
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect.poll(() => currentTime(page), { timeout: 5_000 }).toBeLessThan(1);
  await expect.poll(() => isPaused(page), { timeout: 5_000 }).toBe(false);
  await expect.poll(() => currentTime(page), { timeout: 5_000 }).toBeGreaterThan(0.4);
});

test('scrolls the page normally and replays the film from the top', async ({ page }) => {
  await openHero(page);
  await waitForFilmData(page);
  await expect.poll(() => currentTime(page), { timeout: 20_000 }).toBeGreaterThan(0.8);

  const beforeScroll = await currentTime(page);
  await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' }));
  await page.waitForTimeout(900);
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(800);
  // Scroll neither scrubs nor rewinds the film; the next section is reachable.
  await expect.poll(() => currentTime(page), { timeout: 5_000 }).toBeGreaterThan(beforeScroll + 0.4);
  const tickerTop = await page.evaluate(() => document.querySelector('.ps-ticker')?.getBoundingClientRect().top ?? Infinity);
  expect(tickerTop).toBeLessThan(900);

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect.poll(() => currentTime(page), { timeout: 5_000 }).toBeLessThan(1);
  await expect.poll(() => isPaused(page), { timeout: 5_000 }).toBe(false);
  await expect.poll(() => currentTime(page), { timeout: 5_000 }).toBeGreaterThan(0.4);
});

test.describe('reduced motion', () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });

  test('still fills the framed panel without cropping the copy', async ({ page }) => {
    await openHero(page);
    await expect(page.locator('.ps-cinema__chapter--1 .ps-hero__actions')).toBeVisible();
    await expect.poll(() => currentTime(page), { timeout: 20_000 }).toBeGreaterThan(0.5);
    await expectWholeFilmInPanel(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0);
  });
});

test.describe('large desktop', () => {
  test.use({ viewport: { width: 2560, height: 1440 } });

  test('fills the framed panel and keeps the hero within the viewport', async ({ page }) => {
    await openHero(page);
    await waitForFilmData(page);
    await expect(page.locator('.ps-cinema__chapter--1 .ps-hero__actions')).toBeVisible();
    await expect.poll(() => currentTime(page), { timeout: 20_000 }).toBeGreaterThan(0.5);

    const art = await page.locator('.ps-cinema__art').boundingBox();
    expect(art).not.toBeNull();
    expect(art?.x).toBeGreaterThan(4);
    expect(art?.width).toBeLessThanOrEqual(2560 - 16);
    expect(
      await page.locator('.ps-cinema__art').evaluate((element) => parseFloat(getComputedStyle(element).borderTopLeftRadius))
    ).toBeGreaterThan(8);

    const computed = await page.evaluate(() => {
      const v = document.querySelector('.ps-film__video');
      const film = document.querySelector('.ps-film');
      const art = document.querySelector('.ps-cinema__art');
      if (!(v instanceof HTMLElement) || !(film instanceof HTMLElement) || !(art instanceof HTMLElement)) {
        return null;
      }
      return {
        objectFit: getComputedStyle(v).objectFit,
        objectPosition: getComputedStyle(v).objectPosition,
        videoW: v.clientWidth,
        videoH: v.clientHeight,
        artW: art.getBoundingClientRect().width,
        artH: art.getBoundingClientRect().height,
        filmBg: getComputedStyle(film).backgroundImage.slice(0, 60),
        scrollWDelta: document.documentElement.scrollWidth - window.innerWidth,
        scrollH: document.documentElement.scrollHeight
      };
    });
    expect(computed).not.toBeNull();
    expect(computed?.objectFit).toBe('cover');
    // Rendered media sizes can sit a hair under the CSS box due to sub-pixel rounding.
    expect(computed?.videoW).toBeGreaterThanOrEqual((computed?.artW ?? 0) - 2);
    expect(computed?.videoH).toBeGreaterThanOrEqual((computed?.artH ?? 0) - 2);
    expect(computed?.scrollWDelta).toBe(0);
    expect(computed?.scrollH).toBeGreaterThan(2880);
  });
});

test.describe('phone portrait', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('fills the framed panel without horizontal overflow', async ({ page }) => {
    await openHero(page);
    await expect(page.locator('.ps-cinema__chapter--1 .ps-hero__actions')).toBeVisible();
    await expect(page.locator('a[href="/auth/login"], a[href="/auth/register"]')).toHaveCount(0);
    await expect.poll(() => currentTime(page), { timeout: 20_000 }).toBeGreaterThan(0.5);
    await expectWholeFilmInPanel(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0);
  });
});

test.describe('short phone landscape', () => {
  test.use({ viewport: { width: 667, height: 375 }, isMobile: true, hasTouch: true });

  test('keeps the hero copy and film inside the viewport', async ({ page }) => {
    await openHero(page);
    await expect.poll(() => currentTime(page), { timeout: 20_000 }).toBeGreaterThan(0.5);

    const art = await page.locator('.ps-cinema__art').boundingBox();
    expect(art).not.toBeNull();
    const computed = await page.evaluate(() => {
      const v = document.querySelector('.ps-film__video');
      const film = document.querySelector('.ps-film');
      const art = document.querySelector('.ps-cinema__art');
      if (!(v instanceof HTMLElement) || !(art instanceof HTMLElement)) return null;
      const r = v.getBoundingClientRect();
      const ar = art.getBoundingClientRect();
      return {
        objectFit: getComputedStyle(v).objectFit,
        objectPosition: getComputedStyle(v).objectPosition,
        videoW: r.width,
        videoH: r.height,
        artW: ar.width,
        artH: ar.height,
        scrollWDelta: document.documentElement.scrollWidth - window.innerWidth
      };
    });
    expect(computed).not.toBeNull();
    expect(computed?.objectFit).toBe('cover');
    // On this short landscape viewport the film should still fill the panel area.
    expect(computed?.videoW).toBeGreaterThanOrEqual((computed?.artW ?? 0) - 2);
    expect(computed?.videoH).toBeGreaterThanOrEqual((computed?.artH ?? 0) - 2);
    expect(computed?.scrollWDelta).toBe(0);

    const actions = page.locator('.ps-cinema__chapter--1 .ps-hero__actions');
    await expect(actions).toBeVisible();
    await expect
      .poll(
        async () => {
          const box = await actions.boundingBox();
          return box ? Math.round(box.y + box.height) : Infinity;
        },
        { timeout: 5_000 }
      )
      .toBeLessThanOrEqual(375);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0);
  });

  test('short landscape phone uses the landscape crop preset', async ({ page }) => {
    await openHero(page);
    await expect.poll(() => currentTime(page), { timeout: 20_000 }).toBeGreaterThan(0.5);
    const position = await page.locator('.ps-film__video').evaluate((element) =>
      getComputedStyle(element).objectPosition
    );
    expect(position).toContain('22%');
  });
});

test.describe('film unavailable', () => {
  test('keeps the poster and the page usable when the film cannot load', async ({ page }) => {
    await page.route('**/api/hero-film*', (route) => route.abort());
    await openHero(page);
    await expect(page.locator('.ps-cinema__filmCue')).toHaveCount(0);
    await expect(page.locator('.ps-cinema__chapter--1 .ps-hero__actions')).toBeVisible();
    expect(await page.locator('.ps-film').evaluate((element) => getComputedStyle(element).backgroundImage)).toContain(
      'pataspace-city-poster.jpg'
    );
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0);

    await page.evaluate(() => window.scrollTo({ top: 900, behavior: 'instant' }));
    await page.waitForTimeout(400);
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(800);
  });
});

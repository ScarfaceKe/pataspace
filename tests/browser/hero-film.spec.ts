import { expect, test } from '@playwright/test';

test('scrolling the hero plays the full film, reveals the page, and rewinds on reverse scroll', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const video = page.locator('.ps-film__video');
  const section = page.locator('.ps-cinema');
  await expect(video).toHaveCount(1);
  await expect(video).toBeVisible();
  await expect(page.locator('.ps-film__canvas')).toBeVisible();
  await expect(page.locator('.ps-cinema__filmCue')).toContainText('Scroll to play');
  await expect(section).toHaveAttribute('data-act', '1');
  await page.waitForFunction(
    () => {
      const element = document.querySelector<HTMLVideoElement>('.ps-film__video');
      const section = document.querySelector<HTMLElement>('.ps-cinema');
      const progress = section?.style.getPropertyValue('--cinema-p') ?? '';
      return Boolean(
        element &&
          element.readyState >= 1 &&
          Number.isFinite(element.duration) &&
          element.duration > 0 &&
          progress !== '' &&
          element.currentTime >= 0 &&
          element.currentTime < 0.4
      );
    },
    undefined,
    { timeout: 20_000 }
  );

  const media = await video.evaluate((element) => {
    const film = element as HTMLVideoElement;
    return {
      error: film.error?.code ?? null,
      duration: film.duration,
      width: film.videoWidth,
      height: film.videoHeight,
      currentTime: film.currentTime
    };
  });
  expect(media.error).toBeNull();
  expect(media.duration).toBeGreaterThan(9);
  expect(media.width).toBe(720);
  expect(media.height).toBe(1280);
  expect(await video.evaluate((element) => (element as HTMLVideoElement).muted)).toBe(true);
  const videoBox = await video.boundingBox();
  expect(videoBox).not.toBeNull();
  expect(videoBox?.width).toBeGreaterThan(300);
  expect(videoBox?.height).toBeGreaterThan(300);
  expect(media.currentTime).toBeGreaterThanOrEqual(0);
  expect(media.currentTime).toBeLessThan(0.4);
  await expect
    .poll(() => video.evaluate((element) => (element as HTMLVideoElement).paused), { timeout: 5_000 })
    .toBe(true);

  const startTime = media.currentTime;
  await expect(page.locator('.ps-film')).toHaveAttribute('data-painted', 'true');
  const canvasFrame = () => page.locator('.ps-film__canvas').evaluate((element) => (element as HTMLCanvasElement).toDataURL());
  const startFrame = await canvasFrame();
  expect(startFrame.length).toBeGreaterThan(1000);

  const geometry = await page.evaluate(() => {
    const section = document.querySelector<HTMLElement>('.ps-cinema');
    const pin = document.querySelector<HTMLElement>('.ps-cinema__pin');
    if (!section || !pin) throw new Error('The pinned hero is not present');
    return {
      top: section.getBoundingClientRect().top + window.scrollY,
      travel: section.offsetHeight - pin.offsetHeight
    };
  });
  expect(geometry.travel).toBeGreaterThan(100);

  await page.evaluate(({ top, travel }) => {
    window.scrollTo({ top: top + travel * 0.45, behavior: 'instant' });
  }, geometry);
  await expect(section).toHaveAttribute('data-act', '2');

  await page.evaluate(({ top, travel }) => {
    window.scrollTo({ top: top + travel * 0.65, behavior: 'instant' });
  }, geometry);
  await expect(section).toHaveAttribute('data-act', '3');

  const currentTime = () => video.evaluate((element) => (element as HTMLVideoElement).currentTime);
  await expect
    .poll(currentTime, { timeout: 10_000, intervals: [100, 250, 500] })
    .toBeGreaterThan(startTime + 2);
  const forwardTime = await currentTime();
  await expect
    .poll(() => page.locator('.ps-cinema').evaluate((element) => Number(element.style.getPropertyValue('--cinema-p'))))
    .toBeGreaterThan(0.5);
  await expect.poll(canvasFrame, { timeout: 10_000 }).not.toBe(startFrame);

  // Stopping the scroll must freeze the frame immediately, not drift on.
  await page.waitForTimeout(900);
  expect(Math.abs((await currentTime()) - forwardTime)).toBeLessThan(0.05);

  await page.evaluate(({ top, travel }) => {
    window.scrollTo({ top: top + travel, behavior: 'instant' });
  }, geometry);
  await expect(section).toHaveAttribute('data-act', '3');
  await expect
    .poll(currentTime, { timeout: 10_000, intervals: [100, 250, 500] })
    .toBeGreaterThan(media.duration - 0.35);

  // Continue past the hero to confirm the rest of the landing page is next.
  await page.evaluate(({ top, travel }) => {
    window.scrollTo({ top: top + travel + 200, behavior: 'instant' });
  }, geometry);
  const viewportHeight = page.viewportSize()?.height ?? 960;
  await expect
    .poll(() => page.evaluate(() => document.querySelector('.ps-ticker')?.getBoundingClientRect().top ?? Infinity))
    .toBeLessThan(viewportHeight);

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await expect(section).toHaveAttribute('data-act', '1');

  await expect
    .poll(currentTime, { timeout: 10_000, intervals: [100, 250, 500] })
    .toBeLessThan(forwardTime - 2);
  await expect
    .poll(currentTime, { timeout: 10_000, intervals: [100, 250, 500] })
    .toBeLessThan(startTime + 0.25);
});

test.describe('reduced motion', () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });

  test('still advances the film from scroll instead of freezing on one frame', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const section = page.locator('.ps-cinema');
    await expect(section).toHaveAttribute('data-act', '1');
    await page.waitForFunction(() => {
      const film = document.querySelector<HTMLVideoElement>('.ps-film__video');
      return Boolean(film && film.readyState >= 1);
    });

    const geometry = await page.evaluate(() => {
      const cinema = document.querySelector<HTMLElement>('.ps-cinema');
      if (!cinema) throw new Error('The hero is not present');
      return { top: cinema.getBoundingClientRect().top + window.scrollY, height: cinema.getBoundingClientRect().height };
    });

    // The reduced-motion layout is unpinned; the film scrubs as the hero passes.
    await page.evaluate(
      ({ top, height }) => window.scrollTo({ top: top + height * 0.75, behavior: 'instant' }),
      geometry
    );
    await expect(section).toHaveAttribute('data-act', '3');
    await expect
      .poll(() => section.evaluate((element) => Number(element.style.getPropertyValue('--cinema-p'))))
      .toBeGreaterThan(0.5);
    await expect
      .poll(() => page.locator('.ps-film__video').evaluate((element) => (element as HTMLVideoElement).currentTime))
      .toBeGreaterThan(4);
  });
});

test.describe('film unavailable', () => {
  test('keeps the hero following scroll when the film cannot load', async ({ page }) => {
    await page.route('**/api/hero-film*', (route) => route.abort());
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const section = page.locator('.ps-cinema');
    await expect(section).toHaveAttribute('data-act', '1');

    const geometry = await page.evaluate(() => {
      const cinema = document.querySelector<HTMLElement>('.ps-cinema');
      const pin = document.querySelector<HTMLElement>('.ps-cinema__pin');
      if (!cinema || !pin) throw new Error('The pinned hero is not present');
      return { top: cinema.getBoundingClientRect().top + window.scrollY, travel: cinema.offsetHeight - pin.offsetHeight };
    });

    await page.evaluate(({ top, travel }) => window.scrollTo({ top: top + travel * 0.7, behavior: 'instant' }), geometry);
    await expect(section).toHaveAttribute('data-act', '3');
    await expect
      .poll(() => section.evaluate((element) => Number(element.style.getPropertyValue('--cinema-p'))))
      .toBeGreaterThan(0.5);
  });
});

test.describe('large desktop', () => {
  test.use({ viewport: { width: 2560, height: 1440 } });

  test('contains the portrait film instead of cropping it into a landscape hero', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.ps-film')).toHaveAttribute('data-painted', 'true');
    await expect(page.locator('.ps-cinema__filmCue')).toBeVisible();
    await expect(page.locator('.ps-cinema__chapter--1 .ps-hero__actions')).toBeVisible();

    const box = await page.locator('.ps-film').boundingBox();
    expect(box).not.toBeNull();
    // The film element spans the pinned hero; the contained video keeps its
    // own portrait ratio inside it, so no architectural content is cropped.
    expect(box?.width).toBeGreaterThan(2400);
    expect(await page.locator('.ps-film__video').evaluate((element) => getComputedStyle(element).objectFit)).toBe('contain');
    expect(await page.locator('.ps-film__video').evaluate((element) => (element as HTMLVideoElement).videoWidth / (element as HTMLVideoElement).videoHeight)).toBeCloseTo(720 / 1280, 3);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0);
  });
});

test.describe('phone portrait', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('keeps the painted film and cue visible without horizontal overflow', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.ps-film')).toHaveAttribute('data-painted', 'true');
    await expect(page.locator('.ps-cinema__filmCue')).toBeVisible();
    await expect(page.locator('.ps-cinema__chapter--1 .ps-hero__actions')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBe(0);
  });
});

test.describe('short phone landscape', () => {
  test.use({ viewport: { width: 667, height: 375 }, isMobile: true, hasTouch: true });

  test('keeps the film scrubbable and every act CTA inside the viewport', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('.ps-film')).toHaveAttribute('data-painted', 'true');
    await expect(page.locator('.ps-cinema__filmCue')).toBeVisible();

    const geometry = await page.evaluate(() => {
      const section = document.querySelector<HTMLElement>('.ps-cinema');
      const pin = document.querySelector<HTMLElement>('.ps-cinema__pin');
      if (!section || !pin) throw new Error('The pinned hero is not present');
      return { top: section.getBoundingClientRect().top + window.scrollY, travel: section.offsetHeight - pin.offsetHeight };
    });
    expect(geometry.travel).toBeGreaterThan(100);

    for (const act of ['2', '3'] as const) {
      await page.evaluate(
        ({ top, travel, act }) => window.scrollTo({ top: top + travel * (act === '2' ? 0.33 : 0.66), behavior: 'instant' }),
        { ...geometry, act }
      );
      const actions = page.locator(`.ps-cinema[data-act="${act}"] .ps-cinema__chapter--${act} .ps-hero__actions`);
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
    }

    await page.evaluate(
      ({ top, travel }) => window.scrollTo({ top: top + travel, behavior: 'instant' }),
      geometry
    );
    await expect
      .poll(() => page.locator('.ps-film__video').evaluate((element) => (element as HTMLVideoElement).currentTime), {
        timeout: 10_000,
        intervals: [100, 250, 500]
      })
      .toBeGreaterThan(8);
  });
});

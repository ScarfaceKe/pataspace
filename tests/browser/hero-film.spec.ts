import { expect, test } from '@playwright/test';

test('scrolling the hero plays the full film, reveals the page, and rewinds on reverse scroll', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const video = page.locator('.ps-film__video');
  const section = page.locator('.ps-cinema');
  await expect(video).toHaveCount(1);
  await expect(video).toBeVisible();
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
  expect(media.duration).toBeGreaterThan(5);
  expect(media.width).toBeGreaterThan(0);
  expect(media.height).toBeGreaterThan(0);
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

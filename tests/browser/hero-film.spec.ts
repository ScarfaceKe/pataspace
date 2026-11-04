import { expect, test } from '@playwright/test';

test('scrolling the hero seeks the film forward and rewinds it on reverse scroll', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  const video = page.locator('.ps-film__video');
  await expect(video).toHaveCount(1);
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
          element.currentTime >= 3.4 &&
          element.currentTime < 3.8
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
      currentTime: film.currentTime
    };
  });
  expect(media.error).toBeNull();
  expect(media.duration).toBeGreaterThan(5);
  expect(media.currentTime).toBeGreaterThan(3);
  expect(media.currentTime).toBeLessThan(4);
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
    window.scrollTo({ top: top + travel * 0.65, behavior: 'instant' });
  }, geometry);

  const currentTime = () => video.evaluate((element) => (element as HTMLVideoElement).currentTime);
  await expect
    .poll(currentTime, { timeout: 10_000, intervals: [100, 250, 500] })
    .toBeGreaterThan(startTime + 2);
  const forwardTime = await currentTime();
  await expect
    .poll(() => page.locator('.ps-cinema').evaluate((element) => Number(element.style.getPropertyValue('--cinema-p'))))
    .toBeGreaterThan(0.5);

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));

  await expect
    .poll(currentTime, { timeout: 10_000, intervals: [100, 250, 500] })
    .toBeLessThan(forwardTime - 2);
  await expect
    .poll(currentTime, { timeout: 10_000, intervals: [100, 250, 500] })
    .toBeLessThan(startTime + 0.25);
});

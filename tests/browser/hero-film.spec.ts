import { expect, test, type Page } from '@playwright/test';

/** The styled, hydrated hero: styles applied and scroll progress wired up. */
async function waitForHeroLayout(page: Page) {
  await page.waitForFunction(
    () => {
      const cinema = document.querySelector<HTMLElement>('.ps-cinema');
      const pin = document.querySelector<HTMLElement>('.ps-cinema__pin');
      if (!cinema || !pin) return false;
      // Stylesheet applied (the hero paints its own background) and the
      // component wired up (it writes scroll progress onto the section).
      const styled = getComputedStyle(cinema).backgroundColor !== 'rgba(0, 0, 0, 0)';
      return styled && cinema.style.getPropertyValue('--cinema-p') !== '';
    },
    undefined,
    { timeout: 20_000 }
  );
}

/** The progress value the hero's own measurement derives from the scroll. */
async function scrollTarget(page: Page) {
  return page.evaluate(() => {
    const section = document.querySelector<HTMLElement>('.ps-cinema');
    const pin = document.querySelector<HTMLElement>('.ps-cinema__pin');
    if (!section || !pin) throw new Error('The pinned hero is not present');
    const travel = section.offsetHeight - pin.offsetHeight;
    const raw =
      travel > 1
        ? (pin.getBoundingClientRect().top - section.getBoundingClientRect().top) / travel
        : -section.getBoundingClientRect().top / Math.max(1, section.getBoundingClientRect().height);
    return Math.max(0, Math.min(1, raw));
  });
}

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
  await expect(section).toHaveAttribute('data-act', '3');

  await page.evaluate(({ top, travel }) => {
    window.scrollTo({ top: top + travel * 0.65, behavior: 'instant' });
  }, geometry);
  await expect(section).toHaveAttribute('data-act', '4');

  const currentTime = () => video.evaluate((element) => (element as HTMLVideoElement).currentTime);
  const progress = () =>
    page.locator('.ps-cinema').evaluate((element) => Number(element.style.getPropertyValue('--cinema-p')));
  await expect
    .poll(currentTime, { timeout: 10_000, intervals: [100, 250, 500] })
    .toBeGreaterThan(startTime + 2);
  await expect.poll(progress, { timeout: 10_000 }).toBeGreaterThan(0.5);
  await expect.poll(canvasFrame, { timeout: 10_000 }).not.toBe(startFrame);

  // Release: the eased value finishes the travel it was given, decelerating,
  // then holds perfectly still on the frame the scroll asked for.
  const releaseTarget = await scrollTarget(page);
  await expect.poll(progress, { timeout: 10_000 }).toBeCloseTo(releaseTarget, 2);
  await page.waitForTimeout(1200);
  const forwardTime = await currentTime();
  await page.waitForTimeout(800);
  expect(await progress()).toBeCloseTo(releaseTarget, 2);
  expect(Math.abs((await currentTime()) - forwardTime)).toBeLessThan(0.06);

  await page.evaluate(({ top, travel }) => {
    window.scrollTo({ top: top + travel, behavior: 'instant' });
  }, geometry);
  await expect(section).toHaveAttribute('data-act', '5');
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

test('coasts after release, settles exactly on the target, and reverses mid-settle', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await waitForHeroLayout(page);
  const section = page.locator('.ps-cinema');
  const film = page.locator('.ps-film__video');
  const progress = () => section.evaluate((element) => Number(element.style.getPropertyValue('--cinema-p')));
  const currentTime = () => film.evaluate((element) => (element as HTMLVideoElement).currentTime);

  const geometry = await page.evaluate(() => {
    const cinema = document.querySelector<HTMLElement>('.ps-cinema');
    const pin = document.querySelector<HTMLElement>('.ps-cinema__pin');
    if (!cinema || !pin) throw new Error('The pinned hero is not present');
    return { top: cinema.getBoundingClientRect().top + window.scrollY, travel: cinema.offsetHeight - pin.offsetHeight };
  });
  const jump = (fraction: number) =>
    page.evaluate(
      (args: { top: number; travel: number; fraction: number }) =>
        window.scrollTo({ top: args.top + args.travel * args.fraction, behavior: 'instant' }),
      { ...geometry, fraction }
    );

  // A release is a coast, not a jump cut: after the page has stopped moving
  // the film is still travelling, and it approaches without passing the target.
  await jump(0.5);
  const releaseTarget = await scrollTarget(page);
  await expect.poll(progress, { timeout: 2_000 }).toBeGreaterThan(releaseTarget * 0.2);
  const settledScroll = await page.evaluate(() => window.scrollY);
  const early = await progress();
  // The page is already still; the film must keep moving out of its own settle.
  await expect.poll(progress, { timeout: 3_000 }).toBeGreaterThan(early + 0.01);
  const later = await progress();
  expect(await page.evaluate(() => window.scrollY)).toBe(settledScroll);
  expect(later).toBeLessThanOrEqual(releaseTarget + 0.0005);

  await expect.poll(progress, { timeout: 10_000 }).toBeCloseTo(releaseTarget, 2);
  await page.waitForTimeout(1200);
  const settled = await progress();
  const settledTime = await currentTime();
  await page.waitForTimeout(800);
  expect(await progress()).toBeCloseTo(settled, 3);
  expect(Math.abs((await currentTime()) - settledTime)).toBeLessThan(0.06);

  // Narration is derived from the same eased value: the chapter at rest is the
  // film's band, and exactly one chapter is visible.
  const restingProgress = await progress();
  await expect(section).toHaveAttribute('data-act', String(Math.min(4, Math.floor(restingProgress * 5)) + 1));
  expect(
    await page.evaluate(
      () =>
        Array.from(document.querySelectorAll<HTMLElement>('.ps-cinema__chapter')).filter(
          (chapter) => getComputedStyle(chapter).visibility === 'visible'
        ).length
    )
  ).toBe(1);

  // Changing direction while the film is still settling must carry it straight
  // back, without jumping or undershooting the new target.
  await jump(0.9);
  await expect.poll(progress, { timeout: 3_000 }).toBeGreaterThan(0.6);
  const outbound = await progress();
  await jump(0.25);
  const reverseTarget = await scrollTarget(page);
  expect(reverseTarget).toBeLessThan(outbound - 0.2);
  await expect.poll(progress, { timeout: 3_000 }).toBeLessThan(outbound - 0.02);
  await expect.poll(progress, { timeout: 10_000 }).toBeCloseTo(reverseTarget, 2);
  await page.waitForTimeout(1200);
  const landed = await progress();
  expect(landed).toBeGreaterThan(reverseTarget - 0.004);
  expect(landed).toBeLessThan(reverseTarget + 0.004);

  // The end of the runway must rest on the final frame and never pass it.
  await jump(1);
  await expect.poll(progress, { timeout: 5_000 }).toBeCloseTo(1, 3);
  await expect.poll(currentTime, { timeout: 5_000 }).toBeGreaterThan(9.5);
  await page.waitForTimeout(400);
  expect(await progress()).toBeLessThanOrEqual(1);
});

test.describe('reduced motion', () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });

  test('still advances the film from scroll instead of freezing on one frame', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const section = page.locator('.ps-cinema');
    await expect(section).toHaveAttribute('data-act', '1');
    await waitForHeroLayout(page);
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
    await expect(section).toHaveAttribute('data-act', '4');
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
    await waitForHeroLayout(page);

    const geometry = await page.evaluate(() => {
      const cinema = document.querySelector<HTMLElement>('.ps-cinema');
      const pin = document.querySelector<HTMLElement>('.ps-cinema__pin');
      if (!cinema || !pin) throw new Error('The pinned hero is not present');
      return { top: cinema.getBoundingClientRect().top + window.scrollY, travel: cinema.offsetHeight - pin.offsetHeight };
    });

    await page.evaluate(({ top, travel }) => window.scrollTo({ top: top + travel * 0.7, behavior: 'instant' }), geometry);
    await expect(section).toHaveAttribute('data-act', '4');
    await expect
      .poll(() => section.evaluate((element) => Number(element.style.getPropertyValue('--cinema-p'))))
      .toBeGreaterThan(0.5);
  });
});

test.describe('narration', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('switches messages on scroll progress alone and freezes when scrolling stops', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const section = page.locator('.ps-cinema');
    await waitForHeroLayout(page);

    const geometry = await page.evaluate(() => {
      const cinema = document.querySelector<HTMLElement>('.ps-cinema');
      const pin = document.querySelector<HTMLElement>('.ps-cinema__pin');
      if (!cinema || !pin) throw new Error('The pinned hero is not present');
      return { top: cinema.getBoundingClientRect().top + window.scrollY, travel: cinema.offsetHeight - pin.offsetHeight };
    });

    const at = async (fraction: number) => {
      await page.evaluate(({ top, travel, fraction: f }) => window.scrollTo({ top: top + travel * f, behavior: 'instant' }), {
        ...geometry,
        fraction
      });
    };
    const visibleChapter = () =>
      page.evaluate(() => {
        const chapters = Array.from(document.querySelectorAll<HTMLElement>('.ps-cinema__chapter'));
        const shown = chapters.filter((chapter) => getComputedStyle(chapter).visibility === 'visible');
        return shown.length === 1 ? shown[0].className.split('ps-cinema__chapter--')[1] : `count:${shown.length}`;
      });

    for (const [fraction, step] of [
      [0.1, '1'],
      [0.3, '2'],
      [0.5, '3'],
      [0.7, '4'],
      [0.95, '5']
    ] as const) {
      await at(fraction);
      await expect(section).toHaveAttribute('data-act', step);
      await expect.poll(visibleChapter).toBe(step);
    }

    // Settle check: after the short coast finishes, message and frame hold.
    await at(0.5);
    await expect.poll(visibleChapter).toBe('3');
    const messageTarget = await scrollTarget(page);
    await expect
      .poll(() => section.evaluate((element) => Number(element.style.getPropertyValue('--cinema-p'))), { timeout: 10_000 })
      .toBeCloseTo(messageTarget, 2);
    await page.waitForTimeout(1200);
    const before = await page.locator('.ps-film__video').evaluate((element) => (element as HTMLVideoElement).currentTime);
    await page.waitForTimeout(900);
    expect(await visibleChapter()).toBe('3');
    expect(await page.locator('.ps-film__video').evaluate((element) => (element as HTMLVideoElement).currentTime)).toBeCloseTo(before, 2);
  });
});

test.describe('large desktop', () => {
  test.use({ viewport: { width: 2560, height: 1440 } });

  test('contains the portrait film instead of cropping it into a landscape hero', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await waitForHeroLayout(page);
    await expect(page.locator('.ps-film')).toHaveAttribute('data-painted', 'true');
    await expect(page.locator('.ps-cinema__filmCue')).toBeVisible();
    await expect(page.locator('.ps-cinema__chapter--1 .ps-hero__actions')).toBeVisible();

    const box = await page.locator('.ps-cinema__art').boundingBox();
    expect(box).not.toBeNull();
    // The film sits in a framed panel inset from the screen edges, and the
    // contained video keeps its portrait ratio, so nothing is cropped.
    expect(box?.width).toBeLessThanOrEqual(2560 - 16);
    expect(box?.x).toBeGreaterThan(4);
    expect(await page.locator('.ps-cinema__art').evaluate((element) => parseFloat(getComputedStyle(element).borderTopLeftRadius))).toBeGreaterThan(8);
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

    // The closing message carries the hero CTAs; they must fit the viewport.
    await page.evaluate(
      ({ top, travel }) => window.scrollTo({ top: top + travel * 0.95, behavior: 'instant' }),
      geometry
    );
    const actions = page.locator('.ps-cinema[data-act="5"] .ps-cinema__chapter--5 .ps-hero__actions');
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

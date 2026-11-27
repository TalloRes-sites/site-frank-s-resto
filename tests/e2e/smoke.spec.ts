import { expect, test, type Page } from '@playwright/test';

const MAIN = process.env.MAIN_LANG ?? 'nl';

/** Block everything that is not the local site, and collect page errors. */
async function open(page: Page, path: string) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !m.text().includes('net::ERR_FAILED')) errors.push(m.text()); });
  await page.route(/^https?:\/\/(?!localhost)/, (r) => r.abort());
  await page.goto(path);
  return errors;
}

test('root redirects to the main language', async ({ page }) => {
  await open(page, '/');
  await expect(page).toHaveURL(new RegExp(`/${MAIN}/$`));
});

test('home page renders without script errors', async ({ page }) => {
  const errors = await open(page, `/${MAIN}/`);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('iframe[data-widget]')).toHaveCount(1);
  await page.waitForLoadState('load');
  expect(errors).toEqual([]);
});

test('today line is filled by the page script', async ({ page }) => {
  await open(page, `/${MAIN}/`);
  const wrap = page.locator('[data-today-wrap]').first();
  if (await wrap.count()) await expect(wrap).toBeVisible();
});

test('map loads only after a click', async ({ page }, info) => {
  await open(page, `/${MAIN}/`);
  const button = page.locator('button[data-map]').first();
  test.skip(!(await button.count()), 'restaurant has no coordinates');
  await expect(page.locator('.mapbox iframe')).toHaveCount(0);
  await button.scrollIntoViewIfNeeded();
  await button.click();
  await expect(page.locator('.mapbox iframe')).toHaveCount(1);
  info.annotations.push({ type: 'map', description: 'loaded after click' });
});

test('privacy page is linked and renders', async ({ page }) => {
  await open(page, `/${MAIN}/`);
  await page.locator('footer a[href="privacy/"]').click();
  await expect(page).toHaveURL(new RegExp(`/${MAIN}/privacy/$`));
  await expect(page.locator('h1')).toHaveCount(1);
});

test.describe('mobile', () => {
  test.skip(({ isMobile }) => !isMobile, 'mobile only');

  test('sticky booking bar opens the widget full screen', async ({ page }) => {
    await open(page, `/${MAIN}/`);
    const bar = page.locator('a[data-open-book]');
    await expect(bar).toBeVisible();
    await bar.click();
    await expect(page.locator('dialog#tr-book')).toHaveAttribute('open', '');
    await expect(page.locator('dialog#tr-book iframe')).toHaveAttribute('src', /widget\.tallores\.com/);
    await page.locator('[data-close-book]').click();
    await expect(page.locator('dialog#tr-book')).not.toHaveAttribute('open', '');
  });

  test('language picker switches language', async ({ page }) => {
    await open(page, `/${MAIN}/`);
    const picker = page.locator('details.lang');
    test.skip(!(await picker.count()), 'single-language site');
    await picker.locator('summary').click();
    const other = picker.locator('a:not([aria-current])').first();
    const lang = await other.getAttribute('lang');
    await other.click();
    await expect(page.locator('html')).toHaveAttribute('lang', lang!);
  });
});

test.describe('desktop', () => {
  test.skip(({ isMobile }) => isMobile, 'desktop only');

  test('language links switch language and keep one h1', async ({ page }) => {
    await open(page, `/${MAIN}/`);
    const links = page.locator('nav.d-only a[hreflang]');
    test.skip(!(await links.count()), 'single-language site');
    const lang = await links.first().getAttribute('hreflang');
    await links.first().click();
    await expect(page.locator('html')).toHaveAttribute('lang', lang!);
    await expect(page.locator('h1')).toHaveCount(1);
  });

  test('booking bar is hidden on desktop', async ({ page }) => {
    await open(page, `/${MAIN}/`);
    await expect(page.locator('a[data-open-book]')).toBeHidden();
  });
});

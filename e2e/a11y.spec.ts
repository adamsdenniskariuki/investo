import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { completeLesson } from './helpers';

const VIEWPORTS = {
  mobile: { width: 360, height: 780 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 900 },
} as const;

const PAGES: Array<{ name: string; open: (page: Page) => Promise<void> }> = [
  { name: 'home', open: (p) => p.goto('/').then(() => undefined) },
  { name: 'track', open: (p) => p.goto('/#/track/kenya').then(() => undefined) },
  {
    name: 'lesson diagram step',
    open: async (p) => {
      await p.goto('/#/lesson/b03');
      while (!(await p.locator('main figure').count())) await p.getByRole('button', { name: 'Next', exact: true }).click();
    },
  },
  {
    name: 'quiz feedback',
    open: async (p) => {
      await p.goto('/#/lesson/k04');
      const next = p.getByRole('button', { name: 'Next', exact: true });
      while (await next.count()) await next.click();
      await p.getByRole('button', { name: 'Start the quiz' }).click();
      await p.getByRole('radio').first().check();
      await p.getByRole('button', { name: 'Check answer' }).click();
    },
  },
  {
    name: 'lesson results',
    open: async (p) => {
      await p.goto('/#/lesson/b01');
      await completeLesson(p);
    },
  },
  { name: 'calculators', open: (p) => p.goto('/#/tools').then(() => undefined) },
  { name: 'global track', open: (p) => p.goto('/#/track/global').then(() => undefined) },
  { name: 'currency tool', open: (p) => p.goto('/#/tools/fx-return').then(() => undefined) },
  {
    name: 'calculator with error',
    open: async (p) => {
      await p.goto('/#/tools/bond');
      await p.getByRole('textbox', { name: 'Years to maturity' }).fill('x');
    },
  },
  { name: 'progress', open: (p) => p.goto('/#/progress').then(() => undefined) },
  { name: 'settings', open: (p) => p.goto('/#/settings').then(() => undefined) },
  { name: 'about', open: (p) => p.goto('/#/about').then(() => undefined) },
];

async function scan(page: Page) {
  // Let toasts and transitions settle so axe sees final colours.
  await page.waitForTimeout(150);
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  const summary = results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
  expect(summary).toEqual([]);
}

for (const [vpName, viewport] of Object.entries(VIEWPORTS)) {
  for (const scheme of ['light', 'dark'] as const) {
    test.describe(`${vpName} ${scheme}`, () => {
      test.use({ viewport, colorScheme: scheme });
      for (const pg of PAGES) {
        test(`axe: ${pg.name}`, async ({ page }) => {
          await pg.open(page);
          await expect(page.locator('html')).toHaveAttribute('data-theme', scheme);
          const width = await page.evaluate(() => document.documentElement.scrollWidth);
          expect(width, 'no horizontal scrolling').toBeLessThanOrEqual(viewport.width);
          await scan(page);
        });
      }
    });
  }
}

for (const palette of ['savanna', 'ocean', 'sunset']) {
  for (const mode of ['light', 'dark']) {
    test(`axe: ${palette} ${mode} theme on a diagram and a calculator`, async ({ page }) => {
      await page.addInitScript(
        ([palette, mode]) => {
          if (!localStorage.getItem('investo:v1'))
            localStorage.setItem('investo:v1', JSON.stringify({ settings: { palette, mode, font: 'atkinson', textSize: 'md' } }));
        },
        [palette, mode],
      );
      await page.goto('/#/lesson/k01');
      while (!(await page.locator('main figure').count())) await page.getByRole('button', { name: 'Next', exact: true }).click();
      await scan(page);
      await page.goto('/#/tools/mmf-tbill');
      await scan(page);
    });
  }
}

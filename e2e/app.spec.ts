import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { completeLesson, xp } from './helpers';

test('home shows the disclaimer and the Stage 1 tracks', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByText(/not financial advice/i).first()).toBeVisible();
  await expect(page.getByRole('link', { name: /Investing basics/ }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: /Kenya/ }).first()).toBeVisible();
});

test('a lesson can be completed and earns XP and a badge', async ({ page }) => {
  await page.goto('/#/lesson/b01');
  expect(await xp(page)).toBe(0);
  await completeLesson(page);
  expect(await xp(page)).toBeGreaterThan(0);
  await expect(page.getByRole('heading', { name: 'New badges' })).toBeVisible();

  await page.goto('/#/track/basics');
  await expect(page.locator('.lesson-link.done')).toHaveCount(1);
});

test('lessons show accessible diagrams', async ({ page }) => {
  await page.goto('/#/lesson/k05');
  const next = page.getByRole('button', { name: 'Next', exact: true });
  let seen = 0;
  for (;;) {
    seen += await page.locator('main figure svg[role="img"]').count();
    if (!(await next.count())) break;
    await next.click();
  }
  expect(seen).toBeGreaterThanOrEqual(2);
});

test('calculators update live and validate input', async ({ page }) => {
  await page.goto('/#/tools/compound');
  const years = page.getByRole('textbox', { name: 'Years' });
  await years.fill('20');
  await expect(page.getByText('Balance after 20 years', { exact: true })).toBeVisible();
  await expect(page.locator('main figure figcaption')).toContainText('20 years');

  await years.fill('abc');
  await expect(years).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByText('Enter a number.')).toBeVisible();

  // Switching tools resets to that tool's own inputs.
  await page.goto('/#/tools/fees');
  await expect(page.getByRole('textbox', { name: 'Years' })).toHaveValue('20');
  await expect(page.getByText('Cost of the fee', { exact: true })).toBeVisible();
});

test('progress can be exported, reset and imported', async ({ page }) => {
  await page.goto('/#/lesson/b01');
  await completeLesson(page);
  const earned = await xp(page);

  await page.goto('/#/progress');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export backup' }).click();
  const file = await (await download).path();
  const backup = JSON.parse(await readFile(file, 'utf8'));
  expect(backup).toMatchObject({ app: 'investo', format: 1 });
  expect(backup.progress.xp).toBe(earned);

  await page.getByRole('button', { name: 'Reset progress…' }).click();
  await page.getByRole('button', { name: 'Yes, reset my progress' }).click();
  expect(await xp(page)).toBe(0);

  await page.locator('#import-file').setInputFiles(file);
  await page.getByRole('button', { name: 'Replace my progress' }).click();
  await expect(page.getByText('Backup imported.')).toBeVisible();
  expect(await xp(page)).toBe(earned);
});

test('importing an invalid file shows an error', async ({ page }) => {
  await page.goto('/#/progress');
  await page.locator('#import-file').setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from('{"hello":1}') });
  await expect(page.locator('.callout.danger')).toBeVisible();
});

test('settings switch to dark mode and persist', async ({ page }) => {
  await page.goto('/#/settings');
  await page.getByRole('radio', { name: 'Dark' }).check();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('coming-soon tracks and unknown pages are handled', async ({ page }) => {
  await page.goto('/#/track/crypto');
  await expect(page.getByText(/This stage is planned/)).toBeVisible();
  await page.goto('/#/does-not-exist');
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
});

test('paper replay plays a full session and awards the badge', async ({ page }) => {
  await page.goto('/#/tools/replay');
  await page.getByLabel('Stop-loss for the next buy').selectOption('5');
  await page.getByRole('button', { name: 'Buy 25%' }).click();
  await expect(page.getByRole('status').filter({ hasText: /Bought \d/ })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sell all' })).toBeEnabled();
  await page.getByRole('button', { name: 'Next day' }).click();
  await expect(page.getByRole('status').filter({ hasText: /Day 1:/ })).toBeVisible();
  await page.getByRole('button', { name: 'Skip to end' }).click();
  await expect(page.getByRole('heading', { name: 'Session review' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Next day' })).toBeDisabled();
  await page.goto('/#/progress');
  await expect(page.locator('.badges li', { hasText: 'Paper trader' })).toContainText('(earned)');
});

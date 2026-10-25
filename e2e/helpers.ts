import { expect, type Page } from '@playwright/test';

/** Walks through every step of the open lesson, then answers each quiz question with the first option. */
export async function completeLesson(page: Page) {
  const next = page.getByRole('button', { name: 'Next', exact: true });
  while (await next.count()) await next.click();
  await page.getByRole('button', { name: 'Start the quiz' }).click();
  for (;;) {
    await page.getByRole('radio').first().check();
    await page.getByRole('button', { name: 'Check answer' }).click();
    const more = page.getByRole('button', { name: /Next question|See results/ });
    const label = await more.textContent();
    await more.click();
    if (label?.includes('See results')) break;
  }
  await expect(page.getByRole('heading', { name: 'Lesson complete' })).toBeVisible();
}

export async function xp(page: Page): Promise<number> {
  const text = (await page.locator('.xp-pill').textContent()) ?? '';
  return Number(text.replace(/\D/g, ''));
}

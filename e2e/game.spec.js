import { test, expect } from '@playwright/test';

test('charge la page et affiche le canvas', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/POC-MAN/i);
  const canvas = page.locator('#canvas');
  await expect(canvas).toBeVisible();
});

test('demarre une partie avec Espace', async ({ page }) => {
  await page.goto('/');
  await page.locator('#canvas').click();
  await page.keyboard.press('Space');
  await expect(page.locator('#hud-score')).toHaveText('0');
});

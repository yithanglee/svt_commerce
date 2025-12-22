import { expect, test } from '@playwright/test';

test('index page renders hero heading', async ({ page }) => {
	await page.goto('/');
	await expect(
		page.getByRole('heading', { level: 1, name: /find your next treasure/i })
	).toBeVisible({ timeout: 15000 });
});

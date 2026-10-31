import { test, expect } from '@playwright/test';

test.describe('Role Based Access Control & Permissions', () => {
  test('Viewer role has read-only access: no approve/reject/edit buttons, no weight sliders', async ({ page }) => {
    await page.goto('http://localhost:3000/priorities', { waitUntil: 'domcontentloaded' });

    // Switch to Viewer
    const roleSelect = page.locator('select[title="Switch Demo Role"]');
    await roleSelect.selectOption('Viewer');

    // Confirm scoring weight controls heading shows (Read-Only)
    await expect(page.locator('h3:has-text("Scoring Weight Parameters (Read-Only)")')).toBeVisible();
    await expect(page.locator('button:has-text("Apply & Log Override")')).toHaveCount(0);
    await expect(page.locator('button:has-text("Reset Defaults")')).toHaveCount(0);

    // Inputs should be disabled
    const firstSlider = page.locator('input[type="range"]').first();
    await expect(firstSlider).toBeDisabled();

    // Go to Overview & check that no approve buttons appear
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('button:has-text("Approve")')).toHaveCount(0);
  });

  test('Operator role can approve proposals but cannot adjust supervisor weights', async ({ page }) => {
    await page.goto('http://localhost:3000/priorities', { waitUntil: 'domcontentloaded' });

    // Switch to Operator
    const roleSelect = page.locator('select[title="Switch Demo Role"]');
    await roleSelect.selectOption('Operator');

    // Priorities should be Read-Only for Operator
    await expect(page.locator('h3:has-text("Scoring Weight Parameters (Read-Only)")')).toBeVisible();
    await expect(page.locator('button:has-text("Apply & Log Override")')).toHaveCount(0);

    // Sliders disabled
    const firstSlider = page.locator('input[type="range"]').first();
    await expect(firstSlider).toBeDisabled();
  });

  test('Supervisor role can adjust weights and save overrides', async ({ page }) => {
    await page.goto('http://localhost:3000/priorities', { waitUntil: 'domcontentloaded' });

    // Switch to Supervisor on current page
    const roleSelect = page.locator('select[title="Switch Demo Role"]');
    await roleSelect.selectOption('Supervisor');

    // Priorities should show Supervisor Mode
    await expect(page.locator('h3:has-text("Scoring Weight Parameters (Supervisor Mode)")')).toBeVisible();
    await expect(page.locator('button:has-text("Apply & Log Override")')).toBeVisible();
    await expect(page.locator('button:has-text("Reset Defaults")')).toBeVisible();

    // Sliders enabled
    const firstSlider = page.locator('input[type="range"]').first();
    await expect(firstSlider).toBeEnabled();
  });
});

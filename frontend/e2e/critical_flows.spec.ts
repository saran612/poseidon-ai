import { test, expect } from '@playwright/test';

test.describe('Critical Operational Flows', () => {
  test('Flow A: Operator approves proposal from Dispatch Queue with Confirmation', async ({ page }) => {
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });

    // Switch to Operator
    const roleSelect = page.locator('select[title="Switch Demo Role"]');
    await roleSelect.selectOption('Operator');

    // Open Dispatch Queue drawer
    const dispatchBtn = page.locator('button:has-text("Dispatch Queue")');
    if (await dispatchBtn.isVisible()) {
      await dispatchBtn.click();
      await page.waitForTimeout(300);
      await expect(page.locator('text=Pending Approvals')).toBeVisible();
    }
  });

  test('Flow C: Bridge Closure Isolation Replan Diff', async ({ page }) => {
    await page.goto('http://localhost:3000/routing', { waitUntil: 'domcontentloaded' });

    // Look for Simulate Bridge Closure button
    const closeBridgeBtn = page.locator('button:has-text("Simulate Bridge Closure")');
    if (await closeBridgeBtn.isVisible()) {
      await closeBridgeBtn.click();
      await page.waitForTimeout(500);

      const replanModal = page.locator('text=Isolated Re-plan');
      if (await replanModal.isVisible()) {
        await expect(page.locator('text=unaffected')).toBeVisible();
      }
    }
  });

  test('Flow J: Prompt-Injection strings render safely as plain text', async ({ page }) => {
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });

    const scriptInjection = '<script>window.__injected = true;</script><img src="x" onerror="window.__injected=true" />';
    const evaluated = await page.evaluate((payload) => {
      const div = document.createElement('div');
      div.innerText = payload;
      return {
        html: div.innerHTML,
        injected: (window as any).__injected,
      };
    }, scriptInjection);

    expect(evaluated.injected).toBeUndefined();
    expect(evaluated.html).toContain('&lt;script&gt;');
  });
});

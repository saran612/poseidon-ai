const { chromium } = require('playwright');
const { AxeBuilder } = require('@axe-core/playwright');

async function testTheme(theme) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.addInitScript((t) => {
    localStorage.setItem('poseidon-theme', t);
  }, theme);
  await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();

  const contrast = results.violations.find(v => v.id === 'color-contrast');
  if (contrast) {
    console.log(`=== Contrast nodes for ${theme} ===`);
    contrast.nodes.slice(0, 10).forEach(n => {
      console.log('HTML:', n.html);
      console.log('Summary:', n.failureSummary);
    });
  }
  await browser.close();
}

testTheme('dark');

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

  const criticalOrSerious = results.violations.filter(v => v.impact === 'critical' || v.impact === 'serious');
  console.log(`[Axe ${theme}] Total violations: ${results.violations.length}, Serious/Critical: ${criticalOrSerious.length}`);
  if (criticalOrSerious.length > 0) {
    console.log(JSON.stringify(criticalOrSerious.map(v => ({ id: v.id, impact: v.impact, help: v.help, nodes: v.nodes.length })), null, 2));
  }
  await browser.close();
}

async function run() {
  console.log('Testing Light theme:');
  await testTheme('light');
  console.log('Testing Dark theme:');
  await testTheme('dark');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

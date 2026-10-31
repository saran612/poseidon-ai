const { chromium } = require('playwright');
const path = require('path');

const widths = [1024, 1440, 1920];
const screenshotDir = path.join(__dirname, 'docs/screenshots');

async function run() {
  const browser = await chromium.launch({ headless: true });

  for (const width of widths) {
    // 1. Light theme
    {
      const context = await browser.newContext({
        viewport: { width, height: 1080 }
      });
      const page = await context.newPage();
      await page.addInitScript(() => {
        localStorage.setItem('poseidon-theme', 'light');
      });
      await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: path.join(screenshotDir, `overview-before-${width}-light.png`),
        fullPage: true
      });
      await context.close();
    }

    // 2. Dark theme
    {
      const context = await browser.newContext({
        viewport: { width, height: 1080 }
      });
      const page = await context.newPage();
      await page.addInitScript(() => {
        localStorage.setItem('poseidon-theme', 'dark');
      });
      await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
      await page.screenshot({
        path: path.join(screenshotDir, `overview-before-${width}-dark.png`),
        fullPage: true
      });
      await context.close();
    }
  }

  await browser.close();
  console.log('Baseline screenshots taken successfully!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

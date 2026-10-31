const { chromium } = require('playwright');

async function testToggle() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle' });

  // Initial class on html
  const initialClass = await page.evaluate(() => document.documentElement.className);
  console.log('Initial html class:', initialClass);

  // Click theme toggle button (in header)
  const toggleBtn = page.locator('header button[title*="theme" i], header button:has(svg.lucide-sun), header button:has(svg.lucide-moon)');
  await toggleBtn.click();
  await page.waitForTimeout(300);

  const toggledClass = await page.evaluate(() => document.documentElement.className);
  const storedTheme = await page.evaluate(() => localStorage.getItem('poseidon-theme'));
  console.log('After toggle html class:', toggledClass, 'Stored theme:', storedTheme);

  await browser.close();
}

testToggle().catch(err => {
  console.error(err);
  process.exit(1);
});

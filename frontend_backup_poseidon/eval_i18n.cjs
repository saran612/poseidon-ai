const { chromium } = require('playwright');

async function check() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:3000/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('aside');
  const text = await page.locator('aside').innerText();
  console.log('Sidebar text:\n', text);
  await browser.close();
}

check().catch(err => {
  console.error(err);
  process.exit(1);
});

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const pages = [
  { name: 'overview', path: '/' },
  { name: 'map', path: '/map' },
  { name: 'priorities', path: '/priorities' },
  { name: 'resources', path: '/resources' },
  { name: 'shelters', path: '/shelters' },
  { name: 'routing', path: '/routing' },
  { name: 'decisions', path: '/decisions' },
  { name: 'weather', path: '/weather' },
  { name: 'analytics', path: '/analytics' },
  { name: 'logs', path: '/logs' },
  { name: 'settings', path: '/settings' },
];

const themes = ['light', 'dark'];
const widths = [1024, 1440, 1920];
const targetDir = path.join(__dirname, 'docs/verification');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

async function run() {
  const browser = await chromium.launch({ headless: true });

  for (const pageInfo of pages) {
    for (const theme of themes) {
      for (const width of widths) {
        const context = await browser.newContext({
          viewport: { width, height: 900 }
        });
        const page = await context.newPage();
        await page.addInitScript((th) => {
          localStorage.setItem('poseidon-theme', th);
        }, theme);

        try {
          await page.goto(`http://127.0.0.1:3000${pageInfo.path}`, { waitUntil: 'domcontentloaded' });
          await page.evaluate((th) => {
            document.documentElement.classList.toggle('dark', th === 'dark');
          }, theme);
          await page.waitForTimeout(600);

          const filename = `${pageInfo.name}-${theme}-${width}.png`;
          const filePath = path.join(targetDir, filename);
          await page.screenshot({ path: filePath, fullPage: false });
          console.log(`Captured: ${filename}`);
        } catch (e) {
          console.error(`Failed ${pageInfo.name}:`, e.message);
        } finally {
          await context.close();
        }
      }
    }
  }

  await browser.close();
  console.log('All verification screenshots captured!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

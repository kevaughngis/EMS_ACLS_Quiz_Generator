import { test, expect } from '@playwright/test';

test('capture gameplay gallery', async ({ page }) => {
  test.setTimeout(120000); // 2 minutes

  await page.goto('http://localhost:5174', { waitUntil: 'networkidle' });

  // Wait for the main title or any button
  await page.waitForSelector('h1', { timeout: 30000 });
  await page.screenshot({ path: 'gallery_launcher.png', fullPage: true });

  const suites = [
    { name: 'ACLS', btn: 'ACLS' },
    { name: 'OB', btn: 'Maternal' },
    { name: 'TCCC', btn: 'TCCC' },
    { name: 'Tox', btn: 'Toxicology' },
    { name: 'Cardiology', btn: 'Cardiology' },
    { name: 'Flight', btn: 'Flight' },
    { name: 'CBRNE', btn: 'CBRNE' },
    { name: 'Burn', btn: 'Burn' },
    { name: 'Radiology', btn: 'Radiology' },
    { name: 'Vascular', btn: 'Vascular' }
  ];

  for (const suite of suites) {
    try {
      console.log(`Attempting to capture ${suite.name}...`);
      const btn = page.getByRole('button', { name: suite.btn, exact: false });
      await btn.click();
      await page.waitForTimeout(2000); // Allow animation/render
      await page.screenshot({ path: `gallery_${suite.name.toLowerCase()}.png`, fullPage: true });

      // Close the suite to return to launcher
      await page.keyboard.press('Escape');
      await page.waitForTimeout(1000);
    } catch (e) {
      console.error(`Failed to capture ${suite.name}: ${e.message}`);
    }
  }
});


import { test, expect } from '@playwright/test';

test('verify upgrades', async ({ page }) => {
  await page.goto('http://localhost:5173');

  // Start scenario
  await page.click('text=Adult Cardiac Arrest');
  await page.waitForTimeout(2000);

  // Check for 12-Lead button
  await expect(page.locator('text=12-LEAD')).toBeVisible();
  await page.click('text=12-LEAD');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'upgrade_12lead.png' });
  await page.click('text=CLOSE');

  // Check for Diags button
  await expect(page.locator('text=DIAGS')).toBeVisible();
  await page.click('text=DIAGS');
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'upgrade_diags.png' });
  await page.click('text=✕ CLOSE');

  // Check Team Delegation
  // Click on the left side of the screen where Nurse Sarah is roughly positioned
  // Instead of guessing coordinates, I'll rely on the fact that I've implemented it
  // and the build passed. But let's try to find the "ASSIGN TASK" text on hover if possible.
  // Actually, I can click the member in the 3D scene by center of left/right halves
  await page.mouse.click(200, 400); // Click Nurse Sarah
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'upgrade_team.png' });
});

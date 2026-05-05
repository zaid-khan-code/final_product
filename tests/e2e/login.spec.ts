import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('should successfully log in with valid credentials', async ({ page }) => {
    // Go to login page
    await page.goto('/login');

    // Fill in credentials
    await page.fill('input[placeholder="Enter email"]', 'zaidbinasif468@gmail.com');
    await page.fill('input[placeholder="Enter password"]', 'zaidkhan123');

    // Click sign in button
    await page.click('button[type="submit"]');

    // Expect to be redirected to dashboard
    // Since it's a super_admin, it should go to /dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // Verify that user name or role is visible
    await expect(page.locator('.pg-greet')).toContainText('Good');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[placeholder="Enter email"]', 'wrong@example.com');
    await page.fill('input[placeholder="Enter password"]', 'wrongpass');
    await page.click('button[type="submit"]');

    // Expect error message
    await expect(page.locator('text=Invalid email or password')).toBeVisible();
  });
});

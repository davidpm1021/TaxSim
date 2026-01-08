import { test, expect } from '@playwright/test';

test.describe('W-2 Form Entry', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate through the flow to get to W2 entry
    await page.goto('/');

    // Welcome - click the CTA button
    await page.getByRole('button', { name: /start|begin|get started/i }).click();

    // Filing Status - Single (use text-based selection for resilience)
    await page.getByText('Single').click();
    await page.getByRole('button', { name: /continue/i }).click();

    // Basic Info
    await page.getByLabel(/first name/i).fill('Test');
    await page.getByLabel(/last name/i).fill('User');
    await page.locator('input[type="date"]').fill('1990-05-15');
    await page.getByRole('button', { name: /continue/i }).click();

    // Dependent Status - select "Yes"
    await page.locator('.option').filter({ hasText: /yes/i }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // Income Types - W2 (use text-based selection)
    await page.locator('.income-option').filter({ hasText: /w-?2/i }).click();
    await page.getByRole('button', { name: /continue/i }).click();

    // Now on W2 entry page
    await expect(page).toHaveURL(/\/income\/w2/);
  });

  test('should display W-2 entry page with form', async ({ page }) => {
    // Verify page loaded with heading
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/w-?2/i);

    // Should have a continue button
    await expect(page.getByRole('button', { name: /continue/i })).toBeVisible();
  });

  test('should have editable form fields', async ({ page }) => {
    // Look for any text inputs on the page
    const inputs = page.locator('input[type="text"], input:not([type])');
    const inputCount = await inputs.count();

    // Should have multiple input fields for W2 data
    expect(inputCount).toBeGreaterThan(0);
  });

  test('should allow entering employer name', async ({ page }) => {
    // Find the employer name input by placeholder
    const employerInput = page.locator('input[placeholder="Employer name"]');

    // Fill something and verify it takes input
    await employerInput.fill('Test Company');
    await expect(employerInput).toHaveValue('Test Company');
  });

  test('should show summary bar with totals', async ({ page }) => {
    // Look for summary section
    const summaryBar = page.locator('.summary-bar, .summary, [class*="summary"]');
    await expect(summaryBar.first()).toBeVisible();
  });

  test('should allow adding another W-2', async ({ page }) => {
    // Look for add button
    const addButton = page.getByRole('button', { name: /add.*w-?2/i });
    await expect(addButton).toBeVisible();
  });

  test('should display educational help button', async ({ page }) => {
    // Look for help/question button
    const helpButton = page.locator('[class*="help"], button:has-text("?")').first();
    await expect(helpButton).toBeVisible();
  });

  test('should navigate to income summary on continue', async ({ page }) => {
    // Fill required W2 data
    await page.locator('input[placeholder="Employer name"]').fill('Test Company');
    await page.locator('input[placeholder="Street address"]').first().fill('123 Main St');
    await page.locator('input[placeholder="City, State ZIP"]').first().fill('New York, NY 10001');

    // Fill Box 1 (wages) - type in the currency field
    const wagesInput = page.locator('.box-1 input.currency');
    await wagesInput.click();
    await wagesInput.fill('50000');

    // Click continue
    await page.getByRole('button', { name: /continue/i }).click();

    // Should navigate to income summary
    await expect(page).toHaveURL(/\/income\/summary/);
  });
});

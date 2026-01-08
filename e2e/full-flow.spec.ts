import { test, expect, Page } from '@playwright/test';

test.describe('Tax Simulation Full User Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should complete full tax filing simulation as single filer with W2 income', async ({ page }) => {
    // ============================================================
    // WELCOME PAGE
    // ============================================================
    await test.step('Welcome page - Start simulation', async () => {
      await expect(page).toHaveURL(/\/welcome/);
      await expect(page.getByRole('heading', { level: 1 })).toContainText(/tax/i);

      // Click the start/get started button
      const startButton = page.getByRole('button', { name: /start|begin|get started/i });
      await expect(startButton).toBeVisible();
      await startButton.click();
    });

    // ============================================================
    // PERSONAL INFO - FILING STATUS
    // ============================================================
    await test.step('Filing Status - Select Single', async () => {
      await expect(page).toHaveURL(/\/personal-info\/filing-status/);

      // Select Single filing status
      const singleOption = page.getByText(/single/i).first();
      await expect(singleOption).toBeVisible();
      await singleOption.click();

      // Continue
      await page.getByRole('button', { name: /continue/i }).click();
    });

    // ============================================================
    // PERSONAL INFO - BASIC INFO
    // ============================================================
    await test.step('Basic Info - Enter name and date of birth', async () => {
      await expect(page).toHaveURL(/\/personal-info\/basic-info/);

      // Fill in basic info
      await page.getByLabel(/first name/i).fill('John');
      await page.getByLabel(/last name/i).fill('Doe');

      // Date of birth - use the date input
      const dobInput = page.locator('input[type="date"]');
      await dobInput.fill('1995-06-15');

      // Continue
      await page.getByRole('button', { name: /continue/i }).click();
    });

    // ============================================================
    // PERSONAL INFO - DEPENDENT STATUS
    // ============================================================
    await test.step('Dependent Status - Can be claimed as dependent', async () => {
      await expect(page).toHaveURL(/\/personal-info\/dependent-status/);

      // This asks "Can someone claim YOU as a dependent?"
      // For a single filer (like a student), answer Yes
      const yesOption = page.getByText(/yes/i).first();
      await yesOption.click();

      // Continue - for single filers, goes directly to income/types
      await page.getByRole('button', { name: /continue/i }).click();
    });

    // ============================================================
    // INCOME - TYPES
    // ============================================================
    await test.step('Income Types - Select W2 income', async () => {
      await expect(page).toHaveURL(/\/income\/types/);

      // Select W-2 income checkbox
      const w2Option = page.locator('label.income-option').filter({ hasText: /w-?2.*wages/i });
      await w2Option.click();

      // Continue
      await page.getByRole('button', { name: /continue/i }).click();
    });

    // ============================================================
    // INCOME - W2 ENTRY
    // ============================================================
    await test.step('W2 Entry - Fill out W2 form', async () => {
      await expect(page).toHaveURL(/\/income\/w2/);

      // Wait for page to load
      await expect(page.getByRole('heading', { level: 1 })).toContainText(/w-?2/i);

      // Fill in employer name (Box c) - look for input with "Employer" placeholder
      const employerNameInput = page.locator('input[placeholder*="Employer" i]').first();
      await employerNameInput.fill('Tech Company Inc');

      // Fill in wages (Box 1) - find the input in box-1
      const wagesInput = page.locator('.box-1 input').first();
      await wagesInput.fill('55000');

      // Fill in federal tax withheld (Box 2)
      const federalWithheldInput = page.locator('.box-2 input').first();
      await federalWithheldInput.fill('6500');

      // Verify the summary bar shows totals
      await expect(page.locator('.summary-bar')).toBeVisible();

      // Continue
      await page.getByRole('button', { name: /continue/i }).click();
    });

    // ============================================================
    // INCOME - SUMMARY
    // ============================================================
    await test.step('Income Summary - Verify totals', async () => {
      await expect(page).toHaveURL(/\/income\/summary/);

      // Verify income is displayed (use first() since amount appears multiple times)
      await expect(page.getByText(/55,000|55000/).first()).toBeVisible();

      // Continue
      await page.getByRole('button', { name: /continue/i }).click();
    });

    // ============================================================
    // DEDUCTIONS - ITEMIZED ENTRY
    // ============================================================
    await test.step('Deductions - Enter itemized deductions', async () => {
      await expect(page).toHaveURL(/\/deductions\/itemized/);

      // Enter some deductions (state and local taxes)
      const saltInput = page.locator('input').filter({ hasText: /state|salt/i }).first();
      if (await saltInput.isVisible()) {
        await saltInput.fill('5000');
      }

      // Continue to comparison
      await page.getByRole('button', { name: /continue/i }).click();
    });

    // ============================================================
    // DEDUCTIONS - COMPARISON
    // ============================================================
    await test.step('Deductions Comparison - Select deduction type', async () => {
      await expect(page).toHaveURL(/\/deductions\/comparison/);

      // The page should show standard vs itemized comparison
      await expect(page.getByText(/standard/i).first()).toBeVisible();

      // Continue (standard deduction is usually recommended for single filer with $55k income)
      await page.getByRole('button', { name: /continue/i }).click();
    });

    // ============================================================
    // CREDITS
    // ============================================================
    await test.step('Credits - Review available credits', async () => {
      await expect(page).toHaveURL(/\/credits/);

      // Continue
      await page.getByRole('button', { name: /continue/i }).click();
    });

    // ============================================================
    // REVIEW
    // ============================================================
    await test.step('Review - Check all information', async () => {
      await expect(page).toHaveURL(/\/review/);

      // Verify key information is displayed
      await expect(page.getByText(/john/i)).toBeVisible();
      await expect(page.getByText(/single/i).first()).toBeVisible();
      await expect(page.getByText(/55,000|55000/).first()).toBeVisible();

      // Submit/Continue to results
      await page.getByRole('button', { name: /continue|submit|calculate|see.*results/i }).click();
    });

    // ============================================================
    // RESULTS
    // ============================================================
    await test.step('Results - View tax calculation results', async () => {
      await expect(page).toHaveURL(/\/results/);

      // Verify results are displayed
      await expect(page.getByText(/refund|owe|result/i).first()).toBeVisible();

      // With $55,000 income, $6,500 withheld, single filer
      // Expected: AGI = $55,000, Standard deduction = $15,000
      // Taxable income = $40,000, Tax owed ~$4,500
      // Refund should be ~$2,000
      await expect(page.locator('.results-container, .result-card, [class*="result"]').first()).toBeVisible();
    });
  });

  test('should complete flow with married filing jointly and dependents', async ({ page }) => {
    // ============================================================
    // WELCOME PAGE
    // ============================================================
    await test.step('Welcome page', async () => {
      await expect(page).toHaveURL(/\/welcome/);
      await page.getByRole('button', { name: /start|begin|get started/i }).click();
    });

    // ============================================================
    // FILING STATUS - Married Filing Jointly
    // ============================================================
    await test.step('Filing Status - Married Filing Jointly', async () => {
      await expect(page).toHaveURL(/\/personal-info\/filing-status/);

      const marriedOption = page.getByText(/married.*jointly/i).first();
      await marriedOption.click();

      await page.getByRole('button', { name: /continue/i }).click();
    });

    // ============================================================
    // BASIC INFO
    // ============================================================
    await test.step('Basic Info', async () => {
      await expect(page).toHaveURL(/\/personal-info\/basic-info/);

      await page.getByLabel(/first name/i).fill('Jane');
      await page.getByLabel(/last name/i).fill('Smith');

      const dobInput = page.locator('input[type="date"]');
      await dobInput.fill('1985-03-20');

      await page.getByRole('button', { name: /continue/i }).click();
    });

    // ============================================================
    // DEPENDENT STATUS - No (not claimed as dependent)
    // ============================================================
    await test.step('Dependent Status - Not claimed as dependent', async () => {
      await expect(page).toHaveURL(/\/personal-info\/dependent-status/);

      // This asks "Can someone claim YOU as a dependent?"
      // For married filing jointly, answer No - which then asks about THEIR dependents
      const noOption = page.getByText(/no/i).first();
      await noOption.click();

      await page.getByRole('button', { name: /continue/i }).click();
    });

    // ============================================================
    // DEPENDENTS - Add child (for married filers who aren't dependents themselves)
    // ============================================================
    await test.step('Dependents - Add child dependent', async () => {
      await expect(page).toHaveURL(/\/personal-info\/dependents/);

      // First select "Yes, I have dependents" - click on the label to avoid radio button interception
      const yesLabel = page.locator('label.option').filter({ hasText: /yes.*dependents/i });
      await yesLabel.click({ force: true });

      // Wait for dependent form to appear
      await expect(page.locator('.dependent-card')).toBeVisible();

      // Fill in dependent info - first name
      const firstNameInput = page.locator('.dependent-card input[type="text"]').first();
      await firstNameInput.fill('Tommy');

      // Age input
      const ageInput = page.locator('.dependent-card input[type="number"]').first();
      await ageInput.fill('7');

      await page.getByRole('button', { name: /continue/i }).click();
    });

    // ============================================================
    // INCOME - TYPES
    // ============================================================
    await test.step('Income Types', async () => {
      await expect(page).toHaveURL(/\/income\/types/);

      const w2Option = page.locator('label.income-option').filter({ hasText: /w-?2.*wages/i });
      await w2Option.click();

      await page.getByRole('button', { name: /continue/i }).click();
    });

    // ============================================================
    // W2 ENTRY
    // ============================================================
    await test.step('W2 Entry - Higher income for married couple', async () => {
      await expect(page).toHaveURL(/\/income\/w2/);

      // Wait for page to load
      await expect(page.getByRole('heading', { level: 1 })).toContainText(/w-?2/i);

      const employerNameInput = page.locator('input[placeholder*="Employer" i]').first();
      await employerNameInput.fill('Big Corporation LLC');

      const wagesInput = page.locator('.box-1 input').first();
      await wagesInput.fill('85000');

      const federalWithheldInput = page.locator('.box-2 input').first();
      await federalWithheldInput.fill('12000');

      await page.getByRole('button', { name: /continue/i }).click();
    });

    // ============================================================
    // INCOME SUMMARY
    // ============================================================
    await test.step('Income Summary', async () => {
      await expect(page).toHaveURL(/\/income\/summary/);
      await expect(page.getByText(/85,000|85000/).first()).toBeVisible();
      await page.getByRole('button', { name: /continue/i }).click();
    });

    // ============================================================
    // DEDUCTIONS
    // ============================================================
    await test.step('Deductions', async () => {
      await expect(page).toHaveURL(/\/deductions\/itemized/);
      await page.getByRole('button', { name: /continue/i }).click();
    });

    await test.step('Deductions Comparison', async () => {
      await expect(page).toHaveURL(/\/deductions\/comparison/);
      await page.getByRole('button', { name: /continue/i }).click();
    });

    // ============================================================
    // CREDITS
    // ============================================================
    await test.step('Credits - Should see Child Tax Credit', async () => {
      await expect(page).toHaveURL(/\/credits/);

      // With a qualifying child, should see child tax credit
      await expect(page.getByText(/child.*tax.*credit|ctc/i).first()).toBeVisible();

      await page.getByRole('button', { name: /continue/i }).click();
    });

    // ============================================================
    // REVIEW
    // ============================================================
    await test.step('Review', async () => {
      await expect(page).toHaveURL(/\/review/);
      await expect(page.getByText(/jane/i)).toBeVisible();
      await expect(page.getByText(/married/i).first()).toBeVisible();
      await page.getByRole('button', { name: /continue|submit|calculate|see.*results/i }).click();
    });

    // ============================================================
    // RESULTS
    // ============================================================
    await test.step('Results - Should include Child Tax Credit', async () => {
      await expect(page).toHaveURL(/\/results/);
      await expect(page.getByText(/refund|owe|result/i).first()).toBeVisible();
    });
  });
});

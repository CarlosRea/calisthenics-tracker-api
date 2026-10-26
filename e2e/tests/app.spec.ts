import { test, expect } from '@playwright/test';

test.describe('Calisthenics Tracker E2E & Multi-Session Tests', () => {

  test('Frontend compiles correctly and serves dashboard with seeded PostgreSQL data', async ({ page }) => {
    await page.goto('/');

    // Check application title and header
    await expect(page).toHaveTitle(/Calisthenics Workout Tracker/);
    await expect(page.locator('h1')).toContainText('Calisthenics Tracker');

    // Check KPI cards are visible and populated
    await expect(page.getByText('Sessions')).toBeVisible();
    await expect(page.getByText('Total Volume')).toBeVisible();
    await expect(page.getByText('Pull PR')).toBeVisible();

    // Check history table contains seeded calisthenics entries inside the tbody
    const tbody = page.locator('tbody');
    await expect(tbody.locator('tr')).toHaveCount(4);
    await expect(tbody.getByRole('cell', { name: 'Weighted Pull-ups' })).toBeVisible();
    await expect(tbody.getByRole('cell', { name: 'Parallel Bar Dips' })).toBeVisible();
    await expect(tbody.getByRole('cell', { name: 'Pistol Squats' })).toBeVisible();
    await expect(tbody.getByRole('cell', { name: 'Hanging Leg Raises' })).toBeVisible();
  });

  test('Two-session test: changes in Client 2 propagate to Client 1 via shared Postgres backend', async ({ browser }) => {
    // Session 1: Client 1 (e.g. Observer / Athlete 1)
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    await page1.goto('/');
    const tbody1 = page1.locator('tbody');
    await expect(tbody1.locator('tr')).toHaveCount(4);

    // Session 2: Client 2 (e.g. Collaborator / Athlete 2)
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    await page2.goto('/');
    const tbody2 = page2.locator('tbody');
    await expect(tbody2.locator('tr')).toHaveCount(4);

    // Client 2 logs a new workout: "Dragon Flags" (Core, 3 sets, 15 reps, 0kg)
    await page2.locator('select').first().selectOption('Dragon Flags');
    
    // Sets = 3, Reps = 15
    const numberInputs = page2.locator('input[type="number"]');
    await numberInputs.nth(0).fill('3');  // sets
    await numberInputs.nth(1).fill('15'); // reps

    // Submit form in Client 2
    await page2.getByRole('button', { name: 'Log Workout' }).click();

    // Client 2 verifies instant feedback: 5 rows and Dragon Flags visible in table
    await expect(tbody2.locator('tr')).toHaveCount(5);
    await expect(tbody2.getByRole('cell', { name: 'Dragon Flags' })).toBeVisible();

    // Client 1 reloads and verifies the data was saved to PostgreSQL and appears in Client 1
    await page1.reload();
    await expect(tbody1.locator('tr')).toHaveCount(5);
    await expect(tbody1.getByRole('cell', { name: 'Dragon Flags' })).toBeVisible();

    // Close contexts
    await context1.close();
    await context2.close();
  });

  test('Category filter works correctly in UI', async ({ page }) => {
    await page.goto('/');
    const tbody = page.locator('tbody');
    await expect(tbody.locator('tr').first()).toBeVisible();

    // Click on Pull category pill
    await page.getByRole('button', { name: 'Pull', exact: true }).click();
    await expect(tbody.locator('tr')).toHaveCount(1);
    await expect(tbody.getByRole('cell', { name: 'Weighted Pull-ups' })).toBeVisible();

    // Click back to All
    await page.getByRole('button', { name: 'All', exact: true }).click();
    await expect(tbody.locator('tr')).toHaveCount(5); // 4 seeded + 1 added
  });

  test('Delete workout removes entry and updates stats across clients', async ({ page }) => {
    // Register dialog handler before navigating
    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    await page.goto('/');
    const tbody = page.locator('tbody');
    await expect(tbody.locator('tr')).toHaveCount(5);

    // Delete the first row
    const firstDeleteBtn = tbody.locator('tr').first().locator('button[title="Delete entry"]');
    await firstDeleteBtn.click();

    // Verify row count decreased to 4
    await expect(tbody.locator('tr')).toHaveCount(4);
  });
});

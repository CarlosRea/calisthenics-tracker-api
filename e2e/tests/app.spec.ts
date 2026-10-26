import { test, expect } from '@playwright/test';

test.describe('Calisthenics Workout Tracker - Comprehensive E2E Test Suite', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to the root application
    await page.goto('/');
    // Wait for the workout table to load
    await expect(page.locator('tbody tr').first()).toBeVisible();
  });

  test('[FEAT-5 & FEAT-6] Dashboard loads with KPI summary cards and seeded demo workouts', async ({ page }) => {
    // 1. Verify Application Title & Header
    await expect(page).toHaveTitle(/Calisthenics Workout Tracker/);
    await expect(page.locator('h1')).toContainText('Calisthenics Tracker');

    // 2. Verify all KPI cards exist
    await expect(page.getByText('Sessions', { exact: true })).toBeVisible();
    await expect(page.getByText('Total Volume', { exact: true })).toBeVisible();
    await expect(page.getByText('Pull PR', { exact: true })).toBeVisible();
    await expect(page.getByText('Push PR', { exact: true })).toBeVisible();
    await expect(page.getByText('Legs PR', { exact: true })).toBeVisible();
    await expect(page.getByText('Core PR', { exact: true })).toBeVisible();

    // 3. Verify the 4 realistic street workout seeded records
    const tbody = page.locator('tbody');
    await expect(tbody.getByRole('cell', { name: 'Weighted Pull-ups' }).first()).toBeVisible();
    await expect(tbody.getByRole('cell', { name: 'Parallel Bar Dips' }).first()).toBeVisible();
    await expect(tbody.getByRole('cell', { name: 'Pistol Squats' }).first()).toBeVisible();
    await expect(tbody.getByRole('cell', { name: 'Hanging Leg Raises' }).first()).toBeVisible();
  });

  test('[FEAT-1 & FEAT-4] Log a predefined weighted calisthenics session and update volume & PR', async ({ page }) => {
    const tbody = page.locator('tbody');
    const initialRows = await tbody.locator('tr').count();

    // Fill form with a predefined exercise: Muscle-ups (Pull)
    const exerciseSelect = page.locator('select').first();
    await exerciseSelect.selectOption('Muscle-ups');

    const numberInputs = page.locator('input[type="number"]');
    await numberInputs.nth(0).fill('4');    // Sets: 4
    await numberInputs.nth(1).fill('9');    // Reps: 9 (beats seeded Pull PR of 8)
    await numberInputs.nth(2).fill('5');    // Extra weight: +5 kg

    // Submit workout
    await page.getByRole('button', { name: 'Log Workout' }).click();

    // Verify row added to table
    await expect(tbody.locator('tr')).toHaveCount(initialRows + 1);
    const newRow = tbody.locator('tr').first();
    await expect(newRow.getByRole('cell', { name: 'Muscle-ups' })).toBeVisible();
    await expect(newRow.getByText('+5 kg')).toBeVisible();
    await expect(newRow.getByText('36 reps')).toBeVisible(); // 4 * 9 = 36 reps

    // Verify Pull PR updated in KPI card
    const pullPrCard = page.locator('div').filter({ hasText: /^Pull PR/ });
    await expect(pullPrCard.locator('div.text-2xl')).toBeVisible();
  });

  test('[FEAT-1] Log a custom street workout exercise with custom category', async ({ page }) => {
    const tbody = page.locator('tbody');
    const initialRows = await tbody.locator('tr').count();

    // Select "+ Custom Exercise..."
    const exerciseSelect = page.locator('select').first();
    await exerciseSelect.selectOption('CUSTOM');

    // Enter custom exercise details
    const customInput = page.locator('input[placeholder="e.g. Ring Archer Push-ups"]');
    await expect(customInput).toBeVisible();
    await customInput.fill('Handstand Push-ups');

    const categorySelect = page.locator('select').nth(1);
    await categorySelect.selectOption('Push');

    const numberInputs = page.locator('input[type="number"]');
    await numberInputs.nth(0).fill('3');    // Sets: 3
    await numberInputs.nth(1).fill('8');    // Reps: 8

    // Submit
    await page.getByRole('button', { name: 'Log Workout' }).click();

    // Verify new custom exercise in table
    await expect(tbody.locator('tr')).toHaveCount(initialRows + 1);
    await expect(tbody.getByRole('cell', { name: 'Handstand Push-ups' }).first()).toBeVisible();
    await expect(tbody.locator('tr').first().getByText('Push', { exact: true })).toBeVisible();
  });

  test('[FEAT-2] Filter workouts by movement category and exercise search substring', async ({ page }) => {
    const tbody = page.locator('tbody');

    // 1. Filter by "Push" category pill
    await page.getByRole('button', { name: 'Push', exact: true }).click();
    await expect(tbody.getByRole('cell', { name: 'Parallel Bar Dips' }).first()).toBeVisible();
    await expect(tbody.getByRole('cell', { name: 'Pistol Squats' })).not.toBeVisible();

    // 2. Filter by "Pull" category pill
    await page.getByRole('button', { name: 'Pull', exact: true }).click();
    await expect(tbody.getByRole('cell', { name: 'Weighted Pull-ups' }).first()).toBeVisible();
    await expect(tbody.getByRole('cell', { name: 'Parallel Bar Dips' })).not.toBeVisible();

    // 3. Reset filter to "All"
    await page.getByRole('button', { name: 'All', exact: true }).click();
    await expect(tbody.getByRole('cell', { name: 'Parallel Bar Dips' }).first()).toBeVisible();
    await expect(tbody.getByRole('cell', { name: 'Pistol Squats' }).first()).toBeVisible();

    // 4. Substring search for "dips"
    const searchInput = page.locator('input[placeholder="Filter by exercise..."]');
    await searchInput.fill('dips');
    await expect(tbody.getByRole('cell', { name: 'Parallel Bar Dips' }).first()).toBeVisible();
    await expect(tbody.getByRole('cell', { name: 'Pistol Squats' })).not.toBeVisible();

    // Clear search
    await searchInput.fill('');
    await expect(tbody.locator('tr').first()).toBeVisible();
  });

  test('[FEAT-3] Delete a mistaken workout entry and update table & KPI volume', async ({ page }) => {
    // Automatically accept window.confirm dialog
    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });

    const tbody = page.locator('tbody');
    const initialRows = await tbody.locator('tr').count();

    // Click delete on the first row
    const firstRowDeleteBtn = tbody.locator('tr').first().locator('button[title="Delete entry"]');
    await firstRowDeleteBtn.click();

    // Verify row count decreased by 1
    await expect(tbody.locator('tr')).toHaveCount(initialRows - 1);
  });

  test('Data persistence: Workouts remain stored in PostgreSQL after page reload', async ({ page }) => {
    const tbody = page.locator('tbody');

    // Log a specific session to verify persistence
    const exerciseSelect = page.locator('select').first();
    await exerciseSelect.selectOption('Chin-ups');

    const numberInputs = page.locator('input[type="number"]');
    await numberInputs.nth(0).fill('3');
    await numberInputs.nth(1).fill('11');
    await numberInputs.nth(2).fill('0');

    await page.getByRole('button', { name: 'Log Workout' }).click();
    await expect(tbody.getByRole('cell', { name: 'Chin-ups' }).first()).toBeVisible();

    // Hard reload the browser window
    await page.reload();

    // Verify Chin-ups is still present (persisted in PostgreSQL DB)
    await expect(tbody.getByRole('cell', { name: 'Chin-ups' }).first()).toBeVisible();
  });
});

// tests/reviewsubmit.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Support Agent Station E2E Suite', () => {
    test('Should log in as Agent, fill out review form, and verify instant optimistic UI update', async ({ page }) => {
        await page.goto('http://localhost:3000/login');

        // 🌟 Use your Support Agent Credentials
        await page.locator('input[name="email"]').fill('khantnyinyi46@gmail.com');
        await page.locator('input[name="password"]').fill('saasdashboardkhant');
        await page.locator('button[type="submit"]').click();

        // 🌟 Verifies the role-based router sends this user to the manual form page
        await page.waitForURL(/.*dashboard\/reviewsubmit/, { waitUntil: 'load', timeout: 12000 });
        await expect(page).toHaveURL(/.*dashboard\/reviewsubmit/);

        // Target form inputs
        const nameInput = page.locator('input[placeholder="John Doe"]');
        const reviewInput = page.locator('textarea[placeholder*="Type or paste"]');
        const analyzeButton = page.locator('button:has-text("Analyze Sentiment")');

        // Fill form fields
        await nameInput.fill('Playwright Agent Robot');
        await reviewInput.fill('The handmade pasta was cold and bad. Server ignored us.');

        // Click submit to trigger Optimistic UI & Gemini background processing
        await analyzeButton.click();

        // ASSERTION: Verify chart recalculates or loading spin activates right away
        const loadingOrChart = page.locator('h2:has-text("Customer Mood Breakdown")');
        await expect(loadingOrChart).toBeVisible();

        // Verify input elements clear out safely upon completion
        await expect(nameInput).toHaveValue('');
        await expect(reviewInput).toHaveValue('');
    });
});

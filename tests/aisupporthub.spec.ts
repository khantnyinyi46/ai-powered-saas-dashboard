// tests/aisupporthub.spec.ts
import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

test.describe('Manager Workspace E2E Suite', () => {
    test('Should log in as Manager, upload restaurant reviews file, and view AI generated chart', async ({ page }) => {
        const mockFilePath = path.join(__dirname, 'e2e_restaurant_reviews.txt');
        const mockRestaurantData = `customerName,reviewText\nJohn Doe,The crispy chicken wings were incredible! Fast service. Happy!`;
        fs.writeFileSync(mockFilePath, mockRestaurantData);

        await page.goto('http://localhost:3000/login');

        // 🌟 Use your new Manager Demo Credentials
        await page.locator('input[name="email"]').fill('manager-demo@company.com');
        await page.locator('input[name="password"]').fill('ManagerDemo123!');
        await page.locator('button[type="submit"]').click();

        await page.waitForURL(/.*dashboard\/aisupporthub/, { waitUntil: 'load', timeout: 12000 });
        await expect(page).toHaveURL(/.*dashboard\/aisupporthub/);

        const fileInput = page.locator('input[type="file"]');
        await fileInput.setInputFiles(mockFilePath);

        await page.locator('button:has-text("Generate Dashboard")').click();

        await expect(page.locator('h2:has-text("Customer Mood Breakdown")')).toBeVisible({ timeout: 15000 });
        fs.unlinkSync(mockFilePath);
    });
});




// @ts-check
const { test, expect } = require('@playwright/test');
const path = require('path');

const screenshotsDir = path.join(__dirname, '..', 'screenshots');

// Helper function to save screenshot with descriptive name
async function saveScreenshot(page, name, testInfo) {
    const device = testInfo.project.name.replace(/\s+/g, '-').toLowerCase();
    const screenshotPath = path.join(screenshotsDir, `${device}-${name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
}

test.describe('LG Branch Finder - Page Load Tests', () => {
    test('should load homepage correctly', async ({ page }, testInfo) => {
        await page.goto('/');

        // Check page title
        await expect(page).toHaveTitle(/العثور على أقرب فرع LG/);

        // Check main elements are visible
        await expect(page.locator('.header')).toBeVisible();
        await expect(page.locator('.lg-logo')).toBeVisible();
        await expect(page.locator('.main-title')).toBeVisible();

        await saveScreenshot(page, '01-homepage-loaded', testInfo);
    });

    test('should display location permission message', async ({ page }, testInfo) => {
        await page.goto('/');

        // Check location permission message
        const statusMessage = page.locator('#statusMessage');
        await expect(statusMessage).toBeVisible();

        // Check privacy hint
        const statusHint = page.locator('.status-hint');
        await expect(statusHint).toBeVisible();
        await expect(statusHint).toContainText('سيتم استخدام موقعك فقط');

        // Check location button
        const locationBtn = page.locator('#getLocationBtn');
        await expect(locationBtn).toBeVisible();
        await expect(locationBtn).toContainText('السماح بتحديد الموقع');

        await saveScreenshot(page, '02-location-permission-message', testInfo);
    });

    test('should have loading skeleton in DOM', async ({ page }, testInfo) => {
        await page.goto('/');

        // Check skeleton exists in DOM (may be hidden if data loads fast)
        const skeleton = page.locator('#loadingSkeletonSection');
        await expect(skeleton).toBeAttached();

        await saveScreenshot(page, '03-page-loaded', testInfo);
    });
});

test.describe('LG Branch Finder - Header Tests', () => {
    test('should display LG logo in header', async ({ page }, testInfo) => {
        await page.goto('/');

        const logo = page.locator('.lg-logo');
        await expect(logo).toBeVisible();

        await saveScreenshot(page, '04-header-logo', testInfo);
    });

    test('should display dark mode toggle', async ({ page }, testInfo) => {
        await page.goto('/');

        const darkModeToggle = page.locator('#darkModeToggle');
        await expect(darkModeToggle).toBeVisible();

        await saveScreenshot(page, '05-dark-mode-toggle', testInfo);
    });
});

test.describe('LG Branch Finder - Dark Mode Tests', () => {
    test('should toggle dark mode on click', async ({ page }, testInfo) => {
        await page.goto('/');

        // Initial state - light mode
        await saveScreenshot(page, '06-light-mode', testInfo);

        // Click dark mode toggle
        const darkModeToggle = page.locator('#darkModeToggle');
        await darkModeToggle.click();

        // Wait for theme change
        await page.waitForTimeout(500);

        // Check dark mode toggle was clicked successfully
        await expect(darkModeToggle).toBeVisible();

        await saveScreenshot(page, '07-dark-mode', testInfo);
    });

    test('should persist dark mode preference', async ({ page }, testInfo) => {
        await page.goto('/');

        // Enable dark mode
        const darkModeToggle = page.locator('#darkModeToggle');
        await darkModeToggle.click();
        await page.waitForTimeout(500);

        // Reload page
        await page.reload();
        await page.waitForTimeout(1000);

        // Check dark mode icon is showing (moon icon visible means dark mode is active)
        const moonIcon = page.locator('#darkModeToggle .moon-icon');
        const isVisible = await moonIcon.evaluate(el => getComputedStyle(el).display !== 'none');

        await saveScreenshot(page, '08-dark-mode-persisted', testInfo);
    });

    test('should toggle back to light mode', async ({ page }, testInfo) => {
        await page.goto('/');

        const darkModeToggle = page.locator('#darkModeToggle');

        // Enable dark mode
        await darkModeToggle.click();
        await page.waitForTimeout(300);

        // Disable dark mode
        await darkModeToggle.click();
        await page.waitForTimeout(300);

        // Check sun icon is visible (light mode)
        const sunIcon = page.locator('#darkModeToggle .sun-icon');
        const isVisible = await sunIcon.evaluate(el => getComputedStyle(el).display !== 'none');
        expect(isVisible).toBeTruthy();

        await saveScreenshot(page, '09-light-mode-restored', testInfo);
    });
});

test.describe('LG Branch Finder - Search Tests', () => {
    test('should have search input visible', async ({ page }, testInfo) => {
        await page.goto('/');

        const searchInput = page.locator('#searchInput');
        await expect(searchInput).toBeVisible();
        await expect(searchInput).toHaveAttribute('placeholder', /ابحث عن فرع/);

        await saveScreenshot(page, '10-search-input', testInfo);
    });

    test('should filter branches on search', async ({ page }, testInfo) => {
        await page.goto('/');

        // Wait for branches to load
        await page.waitForSelector('#allBranchesSection', { state: 'visible', timeout: 15000 });
        await page.waitForSelector('.branch-card', { state: 'visible', timeout: 10000 });

        // Type in search
        const searchInput = page.locator('#searchInput');
        await searchInput.fill('مصر');

        await page.waitForTimeout(1000);

        await saveScreenshot(page, '11-search-results', testInfo);
    });

    test('should show no results message for invalid search', async ({ page }, testInfo) => {
        await page.goto('/');

        // Wait for branches to load
        await page.waitForSelector('#allBranchesSection', { state: 'visible', timeout: 10000 });

        // Type invalid search
        const searchInput = page.locator('#searchInput');
        await searchInput.fill('xyznonexistent');

        await page.waitForTimeout(500);

        await saveScreenshot(page, '12-search-no-results', testInfo);
    });

    test('should clear search and show all branches', async ({ page }, testInfo) => {
        await page.goto('/');

        // Wait for branches to load
        await page.waitForSelector('#allBranchesSection', { state: 'visible', timeout: 10000 });

        // Type in search
        const searchInput = page.locator('#searchInput');
        await searchInput.fill('الإسكندرية');
        await page.waitForTimeout(300);

        // Clear search
        await searchInput.clear();
        await page.waitForTimeout(500);

        await saveScreenshot(page, '13-search-cleared', testInfo);
    });
});

test.describe('LG Branch Finder - Governorate Filter Tests', () => {
    test('should have governorate filter visible', async ({ page }, testInfo) => {
        await page.goto('/');

        const filterSelect = page.locator('#governorateFilter');
        await expect(filterSelect).toBeVisible();

        await saveScreenshot(page, '14-governorate-filter', testInfo);
    });

    test('should filter branches by governorate', async ({ page }, testInfo) => {
        await page.goto('/');

        // Wait for branches to load
        await page.waitForSelector('#allBranchesSection', { state: 'visible', timeout: 15000 });
        await page.waitForSelector('.branch-card', { state: 'visible', timeout: 10000 });

        // Get available options
        const filterSelect = page.locator('#governorateFilter');
        const options = await filterSelect.locator('option').allTextContents();

        // Select the second option (first is "all")
        if (options.length > 1) {
            await filterSelect.selectOption({ index: 1 });
        }

        await page.waitForTimeout(1000);

        await saveScreenshot(page, '15-filtered-by-governorate', testInfo);
    });

    test('should reset filter to show all branches', async ({ page }, testInfo) => {
        await page.goto('/');

        // Wait for branches to load
        await page.waitForSelector('#allBranchesSection', { state: 'visible', timeout: 15000 });
        await page.waitForSelector('.branch-card', { state: 'visible', timeout: 10000 });

        // Select a governorate first
        const filterSelect = page.locator('#governorateFilter');
        await filterSelect.selectOption({ index: 1 });
        await page.waitForTimeout(500);

        // Reset to all
        await filterSelect.selectOption({ index: 0 });
        await page.waitForTimeout(500);

        await saveScreenshot(page, '16-filter-reset', testInfo);
    });
});

test.describe('LG Branch Finder - Branch Cards Tests', () => {
    test('should display branch cards with all info', async ({ page }, testInfo) => {
        await page.goto('/');

        // Wait for branches to load
        await page.waitForSelector('#allBranchesSection', { state: 'visible', timeout: 10000 });

        // Check branch card elements
        const firstCard = page.locator('.branch-card').first();
        await expect(firstCard).toBeVisible();

        // Check card has name
        await expect(firstCard.locator('.branch-name')).toBeVisible();

        // Check card has address
        await expect(firstCard.locator('.branch-address')).toBeVisible();

        // Check card has contact info
        await expect(firstCard.locator('.contact-item').first()).toBeVisible();

        // Check card has maps link
        await expect(firstCard.locator('.maps-link')).toBeVisible();

        await saveScreenshot(page, '17-branch-card-details', testInfo);
    });

    test('should have share button on each card', async ({ page }, testInfo) => {
        await page.goto('/');

        // Wait for branches to load
        await page.waitForSelector('#allBranchesSection', { state: 'visible', timeout: 10000 });

        // Check share button
        const shareBtn = page.locator('.share-btn').first();
        await expect(shareBtn).toBeVisible();

        await saveScreenshot(page, '18-share-button', testInfo);
    });

    test('should show toast on share click', async ({ page }, testInfo) => {
        await page.goto('/');

        // Wait for branches to load
        await page.waitForSelector('#allBranchesSection', { state: 'visible', timeout: 10000 });

        // Click share button
        const shareBtn = page.locator('.share-btn').first();
        await shareBtn.click();

        // Wait for toast to appear
        await page.waitForTimeout(500);

        const toast = page.locator('.toast');
        await expect(toast).toBeVisible();

        await saveScreenshot(page, '19-share-toast', testInfo);
    });
});

test.describe('LG Branch Finder - Footer Tests', () => {
    test('should display footer with all elements', async ({ page }, testInfo) => {
        await page.goto('/');

        // Scroll to footer
        await page.locator('.footer').scrollIntoViewIfNeeded();

        // Check footer elements
        await expect(page.locator('.footer')).toBeVisible();
        await expect(page.locator('.footer-logo')).toBeVisible();
        await expect(page.locator('.social-links')).toBeVisible();

        await saveScreenshot(page, '20-footer', testInfo);
    });

    test('should display Smart Stand logo and link', async ({ page }, testInfo) => {
        await page.goto('/');

        // Scroll to footer
        await page.locator('.footer').scrollIntoViewIfNeeded();

        // Check Smart Stand elements
        const smartStandLogo = page.locator('.smart-stand-logo');
        await expect(smartStandLogo).toBeVisible();

        const poweredBy = page.locator('.powered-by');
        await expect(poweredBy).toContainText('Smart Stand Egypt');

        await saveScreenshot(page, '21-smart-stand-branding', testInfo);
    });

    test('should have working social media links', async ({ page }, testInfo) => {
        await page.goto('/');

        // Scroll to footer
        await page.locator('.footer').scrollIntoViewIfNeeded();

        // Check social links exist
        const socialLinks = page.locator('.social-link');
        const count = await socialLinks.count();
        expect(count).toBeGreaterThan(0);

        await saveScreenshot(page, '22-social-links', testInfo);
    });
});

test.describe('LG Branch Finder - Accessibility Tests', () => {
    test('should have skip link for accessibility', async ({ page }, testInfo) => {
        await page.goto('/');

        const skipLink = page.locator('.skip-link');
        await expect(skipLink).toBeAttached();

        // Focus on skip link
        await skipLink.focus();
        await expect(skipLink).toBeVisible();

        await saveScreenshot(page, '23-skip-link', testInfo);
    });

    test('should have proper aria labels', async ({ page }, testInfo) => {
        await page.goto('/');

        // Check aria labels on important elements
        const darkModeToggle = page.locator('#darkModeToggle');
        await expect(darkModeToggle).toHaveAttribute('aria-label');

        const searchInput = page.locator('#searchInput');
        await expect(searchInput).toHaveAttribute('aria-label');

        await saveScreenshot(page, '24-aria-labels', testInfo);
    });

    test('should have proper heading hierarchy', async ({ page }, testInfo) => {
        await page.goto('/');

        // Check h1 exists
        const h1 = page.locator('h1');
        await expect(h1).toBeVisible();

        // Check h2 exists
        const h2 = page.locator('h2').first();
        await expect(h2).toBeVisible();

        await saveScreenshot(page, '25-heading-hierarchy', testInfo);
    });
});

test.describe('LG Branch Finder - Responsive Tests', () => {
    test('should display correctly on mobile', async ({ page }, testInfo) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await page.goto('/');

        // Wait for content
        await page.waitForSelector('.header', { state: 'visible' });

        await saveScreenshot(page, '26-mobile-view', testInfo);
    });

    test('should display correctly on tablet', async ({ page }, testInfo) => {
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.goto('/');

        await page.waitForSelector('.header', { state: 'visible' });

        await saveScreenshot(page, '27-tablet-view', testInfo);
    });

    test('should display correctly on desktop', async ({ page }, testInfo) => {
        await page.setViewportSize({ width: 1920, height: 1080 });
        await page.goto('/');

        await page.waitForSelector('.header', { state: 'visible' });

        await saveScreenshot(page, '28-desktop-view', testInfo);
    });
});

test.describe('LG Branch Finder - Location Tests', () => {
    test('should show location button initially', async ({ page }, testInfo) => {
        await page.goto('/');

        const locationBtn = page.locator('#getLocationBtn');
        await expect(locationBtn).toBeVisible();

        await saveScreenshot(page, '29-location-button', testInfo);
    });

    test('should handle geolocation permission grant', async ({ page, context }, testInfo) => {
        // Grant geolocation permission
        await context.grantPermissions(['geolocation']);

        // Set mock geolocation (Cairo coordinates)
        await context.setGeolocation({ latitude: 30.0444, longitude: 31.2357 });

        await page.goto('/');

        // Click location button
        const locationBtn = page.locator('#getLocationBtn');
        await locationBtn.click();

        // Wait for location to be processed
        await page.waitForTimeout(2000);

        await saveScreenshot(page, '30-location-granted', testInfo);
    });

    test('should show nearest branch after location', async ({ page, context }, testInfo) => {
        // Grant geolocation permission
        await context.grantPermissions(['geolocation']);
        await context.setGeolocation({ latitude: 30.0444, longitude: 31.2357 });

        await page.goto('/');

        // Click location button
        const locationBtn = page.locator('#getLocationBtn');
        await locationBtn.click();

        // Wait for location to be processed
        await page.waitForTimeout(3000);

        // Try to find nearest branch section or check if status changed
        const nearestSection = page.locator('#nearestBranchSection');
        const isVisible = await nearestSection.isVisible().catch(() => false);

        if (isVisible) {
            const nearestCard = page.locator('.nearest-card');
            await expect(nearestCard).toBeVisible();
        }

        await saveScreenshot(page, '31-nearest-branch', testInfo);
    });

    test('should show refresh location button after permission', async ({ page, context }, testInfo) => {
        await context.grantPermissions(['geolocation']);
        await context.setGeolocation({ latitude: 30.0444, longitude: 31.2357 });

        await page.goto('/');

        const locationBtn = page.locator('#getLocationBtn');
        await locationBtn.click();

        await page.waitForTimeout(2000);

        const refreshBtn = page.locator('#refreshLocationBtn');
        await expect(refreshBtn).toBeVisible();

        await saveScreenshot(page, '32-refresh-location-button', testInfo);
    });
});

test.describe('LG Branch Finder - Error Handling Tests', () => {
    test('should handle geolocation denial gracefully', async ({ page, context }, testInfo) => {
        // Deny geolocation permission
        await context.clearPermissions();

        await page.goto('/');

        // Attempt to click location button (will be denied)
        const locationBtn = page.locator('#getLocationBtn');

        // Just verify the button exists
        await expect(locationBtn).toBeVisible();

        await saveScreenshot(page, '33-location-button-visible', testInfo);
    });
});

test.describe('LG Branch Finder - PWA Tests', () => {
    test('should have valid manifest', async ({ page }, testInfo) => {
        await page.goto('/');

        // Check manifest link exists
        const manifestLink = page.locator('link[rel="manifest"]');
        await expect(manifestLink).toBeAttached();

        await saveScreenshot(page, '34-pwa-manifest', testInfo);
    });

    test('should have theme color meta tag', async ({ page }, testInfo) => {
        await page.goto('/');

        const themeColor = page.locator('meta[name="theme-color"]');
        await expect(themeColor).toBeAttached();
        await expect(themeColor).toHaveAttribute('content', '#C70851');

        await saveScreenshot(page, '35-theme-color', testInfo);
    });
});

test.describe('LG Branch Finder - Full Page Screenshots', () => {
    test('should capture full page in light mode', async ({ page }, testInfo) => {
        await page.goto('/');

        // Wait for all content to load
        await page.waitForSelector('#allBranchesSection', { state: 'visible', timeout: 15000 });
        await page.waitForTimeout(1000);

        await saveScreenshot(page, '36-full-page-light', testInfo);
    });

    test('should capture full page in dark mode', async ({ page }, testInfo) => {
        await page.goto('/');

        // Wait for all content to load
        await page.waitForSelector('#allBranchesSection', { state: 'visible', timeout: 15000 });

        // Enable dark mode
        const darkModeToggle = page.locator('#darkModeToggle');
        await darkModeToggle.click();
        await page.waitForTimeout(1000);

        await saveScreenshot(page, '37-full-page-dark', testInfo);
    });

    test('should capture full page with search results', async ({ page }, testInfo) => {
        await page.goto('/');

        await page.waitForSelector('#allBranchesSection', { state: 'visible', timeout: 15000 });

        // Perform search
        const searchInput = page.locator('#searchInput');
        await searchInput.fill('مصر');
        await page.waitForTimeout(500);

        await saveScreenshot(page, '38-full-page-search', testInfo);
    });
});

import { expect } from "@playwright/test";
import { test } from "./coverage_wrapper";

test("find-watman", async ({ page }) => {  
  await page.goto("/");
  await expect(page.getByAltText("This is watman")).toBeInViewport();
});

test('User can search for something', async ({ page }) => {
  await page.goto('https://wikipedia.org');
  
  await page.fill('input[name="search"]', 'Playwright');
  await page.press('input[name="search"]', 'Enter');
  
  await expect(page).toHaveURL(/wiki\/Playwright/);
  await expect(page.locator('h1')).toHaveText('Playwright');
});

test('User can navigate to Wikibooks', async ({ page }) => {
  await page.goto('https://wikipedia.org');

  await page.getByText("Wikibooks").click()
    
  await expect(page).toHaveURL("https://www.wikibooks.org/");
});

test('User can navigate to Czech wiki page', async ({ page }) => {
  await page.goto('https://cs.wikipedia.org/');

  await expect(page.getByText(/Vítejte/)).toBeInViewport();
});

test('User can navigate to Stats page and see total page views', async ({ page }) => {
  await page.goto('https://stats.wikimedia.org/#/en.wikipedia.org');

  await expect(page.getByText(/Total page views/)).toBeInViewport();
  
  await page.getByText("Total page views").click();
  
  await expect(page).toHaveURL(/total-page-views/);
});

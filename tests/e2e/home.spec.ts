import { test, expect } from '@playwright/test'

test('home page renders in zh-CN', async ({ page }) => {
  await page.goto('/zh-CN')
  await expect(page.locator('h1')).toBeVisible()
})

test('home page renders in en', async ({ page }) => {
  await page.goto('/en')
  await expect(page.locator('h1')).toBeVisible()
})
import { expect, test } from '@playwright/test'

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: /New Workspace/i })).toBeVisible({ timeout: 15000 })
  })

  test('dashboard is the default page', async ({ page }) => {
    const dashBtn = page.getByRole('button', { name: 'Dashboard' })
    await expect(dashBtn).toHaveAttribute('aria-current', 'page')
  })

  test('navigate to Flow page', async ({ page }) => {
    await page.getByRole('button', { name: 'Flow' }).click()
    await expect(page.getByRole('heading', { name: 'Flow' })).toBeVisible()
  })

  test('navigate to Tasks page', async ({ page }) => {
    await page.getByRole('button', { name: 'Tasks' }).click()
    await expect(page.getByRole('heading', { name: 'Tasks' })).toBeVisible()
  })

  test('navigate to Agents page', async ({ page }) => {
    await page.getByRole('button', { name: 'Agents' }).click()
    await expect(page.getByRole('heading', { name: 'Agents' })).toBeVisible()
  })

  test('navigate to Analytics page', async ({ page }) => {
    await page.getByRole('button', { name: 'Analytics' }).click()
    await expect(page.getByRole('heading', { name: 'Analytics' })).toBeVisible()
  })

  test('navigate to Settings page', async ({ page }) => {
    await page.getByRole('button', { name: 'Settings', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
  })

  test('sidebar collapse toggle works', async ({ page }) => {
    const sidebar = page.getByLabel('Primary navigation')
    await expect(sidebar).toHaveAttribute('data-collapsed', 'false')

    await page.getByRole('button', { name: 'Collapse sidebar' }).click()
    await expect(sidebar).toHaveAttribute('data-collapsed', 'true')

    await page.getByRole('button', { name: 'Expand sidebar' }).click()
    await expect(sidebar).toHaveAttribute('data-collapsed', 'false')
  })
})

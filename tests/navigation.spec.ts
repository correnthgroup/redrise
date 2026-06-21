import { expect, test } from '@playwright/test'
import { openAuthenticatedApp } from './support/app'

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await openAuthenticatedApp(page)
  })

  test('dashboard is the default page', async ({ page }) => {
    const dashBtn = page.getByRole('button', { name: /Dashboard|Painel/ })
    await expect(dashBtn).toHaveAttribute('aria-current', 'page')
  })

  test('navigate to Flow page', async ({ page }) => {
    await page.getByTestId('sidebar-nav-flow').click()
    await expect(page.getByRole('heading', { name: /Flow|Fluxo/ })).toBeVisible()
  })

  test('navigate to Tasks page', async ({ page }) => {
    await page.getByTestId('sidebar-nav-tasks').click()
    await expect(page.getByRole('heading', { name: /Tasks|Tarefas/ })).toBeVisible()
  })

  test('navigate to Agents page', async ({ page }) => {
    await page.getByTestId('sidebar-nav-agents').click()
    await expect(page.getByRole('heading', { name: /Agents|Agentes/ })).toBeVisible({ timeout: 10000 })
  })

  test('navigate to Analytics page', async ({ page }) => {
    await page.getByTestId('sidebar-nav-analytics').click()
    await expect(page.getByRole('heading', { name: /Analytics|Anal.ticos/ })).toBeVisible({ timeout: 10000 })
  })

  test('navigate to Settings page', async ({ page }) => {
    await page.getByTestId('sidebar-nav-settings').click()
    await expect(page.getByTestId('settings-page')).toBeVisible({ timeout: 10000 })
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

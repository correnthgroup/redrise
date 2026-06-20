import { expect, test } from '@playwright/test'

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: /New Workspace|Novo Workspace/i })).toBeVisible({ timeout: 15000 })
  })

  test('dashboard is the default page', async ({ page }) => {
    const dashBtn = page.getByRole('button', { name: /Dashboard|Painel/ })
    await expect(dashBtn).toHaveAttribute('aria-current', 'page')
  })

  test('navigate to Flow page', async ({ page }) => {
    await page.getByRole('button', { name: /Flow|Fluxo/ }).click({ force: true })
    await expect(page.getByRole('heading', { name: /Flow|Fluxo/ })).toBeVisible()
  })

  test('navigate to Tasks page', async ({ page }) => {
    await page.getByRole('button', { name: /Tasks|Tarefas/ }).click({ force: true })
    await expect(page.getByRole('heading', { name: /Tasks|Tarefas/ })).toBeVisible()
  })

  test('navigate to Agents page', async ({ page }) => {
    await page.getByRole('button', { name: /Agents|Agentes/ }).click({ force: true })
    await expect(page.getByRole('heading', { name: /Agents|Agentes/ })).toBeVisible({ timeout: 10000 })
  })

  test('navigate to Analytics page', async ({ page }) => {
    await page.getByRole('button', { name: /Analytics|Anal.ticos/ }).click({ force: true })
    await expect(page.getByRole('heading', { name: /Analytics|Anal.ticos/ })).toBeVisible({ timeout: 10000 })
  })

  test('navigate to Settings page', async ({ page }) => {
    await page.getByRole('button', { name: /Settings|Configura..es/ }).click({ force: true })
    await expect(page.getByRole('heading', { name: /Settings|Configura..es/ })).toBeVisible({ timeout: 10000 })
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

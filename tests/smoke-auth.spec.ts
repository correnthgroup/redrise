import { expect, test } from '@playwright/test'

test('shows dashboard after login', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: /New Workspace/i })).toBeVisible({ timeout: 15000 })
})

test('shows sidebar navigation items', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: /New Workspace/i })).toBeVisible({ timeout: 15000 })
  await expect(page.getByRole('button', { name: 'Dashboard' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Flow' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Tasks' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Agents' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Analytics' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Settings', exact: true })).toBeVisible()
})

test('topbar shows New Workspace button', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: /New Workspace/i })).toBeVisible({ timeout: 15000 })
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
})

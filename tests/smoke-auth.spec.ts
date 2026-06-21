import { expect, test } from '@playwright/test'
import { openAuthenticatedApp } from './support/app'

test('shows dashboard after login', async ({ page }) => {
  await openAuthenticatedApp(page)
  await expect(page.getByTestId('dashboard-page')).toBeVisible()
})

test('shows sidebar navigation items', async ({ page }) => {
  await openAuthenticatedApp(page)
  await expect(page.getByTestId('sidebar-nav-dashboard')).toBeVisible()
  await expect(page.getByTestId('sidebar-nav-flow')).toBeVisible()
  await expect(page.getByTestId('sidebar-nav-tasks')).toBeVisible()
  await expect(page.getByTestId('sidebar-nav-agents')).toBeVisible()
  await expect(page.getByTestId('sidebar-nav-analytics')).toBeVisible()
  await expect(page.getByTestId('sidebar-nav-settings')).toBeVisible()
})

test('topbar shows New Workspace button', async ({ page }) => {
  await openAuthenticatedApp(page)
  await expect(page.getByTestId('dashboard-new-workspace')).toBeVisible({ timeout: 15000 })
  await expect(page.getByRole('heading', { name: /Dashboard|Painel/ })).toBeVisible()
})

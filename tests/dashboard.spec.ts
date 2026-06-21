import { expect, test } from '@playwright/test'
import { openSidebarModule, openTopbarAction } from './support/app'

test('dashboard module renders and opens workspace creation', async ({ page }) => {
  await openSidebarModule(page, 'dashboard', 'dashboard-page')
  await expect(page.getByTestId('dashboard-new-workspace')).toBeVisible()

  await openTopbarAction(page, 'dashboard-new-workspace', 'create-workspace-page')
})

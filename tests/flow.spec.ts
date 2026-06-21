import { expect, test } from '@playwright/test'
import { openSidebarModule, openTopbarAction } from './support/app'

test('flow module renders and opens flow creation', async ({ page }) => {
  await openSidebarModule(page, 'flow', 'flow-list-page')
  await expect(page.getByTestId('flow-new-flow')).toBeVisible()

  await openTopbarAction(page, 'flow-new-flow', 'create-flow-page')
})

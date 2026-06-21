import { expect, test } from '@playwright/test'
import { openSidebarModule, openTopbarAction } from './support/app'

test('agents module renders and opens agent creation', async ({ page }) => {
  await openSidebarModule(page, 'agents', 'agent-list-page')
  await expect(page.getByTestId('agents-new-agent')).toBeVisible()

  await openTopbarAction(page, 'agents-new-agent', 'agent-create-page')
})

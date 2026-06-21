import { test } from '@playwright/test'
import { openSidebarModule } from './support/app'

test('analytics module renders', async ({ page }) => {
  await openSidebarModule(page, 'analytics', 'analytics-page')
})

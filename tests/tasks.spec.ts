import { expect, test } from '@playwright/test'
import { openSidebarModule, openTopbarAction } from './support/app'

test('tasks module renders and opens task creation', async ({ page }) => {
  await openSidebarModule(page, 'tasks', 'task-board-page')
  await expect(page.getByTestId('tasks-new-task')).toBeVisible()

  await openTopbarAction(page, 'tasks-new-task', 'create-task-page')
})

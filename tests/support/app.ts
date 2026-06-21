import { expect, type Page } from '@playwright/test'

export type SidebarModule = 'dashboard' | 'flow' | 'tasks' | 'agents' | 'analytics' | 'settings'

export async function openAuthenticatedApp(page: Page) {
  await page.addInitScript(() => {
    window.localStorage.setItem('app:sidebar:collapsed', '0')
  })
  await page.goto('/')
  await expect(page.getByTestId('sidebar-nav-dashboard')).toBeVisible({ timeout: 30000 })
  await expect(page.getByTestId('dashboard-page')).toBeVisible({ timeout: 30000 })
}

export async function openSidebarModule(page: Page, module: SidebarModule, pageTestId: string) {
  await openAuthenticatedApp(page)
  if (module !== 'dashboard') {
    const navItem = page.getByTestId(`sidebar-nav-${module}`)
    await expect(navItem).toBeAttached({ timeout: 30000 })
    await navItem.evaluate((button) => button.click())
  }
  await expect(page.getByTestId(pageTestId)).toBeVisible({ timeout: 30000 })
}

export async function openTopbarAction(page: Page, actionTestId: string, targetPageTestId: string) {
  const action = page.getByTestId(actionTestId)
  await expect(action).toBeEnabled({ timeout: 30000 })
  await action.evaluate((button) => button.click())

  try {
    await expect(page.getByTestId(targetPageTestId)).toBeVisible({ timeout: 5000 })
  } catch {
    if (await action.isVisible().catch(() => false)) {
      await action.evaluate((button) => button.click())
    }
  }

  await expect(page.getByTestId(targetPageTestId)).toBeVisible({ timeout: 30000 })
}

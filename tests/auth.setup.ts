import { test as setup, expect } from '@playwright/test'

const TEST_EMAIL = 'raulveiga137@gmail.com'
const TEST_PASSWORD = 'Abcw1010@'

setup('authenticate via UI', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()

  await page.getByLabel('Email').fill(TEST_EMAIL)
  await page.locator('#password').fill(TEST_PASSWORD)
  await page.getByLabel('Remember Me').check()
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()

  const dashboardBtn = page.getByRole('button', { name: /New Workspace/i })
  const errorMsg = page.locator('[class*="error"], [class*="destructive"]').first()

  await Promise.race([
    dashboardBtn.waitFor({ state: 'visible', timeout: 15000 }),
    errorMsg.waitFor({ state: 'visible', timeout: 15000 }),
  ])

  if (await errorMsg.isVisible()) {
    const text = await errorMsg.textContent()
    throw new Error(`Sign-in failed: ${text}`)
  }

  await expect(dashboardBtn).toBeVisible()
  await page.context().storageState({ path: 'tests/.auth/user.json' })
})

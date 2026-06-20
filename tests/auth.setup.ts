import { test as setup, expect } from '@playwright/test'

const TEST_PASSWORD = 'Abcw1010@'

setup('authenticate via UI', async ({ page }) => {
  const testEmail = `e2e-auth-${Date.now()}@gmail.com`

  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()

  await page.getByRole('link', { name: 'Create account' }).click()
  await expect(page.getByRole('heading', { name: 'Create account' })).toBeVisible()
  await page.getByLabel('First Name').fill('E2E')
  await page.getByLabel('Middle Name').fill('Auth')
  await page.getByLabel('Last Name').fill(`${Date.now()}`)
  await page.getByLabel('Email').fill(testEmail)
  await page.locator('#password-su').fill(TEST_PASSWORD)
  await page.locator('#confirm-password').fill(TEST_PASSWORD)
  await page.getByRole('button', { name: 'Create account' }).click()

  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
  await expect(page.getByText('Account created. Sign in with the credentials you just created.')).toBeVisible({ timeout: 15000 })

  await page.getByLabel('Email').fill(testEmail)
  await page.locator('#password').fill(TEST_PASSWORD)
  await page.getByLabel('Remember Me').check()
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()

  const dashboardBtn = page.getByRole('button', { name: /New Workspace/i }).first()
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

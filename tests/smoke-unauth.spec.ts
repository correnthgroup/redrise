import { expect, test } from '@playwright/test'

test('renders sign-in page', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Redrise')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Create account' })).toBeVisible()
})

test('switches to sign-up form', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Create account' }).click()
  await expect(page.getByRole('heading', { name: 'Create account' })).toBeVisible()
  await expect(page.getByLabel('First Name')).toBeVisible()
  await expect(page.getByLabel('Middle Name')).toBeVisible()
  await expect(page.getByLabel('Last Name')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible()
})

test('shows password validation rules on sign-up', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Create account' }).click()
  await page.locator('#password-su').fill('abc')
  await expect(page.getByText('At least 8 characters')).toBeVisible()
  await expect(page.getByText('One letter')).toBeVisible()
  await expect(page.getByText('One number')).toBeVisible()
})

test('sign-up returns to sign-in after account creation', async ({ page }) => {
  const ts = Date.now()
  await page.goto('/')
  await page.getByRole('link', { name: 'Create account' }).click()
  await page.getByLabel('First Name').fill('Invite')
  await page.getByLabel('Middle Name').fill('Test')
  await page.getByLabel('Last Name').fill(`${ts}`)
  await page.getByLabel('Email').fill(`invite-test-${ts}@gmail.com`)
  await page.locator('#password-su').fill('Abcd1234')
  await page.locator('#confirm-password').fill('Abcd1234')
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible({ timeout: 15000 })
  await expect(page.getByText(/Account created|Too many attempts/i)).toBeVisible({ timeout: 15000 })
  await expect(page.getByRole('heading', { name: 'Dashboard' })).not.toBeVisible()
})

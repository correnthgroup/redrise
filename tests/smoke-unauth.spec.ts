import { expect, test } from '@playwright/test'

test('renders sign-in page', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Redrise')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Create an account' })).toBeVisible()
})

test('switches to sign-up form', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Create an account' }).click()
  await expect(page.getByRole('heading', { name: 'Create account' })).toBeVisible()
  await expect(page.getByLabel('Full name')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible()
})

test('shows password validation rules on sign-up', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Create an account' }).click()
  await page.locator('#password-su').fill('abc')
  await expect(page.getByText('At least 8 characters')).toBeVisible()
  await expect(page.getByText('One uppercase letter')).toBeVisible()
  await expect(page.getByText('One digit')).toBeVisible()
  await expect(page.getByText('One symbol')).toBeVisible()
})

test('sign-up asks for email confirmation', async ({ page }) => {
  const ts = Date.now()
  await page.goto('/')
  await page.getByRole('link', { name: 'Create an account' }).click()
  await page.getByLabel('Full name').fill(`Invite Test ${ts}`)
  await page.getByLabel('Email').fill(`invite-test-${ts}@gmail.com`)
  await page.locator('#password-su').fill('Abcd1234!')
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page.getByText(/Check your email|email rate limit exceeded/i)).toBeVisible({ timeout: 15000 })
})

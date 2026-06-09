import { expect, test } from '@playwright/test'

test('renders auth flow', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByText('Redrise')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: /Sign in with GitHub/ })).toBeVisible()
})

test('shows sign up form', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('link', { name: 'Create an account' }).click()

  await expect(page.getByRole('heading', { name: 'Create account' })).toBeVisible()
  await expect(page.getByLabel('Full name')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Create account' })).toBeVisible()
})

test('shows password validation rules on sign up', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('link', { name: 'Create an account' }).click()
  await page.locator('#password-su').fill('abc')

  await expect(page.getByText('At least 8 characters')).toBeVisible()
  await expect(page.getByText('One uppercase letter')).toBeVisible()
  await expect(page.getByText('One digit')).toBeVisible()
  await expect(page.getByText('One symbol')).toBeVisible()
})

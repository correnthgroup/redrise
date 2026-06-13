import { expect, test } from '@playwright/test'

test('personal information persists to dashboard and sidebar', async ({ page }) => {
  const ts = Date.now()
  const firstName = `E2E${ts}`
  const username = `e2e.${ts}`

  await page.goto('/')
  await page.getByRole('button', { name: 'Settings', exact: true }).click()
  await page.getByText('Personal Information').click()

  await page.locator('#firstName').fill(firstName)
  await page.locator('#lastName').fill('User')
  await page.locator('#username').fill(username)
  await page.locator('#phone').fill('+55 11999999999')
  await page.getByRole('button', { name: 'Save Changes' }).click()

  await page.getByRole('button', { name: 'Dashboard' }).click()
  await expect(page.getByText(`Welcome to your workspace, ${firstName}.`)).toBeVisible({ timeout: 15000 })
  await expect(page.getByText(username)).toBeVisible()
})

test('remember me creates active session entry', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Settings', exact: true }).click()
  await page.getByText('Active Sessions').click()
  await expect(page.getByText('This Device').first()).toBeVisible({ timeout: 15000 })
})

test('team member invite creates invited member row', async ({ page }) => {
  const email = `team-invite-${Date.now()}@gmail.com`

  await page.goto('/')
  await page.getByRole('button', { name: 'Settings', exact: true }).click()
  await page.getByText('Team Members').click()
  await expect(page.getByRole('heading', { name: 'Members List' })).toBeVisible({ timeout: 15000 })

  await page.getByRole('button', { name: 'Add Member' }).click()
  await page.locator('#new-email').fill(email)
  await page.getByRole('button', { name: 'Send invites' }).click()

  await expect(page.getByText(email).first()).toBeVisible({ timeout: 20000 })
  await expect(page.getByText('Invited').first()).toBeVisible()
})

test('plans submenu shows plan cards and checkout placeholder', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Settings', exact: true }).click()
  await page.getByText('Plans').click()

  await expect(page.getByRole('heading', { name: 'Plans' })).toBeVisible({ timeout: 15000 })
  await expect(page.getByRole('heading', { name: 'Free' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Business' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Corporate' })).toBeVisible()

  await page.getByRole('button', { name: 'Join Now' }).first().click()
  await expect(page.getByText(/checkout is ready for Stripe configuration/i)).toBeVisible()
})

test('personal information access details opens plans', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Settings', exact: true }).click()
  await page.getByText('Personal Information').click()

  await page.getByRole('button', { name: /Active access:/ }).click()
  await page.getByRole('button', { name: 'Details' }).click()

  await expect(page.getByRole('heading', { name: 'Plans' })).toBeVisible({ timeout: 15000 })
})

import { expect, test, type Page } from '@playwright/test'

async function openSettings(page: Page) {
  await page.goto('/')
  const settingsButton = page.getByRole('button', { name: 'Settings', exact: true })
  await settingsButton.click()
  try {
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible({ timeout: 5000 })
  } catch {
    await settingsButton.click()
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible({ timeout: 10000 })
  }
}

test('personal information persists to dashboard and sidebar', async ({ page }) => {
  const ts = Date.now()
  const firstName = `E2E${ts}`

  await openSettings(page)
  await page.getByText('Personal Information').click()

  await page.locator('#firstName').fill(firstName)
  await page.locator('#lastName').fill('User')
  const username = await page.locator('#username').inputValue()
  await page.locator('#phone').fill('+55 11999999999')
  await page.getByRole('button', { name: 'Save Changes' }).click()

  await page.getByRole('button', { name: 'Dashboard' }).click()
  await expect(page.getByText(`Welcome to your workspace, ${firstName}.`)).toBeVisible({ timeout: 15000 })
  await expect(page.getByText(username)).toBeVisible()
})

test('profile language controls dashboard and settings copy', async ({ page }) => {
  await openSettings(page)
  await page.getByText('Personal Information').click()

  await page.locator('#language').click()
  await page.getByRole('option', { name: 'Português-BR' }).click()
  await page.getByRole('button', { name: 'Save Changes' }).click()

  await expect(page.getByRole('button', { name: 'Painel', exact: true })).toBeVisible({ timeout: 15000 })
  await page.getByRole('button', { name: 'Painel', exact: true }).click()
  await expect(page.getByText(/Bem-vindo ao seu workspace/)).toBeVisible({ timeout: 15000 })

  await page.getByRole('button', { name: 'Configurações', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Configurações' })).toBeVisible({ timeout: 15000 })
  await expect(page.getByText('Atalhos da Conta')).toBeVisible()

  await page.getByText('Informações Pessoais').click()
  await page.locator('#language').click()
  await page.getByRole('option', { name: 'English-US' }).click()
  await page.getByRole('button', { name: 'Salvar Alterações' }).click()
  await expect(page.getByRole('button', { name: 'Dashboard', exact: true })).toBeVisible({ timeout: 15000 })
})

test('remember me creates active session entry', async ({ page }) => {
  await openSettings(page)
  await page.getByText('Active Sessions').click()
  await expect(page.getByText('Current device').first()).toBeVisible({ timeout: 15000 })
})

test('team member invite creates invited member row', async ({ page }) => {
  const email = `team-invite-${Date.now()}@gmail.com`

  await openSettings(page)
  await page.getByText('Team Members').click()
  await expect(page.getByRole('heading', { name: 'Members List' })).toBeVisible({ timeout: 15000 })

  await page.getByRole('button', { name: 'Add Member' }).click()
  await page.locator('#new-email').fill(email)
  await page.getByRole('button', { name: 'Send invites' }).click()

  await expect(page.getByText(email).first()).toBeVisible({ timeout: 20000 })
  await expect(page.getByText('Invited').first()).toBeVisible()
})

test('plans submenu shows plan cards and checkout placeholder', async ({ page }) => {
  await openSettings(page)
  await page.getByText('Plans').click()

  await expect(page.getByRole('heading', { name: 'Plans' })).toBeVisible({ timeout: 15000 })
  await expect(page.getByRole('heading', { name: 'Free' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Business' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Corporate' })).toBeVisible()

  await page.getByRole('button', { name: 'Join Now' }).first().click()
  await expect(page.getByText(/checkout is ready for Stripe configuration/i)).toBeVisible()
})

test('personal information access details opens plans', async ({ page }) => {
  await openSettings(page)
  await page.getByText('Personal Information').click()

  await page.getByRole('button', { name: /Active access:/ }).click()
  await page.getByRole('button', { name: 'Details' }).click()

  await expect(page.getByRole('heading', { name: 'Plans' })).toBeVisible({ timeout: 15000 })
})

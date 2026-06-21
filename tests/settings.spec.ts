import { expect, test, type Page } from '@playwright/test'
import { openSidebarModule } from './support/app'

async function openSettings(page: Page) {
  await openSidebarModule(page, 'settings', 'settings-page')
  await expect(page.getByTestId('settings-shortcut-personal-info')).toBeVisible({ timeout: 30000 })
}

async function openShortcut(page: Page, key: string) {
  const shortcut = page.getByTestId(`settings-shortcut-${key}`)
  await expect(shortcut).toBeVisible({ timeout: 45000 })
  await shortcut.click()
}

test('personal information persists to dashboard and sidebar', async ({ page }) => {
  const ts = Date.now()
  const firstName = `E2E${ts}`

  await openSettings(page)
  await openShortcut(page, 'personal-info')

  await page.locator('#firstName').fill(firstName)
  await page.locator('#lastName').fill('User')
  const username = await page.locator('#username').inputValue()
  await page.locator('#phone').fill('+55 11999999999')
  await page.getByRole('button', { name: /Save Changes|Salvar Altera..es/ }).click()

  await page.getByRole('button', { name: /Dashboard|Painel/ }).click()
  await expect(page.getByRole('heading', { name: new RegExp(`(Welcome to your workspace|Bem-vindo ao seu workspace), ${firstName}\\.`) })).toBeVisible({ timeout: 15000 })
  await expect(page.getByText(username)).toBeVisible()
})

test('profile language controls dashboard and settings copy', async ({ page }) => {
  await openSettings(page)
  await openShortcut(page, 'personal-info')

  await page.locator('#language').click()
  await page.getByRole('option', { name: 'Português-BR' }).click()
  await page.getByRole('button', { name: 'Save Changes' }).click()

  await expect(page.getByRole('button', { name: 'Painel', exact: true })).toBeVisible({ timeout: 15000 })
  await page.getByRole('button', { name: 'Painel', exact: true }).click()
  await expect(page.getByRole('heading', { name: /Bem-vindo ao seu workspace/ })).toBeVisible({ timeout: 15000 })

  await page.getByRole('button', { name: 'Configurações', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Configurações' })).toBeVisible({ timeout: 15000 })
  await expect(page.getByText('Atalhos da Conta')).toBeVisible()

  await openShortcut(page, 'personal-info')
  await page.locator('#language').click()
  await page.getByRole('option', { name: 'English-US' }).click()
  await page.getByRole('button', { name: 'Salvar Alterações' }).click()
  await expect(page.getByRole('button', { name: 'Dashboard', exact: true })).toBeVisible({ timeout: 15000 })
})

test('remember me creates active session entry', async ({ page }) => {
  await openSettings(page)
  await openShortcut(page, 'active-sessions')
  await expect(page.getByText(/Current device|Dispositivo atual/).first()).toBeVisible({ timeout: 15000 })
})

test('team member invite creates invited member row', async ({ page }) => {
  const email = `team-invite-${Date.now()}@gmail.com`

  await openSettings(page)
  await openShortcut(page, 'team-members')
  await expect(page.getByRole('heading', { name: /Members List|Lista de Membros/ })).toBeVisible({ timeout: 15000 })

  await page.getByRole('button', { name: /Add Member|Adicionar Membro/ }).click()
  await page.locator('#new-email').fill(email)
  await page.getByRole('button', { name: /Send invites|Enviar convites/ }).click()

  await expect(page.getByText(email).first()).toBeVisible({ timeout: 20000 })
})

test('plans submenu shows plan cards and checkout placeholder', async ({ page }) => {
  await openSettings(page)
  await openShortcut(page, 'plans')

  await expect(page.getByRole('heading', { name: /Plans|Planos/ })).toBeVisible({ timeout: 15000 })
  await expect(page.getByRole('heading', { name: 'Free' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Business' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Corporate' })).toBeVisible()

  await page.getByRole('button', { name: /Join Now|Entrar Agora/ }).first().click()
  await expect(page.getByText(/checkout is ready for Stripe configuration|checkout.*Stripe/i)).toBeVisible()
})

test('personal information access details opens plans', async ({ page }) => {
  await openSettings(page)
  await openShortcut(page, 'personal-info')

  await page.getByRole('button', { name: /Active access:|Acesso ativo:/ }).click()
  await page.getByRole('button', { name: /Details|Detalhes/ }).click()

  await expect(page.getByRole('heading', { name: /Plans|Planos/ })).toBeVisible({ timeout: 15000 })
})

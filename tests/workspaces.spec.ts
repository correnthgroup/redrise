import { expect, test } from '@playwright/test'

const TS = Date.now()
const WS_NAME = `E2E ${TS}`
const WS_MISSION = `Mission ${TS}`

test('workspace lifecycle: create → review → cancel → delete', async ({ page }) => {
  // ── Create ──
  await page.goto('/')
  await expect(page.getByRole('button', { name: /New Workspace|Novo Workspace/i })).toBeVisible({ timeout: 15000 })

  const newWorkspaceButton = page.getByRole('button', { name: /New Workspace|Novo Workspace/i }).first()
  await expect(newWorkspaceButton).toBeEnabled({ timeout: 15000 })
  await newWorkspaceButton.click()
  await expect(page.getByRole('heading', { name: /New Workspace|Novo Workspace/ })).toBeVisible({ timeout: 15000 })

  await page.getByLabel(/Name|Nome/).fill(WS_NAME)
  await page.getByLabel(/Mission|Miss.o/).fill(WS_MISSION)
  await page.getByRole('button', { name: /Next|Pr.ximo/ }).click()

  await expect(page.getByText(/Health Check Frequency|Frequ.ncia de Health Check/)).toBeVisible()
  await page.getByRole('button', { name: /Next|Pr.ximo/ }).click()

  await expect(page.getByText(/Step 3 of 3|Etapa 3 de 3/)).toBeVisible()
  await expect(page.getByText(WS_NAME)).toBeVisible()
  await expect(page.getByText(WS_MISSION)).toBeVisible()
  await page.getByRole('button', { name: /Done|Conclu.do/ }).click()

  // Wait for board to fully render with the workspace
  await expect(page.getByRole('heading', { name: /Dashboard|Painel/ })).toBeVisible({ timeout: 10000 })
  await expect(page.locator('button', { hasText: WS_NAME }).first()).toBeVisible({ timeout: 10000 })

  // ── Open review ──
  const cardButton = page.locator('button', { hasText: WS_NAME }).first()
  await expect(cardButton).toBeVisible()
  await cardButton.click()

  await expect(page.getByRole('heading', { name: /Review Workspace|Revisar Workspace/ })).toBeVisible({ timeout: 10000 })
  await expect(page.getByText(/Identity|Identidade/)).toBeVisible()
  await expect(page.getByText(new RegExp(`(Name|Nome): ${WS_NAME}`))).toBeVisible()
  await expect(page.getByText('pending').first()).toBeVisible()

  // ── Cancel → back to board ──
  await page.getByRole('button', { name: /Back|Voltar|Cancel|Cancelar/ }).click()
  await expect(page.locator('button', { hasText: WS_NAME }).first()).toBeVisible()

  // ── Open review again → delete ──
  const cardButton2 = page.locator('button', { hasText: WS_NAME }).first()
  await expect(cardButton2).toBeVisible()
  await cardButton2.click()

  await expect(page.getByRole('heading', { name: /Review Workspace|Revisar Workspace/ })).toBeVisible({ timeout: 10000 })

  await page.locator('button:has(svg.lucide-trash2)').click()
  await expect(page.getByText(/Delete Workspace|Excluir Workspace/)).toBeVisible()

  await expect(page.getByRole('button', { name: 'OK' })).toBeDisabled()
  await page.getByPlaceholder(/Type DELETE to confirm|Digite DELETE para confirmar/).fill('DELETE')
  await page.getByRole('button', { name: 'OK' }).click()

  // Verify workspace removed from board
  await expect(page.getByText(WS_NAME)).toHaveCount(0, { timeout: 10000 })
})

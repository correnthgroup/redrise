import { expect, test } from '@playwright/test'

test('shows dashboard after login', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: /New Workspace|Novo Workspace/i })).toBeVisible({ timeout: 15000 })
})

test('shows sidebar navigation items', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: /New Workspace|Novo Workspace/i })).toBeVisible({ timeout: 15000 })
  await expect(page.getByRole('button', { name: /Dashboard|Painel/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /Flow|Fluxo/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /Tasks|Tarefas/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /Agents|Agentes/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /Analytics|Anal.ticos/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /Settings|Configura..es/ })).toBeVisible()
})

test('topbar shows New Workspace button', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('button', { name: /New Workspace|Novo Workspace/i })).toBeVisible({ timeout: 15000 })
  await expect(page.getByRole('heading', { name: /Dashboard|Painel/ })).toBeVisible()
})

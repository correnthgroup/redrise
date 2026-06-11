import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

function loadEnv(): Record<string, string> {
  const envPath = resolve(__dirname, '..', '.env')
  const raw = readFileSync(envPath, 'utf-8')
  const content = raw.charCodeAt(0) === 0xFEFF ? raw.slice(1) : raw
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const env: Record<string, string> = {}
  for (const line of normalized.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq > 0) {
      env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim()
    }
  }
  return env
}

const env = loadEnv()
export const TEST_EMAIL = 'raulveiga137@gmail.com'
export const TEST_PASSWORD = 'Abcw1010@'

export default async function globalSetup() {
  if (!env.VITE_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('[global-setup] Missing env vars — skipping user creation')
    console.warn('[global-setup] Ensure test user exists: test@redrise.app / TestPass123!')
    return
  }

  console.log('[global-setup] NOTE: Create test user manually in Supabase Dashboard if not exists')
  console.log('[global-setup] Email:', TEST_EMAIL, '/ Password:', TEST_PASSWORD)
}

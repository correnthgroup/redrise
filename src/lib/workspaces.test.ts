import { describe, it, expect, vi, beforeEach } from 'vitest'

function setupQueryChain(data: unknown[] | null = [], error: unknown = null) {
  let countMode = false
  const chain = {
    select: vi.fn((...args: unknown[]) => {
      countMode = !!(args[1] && typeof args[1] === 'object' && 'count' in (args[1] as Record<string, unknown>))
      return chain
    }),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data, error }),
    then: vi.fn((resolve: (v: { data: unknown; error: unknown; count: number }) => void) => {
      if (countMode) {
        resolve({ data: null, error: null, count: 0 })
      } else {
        resolve({ data, error, count: 0 })
      }
    }),
  }
  return chain
}

vi.mock('./supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-1', email: 'test@test.com' } },
      }),
    },
    from: vi.fn(() => setupQueryChain()),
  },
}))

import { loadWorkspaces, createWorkspace, getWorkspace, deleteWorkspace } from './workspaces'
import { supabase } from './supabase'

const mockFrom = vi.mocked(supabase.from)

describe('workspaces persistence (Supabase)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loadWorkspaces queries Supabase', async () => {
    const chain = setupQueryChain([])
    mockFrom.mockReturnValue(chain as never)

    const result = await loadWorkspaces()
    expect(result).toEqual([])
    expect(mockFrom).toHaveBeenCalledWith('workspaces')
    expect(chain.select).toHaveBeenCalledWith('*')
    expect(chain.order).toHaveBeenCalledWith('created_at', { ascending: false })
  })

  it('createWorkspace inserts into Supabase', async () => {
    const mockWorkspace = {
      id: 'w1',
      user_id: 'user-1',
      name: 'Test Workspace',
      mission: 'Test mission',
      status: 'pending',
      flows: 0,
      created_at: '2026-01-01T00:00:00.000Z',
      updated_at: '2026-01-01T00:00:00.000Z',
    }
    const chain = setupQueryChain()
    chain.single.mockResolvedValue({ data: mockWorkspace, error: null })
    mockFrom.mockReturnValue(chain as never)

    const result = await createWorkspace({ name: 'Test Workspace', mission: 'Test mission' })
    expect(result).toEqual(mockWorkspace)
    expect(chain.insert).toHaveBeenCalled()
    expect(chain.select).toHaveBeenCalled()
    expect(chain.single).toHaveBeenCalled()
  })

  it('createWorkspace includes required fields in insert', async () => {
    const chain = setupQueryChain()
    chain.single.mockResolvedValue({ data: { id: 'w2' }, error: null })
    mockFrom.mockReturnValue(chain as never)

    await createWorkspace({ name: 'My Workspace', mission: 'My mission' })

    const insertPayload = chain.insert.mock.calls[0][0] as Record<string, unknown>
    expect(insertPayload).toHaveProperty('id')
    expect(insertPayload).toHaveProperty('user_id', 'user-1')
    expect(insertPayload).toHaveProperty('name', 'My Workspace')
    expect(insertPayload).toHaveProperty('mission', 'My mission')
    expect(insertPayload).toHaveProperty('status', 'pending')
    expect(insertPayload).toHaveProperty('flows', 0)
    expect(insertPayload).toHaveProperty('created_at')
    expect(insertPayload).toHaveProperty('updated_at')
    expect(typeof insertPayload.created_at).toBe('string')
    expect(typeof insertPayload.updated_at).toBe('string')
  })

  it('getWorkspace queries by id', async () => {
    const mockWorkspace = { id: 'w1', name: 'Found' }
    const chain = setupQueryChain()
    chain.single.mockResolvedValue({ data: mockWorkspace, error: null })
    mockFrom.mockReturnValue(chain as never)

    const result = await getWorkspace('w1')
    expect(result).toEqual(mockWorkspace)
    expect(chain.eq).toHaveBeenCalledWith('id', 'w1')
  })

  it('deleteWorkspace deletes by id', async () => {
    const chain = setupQueryChain()
    mockFrom.mockReturnValue(chain as never)

    const result = await deleteWorkspace('w1')
    expect(result).toBe(true)
    expect(chain.delete).toHaveBeenCalled()
    expect(chain.eq).toHaveBeenCalledWith('id', 'w1')
  })

  it('loadWorkspaces returns empty on error', async () => {
    const chain = setupQueryChain(null, { message: 'Connection failed' })
    mockFrom.mockReturnValue(chain as never)

    const result = await loadWorkspaces()
    expect(result).toEqual([])
  })
})

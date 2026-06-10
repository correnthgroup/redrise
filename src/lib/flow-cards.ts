import { supabase } from './supabase'
import type { FlowCard, FlowEdge, CreateFlowCardInput, CreateFlowEdgeInput } from '@/types/flow-card'

function generateShortId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let id = 'c'
  for (let i = 0; i < 5; i++) {
    id += chars[Math.floor(Math.random() * chars.length)]
  }
  return id
}

function generateEdgeShortId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let id = 'e'
  for (let i = 0; i < 5; i++) {
    id += chars[Math.floor(Math.random() * chars.length)]
  }
  return id
}

// ─── Flow Cards ──────────────────────────────────────────────────────────────

export async function loadFlowCards(flowId: string): Promise<FlowCard[]> {
  const { data, error } = await supabase
    .from('flow_cards')
    .select('*')
    .eq('flow_id', flowId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[loadFlowCards] Error:', error.message, error.details, error.hint)
    return []
  }

  console.log('[loadFlowCards] Loaded:', data?.length ?? 0, 'cards for flow', flowId)
  return (data ?? []) as FlowCard[]
}

export async function createFlowCard(input: CreateFlowCardInput): Promise<FlowCard | null> {
  const id = generateShortId()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('flow_cards')
    .insert({
      id,
      flow_id: input.flow_id,
      node_id: input.node_id,
      label: input.label || 'New Card',
      instructions: input.instructions || '',
      members: input.members ?? [],
      agents: input.agents ?? [],
      position_x: input.position_x,
      position_y: input.position_y,
      created_at: now,
      updated_at: now,
    })
    .select()
    .single()

  if (error) {
    console.error('[createFlowCard] Error:', error.message, error.details, error.hint)
    return null
  }

  return data as FlowCard
}

export async function updateFlowCard(id: string, updates: Partial<Pick<FlowCard, 'label' | 'instructions' | 'members' | 'agents' | 'position_x' | 'position_y'>>): Promise<boolean> {
  const now = new Date().toISOString()
  const { error } = await supabase
    .from('flow_cards')
    .update({ ...updates, updated_at: now })
    .eq('id', id)

  if (error) {
    console.error('[updateFlowCard] Error:', error.message, error.details, error.hint)
    return false
  }

  return true
}

export async function deleteFlowCard(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('flow_cards')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('[deleteFlowCard] Error:', error.message, error.details, error.hint)
    return false
  }

  return true
}

// ─── Flow Edges ──────────────────────────────────────────────────────────────

export async function loadFlowEdges(flowId: string): Promise<FlowEdge[]> {
  const { data, error } = await supabase
    .from('flow_edges')
    .select('*')
    .eq('flow_id', flowId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[loadFlowEdges] Error:', error.message, error.details, error.hint)
    return []
  }

  return (data ?? []) as FlowEdge[]
}

export async function createFlowEdge(input: CreateFlowEdgeInput): Promise<FlowEdge | null> {
  const id = generateEdgeShortId()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('flow_edges')
    .insert({
      id,
      flow_id: input.flow_id,
      edge_id: input.edge_id,
      source: input.source,
      target: input.target,
      animated: input.animated ?? true,
      created_at: now,
    })
    .select()
    .single()

  if (error) {
    console.error('[createFlowEdge] Error:', error.message, error.details, error.hint)
    return null
  }

  return data as FlowEdge
}

export async function deleteFlowEdge(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('flow_edges')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('[deleteFlowEdge] Error:', error.message, error.details, error.hint)
    return false
  }

  return true
}

// ─── Batch Operations ────────────────────────────────────────────────────────

export async function syncFlowEditor(
  flowId: string,
  cards: { node_id: string; label: string; instructions?: string; members?: string[]; agents?: string[]; position_x: number; position_y: number }[],
  edges: { edge_id: string; source: string; target: string; animated?: boolean }[]
): Promise<boolean> {
  console.log('[syncFlowEditor] Syncing', cards.length, 'cards and', edges.length, 'edges for flow', flowId)

  // Delete all existing cards and edges for this flow
  await supabase.from('flow_cards').delete().eq('flow_id', flowId)
  await supabase.from('flow_edges').delete().eq('flow_id', flowId)

  // Insert new cards
  if (cards.length > 0) {
    const now = new Date().toISOString()
    const cardRows = cards.map((c) => ({
      id: generateShortId(),
      flow_id: flowId,
      node_id: c.node_id,
      label: c.label || 'New Card',
      instructions: c.instructions || '',
      members: c.members ?? [],
      agents: c.agents ?? [],
      position_x: c.position_x,
      position_y: c.position_y,
      created_at: now,
      updated_at: now,
    }))

    const { error: cardError } = await supabase.from('flow_cards').insert(cardRows)
    if (cardError) {
      console.error('[syncFlowEditor] Card insert error:', cardError.message, cardError.details, cardError.hint)
      return false
    }
  }

  // Insert new edges
  if (edges.length > 0) {
    const now = new Date().toISOString()
    const edgeRows = edges.map((e) => ({
      id: generateEdgeShortId(),
      flow_id: flowId,
      edge_id: e.edge_id,
      source: e.source,
      target: e.target,
      animated: e.animated ?? true,
      created_at: now,
    }))

    const { error: edgeError } = await supabase.from('flow_edges').insert(edgeRows)
    if (edgeError) {
      console.error('[syncFlowEditor] Edge insert error:', edgeError.message, edgeError.details, edgeError.hint)
      return false
    }
  }

  console.log('[syncFlowEditor] Success')
  return true
}

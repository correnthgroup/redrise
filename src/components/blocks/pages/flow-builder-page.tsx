import { useCallback, useState, useEffect, useRef } from 'react'
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useReactFlow,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Pencil, Check, X, Keyboard, CheckCircle2 } from 'lucide-react'
import { useFlowCards } from '@/hooks/use-flow-cards'
import { useI18n } from '@/hooks/use-i18n'
import { MultiSelectDropdown } from '../shared/multi-select-dropdown'
import { loadAgents } from '@/lib/agents'
import type { Agent } from '@/types/agent'

type FlowNode = Node<{ label: string; instructions?: string; members?: string[]; agents?: string[] }>

let nodeIdCounter = 5

function FlowCardWithEdit({ data, selected, id }: NodeProps<FlowNode>) {
  const { t } = useI18n()
  const openCardEditor = (window as unknown as Record<string, (id: string) => void>).__flowCardEdit
  const agents = data.agents ?? []

  return (
    <div
      className={
        'w-[180px] rounded-lg border border-border/80 bg-card px-3 py-2 text-sm shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)] ' +
        (selected ? 'ring-2 ring-primary shadow-[0_0_0_1px_rgba(140,31,40,0.08),0_12px_28px_rgba(47,72,88,0.18)]' : '')
      }
    >
      <Handle type="target" position={Position.Left} />
      <div className="flex items-center justify-between">
        <div className="font-medium truncate">{data.label}</div>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 shrink-0 text-[#A04D1F] hover:text-[#A04D1F]/80"
          onClick={(e) => {
            e.stopPropagation()
            openCardEditor?.(id)
          }}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      {agents.length > 0 && (
        <div className="text-xs text-muted-foreground truncate">{t('flowBuilder.agents', { agents: agents.join(', ') })}</div>
      )}
      {agents.length === 0 && (
        <div className="text-xs text-muted-foreground">{t('flowBuilder.undefined')}</div>
      )}
      <div className="text-[10px] text-muted-foreground/60 font-mono mt-0.5">ID: {id}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  )
}

const defaultNodes: FlowNode[] = []
const defaultEdges: Edge[] = []

function FlowBuilderContent({ flowId, flowName: initialFlowName, onBack, onSave }: { flowId?: string | null; flowName?: string; onBack?: () => void; onSave?: () => void }) {
  const { t } = useI18n()
  const { cards, edges: dbEdges, load, save } = useFlowCards(flowId ?? null)
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>(defaultNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(defaultEdges)
  const [flowName, setFlowName] = useState(initialFlowName ?? t('flow.newFlow'))
  const [editingName, setEditingName] = useState(false)
  const [tempName, setTempName] = useState('')
  const [editingCardId, setEditingCardId] = useState<string | null>(null)
  const [cardTitle, setCardTitle] = useState('')
  const [cardInstructions, setCardInstructions] = useState('')
  const [cardAgents, setCardAgents] = useState<string[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [loadingAgents, setLoadingAgents] = useState(true)
  const [saving, setSaving] = useState(false)
  const { screenToFlowPosition, getNodes, setNodes: setReactFlowNodes, setEdges: setReactFlowEdges } = useReactFlow()
  const containerRef = useRef<HTMLDivElement>(null)
  const loadedRef = useRef(false)
  const shortcutItems = [
    { key: 'N', action: t('flowBuilder.newCard') },
    { key: 'Del', action: t('flowBuilder.deleteSelected') },
    { key: 'Ctrl/⌘ + A', action: t('flowBuilder.selectAll') },
    { key: 'Ctrl/⌘ + C', action: t('flowBuilder.copySelected') },
    { key: 'Ctrl/⌘ + V', action: t('flowBuilder.paste') },
    { key: 'Ctrl/⌘ + Z', action: t('flowBuilder.undo') },
    { key: 'Ctrl/⌘ + Shift + Z', action: t('flowBuilder.redo') },
    { key: 'Mouse scroll', action: t('flowBuilder.zoom') },
  ]
  const agentOptions = agents.map((agent) => ({
    value: agent.name,
    label: agent.name === 'Default Agent' ? t('agents.defaultAgent') : agent.name,
  }))

  useEffect(() => {
    loadAgents().then((data) => {
      setAgents(data)
      setLoadingAgents(false)
    })
  }, [])

  const nodeTypes = { flowCard: FlowCardWithEdit }

  // Load data from Supabase
  useEffect(() => {
    if (flowId && !loadedRef.current) {
      loadedRef.current = true
      load()
    }
  }, [flowId, load])

  // Populate React Flow when cards/edges load
  useEffect(() => {
    if (cards.length > 0 && !loadedRef.current) return
    if (cards.length === 0 && dbEdges.length === 0 && nodes.length > 0) return

    if (cards.length > 0) {
      const flowNodes: FlowNode[] = cards.map((c) => ({
        id: c.node_id,
        type: 'flowCard',
        position: { x: c.position_x, y: c.position_y },
        data: { label: c.label, instructions: c.instructions, members: c.members, agents: c.agents },
      }))
      setReactFlowNodes(flowNodes)

      // Update nodeIdCounter
      const maxNum = flowNodes.reduce((max, n) => {
        const num = parseInt(n.id.replace(/\D/g, ''), 10)
        return num > max ? num : max
      }, 0)
      nodeIdCounter = maxNum + 1
    }

    if (dbEdges.length > 0) {
      const flowEdges: Edge[] = dbEdges.map((e) => ({
        id: e.edge_id,
        source: e.source,
        target: e.target,
        animated: e.animated,
      }))
      setReactFlowEdges(flowEdges)
    }
  }, [cards, dbEdges, nodes.length, setReactFlowNodes, setReactFlowEdges])

  const openCardEditor = useCallback((nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId)
    if (!node) return
    setEditingCardId(nodeId)
    setCardTitle(node.data.label)
    setCardInstructions(node.data.instructions ?? '')
    setCardAgents(node.data.agents ?? [])
  }, [nodes])

  useEffect(() => {
    const win = window as unknown as Record<string, (id: string) => void>
    win.__flowCardEdit = (id: string) => openCardEditor(id)
    return () => { delete (win as Record<string, unknown>).__flowCardEdit }
  }, [nodes, openCardEditor])

  const clipboardRef = useRef<FlowNode[]>([])
  const historyRef = useRef<{ nodes: FlowNode[]; edges: Edge[] }[]>([])
  const historyIndexRef = useRef(-1)

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge({ ...connection, animated: true }, eds)),
    [setEdges],
  )

  const saveHistory = useCallback(() => {
    const current = { nodes: getNodes() as FlowNode[], edges }
    const history = historyRef.current
    const idx = historyIndexRef.current
    historyRef.current = history.slice(0, idx + 1)
    historyRef.current.push(current)
    historyIndexRef.current = historyRef.current.length - 1
  }, [getNodes, edges])

  const initializedRef = useRef(false)

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true
      const current = { nodes: defaultNodes, edges: defaultEdges }
      historyRef.current = [current]
      historyIndexRef.current = 0
    }
  }, [])

  const addNode = useCallback(() => {
    saveHistory()
    const position = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
    const newNode: FlowNode = {
      id: `n${nodeIdCounter++}`,
      type: 'flowCard',
      position,
      data: { label: t('flowBuilder.newStep', { count: nodes.length + 1 }) },
    }
    setNodes((nds) => [...nds, newNode])
  }, [nodes.length, screenToFlowPosition, setNodes, saveHistory, t])

  const selectAll = useCallback(() => {
    setNodes((nds) => nds.map((n) => ({ ...n, selected: true })))
  }, [setNodes])

  const copySelected = useCallback(() => {
    const selected = getNodes().filter((n) => n.selected) as FlowNode[]
    clipboardRef.current = selected.map((n) => ({ ...n }))
  }, [getNodes])

  const paste = useCallback(() => {
    if (clipboardRef.current.length === 0) return
    saveHistory()
    const newNodes = clipboardRef.current.map((n) => ({
      ...n,
      id: `n${nodeIdCounter++}`,
      position: { x: n.position.x + 40, y: n.position.y + 40 },
      selected: true,
    }))
    setNodes((nds) => [
      ...nds.map((n) => ({ ...n, selected: false })),
      ...newNodes,
    ])
  }, [setNodes, saveHistory])

  const deleteSelected = useCallback(() => {
    saveHistory()
    setNodes((nds) => nds.filter((n) => !n.selected))
    setEdges((eds) => eds.filter((e) => {
      const sourceSelected = nodes.find((n) => n.id === e.source)?.selected
      const targetSelected = nodes.find((n) => n.id === e.target)?.selected
      return !sourceSelected && !targetSelected
    }))
  }, [setNodes, setEdges, nodes, saveHistory])

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return
    historyIndexRef.current--
    const prev = historyRef.current[historyIndexRef.current]
    setReactFlowNodes(prev.nodes)
    setReactFlowEdges(prev.edges)
  }, [setReactFlowNodes, setReactFlowEdges])

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return
    historyIndexRef.current++
    const next = historyRef.current[historyIndexRef.current]
    setReactFlowNodes(next.nodes)
    setReactFlowEdges(next.edges)
  }, [setReactFlowNodes, setReactFlowEdges])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return

      const isMod = e.ctrlKey || e.metaKey

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        addNode()
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        deleteSelected()
      } else if (isMod && e.key === 'a') {
        e.preventDefault()
        selectAll()
      } else if (isMod && e.key === 'c') {
        e.preventDefault()
        copySelected()
      } else if (isMod && e.key === 'v') {
        e.preventDefault()
        paste()
      } else if (isMod && e.shiftKey && e.key === 'Z') {
        e.preventDefault()
        redo()
      } else if (isMod && e.key === 'z') {
        e.preventDefault()
        undo()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [addNode, deleteSelected, selectAll, copySelected, paste, undo, redo])

  function startRename() {
    setTempName(flowName)
    setEditingName(true)
  }

  function confirmRename() {
    if (tempName.trim()) {
      setFlowName(tempName.trim())
    }
    setEditingName(false)
  }

  function cancelRename() {
    setEditingName(false)
  }

  function saveCardEditor() {
    if (!editingCardId) return
    setNodes((nds) => nds.map((n) =>
      n.id === editingCardId
        ? { ...n, data: { ...n.data, label: cardTitle, instructions: cardInstructions, members: [], agents: cardAgents } }
        : n
    ))
    setEditingCardId(null)
  }

  async function handleSave() {
    if (!flowId) {
      onSave?.()
      return
    }
    setSaving(true)
    const currentNodes = getNodes() as FlowNode[]
    const nodeData = currentNodes.map((n) => ({
      node_id: n.id,
      label: n.data.label,
      instructions: n.data.instructions,
      members: [],
      agents: n.data.agents,
      position_x: n.position.x,
      position_y: n.position.y,
    }))
    const edgeData = edges.map((e) => ({
      edge_id: e.id,
      source: e.source,
      target: e.target,
      animated: e.animated,
    }))
    await save(nodeData, edgeData)
    setSaving(false)
    onSave?.()
  }

  return (
    <div ref={containerRef} className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b bg-card/90 p-3 text-sm backdrop-blur">
        <div className="flex items-center gap-2">
          {editingName ? (
            <div className="flex items-center gap-1">
              <Input
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="h-7 w-48 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmRename()
                  if (e.key === 'Escape') cancelRename()
                }}
                autoFocus
              />
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={confirmRename} disabled={!tempName.trim()}>
                <Check className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={cancelRename}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={startRename}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <span className="font-semibold">{flowName}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Keyboard className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64">
              <DropdownMenuLabel>{t('flowBuilder.shortcuts')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {shortcutItems.map((s) => (
                <DropdownMenuItem key={s.key} className="flex items-center justify-between">
                  <span>{s.action}</span>
                  <kbd className="ml-4 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono">{s.key}</kbd>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>{t('common.cancel')}</Button>
          )}
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? t('flowBuilder.saving') : t('common.save')}
          </Button>
        </div>
      </div>
      <div className="relative min-h-0 flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#C9D3DD" />
          <Controls />
          <MiniMap
            pannable
            zoomable
            style={{ backgroundColor: '#F8FAFC', border: '1px solid #E5E7EB' }}
            maskColor="rgba(15, 23, 42, 0.08)"
            nodeColor="#2F5D5A"
          />
        </ReactFlow>

        <Dialog open={editingCardId !== null} onOpenChange={(open) => { if (!open) setEditingCardId(null) }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('flowBuilder.editCard')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('flowBuilder.title')}</label>
                <Input
                  value={cardTitle}
                  onChange={(e) => setCardTitle(e.target.value)}
                  placeholder={t('flowBuilder.cardTitlePlaceholder')}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('flowBuilder.instructions')}</label>
                <Textarea
                  value={cardInstructions}
                  onChange={(e) => setCardInstructions(e.target.value)}
                  placeholder={t('flowBuilder.instructionsPlaceholder')}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                  <label className="text-sm font-medium">{t('flowBuilder.agentsLabel')}</label>
                  <MultiSelectDropdown
                    options={agentOptions}
                    selectedValues={cardAgents}
                    onChange={setCardAgents}
                    placeholder={t('flowBuilder.selectAgents')}
                    selectedLabel={(count) => t('common.selectedCount', { count })}
                    selectAllLabel={t('common.selectAll')}
                    loading={loadingAgents}
                    loadingLabel={t('agents.loadingAgents')}
                    emptyLabel={t('flowBuilder.noAgentsAvailable')}
                    contentClassName="min-w-[var(--radix-dropdown-menu-trigger-width)]"
                  />
              </div>
              <div className="text-[10px] text-muted-foreground/60 font-mono">ID: {editingCardId}</div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setEditingCardId(null)}>{t('common.cancel')}</Button>
              <Button onClick={saveCardEditor} disabled={!cardTitle.trim()}>{t('common.save')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export function FlowBuilderPage({ flowId, flowName, onBack, onSave }: { flowId?: string | null; flowName?: string; onBack?: () => void; onSave?: () => void }) {
  return (
    <ReactFlowProvider>
      <FlowBuilderContent flowId={flowId} flowName={flowName} onBack={onBack} onSave={onSave} />
    </ReactFlowProvider>
  )
}

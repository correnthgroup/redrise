import { useCallback, useState, useEffect, useRef } from 'react'
import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Plus, Trash2, ClipboardPaste, Undo2, Redo2, MousePointer2, Crosshair } from 'lucide-react'
import { useFlowCards } from '@/hooks/use-flow-cards'
import { useI18n } from '@/hooks/use-i18n'
import { useTeamMemberOptions } from '@/hooks/use-team-member-options'
import { MultiSelectDropdown } from '../shared/multi-select-dropdown'
import { loadAgents } from '@/lib/agents'
import { loadTasksByCard } from '@/lib/tasks'
import { Label } from '@/components/ui/label'
import { RequiredLabel } from '@/components/ui/required-label'
import type { Agent } from '@/types/agent'
import type { Task } from '@/types/task'

type FlowNode = Node<{ label: string; instructions?: string; members?: string[]; agents?: string[]; approvers?: string[] }>

let nodeIdCounter = 5

function FlowCardWithEdit({ data, selected, id }: NodeProps<FlowNode>) {
  const { t } = useI18n()
  const openCardEditor = (window as unknown as Record<string, (id: string) => void>).__flowCardEdit
  const agents = data.agents ?? []
  const approvers = (data as Record<string, unknown>).approvers as string[] | undefined ?? []

  return (
    <div
      className={
        'w-[180px] rounded-lg border border-border/80 bg-card px-3 py-2 text-sm shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)] ' +
        (selected ? 'ring-2 ring-primary shadow-[0_0_0_1px_rgba(140,31,40,0.08),0_12px_28px_rgba(47,72,88,0.18)]' : '')
      }
    >
      <Handle type="target" position={Position.Left} />
      <div className="font-medium truncate">{data.label}</div>
      {agents.length > 0 && (
        <div className="text-xs text-muted-foreground truncate">{t('flowBuilder.agents', { agents: agents.join(', ') })}</div>
      )}
      {agents.length === 0 && (
        <div className="text-xs text-muted-foreground">{t('flowBuilder.undefined')}</div>
      )}
      {approvers.length > 0 && (
        <div className="text-[10px] text-muted-foreground truncate">{t('flowBuilder.approvers', { count: approvers.length })}</div>
      )}
      <div className="text-[10px] text-muted-foreground/60 font-mono mt-0.5">ID: {id}</div>
      <Button
        variant="ghost"
        size="sm"
        className="h-5 px-1.5 mt-1 text-[#A04D1F] hover:text-white hover:bg-[#A04D1F] text-[10px] font-medium"
        onClick={(e) => {
          e.stopPropagation()
          openCardEditor?.(id)
        }}
      >
        {t('common.edit')}
      </Button>
      <Handle type="source" position={Position.Right} />
    </div>
  )
}

const defaultNodes: FlowNode[] = []
const defaultEdges: Edge[] = []

function FlowBuilderContent({ flowId, onSave, onSaveRef }: { flowId?: string | null; onSave?: () => void; onSaveRef?: React.MutableRefObject<(() => Promise<void>) | null> }) {
  const { t } = useI18n()
  const { cards, edges: dbEdges, load, save } = useFlowCards(flowId ?? null)
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>(defaultNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(defaultEdges)
  const [editingCardId, setEditingCardId] = useState<string | null>(null)
  const [cardTitle, setCardTitle] = useState('')
  const [cardAgents, setCardAgents] = useState<string[]>([])
  const [cardApprovers, setCardApprovers] = useState<string[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [loadingAgents, setLoadingAgents] = useState(true)
  const { members: teamMembers, loading: loadingMembers } = useTeamMemberOptions()
  const [fabOpen, setFabOpen] = useState(false)
  const [cardTasks, setCardTasks] = useState<Task[]>([])
  const [cardTasksLoading, setCardTasksLoading] = useState(false)
  const [validationError, setValidationError] = useState<string[]>([])
  const fabRef = useRef<HTMLDivElement>(null)
  const { screenToFlowPosition, getNodes, setNodes: setReactFlowNodes, setEdges: setReactFlowEdges, fitView, setCenter } = useReactFlow()
  const containerRef = useRef<HTMLDivElement>(null)
  const loadedFlowIdRef = useRef<string | null>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (fabRef.current && e.target && !fabRef.current.contains(e.target as unknown as globalThis.Node)) {
        setFabOpen(false)
      }
    }
    if (fabOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [fabOpen])

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
    if (flowId && loadedFlowIdRef.current !== flowId) {
      loadedFlowIdRef.current = flowId
      load()
    }
  }, [flowId, load])

  // Populate React Flow when cards/edges load
  useEffect(() => {
    if (cards.length === 0 && dbEdges.length === 0 && nodes.length > 0) return

    if (cards.length > 0) {
      const flowNodes: FlowNode[] = cards.map((c) => ({
        id: c.node_id,
        type: 'flowCard',
        position: { x: c.position_x, y: c.position_y },
        data: { label: c.label, instructions: c.instructions, members: c.members, agents: c.agents, approvers: (c as Record<string, unknown>).approvers as string[] ?? [] },
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

  const openCardEditor = useCallback(async (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId)
    if (!node) return
    setEditingCardId(nodeId)
    setCardTitle(node.data.label)
    setCardAgents(node.data.agents ?? [])
    setCardApprovers((node.data as Record<string, unknown>).approvers as string[] ?? [])
    if (flowId) {
      setCardTasksLoading(true)
      const tasks = await loadTasksByCard(flowId, nodeId)
      setCardTasks(tasks)
      setCardTasksLoading(false)
    }
  }, [nodes, flowId])

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

  const centralize = useCallback(() => {
    const currentNodes = getNodes()
    if (currentNodes.length > 0) {
      fitView({ padding: 0.2 })
    } else {
      setCenter(0, 0, { zoom: 1 })
    }
  }, [getNodes, fitView, setCenter])

  const fabMenuItems = [
    { icon: Plus, label: t('flowBuilder.newCard'), kbd: 'N', action: () => { addNode(); setFabOpen(false) } },
    { icon: Trash2, label: t('flowBuilder.deleteSelected'), kbd: 'Del', action: () => { deleteSelected(); setFabOpen(false) } },
    { icon: MousePointer2, label: t('flowBuilder.selectAll'), kbd: 'Ctrl+A', action: () => { selectAll(); setFabOpen(false) } },
    { icon: ClipboardPaste, label: t('flowBuilder.paste'), kbd: 'Ctrl+V', action: () => { paste(); setFabOpen(false) } },
    { icon: Undo2, label: t('flowBuilder.undo'), kbd: 'Ctrl+Z', action: () => { undo(); setFabOpen(false) } },
    { icon: Redo2, label: t('flowBuilder.redo'), kbd: 'Ctrl+Shift+Z', action: () => { redo(); setFabOpen(false) } },
    { icon: Crosshair, label: t('flowBuilder.centralize'), kbd: '', action: () => { centralize(); setFabOpen(false) } },
  ]

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

  function saveCardEditor() {
    if (!editingCardId) return
    setNodes((nds) => nds.map((n) =>
      n.id === editingCardId
        ? { ...n, data: { ...n.data, label: cardTitle, members: [], agents: cardAgents, approvers: cardApprovers } }
        : n
    ))
    setEditingCardId(null)
  }

  const handleSave = useCallback(async () => {
    if (!flowId) {
      onSave?.()
      return
    }
    const currentNodes = getNodes() as FlowNode[]
    const missingCards: string[] = []
    for (const n of currentNodes) {
      const agents = n.data.agents ?? []
      const approvers = (n.data as Record<string, unknown>).approvers as string[] | undefined ?? []
      const missing: string[] = []
      if (!n.data.label?.trim()) missing.push(t('flowBuilder.title'))
      if (agents.length === 0) missing.push(t('flowBuilder.agentsLabel'))
      if (approvers.length === 0) missing.push(t('flowBuilder.approversLabel'))
      if (missing.length > 0) {
        missingCards.push(`${n.data.label || t('flowBuilder.unnamedCard')}: ${missing.join(', ')}`)
      }
    }
    if (missingCards.length > 0) {
      setValidationError(missingCards)
      return
    }
    const nodeData = currentNodes.map((n) => ({
      node_id: n.id,
      label: n.data.label,
      instructions: n.data.instructions,
      members: [],
      agents: n.data.agents,
      approvers: (n.data as Record<string, unknown>).approvers as string[] ?? [],
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
    onSave?.()
  }, [flowId, getNodes, edges, save, onSave, t])

  useEffect(() => {
    if (onSaveRef) onSaveRef.current = handleSave
    return () => { if (onSaveRef) onSaveRef.current = null }
  }, [handleSave, onSaveRef])

  return (
    <div ref={containerRef} className="flex h-full min-h-0 flex-col">
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
        </ReactFlow>

        {/* Floating Action Button + Menu */}
        <div ref={fabRef} className="absolute bottom-6 right-6 z-10">
          <div className="relative">
            {/* Menu items - animated */}
            <div
              className="absolute bottom-14 right-0 flex flex-col gap-2 transition-all duration-200 ease-out"
              style={{
                opacity: fabOpen ? 1 : 0,
                transform: fabOpen ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.95)',
                pointerEvents: fabOpen ? 'auto' : 'none',
              }}
            >
              {/* eslint-disable-next-line react-hooks/refs */}
              {fabMenuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="flex items-center gap-2 whitespace-nowrap rounded-lg border bg-card px-3 py-2 text-sm shadow-md transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  <kbd className="ml-2 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">{item.kbd}</kbd>
                </button>
              ))}
            </div>

            {/* FAB trigger */}
            <button
              onClick={() => setFabOpen((prev) => !prev)}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[#2F5D5A] text-white shadow-lg transition-all duration-200 hover:bg-[#2F5D5A]/90 hover:shadow-xl"
              style={{
                transform: fabOpen ? 'rotate(45deg)' : 'rotate(0deg)',
              }}
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        <Dialog open={editingCardId !== null} onOpenChange={(open) => { if (!open) setEditingCardId(null) }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('flowBuilder.editCard')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <RequiredLabel>{t('flowBuilder.title')}</RequiredLabel>
                <Input
                  value={cardTitle}
                  onChange={(e) => setCardTitle(e.target.value)}
                  placeholder={t('flowBuilder.cardTitlePlaceholder')}
                />
              </div>
              <div className="space-y-2">
                  <RequiredLabel>{t('flowBuilder.agentsLabel')}</RequiredLabel>
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
              <div className="space-y-2">
                  <RequiredLabel>{t('flowBuilder.approversLabel')}</RequiredLabel>
                  <MultiSelectDropdown
                    options={teamMembers.map((m) => ({ value: m.id, label: m.name }))}
                    selectedValues={cardApprovers}
                    onChange={setCardApprovers}
                    placeholder={t('flowBuilder.selectApprovers')}
                    selectedLabel={(count) => t('common.selectedCount', { count })}
                    selectAllLabel={t('common.selectAll')}
                    loading={loadingMembers}
                    loadingLabel={t('common.loading')}
                    emptyLabel={t('flowBuilder.noMembersAvailable')}
                    contentClassName="min-w-[var(--radix-dropdown-menu-trigger-width)]"
                  />
              </div>
              <div className="space-y-2">
                <Label>{t('flowBuilder.tasks')}</Label>
                {cardTasksLoading ? (
                  <div className="text-sm text-muted-foreground py-2">{t('common.loading')}</div>
                ) : cardTasks.length === 0 ? (
                  <div className="text-sm text-muted-foreground py-2">{t('flowBuilder.noTasksForCard')}</div>
                ) : (
                  <div className="max-h-40 overflow-y-auto rounded-md border">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-muted/50">
                        <tr>
                          <th className="px-2 py-1.5 text-left font-medium text-muted-foreground">#</th>
                          <th className="px-2 py-1.5 text-left font-medium text-muted-foreground">{t('tasks.title')}</th>
                          <th className="px-2 py-1.5 text-left font-medium text-muted-foreground">{t('common.status')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cardTasks.map((task, idx) => (
                          <tr key={task.id} className="border-t">
                            <td className="px-2 py-1.5 text-muted-foreground">{idx + 1}</td>
                            <td className="px-2 py-1.5 truncate max-w-[200px]">{task.title}</td>
                            <td className="px-2 py-1.5">
                              <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">
                                {task.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="text-[10px] text-muted-foreground/60 font-mono">ID: {editingCardId}</div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setEditingCardId(null)}>{t('common.cancel')}</Button>
              <Button onClick={saveCardEditor} disabled={!cardTitle.trim() || cardAgents.length === 0 || cardApprovers.length === 0}>{t('common.save')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={validationError.length > 0} onOpenChange={(open) => { if (!open) setValidationError([]) }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t('flowBuilder.missingRequiredFields')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{t('flowBuilder.missingRequiredFieldsDescription')}</p>
              <ul className="list-disc pl-4 space-y-1">
                {validationError.map((msg) => (
                  <li key={msg} className="text-sm">{msg}</li>
                ))}
              </ul>
            </div>
            <DialogFooter>
              <Button onClick={() => setValidationError([])}>{t('common.ok')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export function FlowBuilderPage({ flowId, onSave, onSaveRef }: { flowId?: string | null; onSave?: () => void; onSaveRef?: React.MutableRefObject<(() => Promise<void>) | null> }) {
  return (
    <ReactFlowProvider>
      <FlowBuilderContent flowId={flowId} onSave={onSave} onSaveRef={onSaveRef} />
    </ReactFlowProvider>
  )
}

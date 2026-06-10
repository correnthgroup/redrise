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
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu'
import { Pencil, Check, X, Keyboard, CheckCircle2, ChevronDown } from 'lucide-react'

type FlowNode = Node<{ label: string; instructions?: string; members?: string[]; agents?: string[] }>

const SHORTCUTS = [
  { key: 'N', action: 'New card' },
  { key: 'Del', action: 'Delete selected' },
  { key: 'Ctrl/⌘ + A', action: 'Select all' },
  { key: 'Ctrl/⌘ + C', action: 'Copy selected' },
  { key: 'Ctrl/⌘ + V', action: 'Paste' },
  { key: 'Ctrl/⌘ + Z', action: 'Undo' },
  { key: 'Ctrl/⌘ + Shift + Z', action: 'Redo' },
  { key: 'Mouse scroll', action: 'Zoom in/out' },
]

const PLACEHOLDER_MEMBERS = ['Alice Silva', 'Bob Santos', 'Carol Oliveira', 'David Costa', 'Eva Lima']
const PLACEHOLDER_AGENTS = ['Agent 1', 'Agent 2', 'Agent 3', 'Agent 4', 'Agent 5']

let nodeIdCounter = 5

function FlowCardWithEdit({ data, selected, id }: NodeProps<FlowNode>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openCardEditor = (window as unknown as Record<string, (id: string) => void>).__flowCardEdit
  const members = data.members ?? []
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
          className="h-5 w-5 shrink-0 text-[#8c1f28] hover:text-[#8c1f28]/80"
          onClick={(e) => {
            e.stopPropagation()
            openCardEditor?.(id)
          }}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
        </Button>
      </div>
      {members.length > 0 && (
        <div className="text-xs text-muted-foreground truncate">Members: {members.join(', ')}</div>
      )}
      {agents.length > 0 && (
        <div className="text-xs text-muted-foreground truncate">Agents: {agents.join(', ')}</div>
      )}
      {members.length === 0 && agents.length === 0 && (
        <div className="text-xs text-muted-foreground">Undefined</div>
      )}
      <div className="text-[10px] text-muted-foreground/60 font-mono mt-0.5">ID: {id}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  )
}

const initialNodes: FlowNode[] = [
  { id: 'n1', type: 'flowCard', position: { x: 0, y: 0 }, data: { label: 'Step 1: trigger', members: ['Alice Silva'], agents: ['Agent 1'] } },
  { id: 'n2', type: 'flowCard', position: { x: 220, y: 0 }, data: { label: 'Step 2: enrich', members: ['Bob Santos'], agents: ['Agent 2'] } },
  { id: 'n3', type: 'flowCard', position: { x: 440, y: 0 }, data: { label: 'Step 3: decide', members: [], agents: [] } },
  { id: 'n4', type: 'flowCard', position: { x: 660, y: 0 }, data: { label: 'Step 4: deliver', members: [], agents: [] } },
]

const initialEdges: Edge[] = [
  { id: 'e1-2', source: 'n1', target: 'n2', animated: true },
  { id: 'e2-3', source: 'n2', target: 'n3', animated: true },
  { id: 'e3-4', source: 'n3', target: 'n4', animated: true },
]

function FlowBuilderContent({ onBack, onSave }: { onBack?: () => void; onSave?: () => void }) {
  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNode>(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges)
  const [flowName, setFlowName] = useState('New Flow')
  const [editingName, setEditingName] = useState(false)
  const [tempName, setTempName] = useState('')
  const [editingCardId, setEditingCardId] = useState<string | null>(null)
  const [cardTitle, setCardTitle] = useState('')
  const [cardInstructions, setCardInstructions] = useState('')
  const [cardMembers, setCardMembers] = useState<string[]>([])
  const [cardAgents, setCardAgents] = useState<string[]>([])
  const { screenToFlowPosition, getNodes, setNodes: setReactFlowNodes, setEdges: setReactFlowEdges } = useReactFlow()
  const containerRef = useRef<HTMLDivElement>(null)

  const nodeTypes = { flowCard: FlowCardWithEdit }

  function openCardEditor(nodeId: string) {
    const node = nodes.find((n) => n.id === nodeId)
    if (!node) return
    setEditingCardId(nodeId)
    setCardTitle(node.data.label)
    setCardInstructions(node.data.instructions ?? '')
    setCardMembers(node.data.members ?? [])
    setCardAgents(node.data.agents ?? [])
  }

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      const current = { nodes: initialNodes, edges: initialEdges }
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
      data: { label: `Step ${nodes.length + 1}: new step` },
    }
    setNodes((nds) => [...nds, newNode])
  }, [nodes.length, screenToFlowPosition, setNodes, saveHistory])

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
        ? { ...n, data: { ...n.data, label: cardTitle, instructions: cardInstructions, members: cardMembers, agents: cardAgents } }
        : n
    ))
    setEditingCardId(null)
  }

  function toggleMember(member: string) {
    setCardMembers((prev) => prev.includes(member) ? prev.filter((m) => m !== member) : [...prev, member])
  }

  function toggleAgent(agent: string) {
    setCardAgents((prev) => prev.includes(agent) ? prev.filter((a) => a !== agent) : [...prev, agent])
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
              <DropdownMenuLabel>Keyboard Shortcuts</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {SHORTCUTS.map((s) => (
                <DropdownMenuItem key={s.key} className="flex items-center justify-between">
                  <span>{s.action}</span>
                  <kbd className="ml-4 rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono">{s.key}</kbd>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>Cancel</Button>
          )}
          <Button size="sm" onClick={onSave}>Save</Button>
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
            nodeColor="#2F4858"
          />
        </ReactFlow>

        <Dialog open={editingCardId !== null} onOpenChange={(open) => { if (!open) setEditingCardId(null) }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Card</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={cardTitle}
                  onChange={(e) => setCardTitle(e.target.value)}
                  placeholder="Card title"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Instructions</label>
                <Textarea
                  value={cardInstructions}
                  onChange={(e) => setCardInstructions(e.target.value)}
                  placeholder="What should this card do?"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Members</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {cardMembers.length > 0 ? `${cardMembers.length} selected` : 'Select members'}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full">
                      {PLACEHOLDER_MEMBERS.map((member) => (
                        <DropdownMenuCheckboxItem
                          key={member}
                          checked={cardMembers.includes(member)}
                          onCheckedChange={() => toggleMember(member)}
                        >
                          {member}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Agents</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between">
                        {cardAgents.length > 0 ? `${cardAgents.length} selected` : 'Select agents'}
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full">
                      {PLACEHOLDER_AGENTS.map((agent) => (
                        <DropdownMenuCheckboxItem
                          key={agent}
                          checked={cardAgents.includes(agent)}
                          onCheckedChange={() => toggleAgent(agent)}
                        >
                          {agent}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="text-[10px] text-muted-foreground/60 font-mono">ID: {editingCardId}</div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setEditingCardId(null)}>Cancel</Button>
              <Button onClick={saveCardEditor} disabled={!cardTitle.trim()}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export function FlowBuilderPage({ onBack, onSave }: { onBack?: () => void; onSave?: () => void }) {
  return (
    <ReactFlowProvider>
      <FlowBuilderContent onBack={onBack} onSave={onSave} />
    </ReactFlowProvider>
  )
}

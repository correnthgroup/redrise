import { useCallback } from 'react'
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
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Button } from '@/components/ui/button'

type FlowNode = Node<{ label: string }>

function FlowCard({ data, selected }: NodeProps<FlowNode>) {
  return (
    <div
      className={
        'w-[180px] rounded-lg border border-border/80 bg-card px-3 py-2 text-sm shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)] ' +
        (selected ? 'ring-2 ring-primary shadow-[0_0_0_1px_rgba(140,31,40,0.08),0_12px_28px_rgba(47,72,88,0.18)]' : '')
      }
    >
      <Handle type="target" position={Position.Left} />
      <div className="font-medium">{data.label}</div>
      <div className="text-xs text-muted-foreground">operational step</div>
      <Handle type="source" position={Position.Right} />
    </div>
  )
}

const nodeTypes = { flowCard: FlowCard }

const initialNodes: FlowNode[] = [
  { id: 'n1', type: 'flowCard', position: { x: 0, y: 0 }, data: { label: 'Step 1: trigger' } },
  { id: 'n2', type: 'flowCard', position: { x: 220, y: 0 }, data: { label: 'Step 2: enrich' } },
  { id: 'n3', type: 'flowCard', position: { x: 440, y: 0 }, data: { label: 'Step 3: decide' } },
  { id: 'n4', type: 'flowCard', position: { x: 660, y: 0 }, data: { label: 'Step 4: deliver' } },
]

const initialEdges: Edge[] = [
  { id: 'e1-2', source: 'n1', target: 'n2' },
  { id: 'e2-3', source: 'n2', target: 'n3' },
  { id: 'e3-4', source: 'n3', target: 'n4' },
]

export function FlowBuilderPage({ onBack }: { onBack?: () => void }) {
  const [nodes, , onNodesChange] = useNodesState<FlowNode>(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges)

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge({ ...connection }, eds)),
    [setEdges],
  )

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between border-b bg-card/90 p-3 text-sm backdrop-blur">
        <div className="flex items-center gap-2">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>Back</Button>
          )}
          <span className="font-semibold">Flow Editor</span>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">Validate</Button>
          <Button size="sm">Save</Button>
        </div>
      </div>
      <div className="min-h-0 flex-1">
        <ReactFlowProvider>
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
        </ReactFlowProvider>
      </div>
    </div>
  )
}

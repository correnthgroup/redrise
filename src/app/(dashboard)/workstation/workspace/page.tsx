"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Item, ItemContent, ItemDescription, ItemGroup, ItemHeader, ItemTitle } from "@/components/ui/item"
import { LayoutGrid, PlusIcon, TrashIcon, FileTextIcon, PencilIcon } from "lucide-react"
import { toast } from "sonner"
import { logAuditEvent } from "@/lib/audit-logs"

const teamMembers = [
  { label: "Eddie Lake", value: "eddie-lake" },
  { label: "Jamik Tashpulatov", value: "jamik-tashpulatov" },
  { label: "Emily Whalen", value: "emily-whalen" },
  { label: "Henry Okeafor", value: "henry-okeafor" },
  { label: "Liz Lewis", value: "liz-lewis" },
  { label: "Jim Reynold", value: "jim-reynold" },
]

export interface Workspace {
  id: string
  name: string
  description: string
  owner: string[]
  board: string[]
  staff: string[]
  member: string[]
  viewer: string[]
  flows: number
  actions: number
  mission?: string
  enabled?: boolean
  imageUrl?: string
}

function DeleteWorkspaceDialog({
  workspace,
  onDelete,
  triggerId,
}: {
  workspace: Workspace
  onDelete: (id: string) => void
  triggerId?: string
}) {
  const [open, setOpen] = React.useState(false)
  const [confirmText, setConfirmText] = React.useState("")
  const [deleting, setDeleting] = React.useState(false)
  const canDelete = confirmText === "Delete"

  const handleDelete = () => {
    if (!canDelete) return
    setDeleting(true)
    setTimeout(() => {
      onDelete(workspace.id)
      logAuditEvent({ action: "delete", entityType: "workspace", entityId: workspace.id, entityName: workspace.name })
      setOpen(false)
      setConfirmText("")
      setDeleting(false)
      toast.success("Space deleted")
    }, 500)
  }

  return (
    <>
      {triggerId && (
        <button id={triggerId} className="hidden" onClick={() => setOpen(true)} />
      )}
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); setConfirmText("") }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Space</DialogTitle>
            <DialogDescription>
              Type <strong>Delete</strong> to confirm deletion of &quot;{workspace.name}&quot;.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirm-delete">Confirmation</Label>
            <Input
              id="confirm-delete"
              placeholder='Type "Delete" to confirm'
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="destructive" disabled={!canDelete || deleting} onClick={handleDelete}>
              {deleting && <Spinner className="mr-1" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function WorkspaceCard({ workspace, onDelete }: { workspace: Workspace; onDelete: (id: string) => void }) {
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [menuPos, setMenuPos] = React.useState({ x: 0, y: 0 })
  const cardRef = React.useRef<HTMLDivElement>(null)

  const handleClick = (e: React.MouseEvent) => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (rect) {
      setMenuPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    }
    setMenuOpen(true)
  }

  return (
    <div ref={cardRef} className="relative" onClick={handleClick}>
      <Item className="cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all">
        <ItemHeader className="aspect-[3/2] bg-[#F2F2F2] flex items-center justify-center overflow-hidden">
          {workspace.imageUrl ? (
            <img src={workspace.imageUrl} alt={workspace.name} className="w-full h-full object-cover" />
          ) : (
            <LayoutGrid className="h-8 w-8 text-muted-foreground/50" />
          )}
        </ItemHeader>
        <ItemContent>
          <ItemTitle>{workspace.name}</ItemTitle>
          <ItemDescription>{workspace.description}</ItemDescription>
        </ItemContent>
      </Item>
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setMenuOpen(false) }} />
          <div
            className="absolute z-50 min-w-[10rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
            style={{ left: menuPos.x, top: menuPos.y }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground" onClick={() => { setMenuOpen(false); window.location.href = `/workstation/workspace/${workspace.id}/resume` }}>
              <FileTextIcon className="size-4 mr-2" />
              Resume
            </button>
            <button className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground" onClick={() => { setMenuOpen(false); window.location.href = `/workstation/workspace/${workspace.id}/edit` }}>
              <PencilIcon className="size-4 mr-2" />
              Edit
            </button>
            <div className="-mx-1 my-1 h-px bg-muted" />
            <button className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground text-destructive" onClick={() => { setMenuOpen(false); document.getElementById(`delete-ws-${workspace.id}`)?.click() }}>
              <TrashIcon className="size-4 mr-2" />
              Delete
            </button>
          </div>
        </>
      )}
      <DeleteWorkspaceDialog workspace={workspace} onDelete={onDelete} triggerId={`delete-ws-${workspace.id}`} />
    </div>
  )
}

function ViewWorkspaces({ workspaces, onDelete }: { workspaces: Workspace[]; onDelete: (id: string) => void }) {
  if (workspaces.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-sm">No spaces yet. Click &quot;New Space&quot; to create one.</p>
      </div>
    )
  }

  return (
    <ItemGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {workspaces.map((ws) => (
        <WorkspaceCard key={ws.id} workspace={ws} onDelete={onDelete} />
      ))}
    </ItemGroup>
  )
}

export default function WorkspacePage() {
  const router = useRouter()
  const [workspaces, setWorkspaces] = React.useState<Workspace[]>([])
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    const stored = localStorage.getItem("workspaces")
    if (stored) setWorkspaces(JSON.parse(stored))
    setMounted(true)
  }, [])

  const handleDelete = (id: string) => {
    const updated = workspaces.filter((ws) => ws.id !== id)
    localStorage.setItem("workspaces", JSON.stringify(updated))
    setWorkspaces(updated)
  }

  if (!mounted) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div />
          <Button disabled>
            <PlusIcon className="size-4 mr-1" />
            New Space
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div />
        <Tooltip>
          <TooltipTrigger render={
            <Button onClick={() => router.push("/workstation/workspace/new")}>
              <PlusIcon className="size-4 mr-1" />
              New Space
            </Button>
          } />
          <TooltipContent>
            <p>Create a new workspace</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <ViewWorkspaces workspaces={workspaces} onDelete={handleDelete} />
    </div>
  )
}

"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
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

export interface Project {
  id: string
  name: string
  description: string
  imageUrl?: string
}

function DeleteProjectDialog({
  project,
  onDelete,
  triggerId,
}: {
  project: Project
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
      onDelete(project.id)
      logAuditEvent({ action: "delete", entityType: "workspace", entityId: project.id, entityName: project.name })
      setOpen(false)
      setConfirmText("")
      setDeleting(false)
      toast.success("Project deleted")
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
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Type <strong>Delete</strong> to confirm deletion of &quot;{project.name}&quot;.
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

function ProjectCard({ project, onDelete }: { project: Project; onDelete: (id: string) => void }) {
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
          {project.imageUrl ? (
            <img src={project.imageUrl} alt={project.name} className="w-full h-full object-cover" />
          ) : (
            <LayoutGrid className="h-8 w-8 text-muted-foreground/50" />
          )}
        </ItemHeader>
        <ItemContent>
          <ItemTitle>{project.name}</ItemTitle>
          <ItemDescription>{project.description}</ItemDescription>
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
            <button className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground" onClick={() => { setMenuOpen(false); window.location.href = `/projects/${project.id}/resume` }}>
              <FileTextIcon className="size-4 mr-2" />
              Resume
            </button>
            <button className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground" onClick={() => { setMenuOpen(false); window.location.href = `/projects/${project.id}/edit` }}>
              <PencilIcon className="size-4 mr-2" />
              Edit
            </button>
            <div className="-mx-1 my-1 h-px bg-muted" />
            <button className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground text-destructive" onClick={() => { setMenuOpen(false); document.getElementById(`delete-pj-${project.id}`)?.click() }}>
              <TrashIcon className="size-4 mr-2" />
              Delete
            </button>
          </div>
        </>
      )}
      <DeleteProjectDialog project={project} onDelete={onDelete} triggerId={`delete-pj-${project.id}`} />
    </div>
  )
}

function ViewProjects({ projects, onDelete }: { projects: Project[]; onDelete: (id: string) => void }) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-sm">No projects yet. Click &quot;New Project&quot; to create one.</p>
      </div>
    )
  }

  return (
    <ItemGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((pj) => (
        <ProjectCard key={pj.id} project={pj} onDelete={onDelete} />
      ))}
    </ItemGroup>
  )
}

const staticProjects: Project[] = [
  {
    id: "design-engineering",
    name: "Design Engineering",
    description: "Design engineering project for UI components and inventory.",
    imageUrl: "",
  },
]

export default function ProjectsPage() {
  const [projects, setProjects] = React.useState<Project[]>([])
  const [mounted, setMounted] = React.useState(false)
  const [dialogOpen, setDialogOpen] = React.useState(false)

  React.useEffect(() => {
    const stored = localStorage.getItem("projects")
    const storedProjects: Project[] = stored ? JSON.parse(stored) : []
    const staticNames = staticProjects.map((p) => p.name)
    const uniqueStored = storedProjects.filter((p) => !staticNames.includes(p.name))
    setProjects([...staticProjects, ...uniqueStored])
    setMounted(true)
  }, [])

  const handleDelete = (id: string) => {
    const updated = projects.filter((pj) => pj.id !== id)
    const staticNames = staticProjects.map((p) => p.name)
    const toStore = updated.filter((p) => !staticNames.includes(p.name))
    localStorage.setItem("projects", JSON.stringify(toStore))
    setProjects(updated)
  }

  if (!mounted) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div />
          <Button disabled>
            <PlusIcon className="size-4 mr-1" />
            New Project
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
            <Button onClick={() => setDialogOpen(true)}>
              <PlusIcon className="size-4 mr-1" />
              New Project
            </Button>
          } />
          <TooltipContent>
            <p>Create a new project</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <ViewProjects projects={projects} onDelete={handleDelete} />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Project</DialogTitle>
            <DialogDescription>
              Organize a new project and contact us to help you get it done.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setDialogOpen(false)}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

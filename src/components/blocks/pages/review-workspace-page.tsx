import { useState } from 'react'
import type { Workspace } from '@/types/workspace'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Trash2 } from 'lucide-react'

export function ReviewWorkspacePage({
  onBack,
  onDelete,
  workspace,
}: {
  onBack?: () => void
  onDelete?: () => void
  workspace?: Workspace
}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (deleteConfirm !== 'DELETE' || !workspace?.id) return
    setIsDeleting(true)
    onDelete?.()
    setIsDeleting(false)
  }

  return (
    <div className="mx-auto h-full max-w-3xl overflow-y-auto p-6 animate-app-rise">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Review Workspace</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="h-4 w-4" />
          </Button>
          {onBack && <Button variant="ghost" size="sm" onClick={onBack}>Cancel</Button>}
        </div>
      </header>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><CardTitle className="text-sm font-semibold">Identity</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="font-mono text-xs text-muted-foreground">ID: {workspace?.id ?? 'N/A'}</div>
            <div><strong>Name:</strong> {workspace?.name ?? 'placeholder name'}</div>
            <div><strong>Status:</strong> {workspace?.status ?? 'pending'}</div>
            <div><strong>Created:</strong> {workspace?.created_at ? new Date(workspace.created_at).toLocaleDateString() : 'just now'}</div>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><CardTitle className="text-sm font-semibold">Mission</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">{workspace?.mission ?? 'placeholder mission'}</CardContent>
        </Card>
        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><CardTitle className="text-sm font-semibold">Health</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">placeholder health metrics for {workspace?.name ?? 'workspace'}</CardContent>
        </Card>
        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><CardTitle className="text-sm font-semibold">Flows</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">{workspace?.flows ?? 0} configured flows</CardContent>
        </Card>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Workspace</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Type <strong>DELETE</strong> to confirm.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={deleteConfirm}
            onChange={(e) => setDeleteConfirm(e.target.value)}
            placeholder="Type DELETE to confirm"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={deleteConfirm !== 'DELETE' || isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? 'Deleting...' : 'OK'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

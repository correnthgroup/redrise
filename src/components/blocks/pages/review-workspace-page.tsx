import { useState } from 'react'
import type { Workspace } from '@/types/workspace'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Trash2 } from 'lucide-react'

function statusBadgeClass(status: string) {
  switch (status) {
    case 'healthy':
      return 'border-emerald-500/20 bg-emerald-50 text-emerald-700'
    case 'maintenance':
      return 'border-amber-500/20 bg-amber-50 text-amber-700'
    default:
      return 'border-primary/20 bg-primary/8 text-primary'
  }
}

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
    await onDelete?.()
    setIsDeleting(false)
    setShowDeleteDialog(false)
    setDeleteConfirm('')
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
            <div><strong>Name:</strong> {workspace?.name ?? 'N/A'}</div>
            <div className="flex items-center gap-2">
              <strong>Status:</strong>
              <Badge variant="outline" className={`text-[10px] uppercase ${statusBadgeClass(workspace?.status ?? 'pending')}`}>
                {workspace?.status ?? 'pending'}
              </Badge>
            </div>
            <div><strong>Created:</strong> {workspace?.created_at ? new Date(workspace.created_at).toLocaleDateString() : 'N/A'}</div>
            {workspace?.updated_at && workspace.updated_at !== workspace.created_at && (
              <div><strong>Updated:</strong> {new Date(workspace.updated_at).toLocaleDateString()}</div>
            )}
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><CardTitle className="text-sm font-semibold">Mission</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">{workspace?.mission || 'No mission defined'}</CardContent>
        </Card>
        <Card className="border-border/80 shadow-[0_1px_2px_rgba(16,24,40,0.04),0_10px_24px_rgba(16,24,40,0.06)]">
          <CardHeader><CardTitle className="text-sm font-semibold">Health</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Status</span>
              <Badge variant="outline" className={`text-[10px] uppercase ${statusBadgeClass(workspace?.status ?? 'pending')}`}>
                {workspace?.status ?? 'pending'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Flows</span>
              <span className="font-medium">{workspace?.flows ?? 0}</span>
            </div>
          </CardContent>
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
            <Button variant="ghost" onClick={() => { setShowDeleteDialog(false); setDeleteConfirm('') }}>Cancel</Button>
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

"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
  ContextMenuLabel,
} from "@/components/ui/context-menu"
import { Item, ItemContent, ItemDescription, ItemHeader, ItemTitle } from "@/components/ui/item"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { LayoutGrid, ArrowLeftIcon, SaveIcon, PlusIcon, TrashIcon, MoreVerticalIcon, UploadIcon, ImageIcon } from "lucide-react"
import { toast } from "sonner"
import { logAuditEvent } from "@/lib/audit-logs"
import type { Workspace } from "../../page"

const teamMembers = [
  { label: "Eddie Lake", value: "eddie-lake" },
  { label: "Jamik Tashpulatov", value: "jamik-tashpulatov" },
  { label: "Emily Whalen", value: "emily-whalen" },
  { label: "Henry Okeafor", value: "henry-okeafor" },
  { label: "Liz Lewis", value: "liz-lewis" },
  { label: "Jim Reynold", value: "jim-reynold" },
]

const roles = ["Owner", "Board", "Staff", "Member", "Viewer"] as const

interface TeamEntry {
  id: string
  memberId: string
  role: (typeof roles)[number]
}

export default function EditWorkspacePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [mission, setMission] = React.useState("")
  const [team, setTeam] = React.useState<TeamEntry[]>([])
  const [flowsEnabled, setFlowsEnabled] = React.useState(true)
  const [actionsEnabled, setActionsEnabled] = React.useState(true)
  const [selectedMember, setSelectedMember] = React.useState<string>("")
  const [selectedRole, setSelectedRole] = React.useState<(typeof roles)[number]>("Member")
  const [imageUrl, setImageUrl] = React.useState<string>("")
  const [saving, setSaving] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const stored = localStorage.getItem("workspaces")
    if (stored) {
      const workspaces: Workspace[] = JSON.parse(stored)
      const ws = workspaces.find((w) => w.id === id)
      if (ws) {
        setName(ws.name)
        setDescription(ws.description)
        setMission(ws.mission || "")
        setFlowsEnabled(ws.flows > 0)
        setActionsEnabled(ws.actions > 0)
        setImageUrl(ws.imageUrl || "")
        const entries: TeamEntry[] = []
        ws.owner.forEach((v) => entries.push({ id: `o-${v}`, memberId: v, role: "Owner" }))
        ws.board.forEach((v) => entries.push({ id: `b-${v}`, memberId: v, role: "Board" }))
        ws.staff.forEach((v) => entries.push({ id: `s-${v}`, memberId: v, role: "Staff" }))
        ws.member.forEach((v) => entries.push({ id: `m-${v}`, memberId: v, role: "Member" }))
        ws.viewer.forEach((v) => entries.push({ id: `v-${v}`, memberId: v, role: "Viewer" }))
        setTeam(entries)
      }
    }
    setMounted(true)
  }, [id])

  const addTeamMember = () => {
    if (!selectedMember) return
    const exists = team.find((t) => t.memberId === selectedMember && t.role === selectedRole)
    if (exists) return
    setTeam([...team, { id: Date.now().toString(), memberId: selectedMember, role: selectedRole }])
    setSelectedMember("")
  }

  const removeTeamMember = (entryId: string) => {
    setTeam(team.filter((t) => t.id !== entryId))
  }

  const handleSave = () => {
    if (!name.trim()) return
    setSaving(true)
    setTimeout(() => {
      const stored = localStorage.getItem("workspaces")
      const workspaces: Workspace[] = stored ? JSON.parse(stored) : []
      const updated = workspaces.map((ws) => {
        if (ws.id !== id) return ws
        return {
          ...ws,
          name,
          description,
          mission,
          owner: team.filter((t) => t.role === "Owner").map((t) => t.memberId),
          board: team.filter((t) => t.role === "Board").map((t) => t.memberId),
          staff: team.filter((t) => t.role === "Staff").map((t) => t.memberId),
          member: team.filter((t) => t.role === "Member").map((t) => t.memberId),
          viewer: team.filter((t) => t.role === "Viewer").map((t) => t.memberId),
          flows: flowsEnabled ? 1 : 0,
          actions: actionsEnabled ? 1 : 0,
          imageUrl,
        }
      })
      localStorage.setItem("workspaces", JSON.stringify(updated))
      logAuditEvent({ action: "update", entityType: "workspace", entityId: id, entityName: name })
      setSaving(false)
      toast.success("Space updated")
      router.push("/workstation/workspace")
    }, 500)
  }

  const getLabel = (value: string) =>
    teamMembers.find((m) => m.value === value)?.label ?? value

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner className="size-6" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Tooltip>
          <TooltipTrigger render={
            <Button variant="ghost" size="icon" onClick={() => router.push("/workstation/workspace")}>
              <ArrowLeftIcon className="size-4" />
            </Button>
          } />
          <TooltipContent><p>Go back</p></TooltipContent>
        </Tooltip>
        <div>
          <h1 className="text-lg font-semibold">Edit Space</h1>
          <p className="text-sm text-muted-foreground">Update workspace settings.</p>
        </div>
        <Tooltip>
          <TooltipTrigger render={
            <Button onClick={handleSave} disabled={saving} className="ml-auto">
              {saving && <Spinner className="mr-1" />}
              <SaveIcon className="size-4 mr-1" />
              Save
            </Button>
          } />
          <TooltipContent><p>Save changes</p></TooltipContent>
        </Tooltip>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Space name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the workspace..."
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Cover Image</Label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-32 h-24 rounded-lg border border-dashed bg-[#F2F2F2] flex items-center justify-center overflow-hidden">
                      {imageUrl ? (
                        <img src={imageUrl} alt="Cover" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            const url = URL.createObjectURL(file)
                            setImageUrl(url)
                          }
                        }}
                      />
                      <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                        <UploadIcon className="h-4 w-4 mr-1" />
                        Upload
                      </Button>
                      <Input
                        placeholder="Or paste image URL"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mission / Playbook</CardTitle>
              <CardDescription>Write the mission or playbook for this workspace.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <Label htmlFor="mission">Message</Label>
                <div className="relative">
                  <Textarea
                    id="mission"
                    placeholder="Write your mission, playbook, or objectives here..."
                    rows={8}
                    value={mission}
                    onChange={(e) => setMission(e.target.value)}
                    className="resize-none"
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                    {mission.length} chars
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Team</CardTitle>
              <CardDescription>Add team members and assign roles.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <Label>Member</Label>
                    <Select value={selectedMember} onValueChange={(v) => setSelectedMember(v ?? "")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select member" />
                      </SelectTrigger>
                      <SelectContent>
                        {teamMembers.map((m) => (
                          <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-32">
                    <Label>Role</Label>
                    <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as typeof roles[number])}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((r) => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={addTeamMember} disabled={!selectedMember}>
                    <PlusIcon className="size-4 mr-1" />
                    Add
                  </Button>
                </div>

                {team.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="w-[60px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {team.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>{getLabel(entry.memberId)}</TableCell>
                          <TableCell>
                            <Badge variant={entry.role === "Owner" ? "default" : "secondary"}>
                              {entry.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="size-7" onClick={() => removeTeamMember(entry.id)}>
                              <TrashIcon className="size-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No team members added yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <Label>Flows</Label>
                    <p className="text-xs text-muted-foreground">Enable workflow flows</p>
                  </div>
                  <Switch checked={flowsEnabled} onCheckedChange={setFlowsEnabled} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <Label>Actions</Label>
                    <p className="text-xs text-muted-foreground">Enable automated actions</p>
                  </div>
                  <Switch checked={actionsEnabled} onCheckedChange={setActionsEnabled} />
                </div>
              </div>
            </CardContent>
          </Card>

          <ContextMenu>
            <ContextMenuTrigger>
              <Card className="cursor-pointer hover:ring-2 hover:ring-primary/20">
                <CardHeader>
                  <CardTitle className="text-base">Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <Item>
                    <ItemHeader className="aspect-[3/2] bg-[#F2F2F2] flex items-center justify-center overflow-hidden">
                      {imageUrl ? (
                        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <LayoutGrid className="h-8 w-8 text-muted-foreground/50" />
                      )}
                    </ItemHeader>
                    <ItemContent>
                      <ItemTitle>{name || "Space Name"}</ItemTitle>
                      <ItemDescription>{description || "Space description"}</ItemDescription>
                    </ItemContent>
                  </Item>
                </CardContent>
              </Card>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuLabel>Actions</ContextMenuLabel>
              <ContextMenuItem onClick={handleSave}>Save Changes</ContextMenuItem>
              <ContextMenuItem onClick={() => router.push("/workstation/workspace")}>Cancel</ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={() => { setName(""); setDescription(""); setMission(""); setTeam([]) }}>
                Clear All
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="outline" className="w-full justify-between">
                  Options
                  <MoreVerticalIcon className="size-4" />
                </Button>}>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuGroup>
                    <DropdownMenuLabel>Space</DropdownMenuLabel>
                  </DropdownMenuGroup>
                  <DropdownMenuItem onClick={handleSave}>
                    <SaveIcon className="size-4 mr-2" />
                    Save
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { setName(""); setDescription(""); setMission(""); setTeam([]) }}>
                    <RotateCcwIcon className="size-4 mr-2" />
                    Reset Form
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/workstation/workspace")}>
                    <XIcon className="size-4 mr-2" />
                    Cancel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function RotateCcwIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  )
}

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  )
}

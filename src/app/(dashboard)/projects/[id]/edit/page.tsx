"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
  ContextMenuLabel,
} from "@/components/ui/context-menu"
import { Item, ItemContent, ItemDescription, ItemHeader, ItemTitle } from "@/components/ui/item"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LayoutGrid, ArrowLeftIcon, SaveIcon, UploadIcon, ImageIcon } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { logAuditEvent } from "@/lib/audit-logs"
import type { Project } from "../../page"

export default function EditProjectPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [imageUrl, setImageUrl] = React.useState<string>("")
  const [saving, setSaving] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const stored = localStorage.getItem("projects")
    if (stored) {
      const projects: Project[] = JSON.parse(stored)
      const project = projects.find((p) => p.id === id)
      if (project) {
        setName(project.name)
        setDescription(project.description)
        setImageUrl(project.imageUrl || "")
      }
    }
    setMounted(true)
  }, [id])

  const handleSave = () => {
    if (!name.trim()) return
    setSaving(true)
    const stored = localStorage.getItem("projects")
    const projects: Project[] = stored ? JSON.parse(stored) : []
    const index = projects.findIndex((p) => p.id === id)
    if (index !== -1) {
      projects[index] = { ...projects[index], name, description, imageUrl }
      localStorage.setItem("projects", JSON.stringify(projects))
      logAuditEvent({ action: "update", entityType: "workspace", entityId: id, entityName: name })
    }
    setTimeout(() => {
      setSaving(false)
      toast.success("Project updated")
      router.push("/projects")
    }, 500)
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/projects")}>
          <ArrowLeftIcon className="size-4" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold">Edit Project</h1>
          <p className="text-sm text-muted-foreground">Update project details.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="ml-auto">
          {saving && <Spinner className="mr-1" />}
          <SaveIcon className="size-4 mr-1" />
          Save
        </Button>
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
                    placeholder="Project name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the project..."
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
        </div>

        <div className="flex flex-col gap-6">
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
                      <ItemTitle>{name || "Project Name"}</ItemTitle>
                      <ItemDescription>{description || "Project description"}</ItemDescription>
                    </ItemContent>
                  </Item>
                </CardContent>
              </Card>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuLabel>Actions</ContextMenuLabel>
              <ContextMenuItem onClick={handleSave}>Save Project</ContextMenuItem>
              <ContextMenuItem onClick={() => router.push("/projects")}>Cancel</ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={() => { setName(""); setDescription(""); setImageUrl("") }}>
                Clear All
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </div>
      </div>
    </div>
  )
}

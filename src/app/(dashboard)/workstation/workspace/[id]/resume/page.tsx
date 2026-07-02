"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeftIcon, PrinterIcon, LayoutGrid } from "lucide-react"
import { Item, ItemContent, ItemDescription, ItemHeader, ItemTitle } from "@/components/ui/item"
import type { Workspace } from "../../page"

const teamMembers = [
  { label: "Eddie Lake", value: "eddie-lake" },
  { label: "Jamik Tashpulatov", value: "jamik-tashpulatov" },
  { label: "Emily Whalen", value: "emily-whalen" },
  { label: "Henry Okeafor", value: "henry-okeafor" },
  { label: "Liz Lewis", value: "liz-lewis" },
  { label: "Jim Reynold", value: "jim-reynold" },
]

export default function ResumePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [workspace, setWorkspace] = React.useState<Workspace | null>(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    const stored = localStorage.getItem("workspaces")
    if (stored) {
      const workspaces: Workspace[] = JSON.parse(stored)
      setWorkspace(workspaces.find((w) => w.id === id) || null)
    }
    setMounted(true)
  }, [id])

  const getLabel = (value: string) =>
    teamMembers.find((m) => m.value === value)?.label ?? value

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner className="size-6" />
      </div>
    )
  }

  if (!workspace) {
    return (
      <div className="flex flex-col gap-4">
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
            <h1 className="text-lg font-semibold">Space not found</h1>
            <p className="text-sm text-muted-foreground">The workspace you are looking for does not exist.</p>
          </div>
        </div>
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
        <div className="flex-1">
          <h1 className="text-lg font-semibold">Resume</h1>
          <p className="text-sm text-muted-foreground">Space report for &quot;{workspace.name}&quot;</p>
        </div>
        <Tooltip>
          <TooltipTrigger render={
            <Button variant="outline" onClick={() => window.print()}>
              <PrinterIcon className="size-4 mr-1" />
              Print
            </Button>
          } />
          <TooltipContent><p>Print this report</p></TooltipContent>
        </Tooltip>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-6">
            <div className="flex items-start gap-6">
              <div className="w-48 shrink-0">
                <Item>
                  <ItemHeader className="aspect-[3/2] bg-[#F2F2F2] flex items-center justify-center overflow-hidden">
                    {workspace.imageUrl ? (
                      <img src={workspace.imageUrl} alt={workspace.name} className="w-full h-full object-cover" />
                    ) : (
                      <LayoutGrid className="h-8 w-8 text-muted-foreground/50" />
                    )}
                  </ItemHeader>
                </Item>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <h2 className="text-xl font-bold">{workspace.name}</h2>
                <p className="text-sm text-muted-foreground">{workspace.description}</p>
                <div className="flex gap-4 text-sm">
                  <span>Flows: <Badge variant="secondary">{workspace.flows}</Badge></span>
                  <span>Actions: <Badge variant="secondary">{workspace.actions}</Badge></span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold">Owner</h3>
                <div className="flex flex-wrap gap-1">
                  {workspace.owner.length > 0 ? (
                    workspace.owner.map((v) => (
                      <Badge key={v} variant="outline">{getLabel(v)}</Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">None assigned</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold">Board</h3>
                <div className="flex flex-wrap gap-1">
                  {workspace.board.length > 0 ? (
                    workspace.board.map((v) => (
                      <Badge key={v} variant="outline">{getLabel(v)}</Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">None assigned</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold">Staff</h3>
                <div className="flex flex-wrap gap-1">
                  {workspace.staff.length > 0 ? (
                    workspace.staff.map((v) => (
                      <Badge key={v}>{getLabel(v)}</Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">None assigned</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold">Member</h3>
                <div className="flex flex-wrap gap-1">
                  {workspace.member.length > 0 ? (
                    workspace.member.map((v) => (
                      <Badge key={v}>{getLabel(v)}</Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">None assigned</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold">Viewer</h3>
                <div className="flex flex-wrap gap-1">
                  {workspace.viewer.length > 0 ? (
                    workspace.viewer.map((v) => (
                      <Badge key={v} variant="secondary">{getLabel(v)}</Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">None assigned</span>
                  )}
                </div>
              </div>
            </div>

            {workspace.mission && (
              <>
                <Separator />
                <div className="flex flex-col gap-2">
                  <h3 className="text-sm font-semibold">Mission / Playbook</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{workspace.mission}</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

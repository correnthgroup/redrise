"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Item, ItemContent, ItemDescription, ItemHeader, ItemTitle } from "@/components/ui/item"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LayoutGrid, ArrowLeftIcon, PrinterIcon } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import type { Project } from "../../page"

export default function ResumeProjectPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [project, setProject] = React.useState<Project | null>(null)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    const stored = localStorage.getItem("projects")
    if (stored) {
      const projects: Project[] = JSON.parse(stored)
      setProject(projects.find((p) => p.id === id) || null)
    }
    setMounted(true)
  }, [id])

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/projects")}>
            <ArrowLeftIcon className="size-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Project not found</h1>
            <p className="text-sm text-muted-foreground">This project may have been deleted.</p>
          </div>
        </div>
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
          <h1 className="text-lg font-semibold">{project.name}</h1>
          <p className="text-sm text-muted-foreground">Project report for &quot;{project.name}&quot;</p>
        </div>
        <Button variant="outline" onClick={() => window.print()} className="ml-auto">
          <PrinterIcon className="size-4 mr-1" />
          Print
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <Item>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {project.description || "No description provided."}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID</span>
                  <span className="font-mono text-xs">{project.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name</span>
                  <span>{project.name}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

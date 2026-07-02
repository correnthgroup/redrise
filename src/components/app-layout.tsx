"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"

const breadcrumbMap: Record<string, string> = {
  projects: "Projects",
  "design-engineering": "Design Engineering",
  workstation: "Workstation",
  workspace: "Space",
  new: "New",
  edit: "Edit",
  resume: "Resume",

  workflow: "Process",
  workaction: "Action",
  agents: "Agents",
  models: "Models",
  engine: "Engine",
  analytics: "Analytics",
  documentation: "Documentation",
  introduction: "Introduction",
  "get-started": "Get Started",
  tutorials: "Tutorials",
  changelog: "Changelog",
  settings: "Settings",
  general: "General",
  team: "Team",
  billing: "Billing",
  limits: "Limits",
}

function getBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean)
  const crumbs: Array<{ label: string; href?: string }> = []

  segments.forEach((segment, index) => {
    const label = breadcrumbMap[segment] || segment
    if (index < segments.length - 1) {
      const href = "/" + segments.slice(0, index + 1).join("/")
      crumbs.push({ label, href })
    } else {
      crumbs.push({ label })
    }
  })

  return crumbs
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const breadcrumbs = getBreadcrumbs(pathname)

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={index}>
                    <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
                      {crumb.href ? (
                        <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      )}
                    </BreadcrumbItem>
                    {index < breadcrumbs.length - 1 && (
                      <BreadcrumbSeparator className="hidden md:block" />
                    )}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

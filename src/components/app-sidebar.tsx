"use client"

import * as React from "react"
import Link from "next/link"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { TerminalSquareIcon, BotIcon, BookOpenIcon, Settings2Icon, LifeBuoyIcon, SendIcon, FrameIcon, TerminalIcon } from "lucide-react"

interface Project {
  id: string
  name: string
  url: string
}

function getStoredProjects(): Project[] {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem("projects")
    if (stored) {
      const projects: { id: string; name: string }[] = JSON.parse(stored)
      return projects.map((p) => ({ id: p.id, name: p.name, url: `/projects/${p.id}/resume` }))
    }
  } catch {
    // Ignore storage errors
  }
  return []
}

const staticProjects: Project[] = [
  { id: "design-engineering", name: "Design Engineering", url: "/projects/design-engineering" },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [dynamicProjects, setDynamicProjects] = React.useState<Project[]>([])
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setDynamicProjects(getStoredProjects())
    setMounted(true)
  }, [])

  const allProjects = React.useMemo(() => {
    const staticNames = staticProjects.map((p) => p.name)
    const uniqueDynamic = dynamicProjects.filter((p) => !staticNames.includes(p.name))
    return [...staticProjects, ...uniqueDynamic]
  }, [dynamicProjects])

  const projectItems = allProjects.map((p) => ({ title: p.name, url: p.url }))

  const navMain = React.useMemo(() => [
    {
      title: "Workstation",
      url: "/workstation",
      icon: <TerminalSquareIcon />,
      isActive: true,
      items: [
        { title: "Space", url: "/workstation/workspace" },
        { title: "Process", url: "/workstation/workflow" },
        { title: "Action", url: "/workstation/workaction" },
      ],
    },
    {
      title: "Agents",
      url: "/agents",
      icon: <BotIcon />,
      items: [
        { title: "Models", url: "/agents/models" },
        { title: "Engine", url: "/agents/engine" },
        { title: "Analytics", url: "/agents/analytics" },
      ],
    },
    {
      title: "Documentation",
      url: "/documentation",
      icon: <BookOpenIcon />,
      items: [
        { title: "Introduction", url: "/documentation/introduction" },
        { title: "Get Started", url: "/documentation/get-started" },
        { title: "Tutorials", url: "/documentation/tutorials" },
        { title: "Changelog", url: "/documentation/changelog" },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: <Settings2Icon />,
      items: [
        { title: "General", url: "/settings/general" },
        { title: "Team", url: "/settings/team" },
        { title: "Billing", url: "/settings/billing" },
        { title: "Limits", url: "/settings/limits" },
      ],
    },
    {
      title: "Projects",
      url: "/projects",
      icon: <FrameIcon />,
      items: mounted ? projectItems : [],
    },
  ], [mounted, projectItems])

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/workstation" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <TerminalIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Redrise</span>
                <span className="truncate text-xs">Enterprise</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary items={[
          { title: "Support", url: "#", icon: <LifeBuoyIcon /> },
          { title: "Feedback", url: "#", icon: <SendIcon /> },
        ]} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ name: "shadcn", email: "m@example.com", avatar: "/avatars/shadcn.jpg" }} />
      </SidebarFooter>
    </Sidebar>
  )
}

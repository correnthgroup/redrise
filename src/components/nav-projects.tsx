"use client"

import * as React from "react"
import Link from "next/link"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { ChevronRightIcon, MoreHorizontalIcon } from "lucide-react"

const STORAGE_KEY = "sidebar-projects-expanded"

function getStoredExpanded(): boolean {
  if (typeof window === "undefined") return false
  try {
    return localStorage.getItem(STORAGE_KEY) === "true"
  } catch {
    return false
  }
}

function saveExpanded(value: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    // Ignore storage errors
  }
}

export function NavProjects({
  projects,
}: {
  projects: {
    name: string
    url: string
    icon: React.ReactNode
  }[]
}) {
  const [expanded, setExpanded] = React.useState(false)
  const [ready, setReady] = React.useState(false)

  React.useEffect(() => {
    setExpanded(getStoredExpanded())
    setReady(true)
  }, [])

  const toggle = React.useCallback((isOpen: boolean) => {
    setExpanded(isOpen)
    saveExpanded(isOpen)
  }, [])

  if (!ready) {
    return (
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>Projects</SidebarGroupLabel>
        <SidebarMenu>
          {projects.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton render={<Link href={item.url} />}>
                {item.icon}
                <span>{item.name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroup>
    )
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarMenu>
        <Collapsible
          open={expanded}
          onOpenChange={toggle}
          render={<SidebarMenuItem />}
        >
          <SidebarMenuButton tooltip="Projects">
            <span className="font-medium">Projects</span>
          </SidebarMenuButton>
          <CollapsibleTrigger
            render={
              <SidebarMenuAction className="aria-expanded:rotate-90" />
            }
          >
            <ChevronRightIcon />
            <span className="sr-only">Toggle</span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {projects.map((item) => (
                <SidebarMenuSubItem key={item.name}>
                  <SidebarMenuSubButton render={<Link href={item.url} />}>
                    {item.icon}
                    <span>{item.name}</span>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
              <SidebarMenuSubItem>
                <SidebarMenuSubButton>
                  <MoreHorizontalIcon className="size-4" />
                  <span>More</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenu>
    </SidebarGroup>
  )
}

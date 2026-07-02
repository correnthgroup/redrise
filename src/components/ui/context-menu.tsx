"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ContextMenuProps {
  children: React.ReactNode
}

interface ContextMenuTriggerProps {
  children: React.ReactNode
  className?: string
}

interface ContextMenuContentProps {
  children: React.ReactNode
  className?: string
}

interface ContextMenuItemProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
}

interface ContextMenuLabelProps {
  children: React.ReactNode
  className?: string
}

const ContextMenuContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
  position: { x: number; y: number }
  setPosition: (position: { x: number; y: number }) => void
}>({
  open: false,
  setOpen: () => {},
  position: { x: 0, y: 0 },
  setPosition: () => {},
})

function ContextMenu({ children }: ContextMenuProps) {
  const [open, setOpen] = React.useState(false)
  const [position, setPosition] = React.useState({ x: 0, y: 0 })

  return (
    <ContextMenuContext.Provider value={{ open, setOpen, position, setPosition }}>
      <div className="relative">{children}</div>
    </ContextMenuContext.Provider>
  )
}

function ContextMenuTrigger({ children, className }: ContextMenuTriggerProps) {
  const { setOpen, setPosition } = React.useContext(ContextMenuContext)

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setPosition({ x: e.clientX, y: e.clientY })
    setOpen(true)
  }

  return (
    <div className={cn("cursor-pointer", className)} onContextMenu={handleContextMenu}>
      {children}
    </div>
  )
}

function ContextMenuContent({ children, className }: ContextMenuContentProps) {
  const { open, setOpen, position } = React.useContext(ContextMenuContext)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open, setOpen])

  if (!open) return null

  return (
    <div
      ref={ref}
      className={cn(
        "fixed z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        className
      )}
      style={{ left: position.x, top: position.y }}
    >
      {children}
    </div>
  )
}

function ContextMenuItem({ children, onClick, className, disabled }: ContextMenuItemProps) {
  const { setOpen } = React.useContext(ContextMenuContext)

  return (
    <button
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-left",
        className
      )}
      disabled={disabled}
      onClick={() => {
        onClick?.()
        setOpen(false)
      }}
    >
      {children}
    </button>
  )
}

function ContextMenuLabel({ children, className }: ContextMenuLabelProps) {
  return (
    <div className={cn("px-2 py-1.5 text-sm font-semibold", className)}>
      {children}
    </div>
  )
}

function ContextMenuSeparator({ className }: { className?: string }) {
  return <div className={cn("-mx-1 my-1 h-px bg-muted", className)} />
}

export { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuSeparator }

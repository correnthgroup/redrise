"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface BackgroundGradientProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
}

function BackgroundGradient({ children, className, ...props }: BackgroundGradientProps) {
  return (
    <div
      className={cn(
        "relative group/card",
        className
      )}
      {...props}
    >
      <div className="absolute -inset-[1px] rounded-[22px] bg-gradient-to-b from-neutral-200 via-neutral-300 to-neutral-400 opacity-100 group-hover/card:opacity-100 transition duration-500 dark:from-neutral-700 dark:via-neutral-800 dark:to-neutral-900" />
      <div className="relative rounded-[21px] bg-white dark:bg-zinc-900">
        {children}
      </div>
    </div>
  )
}

export { BackgroundGradient }

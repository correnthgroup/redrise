"use client"

import { usePathname } from "next/navigation"

const SETTINGS_HUB_PATH = "/settings"

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isHub = pathname === SETTINGS_HUB_PATH

  if (!isHub) {
    return <>{children}</>
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account, team and billing
        </p>
      </div>
      {children}
    </div>
  )
}

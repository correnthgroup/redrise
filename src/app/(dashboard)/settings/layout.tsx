"use client"

import { usePathname } from "next/navigation"
import { useI18n } from "@/hooks/use-i18n"

const SETTINGS_HUB_PATH = "/settings"

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { t } = useI18n()
  const isHub = pathname === SETTINGS_HUB_PATH

  if (!isHub) {
    return <>{children}</>
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">{t("settings.header.title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("settings.header.subtitle")}
        </p>
      </div>
      {children}
    </div>
  )
}

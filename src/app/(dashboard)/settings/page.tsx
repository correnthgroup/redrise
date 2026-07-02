"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronRightIcon,
  CreditCardIcon,
  GaugeIcon,
  SlidersHorizontalIcon,
  UsersIcon,
} from "lucide-react"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { cn } from "@/lib/utils"

type SettingsHubItem = {
  href: string
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}

const SETTINGS_HUB_ITEMS: SettingsHubItem[] = [
  {
    href: "/settings/general",
    icon: SlidersHorizontalIcon,
    title: "General",
    description: "Account and workspace preferences",
  },
  {
    href: "/settings/team",
    icon: UsersIcon,
    title: "Team",
    description: "Manage team members, roles and invitations",
  },
  {
    href: "/settings/billing",
    icon: CreditCardIcon,
    title: "Billing",
    description: "Plan, payment method and invoices",
  },
  {
    href: "/settings/limits",
    icon: GaugeIcon,
    title: "Limits",
    description: "Usage limits and quotas",
  },
]

export default function SettingsPage() {
  const pathname = usePathname()

  return (
    <ItemGroup className="gap-2">
      {SETTINGS_HUB_ITEMS.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon
        return (
          <Item
            key={item.href}
            asChild
            variant="outline"
            size="default"
            className={cn(
              isActive &&
                "border-accent bg-accent text-accent-foreground [&_[data-slot=item-description]]:text-accent-foreground/80"
            )}
          >
            <Link href={item.href}>
              <ItemMedia variant="icon">
                <Icon className="size-4" />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{item.title}</ItemTitle>
                <ItemDescription>{item.description}</ItemDescription>
              </ItemContent>
              <ItemActions>
                <ChevronRightIcon className="size-4 text-muted-foreground" />
              </ItemActions>
            </Link>
          </Item>
        )
      })}
    </ItemGroup>
  )
}

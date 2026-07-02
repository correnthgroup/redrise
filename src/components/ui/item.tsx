import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const itemVariants = cva(
  "flex flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-xs transition-colors",
  {
    variants: {
      variant: {
        default: "border-border",
        outline: "border-border",
        ghost: "border-transparent hover:bg-muted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const ItemGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-4", className)} {...props} />
))
ItemGroup.displayName = "ItemGroup"

const Item = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof itemVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} className={cn(itemVariants({ variant }), className)} {...props} />
))
Item.displayName = "Item"

const ItemHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative aspect-square w-full overflow-hidden", className)}
    {...props}
  />
))
ItemHeader.displayName = "ItemHeader"

const ItemContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-1 p-3", className)} {...props} />
))
ItemContent.displayName = "ItemContent"

const ItemTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-sm font-medium leading-none", className)}
    {...props}
  />
))
ItemTitle.displayName = "ItemTitle"

const ItemDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs text-muted-foreground", className)}
    {...props}
  />
))
ItemDescription.displayName = "ItemDescription"

export { Item, ItemHeader, ItemContent, ItemTitle, ItemDescription, ItemGroup }

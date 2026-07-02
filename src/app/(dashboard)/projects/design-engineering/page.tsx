"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select"
import { Label } from "@/components/ui/label"
import {
  SaveIcon,
  PaletteIcon,
  InfoIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  XIcon,
} from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Spinner } from "@/components/ui/spinner"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { toast } from "sonner"

interface AppElement {
  id: string
  object: string
  location: string[]
  cssVar: string
  color: string
  effect: string
  category: string
  about: string
}

const rawElements = [
  {
    object: "Sidebar",
    location: ["All Pages"],
    cssVar: "--sidebar",
    color: "#fafafa",
    effects: ["Background", "Border", "Hover", "Active"],
    category: "Layout",
    about: "The main sidebar container that wraps all sidebar content. Uses the `bg-sidebar` class which maps to `var(--sidebar)`. It provides the navigation structure for the entire application, including the header, content sections, and footer.",
  },
  {
    object: "Sidebar Header",
    location: ["All Pages"],
    cssVar: "--sidebar",
    color: "#fafafa",
    effects: ["Background"],
    category: "Layout",
    about: "The top section of the sidebar containing the application logo and branding. Typically displays the app icon, name, and subtitle.",
  },
  {
    object: "Sidebar Menu Button",
    location: ["All Pages"],
    cssVar: "--sidebar-accent",
    color: "#f5f5f5",
    effects: ["Background", "Hover", "Active", "Text"],
    category: "Navigation",
    about: "Interactive button elements within the sidebar navigation. These respond to hover and active states with background color changes.",
  },
  {
    object: "Sidebar Menu Item",
    location: ["All Pages"],
    cssVar: "--sidebar-accent",
    color: "#f5f5f5",
    effects: ["Background", "Hover", "Active", "Text"],
    category: "Navigation",
    about: "Individual navigation items within sidebar menus. Each item represents a route or action in the application.",
  },
  {
    object: "Menubar",
    location: ["Space"],
    cssVar: "--background",
    color: "#ffffff",
    effects: ["Background", "Border"],
    category: "Navigation",
    about: "A horizontal menu bar component used in the Space page. Contains top-level menu triggers (File, Edit, View) that open dropdown menus with actions.",
  },
  {
    object: "Menubar Trigger",
    location: ["Space"],
    cssVar: "--background",
    color: "transparent",
    effects: ["Background", "Hover", "Text"],
    category: "Navigation",
    about: "Clickable menu headers in the menubar (e.g., 'File', 'Edit', 'View'). On click or hover, they reveal dropdown menus with related actions.",
  },
  {
    object: "Menubar Content",
    location: ["Space"],
    cssVar: "--popover",
    color: "#ffffff",
    effects: ["Background", "Border", "Shadow"],
    category: "Navigation",
    about: "The dropdown panel that appears when a menubar trigger is activated. Contains a list of menu items, separators, and shortcuts.",
  },
  {
    object: "Menubar Item",
    location: ["Space"],
    cssVar: "--popover",
    color: "transparent",
    effects: ["Background", "Hover", "Text"],
    category: "Navigation",
    about: "Individual clickable items within a menubar dropdown. Each item performs an action when clicked.",
  },
  {
    object: "Button",
    location: ["Space", "DataTable"],
    cssVar: "--primary",
    color: "#262626",
    effects: ["Background", "Hover", "Text", "Border"],
    category: "Interactive",
    about: "Primary action buttons used throughout the application. Uses the `bg-primary` class for a solid background. Supports multiple variants.",
  },
  {
    object: "Button Outline",
    location: ["Space"],
    cssVar: "--background",
    color: "transparent",
    effects: ["Background", "Hover", "Border", "Text"],
    category: "Interactive",
    about: "Outline variant of the Button component. Has a transparent background with a visible border.",
  },
  {
    object: "Input",
    location: ["Space", "DataTable", "Process", "Action"],
    cssVar: "--background",
    color: "#ffffff",
    effects: ["Background", "Border", "Focus", "Text", "Placeholder"],
    category: "Form",
    about: "Standard text input field used for user data entry. Has a white background with a border that changes to ring color on focus.",
  },
  {
    object: "Textarea",
    location: ["Space"],
    cssVar: "--background",
    color: "#ffffff",
    effects: ["Background", "Border", "Focus", "Text", "Placeholder"],
    category: "Form",
    about: "Multi-line text input for longer text content. Supports configurable rows for height.",
  },
  {
    object: "Label",
    location: ["Space", "DataTable"],
    cssVar: "--foreground",
    color: "transparent",
    effects: ["Text"],
    category: "Form",
    about: "Form field labels that describe input elements. Uses the foreground color for text.",
  },
  {
    object: "Card",
    location: ["Workstation", "Space"],
    cssVar: "--card",
    color: "#ffffff",
    effects: ["Background", "Border", "Shadow"],
    category: "Container",
    about: "A versatile container component for grouping related content. Has a card background color with a border.",
  },
  {
    object: "Card Header",
    location: ["Workstation", "Space"],
    cssVar: "--card",
    color: "transparent",
    effects: ["Text"],
    category: "Container",
    about: "The top section of a Card component. Contains the title, description, and optional action elements.",
  },
  {
    object: "Card Title",
    location: ["Workstation", "Space"],
    cssVar: "--card-foreground",
    color: "transparent",
    effects: ["Text"],
    category: "Container",
    about: "The main heading within a Card Header. Uses the card foreground color for text.",
  },
  {
    object: "Card Description",
    location: ["Workstation", "Space"],
    cssVar: "--muted-foreground",
    color: "transparent",
    effects: ["Text"],
    category: "Container",
    about: "Secondary text within a Card Header. Uses muted foreground color for a lighter appearance.",
  },
  {
    object: "Card Content",
    location: ["Workstation", "Space"],
    cssVar: "--card",
    color: "transparent",
    effects: [],
    category: "Container",
    about: "The main content area of a Card component. Provides padding and layout for the card's primary content.",
  },
  {
    object: "Badge",
    location: ["Workstation", "Space", "DataTable"],
    cssVar: "--secondary",
    color: "#f5f5f5",
    effects: ["Background", "Text"],
    category: "Display",
    about: "Small inline elements for labels, status indicators, or tags. Uses the secondary color scheme by default.",
  },
  {
    object: "Badge Outline",
    location: ["Space"],
    cssVar: "--background",
    color: "transparent",
    effects: ["Border", "Text"],
    category: "Display",
    about: "Outline variant of the Badge component. Has a transparent background with a visible border.",
  },
  {
    object: "Separator",
    location: ["Space", "DataTable"],
    cssVar: "--border",
    color: "#e5e5e5",
    effects: ["Background"],
    category: "Layout",
    about: "A visual divider line used to separate content sections. Uses the border color for a subtle line.",
  },
  {
    object: "Table",
    location: ["Workstation", "DataTable"],
    cssVar: "--background",
    color: "#ffffff",
    effects: ["Background", "Border"],
    category: "Data",
    about: "A structured data display component with rows and columns. Supports sorting, selection, pagination.",
  },
  {
    object: "Table Header",
    location: ["Workstation", "DataTable"],
    cssVar: "--background",
    color: "#f9f9f9",
    effects: ["Background", "Border"],
    category: "Data",
    about: "The header row of a Table containing column titles. Has a slightly different background for visual distinction.",
  },
  {
    object: "Table Row",
    location: ["Workstation", "DataTable"],
    cssVar: "--background",
    color: "transparent",
    effects: ["Background", "Hover", "Border"],
    category: "Data",
    about: "Individual data rows within a Table. Supports hover states for row highlighting and selection.",
  },
  {
    object: "Table Head",
    location: ["Workstation", "DataTable"],
    cssVar: "--foreground",
    color: "transparent",
    effects: ["Text"],
    category: "Data",
    about: "Individual column header cells within the Table Header. Displays column titles.",
  },
  {
    object: "Table Cell",
    location: ["Workstation", "DataTable"],
    cssVar: "--foreground",
    color: "transparent",
    effects: ["Text"],
    category: "Data",
    about: "Individual data cells within a Table Row. Displays the actual data content.",
  },
  {
    object: "Chart Container",
    location: ["Workstation"],
    cssVar: "--background",
    color: "#ffffff",
    effects: ["Background", "Border"],
    category: "Data",
    about: "A wrapper component for Recharts visualizations. Provides responsive sizing and theme integration.",
  },
  {
    object: "Chart Tooltip",
    location: ["Workstation"],
    cssVar: "--popover",
    color: "#ffffff",
    effects: ["Background", "Border", "Shadow"],
    category: "Data",
    about: "A floating tooltip that appears when hovering over chart data points.",
  },
  {
    object: "Dropdown Menu",
    location: ["Sidebar", "DataTable"],
    cssVar: "--popover",
    color: "#ffffff",
    effects: ["Background", "Border", "Shadow"],
    category: "Navigation",
    about: "A floating menu that appears when triggered by a button or other interactive element.",
  },
  {
    object: "Dropdown Menu Item",
    location: ["Sidebar", "DataTable"],
    cssVar: "--popover",
    color: "transparent",
    effects: ["Background", "Hover", "Text"],
    category: "Navigation",
    about: "Individual clickable items within a Dropdown Menu.",
  },
  {
    object: "Select",
    location: ["Workstation", "DataTable"],
    cssVar: "--background",
    color: "#ffffff",
    effects: ["Background", "Border", "Focus"],
    category: "Form",
    about: "A dropdown select component for choosing from a list of options.",
  },
  {
    object: "Select Content",
    location: ["Workstation", "DataTable"],
    cssVar: "--popover",
    color: "#ffffff",
    effects: ["Background", "Border", "Shadow"],
    category: "Form",
    about: "The dropdown panel that appears when a Select trigger is clicked.",
  },
  {
    object: "Select Item",
    location: ["Workstation", "DataTable"],
    cssVar: "--popover",
    color: "transparent",
    effects: ["Background", "Hover", "Text"],
    category: "Form",
    about: "Individual selectable options within a Select Content.",
  },
  {
    object: "Checkbox",
    location: ["DataTable"],
    cssVar: "--primary",
    color: "#262626",
    effects: ["Background", "Border", "Check"],
    category: "Form",
    about: "A toggle control for binary selections (checked/unchecked). Uses primary color when checked.",
  },
  {
    object: "Toggle Group",
    location: ["Workstation"],
    cssVar: "--background",
    color: "#f5f5f5",
    effects: ["Background", "Border"],
    category: "Interactive",
    about: "A set of two or more toggle buttons where only one can be active at a time.",
  },
  {
    object: "Toggle Group Item",
    location: ["Workstation"],
    cssVar: "--background",
    color: "transparent",
    effects: ["Background", "Hover", "Active", "Text"],
    category: "Interactive",
    about: "Individual toggle buttons within a Toggle Group.",
  },
  {
    object: "Empty State",
    location: ["Process", "Action", "Agents", "Documentation", "Settings"],
    cssVar: "--muted-foreground",
    color: "transparent",
    effects: ["Text"],
    category: "Display",
    about: "A placeholder displayed when a page or section has no content.",
  },
  {
    object: "Breadcrumb",
    location: ["All Pages"],
    cssVar: "--muted-foreground",
    color: "transparent",
    effects: ["Text"],
    category: "Navigation",
    about: "A navigation aid showing the current page location within the application hierarchy.",
  },
  {
    object: "Breadcrumb Link",
    location: ["All Pages"],
    cssVar: "--muted-foreground",
    color: "transparent",
    effects: ["Text", "Hover"],
    category: "Navigation",
    about: "Clickable navigation links within a Breadcrumb trail.",
  },
  {
    object: "Avatar",
    location: ["Sidebar"],
    cssVar: "--muted",
    color: "#f5f5f5",
    effects: ["Background", "Text"],
    category: "Display",
    about: "A circular image or fallback element representing a user.",
  },
  {
    object: "Avatar Fallback",
    location: ["Sidebar"],
    cssVar: "--muted",
    color: "#f5f5f5",
    effects: ["Background", "Text"],
    category: "Display",
    about: "The fallback content displayed when an Avatar image fails to load.",
  },
  {
    object: "Popover",
    location: ["MultiSelect"],
    cssVar: "--popover",
    color: "#ffffff",
    effects: ["Background", "Border", "Shadow"],
    category: "Container",
    about: "A floating content panel that appears when triggered. Can contain any custom content.",
  },
  {
    object: "Command",
    location: ["MultiSelect"],
    cssVar: "--popover",
    color: "#ffffff",
    effects: ["Background", "Border", "Shadow"],
    category: "Container",
    about: "A command palette or search component built with cmdk.",
  },
  {
    object: "Command Item",
    location: ["MultiSelect"],
    cssVar: "--popover",
    color: "transparent",
    effects: ["Background", "Hover", "Text"],
    category: "Container",
    about: "Individual selectable items within a Command list.",
  },
  {
    object: "Kbd",
    location: ["Process", "Action", "Agents", "Documentation", "Settings"],
    cssVar: "--background",
    color: "#f5f5f5",
    effects: ["Background", "Border", "Text", "Shadow"],
    category: "Display",
    about: "Keyboard shortcut indicator styled to look like a physical key.",
  },
  {
    object: "Input Group",
    location: ["Process", "Action", "Agents", "Documentation", "Settings"],
    cssVar: "--background",
    color: "#ffffff",
    effects: ["Background", "Border", "Focus"],
    category: "Form",
    about: "A compound input component that supports addons (prefix/suffix elements).",
  },
  {
    object: "Native Select",
    location: ["DataTable"],
    cssVar: "--background",
    color: "#ffffff",
    effects: ["Background", "Border", "Focus"],
    category: "Form",
    about: "A native HTML select element styled to match the design system.",
  },
  {
    object: "Sidebar Footer",
    location: ["All Pages"],
    cssVar: "--sidebar",
    color: "#fafafa",
    effects: ["Background"],
    category: "Layout",
    about: "The bottom section of the sidebar containing user information and secondary actions.",
  },
  {
    object: "Sidebar Group Label",
    location: ["All Pages"],
    cssVar: "--sidebar-foreground",
    color: "transparent",
    effects: ["Text"],
    category: "Navigation",
    about: "A text label that categorizes groups of sidebar navigation items.",
  },
  {
    object: "Sidebar Menu Action",
    location: ["All Pages"],
    cssVar: "--sidebar-accent",
    color: "transparent",
    effects: ["Background", "Hover", "Text"],
    category: "Navigation",
    about: "Action buttons that appear on sidebar menu items on hover.",
  },
]

let counter = 0
const appElements: AppElement[] = rawElements.flatMap((el) =>
  el.effects.length === 0
    ? [{ ...el, id: `el-${counter++}`, effect: "-" }]
    : el.effects.map((eff) => ({
        ...el,
        id: `el-${counter++}`,
        effect: eff,
      }))
)

const categories = [...new Set(appElements.map((el) => el.category))]
const categoryCounts = categories.reduce<Record<string, number>>((acc, cat) => {
  acc[cat] = appElements.filter((el) => el.category === cat).length
  return acc
}, {})
const allEffects = [...new Set(appElements.map((el) => el.effect))]

const STORAGE_KEY = "design-engineering-colors"

function loadColors(): Record<string, string> | null {
  if (typeof window === "undefined") return null
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function saveColors(colors: Record<string, string>) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(colors))
}

function applyColorsToDOM(elements: AppElement[]) {
  const root = document.documentElement
  const applied = new Set<string>()
  elements.forEach((el) => {
    if (!applied.has(el.cssVar) && el.color && el.color !== "transparent") {
      root.style.setProperty(el.cssVar, el.color)
      applied.add(el.cssVar)
    }
  })
}

export default function DesignEngineeringPage() {
  const [elements, setElements] = React.useState<AppElement[]>(() => {
    const saved = loadColors()
    const merged = saved
      ? appElements.map((el) => {
          const color = saved[el.id]
          return color ? { ...el, color } : el
        })
      : appElements
    if (saved) {
      requestAnimationFrame(() => applyColorsToDOM(merged))
    }
    return merged
  })
  const [filter, setFilter] = React.useState("")
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null)
  const [isSaving, setIsSaving] = React.useState(false)
  const [columnFilters, setColumnFilters] = React.useState({
    object: "",
    location: "",
    effect: "",
  })
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize: 10 })

  const updateColumnFilter = (column: string, value: string) => {
    setColumnFilters((prev) => ({ ...prev, [column]: value }))
  }

  const clearColumnFilter = (column: string) => {
    setColumnFilters((prev) => ({ ...prev, [column]: "" }))
  }

  const hasActiveFilter = (column: string) => {
    return columnFilters[column as keyof typeof columnFilters] !== ""
  }

  const filteredElements = elements.filter((el) => {
    const matchesGlobalFilter =
      el.object.toLowerCase().includes(filter.toLowerCase()) ||
      el.location.some((loc) => loc.toLowerCase().includes(filter.toLowerCase()))
    const matchesCategory = !selectedCategory || el.category === selectedCategory
    const matchesObject = el.object.toLowerCase().includes(columnFilters.object.toLowerCase())
    const matchesLocation =
      !columnFilters.location ||
      el.location.some((loc) => loc.toLowerCase().includes(columnFilters.location.toLowerCase()))
    const matchesEffect =
      !columnFilters.effect || el.effect.toLowerCase().includes(columnFilters.effect.toLowerCase())
    return (
      matchesGlobalFilter &&
      matchesCategory &&
      matchesObject &&
      matchesLocation &&
      matchesEffect
    )
  })

  const totalPages = Math.ceil(filteredElements.length / pagination.pageSize)
  const paginatedElements = filteredElements.slice(
    pagination.pageIndex * pagination.pageSize,
    (pagination.pageIndex + 1) * pagination.pageSize
  )

  const handleSave = () => {
    setIsSaving(true)
    const colors: Record<string, string> = {}
    elements.forEach((el) => {
      colors[el.id] = el.color
    })
    saveColors(colors)
    applyColorsToDOM(elements)
    setTimeout(() => {
      setIsSaving(false)
      toast.success("Colors saved successfully")
    }, 500)
  }

  const handleColorChange = (id: string, value: string) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, color: value } : el))
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PaletteIcon className="size-5" />
            Design Engineering
          </CardTitle>
          <CardDescription>
            Visual inventory of all UI elements with color customization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <Input
                  placeholder="Search objects or locations..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="max-w-sm"
                />
                <Tabs value={selectedCategory ?? "all"} onValueChange={(val) => setSelectedCategory(val === "all" ? null : val)}>
                  <TabsList variant="default" className="bg-muted rounded-lg p-0.5">
                    <TabsTrigger value="all" className="data-active:bg-background data-active:shadow-sm">
                      All
                    </TabsTrigger>
                    {categories.map((cat) => (
                      <TabsTrigger key={cat} value={cat} className="data-active:bg-background data-active:shadow-sm">
                        {cat}
                        <span className={`rounded-full px-1 text-[10px] ${
                          selectedCategory === cat
                            ? "bg-primary/10 text-primary"
                            : "bg-foreground/10 text-foreground/60"
                        }`}>
                          {categoryCounts[cat]}
                        </span>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
                <Tooltip>
                  <TooltipTrigger render={
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="ml-auto"
                    >
                      {isSaving && <Spinner className="mr-1" />}
                      <SaveIcon className="size-4 mr-1" />
                      Save
                    </Button>
                  } />
                  <TooltipContent>
                    <p>Save color changes</p>
                  </TooltipContent>
                </Tooltip>
              </div>

            <div className="rounded-md border">
              <Table className="table-fixed">
                <TableHeader className="sticky top-0 z-10 bg-muted">
                  <TableRow>
                    <TableHead className="w-[20%]">
                      <Popover>
                        <PopoverTrigger render={<button className="flex items-center gap-1.5 hover:text-foreground cursor-pointer" />}>
                          <span>Object</span>
                          <ChevronDownIcon className="size-3 opacity-50" />
                          {hasActiveFilter("object") && (
                            <span className="flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                              {columnFilters.object.length}
                            </span>
                          )}
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-3" align="start">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Filter Object</span>
                              {hasActiveFilter("object") && (
                                <Button variant="ghost" size="icon" className="size-5" onClick={() => clearColumnFilter("object")}>
                                  <XIcon className="size-3" />
                                </Button>
                              )}
                            </div>
                            <Input
                              placeholder="Search..."
                              value={columnFilters.object}
                              onChange={(e) => updateColumnFilter("object", e.target.value)}
                              className="h-8 text-xs"
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TableHead>
                    <TableHead className="w-[5%]">About</TableHead>
                    <TableHead className="w-[15%]">Category</TableHead>
                    <TableHead className="w-[25%]">
                      <Popover>
                        <PopoverTrigger render={<button className="flex items-center gap-1.5 hover:text-foreground cursor-pointer" />}>
                          <span>Location</span>
                          <ChevronDownIcon className="size-3 opacity-50" />
                          {hasActiveFilter("location") && (
                            <span className="flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                              {columnFilters.location.length}
                            </span>
                          )}
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-3" align="start">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Filter Location</span>
                              {hasActiveFilter("location") && (
                                <Button variant="ghost" size="icon" className="size-5" onClick={() => clearColumnFilter("location")}>
                                  <XIcon className="size-3" />
                                </Button>
                              )}
                            </div>
                            <Input
                              placeholder="Search..."
                              value={columnFilters.location}
                              onChange={(e) => updateColumnFilter("location", e.target.value)}
                              className="h-8 text-xs"
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TableHead>
                    <TableHead className="w-[15%]">
                      <span className="text-muted-foreground">Color</span>
                    </TableHead>
                    <TableHead className="w-[20%]">
                      <Popover>
                        <PopoverTrigger render={<button className="flex items-center gap-1.5 hover:text-foreground cursor-pointer" />}>
                          <span>Effect</span>
                          <ChevronDownIcon className="size-3 opacity-50" />
                          {hasActiveFilter("effect") && (
                            <span className="flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                              1
                            </span>
                          )}
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-3" align="start">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Filter Effect</span>
                              {hasActiveFilter("effect") && (
                                <Button variant="ghost" size="icon" className="size-5" onClick={() => clearColumnFilter("effect")}>
                                  <XIcon className="size-3" />
                                </Button>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {allEffects.map((eff) => (
                                <Badge
                                  key={eff}
                                  variant={columnFilters.effect === eff ? "default" : "outline"}
                                  className="cursor-pointer text-xs"
                                  onClick={() => updateColumnFilter("effect", columnFilters.effect === eff ? "" : eff)}
                                >
                                  {eff}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedElements.map((element) => (
                    <TableRow key={element.id}>
                      <TableCell className="font-medium">
                        {element.object}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger render={<Button variant="ghost" size="icon" className="size-7" />}>
                            <InfoIcon className="size-4" />
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{element.object}</DialogTitle>
                              <DialogDescription>
                                {element.category} component - {element.effect}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="-mx-4 no-scrollbar max-h-[50vh] overflow-y-auto px-4">
                              <p className="mb-4 leading-normal text-sm">
                                {element.about}
                              </p>
                              <div className="mb-4">
                                <h4 className="mb-2 font-medium text-sm">CSS Variable</h4>
                                <code className="rounded bg-muted px-2 py-1 text-xs">
                                  {element.cssVar}
                                </code>
                              </div>
                              <div className="mb-4">
                                <h4 className="mb-2 font-medium text-sm">Effect</h4>
                                <Badge variant="secondary" className="text-xs">
                                  {element.effect}
                                </Badge>
                              </div>
                              <div className="mb-4">
                                <h4 className="mb-2 font-medium text-sm">Locations</h4>
                                <div className="flex flex-wrap gap-1">
                                  {element.location.map((loc) => (
                                    <Badge key={loc} variant="outline" className="text-xs">
                                      {loc}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{element.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Popover>
                          <PopoverTrigger render={<Button variant="secondary" size="sm" className="h-7 gap-1" />}>
                            <span className="truncate max-w-[120px]">{element.location[0]}</span>
                            {element.location.length > 1 && (
                              <Badge variant="outline" className="ml-1 text-xs px-1">
                                +{element.location.length - 1}
                              </Badge>
                            )}
                          </PopoverTrigger>
                          <PopoverContent className="w-48 p-2" align="start">
                            <div className="flex flex-wrap gap-1">
                              {element.location.map((loc) => (
                                <Badge key={loc} variant="secondary" className="text-xs">
                                  {loc}
                                </Badge>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={element.color.startsWith("#") ? element.color : "#ffffff"}
                            onChange={(e) =>
                              handleColorChange(element.id, e.target.value)
                            }
                            className="size-6 cursor-pointer rounded border"
                          />
                          <Input
                            value={element.color}
                            onChange={(e) =>
                              handleColorChange(element.id, e.target.value)
                            }
                            className="h-7 w-28 text-xs"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{element.effect}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginatedElements.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No results.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between px-2">
              <div className="hidden flex-1 text-sm text-muted-foreground lg:flex">
                {filteredElements.length} of {elements.length} elements
              </div>
              <div className="flex w-full items-center gap-8 lg:w-fit">
                <div className="hidden items-center gap-2 lg:flex">
                  <Label htmlFor="rows-per-page" className="text-sm font-medium">
                    Rows per page
                  </Label>
                  <NativeSelect
                    value={`${pagination.pageSize}`}
                    onChange={(e) => {
                      setPagination({ pageIndex: 0, pageSize: Number(e.target.value) })
                    }}
                    size="sm"
                  >
                    {[10, 20, 30, 40, 50].map((pageSize) => (
                      <NativeSelectOption key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                </div>
                <div className="flex w-fit items-center justify-center text-sm font-medium">
                  Page {pagination.pageIndex + 1} of {totalPages || 1}
                </div>
                <div className="ml-auto flex items-center gap-2 lg:ml-0">
                  <Button
                    variant="outline"
                    className="hidden h-8 w-8 p-0 lg:flex"
                    onClick={() => setPagination((p) => ({ ...p, pageIndex: 0 }))}
                    disabled={pagination.pageIndex === 0}
                  >
                    <span className="sr-only">Go to first page</span>
                    <ChevronsLeftIcon className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="size-8"
                    size="icon"
                    onClick={() => setPagination((p) => ({ ...p, pageIndex: Math.max(0, p.pageIndex - 1) }))}
                    disabled={pagination.pageIndex === 0}
                  >
                    <span className="sr-only">Go to previous page</span>
                    <ChevronLeftIcon className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="size-8"
                    size="icon"
                    onClick={() => setPagination((p) => ({ ...p, pageIndex: Math.min(totalPages - 1, p.pageIndex + 1) }))}
                    disabled={pagination.pageIndex >= totalPages - 1}
                  >
                    <span className="sr-only">Go to next page</span>
                    <ChevronRightIcon className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="hidden size-8 lg:flex"
                    size="icon"
                    onClick={() => setPagination((p) => ({ ...p, pageIndex: totalPages - 1 }))}
                    disabled={pagination.pageIndex >= totalPages - 1}
                  >
                    <span className="sr-only">Go to last page</span>
                    <ChevronsRightIcon className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

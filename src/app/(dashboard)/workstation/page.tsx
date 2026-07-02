"use client"

import { useI18n } from "@/hooks/use-i18n"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"

const tableData = [
  {
    id: 1,
    header: "Project Brief",
    type: "Executive Summary",
    status: "Done",
    target: "100%",
    limit: "100%",
    reviewer: "Eddie Lake",
  },
  {
    id: 2,
    header: "Wireframes",
    type: "Design",
    status: "In Progress",
    target: "80%",
    limit: "100%",
    reviewer: "Eddie Lake",
  },
  {
    id: 3,
    header: "API Integration",
    type: "Development",
    status: "Pending",
    target: "40%",
    limit: "100%",
    reviewer: "Eddie Lake",
  },
  {
    id: 4,
    header: "User Testing",
    type: "Research",
    status: "Done",
    target: "100%",
    limit: "100%",
    reviewer: "Eddie Lake",
  },
  {
    id: 5,
    header: "Performance Report",
    type: "Analytics",
    status: "In Progress",
    target: "60%",
    limit: "100%",
    reviewer: "Eddie Lake",
  },
  {
    id: 6,
    header: "Security Audit",
    type: "Compliance",
    status: "Pending",
    target: "20%",
    limit: "100%",
    reviewer: "Eddie Lake",
  },
  {
    id: 7,
    header: "Deployment Plan",
    type: "DevOps",
    status: "Done",
    target: "100%",
    limit: "100%",
    reviewer: "Eddie Lake",
  },
  {
    id: 8,
    header: "Client Presentation",
    type: "Communication",
    status: "In Progress",
    target: "70%",
    limit: "100%",
    reviewer: "Eddie Lake",
  },
  {
    id: 9,
    header: "Budget Review",
    type: "Finance",
    status: "Pending",
    target: "30%",
    limit: "100%",
    reviewer: "Eddie Lake",
  },
  {
    id: 10,
    header: "Marketing Strategy",
    type: "Planning",
    status: "Done",
    target: "100%",
    limit: "100%",
    reviewer: "Eddie Lake",
  },
  {
    id: 11,
    header: "Technical Documentation",
    type: "Documentation",
    status: "In Progress",
    target: "50%",
    limit: "100%",
    reviewer: "Eddie Lake",
  },
  {
    id: 12,
    header: "Quality Assurance",
    type: "Testing",
    status: "Pending",
    target: "10%",
    limit: "100%",
    reviewer: "Eddie Lake",
  },
]

export default function WorkstationPage() {
  const { t } = useI18n()
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">{t("workstation.header.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("workstation.header.subtitle")}</p>
      </div>
      <SectionCards />
      <ChartAreaInteractive />
      <DataTable data={tableData} />
    </div>
  )
}

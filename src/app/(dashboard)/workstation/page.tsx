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
    header: "Wireframes & Mockups",
    type: "Design",
    status: "In Progress",
    target: "80%",
    limit: "100%",
    reviewer: "Jamik Tashpulatov",
  },
  {
    id: 3,
    header: "Technical Architecture",
    type: "Technical Approach",
    status: "In Progress",
    target: "60%",
    limit: "100%",
    reviewer: "Assign reviewer",
  },
  {
    id: 4,
    header: "API Documentation",
    type: "Narrative",
    status: "Not Started",
    target: "0%",
    limit: "100%",
    reviewer: "Assign reviewer",
  },
  {
    id: 5,
    header: "Database Schema",
    type: "Technical Approach",
    status: "Done",
    target: "100%",
    limit: "100%",
    reviewer: "Emily Whalen",
  },
  {
    id: 6,
    header: "User Authentication",
    type: "Technical Approach",
    status: "In Progress",
    target: "70%",
    limit: "100%",
    reviewer: "Eddie Lake",
  },
  {
    id: 7,
    header: "Dashboard Layout",
    type: "Design",
    status: "Done",
    target: "100%",
    limit: "100%",
    reviewer: "Jamik Tashpulatov",
  },
  {
    id: 8,
    header: "Performance Report",
    type: "Executive Summary",
    status: "Not Started",
    target: "0%",
    limit: "100%",
    reviewer: "Assign reviewer",
  },
  {
    id: 9,
    header: "Security Audit",
    type: "Focus Documents",
    status: "In Progress",
    target: "45%",
    limit: "100%",
    reviewer: "Emily Whalen",
  },
  {
    id: 10,
    header: "Deployment Guide",
    type: "Narrative",
    status: "Not Started",
    target: "0%",
    limit: "100%",
    reviewer: "Assign reviewer",
  },
  {
    id: 11,
    header: "Mobile Responsiveness",
    type: "Design",
    status: "In Progress",
    target: "55%",
    limit: "100%",
    reviewer: "Eddie Lake",
  },
  {
    id: 12,
    header: "Testing Strategy",
    type: "Technical Approach",
    status: "Not Started",
    target: "0%",
    limit: "100%",
    reviewer: "Assign reviewer",
  },
]

export default function WorkstationPage() {
  return (
    <div className="flex flex-col gap-4">
      <SectionCards />
      <ChartAreaInteractive />
      <DataTable data={tableData} />
    </div>
  )
}

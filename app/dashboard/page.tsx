import DashboardClient from "./dashboard-client"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Overview | Zappies AI Dashboard",
  description: "A comprehensive summary of your AI agent's performance, metrics, and recent activity.",
}

export default function DashboardPage() {
  return <DashboardClient />
}

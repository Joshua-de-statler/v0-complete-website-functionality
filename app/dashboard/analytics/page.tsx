import type { Metadata } from "next"
import AnalyticsClient from "./analytics-client"

export const metadata: Metadata = {
  title: "Analytics | Zappies AI Dashboard",
  description: "Detailed performance reports, metrics, and visualization for your AI agent.",
}

export default function AnalyticsPage() {
  return <AnalyticsClient />
}

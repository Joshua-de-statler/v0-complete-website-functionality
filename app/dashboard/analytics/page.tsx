import AnalyticsClient from "./analytics-client"
import type { Metadata } from "next"

// --- METADATA EXPORT (Server Component only) ---
export const metadata: Metadata = {
  title: "Analytics | Zappies AI Dashboard",
  description: "Detailed performance reports, metrics, and visualization for your AI agent.",
}
// --- END METADATA ---

export default function AnalyticsPage() {
  return <AnalyticsClient />
}

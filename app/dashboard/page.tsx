import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import DashboardClient from "./dashboard-client"
import type { Metadata } from "next"

// --- METADATA EXPORT (Server Component only) ---
export const metadata: Metadata = {
  title: "Overview | Zappies AI Dashboard",
  description: "A comprehensive summary of your AI agent's performance, metrics, and recent activity.",
}
// --- END METADATA ---

export default async function DashboardPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  
  // NOTE: Server-side data fetching for the client component's initial state
  const { data: user } = await supabase.auth.getUser()

  // No need to pass user info unless DashboardClient uses it.
  // We keep this file clean.

  return <DashboardClient />
}

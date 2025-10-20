import ConversationsClient from "./conversations-client"
import type { Metadata } from "next"

// --- METADATA EXPORT (Server Component only) ---
export const metadata: Metadata = {
  title: "Conversations | Zappies AI Dashboard",
  description: "View and manage all chat conversations handled by your AI agent.",
}
// --- END METADATA ---

export default function ConversationsPage() {
  // Renders the client component
  return <ConversationsClient />
}

import type { Metadata } from "next"
import ConversationsClient from "./conversations-client"

export const metadata: Metadata = {
  title: "Conversations | Zappies AI Dashboard",
  description: "View and manage all chat conversations handled by your AI agent.",
}

export default function ConversationsPage() {
  return <ConversationsClient />
}

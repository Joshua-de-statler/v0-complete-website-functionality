import type { Metadata } from "next"
import CallsClient from "./calls-client"

export const metadata: Metadata = {
  title: "Voice Calls | Zappies AI Dashboard",
  description: "Review and log details for all voice calls handled by your AI agent.",
}

export default function CallsPage() {
  return <CallsClient />
}

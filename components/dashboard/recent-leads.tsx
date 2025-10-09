import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface Lead {
  id: string
  name: string
  email: string
  company: string | null
  status: string
  created_at: string
}

interface RecentLeadsProps {
  leads: Lead[]
}

export function RecentLeads({ leads }: RecentLeadsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "contacted":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "converted":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      default:
        return "bg-[#EDE7C7]/10 text-[#EDE7C7] border-[#EDE7C7]/20"
    }
  }

  return (
    <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-[#EDE7C7]">Recent Leads</CardTitle>
        <Link
          href="/dashboard/leads"
          className="text-sm text-[#EDE7C7]/60 hover:text-[#EDE7C7] flex items-center gap-1"
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardHeader>
      <CardContent>
        {leads.length === 0 ? (
          <p className="text-[#EDE7C7]/60 text-sm">No leads yet. They'll appear here once submitted.</p>
        ) : (
          <div className="space-y-4">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="flex items-center justify-between py-3 border-b border-[#2A2A2A] last:border-0"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium text-[#EDE7C7]">{lead.name}</p>
                  <p className="text-xs text-[#EDE7C7]/60">{lead.email}</p>
                  {lead.company && <p className="text-xs text-[#EDE7C7]/40">{lead.company}</p>}
                </div>
                <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

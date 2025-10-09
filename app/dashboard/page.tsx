import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, TrendingUp, Clock, CheckCircle } from "lucide-react"
import { RecentLeads } from "@/components/dashboard/recent-leads"

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch leads data
  const { data: leads } = await supabase.from("leads").select("*").order("created_at", { ascending: false })

  const totalLeads = leads?.length || 0
  const newLeads = leads?.filter((lead) => lead.status === "new").length || 0
  const contactedLeads = leads?.filter((lead) => lead.status === "contacted").length || 0
  const convertedLeads = leads?.filter((lead) => lead.status === "converted").length || 0

  // Calculate this week's leads
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  const thisWeekLeads = leads?.filter((lead) => new Date(lead.created_at) > oneWeekAgo).length || 0

  const stats = [
    {
      title: "Total Leads",
      value: totalLeads,
      icon: Users,
      description: `${thisWeekLeads} new this week`,
    },
    {
      title: "New Leads",
      value: newLeads,
      icon: Clock,
      description: "Awaiting contact",
    },
    {
      title: "Contacted",
      value: contactedLeads,
      icon: TrendingUp,
      description: "In progress",
    },
    {
      title: "Converted",
      value: convertedLeads,
      icon: CheckCircle,
      description: "Successfully closed",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-[#EDE7C7]">Overview</h2>
        <p className="text-[#EDE7C7]/60 mt-2">Welcome back! Here's what's happening with your leads.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-[#1A1A1A] border-[#2A2A2A]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#EDE7C7]/80">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-[#EDE7C7]/60" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#EDE7C7]">{stat.value}</div>
              <p className="text-xs text-[#EDE7C7]/60 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <RecentLeads leads={leads?.slice(0, 5) || []} />
    </div>
  )
}

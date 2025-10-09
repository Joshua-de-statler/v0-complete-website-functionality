import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, Target, Calendar } from "lucide-react"

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const { data: leads } = await supabase.from("leads").select("*")

  // Calculate analytics
  const totalLeads = leads?.length || 0
  const conversionRate =
    totalLeads > 0 ? ((leads?.filter((l) => l.status === "converted").length || 0) / totalLeads) * 100 : 0

  // Monthly breakdown
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthlyLeads =
    leads?.filter((lead) => {
      const leadDate = new Date(lead.created_at)
      return leadDate.getMonth() === currentMonth && leadDate.getFullYear() === currentYear
    }).length || 0

  // Status breakdown
  const statusBreakdown = {
    new: leads?.filter((l) => l.status === "new").length || 0,
    contacted: leads?.filter((l) => l.status === "contacted").length || 0,
    converted: leads?.filter((l) => l.status === "converted").length || 0,
    lost: leads?.filter((l) => l.status === "lost").length || 0,
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-[#EDE7C7]">Analytics</h2>
        <p className="text-[#EDE7C7]/60 mt-2">Track your lead performance and conversion metrics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#EDE7C7]/80">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-[#EDE7C7]/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#EDE7C7]">{conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-[#EDE7C7]/60 mt-1">Overall performance</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#EDE7C7]/80">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-[#EDE7C7]/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#EDE7C7]">{monthlyLeads}</div>
            <p className="text-xs text-[#EDE7C7]/60 mt-1">New leads</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#EDE7C7]/80">Active Leads</CardTitle>
            <Users className="h-4 w-4 text-[#EDE7C7]/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#EDE7C7]">{statusBreakdown.new + statusBreakdown.contacted}</div>
            <p className="text-xs text-[#EDE7C7]/60 mt-1">In pipeline</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#EDE7C7]/80">Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#EDE7C7]/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#EDE7C7]">+{monthlyLeads}</div>
            <p className="text-xs text-[#EDE7C7]/60 mt-1">vs last month</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
        <CardHeader>
          <CardTitle className="text-[#EDE7C7]">Lead Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(statusBreakdown).map(([status, count]) => {
              const percentage = totalLeads > 0 ? (count / totalLeads) * 100 : 0
              return (
                <div key={status} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#EDE7C7] capitalize">{status}</span>
                    <span className="text-[#EDE7C7]/60">
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-[#0A0A0A] rounded-full overflow-hidden">
                    <div className="h-full bg-[#EDE7C7]" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

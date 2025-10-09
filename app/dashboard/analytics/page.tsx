import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, MessageSquare, Phone, Clock, Target, Calendar } from "lucide-react"

export default async function AnalyticsPage() {
  const metrics = {
    totalConversations: 1247,
    totalCalls: 342,
    avgResponseTime: 1.2,
    resolutionRate: 94,
    monthlyConversations: 423,
    monthlyCalls: 98,
  }

  const conversationBreakdown = {
    resolved: 876,
    active: 234,
    pending: 137,
  }

  const callBreakdown = {
    completed: 298,
    missed: 44,
  }

  const hourlyActivity = [
    { hour: "00:00", conversations: 12, calls: 3 },
    { hour: "04:00", conversations: 8, calls: 2 },
    { hour: "08:00", conversations: 145, calls: 28 },
    { hour: "12:00", conversations: 198, calls: 42 },
    { hour: "16:00", conversations: 167, calls: 35 },
    { hour: "20:00", conversations: 89, calls: 18 },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-[#EDE7C7]">Analytics</h2>
        <p className="text-[#EDE7C7]/60 mt-2">Track your chatbot performance and engagement metrics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#EDE7C7]/80">Resolution Rate</CardTitle>
            <Target className="h-4 w-4 text-[#EDE7C7]/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#EDE7C7]">{metrics.resolutionRate}%</div>
            <p className="text-xs text-[#EDE7C7]/60 mt-1">+2% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#EDE7C7]/80">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-[#EDE7C7]/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#EDE7C7]">{metrics.monthlyConversations}</div>
            <p className="text-xs text-[#EDE7C7]/60 mt-1">Conversations handled</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#EDE7C7]/80">Avg Response</CardTitle>
            <Clock className="h-4 w-4 text-[#EDE7C7]/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#EDE7C7]">{metrics.avgResponseTime}s</div>
            <p className="text-xs text-[#EDE7C7]/60 mt-1">0.3s faster</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-[#EDE7C7]/80">Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#EDE7C7]/60" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#EDE7C7]">+89</div>
            <p className="text-xs text-[#EDE7C7]/60 mt-1">vs last week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
          <CardHeader>
            <CardTitle className="text-[#EDE7C7] flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Conversation Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(conversationBreakdown).map(([status, count]) => {
                const percentage = (count / metrics.totalConversations) * 100
                return (
                  <div key={status} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#EDE7C7] capitalize">{status}</span>
                      <span className="text-[#EDE7C7]/60">
                        {count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-[#0A0A0A] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          status === "resolved" ? "bg-green-500" : status === "active" ? "bg-blue-500" : "bg-yellow-500"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
          <CardHeader>
            <CardTitle className="text-[#EDE7C7] flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Call Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(callBreakdown).map(([status, count]) => {
                const percentage = (count / metrics.totalCalls) * 100
                return (
                  <div key={status} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#EDE7C7] capitalize">{status}</span>
                      <span className="text-[#EDE7C7]/60">
                        {count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-[#0A0A0A] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${status === "completed" ? "bg-green-500" : "bg-red-500"}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
        <CardHeader>
          <CardTitle className="text-[#EDE7C7]">Activity by Time of Day</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {hourlyActivity.map((activity) => (
              <div key={activity.hour} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#EDE7C7]">{activity.hour}</span>
                  <div className="flex items-center gap-4 text-[#EDE7C7]/60">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {activity.conversations}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {activity.calls}
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-[#0A0A0A] rounded-full overflow-hidden">
                  <div className="h-full bg-[#EDE7C7]" style={{ width: `${(activity.conversations / 200) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Phone, TrendingUp, Clock } from "lucide-react"
import { RecentActivity } from "@/components/dashboard/recent-activity"

export default async function DashboardPage() {
  const stats = [
    {
      title: "Total Conversations",
      value: 1247,
      icon: MessageSquare,
      description: "+89 from last week",
      trend: "+7.2%",
    },
    {
      title: "Voice Calls",
      value: 342,
      icon: Phone,
      description: "+23 from last week",
      trend: "+6.7%",
    },
    {
      title: "Avg Response Time",
      value: "1.2s",
      icon: Clock,
      description: "0.3s faster",
      trend: "-20%",
    },
    {
      title: "Resolution Rate",
      value: "94%",
      icon: TrendingUp,
      description: "+2% from last week",
      trend: "+2.1%",
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-[#EDE7C7]">Overview</h2>
        <p className="text-[#EDE7C7]/60 mt-2">Welcome back! Here's your chatbot performance summary.</p>
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

      <RecentActivity />
    </div>
  )
}

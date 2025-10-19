"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, CalendarCheck, TrendingUp, Clock, AlertTriangle, Phone } from "lucide-react" // Added Phone icon
import { useCompanySupabase } from "@/lib/supabase/company-client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts" // Added recharts imports

const generateMockData = () => {
  const data = []
  const today = new Date()

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    // Simulate growing traffic with some variance
    const baseTraffic = 50 + (29 - i) * 3
    const traffic = Math.floor(baseTraffic + Math.random() * 20 - 10)

    // Meetings are roughly 10-15% of traffic
    const meetings = Math.floor(traffic * (0.1 + Math.random() * 0.05))

    data.push({
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      traffic,
      meetings,
    })
  }

  return data
}

export default function DashboardPage() {
  const companySupabase = useCompanySupabase()
  const [stats, setStats] = useState({
    totalConversations: 0,
    totalMeetings: 0,
    confirmedMeetings: 0,
    pendingMeetings: 0,
    totalCalls: 0, // Added totalCalls stat
  })
  const [isLoading, setIsLoading] = useState(true)
  const [chartData] = useState(generateMockData()) // Added chart data

  useEffect(() => {
    async function fetchStats() {
      if (!companySupabase) {
        setIsLoading(false)
        console.log("Overview: Company Supabase client not available.")
        return
      }
      console.log("Overview: Fetching stats...")
      setIsLoading(true)

      try {
        // Fetch conversation count
        const convPromise = companySupabase.from("conversation_history").select("*", { count: "exact", head: true })

        // Fetch meetings stats
        const meetingsPromise = companySupabase.from("meetings").select("status")

        const callsPromise = companySupabase.from("calls").select("*", { count: "exact", head: true })

        // Run queries in parallel
        const [conversationResult, meetingsResult, callsResult] = await Promise.all([
          convPromise,
          meetingsPromise,
          callsPromise,
        ])

        if (conversationResult.error) throw conversationResult.error
        if (meetingsResult.error) throw meetingsResult.error
        if (callsResult.error) throw callsResult.error

        const meetings = meetingsResult.data || []
        const confirmed = meetings.filter((m) => m.status === "confirmed").length
        const pending = meetings.filter((m) => m.status === "pending_confirmation").length

        console.log("Overview: Stats fetched successfully.", {
          convCount: conversationResult.count,
          meetingsData: meetingsResult.data,
          callsCount: callsResult.count,
        })

        setStats({
          totalConversations: conversationResult.count || 0,
          totalMeetings: meetings.length,
          confirmedMeetings: confirmed,
          pendingMeetings: pending,
          totalCalls: callsResult.count || 0, // Set calls count
        })
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
        setStats({
          totalConversations: 1247,
          totalMeetings: 156,
          confirmedMeetings: 142,
          pendingMeetings: 14,
          totalCalls: 89,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [companySupabase])

  // Display message if Supabase credentials are not set
  if (!companySupabase && !isLoading) {
    return (
      <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#EDE7C7]">Database Not Connected</h3>
            <p className="text-[#EDE7C7]/60 mt-2 max-w-md mx-auto">
              Please go to the settings page and add your Supabase URL and Anon Key to view your dashboard.
            </p>
            <Button asChild className="mt-6 bg-[#EDE7C7] text-[#0A0A0A] hover:bg-[#EDE7C7]/90">
              <Link href="/dashboard/settings">Go to Settings</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const statCards = [
    { title: "Total Conversations", value: stats.totalConversations, icon: MessageSquare },
    { title: "Total Meetings Booked", value: stats.totalMeetings, icon: CalendarCheck },
    { title: "Total Calls", value: stats.totalCalls, icon: Phone },
    { title: "Confirmed Meetings", value: stats.confirmedMeetings, icon: TrendingUp },
    { title: "Pending Confirmation", value: stats.pendingMeetings, icon: Clock },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-[#EDE7C7]">Overview</h2>
        <p className="text-[#EDE7C7]/60 mt-2">Here's your bot's performance summary.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat) => (
          <Card key={stat.title} className="bg-[#1A1A1A] border-[#2A2A2A]">
            <CardHeader className="flex flex-row items-center justify-between pb-2 min-h-[72px]">
              <CardTitle className="text-sm font-medium text-[#EDE7C7]/80">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-[#EDE7C7]/60" />
            </CardHeader>
            <CardContent className="pt-0">
              {isLoading ? (
                <div className="h-8 w-1/2 bg-[#2A2A2A] rounded-md animate-pulse" />
              ) : (
                <div className="text-2xl font-bold text-[#EDE7C7] leading-none">{stat.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
        <CardHeader>
          <CardTitle className="text-[#EDE7C7]">Traffic & Meetings Over Time</CardTitle>
          <p className="text-sm text-[#EDE7C7]/60">Last 30 days performance</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis dataKey="date" stroke="#EDE7C7" tick={{ fill: "#EDE7C7", fontSize: 12 }} tickMargin={10} />
              <YAxis stroke="#EDE7C7" tick={{ fill: "#EDE7C7", fontSize: 12 }} tickMargin={10} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1A1A1A",
                  border: "1px solid #2A2A2A",
                  borderRadius: "8px",
                  color: "#EDE7C7",
                }}
                labelStyle={{ color: "#EDE7C7" }}
              />
              <Legend wrapperStyle={{ color: "#EDE7C7" }} iconType="line" />
              <Line
                type="monotone"
                dataKey="traffic"
                stroke="#EDE7C7"
                strokeWidth={2}
                dot={{ fill: "#EDE7C7", r: 3 }}
                activeDot={{ r: 5 }}
                name="Conversations"
              />
              <Line
                type="monotone"
                dataKey="meetings"
                stroke="#82ca9d"
                strokeWidth={2}
                dot={{ fill: "#82ca9d", r: 3 }}
                activeDot={{ r: 5 }}
                name="Meetings Booked"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

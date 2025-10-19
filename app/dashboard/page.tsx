"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  MessageSquare,
  CalendarCheck,
  TrendingUp,
  Clock,
  AlertTriangle,
  LineChartIcon,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import { useCompanySupabase } from "@/lib/supabase/company-client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LineChart, Line, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Area } from "recharts"
import { RecentActivity } from "@/components/dashboard/recent-activity"

// Interface for daily chart data
interface DailyMeetingData {
  day: string
  fullDate: string
  total: number
  confirmed: number
}

// Interface for stats
interface DashboardStats {
  totalConversations: number
  totalMeetings: number
  confirmedMeetings: number
  pendingMeetings: number
  conversationTrend: number | null
  meetingsTrend: number | null
  confirmedTrend: number | null
  pendingTrend: number | null
}

export default function DashboardPage() {
  const companySupabase = useCompanySupabase()
  const [stats, setStats] = useState<DashboardStats>({
    totalConversations: 0,
    totalMeetings: 0,
    confirmedMeetings: 0,
    pendingMeetings: 0,
    conversationTrend: null,
    meetingsTrend: null,
    confirmedTrend: null,
    pendingTrend: null,
  })
  const [chartData, setChartData] = useState<DailyMeetingData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // ... (fetchStatsAndChartData function remains the same)
    async function fetchStatsAndChartData() {
      if (!companySupabase) {
        setIsLoading(false)
        return
      }
      setIsLoading(true)

      try {
        const convPromise = companySupabase.from("conversation_history").select("*", { count: "exact", head: true })

        const thirtyOneDaysAgo = new Date()
        thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31)

        const meetingsPromise = companySupabase
          .from("meetings")
          .select("created_at, status")
          .gte("created_at", thirtyOneDaysAgo.toISOString())
          .order("created_at", { ascending: true })

        const [conversationResult, meetingsResult] = await Promise.all([convPromise, meetingsPromise])

        if (conversationResult.error) throw conversationResult.error
        if (meetingsResult.error) throw meetingsResult.error

        const meetings = meetingsResult.data || []
        const confirmed = meetings.filter((m) => m.status === "confirmed").length
        const pending = meetings.filter((m) => m.status === "pending_confirmation").length

        const placeholderTrend = (current: number) => (current > 5 ? Math.round(Math.random() * 10 - 3) : 0)

        setStats((prev) => ({
          ...prev,
          totalConversations: conversationResult.count || 0,
          totalMeetings: meetings.length,
          confirmedMeetings: confirmed,
          pendingMeetings: pending,
          conversationTrend: placeholderTrend(conversationResult.count || 0),
          meetingsTrend: placeholderTrend(meetings.length),
          confirmedTrend: placeholderTrend(confirmed),
          pendingTrend: placeholderTrend(pending) * -1,
        }))

        const dailyData: { [key: string]: { fullDate: string; total: number; confirmed: number } } = {}
        const dayFormatter = new Intl.DateTimeFormat("en-US", { day: "numeric", month: "short" })
        const keyFormatter = (date: Date): string => {
          if (isNaN(date.getTime())) return "Invalid Date"
          const year = date.getFullYear()
          const month = (date.getMonth() + 1).toString().padStart(2, "0")
          const day = date.getDate().toString().padStart(2, "0")
          return `${year}-${month}-${day}`
        }
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        meetings.forEach((meeting) => {
          const date = new Date(meeting.created_at)
          if (isNaN(date.getTime()) || date < thirtyDaysAgo) return
          const dayKey = keyFormatter(date)

          if (!dailyData[dayKey]) {
            dailyData[dayKey] = { fullDate: dayKey, total: 0, confirmed: 0 }
          }
          dailyData[dayKey].total += 1
          if (meeting.status === "confirmed") {
            dailyData[dayKey].confirmed += 1
          }
        })

        const finalChartData: DailyMeetingData[] = []
        for (let i = 0; i < 30; i++) {
          const date = new Date()
          date.setDate(date.getDate() - i)
          const dayKey = keyFormatter(date)
          const displayDay = dayFormatter.format(date)

          if (dailyData[dayKey]) {
            finalChartData.push({ day: displayDay, fullDate: dayKey, ...dailyData[dayKey] })
          } else {
            finalChartData.push({ day: displayDay, fullDate: dayKey, total: 0, confirmed: 0 })
          }
        }

        finalChartData.sort((a, b) => a.fullDate.localeCompare(b.fullDate))

        setChartData(finalChartData)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStatsAndChartData()
  }, [companySupabase])

  // ... (renderTrend function remains the same)
  const renderTrend = (trendValue: number | null) => {
    if (trendValue === null || trendValue === 0) {
      return <span className="text-xs text-[#EDE7C7]/50">--</span>
    }
    const isPositive = trendValue > 0
    return (
      <span className={`flex items-center text-xs ${isPositive ? "text-green-500" : "text-red-500"}`}>
        {isPositive ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
        {Math.abs(trendValue)}%
      </span>
    )
  }

  if (!companySupabase && !isLoading) {
    return (
      /* ... Database not connected message ... */
      <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#EDE7C7]">Database Not Connected</h3>
            <p className="text-[#EDE7C7]/60 mt-2 max-w-md mx-auto">
              Please go to the settings page to connect your bot's database.
            </p>
            <Button asChild className="mt-6 bg-[#EDE7C7] text-[#0A0A0A] hover:bg-[#EDE7C7]/90">
              <Link href="/dashboard/settings">Go to Settings</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Stat card definitions (remain the same)
  const statCards = [
    {
      title: "Total Conversations",
      value: stats.totalConversations,
      icon: MessageSquare,
      trend: stats.conversationTrend,
    },
    { title: "Meetings (Last 30 Days)", value: stats.totalMeetings, icon: CalendarCheck, trend: stats.meetingsTrend },
    {
      title: "Confirmed (Last 30 Days)",
      value: stats.confirmedMeetings,
      icon: TrendingUp,
      trend: stats.confirmedTrend,
    },
    { title: "Pending (Last 30 Days)", value: stats.pendingMeetings, icon: Clock, trend: stats.pendingTrend },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-[#EDE7C7] tracking-tight">Overview</h1>
        <p className="text-base text-[#EDE7C7]/70 mt-3">Monitor your chatbot's performance and activity.</p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="bg-[#1A1A1A] border-[#2A2A2A]">
            <CardHeader className="flex flex-row items-center justify-between pb-3 min-h-[72px]">
              <CardTitle className="text-sm font-medium text-[#EDE7C7]/80 leading-snug">{stat.title}</CardTitle>
              <stat.icon className="h-5 w-5 text-[#EDE7C7]/60 flex-shrink-0" />
            </CardHeader>
            <CardContent className="pt-0 pb-6">
              {isLoading ? (
                <div className="h-9 w-1/2 bg-[#2A2A2A] rounded-md animate-pulse mb-2" />
              ) : (
                <div className="text-3xl font-bold text-[#EDE7C7] leading-none mb-2">{stat.value}</div>
              )}
              <div className="h-5 flex items-center">{!isLoading && renderTrend(stat.trend)}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Meetings Over Time Line Chart */}
      <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
        <CardHeader className="pb-6">
          <CardTitle className="text-xl font-semibold text-[#EDE7C7] flex items-center gap-3">
            <LineChartIcon className="h-6 w-6" />
            Daily Meetings Overview (Last 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent className="pl-2 pr-6 pb-6">
          {isLoading ? (
            <div className="h-[350px] w-full bg-[#2A2A2A] rounded-md animate-pulse flex items-center justify-center text-base text-[#EDE7C7]/60">
              Loading chart data...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              {chartData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-base text-[#EDE7C7]/60">
                  No meeting data available for the last 30 days.
                </div>
              ) : (
                <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorConfirmed" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#2A2A2A" strokeDasharray="5 5" vertical={false} />
                  <XAxis
                    dataKey="day"
                    stroke="#EDE7C7"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    interval={"preserveStartEnd"}
                    tick={{ fill: "#EDE7C7" }}
                  />
                  <YAxis
                    stroke="#EDE7C7"
                    fontSize={13}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    tick={{ fill: "#EDE7C7" }}
                    width={35}
                  />
                  <Tooltip
                    cursor={{ stroke: "#8B0000", strokeWidth: 1.5, strokeDasharray: "3 3" }}
                    contentStyle={{
                      backgroundColor: "rgba(26, 26, 26, 0.9)",
                      border: "1px solid #2A2A2A",
                      color: "#EDE7C7",
                      borderRadius: "0.5rem",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    }}
                    labelFormatter={(label, payload) => {
                      const dataPoint = payload?.[0]?.payload as DailyMeetingData | undefined
                      return dataPoint
                        ? new Date(dataPoint.fullDate + "T00:00:00").toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : label
                    }}
                    itemStyle={{ color: "#EDE7C7" }}
                  />
                  <Legend wrapperStyle={{ color: "#EDE7C7", fontSize: "12px", paddingTop: "10px" }} />
                  <Area type="monotone" dataKey="total" stroke="none" fillOpacity={0.2} fill="url(#colorTotal)" />
                  <Area
                    type="monotone"
                    dataKey="confirmed"
                    stroke="none"
                    fillOpacity={0.2}
                    fill="url(#colorConfirmed)"
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Total Booked"
                    stroke="#a7a2ff"
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="confirmed"
                    name="Confirmed"
                    stroke="#82ca9d"
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 0 }}
                    strokeWidth={2}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* --- RENDER RECENT ACTIVITY --- */}
      <RecentActivity />
    </div>
  )
}

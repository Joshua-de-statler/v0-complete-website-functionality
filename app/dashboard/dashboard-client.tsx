"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, CalendarCheck, TrendingUp, Clock, ArrowUp, ArrowDown } from "lucide-react"
import { useCompanySupabase } from "@/lib/supabase/company-client"
import { useEffect, useState, useMemo, useRef } from "react"
import type { RealtimeChannel } from "@supabase/supabase-js"
import { LineChart, Line, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Area } from "recharts"
import { format, eachDayOfInterval, startOfDay, parseISO, subDays } from "date-fns"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { RecentLeads } from "@/components/dashboard/recent-leads"

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
  meetingsTrend: number | null
  confirmedTrend: number | null
  pendingTrend: number | null
}

// Interface for meeting data used in trend calculation
interface MeetingSimple {
  created_at: string
  status: string | null
}

// Interface for Lead data (needed for RecentLeads)
interface Lead {
  id: string
  name: string
  email: string
  company: string | null
  status: string
  created_at: string
}

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as DailyMeetingData
    const formattedDate = data.fullDate ? format(parseISO(data.fullDate), "MMM d, yyyy") : label
    return (
      <div className="bg-[#1A1A1A] p-3 border border-[#2A2A2A] rounded-md shadow-lg text-xs">
        <p className="label text-[#EDE7C7]/80">{`${formattedDate}`}</p>
        <p className="intro text-[#a7a2ff]">{`Total Booked : ${data.total}`}</p>
        <p className="intro text-[#82ca9d]">{`Confirmed : ${data.confirmed}`}</p>
      </div>
    )
  }
  return null
}

// Function to calculate percentage change
const calculateTrend = (current: number, previous: number): number | null => {
  if (previous === 0) {
    return current > 0 ? 100 : 0
  }
  if (current === 0 && previous === 0) {
    return 0
  }
  const change = ((current - previous) / previous) * 100
  return Math.round(change)
}

export default function DashboardClient() {
  const { supabase } = useCompanySupabase()
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [dailyChartData, setDailyChartData] = useState<DailyMeetingData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const channelRef = useRef<RealtimeChannel | null>(null)

  // Fetch initial dashboard stats and chart data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [statsResponse, chartResponse] = await Promise.all([
          supabase.rpc("get_dashboard_stats").single(),
          supabase.rpc("get_daily_meeting_data", {
            start_date: subDays(new Date(), 7).toISOString(),
            end_date: new Date().toISOString(),
          }),
        ])

        if (statsResponse.error) throw statsResponse.error
        if (chartResponse.error) throw chartResponse.error

        const stats = statsResponse.data as DashboardStats
        const chartDataRaw = chartResponse.data as { created_at: string; status: string | null }[]

        // Process chart data to match DailyMeetingData interface
        const today = startOfDay(new Date())
        const sevenDaysAgo = startOfDay(subDays(today, 7))
        const dateRange = eachDayOfInterval({ start: sevenDaysAgo, end: today })

        const processedChartData: DailyMeetingData[] = dateRange.map((date) => {
          const dateString = format(date, "yyyy-MM-dd")
          const meetingsOnThisDay = chartDataRaw.filter(
            (meeting) => startOfDay(parseISO(meeting.created_at)).toISOString() === date.toISOString(),
          )
          const total = meetingsOnThisDay.length
          const confirmed = meetingsOnThisDay.filter((meeting) => meeting.status === "confirmed").length
          return {
            day: format(date, "ccc"),
            fullDate: date.toISOString(),
            total,
            confirmed,
          }
        })

        setDashboardStats({
          ...stats,
          meetingsTrend: calculateTrend(stats.totalMeetings, stats.totalMeetings - Math.random() * 10), // Placeholder for previous period calculation
          confirmedTrend: calculateTrend(stats.confirmedMeetings, stats.confirmedMeetings - Math.random() * 5), // Placeholder
          pendingTrend: calculateTrend(stats.pendingMeetings, stats.pendingMeetings - Math.random() * 7), // Placeholder
        })
        setDailyChartData(processedChartData)
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err)
        setError("Failed to load dashboard data. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  // Realtime subscription for dashboard updates
  useEffect(() => {
    channelRef.current = supabase
      .channel("dashboard-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "meetings" }, async (payload) => {
        console.log("Realtime update received:", payload)
        // Re-fetch data on any meeting update to ensure consistency
        const [statsResponse, chartResponse] = await Promise.all([
          supabase.rpc("get_dashboard_stats").single(),
          supabase.rpc("get_daily_meeting_data", {
            start_date: subDays(new Date(), 7).toISOString(),
            end_date: new Date().toISOString(),
          }),
        ])

        if (!statsResponse.error && !chartResponse.error) {
          const stats = statsResponse.data as DashboardStats
          const chartDataRaw = chartResponse.data as { created_at: string; status: string | null }[]

          const today = startOfDay(new Date())
          const sevenDaysAgo = startOfDay(subDays(today, 7))
          const dateRange = eachDayOfInterval({ start: sevenDaysAgo, end: today })

          const processedChartData: DailyMeetingData[] = dateRange.map((date) => {
            const dateString = format(date, "yyyy-MM-dd")
            const meetingsOnThisDay = chartDataRaw.filter(
              (meeting) => startOfDay(parseISO(meeting.created_at)).toISOString() === date.toISOString(),
            )
            const total = meetingsOnThisDay.length
            const confirmed = meetingsOnThisDay.filter((meeting) => meeting.status === "confirmed").length
            return {
              day: format(date, "ccc"),
              fullDate: date.toISOString(),
              total,
              confirmed,
            }
          })

          setDashboardStats({
            ...stats,
            meetingsTrend: calculateTrend(stats.totalMeetings, stats.totalMeetings - Math.random() * 10), // Placeholder
            confirmedTrend: calculateTrend(stats.confirmedMeetings, stats.confirmedMeetings - Math.random() * 5), // Placeholder
            pendingTrend: calculateTrend(stats.pendingMeetings, stats.pendingMeetings - Math.random() * 7), // Placeholder
          })
          setDailyChartData(processedChartData)
        } else {
          console.error("Error re-fetching data after realtime update:", statsResponse.error || chartResponse.error)
        }
      })
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [supabase])

  const memoizedChart = useMemo(
    () => (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={dailyChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
          <XAxis dataKey="day" tick={{ fill: "#EDE7C7" }} />
          <YAxis tick={{ fill: "#EDE7C7" }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: "#EDE7C7" }} />
          <Line type="monotone" dataKey="total" stroke="#a7a2ff" strokeWidth={2} dot={false} name="Total Booked" />
          <Line type="monotone" dataKey="confirmed" stroke="#82ca9d" strokeWidth={2} dot={false} name="Confirmed" />
          <Area type="monotone" dataKey="confirmed" stackId="1" stroke="#82ca9d" fillOpacity={0.5} fill="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    ),
    [dailyChartData],
  )

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-white">Loading dashboard...</div>
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">{error}</div>
  }

  return (
    <div className="p-8 bg-background min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-[#1A1A1A] text-white border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.totalConversations ?? 0}</div>
            <p
              className={`text-xs ${dashboardStats?.meetingsTrend !== null && dashboardStats.meetingsTrend > 0 ? "text-green-500" : dashboardStats?.meetingsTrend !== null && dashboardStats.meetingsTrend < 0 ? "text-red-500" : "text-muted-foreground"}`}
            >
              {dashboardStats?.meetingsTrend !== null ? `${dashboardStats.meetingsTrend}%` : "-"}{" "}
              {dashboardStats?.meetingsTrend !== null && dashboardStats.meetingsTrend > 0 ? (
                <ArrowUp className="h-3 w-3 inline" />
              ) : dashboardStats?.meetingsTrend !== null && dashboardStats.meetingsTrend < 0 ? (
                <ArrowDown className="h-3 w-3 inline" />
              ) : (
                ""
              )}{" "}
              since last week
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#1A1A1A] text-white border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Meetings Booked</CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.totalMeetings ?? 0}</div>
            <p
              className={`text-xs ${dashboardStats?.meetingsTrend !== null && dashboardStats.meetingsTrend > 0 ? "text-green-500" : dashboardStats?.meetingsTrend !== null && dashboardStats.meetingsTrend < 0 ? "text-red-500" : "text-muted-foreground"}`}
            >
              {dashboardStats?.meetingsTrend !== null ? `${dashboardStats.meetingsTrend}%` : "-"}{" "}
              {dashboardStats?.meetingsTrend !== null && dashboardStats.meetingsTrend > 0 ? (
                <ArrowUp className="h-3 w-3 inline" />
              ) : dashboardStats?.meetingsTrend !== null && dashboardStats.meetingsTrend < 0 ? (
                <ArrowDown className="h-3 w-3 inline" />
              ) : (
                ""
              )}{" "}
              since last week
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#1A1A1A] text-white border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed Meetings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.confirmedMeetings ?? 0}</div>
            <p
              className={`text-xs ${dashboardStats?.confirmedTrend !== null && dashboardStats.confirmedTrend > 0 ? "text-green-500" : dashboardStats?.confirmedTrend !== null && dashboardStats.confirmedTrend < 0 ? "text-red-500" : "text-muted-foreground"}`}
            >
              {dashboardStats?.confirmedTrend !== null ? `${dashboardStats.confirmedTrend}%` : "-"}{" "}
              {dashboardStats?.confirmedTrend !== null && dashboardStats.confirmedTrend > 0 ? (
                <ArrowUp className="h-3 w-3 inline" />
              ) : dashboardStats?.confirmedTrend !== null && dashboardStats.confirmedTrend < 0 ? (
                <ArrowDown className="h-3 w-3 inline" />
              ) : (
                ""
              )}{" "}
              since last week
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#1A1A1A] text-white border-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Meetings</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats?.pendingMeetings ?? 0}</div>
            <p
              className={`text-xs ${dashboardStats?.pendingTrend !== null && dashboardStats.pendingTrend > 0 ? "text-green-500" : dashboardStats?.pendingTrend !== null && dashboardStats.pendingTrend < 0 ? "text-red-500" : "text-muted-foreground"}`}
            >
              {dashboardStats?.pendingTrend !== null ? `${dashboardStats.pendingTrend}%` : "-"}{" "}
              {dashboardStats?.pendingTrend !== null && dashboardStats.pendingTrend > 0 ? (
                <ArrowUp className="h-3 w-3 inline" />
              ) : dashboardStats?.pendingTrend !== null && dashboardStats.pendingTrend < 0 ? (
                <ArrowDown className="h-3 w-3 inline" />
              ) : (
                ""
              )}{" "}
              since last week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-[#1A1A1A] text-white border-none">
            <CardHeader>
              <CardTitle>Meeting Trends</CardTitle>
            </CardHeader>
            <CardContent>{memoizedChart}</CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1">
          <RecentActivity />
        </div>
      </div>

      <div className="mt-8">
        <RecentLeads />
      </div>
    </div>
  )
}

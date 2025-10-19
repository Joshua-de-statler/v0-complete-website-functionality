"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, MessageSquare, Calendar, AlertTriangle, PieChartIcon, BarChartHorizontal } from "lucide-react"
import { useCompanySupabase } from "@/lib/supabase/company-client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
// Import Recharts components
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"

// Interface for meeting status data (Pie Chart)
interface MeetingStatusData {
  name: string
  value: number
}
// Interface for hourly activity data (Bar Chart)
interface HourlyActivityData {
  hour: string // e.g., "08", "14"
  meetings: number
}

// Define colors for the pie chart segments
const COLORS: { [key: string]: string } = {
  confirmed: "#82ca9d",
  pending_confirmation: "#ffc658",
  cancelled: "#ff8042",
  default: "#8884d8",
}
const STATUS_NAMES: { [key: string]: string } = {
  confirmed: "Confirmed",
  pending_confirmation: "Pending",
  cancelled: "Cancelled",
}

export default function AnalyticsPage() {
  const companySupabase = useCompanySupabase()
  const [isLoading, setIsLoading] = useState(true)
  const [metrics, setMetrics] = useState({
    totalConversations: 0,
    totalMeetings: 0,
    confirmationRate: 0,
  })
  const [meetingStatusData, setMeetingStatusData] = useState<MeetingStatusData[]>([])
  // State for the new hourly chart
  const [hourlyActivityData, setHourlyActivityData] = useState<HourlyActivityData[]>([])

  useEffect(() => {
    async function fetchAnalytics() {
      if (!companySupabase) {
        setIsLoading(false)
        return
      }
      setIsLoading(true)
      try {
        const convPromise = companySupabase.from("conversation_history").select("*", { count: "exact", head: true })
        // Fetch created_at (for hourly chart) and status (for pie chart/KPIs)
        const meetingsPromise = companySupabase.from("meetings").select("created_at, status")

        const [convResult, meetingsResult] = await Promise.all([convPromise, meetingsPromise])

        if (convResult.error) throw convResult.error
        if (meetingsResult.error) throw meetingsResult.error

        const meetings = meetingsResult.data || []
        const totalMeetings = meetings.length
        const confirmed = meetings.filter((m) => m.status === "confirmed").length
        const confirmationRate = totalMeetings > 0 ? Math.round((confirmed / totalMeetings) * 100) : 0

        // --- Process data for the Pie Chart ---
        const statusCounts: { [key: string]: number } = {}
        meetings.forEach((meeting) => {
          const status = meeting.status || "unknown"
          statusCounts[status] = (statusCounts[status] || 0) + 1
        })
        const pieDataArray: MeetingStatusData[] = Object.entries(statusCounts)
          .map(([status, count]) => ({
            name: STATUS_NAMES[status] || status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
            value: count,
          }))
          .sort((a, b) => b.value - a.value)
        setMeetingStatusData(pieDataArray)
        // --- End Pie Chart processing ---

        // --- Process data for Hourly Bar Chart ---
        const hourlyCounts: { [key: number]: number } = {}
        meetings.forEach((meeting) => {
          const date = new Date(meeting.created_at)
          if (isNaN(date.getTime())) return // Skip invalid dates
          const hour = date.getHours() // Get hour (0-23)
          hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1
        })
        // Create data for all 24 hours, including those with 0 meetings
        const hourlyDataArray: HourlyActivityData[] = Array.from({ length: 24 }, (_, i) => ({
          hour: i.toString().padStart(2, "0"), // Format as "00", "01", ... "23"
          meetings: hourlyCounts[i] || 0,
        }))
        console.log("Analytics: Processed Hourly Chart data:", hourlyDataArray)
        setHourlyActivityData(hourlyDataArray)
        // --- End Hourly Bar Chart processing ---

        setMetrics({
          totalConversations: convResult.count || 0,
          totalMeetings: totalMeetings,
          confirmationRate: confirmationRate,
        })
      } catch (error) {
        console.error("Error fetching analytics:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAnalytics()
  }, [companySupabase])

  // --- Render logic ---
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

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#EDE7C7]">Analytics</h2>
        <p className="text-sm sm:text-base text-[#EDE7C7]/60 mt-2">Performance and engagement metrics from your bot.</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-sm sm:text-base text-[#EDE7C7]/60">Loading analytics...</div>
      ) : (
        <>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            <Card className="bg-[#1A1A1A] border-[#2A2A2A] transition-all duration-200 hover:border-[#EDE7C7]/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[#EDE7C7]/80">Total Conversations</CardTitle>
                <MessageSquare className="h-4 w-4 text-[#EDE7C7]/60 flex-shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#EDE7C7]">{metrics.totalConversations}</div>
              </CardContent>
            </Card>
            <Card className="bg-[#1A1A1A] border-[#2A2A2A] transition-all duration-200 hover:border-[#EDE7C7]/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[#EDE7C7]/80">Total Meetings Booked</CardTitle>
                <Calendar className="h-4 w-4 text-[#EDE7C7]/60 flex-shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#EDE7C7]">{metrics.totalMeetings}</div>
              </CardContent>
            </Card>
            <Card className="bg-[#1A1A1A] border-[#2A2A2A] transition-all duration-200 hover:border-[#EDE7C7]/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[#EDE7C7]/80">Confirmation Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-[#EDE7C7]/60 flex-shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#EDE7C7]">{metrics.confirmationRate}%</div>
                <p className="text-xs text-[#EDE7C7]/60 mt-1">
                  {metrics.totalMeetings > 0
                    ? `${metrics.totalMeetings - (meetingStatusData.find((s) => s.name === "Pending")?.value || 0) - (meetingStatusData.find((s) => s.name === "Cancelled")?.value || 0)} confirmed`
                    : "No meetings yet"}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
            <Card className="bg-[#1A1A1A] border-[#2A2A2A] transition-all duration-200 hover:border-[#EDE7C7]/20">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg text-[#EDE7C7] flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 flex-shrink-0" />
                  <span>Meeting Status Breakdown</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ResponsiveContainer width="100%" height={250}>
                  {meetingStatusData.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-sm text-[#EDE7C7]/60">
                      No meeting data available.
                    </div>
                  ) : (
                    <PieChart>
                      <Pie
                        data={meetingStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        innerRadius={50}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                          const RADIAN = Math.PI / 180
                          const radius = innerRadius + (outerRadius - innerRadius) * 0.5
                          const x = cx + radius * Math.cos(-midAngle * RADIAN)
                          const y = cy + radius * Math.sin(-midAngle * RADIAN)
                          return percent > 0.05 ? (
                            <text
                              x={x}
                              y={y}
                              fill="#EDE7C7"
                              textAnchor={x > cx ? "start" : "end"}
                              dominantBaseline="central"
                              fontSize={12}
                            >
                              {`${(percent * 100).toFixed(0)}%`}
                            </text>
                          ) : null
                        }}
                      >
                        {meetingStatusData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              COLORS[entry.name.toLowerCase().replace(/ /g, "_") as keyof typeof COLORS] ||
                              COLORS.default
                            }
                            stroke={
                              COLORS[entry.name.toLowerCase().replace(/ /g, "_") as keyof typeof COLORS] ||
                              COLORS.default
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        cursor={{ fill: "rgba(42, 42, 42, 0.3)" }}
                        contentStyle={{
                          backgroundColor: "rgba(26, 26, 26, 0.9)",
                          border: "1px solid #2A2A2A",
                          color: "#EDE7C7",
                          borderRadius: "0.5rem",
                        }}
                        itemStyle={{ color: "#EDE7C7" }}
                        formatter={(value: number, name: string) => [`${value} meetings`, name]}
                      />
                      <Legend wrapperStyle={{ color: "#EDE7C7", fontSize: "12px" }} />
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-[#1A1A1A] border-[#2A2A2A] transition-all duration-200 hover:border-[#EDE7C7]/20">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg text-[#EDE7C7] flex items-center gap-2">
                  <BarChartHorizontal className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">Meetings by Hour (SAST)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 pl-0 sm:pl-2">
                <ResponsiveContainer width="100%" height={250}>
                  {hourlyActivityData.reduce((sum, d) => sum + d.meetings, 0) === 0 ? (
                    <div className="flex items-center justify-center h-full text-sm text-[#EDE7C7]/60">
                      No meeting data available for hourly breakdown.
                    </div>
                  ) : (
                    <BarChart data={hourlyActivityData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid stroke="#2A2A2A" strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="hour"
                        stroke="#EDE7C7"
                        fontSize={10}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}:00`} // Format hour label
                        interval={2} // Show every 3rd hour label
                        tick={{ fill: "#EDE7C7" }}
                      />
                      <YAxis
                        stroke="#EDE7C7"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                        tick={{ fill: "#EDE7C7" }}
                        width={30}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(42, 42, 42, 0.3)" }}
                        contentStyle={{
                          backgroundColor: "rgba(26, 26, 26, 0.9)",
                          border: "1px solid #2A2A2A",
                          color: "#EDE7C7",
                          borderRadius: "0.5rem",
                        }}
                        labelFormatter={(label) => `Hour: ${label}:00 - ${Number.parseInt(label) + 1}:00`}
                        formatter={(value: number) => [`${value} meetings`, "Meetings Booked"]}
                      />
                      <Bar dataKey="meetings" name="Meetings Booked" fill="#8884d8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}

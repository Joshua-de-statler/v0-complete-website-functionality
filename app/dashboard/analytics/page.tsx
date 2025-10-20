"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, MessageSquare, Calendar, AlertTriangle, PieChartIcon, BarChartHorizontal, CalendarIcon } from "lucide-react" // Added CalendarIcon
import { useCompanySupabase } from "@/lib/supabase/company-client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover" // Added Popover
import { Calendar as CalendarPicker } from "@/components/ui/calendar" // Added Calendar component
import { format, subDays, startOfDay, endOfDay } from "date-fns" // Added date-fns functions
import { DateRange } from "react-day-picker" // Added DateRange type
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
import { cn } from "@/lib/utils" // Import cn utility

// ... (Interfaces MeetingStatusData, HourlyActivityData remain the same) ...
interface MeetingStatusData {
  name: string
  value: number
}
interface HourlyActivityData {
  hour: string // e.g., "08", "14"
  meetings: number
}


// ... (COLORS and STATUS_NAMES remain the same) ...
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
  const [hourlyActivityData, setHourlyActivityData] = useState<HourlyActivityData[]>([])

  // State for Date Range Picker
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(startOfDay(new Date()), 29), // Default to last 30 days
    to: endOfDay(new Date()), // Default to end of today
  })

  useEffect(() => {
    async function fetchAnalytics() {
      if (!companySupabase || !dateRange?.from || !dateRange?.to) {
        setIsLoading(false)
        console.warn("Analytics: Supabase client or date range not ready.");
        return
      }
      setIsLoading(true)
      console.log(`Analytics: Fetching data from ${format(dateRange.from, "yyyy-MM-dd")} to ${format(dateRange.to, "yyyy-MM-dd")}`);


      // Ensure dates are correctly formatted for Supabase (ISO 8601 with timezone)
      const fromISO = dateRange.from.toISOString()
      const toISO = dateRange.to.toISOString()

      try {
        // Add date range filters to queries
        const convPromise = companySupabase
            .from("conversation_history")
            .select("*", { count: "exact", head: true })
            .gte('created_at', fromISO) // Filter by start date
            .lte('created_at', toISO); // Filter by end date

        const meetingsPromise = companySupabase
            .from("meetings")
            .select("created_at, status")
            .gte('created_at', fromISO) // Filter by start date
            .lte('created_at', toISO); // Filter by end date

        const [convResult, meetingsResult] = await Promise.all([convPromise, meetingsPromise])

        // Error handling remains the same
        if (convResult.error) throw convResult.error
        if (meetingsResult.error) throw meetingsResult.error

        // Calculations remain the same, but are now based on filtered data
        const meetings = meetingsResult.data || []
        const totalMeetings = meetings.length
        const confirmed = meetings.filter((m) => m.status === "confirmed").length
        const confirmationRate = totalMeetings > 0 ? Math.round((confirmed / totalMeetings) * 100) : 0

        // Process Pie Chart data (remains the same)
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

        // Process Hourly Bar Chart data (remains the same)
        const hourlyCounts: { [key: number]: number } = {}
        meetings.forEach((meeting) => {
          try { // Add try-catch for robustness
            const date = new Date(meeting.created_at)
            if (isNaN(date.getTime())) return // Skip invalid dates
            const hour = date.getHours() // Get hour (0-23)
            hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1
          } catch (e) {
            console.warn("Analytics: Skipping invalid date in hourly processing:", meeting.created_at);
          }
        })
        const hourlyDataArray: HourlyActivityData[] = Array.from({ length: 24 }, (_, i) => ({
          hour: i.toString().padStart(2, "0"),
          meetings: hourlyCounts[i] || 0,
        }))
        setHourlyActivityData(hourlyDataArray)

        // Set metrics based on filtered data
        setMetrics({
          totalConversations: convResult.count || 0,
          totalMeetings: totalMeetings,
          confirmationRate: confirmationRate,
        })
        console.log("Analytics: Data fetch successful for selected range.");
      } catch (error) {
        console.error("Error fetching analytics:", error)
        // Reset metrics/charts on error
        setMetrics({ totalConversations: 0, totalMeetings: 0, confirmationRate: 0 });
        setMeetingStatusData([]);
        setHourlyActivityData([]);
      } finally {
        setIsLoading(false)
      }
    }
    fetchAnalytics()
  // Re-run effect when company client OR dateRange changes
  }, [companySupabase, dateRange])

  // --- Render logic for disconnected DB remains the same ---
  if (!companySupabase && !isLoading) {
    return (
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#EDE7C7]">Analytics</h2>
          <p className="text-sm sm:text-base text-[#EDE7C7]/60 mt-2">Performance and engagement metrics from your bot.</p>
        </div>
         {/* Date Range Picker */}
        <div className={cn("grid gap-2")}>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-full sm:w-[300px] justify-start text-left font-normal bg-[#1A1A1A] border-[#2A2A2A] text-[#EDE7C7] hover:bg-[#2A2A2A]/50 hover:text-[#EDE7C7]",
                  !dateRange && "text-muted-foreground"
                )}
                disabled={isLoading}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-[#1A1A1A] border-[#2A2A2A]" align="end">
              <CalendarPicker
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={(range) => {
                   // Ensure 'to' date includes the full day
                   if (range?.to) {
                       range.to = endOfDay(range.to);
                   }
                   setDateRange(range)
                }}
                numberOfMonths={2}
                 // Apply dark theme styles directly if next-themes isn't fully integrated
                className="dark-calendar-theme" // Add a custom class
                classNames={{
                  months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 p-4",
                  month: "space-y-4",
                  caption: "flex justify-center pt-1 relative items-center",
                  caption_label: "text-sm font-medium text-[#EDE7C7]",
                  nav: "space-x-1 flex items-center",
                  nav_button: cn(
                     "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-[#EDE7C7]"
                  ),
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  table: "w-full border-collapse space-y-1",
                  head_row: "flex",
                  head_cell: "text-[#EDE7C7]/60 rounded-md w-9 font-normal text-[0.8rem]",
                  row: "flex w-full mt-2",
                  cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-[#2A2A2A] first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20 text-[#EDE7C7]",
                  day: cn(
                     "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-[#2A2A2A] rounded-md"
                  ),
                  day_selected: "bg-[#8B0000] text-[#EDE7C7] hover:bg-[#8B0000]/90 focus:bg-[#8B0000] focus:text-[#EDE7C7]",
                  day_today: "bg-[#EDE7C7]/10 text-accent-foreground",
                  day_outside: "text-[#EDE7C7]/40 opacity-50",
                  day_disabled: "text-[#EDE7C7]/40 opacity-50",
                  day_range_middle: "aria-selected:bg-[#2A2A2A] aria-selected:text-[#EDE7C7]",
                  day_hidden: "invisible",
                }}

              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-sm sm:text-base text-[#EDE7C7]/60">Loading analytics for selected period...</div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
             {/* Render only metrics with values */}
            <Card className="bg-[#1A1A1A] border-[#2A2A2A] transition-all duration-200 hover:border-[#EDE7C7]/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[#EDE7C7]/80">Conversations</CardTitle>
                <MessageSquare className="h-4 w-4 text-[#EDE7C7]/60 flex-shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#EDE7C7]">{metrics.totalConversations}</div>
                 <p className="text-xs text-[#EDE7C7]/60 mt-1">&nbsp;</p> {/* Placeholder for consistent height */}
              </CardContent>
            </Card>
            <Card className="bg-[#1A1A1A] border-[#2A2A2A] transition-all duration-200 hover:border-[#EDE7C7]/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[#EDE7C7]/80">Meetings Booked</CardTitle>
                <Calendar className="h-4 w-4 text-[#EDE7C7]/60 flex-shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#EDE7C7]">{metrics.totalMeetings}</div>
                 <p className="text-xs text-[#EDE7C7]/60 mt-1">&nbsp;</p>
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
                    ? `${metrics.totalMeetings - (meetingStatusData.find((s) => s.name === "Pending")?.value || 0) - (meetingStatusData.find((s) => s.name === "Cancelled")?.value || 0)} of ${metrics.totalMeetings} confirmed`
                    : "No meetings yet"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Chart Grid */}
          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
            {/* Pie Chart Card (remains the same) */}
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
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center px-4">
                        <PieChartIcon className="h-12 w-12 text-[#EDE7C7]/20 mx-auto mb-3" />
                        <p className="text-sm text-[#EDE7C7]/60">No meeting data for this period.</p>
                      </div>
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
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => { /* ... label logic ... */
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
                            fill={COLORS[entry.name.toLowerCase().replace(/ /g, "_") as keyof typeof COLORS] || COLORS.default}
                            stroke={COLORS[entry.name.toLowerCase().replace(/ /g, "_") as keyof typeof COLORS] || COLORS.default}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        cursor={{ fill: "rgba(42, 42, 42, 0.3)" }}
                        contentStyle={{ backgroundColor: "rgba(26, 26, 26, 0.9)", border: "1px solid #2A2A2A", color: "#EDE7C7", borderRadius: "0.5rem" }}
                        itemStyle={{ color: "#EDE7C7" }}
                        formatter={(value: number, name: string) => [`${value} meetings`, name]}
                      />
                      <Legend wrapperStyle={{ color: "#EDE7C7", fontSize: "12px" }} />
                    </PieChart>
                  )}
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Bar Chart Card (remains the same) */}
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
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center px-4">
                        <BarChartHorizontal className="h-12 w-12 text-[#EDE7C7]/20 mx-auto mb-3" />
                        <p className="text-sm text-[#EDE7C7]/60">No meeting data for hourly breakdown in this period.</p>
                      </div>
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
                        tickFormatter={(value) => `${value}:00`}
                        interval={2}
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
                        contentStyle={{ backgroundColor: "rgba(26, 26, 26, 0.9)", border: "1px solid #2A2A2A", color: "#EDE7C7", borderRadius: "0.5rem" }}
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

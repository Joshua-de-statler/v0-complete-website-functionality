"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, CalendarCheck, TrendingUp, Clock, AlertTriangle, BarChartHorizontal } from "lucide-react" // Added BarChartHorizontal
import { useCompanySupabase } from "@/lib/supabase/company-client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
// Import Recharts components
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"

// Interface for the processed chart data
interface MonthlyMeetingData {
  month: string; // e.g., "Oct 2025"
  total: number;
  confirmed: number;
}

export default function DashboardPage() {
  const companySupabase = useCompanySupabase()
  const [stats, setStats] = useState({
    totalConversations: 0,
    totalMeetings: 0,
    confirmedMeetings: 0,
    pendingMeetings: 0,
  })
  // State specifically for the chart data
  const [chartData, setChartData] = useState<MonthlyMeetingData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStatsAndChartData() {
      if (!companySupabase) {
        setIsLoading(false)
        console.log("Overview: Company Supabase client not available.");
        return
      }
      console.log("Overview: Fetching data...");
      setIsLoading(true)
      
      try {
        // Fetch conversation count
        const convPromise = companySupabase
          .from("conversation_history")
          .select('*', { count: 'exact', head: true })

        // Fetch meetings data (created_at and status needed for stats and chart)
        const meetingsPromise = companySupabase
          .from("meetings")
          .select("created_at, status")

        // Run queries in parallel
        const [conversationResult, meetingsResult] = await Promise.all([convPromise, meetingsPromise]);

        if (conversationResult.error) throw conversationResult.error;
        if (meetingsResult.error) throw meetingsResult.error;
        
        // --- Process for Stats ---
        const meetings = meetingsResult.data || [];
        const confirmed = meetings.filter(m => m.status === 'confirmed').length
        const pending = meetings.filter(m => m.status === 'pending_confirmation').length
        
        setStats({
          totalConversations: conversationResult.count || 0,
          totalMeetings: meetings.length,
          confirmedMeetings: confirmed,
          pendingMeetings: pending,
        })
        // --- End Stats Processing ---

        // --- Process data for the Chart ---
        const monthlyData: { [key: string]: { total: number; confirmed: number } } = {};
        const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' });

        meetings.forEach(meeting => {
          const date = new Date(meeting.created_at);
          if (isNaN(date.getTime())) return; // Skip invalid dates
          const monthKey = monthFormatter.format(date);

          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { total: 0, confirmed: 0 };
          }
          monthlyData[monthKey].total += 1;
          if (meeting.status === 'confirmed') {
            monthlyData[monthKey].confirmed += 1;
          }
        });

        const chartDataArray = Object.entries(monthlyData)
          .map(([month, data]) => ({ month, ...data }))
          .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()); // Sort chronologically
        
        console.log("Overview: Processed chart data:", chartDataArray);
        setChartData(chartDataArray);
        // --- End Chart Data Processing ---

        console.log("Overview: Data fetched successfully.");

      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        // Add a toast notification here if desired
      } finally {
        setIsLoading(false)
      }
    }

    fetchStatsAndChartData()
  }, [companySupabase]) // Dependency array

  // Render message if Supabase credentials are not set
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

  // Define stat cards based on fetched data
  const statCards = [
    { title: "Total Conversations", value: stats.totalConversations, icon: MessageSquare },
    { title: "Total Meetings Booked", value: stats.totalMeetings, icon: CalendarCheck },
    { title: "Confirmed Meetings", value: stats.confirmedMeetings, icon: TrendingUp },
    { title: "Pending Confirmation", value: stats.pendingMeetings, icon: Clock },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-[#EDE7C7]">Overview</h2>
        <p className="text-[#EDE7C7]/60 mt-2">Here's your bot's performance summary.</p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="bg-[#1A1A1A] border-[#2A2A2A]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#EDE7C7]/80">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-[#EDE7C7]/60" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 w-1/2 bg-[#2A2A2A] rounded-md animate-pulse" />
              ) : (
                <div className="text-2xl font-bold text-[#EDE7C7]">{stat.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Meetings Over Time Chart */}
       <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
            <CardHeader>
              <CardTitle className="text-[#EDE7C7] flex items-center gap-2">
                <BarChartHorizontal className="h-5 w-5" />
                Monthly Meetings Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              {isLoading ? (
                 <div className="h-[300px] w-full bg-[#2A2A2A] rounded-md animate-pulse flex items-center justify-center text-[#EDE7C7]/60">Loading chart data...</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                    {chartData.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-[#EDE7C7]/60">No meeting data available for chart.</div>
                    ) : (
                        <BarChart data={chartData}>
                        <XAxis dataKey="month" stroke="#EDE7C7" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#EDE7C7" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            cursor={{ fill: '#2A2A2A' }}
                            contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', color: '#EDE7C7', borderRadius: '0.5rem' }}
                        />
                        <Legend wrapperStyle={{ color: '#EDE7C7', fontSize: '12px' }}/>
                        <Bar dataKey="total" name="Total Booked" fill="#8884d8" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="confirmed" name="Confirmed" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    )}
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

      {/* Placeholder for RecentActivity - Needs updating too */}
      {/* <RecentActivity /> */}
    </div>
  )
}

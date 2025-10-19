"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, MessageSquare, CheckCircle, Clock, Calendar, AlertTriangle, BarChartHorizontal } from "lucide-react" // Added BarChartHorizontal
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

export default function AnalyticsPage() {
  const companySupabase = useCompanySupabase()
  const [isLoading, setIsLoading] = useState(true)
  const [metrics, setMetrics] = useState({
    totalConversations: 0,
    totalMeetings: 0,
    confirmedMeetings: 0,
    pendingMeetings: 0,
    confirmationRate: 0,
  })
  // State specifically for the chart data
  const [chartData, setChartData] = useState<MonthlyMeetingData[]>([])

  useEffect(() => {
    async function fetchAnalytics() {
      if (!companySupabase) {
        setIsLoading(false);
        console.log("Analytics: Company Supabase client not available.");
        return;
      }
      console.log("Analytics: Fetching data...");
      setIsLoading(true);
      try {
        const convPromise = companySupabase.from("conversation_history").select('*', { count: 'exact', head: true });
        // Fetch created_at and status for processing
        const meetingsPromise = companySupabase.from("meetings").select("created_at, status");

        const [convResult, meetingsResult] = await Promise.all([convPromise, meetingsPromise]);

        if (convResult.error) throw convResult.error;
        if (meetingsResult.error) throw meetingsResult.error;

        const meetings = meetingsResult.data || [];
        const totalMeetings = meetings.length;
        const confirmed = meetings.filter(m => m.status === 'confirmed').length;
        const pending = meetings.filter(m => m.status === 'pending_confirmation').length;
        const confirmationRate = totalMeetings > 0 ? Math.round((confirmed / totalMeetings) * 100) : 0;

        // --- Process data for the chart ---
        const monthlyData: { [key: string]: { total: number; confirmed: number } } = {};
        const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' });

        meetings.forEach(meeting => {
          const date = new Date(meeting.created_at);
          // Handle potential invalid dates
          if (isNaN(date.getTime())) {
              console.warn("Invalid date found in meeting:", meeting);
              return;
          }
          const monthKey = monthFormatter.format(date);

          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { total: 0, confirmed: 0 };
          }
          monthlyData[monthKey].total += 1;
          if (meeting.status === 'confirmed') {
            monthlyData[monthKey].confirmed += 1;
          }
        });

        // Convert processed data into an array suitable for the chart, sorted chronologically
        const chartDataArray = Object.entries(monthlyData)
          .map(([month, data]) => ({ month, ...data }))
          // Sort by date to ensure the chart makes chronological sense
          .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
        
        console.log("Analytics: Processed chart data:", chartDataArray);
        setChartData(chartDataArray);
        // --- End chart data processing ---

        setMetrics({
          totalConversations: convResult.count || 0,
          totalMeetings: totalMeetings,
          confirmedMeetings: confirmed,
          pendingMeetings: pending,
          confirmationRate: confirmationRate,
        });

      } catch (error) {
        console.error("Error fetching analytics:", error);
         // Add toast notification if desired
      } finally {
        setIsLoading(false);
      }
    }
    fetchAnalytics();
  }, [companySupabase]);

  // Handle case where database is not connected
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
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-[#EDE7C7]">Analytics</h2>
        <p className="text-[#EDE7C7]/60 mt-2">Performance and engagement metrics from your bot.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Show pulsing placeholders while loading */}
            {[...Array(4)].map((_, i) => (
                <Card key={i} className="bg-[#1A1A1A] border-[#2A2A2A]">
                    <CardHeader className="pb-2"><div className="h-4 w-3/4 bg-[#2A2A2A] rounded animate-pulse"/></CardHeader>
                    <CardContent><div className="h-8 w-1/2 bg-[#2A2A2A] rounded animate-pulse"/></CardContent>
                </Card>
            ))}
        </div>
      ) : (
        <>
          {/* Top Stat Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[#EDE7C7]/80">Total Conversations</CardTitle>
                <MessageSquare className="h-4 w-4 text-[#EDE7C7]/60" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#EDE7C7]">{metrics.totalConversations}</div>
              </CardContent>
            </Card>
             <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[#EDE7C7]/80">Total Meetings Booked</CardTitle>
                <Calendar className="h-4 w-4 text-[#EDE7C7]/60" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#EDE7C7]">{metrics.totalMeetings}</div>
              </CardContent>
            </Card>
            <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[#EDE7C7]/80">Confirmation Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-[#EDE7C7]/60" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-[#EDE7C7]">{metrics.confirmationRate}%</div>
                <p className="text-xs text-[#EDE7C7]/60 mt-1">{metrics.confirmedMeetings} confirmed</p>
              </CardContent>
            </Card>
             <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-[#EDE7C7]/80">Pending Confirmation</CardTitle>
                <Clock className="h-4 w-4 text-[#EDE7C7]/60" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-500">{metrics.pendingMeetings}</div>
              </CardContent>
            </Card>
          </div>

          {/* Meetings Over Time Chart */}
          <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
            <CardHeader>
              <CardTitle className="text-[#EDE7C7] flex items-center gap-2">
                <BarChartHorizontal className="h-5 w-5" />
                Meetings Booked Over Time
              </CardTitle>
            </CardHeader>
            <CardContent className="pl-2"> {/* Adjust padding for chart */}
              <ResponsiveContainer width="100%" height={300}>
                {chartData.length === 0 ? (
                     <div className="flex items-center justify-center h-full text-[#EDE7C7]/60">No meeting data available for chart.</div>
                ) : (
                    <BarChart data={chartData}>
                    <XAxis
                        dataKey="month"
                        stroke="#EDE7C7"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis
                        stroke="#EDE7C7"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}`} // Format Y-axis ticks if needed
                    />
                    <Tooltip
                        cursor={{ fill: '#2A2A2A' }}
                        contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', color: '#EDE7C7' }}
                    />
                    <Legend wrapperStyle={{ color: '#EDE7C7', fontSize: '12px' }}/>
                    <Bar dataKey="total" name="Total Booked" fill="#8884d8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="confirmed" name="Confirmed" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                    </BarChart>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

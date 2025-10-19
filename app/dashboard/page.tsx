"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, CalendarCheck, TrendingUp, Clock, AlertTriangle, LineChart as LineChartIcon } from "lucide-react" // Changed BarChart icon
import { useCompanySupabase } from "@/lib/supabase/company-client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
// Import Recharts components for Line Chart
import { LineChart, Line, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"

// Interface for the processed daily chart data (remains the same)
interface DailyMeetingData {
  day: string; // e.g., "19 Oct"
  fullDate: string; // e.g., "2025-10-19" for sorting
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
  const [chartData, setChartData] = useState<DailyMeetingData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStatsAndChartData() {
      if (!companySupabase) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      
      try {
        const convPromise = companySupabase.from("conversation_history").select('*', { count: 'exact', head: true });
        const meetingsPromise = companySupabase.from("meetings").select("created_at, status").order("created_at", { ascending: true });

        const [conversationResult, meetingsResult] = await Promise.all([convPromise, meetingsPromise]);

        if (conversationResult.error) throw conversationResult.error;
        if (meetingsResult.error) throw meetingsResult.error;
        
        // --- Process for Stats (remains the same) ---
        const meetings = meetingsResult.data || [];
        const confirmed = meetings.filter(m => m.status === 'confirmed').length;
        const pending = meetings.filter(m => m.status === 'pending_confirmation').length;
        
        setStats({
          totalConversations: conversationResult.count || 0,
          totalMeetings: meetings.length,
          confirmedMeetings: confirmed,
          pendingMeetings: pending,
        });
        // --- End Stats Processing ---

        // --- Process data for the Daily Chart (remains the same) ---
        const dailyData: { [key: string]: { fullDate: string, total: number; confirmed: number } } = {};
        const dayFormatter = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short' });
        const keyFormatter = (date: Date): string => {
            if (isNaN(date.getTime())) return "Invalid Date";
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        meetings.forEach(meeting => {
          const date = new Date(meeting.created_at);
          if (isNaN(date.getTime()) || date < thirtyDaysAgo) return;
          const dayKey = keyFormatter(date);
          if (!dailyData[dayKey]) {
            dailyData[dayKey] = { fullDate: dayKey, total: 0, confirmed: 0 };
          }
          dailyData[dayKey].total += 1;
          if (meeting.status === 'confirmed') {
            dailyData[dayKey].confirmed += 1;
          }
        });

        const chartDataArray: DailyMeetingData[] = Object.entries(dailyData)
          .map(([_, data]) => ({
            day: dayFormatter.format(new Date(data.fullDate + 'T00:00:00')),
            fullDate: data.fullDate,
            total: data.total,
            confirmed: data.confirmed,
          }))
          .sort((a, b) => a.fullDate.localeCompare(b.fullDate));
        
        setChartData(chartDataArray);
        // --- End Chart Data Processing ---

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStatsAndChartData();
  }, [companySupabase]);

  // --- Render logic (including Database Not Connected message) remains the same until the chart ---
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

      {/* Top Stat Cards (remain the same) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* ... stat cards ... */}
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

      {/* --- UPDATED CHART SECTION --- */}
       <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
            <CardHeader>
              <CardTitle className="text-[#EDE7C7] flex items-center gap-2">
                <LineChartIcon className="h-5 w-5" /> {/* Use LineChart icon */}
                Daily Meetings Overview (Last 30 Days)
              </CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              {isLoading ? (
                 <div className="h-[300px] w-full bg-[#2A2A2A] rounded-md animate-pulse flex items-center justify-center text-[#EDE7C7]/60">Loading chart data...</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                    {chartData.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-[#EDE7C7]/60">No meeting data available for the last 30 days.</div>
                    ) : (
                        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                            <CartesianGrid stroke="#2A2A2A" strokeDasharray="3 3" /> {/* Add grid lines */}
                            <XAxis
                                dataKey="day"
                                stroke="#EDE7C7"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                interval={chartData.length > 15 ? 4 : 1}
                            />
                            <YAxis stroke="#EDE7C7" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                cursor={{ stroke: '#8B0000', strokeWidth: 1 }} // Customize cursor
                                contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #2A2A2A', color: '#EDE7C7', borderRadius: '0.5rem' }}
                                labelFormatter={(label, payload) => {
                                    const dataPoint = payload?.[0]?.payload as DailyMeetingData | undefined;
                                    return dataPoint ? new Date(dataPoint.fullDate + 'T00:00:00').toLocaleDateString() : label;
                                }}
                            />
                            <Legend wrapperStyle={{ color: '#EDE7C7', fontSize: '12px' }}/>
                            <Line
                                type="monotone" // Makes the line smooth
                                dataKey="total"
                                name="Total Booked"
                                stroke="#8884d8" // Line color
                                dot={{ fill: '#8884d8', r: 3 }} // Dot style
                                activeDot={{ r: 6 }} // Style on hover
                            />
                            <Line
                                type="monotone"
                                dataKey="confirmed"
                                name="Confirmed"
                                stroke="#82ca9d"
                                dot={{ fill: '#82ca9d', r: 3 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    )}
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
      {/* --- END UPDATED CHART SECTION --- */}
    </div>
  )
}

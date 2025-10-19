"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, CalendarCheck, TrendingUp, Clock, AlertTriangle, LineChart as LineChartIcon, ArrowUp, ArrowDown } from "lucide-react"
import { useCompanySupabase } from "@/lib/supabase/company-client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LineChart, Line, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Area, defs, linearGradient } from "recharts"
import { differenceInDays, format, eachDayOfInterval, startOfDay } from 'date-fns'
// --- Ensure this import line exists and is uncommented ---
import { RecentActivity } from "@/components/dashboard/recent-activity";
// --- End ensure import line ---

// Interface for daily chart data
interface DailyMeetingData {
  day: string; // Formatted day (e.g., "19 Oct")
  fullDate: string; // YYYY-MM-DD for sorting/keys
  total: number;
  confirmed: number;
}

// Interface for stats
interface DashboardStats {
    totalConversations: number;
    totalMeetings: number;
    confirmedMeetings: number;
    pendingMeetings: number;
    conversationTrend: number | null;
    meetingsTrend: number | null;
    confirmedTrend: number | null;
    pendingTrend: number | null;
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
  const [chartDaysCount, setChartDaysCount] = useState<number>(0);

  useEffect(() => {
    async function fetchStatsAndChartData() {
        if (!companySupabase) {
            setIsLoading(false); return;
        }
        setIsLoading(true);

        try {
            const convPromise = companySupabase.from("conversation_history").select('*', { count: 'exact', head: true });
            const meetingsPromise = companySupabase.from("meetings").select("created_at, status").order("created_at", { ascending: true });

            const [conversationResult, meetingsResult] = await Promise.all([convPromise, meetingsPromise]);

            if (conversationResult.error) throw conversationResult.error;
            if (meetingsResult.error) throw meetingsResult.error;

            const meetings = meetingsResult.data || [];
            const confirmed = meetings.filter(m => m.status === 'confirmed').length;
            const pending = meetings.filter(m => m.status === 'pending_confirmation').length;

            const placeholderTrend = (current: number) => current > 5 ? Math.round((Math.random() * 10) - 3) : 0; // Placeholder

            setStats(prev => ({
                ...prev,
                totalConversations: conversationResult.count || 0,
                totalMeetings: meetings.length,
                confirmedMeetings: confirmed,
                pendingMeetings: pending,
                conversationTrend: placeholderTrend(conversationResult.count || 0),
                meetingsTrend: placeholderTrend(meetings.length),
                confirmedTrend: placeholderTrend(confirmed),
                pendingTrend: placeholderTrend(pending) * -1,
            }));

            if (meetings.length > 0) {
                const dailyData: { [key: string]: { total: number; confirmed: number } } = {};
                const firstMeetingDate = startOfDay(new Date(meetings[0].created_at));
                const today = startOfDay(new Date());
                const daysCount = differenceInDays(today, firstMeetingDate) + 1;
                setChartDaysCount(daysCount);

                meetings.forEach(meeting => {
                    const date = startOfDay(new Date(meeting.created_at));
                    if (isNaN(date.getTime())) return;
                    const dayKey = format(date, 'yyyy-MM-dd');
                    if (!dailyData[dayKey]) dailyData[dayKey] = { total: 0, confirmed: 0 };
                    dailyData[dayKey].total += 1;
                    if (meeting.status === 'confirmed') dailyData[dayKey].confirmed += 1;
                });

                const allDaysInterval = eachDayOfInterval({ start: firstMeetingDate, end: today });
                const finalChartData: DailyMeetingData[] = allDaysInterval.map(date => {
                    const dayKey = format(date, 'yyyy-MM-dd');
                    const displayDay = format(date, 'd MMM');
                    const data = dailyData[dayKey] || { total: 0, confirmed: 0 };
                    return { day: displayDay, fullDate: dayKey, total: data.total, confirmed: data.confirmed };
                });
                setChartData(finalChartData); // No need to sort, eachDayOfInterval is chronological
            } else {
                setChartData([]);
                setChartDaysCount(0);
            }
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setIsLoading(false);
        }
    }
    fetchStatsAndChartData();
  }, [companySupabase]);

  const renderTrend = (trendValue: number | null) => {
    // ... (trend rendering logic)
     if (trendValue === null || trendValue === 0) return <span className="text-xs text-[#EDE7C7]/50">--</span>;
    const isPositive = trendValue > 0;
    return ( <span className={`flex items-center text-xs ${isPositive ? 'text-green-500' : 'text-red-500'}`}> {isPositive ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />} {Math.abs(trendValue)}% </span> );
  };

  if (!companySupabase && !isLoading) { return ( /* ... Database not connected message ... */ <Card className="bg-[#1A1A1A] border-[#2A2A2A]"><CardContent className="pt-6"><div className="text-center py-12"><AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" /><h3 className="text-xl font-bold text-[#EDE7C7]">Database Not Connected</h3><p className="text-[#EDE7C7]/60 mt-2 max-w-md mx-auto">Please go to the settings page to connect your bot's database.</p><Button asChild className="mt-6 bg-[#EDE7C7] text-[#0A0A0A] hover:bg-[#EDE7C7]/90"><Link href="/dashboard/settings">Go to Settings</Link></Button></div></CardContent></Card> ); }

  const statCards = [
    { title: "Total Conversations", value: stats.totalConversations, icon: MessageSquare, trend: stats.conversationTrend },
    { title: "Total Meetings Booked", value: stats.totalMeetings, icon: CalendarCheck, trend: stats.meetingsTrend },
    { title: "Total Confirmed", value: stats.confirmedMeetings, icon: TrendingUp, trend: stats.confirmedTrend },
    { title: "Total Pending", value: stats.pendingMeetings, icon: Clock, trend: stats.pendingTrend },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-[#EDE7C7]">Overview</h2>
        <p className="text-[#EDE7C7]/60 mt-2">Here's your bot's performance summary.</p>
      </div>

      {/* Top Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
             <Card key={stat.title} className="bg-[#1A1A1A] border-[#2A2A2A]"> <CardHeader className="flex flex-row items-center justify-between pb-2"> <CardTitle className="text-sm font-medium text-[#EDE7C7]/80">{stat.title}</CardTitle> <stat.icon className="h-4 w-4 text-[#EDE7C7]/60" /> </CardHeader> <CardContent> {isLoading ? (<div className="h-8 w-1/2 bg-[#2A2A2A] rounded-md animate-pulse mb-1" />) : (<div className="text-2xl font-bold text-[#EDE7C7]">{stat.value}</div>)} <div className="h-4 mt-1">{!isLoading && renderTrend(stat.trend)}</div> </CardContent> </Card>
        ))}
      </div>

      {/* Meetings Over Time Line Chart */}
       <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
            <CardHeader>
              <CardTitle className="text-[#EDE7C7] flex items-center gap-2">
                <LineChartIcon className="h-5 w-5" />
                Daily Meetings Overview {chartDaysCount > 0 ? `(Last ${chartDaysCount} Days)` : ''}
              </CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              {isLoading ? (
                 <div className="h-[300px] w-full bg-[#2A2A2A] rounded-md animate-pulse flex items-center justify-center text-[#EDE7C7]/60">Loading chart data...</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                    {chartData.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-[#EDE7C7]/60">No meeting data available yet.</div>
                    ) : (
                        <LineChart data={chartData} margin={{ top: 5, right: 30, bottom: 5, left: 0 }}>
                            <defs> <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1"> <stop offset="5%" stopColor="#8884d8" stopOpacity={0.6}/> <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/> </linearGradient> <linearGradient id="colorConfirmed" x1="0" y1="0" x2="0" y2="1"> <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.6}/> <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/> </linearGradient> </defs>
                            <CartesianGrid stroke="#2A2A2A" strokeDasharray="5 5" vertical={false}/>
                            <XAxis dataKey="day" stroke="#EDE7C7" fontSize={10} tickLine={false} axisLine={false} interval={chartDaysCount > 60 ? Math.floor(chartDaysCount / 15) : (chartDaysCount > 30 ? 4 : 1)} tick={{ fill: '#EDE7C7' }}/>
                            <YAxis stroke="#EDE7C7" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} tick={{ fill: '#EDE7C7' }} width={30}/>
                            <Tooltip cursor={{ stroke: '#8B0000', strokeWidth: 1.5, strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: 'rgba(26, 26, 26, 0.9)', border: '1px solid #2A2A2A', color: '#EDE7C7', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} labelFormatter={(label, payload) => { const dataPoint = payload?.[0]?.payload as DailyMeetingData | undefined; return dataPoint ? new Date(dataPoint.fullDate + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric'}) : label; }} itemStyle={{ color: '#EDE7C7' }}/>
                            <Legend wrapperStyle={{ color: '#EDE7C7', fontSize: '12px', paddingTop: '10px' }}/>
                            <Area type="monotone" dataKey="total" stroke="none" fillOpacity={0.2} fill="url(#colorTotal)" />
                            <Area type="monotone" dataKey="confirmed" stroke="none" fillOpacity={0.2} fill="url(#colorConfirmed)" />
                            <Line type="monotone" dataKey="total" name="Total Booked" stroke="#a7a2ff" dot={false} activeDot={{ r: 5, strokeWidth: 0 }} strokeWidth={2}/>
                            <Line type="monotone" dataKey="confirmed" name="Confirmed" stroke="#82ca9d" dot={false} activeDot={{ r: 5, strokeWidth: 0 }} strokeWidth={2}/>
                        </LineChart>
                    )}
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

      {/* Render Recent Activity */}
      <RecentActivity />
    </div>
  )
}

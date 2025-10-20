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
  Users,
  RefreshCw
} from "lucide-react"
import { useCompanySupabase } from "@/lib/supabase/company-client"
import { useEffect, useState, useMemo, useRef } from "react"
import type { RealtimeChannel } from "@supabase/supabase-js"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { LineChart, Line, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Area } from "recharts"
import { differenceInDays, format, eachDayOfInterval, startOfDay, parseISO, subDays } from "date-fns"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { RecentLeads } from "@/components/dashboard/recent-leads"
import type { Metadata } from "next" // Import Metadata

// --- METADATA ---
export const metadata: Metadata = {
  title: "Overview | Zappies AI Dashboard",
  description: "A comprehensive summary of your AI agent's performance, metrics, and recent activity.",
}
// --- END METADATA ---


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
  id: string;
  name: string; 
  email: string;
  company: string | null; 
  status: string;
  created_at: string;
}


// Custom Tooltip Component (remains the same)
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

// Function to calculate percentage change (remains the same)
const calculateTrend = (current: number, previous: number): number | null => {
  if (previous === 0) {
    return current > 0 ? 100 : 0
  }
  if (current === 0 && previous === 0) {
      return 0;
  }
  const change = ((current - previous) / previous) * 100
  return Math.round(change)
}


export default function DashboardPage() {
  const companySupabase = useCompanySupabase()
  const [stats, setStats] = useState<DashboardStats>({
        totalConversations: 0,
        totalMeetings: 0,
        confirmedMeetings: 0,
        pendingMeetings: 0,
        meetingsTrend: null,
        confirmedTrend: null,
        pendingTrend: null,
   })
  const [chartData, setChartData] = useState<DailyMeetingData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [chartDaysCount, setChartDaysCount] = useState<number>(0)
  const [allMeetings, setAllMeetings] = useState<MeetingSimple[]>([])
  const [recentLeads, setRecentLeads] = useState<Lead[]>([])
  const channelRef = useRef<RealtimeChannel | null>(null)


  // Calculate trends using useMemo based on allMeetings
  const trends = useMemo(() => {
    if (!allMeetings || allMeetings.length === 0) {
      return { meetingsTrend: null, confirmedTrend: null, pendingTrend: null };
    }

    const trendPeriodDays = 7;
    const today = startOfDay(new Date());
    const currentPeriodStart = subDays(today, trendPeriodDays - 1);
    const previousPeriodStart = subDays(currentPeriodStart, trendPeriodDays);
    const previousPeriodEnd = subDays(currentPeriodStart, 1);

    let currentMeetings = 0;
    let currentConfirmed = 0;
    let currentPending = 0;
    let previousMeetings = 0;
    let previousConfirmed = 0;
    let previousPending = 0;

    allMeetings.forEach(meeting => {
      try {
        const meetingDate = startOfDay(parseISO(meeting.created_at));
        if (meetingDate >= currentPeriodStart && meetingDate <= today) {
          currentMeetings++;
          if (meeting.status === 'confirmed') currentConfirmed++;
          if (meeting.status === 'pending_confirmation') currentPending++;
        } else if (meetingDate >= previousPeriodStart && meetingDate <= previousPeriodEnd) {
          previousMeetings++;
          if (meeting.status === 'confirmed') previousConfirmed++;
          if (meeting.status === 'pending_confirmation') previousPending++;
        }
      } catch (e) {
         // Ignore invalid dates during trend calculation
      }
    });

    return {
      meetingsTrend: calculateTrend(currentMeetings, previousMeetings),
      confirmedTrend: calculateTrend(currentConfirmed, previousConfirmed),
      pendingTrend: calculateTrend(currentPending, previousPending),
    };

  }, [allMeetings]);


  // Effect for fetching static data + setting up meeting subscription
  useEffect(() => {
    let isCancelled = false;
    
    const fetchAndSubscribe = async () => {
        if (!companySupabase) {
            setIsLoading(false);
            setAllMeetings([]);
            return;
        }
        if (isCancelled) return;
        
        setIsLoading(true);

        try {
            // 1. Fetch all data initially
            const convPromise = companySupabase.from("conversation_history").select("*", { count: "exact", head: true });
            const leadsPromise = companySupabase.from("leads").select("id, full_name, email, company_name, status, created_at").order("created_at", { ascending: false }).limit(5);
            const meetingsPromise = companySupabase
                .from("meetings")
                .select("created_at, status")
                .order("created_at", { ascending: true });

            const [conversationResult, meetingsResult, leadsResult] = await Promise.all([convPromise, meetingsPromise, leadsPromise]);

            if (conversationResult.error) throw conversationResult.error;
            if (meetingsResult.error) throw meetingsResult.error;
            if (leadsResult.error) throw leadsResult.error;

            if (isCancelled) return; 

            const meetingsData = (meetingsResult.data || []) as MeetingSimple[];
            
            // --- Set initial meetings state ---
            setAllMeetings(meetingsData); 
            
            // --- Process other static data (totals set in separate useEffect below) ---
            const fetchedLeads = (leadsResult.data || []).map((lead: any) => ({
                id: lead.id, name: lead.full_name, email: lead.email, company: lead.company_name, status: lead.status, created_at: lead.created_at,
            }));
            setRecentLeads(fetchedLeads);
            
            // Set static totals
            setStats(prev => ({
                ...prev,
                totalConversations: conversationResult.count || 0,
            }));


            // --- Realtime Subscription Setup (Meetings) ---
            console.log("Overview: Setting up Meetings Realtime subscription...");

            const handleInserts = (payload: any) => {
                const newMeeting = payload.new as MeetingSimple;
                setAllMeetings(currentMeetings => [...currentMeetings, newMeeting]);
            };

            const handleUpdates = (payload: any) => {
                const updatedMeeting = payload.new as MeetingSimple;
                setAllMeetings(currentMeetings => 
                    currentMeetings.map(m => m.created_at === payload.old.created_at ? updatedMeeting : m)
                );
            };
            
            const handleDeletes = (payload: any) => {
                setAllMeetings(currentMeetings => currentMeetings.filter(m => m.created_at !== payload.old.created_at));
            };


            const channel = companySupabase
                .channel('meetings-overview-changes')
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'meetings' }, handleInserts)
                .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'meetings' }, handleUpdates)
                .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'meetings' }, handleDeletes)
                .subscribe((status) => {
                     if (status === 'SUBSCRIBED') { console.log('Meetings Realtime subscribed.'); }
                });

            channelRef.current = channel;

        } catch (error) {
            console.error("Overview Fetch/Subscribe Error:", error);
            setStats(prev => ({ ...prev, meetingsTrend: null, confirmedTrend: null, pendingTrend: null }));
            setRecentLeads([]);
        } finally {
             if (!isCancelled) setIsLoading(false);
        }
    };

    // Cleanup Function
    const cleanup = () => {
         isCancelled = true;
         if (channelRef.current) {
            console.log("Overview: Cleaning up Meetings Realtime subscription...");
            companySupabase?.removeChannel(channelRef.current);
            channelRef.current = null;
         }
    };

    fetchAndSubscribe();
    return cleanup;
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [companySupabase]); 


// Effect for updating stats and chart data when trends/meetings change
useEffect(() => {
    // 1. Update stats with new totals and trends
    const confirmed = allMeetings.filter((m) => m.status === "confirmed").length;
    const pending = allMeetings.filter((m) => m.status === "pending_confirmation").length;
    
    setStats(prev => ({
        ...prev,
        totalMeetings: allMeetings.length,
        confirmedMeetings: confirmed,
        pendingMeetings: pending,
        meetingsTrend: trends.meetingsTrend,
        confirmedTrend: trends.confirmedTrend,
        pendingTrend: trends.pendingTrend,
    }));
    
    // 2. Update chart data based on allMeetings
    if (allMeetings.length > 0) {
        const meetingsData = allMeetings;
        const dailyData: { [key: string]: { total: number; confirmed: number } } = {};
        const firstValidMeeting = meetingsData.find((m) => m.created_at && !isNaN(new Date(m.created_at).getTime()));

        if (!firstValidMeeting) { 
            setChartData([]); setChartDaysCount(0); 
        } else {
            const firstMeetingDate = startOfDay(parseISO(firstValidMeeting.created_at));
            const today = startOfDay(new Date());
            const chartStartDate = differenceInDays(today, firstMeetingDate) > 90 ? subDays(today, 90) : firstMeetingDate;
            const daysCount = differenceInDays(today, chartStartDate) + 1;
            setChartDaysCount(daysCount);

            meetingsData.forEach((meeting) => { 
                try { 
                    const date = startOfDay(parseISO(meeting.created_at)); 
                    if (date >= chartStartDate && date <= today) {
                        const dayKey = format(date, "yyyy-MM-dd"); 
                        if (!dailyData[dayKey]) dailyData[dayKey] = { total: 0, confirmed: 0 }; 
                        dailyData[dayKey].total += 1; 
                        if (meeting.status === "confirmed") dailyData[dayKey].confirmed += 1; 
                    } 
                } catch (e) { 
                    /* Skipping invalid date */ 
                } 
            });

            const allDaysInterval = eachDayOfInterval({ start: chartStartDate, end: today });
            const finalChartData: DailyMeetingData[] = allDaysInterval.map((date) => { 
                const dayKey = format(date, "yyyy-MM-dd"); 
                const displayDay = format(date, "d MMM"); 
                const data = dailyData[dayKey] || { total: 0, confirmed: 0 }; 
                return { day: displayDay, fullDate: dayKey, total: data.total, confirmed: data.confirmed }; 
            });
            setChartData(finalChartData);
        }
    } else if (!isLoading) {
         setChartData([]);
         setChartDaysCount(0);
    }
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [trends, allMeetings.length, isLoading]); 


// --- renderTrend function remains the same ---
const renderTrend = (trendValue: number | null) => {
    if (trendValue === null) return <span className="text-xs text-[#EDE7C7]/50">--</span>;
    if (trendValue === 0) return <span className="text-xs text-[#EDE7C7]/50">0%</span>;
    const isPositive = trendValue > 0
    return (
      <span className={`flex items-center text-xs ${isPositive ? "text-green-500" : "text-red-500"}`}>
        {isPositive ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
        {Math.abs(trendValue)}%
      </span>
    )
  }

// --- Skeleton components remain the same ---
const StatCardSkeleton = () => (
  <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
    <CardHeader className="flex flex-row items-center justify-between pb-2 min-h-[72px]">
      <div className="h-4 w-3/4 bg-[#2A2A2A] rounded animate-pulse" />
      <div className="h-4 w-4 bg-[#2A2A2A] rounded animate-pulse" />
    </CardHeader>
    <CardContent className="pt-0">
      <div className="h-8 w-1/2 bg-[#2A2A2A] rounded-md animate-pulse mb-1" />
      <div className="h-4 w-1/4 bg-[#2A2A2A] rounded-md animate-pulse mt-2" />
    </CardContent>
  </Card>
);

const ChartSkeleton = () => (
   <div className="h-[300px] w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg p-6 flex items-center justify-center animate-pulse">
        <div className="w-full h-full bg-[#2A2A2A] rounded"></div>
   </div>
);

const SidebarCardSkeleton = () => (
     <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
        <CardHeader className="pb-4">
             <div className="h-5 w-1/2 bg-[#2A2A2A] rounded animate-pulse" />
        </CardHeader>
        <CardContent className="space-y-4">
            {[...Array(3)].map((_, i) => ( 
                <div key={i} className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-[#2A2A2A] rounded-full flex-shrink-0"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 bg-[#2A2A2A] rounded animate-pulse"></div>
                        <div className="h-3 w-1/4 bg-[#2A2A2A] rounded animate-pulse"></div>
                    </div>
                </div>
            ))}
        </CardContent>
    </Card>
);


  // --- Database Not Connected rendering remains the same ---
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

  // Define statCards array (remains the same)
  const statCards = [
    { title: "Total Conversations", value: stats.totalConversations, icon: MessageSquare, },
    { title: "Total Meetings Booked", value: stats.totalMeetings, icon: CalendarCheck, trend: stats.meetingsTrend },
    { title: "Total Confirmed", value: stats.confirmedMeetings, icon: TrendingUp, trend: stats.confirmedTrend },
    { title: "Total Pending", value: stats.pendingMeetings, icon: Clock, trend: stats.pendingTrend },
  ]


  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Header remains the same */}
       <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#EDE7C7] tracking-tight">Overview</h2>
        <p className="text-sm sm:text-base text-[#EDE7C7]/60 mt-2">Here's your bot's performance summary.</p>
      </div>

       {/* Stat Cards Grid - Uses Skeletons during loading */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => <StatCardSkeleton key={index} />)
          : statCards.map((stat) => (
              <Card
                key={stat.title}
                className="bg-[#1A1A1A] border-[#2A2A2A] transition-all duration-200 hover:border-[#EDE7C7]/20"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2 min-h-[72px]">
                  <CardTitle className="text-sm font-medium text-[#EDE7C7]/80 leading-snug">{stat.title}</CardTitle>
                  <stat.icon className="h-4 w-4 text-[#EDE7C7]/60 flex-shrink-0" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl sm:text-3xl font-bold text-[#EDE7C7] leading-none">{stat.value}</div>
                  <div className="h-4 mt-2">{'trend' in stat && renderTrend(stat.trend)}</div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Grid for Charts and Recent Activity/Leads - Uses Skeletons during loading */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Card */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <ChartSkeleton />
          ) : (
             <Card className="bg-[#1A1A1A] border-[#2A2A2A] transition-all duration-200 hover:border-[#EDE7C7]/20">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl text-[#EDE7C7] flex items-center gap-2">
                  <LineChartIcon className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">
                    Daily Meetings Overview {chartDaysCount > 0 ? `(Last ${chartDaysCount > 90 ? 90 : chartDaysCount} Days)` : ""}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pl-2 pr-4">
                <ResponsiveContainer width="100%" height={300}>
                   {!chartData || chartData.length === 0 ? (
                     <div className="flex items-center justify-center h-full text-[#EDE7C7]/60 text-sm">No meeting data available yet.</div>
                   ) : (
                     <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                       <defs> <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8884d8" stopOpacity={0.6} /><stop offset="95%" stopColor="#8884d8" stopOpacity={0} /></linearGradient> <linearGradient id="colorConfirmed" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#82ca9d" stopOpacity={0.6} /><stop offset="95%" stopColor="#82ca9d" stopOpacity={0} /></linearGradient> </defs>
                       <CartesianGrid stroke="#2A2A2A" strokeDasharray="5 5" vertical={false} />
                       <XAxis dataKey="day" stroke="#EDE7C7" fontSize={10} tickLine={false} axisLine={false} interval={chartDaysCount > 60 ? Math.floor(chartDaysCount / 15) : chartDaysCount > 30 ? 4 : 1} tick={{ fill: "#EDE7C7" }} />
                       <YAxis stroke="#EDE7C7" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} tick={{ fill: "#EDE7C7" }} width={30} />
                       <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#8B0000", strokeWidth: 1.5, strokeDasharray: "3 3" }} />
                       <Legend wrapperStyle={{ color: "#EDE7C7", fontSize: "12px", paddingTop: "10px" }} />
                       <Area type="monotone" dataKey="total" stroke="none" fillOpacity={0.2} fill="url(#colorTotal)" /> <Area type="monotone" dataKey="confirmed" stroke="none" fillOpacity={0.2} fill="url(#colorConfirmed)" />
                       <Line type="monotone" dataKey="total" name="Total Booked" stroke="#a7a2ff" dot={false} activeDot={{ r: 5, strokeWidth: 0 }} strokeWidth={2} /> <Line type="monotone" dataKey="confirmed" name="Confirmed" stroke="#82ca9d" dot={false} activeDot={{ r: 5, strokeWidth: 0 }} strokeWidth={2} />
                    </LineChart>
                   )}
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Column for Recent Activity and Leads - Uses Skeletons during loading */}
        <div className="space-y-6">
          {isLoading ? (
            <>
              <SidebarCardSkeleton />
              <SidebarCardSkeleton />
            </>
          ) : (
            <>
              <RecentLeads leads={recentLeads} />
              <RecentActivity />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

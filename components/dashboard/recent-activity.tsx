"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, CalendarCheck, Clock, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useEffect, useState, useRef } from "react" // Added useRef
import type { RealtimeChannel } from "@supabase/supabase-js" // Added RealtimeChannel type
import { useCompanySupabase } from "@/lib/supabase/company-client"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from 'date-fns'

// Define a unified interface for activity items
interface ActivityItem {
  id: string;
  type: "conversation" | "meeting";
  description: string;
  timestamp: Date;
  status?: string;
}

export function RecentActivity() {
  const companySupabase = useCompanySupabase()
  const { toast } = useToast()
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const channelRef = useRef<RealtimeChannel | null>(null) // Ref for Realtime channel


  async function fetchRecentActivity() {
    if (!companySupabase) {
      setIsLoading(false);
      console.log("RecentActivity: Company Supabase client not available.");
      return;
    }
    console.log("RecentActivity: Fetching data...");
    setIsLoading(true);
    try {
      const fetchLimit = 5;

      // Fetch latest conversations
      const convPromise = companySupabase
        .from("conversation_history")
        .select("conversation_id, created_at, status")
        .order("created_at", { ascending: false })
        .limit(fetchLimit);

      // Fetch latest meetings using 'full_name'
      const meetingsPromise = companySupabase
        .from("meetings")
        .select("id, full_name, created_at, status")
        .order("created_at", { ascending: false })
        .limit(fetchLimit);

      const [convResult, meetingsResult] = await Promise.all([convPromise, meetingsPromise]);

      if (convResult.error) throw convResult.error;
      if (meetingsResult.error) throw meetingsResult.error;

      const conversationActivities: ActivityItem[] = (convResult.data || []).map(conv => ({
          id: conv.conversation_id,
          type: "conversation",
          description: `New conversation started (ID: ...${conv.conversation_id.slice(-6)})`,
          timestamp: new Date(conv.created_at),
          status: conv.status
      }));

      const meetingActivities: ActivityItem[] = (meetingsResult.data || []).map(meeting => ({
          id: meeting.id,
          type: "meeting",
          description: `Meeting booked: ${meeting.full_name || 'Unknown'}`,
          timestamp: new Date(meeting.created_at),
          status: meeting.status
      }));

      const combinedActivities = [...conversationActivities, ...meetingActivities]
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, 5);

      console.log("RecentActivity: Data processed.", combinedActivities.length);
      setActivities(combinedActivities);

    } catch (error) {
      console.error("Error fetching recent activity:", error);
      toast({ title: "Error", description: "Could not fetch recent activity.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // 1. Initial fetch on mount
    fetchRecentActivity();

    // 2. Setup Realtime Subscriptions to trigger re-fetch on any change
    if (companySupabase) {
      console.log("RecentActivity: Setting up Realtime trigger channel...");

      // A single handler that just triggers a re-fetch of the activity list
      const reFetchHandler = () => {
        console.log('Realtime event received: triggering re-fetch for Recent Activity.');
        fetchRecentActivity();
      };

      // Create a channel and subscribe to ANY change in meetings OR conversation_history
      const channel = companySupabase
        .channel('recent-activity-trigger')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'meetings' }, reFetchHandler)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'conversation_history' }, reFetchHandler)
        .subscribe((status) => {
             if (status === 'SUBSCRIBED') { console.log('RecentActivity Realtime subscribed.'); }
        });

      channelRef.current = channel;

      // 3. Cleanup Function
      return () => {
        if (channelRef.current) {
          companySupabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }
      };
    } else {
       // Cleanup if client disappears
       if (channelRef.current) {
         companySupabase?.removeChannel(channelRef.current);
         channelRef.current = null;
       }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companySupabase, toast]); // Rerun effect if client changes


  // --- Helper functions remain the same ---
  const getActivityIcon = (type: "conversation" | "meeting") => {
      return type === "conversation"
        ? <MessageSquare className="h-5 w-5 text-blue-400" />
        : <CalendarCheck className="h-5 w-5 text-green-400" />;
  }
   const getActivityLink = (item: ActivityItem) => {
      // Map activity type to the correct dashboard path
      return item.type === "conversation" ? "/dashboard/conversations" : "/dashboard/leads";
  }
   const getStatusBadge = (status?: string) => {
        if (!status) return null;
       let className = "border-[#EDE7C7]/50 text-[#EDE7C7]/60";
       if (status === 'confirmed' || status === 'active') className = "border-green-500/50 text-green-500";
       if (status === 'pending_confirmation') className = "border-yellow-500/50 text-yellow-500";
       if (status === 'cancelled') className = "border-red-500/50 text-red-500";
       if (status === 'handover') className = "border-orange-500/50 text-orange-500"; // Added handover status
       return <Badge variant="outline" className={`text-xs ${className}`}>{status.replace(/_/g, ' ')}</Badge>;
   }

  // --- Render logic remains the same ---
  return (
    <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-[#EDE7C7]">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="space-y-4">
                 {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-3">
                         <div className="h-5 w-5 bg-[#2A2A2A] rounded animate-pulse"></div>
                         <div className="flex-1 space-y-2">
                            <div className="h-4 w-3/4 bg-[#2A2A2A] rounded animate-pulse"></div>
                            <div className="h-3 w-1/4 bg-[#2A2A2A] rounded animate-pulse"></div>
                         </div>
                    </div>
                 ))}
            </div>
        ) : !companySupabase ? (
             <div className="text-center py-6 text-sm text-[#EDE7C7]/60">Connect database in settings to view activity.</div>
        ) : activities.length === 0 ? (
          <p className="text-[#EDE7C7]/60 text-sm text-center py-6">No recent activity found.</p>
        ) : (
          <div className="space-y-1">
            {activities.map((activity) => (
              <Link href={getActivityLink(activity)} key={activity.id} className="block group">
                <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-[#2A2A2A]/50 transition-colors cursor-pointer">
                  <div className="mt-1 flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 space-y-1 overflow-hidden">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-[#EDE7C7] truncate group-hover:text-white transition-colors">{activity.description}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#EDE7C7]/40">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                      <div className="ml-2">{getStatusBadge(activity.status)}</div> {/* Added status badge */}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

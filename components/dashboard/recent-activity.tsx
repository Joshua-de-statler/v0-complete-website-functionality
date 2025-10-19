"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, CalendarCheck, Clock, AlertTriangle } from "lucide-react" // Updated icons
import Link from "next/link"
import { useEffect, useState } from "react"
import { useCompanySupabase } from "@/lib/supabase/company-client"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from 'date-fns' // Import date-fns utility

// Define a unified interface for activity items
interface ActivityItem {
  id: string; // Use conversation_id or meeting id
  type: "conversation" | "meeting";
  description: string; // e.g., "New conversation started" or "Meeting booked: [Name]"
  timestamp: Date; // Use created_at
  status?: string; // Optional status (e.g., meeting status)
}

export function RecentActivity() {
  const companySupabase = useCompanySupabase()
  const { toast } = useToast()
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchRecentActivity() {
      if (!companySupabase) {
        setIsLoading(false);
        console.log("RecentActivity: Company Supabase client not available.");
        return;
      }
       console.log("RecentActivity: Fetching data...");
      setIsLoading(true);
      try {
        const fetchLimit = 5; // Fetch slightly more to ensure we get the latest across both

        // Fetch latest conversations
        const convPromise = companySupabase
          .from("conversation_history")
          .select("conversation_id, created_at, status")
          .order("created_at", { ascending: false })
          .limit(fetchLimit);

        // Fetch latest meetings
        const meetingsPromise = companySupabase
          .from("meetings")
          .select("id, customer_name, created_at, status")
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
            description: `Meeting booked: ${meeting.customer_name || 'Unknown'}`,
            timestamp: new Date(meeting.created_at),
            status: meeting.status
        }));

        // Combine, sort by timestamp (most recent first), and take the top 5
        const combinedActivities = [...conversationActivities, ...meetingActivities]
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 5); // Limit to latest 5 overall

        console.log("RecentActivity: Data processed.", combinedActivities);
        setActivities(combinedActivities);

      } catch (error) {
        console.error("Error fetching recent activity:", error);
        toast({ title: "Error", description: "Could not fetch recent activity.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchRecentActivity();
  }, [companySupabase, toast]);


  // Determine icon and link based on activity type
  const getActivityIcon = (type: "conversation" | "meeting") => {
      return type === "conversation"
        ? <MessageSquare className="h-5 w-5 text-blue-400" />
        : <CalendarCheck className="h-5 w-5 text-green-400" />;
  }
   const getActivityLink = (item: ActivityItem) => {
      return item.type === "conversation" ? "/dashboard/conversations" : "/dashboard/leads"; // Link to relevant page
  }
   const getStatusBadge = (status?: string) => {
       if (!status) return null;
       let className = "border-[#EDE7C7]/50 text-[#EDE7C7]/60";
       if (status === 'confirmed' || status === 'active') className = "border-green-500/50 text-green-500";
       if (status === 'pending_confirmation') className = "border-yellow-500/50 text-yellow-500";
       if (status === 'cancelled') className = "border-red-500/50 text-red-500";
       return <Badge variant="outline" className={`text-xs ${className}`}>{status.replace(/_/g, ' ')}</Badge>;
   }


  return (
    <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-[#EDE7C7]">Recent Activity</CardTitle>
        {/* Optional: Link to a dedicated activity log page if created later */}
        {/* <Link href="/dashboard/activity" className="text-sm text-[#EDE7C7]/60 hover:text-[#EDE7C7] transition-colors">View all</Link> */}
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="space-y-4">
                 {/* Loading Skeletons */}
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
                      {/* Optional: Show status badge if relevant */}
                      {/* {getStatusBadge(activity.status)} */}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#EDE7C7]/40">
                      <Clock className="h-3 w-3" />
                      {/* Format timestamp relative to now */}
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
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

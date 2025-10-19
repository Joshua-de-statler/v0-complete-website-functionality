"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, CalendarCheck, TrendingUp, Clock, AlertTriangle } from "lucide-react" // Updated icons
import { useCompanySupabase } from "@/lib/supabase/company-client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
// Import RecentActivity if you want to update it later
// import { RecentActivity } from "@/components/dashboard/recent-activity"

export default function DashboardPage() {
  const companySupabase = useCompanySupabase()
  const [stats, setStats] = useState({
    totalConversations: 0,
    totalMeetings: 0,
    confirmedMeetings: 0,
    pendingMeetings: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      if (!companySupabase) {
        setIsLoading(false)
        console.log("Overview: Company Supabase client not available.");
        return
      }
      console.log("Overview: Fetching stats...");
      setIsLoading(true)
      
      try {
        // Fetch conversation count
        const convPromise = companySupabase
          .from("conversation_history")
          .select('*', { count: 'exact', head: true })

        // Fetch meetings stats
        const meetingsPromise = companySupabase
          .from("meetings")
          .select("status")

        // Run queries in parallel
        const [conversationResult, meetingsResult] = await Promise.all([convPromise, meetingsPromise]);

        if (conversationResult.error) throw conversationResult.error;
        if (meetingsResult.error) throw meetingsResult.error;
        
        const meetings = meetingsResult.data || [];
        const confirmed = meetings.filter(m => m.status === 'confirmed').length
        const pending = meetings.filter(m => m.status === 'pending_confirmation').length
        
        console.log("Overview: Stats fetched successfully.", {
            convCount: conversationResult.count,
            meetingsData: meetingsResult.data
        });

        setStats({
          totalConversations: conversationResult.count || 0,
          totalMeetings: meetings.length,
          confirmedMeetings: confirmed,
          pendingMeetings: pending,
        })

      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
        // Add a toast notification here if desired
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [companySupabase]) // Dependency array includes companySupabase

  // Display message if Supabase credentials are not set
  if (!companySupabase && !isLoading) {
     return (
      <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#EDE7C7]">Database Not Connected</h3>
            <p className="text-[#EDE7C7]/60 mt-2 max-w-md mx-auto">
              Please go to the settings page and add your Supabase URL and Anon Key to view your dashboard.
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="bg-[#1A1A1A] border-[#2A2A2A]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-[#EDE7C7]/80">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-[#EDE7C7]/60" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                // Simple pulse animation for loading state
                <div className="h-8 w-1/2 bg-[#2A2A2A] rounded-md animate-pulse" />
              ) : (
                <div className="text-2xl font-bold text-[#EDE7C7]">{stat.value}</div>
              )}
               {/* Optionally add description/trend later if needed */}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Placeholder for RecentActivity component - can be updated next */}
      {/* <RecentActivity /> */}
    </div>
  )
}

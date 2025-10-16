"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, MessageSquare, CheckCircle, Clock, Calendar, AlertTriangle } from "lucide-react"
import { useCompanySupabase } from "@/lib/supabase/company-client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

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

  useEffect(() => {
    async function fetchAnalytics() {
      if (!companySupabase) {
        setIsLoading(false)
        return
      }
      setIsLoading(true)
      try {
        const convPromise = companySupabase.from("conversation_history").select("*", { count: "exact", head: true })
        const meetingsPromise = companySupabase.from("meetings").select("status")

        const [convResult, meetingsResult] = await Promise.all([convPromise, meetingsPromise])

        if (convResult.error) throw convResult.error
        if (meetingsResult.error) throw meetingsResult.error

        const meetings = meetingsResult.data || []
        const totalMeetings = meetings.length
        const confirmed = meetings.filter((m) => m.status === "confirmed").length
        const pending = meetings.filter((m) => m.status === "pending_confirmation").length
        const confirmationRate = totalMeetings > 0 ? Math.round((confirmed / totalMeetings) * 100) : 0

        setMetrics({
          totalConversations: convResult.count || 0,
          totalMeetings: totalMeetings,
          confirmedMeetings: confirmed,
          pendingMeetings: pending,
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

  if (!companySupabase) {
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

  if (isLoading) {
    return <div>Loading analytics...</div>
  }

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h2 className="text-3xl font-bold text-[#EDE7C7]">Analytics</h2>
        <p className="text-[#EDE7C7]/60 mt-2">Performance and engagement metrics from your bot.</p>
      </div>

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
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
          <CardHeader>
            <CardTitle className="text-[#EDE7C7] flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Confirmed Meetings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-500">{metrics.confirmedMeetings}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
          <CardHeader>
            <CardTitle className="text-[#EDE7C7] flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Meetings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-yellow-500">{metrics.pendingMeetings}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

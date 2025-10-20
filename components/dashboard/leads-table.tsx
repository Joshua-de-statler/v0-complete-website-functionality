"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, Eye, AlertTriangle, Clock, User, Mail, ThumbsUp, ThumbsDown, DollarSign, Phone } from "lucide-react"
import Link from "next/link"
import { useCompanySupabase } from "@/lib/supabase/company-client"
import { useToast } from "@/hooks/use-toast"
import { format, parseISO } from "date-fns"

// Interface matching the 'call_history' table schema
interface CallHistoryEntry {
  id: number
  created_at: string
  full_name: string | null
  email: string | null
  company_name: string | null
  goal: string | null
  monthly_budget: number | null
  resulted_in_meeting: boolean | null
  disqualification_reason: string | null
  client_number: string | null
  call_duration_seconds: number | null
}

// Renaming component conceptually, filename stays for now
export function LeadsTable() {
  const companySupabase = useCompanySupabase()
  const { toast } = useToast()
  const [callHistory, setCallHistory] = useState<CallHistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterOption, setFilterOption] = useState("all") // Filter state
  const [selectedCall, setSelectedCall] = useState<CallHistoryEntry | null>(null)
  const [currentNotes, setCurrentNotes] = useState<string>("") // Client-side only notes

  useEffect(() => {
    async function fetchCallHistory() {
      if (!companySupabase) {
        setIsLoading(false)
        console.log("CallHistoryTable: Company Supabase client is null.")
        return
      }
      console.log("CallHistoryTable: Fetching data from 'call_history'...")
      setIsLoading(true)
      try {
        const { data, error, count } = await companySupabase
          .from("call_history")
          .select(
            "id, created_at, full_name, email, company_name, goal, monthly_budget, resulted_in_meeting, disqualification_reason, client_number, call_duration_seconds",
            { count: "exact" },
          )
          .order("created_at", { ascending: false })

        if (error) {
          console.error("CallHistoryTable: Error fetching call history:", error)
          toast({
            title: "Error",
            description: `Failed to fetch call history: ${error.message}`,
            variant: "destructive",
          })
          setCallHistory([])
        } else {
          console.log(`CallHistoryTable: Successfully fetched ${count ?? "unknown"} calls.`)
          setCallHistory(data || [])
        }
      } catch (catchError) {
        console.error("CallHistoryTable: Unexpected error during fetchCallHistory:", catchError)
        toast({
          title: "Fetch Error",
          description: "An unexpected error occurred while fetching call history.",
          variant: "destructive",
        })
        setCallHistory([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchCallHistory()
  }, [companySupabase, toast])

  // Filter logic
  const filteredCalls = callHistory.filter((call) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      call.full_name?.toLowerCase().includes(searchLower) ||
      call.email?.toLowerCase().includes(searchLower) ||
      call.company_name?.toLowerCase().includes(searchLower)

    const matchesFilter =
      filterOption === "all" ||
      (filterOption === "meeting_yes" && call.resulted_in_meeting === true) ||
      (filterOption === "meeting_no" && call.resulted_in_meeting === false)

    return matchesSearch && matchesFilter
  })

  // Helper to format duration
  const formatDuration = (seconds: number | null): string => {
    if (seconds === null || seconds === undefined) return "N/A"
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  // Helper to format currency (assuming ZAR)
  const formatBudget = (budget: number | null): string => {
    if (budget === null || budget === undefined) return "N/A"
    return `R ${budget.toLocaleString("en-ZA")}` // Format for South Africa
  }

  // --- RENDER LOGIC ---
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

  if (isLoading) {
    return (
      <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
        <CardHeader>
          <CardTitle className="text-[#EDE7C7]">Call History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12 min-h-[200px]">
            <p className="text-base text-[#EDE7C7]/60">Loading call history...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
      <CardHeader>
        <CardTitle className="text-[#EDE7C7]">Call History ({filteredCalls.length})</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          {/* Search */}
          <div className="relative flex-1">
            {" "}
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#EDE7C7]/40" />{" "}
            <Input
              placeholder="Search name, email, company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#0A0A0A] border-[#2A2A2A] text-[#EDE7C7]"
            />{" "}
          </div>
          {/* Filter Dropdown */}
          <Select value={filterOption} onValueChange={setFilterOption}>
            <SelectTrigger className="w-full sm:w-[220px] bg-[#0A0A0A] border-[#2A2A2A] text-[#EDE7C7]">
              {" "}
              <SelectValue placeholder="Filter call results" />{" "}
            </SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
              <SelectItem value="all">All Calls</SelectItem>
              <SelectItem value="meeting_yes">Resulted in Meeting</SelectItem>
              <SelectItem value="meeting_no">Did Not Result in Meeting</SelectItem>
              {/* Add more filters later if needed, e.g., disqualification */}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {callHistory.length === 0 ? (
            <div className="flex items-center justify-center py-12 min-h-[200px]">
              <div className="text-center px-4">
                <Phone className="h-12 w-12 text-[#EDE7C7]/20 mx-auto mb-3" />
                <p className="text-base text-[#EDE7C7]/60">No call history found.</p>
              </div>
            </div>
          ) : filteredCalls.length === 0 ? (
            <div className="flex items-center justify-center py-12 min-h-[200px]">
              <div className="text-center px-4">
                <Search className="h-12 w-12 text-[#EDE7C7]/20 mx-auto mb-3" />
                <p className="text-base text-[#EDE7C7]/60">No calls match your current filters.</p>
              </div>
            </div>
          ) : (
            filteredCalls.map((call) => (
              <div
                key={call.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-[#0A0A0A] border border-[#2A2A2A]"
              >
                {/* Call Row Display */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="font-medium text-[#EDE7C7]">{call.full_name || "N/A"}</p>
                    {call.resulted_in_meeting === true && (
                      <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                        <ThumbsUp className="h-3 w-3 mr-1" /> Meeting
                      </Badge>
                    )}
                    {call.resulted_in_meeting === false && !call.disqualification_reason && (
                      <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                        <ThumbsDown className="h-3 w-3 mr-1" /> No Meeting
                      </Badge>
                    )}
                    {call.disqualification_reason && (
                      <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                        <ThumbsDown className="h-3 w-3 mr-1" /> Disqualified
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-[#EDE7C7]/60 space-y-1">
                    <p className="flex items-center gap-1.5">
                      <Mail className="h-3 w-3 flex-shrink-0" /> {call.email || "N/A"}
                    </p>
                    {call.company_name && (
                      <p className="flex items-center gap-1.5">
                        <User className="h-3 w-3 flex-shrink-0" /> {call.company_name}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-[#EDE7C7]/40">{format(parseISO(call.created_at), "MMM d, yyyy h:mm a")}</p>
                </div>
                {/* View Details Button */}
                <Dialog onOpenChange={(open) => setSelectedCall(open ? call : null)}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-[#EDE7C7]/5 border-[#EDE7C7]/20 text-[#EDE7C7] hover:bg-[#EDE7C7]/10"
                    >
                      {" "}
                      <Eye className="h-4 w-4 mr-2" /> View Details{" "}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#1A1A1A] border-[#2A2A2A] max-w-lg">
                    <DialogHeader>
                      {" "}
                      <DialogTitle className="text-[#EDE7C7]">Call Details</DialogTitle>{" "}
                      <DialogDescription className="text-[#EDE7C7]/60">
                        Detailed information about the call.
                      </DialogDescription>{" "}
                    </DialogHeader>
                    {selectedCall && (
                      <div className="space-y-6 pt-4 text-sm">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            {" "}
                            <Label className="text-[#EDE7C7]/80">Caller Name</Label>{" "}
                            <p className="text-[#EDE7C7] flex items-center gap-2">
                              <User className="h-4 w-4" /> {selectedCall.full_name || "N/A"}
                            </p>{" "}
                          </div>
                          <div className="space-y-1">
                            {" "}
                            <Label className="text-[#EDE7C7]/80">Caller Email</Label>{" "}
                            <p className="text-[#EDE7C7] flex items-center gap-2">
                              <Mail className="h-4 w-4" /> {selectedCall.email || "N/A"}
                            </p>{" "}
                          </div>
                          {selectedCall.company_name && (
                            <div className="space-y-1">
                              {" "}
                              <Label className="text-[#EDE7C7]/80">Company</Label>{" "}
                              <p className="text-[#EDE7C7]">{selectedCall.company_name}</p>{" "}
                            </div>
                          )}
                          <div className="space-y-1">
                            {" "}
                            <Label className="text-[#EDE7C7]/80">Call Time</Label>{" "}
                            <p className="text-[#EDE7C7] flex items-center gap-2">
                              <Clock className="h-4 w-4" />{" "}
                              {format(parseISO(selectedCall.created_at), "MMM d, yyyy h:mm a")}
                            </p>{" "}
                          </div>
                          {selectedCall.call_duration_seconds !== null && (
                            <div className="space-y-1">
                              {" "}
                              <Label className="text-[#EDE7C7]/80">Call Duration</Label>{" "}
                              <p className="text-[#EDE7C7] flex items-center gap-2">
                                <Clock className="h-4 w-4" /> {formatDuration(selectedCall.call_duration_seconds)}
                              </p>{" "}
                            </div>
                          )}
                          {selectedCall.monthly_budget !== null && (
                            <div className="space-y-1">
                              {" "}
                              <Label className="text-[#EDE7C7]/80">Monthly Budget</Label>{" "}
                              <p className="text-[#EDE7C7] flex items-center gap-2">
                                <DollarSign className="h-4 w-4" /> {formatBudget(selectedCall.monthly_budget)}
                              </p>{" "}
                            </div>
                          )}
                        </div>
                        {selectedCall.goal && (
                          <div>
                            {" "}
                            <Label className="text-[#EDE7C7]/80">Call Goal</Label>{" "}
                            <p className="text-[#EDE7C7] mt-1 text-sm bg-[#0A0A0A] p-3 rounded border border-[#2A2A2A] whitespace-pre-wrap">
                              {selectedCall.goal}
                            </p>{" "}
                          </div>
                        )}
                        <div className="space-y-1">
                          <Label className="text-[#EDE7C7]/80">Resulted in Meeting?</Label>
                          <p
                            className={`text-base font-medium ${selectedCall.resulted_in_meeting ? "text-green-500" : "text-yellow-500"}`}
                          >
                            {selectedCall.resulted_in_meeting ? "Yes" : "No"}
                          </p>
                        </div>
                        {selectedCall.disqualification_reason && (
                          <div>
                            {" "}
                            <Label className="text-[#EDE7C7]/80">Disqualification Reason</Label>{" "}
                            <p className="text-[#EDE7C7] mt-1 text-sm bg-[#0A0A0A] p-3 rounded border border-[#2A2A2A] whitespace-pre-wrap">
                              {selectedCall.disqualification_reason}
                            </p>{" "}
                          </div>
                        )}
                        {/* Notes (client-side only) */}
                        <div>
                          {" "}
                          <Label htmlFor="notes" className="text-[#EDE7C7]/80">
                            Notes (Not Saved)
                          </Label>{" "}
                          <Textarea
                            id="notes"
                            value={currentNotes}
                            onChange={(e) => setCurrentNotes(e.target.value)}
                            placeholder="Add temporary notes here..."
                            className="mt-1 bg-[#0A0A0A] border-[#2A2A2A] text-[#EDE7C7]"
                            rows={3}
                          />{" "}
                          <p className="text-xs text-[#EDE7C7]/50 mt-1">Notes are for temporary reference only.</p>{" "}
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

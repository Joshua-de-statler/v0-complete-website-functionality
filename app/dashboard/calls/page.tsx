"use client"

import { useState, useEffect, useRef } from "react"
import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Phone, Clock, AlertTriangle, PhoneIncoming, Eye, User, Mail, DollarSign, Building, Save, Inbox, RefreshCw, } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCompanySupabase } from "@/lib/supabase/company-client"
import { useToast } from "@/hooks/use-toast"
import { format, parseISO } from "date-fns"
import Link from "next/link"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Metadata } from "next" // Import Metadata

// --- METADATA ---
export const metadata: Metadata = {
  title: "Voice Calls | Zappies AI Dashboard",
  description: "Review and log details for all voice calls handled by your AI agent.",
}
// --- END METADATA ---


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
  notes?: string | null
}

// Helper function to format a call entry (used for initial fetch and realtime payloads)
const formatCallEntry = (data: any): CallHistoryEntry => ({
  id: data.id,
  created_at: data.created_at,
  full_name: data.full_name,
  email: data.email,
  company_name: data.company_name,
  goal: data.goal,
  monthly_budget: data.monthly_budget,
  resulted_in_meeting: data.resulted_in_meeting,
  disqualification_reason: data.disqualification_reason,
  client_number: data.client_number,
  call_duration_seconds: data.call_duration_seconds,
  notes: data.notes,
});

// --- Skeleton Component for Call List Items ---
const CallItemSkeleton = () => (
  <div className="w-full p-4 flex items-start gap-4 rounded-lg border border-[#2A2A2A] bg-[#0A0A0A] animate-pulse">
    <div className="h-10 w-10 bg-[#2A2A2A] rounded-full flex-shrink-0" />
    <div className="flex-1 space-y-2 pt-1">
      <div className="flex justify-between items-center">
        <div className="h-4 w-1/3 bg-[#2A2A2A] rounded" />
        <div className="h-4 w-1/6 bg-[#2A2A2A] rounded" />
      </div>
      <div className="h-3 w-1/2 bg-[#2A2A2A] rounded" />
      <div className="h-3 w-1/4 bg-[#2A2A2A] rounded" />
    </div>
  </div>
);


export default function CallsPage() {
  const companySupabase = useCompanySupabase()
  const { toast } = useToast()
  const [callHistory, setCallHistory] = useState<CallHistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterOption, setFilterOption] = useState("all")
  const [selectedCall, setSelectedCall] = useState<CallHistoryEntry | null>(null)
  const [currentNotes, setCurrentNotes] = useState<string>("")
  const [isSavingNotes, setIsSavingNotes] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const channelRef = useRef<RealtimeChannel | null>(null)

  const fetchCallHistory = async () => {
    if (!companySupabase) { setIsLoading(false); setCallHistory([]); return; } setIsLoading(true);
    try {
      const { data, error, count } = await companySupabase
        .from("call_history")
        .select("id, created_at, full_name, email, company_name, goal, monthly_budget, resulted_in_meeting, disqualification_reason, client_number, call_duration_seconds, notes", { count: "exact" })
        .order("created_at", { ascending: false })
      if (error) throw error
      setCallHistory((data || []).map(formatCallEntry))
    } catch (error: any) {
      toast({ title: "Error", description: `Failed to fetch call history: ${error.message}.`, variant: "destructive", });
      setCallHistory([])
    } finally { setIsLoading(false) }
  }

  // --- Realtime Subscription Effect (remains the same) ---
  useEffect(() => {
    if (companySupabase) {
      fetchCallHistory()

      const handleInserts = (payload: any) => { const newCall = formatCallEntry(payload.new); setCallHistory(currentHistory => [newCall, ...currentHistory]); };
      const handleUpdates = (payload: any) => {
        const updatedCall = formatCallEntry(payload.new);
        setCallHistory(currentHistory => currentHistory.map(call => call.id === updatedCall.id ? updatedCall : call).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
        setSelectedCall(currentSelected => currentSelected?.id === updatedCall.id ? updatedCall : currentSelected);
      };
      const handleDeletes = (payload: any) => { setCallHistory(currentHistory => currentHistory.filter(call => call.id !== payload.old.id)); setSelectedCall(currentSelected => (currentSelected?.id === payload.old.id ? null : currentSelected)); }

      const channel = companySupabase
        .channel('call-history-changes')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'call_history' }, handleInserts)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'call_history' }, handleUpdates)
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'call_history' }, handleDeletes)
        .subscribe();

      channelRef.current = channel;
      return () => { if (channelRef.current) { companySupabase.removeChannel(channelRef.current); channelRef.current = null; } }
    } else { setIsLoading(false); setCallHistory([]); setSelectedCall(null); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companySupabase])

  // Filter logic (remains the same)
  const filteredCalls = callHistory.filter((call) => {
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = call.full_name?.toLowerCase().includes(searchLower) || call.email?.toLowerCase().includes(searchLower) || call.client_number?.includes(searchQuery) || call.company_name?.toLowerCase().includes(searchLower)
    const matchesFilter = filterOption === "all" || (filterOption === "meeting_yes" && call.resulted_in_meeting === true) || (filterOption === "meeting_no" && call.resulted_in_meeting === false && !call.disqualification_reason) || (filterOption === "disqualified" && !!call.disqualification_reason)
    return matchesSearch && matchesFilter
  })

  // Formatters and Badge helper remain the same
  const formatDuration = (seconds: number | null): string => { if (seconds === null || seconds === undefined) return "--"; const minutes = Math.floor(seconds / 60); const remainingSeconds = seconds % 60; return `${minutes}m ${remainingSeconds}s`; }
  const formatBudget = (budget: number | null): string => { if (budget === null || budget === undefined) return "N/A"; return `R ${budget.toLocaleString("en-ZA")}`; }
  const getOutcomeBadge = (call: CallHistoryEntry) => { /* ... */
    if (call.resulted_in_meeting === true) { return ( <Badge variant="outline" className="border-green-500/50 text-green-500 text-xs">Meeting Booked</Badge> ) }
    if (call.disqualification_reason) { return ( <Badge variant="outline" className="border-red-500/50 text-red-500 text-xs">Disqualified</Badge> ) }
    if (call.resulted_in_meeting === false) { return ( <Badge variant="outline" className="border-yellow-500/50 text-yellow-500 text-xs">No Meeting</Badge> ) }
    return ( <Badge variant="outline" className="border-gray-500/50 text-gray-500 text-xs">Unknown Outcome</Badge> )
  }

  // Handle updates and saves remain the same
  const handleViewDetails = (call: CallHistoryEntry) => { setSelectedCall(call); setCurrentNotes(call.notes || ""); setIsDialogOpen(true); }
  const handleSaveNotes = async () => { /* ... */
    if (!selectedCall || !companySupabase) return; setIsSavingNotes(true); const updates = { notes: currentNotes, };
    try {
      const { error } = await companySupabase.from("call_history").update(updates).eq("id", selectedCall.id);
      if (error) throw error;
      setSelectedCall({ ...selectedCall, notes: currentNotes });
      toast({ title: "Success", description: "Notes saved successfully." });
    } catch (error: any) {
      toast({ title: "Error", description: `Failed to save notes: ${error.message}`, variant: "destructive", });
    } finally { setIsSavingNotes(false); }
  }

  // --- RENDER LOGIC ---
  if (!companySupabase && !isLoading && callHistory.length === 0) { /* ... */
     return ( <Card className="bg-[#1A1A1A] border-[#2A2A2A]"><CardContent className="pt-6"><div className="text-center py-12"><AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" /><h3 className="text-xl font-bold text-[#EDE7C7]">Database Not Connected</h3><p className="text-[#EDE7C7]/60 mt-2 max-w-md mx-auto">Please go to the settings page to connect your bot's database.</p><Button asChild className="mt-6 bg-[#EDE7C7] text-[#0A0A0A] hover:bg-[#EDE7C7]/90"><Link href="/dashboard/settings">Go to Settings</Link></Button></div></CardContent></Card> )
   }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header, Search, Filter remain the same */}
      <div><h2 className="text-2xl sm:text-3xl font-bold text-[#EDE7C7] tracking-tight">Voice Calls</h2><p className="text-sm text-[#EDE7C7]/60 mt-1.5">Review your bot's call history log.</p></div>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#EDE7C7]/40" /><Input placeholder="Search by name, email, phone, company..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 bg-[#1A1A1A] border-[#2A2A2A] text-[#EDE7C7] h-10 text-sm" /></div><Select value={filterOption} onValueChange={setFilterOption}><SelectTrigger className="w-full sm:w-[220px] bg-[#1A1A1A] border-[#2A2A2A] text-[#EDE7C7] h-10 text-sm"><SelectValue placeholder="Filter call results" /></SelectTrigger><SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]"><SelectItem value="all">All Calls</SelectItem><SelectItem value="meeting_yes">Resulted in Meeting</SelectItem><SelectItem value="meeting_no">Did Not Result in Meeting</SelectItem><SelectItem value="disqualified">Disqualified</SelectItem></SelectContent></Select></div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Call Logs List */}
        <Card className="bg-[#1A1A1A] border-[#2A2A2A] lg:col-span-2 flex flex-col h-[500px] lg:h-[600px] transition-all duration-200 hover:border-[#EDE7C7]/20">
          <CardHeader>
            <CardTitle className="text-[#EDE7C7]">Call History ({filteredCalls.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <ScrollArea className="h-full">
              {isLoading && callHistory.length === 0 ? (
                // Use Skeletons when initial load is happening and no data exists
                <div className="space-y-3 p-6 pt-0">
                    <CallItemSkeleton />
                    <CallItemSkeleton />
                    <CallItemSkeleton />
                    <CallItemSkeleton />
                    <CallItemSkeleton />
                </div>
              ) : callHistory.length === 0 ? (
                 <div className="flex items-center justify-center h-full min-h-[200px]">
                   <div className="text-center px-6 py-8">
                     <Phone className="h-16 w-16 text-[#EDE7C7]/20 mx-auto mb-4" />
                     <p className="text-lg font-medium text-[#EDE7C7]/80 mb-1">No Call History</p>
                     <p className="text-sm text-[#EDE7C7]/60">Your bot's call logs will appear here once calls are made.</p>
                     {!companySupabase && <p className="text-xs text-yellow-500/80 mt-3">Database connection needed.</p>}
                   </div>
                 </div>
               ) : filteredCalls.length === 0 ? (
                <div className="flex items-center justify-center h-full min-h-[200px]">
                  <div className="text-center px-4">
                    <Search className="h-12 w-12 text-[#EDE7C7]/20 mx-auto mb-3" />
                    <p className="text-base text-[#EDE7C7]/60">No calls match your current filters.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 p-6 pt-0">
                  {/* Mapping over filteredCalls */}
                  {filteredCalls.map((call) => ( <button key={call.id} onClick={() => handleViewDetails(call)} className={`w-full p-4 rounded-lg border text-left transition-colors ${selectedCall?.id === call.id ? "border-[#EDE7C7]/30 bg-[#2A2A2A]/50" : "border-[#2A2A2A] hover:border-[#EDE7C7]/20 hover:bg-[#2A2A2A]/30"}`}> {/* Call Row Content */} <div className="flex items-start gap-4"><Avatar className="h-10 w-10 flex-shrink-0"><AvatarFallback className="bg-[#EDE7C7]/10 text-[#EDE7C7]">{call.full_name ? call.full_name.split(" ").map((n) => n[0]).join("") : "??"}</AvatarFallback></Avatar><div className="flex-1 overflow-hidden"><div className="flex items-center justify-between mb-1 flex-wrap gap-2"><p className="font-medium text-[#EDE7C7] truncate">{call.full_name || "Unknown Caller"}</p>{getOutcomeBadge(call)}</div><p className="text-sm text-[#EDE7C7]/60 mb-2 truncate">{call.client_number || call.email || "No contact info"}</p><div className="flex items-center gap-4 text-xs text-[#EDE7C7]/40 flex-wrap"><div className="flex items-center gap-1"><PhoneIncoming className="h-3 w-3" /> <span>Incoming</span></div><div className="flex items-center gap-1"><Clock className="h-3 w-3" /> <span>{formatDuration(call.call_duration_seconds)}</span></div><span>{format(parseISO(call.created_at), "MMM d, h:mm a")}</span></div></div></div> </button> ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Call Details Panel */}
        <Card className="bg-[#1A1A1A] border-[#2A2A2A] flex flex-col h-[500px] lg:h-[600px] transition-all duration-200 hover:border-[#EDE7C7]/20">
          <CardHeader>
            <CardTitle className="text-[#EDE7C7]">Call Details</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto pr-2">
            {selectedCall ? (
              <div className="space-y-6 text-sm"> {/* Details content */}
                 {/* Contact Info */} <div className="flex items-center gap-3"><Avatar className="h-14 w-14"><AvatarFallback className="bg-[#EDE7C7]/10 text-[#EDE7C7] text-lg">{selectedCall.full_name ? selectedCall.full_name.split(" ").map((n) => n[0]).join("") : "??"}</AvatarFallback></Avatar><div><p className="font-medium text-[#EDE7C7] text-base">{selectedCall.full_name || "Unknown Caller"}</p><p className="text-[#EDE7C7]/60">{selectedCall.client_number || "No phone"}</p><p className="text-[#EDE7C7]/60">{selectedCall.email || "No email"}</p></div></div>
                 {/* Call Details */} <div className="space-y-3 border-t border-[#2A2A2A] pt-4"><div className="flex justify-between"><span className="text-[#EDE7C7]/60">Call Time</span><span className="text-[#EDE7C7] text-right">{format(parseISO(selectedCall.created_at), "MMM d, yyyy h:mm a")}</span></div>{selectedCall.call_duration_seconds !== null && (<div className="flex justify-between"><span className="text-[#EDE7C7]/60">Duration</span><span className="text-[#EDE7C7]">{formatDuration(selectedCall.call_duration_seconds)}</span></div>)}{selectedCall.company_name && (<div className="flex justify-between"><span className="text-[#EDE7C7]/60">Company</span><span className="text-[#EDE7C7] text-right">{selectedCall.company_name}</span></div>)}{selectedCall.monthly_budget !== null && (<div className="flex justify-between"><span className="text-[#EDE7C7]/60">Budget</span><span className="text-[#EDE7C7]">{formatBudget(selectedCall.monthly_budget)}</span></div>)}</div>
                 {/* Goal */} {selectedCall.goal && (<div className="border-t border-[#2A2A2A] pt-4"><Label className="text-[#EDE7C7]/80 block mb-2 font-medium">Call Goal</Label><p className="text-[#EDE7C7] bg-[#0A0A0A] p-3 rounded border border-[#2A2A2A] whitespace-pre-wrap max-h-40 overflow-y-auto">{selectedCall.goal}</p></div>)}
                 {/* Outcome */} <div className="border-t border-[#2A2A2A] pt-4 space-y-2"><Label className="text-[#EDE7C7]/80 block font-medium">Call Outcome</Label><p className={`font-medium ${selectedCall.resulted_in_meeting ? "text-green-500" : selectedCall.disqualification_reason ? "text-red-500" : "text-yellow-500"}`}>{selectedCall.resulted_in_meeting ? "Meeting Booked" : selectedCall.disqualification_reason ? "Disqualified" : "No Meeting Booked"}</p>{selectedCall.disqualification_reason && (<div><Label className="text-[#EDE7C7]/60 text-xs">Reason:</Label><p className="text-[#EDE7C7] mt-1 text-sm bg-[#0A0A0A] p-3 rounded border border-[#2A2A2A] whitespace-pre-wrap max-h-40 overflow-y-auto">{selectedCall.disqualification_reason}</p></div>)}</div>
                 {/* Notes */} <div className="border-t border-[#2A2A2A] pt-4"><Label htmlFor="callNotesEdit" className="text-[#EDE7C7]/80 block mb-2 font-medium">Notes</Label><Textarea id="callNotesEdit" value={currentNotes} onChange={(e) => setCurrentNotes(e.target.value)} placeholder="Add notes about this call..." className="bg-[#0A0A0A] border-[#2A2A2A] text-[#EDE7C7]" rows={4} /><Button onClick={handleSaveNotes} disabled={isSavingNotes || !selectedCall} size="sm" className="mt-3 bg-[#EDE7C7]/10 text-[#EDE7C7] hover:bg-[#EDE7C7]/20 border border-[#EDE7C7]/20">{isSavingNotes ? "Saving..." : <><Save className="h-4 w-4 mr-2" /> Save Notes</>}</Button></div>
              </div>
            ) : (
                <div className="flex items-center justify-center h-full min-h-[200px]">
                    <div className="text-center px-6 py-8">
                       {isLoading && callHistory.length === 0 ? (
                            <RefreshCw className="h-12 w-12 text-[#EDE7C7]/20 mx-auto mb-4 animate-spin" />
                       ) : (
                            <Eye className="h-16 w-16 text-[#EDE7C7]/20 mx-auto mb-4" />
                       )}
                       <p className="text-lg font-medium text-[#EDE7C7]/80 mb-1">
                          {isLoading && callHistory.length === 0 ? "Loading Call History..." : "Select a Call"}
                      </p>
                      <p className="text-sm text-[#EDE7C7]/60">
                         {isLoading && callHistory.length === 0 ? "Please wait..." : "Choose a call from the list to view its details."}
                      </p>
                    </div>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

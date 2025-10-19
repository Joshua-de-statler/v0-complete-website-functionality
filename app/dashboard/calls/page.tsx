"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Phone, Clock, User, Mail, AlertTriangle, PhoneIncoming, ThumbsUp, ThumbsDown, DollarSign, Target as GoalIcon } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label" // <<<--- ADDED IMPORT
import { Textarea } from "@/components/ui/textarea" // <<<--- ADDED IMPORT (for notes)
import { useCompanySupabase } from "@/lib/supabase/company-client"
import { useToast } from "@/hooks/use-toast"
import { format, parseISO } from 'date-fns'
import Link from "next/link"
import { ScrollArea } from "@/components/ui/scroll-area" // Added ScrollArea

// Interface matching the 'call_history' table schema
interface CallHistoryEntry {
  id: number;
  created_at: string;
  full_name: string | null;
  email: string | null;
  company_name: string | null;
  goal: string | null;
  monthly_budget: number | null;
  resulted_in_meeting: boolean | null;
  disqualification_reason: string | null;
  client_number: string | null;
  call_duration_seconds: number | null;
}

export default function CallsPage() {
  const companySupabase = useCompanySupabase();
  const { toast } = useToast();
  const [callHistory, setCallHistory] = useState<CallHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOption, setFilterOption] = useState("all");
  const [selectedCall, setSelectedCall] = useState<CallHistoryEntry | null>(null);
  const [currentNotes, setCurrentNotes] = useState<string>(""); // State for temporary notes

  useEffect(() => {
    async function fetchCallHistory() {
      if (!companySupabase) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const { data, error, count } = await companySupabase
          .from("call_history")
          .select("id, created_at, full_name, email, company_name, goal, monthly_budget, resulted_in_meeting, disqualification_reason, client_number, call_duration_seconds", { count: 'exact' })
          .order("created_at", { ascending: false });

        if (error) {
          console.error("CallsPage: Error fetching call history:", error);
          toast({ title: "Error", description: `Failed to fetch call history: ${error.message}`, variant: "destructive" });
          setCallHistory([]);
        } else {
          console.log(`CallsPage: Successfully fetched ${count ?? 'unknown'} calls.`);
          setCallHistory(data || []);
        }
      } catch (catchError) {
          console.error("CallsPage: Unexpected error during fetchCallHistory:", catchError);
          toast({ title: "Fetch Error", description: "An unexpected error occurred.", variant: "destructive" });
          setCallHistory([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCallHistory();
  }, [companySupabase, toast]);

  // Filter logic
  const filteredCalls = callHistory.filter((call) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      call.full_name?.toLowerCase().includes(searchLower) ||
      call.email?.toLowerCase().includes(searchLower) ||
      call.client_number?.includes(searchQuery) ||
      call.company_name?.toLowerCase().includes(searchLower);

    const matchesFilter =
        filterOption === "all" ||
        (filterOption === "meeting_yes" && call.resulted_in_meeting === true) ||
        (filterOption === "meeting_no" && call.resulted_in_meeting === false && !call.disqualification_reason) ||
        (filterOption === "disqualified" && !!call.disqualification_reason);

    return matchesSearch && matchesFilter;
  });

   // Helper to format duration
  const formatDuration = (seconds: number | null): string => {
      if (seconds === null || seconds === undefined) return "--";
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
  }

   // Badge for call outcome in the list
   const getOutcomeBadge = (call: CallHistoryEntry) => {
       if (call.resulted_in_meeting === true) {
           return <Badge variant="outline" className="border-green-500/50 text-green-500 text-xs">Meeting Booked</Badge>;
       }
       if (call.disqualification_reason) {
           return <Badge variant="outline" className="border-red-500/50 text-red-500 text-xs">Disqualified</Badge>;
       }
       if (call.resulted_in_meeting === false) {
           return <Badge variant="outline" className="border-yellow-500/50 text-yellow-500 text-xs">No Meeting</Badge>;
       }
       return <Badge variant="outline" className="border-gray-500/50 text-gray-500 text-xs">Unknown Outcome</Badge>;
   }

  // --- RENDER LOGIC ---
  if (!companySupabase && !isLoading) {
    return ( <Card className="bg-[#1A1A1A] border-[#2A2A2A]"><CardContent className="pt-6"><div className="text-center py-12"><AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" /><h3 className="text-xl font-bold text-[#EDE7C7]">Database Not Connected</h3><p className="text-[#EDE7C7]/60 mt-2 max-w-md mx-auto">Please go to the settings page to connect your bot's database.</p><Button asChild className="mt-6 bg-[#EDE7C7] text-[#0A0A0A] hover:bg-[#EDE7C7]/90"><Link href="/dashboard/settings">Go to Settings</Link></Button></div></CardContent></Card> );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-[#EDE7C7]">Voice Calls</h2>
        <p className="text-[#EDE7C7]/60 mt-2">Review your bot's call history log.</p>
      </div>

       {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#EDE7C7]/40" />
          <Input placeholder="Search by name, email, phone, company..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 bg-[#1A1A1A] border-[#2A2A2A] text-[#EDE7C7]" />
        </div>
         <Select value={filterOption} onValueChange={setFilterOption}>
            <SelectTrigger className="w-full sm:w-[220px] bg-[#1A1A1A] border-[#2A2A2A] text-[#EDE7C7]"> <SelectValue placeholder="Filter call results" /> </SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                <SelectItem value="all">All Calls</SelectItem>
                <SelectItem value="meeting_yes">Resulted in Meeting</SelectItem>
                <SelectItem value="meeting_no">Did Not Result in Meeting</SelectItem>
                <SelectItem value="disqualified">Disqualified</SelectItem>
            </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-14rem)]">
        {/* Call Logs List */}
        <Card className="bg-[#1A1A1A] border-[#2A2A2A] lg:col-span-2 flex flex-col">
          <CardHeader> <CardTitle className="text-[#EDE7C7]">Call History ({filteredCalls.length})</CardTitle> </CardHeader>
          <CardContent className="p-0 flex-1">
            <ScrollArea className="h-full">
            {isLoading ? ( <div className="text-center py-12 text-[#EDE7C7]/60">Loading calls...</div> )
            : callHistory.length === 0 ? ( <p className="text-[#EDE7C7]/60 text-sm text-center py-8">No call history found.</p> )
            : filteredCalls.length === 0 ? ( <p className="text-[#EDE7C7]/60 text-sm text-center py-8">No calls match your current filters.</p> )
            : (
                <div className="space-y-3 p-6 pt-0">
                {filteredCalls.map((call) => (
                    <button key={call.id} onClick={() => setSelectedCall(call)} className={`w-full p-4 rounded-lg border text-left transition-colors ${ selectedCall?.id === call.id ? "border-[#EDE7C7]/30 bg-[#2A2A2A]/50" : "border-[#2A2A2A] hover:border-[#EDE7C7]/20 hover:bg-[#2A2A2A]/30" }`} >
                        <div className="flex items-start gap-4">
                            <Avatar className="h-10 w-10 flex-shrink-0"> <AvatarFallback className="bg-[#EDE7C7]/10 text-[#EDE7C7]"> {call.full_name ? call.full_name.split(' ').map(n => n[0]).join('') : '??'} </AvatarFallback> </Avatar>
                            <div className="flex-1 overflow-hidden">
                                <div className="flex items-center justify-between mb-1 flex-wrap gap-2"> <p className="font-medium text-[#EDE7C7] truncate">{call.full_name || "Unknown Caller"}</p> {getOutcomeBadge(call)} </div>
                                <p className="text-sm text-[#EDE7C7]/60 mb-2 truncate">{call.client_number || call.email || "No contact info"}</p>
                                <div className="flex items-center gap-4 text-xs text-[#EDE7C7]/40 flex-wrap"> <div className="flex items-center gap-1"> <PhoneIncoming className="h-3 w-3" /> <span>Incoming</span> </div> <div className="flex items-center gap-1"> <Clock className="h-3 w-3" /> <span>{formatDuration(call.call_duration_seconds)}</span> </div> <span>{format(parseISO(call.created_at), 'MMM d, h:mm a')}</span> </div>
                            </div>
                        </div>
                    </button>
                ))}
                </div>
            )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Call Details Panel */}
        <Card className="bg-[#1A1A1A] border-[#2A2A2A] flex flex-col">
          <CardHeader> <CardTitle className="text-[#EDE7C7]">Call Details</CardTitle> </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            {selectedCall ? (
              <div className="space-y-6 text-sm">
                <div className="flex items-center gap-3">
                  <Avatar className="h-14 w-14"> <AvatarFallback className="bg-[#EDE7C7]/10 text-[#EDE7C7] text-lg"> {selectedCall.full_name ? selectedCall.full_name.split(' ').map(n => n[0]).join('') : '??'} </AvatarFallback> </Avatar>
                  <div> <p className="font-medium text-[#EDE7C7] text-base">{selectedCall.full_name || "Unknown Caller"}</p> <p className="text-[#EDE7C7]/60">{selectedCall.client_number || "No phone"}</p> <p className="text-[#EDE7C7]/60">{selectedCall.email || "No email"}</p> </div>
                </div>
                <div className="space-y-3 border-t border-[#2A2A2A] pt-4">
                  <div className="flex justify-between"> <span className="text-[#EDE7C7]/60">Call Time</span> <span className="text-[#EDE7C7] text-right">{format(parseISO(selectedCall.created_at), 'MMM d, yyyy h:mm a')}</span> </div>
                  {selectedCall.call_duration_seconds !== null && <div className="flex justify-between"> <span className="text-[#EDE7C7]/60">Duration</span> <span className="text-[#EDE7C7]">{formatDuration(selectedCall.call_duration_seconds)}</span> </div>}
                  {selectedCall.company_name && <div className="flex justify-between"> <span className="text-[#EDE7C7]/60">Company</span> <span className="text-[#EDE7C7] text-right">{selectedCall.company_name}</span> </div>}
                  {selectedCall.monthly_budget !== null && <div className="flex justify-between"> <span className="text-[#EDE7C7]/60">Budget</span> <span className="text-[#EDE7C7]">R {selectedCall.monthly_budget.toLocaleString('en-ZA')}</span> </div>}
                </div>
                {selectedCall.goal && ( <div className="border-t border-[#2A2A2A] pt-4"> <Label className="text-[#EDE7C7]/80 block mb-2 font-medium">Call Goal</Label> <p className="text-[#EDE7C7] bg-[#0A0A0A] p-3 rounded border border-[#2A2A2A] whitespace-pre-wrap">{selectedCall.goal}</p> </div> )}
                <div className="border-t border-[#2A2A2A] pt-4 space-y-2">
                     <Label className="text-[#EDE7C7]/80 block font-medium">Call Outcome</Label>
                     <p className={`font-medium ${selectedCall.resulted_in_meeting ? 'text-green-500' : selectedCall.disqualification_reason ? 'text-red-500' : 'text-yellow-500'}`}> {selectedCall.resulted_in_meeting ? 'Meeting Booked' : selectedCall.disqualification_reason ? 'Disqualified' : 'No Meeting Booked'} </p>
                    {selectedCall.disqualification_reason && ( <div> <Label className="text-[#EDE7C7]/60 text-xs">Reason:</Label> <p className="text-[#EDE7C7] mt-1 text-sm bg-[#0A0A0A] p-3 rounded border border-[#2A2A2A] whitespace-pre-wrap">{selectedCall.disqualification_reason}</p> </div> )}
                 </div>
                 <div className="border-t border-[#2A2A2A] pt-4">
                     <Label htmlFor="callNotes" className="text-[#EDE7C7]/80 block mb-2 font-medium">Notes (Not Saved)</Label>
                     <Textarea id="callNotes" value={currentNotes} onChange={(e) => setCurrentNotes(e.target.value)} placeholder="Add temporary notes about this call..." className="bg-[#0A0A0A] border-[#2A2A2A] text-[#EDE7C7]" rows={3}/>
                     <p className="text-xs text-[#EDE7C7]/50 mt-1">Notes are for temporary reference only.</p>
                 </div>
              </div>
            ) : ( <div className="text-center py-12"> <Phone className="h-12 w-12 text-[#EDE7C7]/20 mx-auto mb-3" /> <p className="text-sm text-[#EDE7C7]/60">Select a call to view details</p> </div> )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

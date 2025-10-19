"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, Eye, AlertTriangle, Calendar, Clock, User, Mail, Target as GoalIcon } from "lucide-react" // Added GoalIcon
import Link from "next/link"
import { useCompanySupabase } from "@/lib/supabase/company-client"
import { useToast } from "@/hooks/use-toast"
import { format, parseISO } from 'date-fns' // Import parseISO for timestamp strings

// Interface matching the CORRECT 'meetings' table schema based on sample
interface Meeting {
  id: string;
  full_name: string | null;
  email: string | null;
  company_name?: string | null; // Optional based on sample
  start_time: string | null; // This is a timestamp string like "2025-10-20 09:00:00+00"
  goal: string | null; // Using 'goal' instead of 'agenda'
  status: string;
  created_at: string;
  // Other fields from sample can be added if needed: google_calendar_event_id, monthly_budget, client_number
}

export function LeadsTable() { // Renaming conceptually, file name stays
  const companySupabase = useCompanySupabase();
  const { toast } = useToast();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentNotes, setCurrentNotes] = useState<string>("");

  useEffect(() => {
    async function fetchMeetings() {
      if (!companySupabase) {
        setIsLoading(false); return;
      }
      setIsLoading(true);
      try {
        // --- CORRECTED QUERY: Select existing columns ---
        const { data, error, count } = await companySupabase
          .from("meetings")
          // Select columns based on the sample row provided
          .select("id, full_name, email, company_name, start_time, goal, status, created_at", { count: 'exact' })
          .order("created_at", { ascending: false });

        if (error) {
          console.error("LeadsTable: Error fetching meetings:", error);
          toast({ title: "Error", description: `Failed to fetch meetings: ${error.message}`, variant: "destructive" });
          setMeetings([]);
        } else {
          console.log(`LeadsTable: Successfully fetched ${count ?? 'unknown'} meetings.`);
          console.log("LeadsTable: Raw data:", data);
          setMeetings(data || []);
        }
      } catch (catchError) {
          console.error("LeadsTable: Unexpected error during fetchMeetings:", catchError);
          toast({ title: "Fetch Error", description: "An unexpected error occurred while fetching meetings.", variant: "destructive" });
          setMeetings([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchMeetings();
  }, [companySupabase, toast]);

  // Update meeting status (remains the same)
  const handleUpdateMeetingStatus = async (meetingId: string, newStatus: string) => {
    // ... update logic ...
      if (!companySupabase) return;
        setIsUpdating(true);
        try {
        const { error } = await companySupabase.from("meetings").update({ status: newStatus }).eq("id", meetingId);
        if (error) throw error;
        setMeetings((prev) => prev.map((m) => (m.id === meetingId ? { ...m, status: newStatus } : m)));
        if (selectedMeeting?.id === meetingId) setSelectedMeeting(prev => prev ? {...prev, status: newStatus} : null);
        toast({ title: "Success", description: "Meeting status updated." });
        } catch (error) { const err = error as Error; toast({ title: "Error", description: `Failed to update status: ${err.message}`, variant: "destructive" }); }
        finally { setIsUpdating(false); }
  };

  // Filter logic (adjusted for company_name)
  const filteredMeetings = meetings.filter((meeting) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      meeting.full_name?.toLowerCase().includes(searchLower) ||
      meeting.email?.toLowerCase().includes(searchLower) ||
      meeting.company_name?.toLowerCase().includes(searchLower); // Added company_name
    const matchesStatus = statusFilter === "all" || meeting.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Status badge colors (remains the same)
  const getStatusColor = (status: string) => { /* ... switch statement ... */
    switch (status) { case "confirmed": return "bg-green-500/10 text-green-500 border-green-500/20"; case "pending_confirmation": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"; case "cancelled": return "bg-red-500/10 text-red-500 border-red-500/20"; default: return "bg-[#EDE7C7]/10 text-[#EDE7C7] border-[#EDE7C7]/20"; }
  };

  // Helper to format the start_time timestamp
  const formatStartTime = (startTime: string | null): string => {
      if (!startTime) return "N/A";
      try {
          // Parse the ISO-like string and format it
          return format(parseISO(startTime.replace(' ', 'T')), 'MMM d, yyyy h:mm a'); // Example: Oct 20, 2025 9:00 AM
      } catch (e) {
          console.error("Error formatting start_time:", startTime, e);
          return "Invalid Date"; // Fallback for invalid date strings
      }
  };


  // --- RENDER LOGIC ---
  if (!companySupabase && !isLoading) { /* ... Database not connected message ... */
    return ( <Card className="bg-[#1A1A1A] border-[#2A2A2A]"><CardContent className="pt-6"><div className="text-center py-12"><AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" /><h3 className="text-xl font-bold text-[#EDE7C7]">Database Not Connected</h3><p className="text-[#EDE7C7]/60 mt-2 max-w-md mx-auto">Please go to the settings page to connect your bot's database.</p><Button asChild className="mt-6 bg-[#EDE7C7] text-[#0A0A0A] hover:bg-[#EDE7C7]/90"><Link href="/dashboard/settings">Go to Settings</Link></Button></div></CardContent></Card> );
  }
  if (isLoading) { /* ... Loading state ... */
     return ( <Card className="bg-[#1A1A1A] border-[#2A2A2A]"><CardHeader><CardTitle className="text-[#EDE7C7]">Meetings</CardTitle></CardHeader><CardContent><div className="text-center py-12 text-[#EDE7C7]/60">Loading meetings...</div></CardContent></Card> );
  }

  return (
    <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
      <CardHeader>
        <CardTitle className="text-[#EDE7C7]">Meetings ({filteredMeetings.length})</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
             {/* Search and Filter */}
             <div className="relative flex-1"> <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#EDE7C7]/40" /> <Input placeholder="Search name, email, company..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-[#0A0A0A] border-[#2A2A2A] text-[#EDE7C7]" /> </div> <Select value={statusFilter} onValueChange={setStatusFilter}> <SelectTrigger className="w-full sm:w-[180px] bg-[#0A0A0A] border-[#2A2A2A] text-[#EDE7C7]"><SelectValue placeholder="Filter by status" /></SelectTrigger> <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]"> <SelectItem value="all">All Status</SelectItem> <SelectItem value="confirmed">Confirmed</SelectItem> <SelectItem value="pending_confirmation">Pending</SelectItem> <SelectItem value="cancelled">Cancelled</SelectItem> </SelectContent> </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {meetings.length === 0 ? (
            <p className="text-[#EDE7C7]/60 text-sm text-center py-8">No meetings have been booked yet.</p>
          ) : filteredMeetings.length === 0 ? (
            <p className="text-[#EDE7C7]/60 text-sm text-center py-8">No meetings match your current filters.</p>
          ) : (
            filteredMeetings.map((meeting) => (
              <div key={meeting.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-[#0A0A0A] border border-[#2A2A2A]">
                {/* Meeting Row Display - Uses correct fields */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="font-medium text-[#EDE7C7]">{meeting.full_name || "N/A"}</p>
                    <Badge className={getStatusColor(meeting.status)}>{meeting.status?.replace(/_/g, ' ') || 'Unknown'}</Badge>
                  </div>
                  <div className="text-sm text-[#EDE7C7]/60 space-y-1">
                    <p className="flex items-center gap-1.5"><Mail className="h-3 w-3 flex-shrink-0"/> {meeting.email || "N/A"}</p>
                     {/* Display formatted start_time */}
                    <p className="flex items-center gap-1.5"><Calendar className="h-3 w-3 flex-shrink-0"/> {formatStartTime(meeting.start_time)}</p>
                  </div>
                  <p className="text-xs text-[#EDE7C7]/40">
                    Booked: {format(parseISO(meeting.created_at), 'MMM d, yyyy h:mm a')}
                  </p>
                </div>
                 {/* View Details Button and Dialog */}
                <Dialog onOpenChange={(open) => setSelectedMeeting(open ? meeting : null)}>
                  <DialogTrigger asChild>
                     <Button variant="outline" size="sm" className="bg-[#EDE7C7]/5 border-[#EDE7C7]/20 text-[#EDE7C7] hover:bg-[#EDE7C7]/10"> <Eye className="h-4 w-4 mr-2" /> View Details </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#1A1A1A] border-[#2A2A2A] max-w-lg">
                     <DialogHeader> <DialogTitle className="text-[#EDE7C7]">Meeting Details</DialogTitle> <DialogDescription className="text-[#EDE7C7]/60">View meeting information and update status.</DialogDescription> </DialogHeader>
                    {selectedMeeting && (
                      <div className="space-y-6 pt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            {/* Display fields based on sample row */}
                            <div className="space-y-1"> <Label className="text-[#EDE7C7]/80">Customer</Label> <p className="text-[#EDE7C7] flex items-center gap-2"><User className="h-4 w-4"/> {selectedMeeting.full_name || "N/A"}</p> </div>
                            <div className="space-y-1"> <Label className="text-[#EDE7C7]/80">Email</Label> <p className="text-[#EDE7C7] flex items-center gap-2"><Mail className="h-4 w-4"/> {selectedMeeting.email || "N/A"}</p> </div>
                             {selectedMeeting.company_name && <div className="space-y-1"> <Label className="text-[#EDE7C7]/80">Company</Label> <p className="text-[#EDE7C7]">{selectedMeeting.company_name}</p> </div>}
                            <div className="space-y-1"> <Label className="text-[#EDE7C7]/80">Scheduled Time</Label> <p className="text-[#EDE7C7] flex items-center gap-2"><Calendar className="h-4 w-4"/> {formatStartTime(selectedMeeting.start_time)}</p> </div>
                             <div className="space-y-1"> <Label className="text-[#EDE7C7]/80">Booked On</Label> <p className="text-[#EDE7C7] flex items-center gap-2"><Clock className="h-4 w-4"/> {format(parseISO(selectedMeeting.created_at), 'MMM d, yyyy h:mm a')}</p> </div>
                        </div>
                         {/* Display 'goal' instead of 'agenda' */}
                         {selectedMeeting.goal && (
                           <div>
                            <Label className="text-[#EDE7C7]/80">Goal / Purpose</Label>
                            <p className="text-[#EDE7C7] mt-1 text-sm bg-[#0A0A0A] p-3 rounded border border-[#2A2A2A] whitespace-pre-wrap">{selectedMeeting.goal}</p>
                           </div>
                         )}
                         {/* Status Update */}
                        <div> <Label htmlFor="meetingStatus" className="text-[#EDE7C7]/80">Update Status</Label> <Select value={selectedMeeting.status} onValueChange={(value) => handleUpdateMeetingStatus(selectedMeeting.id, value)} disabled={isUpdating}> <SelectTrigger className="mt-1 w-full bg-[#0A0A0A] border-[#2A2A2A] text-[#EDE7C7]"> <SelectValue /> </SelectTrigger> <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]"> <SelectItem value="pending_confirmation">Pending Confirmation</SelectItem> <SelectItem value="confirmed">Confirmed</SelectItem> <SelectItem value="cancelled">Cancelled</SelectItem> </SelectContent> </Select> </div>
                         {/* Notes */}
                        <div> <Label htmlFor="notes" className="text-[#EDE7C7]/80">Notes (Not Saved)</Label> <Textarea id="notes" value={currentNotes} onChange={(e) => setCurrentNotes(e.target.value)} placeholder="Add temporary notes here..." className="mt-1 bg-[#0A0A0A] border-[#2A2A2A] text-[#EDE7C7]" rows={3}/> <p className="text-xs text-[#EDE7C7]/50 mt-1">Notes are for temporary reference only.</p> </div>
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

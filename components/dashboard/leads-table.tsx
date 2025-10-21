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
import { Search, Eye, AlertTriangle, Calendar, Clock, User, Mail } from "lucide-react"
import Link from "next/link"
import { useCompanySupabase } from "@/lib/supabase/company-client"
import { useToast } from "@/hooks/use-toast"

// Interface matching the 'meetings' table schema
interface Meeting {
  id: string
  customer_name: string
  customer_email: string
  time: string | null
  date: string | null
  agenda: string | null
  status: string
  created_at: string
  // Note: 'notes' field is not in the bot DB schema, handle client-side if needed
}

export function LeadsTable() { // Renamed conceptually to MeetingTable but keep filename for now
  const companySupabase = useCompanySupabase()
  const { toast } = useToast()
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [currentNotes, setCurrentNotes] = useState<string>(""); // State for notes in dialog

  useEffect(() => {
    async function fetchMeetings() {
      if (!companySupabase) {
        setIsLoading(false);
        console.log("Leads(Meetings): Company Supabase client not available.");
        return;
      }
      console.log("Leads(Meetings): Fetching data...");
      setIsLoading(true);
      const { data, error } = await companySupabase
        .from("meetings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching meetings:", error);
        toast({ title: "Error", description: "Failed to fetch meetings.", variant: "destructive" });
      } else {
        setMeetings(data || []);
        console.log("Leads(Meetings): Data fetched successfully.", data);
      }
      setIsLoading(false);
    }
    fetchMeetings();
  }, [companySupabase, toast]);

  // Update meeting status in the bot's database
  const handleUpdateMeetingStatus = async (meetingId: string, newStatus: string) => {
    if (!companySupabase) return;
    setIsUpdating(true);
    try {
      const { error } = await companySupabase
        .from("meetings")
        .update({ status: newStatus, /* updated_at potentially needed? */ })
        .eq("id", meetingId);
      if (error) throw error;

      // Update local state to reflect the change immediately
      setMeetings((prev) =>
        prev.map((m) => (m.id === meetingId ? { ...m, status: newStatus } : m))
      );
      if(selectedMeeting?.id === meetingId) {
          setSelectedMeeting(prev => prev ? {...prev, status: newStatus} : null);
      }
      toast({ title: "Success", description: "Meeting status updated." });
    } catch (error) {
        const err = error as Error;
      toast({ title: "Error", description: `Failed to update status: ${err.message}`, variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  // Filter logic
  const filteredMeetings = meetings.filter((meeting) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      meeting.customer_name?.toLowerCase().includes(searchLower) ||
      meeting.customer_email?.toLowerCase().includes(searchLower);
    const matchesStatus = statusFilter === "all" || meeting.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Status badge colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "pending_confirmation":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "cancelled": // Assuming a cancelled status might exist
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-[#EDE7C7]/10 text-[#EDE7C7] border-[#EDE7C7]/20";
    }
  };

  // Handle opening the dialog and setting notes
  const handleOpenDialog = (meeting: Meeting) => {
      setSelectedMeeting(meeting);
      //setCurrentNotes(meeting.notes || ""); // Reset notes when opening dialog - notes field doesn't exist yet
      setCurrentNotes(""); // Reset notes
  }

   // --- RENDER LOGIC ---

  if (!companySupabase && !isLoading) {
    // Render message if Supabase is not connected
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
        );
  }

  if (isLoading) {
    // Render loading state
     return (
        <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
            <CardHeader><CardTitle className="text-[#EDE7C7]">Meetings</CardTitle></CardHeader>
            <CardContent><div className="text-center py-12 text-[#EDE7C7]/60">Loading meetings...</div></CardContent>
        </Card>
        );
  }

  // Render the table with data
  return (
    <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
      <CardHeader>
        <CardTitle className="text-[#EDE7C7]">Meetings ({filteredMeetings.length})</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#EDE7C7]/40" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#0A0A0A] border-[#2A2A2A] text-[#EDE7C7]"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-[#0A0A0A] border-[#2A2A2A] text-[#EDE7C7]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending_confirmation">Pending</SelectItem>
              {/* Add other potential statuses if needed */}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredMeetings.length === 0 ? (
            <p className="text-[#EDE7C7]/60 text-sm text-center py-8">No meetings found.</p>
          ) : (
            filteredMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-[#0A0A0A] border border-[#2A2A2A]"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <p className="font-medium text-[#EDE7C7]">{meeting.customer_name || "N/A"}</p>
                    <Badge className={getStatusColor(meeting.status)}>{meeting.status.replace(/_/g, ' ')}</Badge>
                  </div>
                  <div className="text-sm text-[#EDE7C7]/60 space-y-1">
                    <p className="flex items-center gap-2"><Mail className="h-3 w-3"/> {meeting.customer_email || "N/A"}</p>
                    <p className="flex items-center gap-2"><Calendar className="h-3 w-3"/> {meeting.date || "N/A"} at {meeting.time || "N/A"}</p>
                  </div>
                   <p className="text-xs text-[#EDE7C7]/40">
                    Booked on: {new Date(meeting.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Dialog onOpenChange={(open) => { if (open) handleOpenDialog(meeting); else setSelectedMeeting(null); }}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="bg-[#EDE7C7]/5 border-[#EDE7C7]/20 text-[#EDE7C7] hover:bg-[#EDE7C7]/10">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#1A1A1A] border-[#2A2A2A] max-w-lg">
                    <DialogHeader>
                      <DialogTitle className="text-[#EDE7C7]">Meeting Details</DialogTitle>
                      <DialogDescription className="text-[#EDE7C7]/60">View and update meeting status.</DialogDescription>
                    </DialogHeader>
                    {selectedMeeting && (
                      <div className="space-y-6 pt-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <Label className="text-[#EDE7C7]/80 block mb-1">Customer</Label>
                            <p className="text-[#EDE7C7] flex items-center gap-2"><User className="h-4 w-4"/> {selectedMeeting.customer_name || "N/A"}</p>
                          </div>
                           <div>
                            <Label className="text-[#EDE7C7]/80 block mb-1">Email</Label>
                            <p className="text-[#EDE7C7] flex items-center gap-2"><Mail className="h-4 w-4"/> {selectedMeeting.customer_email || "N/A"}</p>
                          </div>
                          <div>
                            <Label className="text-[#EDE7C7]/80 block mb-1">Date & Time</Label>
                            <p className="text-[#EDE7C7] flex items-center gap-2"><Calendar className="h-4 w-4"/> {selectedMeeting.date || "N/A"} at {selectedMeeting.time || "N/A"}</p>
                          </div>
                           <div>
                            <Label className="text-[#EDE7C7]/80 block mb-1">Booked On</Label>
                            <p className="text-[#EDE7C7] flex items-center gap-2"><Clock className="h-4 w-4"/> {new Date(selectedMeeting.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                         {selectedMeeting.agenda && (
                           <div>
                            <Label className="text-[#EDE7C7]/80">Agenda</Label>
                            <p className="text-[#EDE7C7] mt-1 text-sm bg-[#0A0A0A] p-3 rounded border border-[#2A2A2A]">{selectedMeeting.agenda}</p>
                          </div>
                         )}
                        <div>
                          <Label htmlFor="meetingStatus" className="text-[#EDE7C7]/80">Status</Label>
                          <Select
                            value={selectedMeeting.status}
                            onValueChange={(value) => handleUpdateMeetingStatus(selectedMeeting.id, value)}
                            disabled={isUpdating}
                          >
                            <SelectTrigger className="mt-1 bg-[#0A0A0A] border-[#2A2A2A] text-[#EDE7C7]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                              <SelectItem value="pending_confirmation">Pending Confirmation</SelectItem>
                              <SelectItem value="confirmed">Confirmed</SelectItem>
                              {/* Add other statuses like 'cancelled' if applicable */}
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {/* Notes Section (Client-Side Only) */}
                        <div>
                          <Label htmlFor="notes" className="text-[#EDE7C7]/80">Notes (Not Saved)</Label>
                          <Textarea
                            id="notes"
                            value={currentNotes}
                            onChange={(e) => setCurrentNotes(e.target.value)}
                            placeholder="Add temporary notes here..."
                            className="mt-1 bg-[#0A0A0A] border-[#2A2A2A] text-[#EDE7C7]"
                            rows={3}
                          />
                           <p className="text-xs text-[#EDE7C7]/50 mt-1">Note: Notes are not saved to the database.</p>
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

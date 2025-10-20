"use client"

import { useState, useEffect, useRef } from "react" // Added useRef
import type { RealtimeChannel } from "@supabase/supabase-js" // Added type
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, Eye, User, Mail, Building, Phone, Save, Users, RefreshCw } from "lucide-react" // Added RefreshCw
import { useCompanySupabase } from "@/lib/supabase/company-client"
import { useToast } from "@/hooks/use-toast"
import { format, parseISO } from "date-fns"
import { ScrollArea } from "@/components/ui/scroll-area"

// Interface matching the 'leads' table schema
interface Lead {
  id: string
  full_name: string
  email: string
  phone: string | null
  company_name: string | null
  message: string | null
  status: string
  notes: string | null
  created_at: string
  updated_at: string
  source?: string | null
}

interface LeadsTableProps {
  leads: Lead[]
  initialSearch?: string
}

// Helper function to format a call entry (used for initial fetch and realtime payloads)
const formatLeadEntry = (data: any): Lead => ({
  id: data.id,
  full_name: data.full_name,
  email: data.email,
  phone: data.phone,
  company_name: data.company_name,
  message: data.message,
  status: data.status,
  notes: data.notes,
  created_at: data.created_at,
  updated_at: data.updated_at,
  source: data.source,
});

export function LeadsTable({ leads: initialLeads, initialSearch = "" }: LeadsTableProps) {
  const companySupabase = useCompanySupabase()
  const { toast } = useToast()
  
  const [leads, setLeads] = useState<Lead[]>(initialLeads.map(formatLeadEntry))
  const [searchTerm, setSearchTerm] = useState(initialSearch) 
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [currentNotes, setCurrentNotes] = useState<string>("")
  const [currentStatus, setCurrentStatus] = useState<string>("")
  const [isSaving, setIsSaving] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const channelRef = useRef<RealtimeChannel | null>(null) // Ref for Realtime channel

  // Effect 1: Update local leads state when new props arrive (e.g., on manual refresh)
  useEffect(() => {
    setLeads(initialLeads.map(formatLeadEntry));
  }, [initialLeads]);
  
  // Effect 2: Update the search term when navigating from an external link
  useEffect(() => {
      if (initialSearch) {
          setSearchTerm(initialSearch);
      }
  }, [initialSearch]);


  // Effect 3: Realtime Subscription Setup
  useEffect(() => {
    if (companySupabase) {
      console.log("LeadsTable: Setting up Realtime subscription...");

      const handleInserts = (payload: any) => {
        const newLead = formatLeadEntry(payload.new);
        setLeads(currentLeads => [newLead, ...currentLeads]);
        toast({ title: "New Lead", description: `Lead from ${newLead.full_name} received.`, duration: 3000 });
      };

      const handleUpdates = (payload: any) => {
        const updatedLead = formatLeadEntry(payload.new);
        setLeads(currentLeads => currentLeads.map(lead =>
            lead.id === updatedLead.id ? updatedLead : lead
        ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())); // Re-sort after update

        // Update selected lead if it's the one that changed
        setSelectedLead(currentSelected =>
            currentSelected?.id === updatedLead.id ? updatedLead : currentSelected
        );
      };
      
      const handleDeletes = (payload: any) => {
          setLeads(currentLeads => currentLeads.filter(lead => lead.id !== payload.old.id));
          setSelectedLead(currentSelected => (currentSelected?.id === payload.old.id ? null : currentSelected));
      }


      const channel = companySupabase
        .channel('leads-changes')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'leads' },
          handleInserts
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'leads' },
          handleUpdates
        )
         .on(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'leads' },
          handleDeletes
        )
        .subscribe((status, err) => {
            if (status === 'SUBSCRIBED') { console.log('Leads Realtime channel subscribed.'); }
            if (status === 'CHANNEL_ERROR') { console.error('Leads Realtime error:', err); }
        });

      channelRef.current = channel;

      return () => {
        if (channelRef.current) {
          companySupabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }
      }
    } else {
      // Clear up channel if Supabase client becomes unavailable
      if (channelRef.current) {
         const client = companySupabase.removeChannel(channelRef.current);
         channelRef.current = null;
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companySupabase])


  // Filter logic based on the local 'leads' state
  const filteredLeads = leads.filter((lead) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      lead.full_name?.toLowerCase().includes(searchLower) ||
      lead.email?.toLowerCase().includes(searchLower) ||
      lead.company_name?.toLowerCase().includes(searchLower) ||
      lead.phone?.includes(searchTerm) ||
      // Allow searching by part of the conversation_id/lead.id (first 8 chars)
      lead.id?.toLowerCase().substring(0, 8).includes(searchLower)


    const matchesFilter = filterStatus === "all" || lead.status === filterStatus

    return matchesSearch && matchesFilter
  })

  // Helper for status badge colors (remains the same)
  const getStatusBadge = (status: string) => {
    let className = "border-[#EDE7C7]/50 text-[#EDE7C7]/60"
    if (status === "new") className = "border-blue-500/50 text-blue-500"
    if (status === "contacted") className = "border-yellow-500/50 text-yellow-500"
    if (status === "qualified") className = "border-teal-500/50 text-teal-500"
    if (status === "converted") className = "border-green-500/50 text-green-500"
    if (status === "unqualified") className = "border-red-500/50 text-red-500"
    return <Badge variant="outline" className={`text-xs capitalize ${className}`}>{status.replace(/_/g, " ")}</Badge>
  }

  // Handle opening the dialog and setting initial states
  const handleViewDetails = (lead: Lead) => {
    setSelectedLead(lead)
    setCurrentNotes(lead.notes || "")
    setCurrentStatus(lead.status)
    setIsDialogOpen(true)
  }

  // Handle saving changes (Status and Notes)
  const handleSaveChanges = async () => {
    if (!selectedLead || !companySupabase) return
    setIsSaving(true)

    const updates = {
      status: currentStatus,
      notes: currentNotes,
      updated_at: new Date().toISOString(),
    }

    try {
      // The update request is sent. Realtime listener will handle updating the state.
      const { error } = await companySupabase
        .from("leads")
        .update(updates)
        .eq("id", selectedLead.id)

      if (error) throw error

      // Update the currently selected lead object to prevent stale data in the open dialog.
      setSelectedLead(prev => ({ ...(prev as Lead), ...updates }));

      toast({ title: "Success", description: "Lead details updated." })
      setIsDialogOpen(false)
    } catch (error: any) {
      console.error("Error updating lead:", error)
      toast({
        title: "Error",
        description: `Failed to update lead: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="bg-[#1A1A1A] border-[#2A2A2A] transition-all duration-200 hover:border-[#EDE7C7]/20 flex flex-col h-[600px]">
      {/* Card Header with Search and Filter */}
      <CardHeader className="flex-shrink-0">
        <CardTitle className="text-[#EDE7C7]">Leads ({filteredLeads.length})</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#EDE7C7]/40" />
            <Input
              placeholder="Search name, email, company, phone, or Conversation ID"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-[#0A0A0A] border-[#2A2A2A] text-[#EDE7C7] h-10 text-sm"
            />
          </div>
          {/* Filter Dropdown */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[180px] bg-[#0A0A0A] border-[#2A2A2A] text-[#EDE7C7] h-10 text-sm">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="unqualified">Unqualified</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      {/* Card Content with Scrollable List */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-3 p-6 pt-0">
            {leads.length === 0 ? (
              <div className="flex items-center justify-center py-12 min-h-[200px]">
                <div className="text-center px-4">
                  <Users className="h-12 w-12 text-[#EDE7C7]/20 mx-auto mb-3" />
                  <p className="text-base text-[#EDE7C7]/60">No leads found.</p>
                  <p className="text-sm text-[#EDE7C7]/50 mt-1">Leads from the website form will appear here.</p>
                </div>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="flex items-center justify-center py-12 min-h-[200px]">
                <div className="text-center px-4">
                  <Search className="h-12 w-12 text-[#EDE7C7]/20 mx-auto mb-3" />
                  <p className="text-base text-[#EDE7C7]/60">No leads match your current filters.</p>
                  <p className="text-sm text-[#EDE7C7]/50 mt-1">Try clearing the search or changing the filter.</p>
                </div>
              </div>
            ) : (
              // Lead List Items
              filteredLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-[#0A0A0A] border border-[#2A2A2A]"
                >
                  {/* Lead Row Display */}
                  <div className="flex-1 space-y-1.5 overflow-hidden">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="font-medium text-[#EDE7C7] truncate">{lead.full_name || "N/A"}</p>
                      {getStatusBadge(lead.status)}
                    </div>
                    <div className="text-sm text-[#EDE7C7]/60 space-y-1">
                      <p className="flex items-center gap-1.5 truncate">
                        <Mail className="h-3.5 w-3.5 flex-shrink-0" /> {lead.email || "N/A"}
                      </p>
                      {lead.company_name && (
                        <p className="flex items-center gap-1.5 truncate">
                          <Building className="h-3.5 w-3.5 flex-shrink-0" /> {lead.company_name}
                        </p>
                      )}
                      {lead.phone && (
                        <p className="flex items-center gap-1.5 truncate">
                          <Phone className="h-3.5 w-3.5 flex-shrink-0" /> {lead.phone}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-[#EDE7C7]/40 pt-1">
                      Received: {format(parseISO(lead.created_at), "MMM d, yyyy h:mm a")}
                    </p>
                  </div>
                  {/* View Details Button Trigger */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(lead)}
                    className="bg-[#EDE7C7]/5 border-[#EDE7C7]/20 text-[#EDE7C7] hover:bg-[#EDE7C7]/10 flex-shrink-0 mt-2 sm:mt-0"
                  >
                    <Eye className="h-4 w-4 mr-2" /> View Details
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>

      {/* Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {/* DialogTrigger is handled by the button onClick */}
        <DialogContent className="bg-[#1A1A1A] border-[#2A2A2A] max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#EDE7C7]">Lead Details</DialogTitle>
            <DialogDescription className="text-[#EDE7C7]/60">
              View and update details for {selectedLead?.full_name || "lead"}.
            </DialogDescription>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-6 pt-4 text-sm max-h-[70vh] overflow-y-auto pr-2">
              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                     <Label className="text-[#EDE7C7]/80">Full Name</Label>
                     <p className="text-[#EDE7C7] flex items-center gap-2">
                     <User className="h-4 w-4" /> {selectedLead.full_name || "N/A"}
                     </p>
                  </div>
                  <div className="space-y-1">
                     <Label className="text-[#EDE7C7]/80">Email</Label>
                     <p className="text-[#EDE7C7] flex items-center gap-2 truncate">
                     <Mail className="h-4 w-4 flex-shrink-0" /> {selectedLead.email || "N/A"}
                     </p>
                  </div>
                  {selectedLead.phone && (
                     <div className="space-y-1">
                     <Label className="text-[#EDE7C7]/80">Phone</Label>
                     <p className="text-[#EDE7C7] flex items-center gap-2">
                        <Phone className="h-4 w-4" /> {selectedLead.phone}
                     </p>
                     </div>
                  )}
                  {selectedLead.company_name && (
                     <div className="space-y-1">
                     <Label className="text-[#EDE7C7]/80">Company</Label>
                     <p className="text-[#EDE7C7] flex items-center gap-2">
                        <Building className="h-4 w-4" /> {selectedLead.company_name}
                     </p>
                     </div>
                  )}
              </div>

              {/* Status Update */}
              <div className="space-y-2 border-t border-[#2A2A2A] pt-4">
                <Label htmlFor="leadStatus" className="text-[#EDE7C7]/80 font-medium">Status</Label>
                <Select value={currentStatus} onValueChange={setCurrentStatus}>
                  <SelectTrigger id="leadStatus" className="bg-[#0A0A0A] border-[#2A2A2A] text-[#EDE7C7]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="converted">Converted</SelectItem>
                    <SelectItem value="unqualified">Unqualified</SelectItem>
                  </SelectContent>
                </Select>
              </div>

               {/* Submission Details (Read-only) */}
               <div className="space-y-3 border-t border-[#2A2A2A] pt-4">
                  <div className="flex justify-between">
                     <span className="text-[#EDE7C7]/60">Received</span>
                     <span className="text-[#EDE7C7] text-right">
                        {format(parseISO(selectedLead.created_at), "MMM d, yyyy h:mm a")}
                     </span>
                  </div>
                   {selectedLead.source && (
                     <div className="flex justify-between">
                        <span className="text-[#EDE7C7]/60">Source</span>
                        <span className="text-[#EDE7C7] capitalize">{selectedLead.source.replace(/_/g, " ")}</span>
                     </div>
                   )}
               </div>

              {/* Message / Interest (Read-only) */}
              {selectedLead.message && (
                <div className="border-t border-[#2A2A2A] pt-4">
                  <Label className="text-[#EDE7C7]/80 block mb-2 font-medium">Message / Interest</Label>
                  <p className="text-[#EDE7C7] bg-[#0A0A0A] p-3 rounded border border-[#2A2A2A] whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {selectedLead.message}
                  </p>
                </div>
              )}

              {/* Notes (Editable) */}
              <div className="border-t border-[#2A2A2A] pt-4">
                <Label htmlFor="leadNotesEdit" className="text-[#EDE7C7]/80 block mb-2 font-medium">
                  Notes
                </Label>
                <Textarea
                  id="leadNotesEdit"
                  value={currentNotes}
                  onChange={(e) => setCurrentNotes(e.target.value)}
                  placeholder="Add notes about this lead..."
                  className="mt-1 bg-[#0A0A0A] border-[#2A2A2A] text-[#EDE7C7]"
                  rows={4}
                />
              </div>
            </div>
          )}
          {/* Dialog Footer with Save Button */}
          <DialogFooter className="pt-6 border-t border-[#2A2A2A] mt-6">
            <DialogClose asChild>
                <Button variant="outline" className="text-[#EDE7C7]/80 border-[#2A2A2A] hover:bg-[#2A2A2A]/50 hover:text-[#EDE7C7]">Cancel</Button>
            </DialogClose>
            <Button
                onClick={handleSaveChanges}
                disabled={isSaving || !selectedLead}
                className="bg-[#EDE7C7] text-[#0A0A0A] hover:bg-[#EDE7C7]/90"
            >
              {isSaving ? "Saving..." : <><Save className="h-4 w-4 mr-2" /> Save Changes</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

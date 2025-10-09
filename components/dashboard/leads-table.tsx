"use client"

import { useState } from "react"
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
import { Search, Eye } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Lead {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  message: string | null
  status: string
  notes: string | null
  created_at: string
}

interface LeadsTableProps {
  leads: Lead[]
}

export function LeadsTable({ leads: initialLeads }: LeadsTableProps) {
  const [leads, setLeads] = useState(initialLeads)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || lead.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "contacted":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "converted":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "lost":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-[#EDE7C7]/10 text-[#EDE7C7] border-[#EDE7C7]/20"
    }
  }

  const handleUpdateLead = async (leadId: string, updates: Partial<Lead>) => {
    setIsUpdating(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("leads").update(updates).eq("id", leadId)

      if (error) throw error

      setLeads((prev) => prev.map((lead) => (lead.id === leadId ? { ...lead, ...updates } : lead)))

      toast.success("Lead updated successfully")
      router.refresh()
    } catch (error) {
      toast.error("Failed to update lead")
      console.error(error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
      <CardHeader>
        <CardTitle className="text-[#EDE7C7]">All Leads ({filteredLeads.length})</CardTitle>
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#EDE7C7]/40" />
            <Input
              placeholder="Search leads..."
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
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="converted">Converted</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredLeads.length === 0 ? (
            <p className="text-[#EDE7C7]/60 text-sm text-center py-8">No leads found matching your criteria.</p>
          ) : (
            filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-[#0A0A0A] border border-[#2A2A2A]"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <p className="font-medium text-[#EDE7C7]">{lead.name}</p>
                    <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                  </div>
                  <div className="text-sm text-[#EDE7C7]/60 space-y-1">
                    <p>{lead.email}</p>
                    {lead.phone && <p>{lead.phone}</p>}
                    {lead.company && <p className="text-[#EDE7C7]/40">{lead.company}</p>}
                  </div>
                  <p className="text-xs text-[#EDE7C7]/40">
                    {new Date(lead.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedLead(lead)}
                      className="bg-[#EDE7C7]/5 border-[#EDE7C7]/20 text-[#EDE7C7] hover:bg-[#EDE7C7]/10"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#1A1A1A] border-[#2A2A2A] max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-[#EDE7C7]">Lead Details</DialogTitle>
                      <DialogDescription className="text-[#EDE7C7]/60">
                        View and update lead information
                      </DialogDescription>
                    </DialogHeader>
                    {selectedLead && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-[#EDE7C7]/80">Name</Label>
                            <p className="text-[#EDE7C7] mt-1">{selectedLead.name}</p>
                          </div>
                          <div>
                            <Label className="text-[#EDE7C7]/80">Email</Label>
                            <p className="text-[#EDE7C7] mt-1">{selectedLead.email}</p>
                          </div>
                          <div>
                            <Label className="text-[#EDE7C7]/80">Phone</Label>
                            <p className="text-[#EDE7C7] mt-1">{selectedLead.phone || "N/A"}</p>
                          </div>
                          <div>
                            <Label className="text-[#EDE7C7]/80">Company</Label>
                            <p className="text-[#EDE7C7] mt-1">{selectedLead.company || "N/A"}</p>
                          </div>
                        </div>

                        {selectedLead.message && (
                          <div>
                            <Label className="text-[#EDE7C7]/80">Message</Label>
                            <p className="text-[#EDE7C7] mt-1 text-sm">{selectedLead.message}</p>
                          </div>
                        )}

                        <div>
                          <Label htmlFor="status" className="text-[#EDE7C7]/80">
                            Status
                          </Label>
                          <Select
                            value={selectedLead.status}
                            onValueChange={(value) => handleUpdateLead(selectedLead.id, { status: value })}
                            disabled={isUpdating}
                          >
                            <SelectTrigger className="mt-1 bg-[#0A0A0A] border-[#2A2A2A] text-[#EDE7C7]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="contacted">Contacted</SelectItem>
                              <SelectItem value="converted">Converted</SelectItem>
                              <SelectItem value="lost">Lost</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="notes" className="text-[#EDE7C7]/80">
                            Notes
                          </Label>
                          <Textarea
                            id="notes"
                            value={selectedLead.notes || ""}
                            onChange={(e) => setSelectedLead({ ...selectedLead, notes: e.target.value })}
                            placeholder="Add notes about this lead..."
                            className="mt-1 bg-[#0A0A0A] border-[#2A2A2A] text-[#EDE7C7]"
                            rows={4}
                          />
                          <Button
                            onClick={() => handleUpdateLead(selectedLead.id, { notes: selectedLead.notes })}
                            disabled={isUpdating}
                            className="mt-2 bg-[#EDE7C7] text-[#0A0A0A] hover:bg-[#EDE7C7]/90"
                          >
                            {isUpdating ? "Saving..." : "Save Notes"}
                          </Button>
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

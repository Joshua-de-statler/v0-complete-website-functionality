"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

interface Lead {
  id: string
  email: string
  full_name: string
  company_name: string | null
  phone: string | null
  message: string | null
  status: string
  source: string
  created_at: string
  updated_at: string
  last_contacted_at: string | null
  notes: string | null
}

interface LeadsTableProps {
  leads: Lead[]
}

export function LeadsTable({ leads: initialLeads }: LeadsTableProps) {
  const [leads, setLeads] = useState(initialLeads)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [notes, setNotes] = useState("")
  const [status, setStatus] = useState("")

  const handleUpdateLead = async () => {
    if (!selectedLead) return

    setIsUpdating(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("leads")
        .update({
          status,
          notes,
          last_contacted_at: new Date().toISOString(),
        })
        .eq("id", selectedLead.id)

      if (error) throw error

      // Update local state
      setLeads(
        leads.map((lead) =>
          lead.id === selectedLead.id ? { ...lead, status, notes, last_contacted_at: new Date().toISOString() } : lead,
        ),
      )

      setSelectedLead(null)
    } catch (error) {
      console.error("[v0] Error updating lead:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-[#C41E3A]/20 text-[#C41E3A] border-[#C41E3A]/30"
      case "contacted":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "qualified":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "converted":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "lost":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      default:
        return "bg-[#EDE7C7]/20 text-[#EDE7C7] border-[#EDE7C7]/30"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card className="bg-[#8B1538]/10 backdrop-blur-md border-[#C41E3A]/20">
      <CardHeader>
        <CardTitle className="text-2xl text-[#EDE7C7]">All Leads</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#C41E3A]/20">
                <th className="text-left py-3 px-4 text-[#EDE7C7]/70 font-medium">Name</th>
                <th className="text-left py-3 px-4 text-[#EDE7C7]/70 font-medium">Email</th>
                <th className="text-left py-3 px-4 text-[#EDE7C7]/70 font-medium">Company</th>
                <th className="text-left py-3 px-4 text-[#EDE7C7]/70 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-[#EDE7C7]/70 font-medium">Created</th>
                <th className="text-left py-3 px-4 text-[#EDE7C7]/70 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-[#EDE7C7]/50">
                    No leads yet. They will appear here once submitted.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-[#C41E3A]/10 hover:bg-[#C41E3A]/5">
                    <td className="py-3 px-4 text-[#EDE7C7]">{lead.full_name}</td>
                    <td className="py-3 px-4 text-[#EDE7C7]/80">{lead.email}</td>
                    <td className="py-3 px-4 text-[#EDE7C7]/80">{lead.company_name || "-"}</td>
                    <td className="py-3 px-4">
                      <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-[#EDE7C7]/80 text-sm">{formatDate(lead.created_at)}</td>
                    <td className="py-3 px-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-[#C41E3A]/20 border-[#C41E3A]/30 text-[#EDE7C7] hover:bg-[#C41E3A]/30"
                            onClick={() => {
                              setSelectedLead(lead)
                              setStatus(lead.status)
                              setNotes(lead.notes || "")
                            }}
                          >
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-[#200E01] border-[#C41E3A]/30 text-[#EDE7C7] max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="text-2xl">Lead Details</DialogTitle>
                            <DialogDescription className="text-[#EDE7C7]/70">
                              View and update lead information
                            </DialogDescription>
                          </DialogHeader>
                          {selectedLead && (
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <div className="text-sm text-[#EDE7C7]/70 mb-1">Full Name</div>
                                  <div className="text-[#EDE7C7]">{selectedLead.full_name}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-[#EDE7C7]/70 mb-1">Email</div>
                                  <div className="text-[#EDE7C7]">{selectedLead.email}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-[#EDE7C7]/70 mb-1">Company</div>
                                  <div className="text-[#EDE7C7]">{selectedLead.company_name || "-"}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-[#EDE7C7]/70 mb-1">Phone</div>
                                  <div className="text-[#EDE7C7]">{selectedLead.phone || "-"}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-[#EDE7C7]/70 mb-1">Source</div>
                                  <div className="text-[#EDE7C7]">{selectedLead.source}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-[#EDE7C7]/70 mb-1">Created</div>
                                  <div className="text-[#EDE7C7]">{formatDate(selectedLead.created_at)}</div>
                                </div>
                              </div>

                              {selectedLead.message && (
                                <div>
                                  <div className="text-sm text-[#EDE7C7]/70 mb-1">Message</div>
                                  <div className="text-[#EDE7C7] bg-[#8B1538]/10 p-3 rounded-lg">
                                    {selectedLead.message}
                                  </div>
                                </div>
                              )}

                              <div className="space-y-2">
                                <Label htmlFor="status" className="text-[#EDE7C7]">
                                  Status
                                </Label>
                                <Select value={status} onValueChange={setStatus}>
                                  <SelectTrigger className="bg-[#200E01]/50 border-[#C41E3A]/30 text-[#EDE7C7]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-[#200E01] border-[#C41E3A]/30">
                                    <SelectItem value="new" className="text-[#EDE7C7]">
                                      New
                                    </SelectItem>
                                    <SelectItem value="contacted" className="text-[#EDE7C7]">
                                      Contacted
                                    </SelectItem>
                                    <SelectItem value="qualified" className="text-[#EDE7C7]">
                                      Qualified
                                    </SelectItem>
                                    <SelectItem value="converted" className="text-[#EDE7C7]">
                                      Converted
                                    </SelectItem>
                                    <SelectItem value="lost" className="text-[#EDE7C7]">
                                      Lost
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="notes" className="text-[#EDE7C7]">
                                  Notes
                                </Label>
                                <Textarea
                                  id="notes"
                                  value={notes}
                                  onChange={(e) => setNotes(e.target.value)}
                                  className="bg-[#200E01]/50 border-[#C41E3A]/30 text-[#EDE7C7] min-h-24"
                                  placeholder="Add notes about this lead..."
                                />
                              </div>

                              <div className="flex gap-3">
                                <Button
                                  onClick={handleUpdateLead}
                                  disabled={isUpdating}
                                  className="flex-1 bg-gradient-to-r from-[#C41E3A] to-[#8B1538] text-[#EDE7C7] hover:scale-105 transition-all"
                                >
                                  {isUpdating ? "Updating..." : "Update Lead"}
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => setSelectedLead(null)}
                                  className="bg-transparent border-[#C41E3A]/30 text-[#EDE7C7] hover:bg-[#C41E3A]/10"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

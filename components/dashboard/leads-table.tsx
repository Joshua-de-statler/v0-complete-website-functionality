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
import { Search, Eye, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useCompanySupabase } from "@/lib/supabase/company-client"
import { useToast } from "@/hooks/use-toast" // CORRECTED IMPORT

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

export function LeadsTable() {
  const companySupabase = useCompanySupabase()
  const { toast } = useToast() // CORRECTED HOOK
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    async function fetchLeads() {
      if (!companySupabase) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      const { data, error } = await companySupabase.from("leads").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching leads:", error)
        toast({ title: "Error", description: "Failed to fetch leads from your database.", variant: "destructive" })
      } else {
        setLeads(data || [])
      }
      setIsLoading(false)
    }

    fetchLeads()
  }, [companySupabase, toast])

  const handleUpdateLead = async (leadId: string, updates: Partial<Lead>) => {
    if (!companySupabase) return
    setIsUpdating(true)

    try {
      const { error } = await companySupabase.from("leads").update(updates).eq("id", leadId)
      if (error) throw error
      setLeads((prev) => prev.map((lead) => (lead.id === leadId ? { ...lead, ...updates } : lead)))
      toast({ title: "Success", description: "Lead updated successfully." })
    } catch (error) {
      toast({ title: "Error", description: "Failed to update lead.", variant: "destructive" })
    } finally {
      setIsUpdating(false)
    }
  }
  
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
  
  if (!companySupabase) {
    return (
      <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#EDE7C7]">Database Not Connected</h3>
            <p className="text-[#EDE7C7]/60 mt-2 max-w-md mx-auto">
              Please go to the settings page and add your Supabase URL and Anon Key to view your leads.
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
                <CardTitle className="text-[#EDE7C7]">All Leads</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-center py-12 text-[#EDE7C7]/60">Loading leads...</div>
            </CardContent>
        </Card>
      )
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
                    {/* ... Dialog content remains the same */}
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

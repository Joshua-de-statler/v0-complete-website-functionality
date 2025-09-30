"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Lead {
  id: string
  status: string
  created_at: string
}

interface LeadStatsProps {
  leads: Lead[]
}

export function LeadStats({ leads }: LeadStatsProps) {
  const totalLeads = leads.length
  const newLeads = leads.filter((lead) => lead.status === "new").length
  const qualifiedLeads = leads.filter((lead) => lead.status === "qualified").length
  const convertedLeads = leads.filter((lead) => lead.status === "converted").length

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const leadsToday = leads.filter((lead) => new Date(lead.created_at) >= today).length

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      <Card className="bg-[#8B1538]/10 backdrop-blur-md border-[#C41E3A]/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-[#EDE7C7]/70">Total Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-[#EDE7C7]">{totalLeads}</div>
        </CardContent>
      </Card>

      <Card className="bg-[#8B1538]/10 backdrop-blur-md border-[#C41E3A]/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-[#EDE7C7]/70">New</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-[#C41E3A]">{newLeads}</div>
        </CardContent>
      </Card>

      <Card className="bg-[#8B1538]/10 backdrop-blur-md border-[#C41E3A]/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-[#EDE7C7]/70">Qualified</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-400">{qualifiedLeads}</div>
        </CardContent>
      </Card>

      <Card className="bg-[#8B1538]/10 backdrop-blur-md border-[#C41E3A]/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-[#EDE7C7]/70">Converted</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-400">{convertedLeads}</div>
        </CardContent>
      </Card>

      <Card className="bg-[#8B1538]/10 backdrop-blur-md border-[#C41E3A]/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-[#EDE7C7]/70">Today</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-[#EDE7C7]">{leadsToday}</div>
        </CardContent>
      </Card>
    </div>
  )
}

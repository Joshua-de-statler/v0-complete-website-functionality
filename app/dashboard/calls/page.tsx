"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Phone, Play, Pause, Download, Clock, PhoneIncoming, PhoneOutgoing } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const callLogs = [
  {
    id: 1,
    customer: "John Smith",
    phone: "+27 82 123 4567",
    type: "incoming",
    duration: "5:23",
    status: "completed",
    time: "2 hours ago",
    date: "Jan 10, 2025",
    avatar: "JS",
    recording: true,
    transcript:
      "Customer inquired about pricing and features. Provided detailed information about AI agent capabilities.",
  },
  {
    id: 2,
    customer: "Sarah Johnson",
    phone: "+27 83 234 5678",
    type: "outgoing",
    duration: "3:45",
    status: "completed",
    time: "4 hours ago",
    date: "Jan 10, 2025",
    avatar: "SJ",
    recording: true,
    transcript: "Follow-up call regarding demo scheduling. Customer confirmed interest in enterprise plan.",
  },
  {
    id: 3,
    customer: "Mike Wilson",
    phone: "+27 84 345 6789",
    type: "incoming",
    duration: "2:15",
    status: "missed",
    time: "6 hours ago",
    date: "Jan 10, 2025",
    avatar: "MW",
    recording: false,
    transcript: "",
  },
  {
    id: 4,
    customer: "Emma Davis",
    phone: "+27 85 456 7890",
    type: "incoming",
    duration: "7:30",
    status: "completed",
    time: "1 day ago",
    date: "Jan 9, 2025",
    avatar: "ED",
    recording: true,
    transcript: "Technical support call. Resolved integration issues with WhatsApp API.",
  },
  {
    id: 5,
    customer: "David Brown",
    phone: "+27 86 567 8901",
    type: "outgoing",
    duration: "4:12",
    status: "completed",
    time: "1 day ago",
    date: "Jan 9, 2025",
    avatar: "DB",
    recording: true,
    transcript: "Sales call discussing custom AI agent features for construction industry.",
  },
]

export default function CallsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedCall, setSelectedCall] = useState<(typeof callLogs)[0] | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const filteredCalls = callLogs.filter((call) => {
    const matchesSearch =
      call.customer.toLowerCase().includes(searchQuery.toLowerCase()) || call.phone.includes(searchQuery)
    const matchesFilter = filterStatus === "all" || call.status === filterStatus
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-[#EDE7C7]">Voice Calls</h2>
        <p className="text-[#EDE7C7]/60 mt-2">Manage and review your voice call logs</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#EDE7C7]/40" />
          <Input
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-[#1A1A1A] border-[#2A2A2A] text-[#EDE7C7]"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[180px] bg-[#1A1A1A] border-[#2A2A2A] text-[#EDE7C7]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-[#1A1A1A] border-[#2A2A2A]">
            <SelectItem value="all" className="text-[#EDE7C7]">
              All Calls
            </SelectItem>
            <SelectItem value="completed" className="text-[#EDE7C7]">
              Completed
            </SelectItem>
            <SelectItem value="missed" className="text-[#EDE7C7]">
              Missed
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Call Logs List */}
        <Card className="bg-[#1A1A1A] border-[#2A2A2A] lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-[#EDE7C7]">Call History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredCalls.map((call) => (
                <button
                  key={call.id}
                  onClick={() => setSelectedCall(call)}
                  className={`w-full p-4 rounded-lg border transition-colors ${
                    selectedCall?.id === call.id
                      ? "border-[#EDE7C7]/30 bg-[#2A2A2A]/50"
                      : "border-[#2A2A2A] hover:border-[#EDE7C7]/20 hover:bg-[#2A2A2A]/30"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-[#EDE7C7]/10 text-[#EDE7C7]">{call.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-[#EDE7C7]">{call.customer}</p>
                        <Badge
                          variant="outline"
                          className={
                            call.status === "completed"
                              ? "border-green-500/50 text-green-500"
                              : "border-red-500/50 text-red-500"
                          }
                        >
                          {call.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-[#EDE7C7]/60 mb-2">{call.phone}</p>
                      <div className="flex items-center gap-4 text-xs text-[#EDE7C7]/40">
                        <div className="flex items-center gap-1">
                          {call.type === "incoming" ? (
                            <PhoneIncoming className="h-3 w-3" />
                          ) : (
                            <PhoneOutgoing className="h-3 w-3" />
                          )}
                          <span>{call.type}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{call.duration}</span>
                        </div>
                        <span>{call.time}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Call Details */}
        <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
          <CardHeader>
            <CardTitle className="text-[#EDE7C7]">Call Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedCall ? (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-[#EDE7C7]/10 text-[#EDE7C7] text-lg">
                      {selectedCall.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-[#EDE7C7]">{selectedCall.customer}</p>
                    <p className="text-sm text-[#EDE7C7]/60">{selectedCall.phone}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#EDE7C7]/60">Date</span>
                    <span className="text-[#EDE7C7]">{selectedCall.date}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#EDE7C7]/60">Duration</span>
                    <span className="text-[#EDE7C7]">{selectedCall.duration}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#EDE7C7]/60">Type</span>
                    <span className="text-[#EDE7C7] capitalize">{selectedCall.type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#EDE7C7]/60">Status</span>
                    <Badge
                      variant="outline"
                      className={
                        selectedCall.status === "completed"
                          ? "border-green-500/50 text-green-500"
                          : "border-red-500/50 text-red-500"
                      }
                    >
                      {selectedCall.status}
                    </Badge>
                  </div>
                </div>

                {selectedCall.recording && (
                  <>
                    <div className="pt-4 border-t border-[#2A2A2A]">
                      <p className="text-sm font-medium text-[#EDE7C7] mb-3">Recording</p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-[#2A2A2A] text-[#EDE7C7] hover:bg-[#2A2A2A] bg-transparent"
                          onClick={() => {
                            setIsPlaying(!isPlaying)
                            console.log("[v0] Toggling playback:", !isPlaying)
                          }}
                        >
                          {isPlaying ? (
                            <>
                              <Pause className="h-4 w-4 mr-2" />
                              Pause
                            </>
                          ) : (
                            <>
                              <Play className="h-4 w-4 mr-2" />
                              Play
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#2A2A2A] text-[#EDE7C7] hover:bg-[#2A2A2A] bg-transparent"
                          onClick={() => console.log("[v0] Downloading recording")}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#2A2A2A]">
                      <p className="text-sm font-medium text-[#EDE7C7] mb-2">Transcript</p>
                      <p className="text-sm text-[#EDE7C7]/60 leading-relaxed">{selectedCall.transcript}</p>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Phone className="h-12 w-12 text-[#EDE7C7]/20 mx-auto mb-3" />
                <p className="text-sm text-[#EDE7C7]/60">Select a call to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, MessageSquare, Send, MoreVertical, AlertTriangle } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useCompanySupabase } from "@/lib/supabase/company-client"
import { useToast } from "@/hooks/use-toast" // CORRECTED IMPORT
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Archive, Trash2, Download, CheckCircle } from "lucide-react"

interface Message {
  type: "human" | "ai"
  data: {
    content: string
  }
}

interface Conversation {
  conversation_id: string
  history: Message[]
  status: string
  created_at: string
  customerName: string
  lastMessage: string
  lastMessageTime: string
}

export default function ConversationsPage() {
  const companySupabase = useCompanySupabase()
  const { toast } = useToast() // CORRECTED HOOK
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [messageInput, setMessageInput] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchConversations() {
      if (!companySupabase) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      const { data, error } = await companySupabase
        .from("conversation_history")
        .select("conversation_id, history, status, created_at")
        .order("created_at", { ascending: false })

      if (error) {
        toast({ title: "Error", description: "Failed to fetch conversations.", variant: "destructive" })
        console.error(error)
      } else {
        const formattedConversations = (data || []).map((conv: any) => ({
          ...conv,
          customerName: `User-${conv.conversation_id.substring(0, 8)}`,
          lastMessage: conv.history?.[conv.history.length - 1]?.data?.content || "No messages yet",
          lastMessageTime: new Date(conv.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }))
        setConversations(formattedConversations)
        if (formattedConversations.length > 0) {
          setSelectedConversation(formattedConversations[0])
        }
      }
      setIsLoading(false)
    }
    fetchConversations()
  }, [companySupabase, toast])

  const filteredConversations = conversations.filter((conv) =>
    conv.customerName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return

    console.log("[v0] Sending message:", messageInput)
    toast({
      title: "Message Sent",
      description: "Your message has been sent successfully.",
    })
    setMessageInput("")
  }

  const handleMarkResolved = () => {
    console.log("[v0] Marking conversation as resolved:", selectedConversation?.conversation_id)
    toast({
      title: "Conversation Resolved",
      description: "This conversation has been marked as resolved.",
    })
  }

  const handleArchive = () => {
    console.log("[v0] Archiving conversation:", selectedConversation?.conversation_id)
    toast({
      title: "Conversation Archived",
      description: "This conversation has been archived.",
    })
  }

  const handleExport = () => {
    console.log("[v0] Exporting conversation:", selectedConversation?.conversation_id)
    toast({
      title: "Export Started",
      description: "Your conversation is being exported.",
    })
  }

  const handleDelete = () => {
    console.log("[v0] Deleting conversation:", selectedConversation?.conversation_id)
    toast({
      title: "Conversation Deleted",
      description: "This conversation has been deleted.",
      variant: "destructive",
    })
  }

  if (!companySupabase) {
    return (
      <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#EDE7C7]">Database Not Connected</h3>
            <p className="text-[#EDE7C7]/60 mt-2 max-w-md mx-auto">
              Please go to the settings page and add your Supabase URL and Anon Key to view your conversations.
            </p>
            <Button asChild className="mt-6 bg-[#EDE7C7] text-[#0A0A0A] hover:bg-[#EDE7C7]/90">
              <Link href="/dashboard/settings">Go to Settings</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h2 className="text-3xl font-bold text-[#EDE7C7]">Conversations</h2>
        <p className="text-[#EDE7C7]/60 mt-2">Manage your bot's conversations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <Card className="bg-[#1A1A1A] border-[#2A2A2A] lg:col-span-1 flex flex-col overflow-hidden">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="text-[#EDE7C7]">Chats</CardTitle>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#EDE7C7]/40" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-[#0A0A0A] border-[#2A2A2A] text-[#EDE7C7]"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-12 text-[#EDE7C7]/60">Loading...</div>
            ) : (
              <div className="space-y-1">
                {filteredConversations.map((conv) => (
                  <button
                    key={conv.conversation_id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-[#2A2A2A]/50 transition-colors ${selectedConversation?.conversation_id === conv.conversation_id ? "bg-[#2A2A2A]/50" : ""}`}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-[#EDE7C7]/10 text-[#EDE7C7]">
                        {conv.customerName.substring(5, 7)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left overflow-hidden">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-[#EDE7C7]">{conv.customerName}</p>
                        <span className="text-xs text-[#EDE7C7]/40 flex-shrink-0">{conv.lastMessageTime}</span>
                      </div>
                      <p className="text-sm text-[#EDE7C7]/60 truncate">{conv.lastMessage}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2A2A2A] lg:col-span-2 flex flex-col overflow-hidden">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b border-[#2A2A2A] flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-[#EDE7C7]/10 text-[#EDE7C7]">
                        {selectedConversation.customerName.substring(5, 7)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-[#EDE7C7]">{selectedConversation.customerName}</p>
                      <Badge variant="outline" className="border-green-500/50 text-green-500 text-xs">
                        {selectedConversation.status}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-[#EDE7C7] hover:bg-[#2A2A2A]">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#1A1A1A] border-[#2A2A2A]">
                      <DropdownMenuItem
                        onClick={handleMarkResolved}
                        className="text-[#EDE7C7]/80 focus:text-[#EDE7C7] focus:bg-[#2A2A2A]"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as Resolved
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleArchive}
                        className="text-[#EDE7C7]/80 focus:text-[#EDE7C7] focus:bg-[#2A2A2A]"
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleExport}
                        className="text-[#EDE7C7]/80 focus:text-[#EDE7C7] focus:bg-[#2A2A2A]"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Export Chat
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-[#2A2A2A]" />
                      <DropdownMenuItem
                        onClick={handleDelete}
                        className="text-red-500 focus:text-red-500 focus:bg-[#2A2A2A]"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-6 overflow-y-auto">
                <div className="space-y-4">
                  {selectedConversation.history?.map((message, index) => (
                    <div key={index} className={`flex ${message.type === "human" ? "justify-start" : "justify-end"}`}>
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${message.type === "human" ? "bg-[#2A2A2A] text-[#EDE7C7]" : "bg-[#EDE7C7] text-[#0A0A0A]"}`}
                      >
                        <p className="text-sm">{message.data.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <div className="p-4 border-t border-[#2A2A2A] flex-shrink-0">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    className="bg-[#0A0A0A] border-[#2A2A2A] text-[#EDE7C7]"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    className="bg-[#EDE7C7] text-[#0A0A0A] hover:bg-[#EDE7C7]/90 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-[#EDE7C7]/20 mx-auto mb-3" />
                <p className="text-sm text-[#EDE7C7]/60">
                  {isLoading ? "Loading conversations..." : "No conversations found."}
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

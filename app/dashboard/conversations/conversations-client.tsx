"use client"

import { useState, useEffect, useRef } from "react"
import type { RealtimeChannel } from "@supabase/supabase-js"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Search,
  MessageSquare,
  MoreVertical,
  AlertTriangle,
  RefreshCw,
  Archive,
  Trash2,
  CheckCircle,
  Inbox,
  LinkIcon,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useCompanySupabase } from "@/lib/supabase/company-client"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRouter } from "next/navigation"

// Interfaces
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

// Helper function to format a new conversation payload
const formatNewConversation = (payload: any): Conversation => {
  const history = payload.new?.history || []
  const lastMessageContent = history?.[history.length - 1]?.data?.content || "No messages"
  const createdAt = payload.new?.created_at || new Date().toISOString()

  return {
    conversation_id: payload.new?.conversation_id || "unknown-id",
    history: history,
    status: payload.new?.status || "active",
    created_at: createdAt,
    customerName: `User-${(payload.new?.conversation_id || "unknown").substring(0, 8)}`,
    lastMessage: lastMessageContent,
    lastMessageTime: new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  }
}

// Skeleton Component for Conversation List Items
const ConversationItemSkeleton = () => (
  <div className="w-full p-4 flex items-start gap-3 rounded-lg bg-[#2A2A2A] animate-pulse">
    <div className="h-11 w-11 bg-[#3A3A3A] rounded-full flex-shrink-0" />
    <div className="flex-1 space-y-2 pt-1">
      <div className="h-4 w-2/3 bg-[#3A3A3A] rounded" />
      <div className="h-3 w-4/5 bg-[#3A3A3A] rounded" />
    </div>
  </div>
)

export default function ConversationsClient() {
  const companySupabase = useCompanySupabase()
  const router = useRouter()
  const { toast } = useToast()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const channelRef = useRef<RealtimeChannel | null>(null)

  const fetchConversations = async () => {
    if (!companySupabase) {
      setIsLoading(false)
      console.log("Conversations Fetch: Company Supabase client not available.")
      setConversations([])
      return
    }
    console.log("Conversations: Fetching initial data...")
    setIsLoading(true)
    const { data, error } = await companySupabase
      .from("conversation_history")
      .select("conversation_id, history, status, created_at")
      .neq("status", "archived")
      .order("created_at", { ascending: false })

    if (error) {
      toast({ title: "Error", description: "Failed to fetch conversations.", variant: "destructive" })
      console.error(error)
      setConversations([])
    } else {
      const formattedConversations = (data || []).map(formatNewConversation)
      setConversations(formattedConversations)
      if (formattedConversations.length > 0 && !selectedConversation) {
        setSelectedConversation(formattedConversations[0])
      } else if (formattedConversations.length === 0) {
        setSelectedConversation(null)
      }
      console.log("Conversations: Initial data fetched successfully.", formattedConversations.length)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (companySupabase) {
      fetchConversations()

      const handleInserts = (payload: any) => {
        if (payload.new.status !== "archived") {
          const newConversation = formatNewConversation(payload)
          setConversations((currentConversations) => [newConversation, ...currentConversations])
        }
      }

      const handleUpdates = (payload: any) => {
        const updatedConv = formatNewConversation(payload)

        setConversations((currentConversations) => {
          if (updatedConv.status === "archived") {
            return currentConversations.filter((c) => c.conversation_id !== updatedConv.conversation_id)
          }
          return currentConversations.map((conv) =>
            conv.conversation_id === updatedConv.conversation_id ? updatedConv : conv,
          )
        })

        setSelectedConversation((currentSelected) =>
          currentSelected?.conversation_id === updatedConv.conversation_id ? updatedConv : currentSelected,
        )
      }

      const handleDeletes = (payload: any) => {
        setConversations((currentConversations) =>
          currentConversations.filter((c) => c.conversation_id !== payload.old.conversation_id),
        )
        setSelectedConversation((currentSelected) =>
          currentSelected?.conversation_id === payload.old.conversation_id ? null : currentSelected,
        )
      }

      const channel = companySupabase
        .channel("conversation-changes")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "conversation_history" }, handleInserts)
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "conversation_history" }, handleUpdates)
        .on("postgres_changes", { event: "DELETE", schema: "public", table: "conversation_history" }, handleDeletes)
        .subscribe()

      channelRef.current = channel

      return () => {
        if (channelRef.current) {
          companySupabase.removeChannel(channelRef.current)
          channelRef.current = null
        }
      }
    } else {
      setIsLoading(false)
      setConversations([])
      setSelectedConversation(null)
      if (channelRef.current) {
        companySupabase?.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [companySupabase])

  const filteredConversations = conversations.filter((conv) =>
    conv.customerName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleMarkAsRead = async (conversationId: string) => {
    if (!companySupabase)
      return toast({ title: "Error", description: "Database not connected.", variant: "destructive" })

    const { error } = await companySupabase
      .from("conversation_history")
      .update({ status: "read" })
      .eq("conversation_id", conversationId)

    if (error) {
      console.error("Mark as Read Error:", error)
      return toast({
        title: "Update Failed",
        description: `Could not mark as read: ${error.message}`,
        variant: "destructive",
      })
    }

    toast({ title: "Success", description: "Conversation status updated to 'read'." })
  }

  const handleLinkToLead = (id: string) => {
    router.push(`/dashboard/leads?search=${id.substring(0, 8)}`)
    toast({ title: "Redirecting", description: "Searching for lead by conversation ID..." })
  }

  const handleArchive = async (conversationId: string) => {
    if (!companySupabase)
      return toast({ title: "Error", description: "Database not connected.", variant: "destructive" })

    const { error } = await companySupabase
      .from("conversation_history")
      .update({ status: "archived" })
      .eq("conversation_id", conversationId)

    if (error) {
      console.error("Archive Error:", error)
      return toast({
        title: "Update Failed",
        description: `Could not archive conversation: ${error.message}`,
        variant: "destructive",
      })
    }

    setSelectedConversation((currentSelected) =>
      currentSelected?.conversation_id === conversationId ? null : currentSelected,
    )

    toast({ title: "Archived", description: "Conversation moved to archive." })
  }

  const handleDelete = async (conversationId: string) => {
    if (!companySupabase)
      return toast({ title: "Error", description: "Database not connected.", variant: "destructive" })

    const { error } = await companySupabase.from("conversation_history").delete().eq("conversation_id", conversationId)

    if (error) {
      console.error("Delete Error:", error)
      return toast({
        title: "Delete Failed",
        description: `Could not delete conversation: ${error.message}`,
        variant: "destructive",
      })
    }

    setSelectedConversation((currentSelected) =>
      currentSelected?.conversation_id === conversationId ? null : currentSelected,
    )

    toast({ title: "Deleted", description: "Conversation permanently deleted." })
  }

  if (!companySupabase && !isLoading && conversations.length === 0) {
    return (
      <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#EDE7C7] tracking-tight">Database Not Connected</h3>
            <p className="text-[#EDE7C7]/60 mt-2 max-w-md mx-auto">
              Please go to the settings page to connect your bot's database.
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
    <div className="space-y-4 sm:space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#EDE7C7] tracking-tight">Conversations</h1>
          <p className="text-sm text-[#EDE7C7]/70 mt-1.5">View your chatbot conversations.</p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={fetchConversations}
          disabled={isLoading}
          className="border-[#2A2A2A] text-[#EDE7C7]/60 hover:text-[#EDE7C7] hover:bg-[#2A2A2A]/50 bg-transparent transition-all duration-200 self-start sm:self-auto flex-shrink-0"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 flex-1 min-h-0">
        <Card className="bg-[#1A1A1A] border-[#2A2A2A] lg:col-span-1 flex flex-col overflow-hidden transition-all duration-200 hover:border-[#EDE7C7]/20 h-[400px] lg:h-full">
          <CardHeader className="flex-shrink-0 pb-4">
            <CardTitle className="text-xl font-semibold text-[#EDE7C7]">
              Chats ({filteredConversations.length})
            </CardTitle>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#EDE7C7]/40" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-[#0A0A0A] border-[#2A2A2A] text-[#EDE7C7] h-10 text-sm"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              {isLoading && conversations.length === 0 ? (
                <div className="space-y-1 px-4 py-4">
                  <ConversationItemSkeleton />
                  <ConversationItemSkeleton />
                  <ConversationItemSkeleton />
                  <ConversationItemSkeleton />
                  <ConversationItemSkeleton />
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex items-center justify-center h-full min-h-[200px]">
                  <div className="text-center px-6 py-8">
                    <Inbox className="h-16 w-16 text-[#EDE7C7]/20 mx-auto mb-4" />
                    <p className="text-lg font-medium text-[#EDE7C7]/80 mb-1">No Conversations Yet</p>
                    <p className="text-sm text-[#EDE7C7]/60">Your bot's conversations will appear here.</p>
                    {!companySupabase && <p className="text-xs text-yellow-500/80 mt-3">Database connection needed.</p>}
                  </div>
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex items-center justify-center h-full min-h-[200px]">
                  <div className="text-center px-4">
                    <Search className="h-12 w-12 text-[#EDE7C7]/20 mx-auto mb-3" />
                    <p className="text-base text-[#EDE7C7]/60">No conversations match your search.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1 px-4 pb-4">
                  {filteredConversations.map((conv) => (
                    <button
                      key={conv.conversation_id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`w-full p-4 flex items-start gap-3 hover:bg-[#2A2A2A]/50 transition-colors rounded-lg ${selectedConversation?.conversation_id === conv.conversation_id ? "bg-[#2A2A2A]/50" : ""}`}
                    >
                      <Avatar className="h-11 w-11 flex-shrink-0">
                        <AvatarFallback className="bg-[#EDE7C7]/10 text-[#EDE7C7] text-sm font-medium">
                          {conv.customerName.substring(5, 7)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left overflow-hidden min-w-0">
                        <div className="flex items-center justify-between mb-1.5 gap-2">
                          <p className="text-sm font-semibold text-[#EDE7C7] truncate">{conv.customerName}</p>
                          <span className="text-xs text-[#EDE7C7]/40 flex-shrink-0">{conv.lastMessageTime}</span>
                        </div>
                        <p className="text-sm text-[#EDE7C7]/60 truncate leading-relaxed">{conv.lastMessage}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1A1A] border-[#2A2A2A] lg:col-span-2 flex flex-col overflow-hidden transition-all duration-200 hover:border-[#EDE7C7]/20 h-[500px] lg:h-full">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b border-[#2A2A2A] flex-shrink-0 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-11 w-11">
                      <AvatarFallback className="bg-[#EDE7C7]/10 text-[#EDE7C7] text-sm font-medium">
                        {selectedConversation.customerName.substring(5, 7)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg font-semibold text-[#EDE7C7]">
                        {selectedConversation.customerName}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className={`mt-1.5 text-xs ${selectedConversation.status === "active" ? "border-green-500/50 text-green-500" : selectedConversation.status === "handover" ? "border-orange-500/50 text-orange-500" : "border-gray-500/50 text-gray-500"}`}
                      >
                        {selectedConversation.status}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5 text-[#EDE7C7]/60" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#1A1A1A] border-[#2A2A2A]">
                      <DropdownMenuItem
                        className="text-[#EDE7C7]/80 focus:text-[#EDE7C7] focus:bg-[#2A2A2A] cursor-pointer"
                        onClick={() => handleMarkAsRead(selectedConversation.conversation_id)}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" /> Mark as Read
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-[#EDE7C7]/80 focus:text-[#EDE7C7] focus:bg-[#2A2A2A] cursor-pointer"
                        onClick={() => handleLinkToLead(selectedConversation.conversation_id)}
                      >
                        <LinkIcon className="mr-2 h-4 w-4" /> Link to Lead
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-[#2A2A2A]" />
                      <DropdownMenuItem
                        className="text-[#EDE7C7]/80 focus:text-[#EDE7C7] focus:bg-[#2A2A2A] cursor-pointer"
                        onClick={() => handleArchive(selectedConversation.conversation_id)}
                      >
                        <Archive className="mr-2 h-4 w-4" /> Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-500 focus:text-red-400 focus:bg-[#2A2A2A] cursor-pointer"
                        onClick={() => handleDelete(selectedConversation.conversation_id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-6 overflow-hidden">
                <ScrollArea className="h-full pr-4">
                  <div className="space-y-4">
                    {selectedConversation.history?.map((message, index) => (
                      <div key={index} className={`flex ${message.type === "human" ? "justify-start" : "justify-end"}`}>
                        <div
                          className={`max-w-[75%] rounded-lg px-4 py-3 ${message.type === "human" ? "bg-[#2A2A2A] text-[#EDE7C7]" : "bg-[#EDE7C7] text-[#0A0A0A]"}`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.data.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center px-6 py-8">
                {isLoading && conversations.length === 0 ? (
                  <RefreshCw className="h-12 w-12 text-[#EDE7C7]/20 mx-auto mb-4 animate-spin" />
                ) : (
                  <MessageSquare className="h-16 w-16 text-[#EDE7C7]/20 mx-auto mb-4" />
                )}
                <p className="text-lg font-medium text-[#EDE7C7]/80 mb-1">
                  {isLoading && conversations.length === 0 ? "Loading Conversations..." : "Select a conversation"}
                </p>
                <p className="text-sm text-[#EDE7C7]/60">
                  {isLoading && conversations.length === 0
                    ? "Please wait..."
                    : "Choose a chat from the list to view the messages."}
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

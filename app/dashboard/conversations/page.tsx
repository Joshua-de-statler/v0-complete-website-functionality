"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, MessageSquare, Send, MoreVertical, AlertTriangle } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useCompanySupabase } from "@/lib/supabase/company-client"
import { toast } from "sonner"
import Link from "next/link"

// Define interfaces for our data structures
interface Conversation {
  conversation_id: string
  history: Message[]
  status: string
  created_at: string
  // For display purposes
  customerName: string
  lastMessage: string
  lastMessageTime: string
}

interface Message {
  type: 'human' | 'ai'
  data: {
    content: string
    // Add other potential fields from your JSONB history if needed
  }
}

export default function ConversationsPage() {
  const companySupabase = useCompanySupabase()
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
        toast.error("Failed to fetch conversations.")
        console.error(error)
      } else {
        const formattedConversations = data.map((conv: any) => {
          const lastMsg = conv.history?.[conv.history.length - 1]?.data?.content || "No messages yet"
          // A simple way to get a customer identifier, you might make this more robust
          const customerName = conv.conversation_id.substring(0, 8) 
          
          return {
            ...conv,
            customerName: `User-${customerName}`,
            lastMessage: lastMsg,
            lastMessageTime: new Date(conv.created_at).toLocaleTimeString(),
          }
        })
        setConversations(formattedConversations)
        if (formattedConversations.length > 0) {
            setSelectedConversation(formattedConversations[0])
        }
      }
      setIsLoading(false)
    }

    fetchConversations()
  }, [companySupabase])
  
  const filteredConversations = conversations.filter((conv) =>
    conv.customerName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-[#EDE7C7]">Conversations</h2>
        <p className="text-[#EDE7C7]/60 mt-2">Manage your bot's conversations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
        {/* Conversations List */}
        <Card className="bg-[#1A1A1A] border-[#2A2A2A] lg:col-span-1">
          <CardHeader>
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
          <CardContent className="p-0">
             {isLoading ? (
                <div className="text-center py-12 text-[#EDE7C7]/60">Loading...</div>
             ) : (
                <div className="space-y-1 max-h-[calc(100vh-20rem)] overflow-y-auto">
                {filteredConversations.map((conv) => (
                    <button
                    key={conv.conversation_id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-[#2A2A2A]/50 transition-colors ${
                        selectedConversation?.conversation_id === conv.conversation_id ? "bg-[#2A2A2A]/50" : ""
                    }`}
                    >
                    <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-[#EDE7C7]/10 text-[#EDE7C7]">{conv.customerName.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                        <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-[#EDE7C7]">{conv.customerName}</p>
                        <span className="text-xs text-[#EDE7C7]/40">{conv.lastMessageTime}</span>
                        </div>
                        <p className="text-sm text-[#EDE7C7]/60 truncate">{conv.lastMessage}</p>
                    </div>
                    </button>
                ))}
                </div>
             )}
          </CardContent>
        </Card>

        {/* Chat Window */}
        <Card className="bg-[#1A1A1A] border-[#2A2A2A] lg:col-span-2 flex flex-col">
            {selectedConversation ? (
                <>
                <CardHeader className="border-b border-[#2A2A2A]">
                    <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-[#EDE7C7]/10 text-[#EDE7C7]">
                            {selectedConversation.customerName.substring(0, 2)}
                        </AvatarFallback>
                        </Avatar>
                        <div>
                        <CardTitle className="text-[#EDE7C7]">{selectedConversation.customerName}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge
                                variant="outline"
                                className={
                                    selectedConversation.status === "active" ? "border-green-500/50 text-green-500 text-xs"
                                    : "border-yellow-500/50 text-yellow-500 text-xs"
                                }
                            >
                                {selectedConversation.status}
                            </Badge>
                        </div>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="h-5 w-5 text-[#EDE7C7]/60" />
                    </Button>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 p-6 overflow-y-auto">
                    <div className="space-y-4">
                    {selectedConversation.history?.map((message, index) => (
                        <div
                        key={index}
                        className={`flex ${message.type === "human" ? "justify-start" : "justify-end"}`}
                        >
                        <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                            message.type === "human" ? "bg-[#2A2A2A] text-[#EDE7C7]" : "bg-[#EDE7C7] text-[#0A0A0A]"
                            }`}
                        >
                            <p className="text-sm">{message.data.content}</p>
                        </div>
                        </div>
                    ))}
                    </div>
                </CardContent>
                <div className="p-4 border-t border-[#2A2A2A]">
                    <div className="flex gap-2">
                    <Input
                        placeholder="Type a message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        className="bg-[#0A0A0A] border-[#2A2A2A] text-[#EDE7C7]"
                    />
                    <Button className="bg-[#EDE7C7] text-[#0A0A0A] hover:bg-[#EDE7C7]/90">
                        <Send className="h-4 w-4" />
                    </Button>
                    </div>
                </div>
                </>
            ) : (
                <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                        <MessageSquare className="h-12 w-12 text-[#EDE7C7]/20 mx-auto mb-3" />
                        <p className="text-sm text-[#EDE7C7]/60">Select a conversation to view messages.</p>
                    </div>
                </div>
            )}
        </Card>
      </div>
    </div>
  )
}

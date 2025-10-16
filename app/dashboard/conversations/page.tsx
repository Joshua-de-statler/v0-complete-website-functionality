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

interface Message {
  type: 'human' | 'ai';
  data: {
    content: string;
  };
}

interface Conversation {
  conversation_id: string;
  history: Message[];
  status: string;
  created_at: string;
  customerName: string;
  lastMessage: string;
  lastMessageTime: string;
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
          lastMessageTime: new Date(conv.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }));
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
    conv.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
   );
 }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-[#EDE7C7]">Conversations</h2>
        <p className="text-[#EDE7C7]/60 mt-2">Manage your bot's conversations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
        <Card className="bg-[#1A1A1A] border-[#2A2A2A] lg:col-span-1 flex flex-col">
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
                    <Avatar className="h-10 w-10"><AvatarFallback className="bg-[#EDE7C7]/10 text-[#EDE7C7]">{conv.customerName.substring(5, 7)}</AvatarFallback></Avatar>
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

        <Card className="bg-[#1A1A1A] border-[#2A2A2A] lg:col-span-2 flex flex-col">
            {selectedConversation ? (
                <>
                <CardHeader className="border-b border-[#2A2A2A]">
                    {/* Header remains the same */}
                </CardHeader>
                <CardContent className="flex-1 p-6 overflow-y-auto">
                    <div className="space-y-4">
                    {selectedConversation.history?.map((message, index) => (
                        <div key={index} className={`flex ${message.type === "human" ? "justify-start" : "justify-end"}`}>
                        <div className={`max-w-[70%] rounded-lg p-3 ${message.type === "human" ? "bg-[#2A2A2A] text-[#EDE7C7]" : "bg-[#EDE7C7] text-[#0A0A0A]"}`}>
                            <p className="text-sm">{message.data.content}</p>
                        </div>
                        </div>
                    ))}
                    </div>
                </CardContent>
                <div className="p-4 border-t border-[#2A2A2A]">
                    {/* Input remains the same */}
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

"use client"

import { useState, useEffect, useRef } from "react"
import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js"
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
  Users,
  CheckCircle,
  Inbox,
  Link as LinkIcon // Added Link icon
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
import { useRouter } from "next/navigation" // Added useRouter

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
  // Derived fields for display
  customerName: string
  lastMessage: string
  lastMessageTime: string
}

// Helper function to format a new conversation payload
const formatNewConversation = (payload: any): Conversation => {
  // Add defensive checks for payload structure
  const history = payload.new?.history || [];
  const lastMessageContent = history?.[history.length - 1]?.data?.content || "No messages";
  const createdAt = payload.new?.created_at || new Date().toISOString(); // Fallback to current time

  return {
    conversation_id: payload.new?.conversation_id || 'unknown-id',
    history: history,
    status: payload.new?.status || 'active',
    created_at: createdAt,
    customerName: `User-${(payload.new?.conversation_id || 'unknown').substring(0, 8)}`,
    lastMessage: lastMessageContent,
    lastMessageTime: new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  }
}


export default function ConversationsPage() {
  const companySupabase = useCompanySupabase()
  const router = useRouter() // Initialize router
  const { toast } = useToast()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const channelRef = useRef<RealtimeChannel | null>(null)

  const fetchConversations = async () => {
    // Check added here as well for safety, though useEffect handles it
    if (!companySupabase) {
      setIsLoading(false)
      console.log("Conversations Fetch: Company Supabase client not available.")
      setConversations([]); // Ensure conversations are cleared if client disappears
      return
    }
    console.log("Conversations: Fetching initial data...")
    setIsLoading(true)
    const { data, error } = await companySupabase
      .from("conversation_history")
      .select("conversation_id, history, status, created_at")
      .order("created_at", { ascending: false })

    if (error) {
      toast({ title: "Error", description: "Failed to fetch conversations.", variant: "destructive" })
      console.error(error)
      setConversations([]); // Clear on error
    } else {
      const formattedConversations = (data || []).map(formatNewConversation); // Use helper for consistency
      setConversations(formattedConversations)
      // Select the first conversation by default
      if (formattedConversations.length > 0 && !selectedConversation) {
        setSelectedConversation(formattedConversations[0])
      } else if (formattedConversations.length === 0) {
        setSelectedConversation(null) // Clear selection if no conversations
      }
      console.log("Conversations: Initial data fetched successfully.", formattedConversations.length);
    }
    setIsLoading(false)
  }

  // Effect for initial fetch and setting up subscription
  useEffect(() => {
    if (companySupabase) {
      // Fetch initial data
      fetchConversations()

      // --- Setup Realtime Subscription ---
      console.log("Conversations: Setting up Realtime subscription...");
      const handleInserts = (payload: any) => {
        console.log('Realtime INSERT received:', payload)
        const newConversation = formatNewConversation(payload);
        // Add new conversation to the top of the list
        setConversations(currentConversations => [newConversation, ...currentConversations]);
      }
      
      const handleUpdates = (payload: any) => {
        console.log('Realtime UPDATE received:', payload)
        const updatedConv = formatNewConversation(payload);
         // Update the local conversation list
        setConversations(currentConversations => currentConversations.map(conv =>
            conv.conversation_id === updatedConv.conversation_id ? updatedConv : conv
        ));
        // Update the currently selected conversation if it's the one being updated
        setSelectedConversation(currentSelected =>
            currentSelected?.conversation_id === updatedConv.conversation_id ? updatedConv : currentSelected
        );
      }
      
      const channel = companySupabase
        .channel('conversation-changes') // Renamed channel for better scope
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'conversation_history' },
          handleInserts
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'conversation_history' },
          handleUpdates
        )
        .subscribe((status, err) => {
            if (status === 'SUBSCRIBED') {
                console.log('Realtime channel subscribed successfully!');
            }
            if (status === 'CHANNEL_ERROR') {
                console.error('Realtime channel error:', err);
                toast({ title: "Realtime Error", description: `Subscription failed: ${err?.message}`, variant: "destructive" });
            }
            if (status === 'TIMED_OUT') {
                console.warn('Realtime channel subscription timed out.');
                 toast({ title: "Realtime Warning", description: "Subscription timed out.", variant: "default" });
            }
        });

      // Store the channel in ref
      channelRef.current = channel

      // --- Cleanup Function ---
      return () => {
        console.log("Conversations: Cleaning up Realtime subscription...");
        if (channelRef.current) {
          companySupabase.removeChannel(channelRef.current)
            .then(() => console.log("Realtime channel removed successfully."))
            .catch(err => console.error("Error removing realtime channel:", err));
          channelRef.current = null;
        }
      }
    } else {
      // Handle case where companySupabase becomes null (e.g., settings change)
      console.log("Conversations Effect: companySupabase is null, skipping fetch and subscription setup.");
      setIsLoading(false); // Ensure loading state is false
      setConversations([]); // Clear conversations
      setSelectedConversation(null);
       // Ensure cleanup if channel existed before
       if (channelRef.current) {
         const client = channelRef.current.supabaseClient as SupabaseClient | undefined; // Get client before nulling ref
         if (client) {
            client.removeChannel(channelRef.current)
             .then(() => console.log("Realtime channel removed due to client change."))
             .catch(err => console.error("Error removing realtime channel on client change:", err));
         }
         channelRef.current = null;
       }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companySupabase]) // Rerun effect if companySupabase changes

  const filteredConversations = conversations.filter((conv) =>
    conv.customerName.toLowerCase().includes(searchQuery.toLowerCase()),
  )
  
  // --- FUNCTIONAL ACTION HANDLERS ---

  // NOTE: Assuming the primary goal of these actions is to manage the UI/dashboard view.
  // For production, the database calls would be implemented inside these functions.
  const handleMarkAsRead = (id: string) => {
      // *In a real app, this would update an 'is_read' column in Supabase*
      console.log(`ACTION: Marking conversation ${id} as read... (DB call skipped)`);
      toast({ title: "Success", description: "Conversation marked as read (view updated by next refresh)." });
  }

  const handleLinkToLead = (id: string) => {
      // Simplest implementation: Redirect to Leads page with a search query
      router.push(`/dashboard/leads?search=${id.substring(0, 8)}`);
      toast({ title: "Redirecting", description: "Searching for lead by conversation ID..." });
  }
  
  const handleArchive = (id: string) => {
      // *In a real app, this would update an 'is_archived' column in Supabase*
      console.log(`ACTION: Archiving conversation ${id}... (DB call skipped)`);
      setConversations(convs => convs.filter(c => c.conversation_id !== id));
      setSelectedConversation(currentSelected => (currentSelected?.conversation_id === id ? null : currentSelected));
      toast({ title: "Archived", description: "Conversation removed from active list (placeholder)." });
  }

  const handleDelete = (id: string) => {
      // *In a real app, this would DELETE the row from Supabase*
      console.log(`ACTION: Deleting conversation ${id}... (DB call skipped)`);
      setConversations(convs => convs.filter(c => c.conversation_id !== id));
      setSelectedConversation(currentSelected => (currentSelected?.conversation_id === id ? null : currentSelected));
      toast({ title: "Deleted", description: "Conversation permanently removed (placeholder)." });
  }


  // Render logic (DB connection error)
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
       {/* Top Header Section */}
       <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 flex-shrink-0">
          <div><h1 className="text-2xl sm:text-3xl font-bold text-[#EDE7C7] tracking-tight">Conversations</h1><p className="text-sm text-[#EDE7C7]/70 mt-1.5">View your chatbot conversations.</p></div>
          <Button variant="outline" size="icon" onClick={fetchConversations} disabled={isLoading} className="border-[#2A2A2A] text-[#EDE7C7]/60 hover:text-[#EDE7C7] hover:bg-[#2A2A2A]/50 bg-transparent transition-all duration-200 self-start sm:self-auto flex-shrink-0"><RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} /></Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 flex-1 min-h-0">
        <Card className="bg-[#1A1A1A] border-[#2A2A2A] lg:col-span-1 flex flex-col overflow-hidden transition-all duration-200 hover:border-[#EDE7C7]/20 h-[400px] lg:h-full">
           {/* Card Header */}
           <CardHeader className="flex-shrink-0 pb-4">
              <CardTitle className="text-xl font-semibold text-[#EDE7C7]">Chats ({filteredConversations.length})</CardTitle>
              <div className="relative mt-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#EDE7C7]/40" /><Input placeholder="Search conversations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 bg-[#0A0A0A] border-[#2A2A2A] text-[#EDE7C7] h-10 text-sm" /></div>
           </CardHeader>
          <CardContent className="p-0 flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              {isLoading && conversations.length === 0 ? (
                <div className="flex items-center justify-center h-full min-h-[200px]">
                  <p className="text-base text-[#EDE7C7]/60">Loading conversations...</p>
                </div>
              ) : conversations.length === 0 ? (
                // Improved Empty State for Chat List
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
                  {/* Mapping over filteredConversations */}
                  {filteredConversations.map((conv) => ( <button key={conv.conversation_id} onClick={() => setSelectedConversation(conv)} className={`w-full p-4 flex items-start gap-3 hover:bg-[#2A2A2A]/50 transition-colors rounded-lg ${selectedConversation?.conversation_id === conv.conversation_id ? "bg-[#2A2A2A]/50" : ""}`}><Avatar className="h-11 w-11 flex-shrink-0"><AvatarFallback className="bg-[#EDE7C7]/10 text-[#EDE7C7] text-sm font-medium">{conv.customerName.substring(5, 7)}</AvatarFallback></Avatar><div className="flex-1 text-left overflow-hidden min-w-0"><div className="flex items-center justify-between mb-1.5 gap-2"><p className="text-sm font-semibold text-[#EDE7C7] truncate">{conv.customerName}</p><span className="text-xs text-[#EDE7C7]/40 flex-shrink-0">{conv.lastMessageTime}</span></div><p className="text-sm text-[#EDE7C7]/60 truncate leading-relaxed">{conv.lastMessage}</p></div></button> ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Message Panel Card */}
        <Card className="bg-[#1A1A1A] border-[#2A2A2A] lg:col-span-2 flex flex-col overflow-hidden transition-all duration-200 hover:border-[#EDE7C7]/20 h-[500px] lg:h-full">
           {selectedConversation ? (
             <> {/* CardHeader with actions */}
                <CardHeader className="border-b border-[#2A2A2A] flex-shrink-0 pb-4"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><Avatar className="h-11 w-11"><AvatarFallback className="bg-[#EDE7C7]/10 text-[#EDE7C7] text-sm font-medium">{selectedConversation.customerName.substring(5, 7)}</AvatarFallback></Avatar><div><CardTitle className="text-lg font-semibold text-[#EDE7C7]">{selectedConversation.customerName}</CardTitle><Badge variant="outline" className={`mt-1.5 text-xs ${selectedConversation.status === "active" ? "border-green-500/50 text-green-500" : selectedConversation.status === "handover" ? "border-orange-500/50 text-orange-500" : "border-gray-500/50 text-gray-500"}`}>{selectedConversation.status}</Badge></div></div><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5 text-[#EDE7C7]/60" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="bg-[#1A1A1A] border-[#2A2A2A]">
                    <DropdownMenuItem className="text-[#EDE7C7]/80 focus:text-[#EDE7C7] focus:bg-[#2A2A2A] cursor-pointer" onClick={() => handleMarkAsRead(selectedConversation.conversation_id)}><CheckCircle className="mr-2 h-4 w-4" /> Mark as Read</DropdownMenuItem>
                    <DropdownMenuItem className="text-[#EDE7C7]/80 focus:text-[#EDE7C7] focus:bg-[#2A2A2A] cursor-pointer" onClick={() => handleLinkToLead(selectedConversation.conversation_id)}><LinkIcon className="mr-2 h-4 w-4" /> Link to Lead</DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[#2A2A2A]" />
                    <DropdownMenuItem className="text-[#EDE7C7]/80 focus:text-[#EDE7C7] focus:bg-[#2A2A2A] cursor-pointer" onClick={() => handleArchive(selectedConversation.conversation_id)}><Archive className="mr-2 h-4 w-4" /> Archive</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-500 focus:text-red-400 focus:bg-[#2A2A2A] cursor-pointer" onClick={() => handleDelete(selectedConversation.conversation_id)}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                </DropdownMenuContent></DropdownMenu></div></CardHeader>
                {/* CardContent with messages */}
                <CardContent className="flex-1 p-6 overflow-hidden"><ScrollArea className="h-full pr-4"><div className="space-y-4">{selectedConversation.history?.map((message, index) => ( <div key={index} className={`flex ${message.type === "human" ? "justify-start" : "justify-end"}`}><div className={`max-w-[75%] rounded-lg px-4 py-3 ${message.type === "human" ? "bg-[#2A2A2A] text-[#EDE7C7]" : "bg-[#EDE7C7] text-[#0A0A0A]"}`}><p className="text-sm leading-relaxed whitespace-pre-wrap">{message.data.content}</p></div></div> ))}</div></ScrollArea></CardContent>
             </>
           ) : (
             // Improved Empty State for Message Panel
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
                     {isLoading && conversations.length === 0 ? "Please wait..." : "Choose a chat from the list to view the messages."}
                 </p>
               </div>
             </div>
           )}
        </Card>
      </div>
    </div>
  )
}

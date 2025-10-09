"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, MessageSquare, Send, MoreVertical } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const conversations = [
  {
    id: 1,
    customer: "John Smith",
    lastMessage: "Thanks for the help!",
    time: "2m ago",
    unread: 2,
    status: "active",
    avatar: "JS",
  },
  {
    id: 2,
    customer: "Sarah Johnson",
    lastMessage: "Can you send me the pricing details?",
    time: "15m ago",
    unread: 0,
    status: "waiting",
    avatar: "SJ",
  },
  {
    id: 3,
    customer: "Mike Wilson",
    lastMessage: "Perfect, I'll schedule a demo",
    time: "1h ago",
    unread: 0,
    status: "resolved",
    avatar: "MW",
  },
  {
    id: 4,
    customer: "Emma Davis",
    lastMessage: "What are your business hours?",
    time: "2h ago",
    unread: 1,
    status: "active",
    avatar: "ED",
  },
  {
    id: 5,
    customer: "David Brown",
    lastMessage: "Great service!",
    time: "3h ago",
    unread: 0,
    status: "resolved",
    avatar: "DB",
  },
]

const chatMessages = [
  { id: 1, sender: "customer", text: "Hi, I'm interested in your AI agents", time: "10:30 AM" },
  {
    id: 2,
    sender: "bot",
    text: "Hello! I'd be happy to help you learn about our AI agents. What specific features are you interested in?",
    time: "10:30 AM",
  },
  { id: 3, sender: "customer", text: "Can they handle WhatsApp and voice calls?", time: "10:31 AM" },
  {
    id: 4,
    sender: "bot",
    text: "Yes! Our AI agents support both WhatsApp messaging and voice calls. They can handle customer inquiries 24/7 with natural conversation flow.",
    time: "10:31 AM",
  },
  { id: 5, sender: "customer", text: "That sounds perfect. What's the pricing?", time: "10:32 AM" },
  {
    id: 6,
    sender: "bot",
    text: "We have flexible pricing plans starting from R2,500/month. Would you like me to schedule a demo to show you the features?",
    time: "10:32 AM",
  },
  { id: 7, sender: "customer", text: "Yes please!", time: "10:33 AM" },
]

export default function ConversationsPage() {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0])
  const [searchQuery, setSearchQuery] = useState("")
  const [messageInput, setMessageInput] = useState("")

  const filteredConversations = conversations.filter((conv) =>
    conv.customer.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-[#EDE7C7]">Conversations</h2>
        <p className="text-[#EDE7C7]/60 mt-2">Manage your WhatsApp conversations</p>
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
            <div className="space-y-1 max-h-[calc(100vh-20rem)] overflow-y-auto">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-[#2A2A2A]/50 transition-colors ${
                    selectedConversation.id === conv.id ? "bg-[#2A2A2A]/50" : ""
                  }`}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-[#EDE7C7]/10 text-[#EDE7C7]">{conv.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-[#EDE7C7]">{conv.customer}</p>
                      <span className="text-xs text-[#EDE7C7]/40">{conv.time}</span>
                    </div>
                    <p className="text-sm text-[#EDE7C7]/60 truncate">{conv.lastMessage}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant="outline"
                        className={
                          conv.status === "active"
                            ? "border-green-500/50 text-green-500 text-xs"
                            : conv.status === "waiting"
                              ? "border-yellow-500/50 text-yellow-500 text-xs"
                              : "border-[#EDE7C7]/50 text-[#EDE7C7]/60 text-xs"
                        }
                      >
                        {conv.status}
                      </Badge>
                      {conv.unread > 0 && <Badge className="bg-[#EDE7C7] text-[#0A0A0A] text-xs">{conv.unread}</Badge>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Window */}
        <Card className="bg-[#1A1A1A] border-[#2A2A2A] lg:col-span-2 flex flex-col">
          <CardHeader className="border-b border-[#2A2A2A]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-[#EDE7C7]/10 text-[#EDE7C7]">
                    {selectedConversation.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-[#EDE7C7]">{selectedConversation.customer}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <MessageSquare className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-[#EDE7C7]/60">WhatsApp</span>
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
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "customer" ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.sender === "customer" ? "bg-[#2A2A2A] text-[#EDE7C7]" : "bg-[#EDE7C7] text-[#0A0A0A]"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <span
                      className={`text-xs mt-1 block ${
                        message.sender === "customer" ? "text-[#EDE7C7]/40" : "text-[#0A0A0A]/60"
                      }`}
                    >
                      {message.time}
                    </span>
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
                onKeyPress={(e) => {
                  if (e.key === "Enter" && messageInput.trim()) {
                    console.log("[v0] Sending message:", messageInput)
                    setMessageInput("")
                  }
                }}
              />
              <Button
                className="bg-[#EDE7C7] text-[#0A0A0A] hover:bg-[#EDE7C7]/90"
                onClick={() => {
                  if (messageInput.trim()) {
                    console.log("[v0] Sending message:", messageInput)
                    setMessageInput("")
                  }
                }}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Phone, Clock } from "lucide-react"
import Link from "next/link"

const recentActivities = [
  {
    id: 1,
    type: "whatsapp",
    customer: "John Smith",
    message: "Asked about pricing plans",
    time: "2 minutes ago",
    status: "active",
  },
  {
    id: 2,
    type: "call",
    customer: "Sarah Johnson",
    message: "Technical support inquiry",
    time: "15 minutes ago",
    status: "completed",
  },
  {
    id: 3,
    type: "whatsapp",
    customer: "Mike Wilson",
    message: "Product demo request",
    time: "1 hour ago",
    status: "resolved",
  },
  {
    id: 4,
    type: "call",
    customer: "Emma Davis",
    message: "Billing question",
    time: "2 hours ago",
    status: "completed",
  },
  {
    id: 5,
    type: "whatsapp",
    customer: "David Brown",
    message: "Feature inquiry",
    time: "3 hours ago",
    status: "resolved",
  },
]

export function RecentActivity() {
  return (
    <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-[#EDE7C7]">Recent Activity</CardTitle>
        <Link
          href="/dashboard/conversations"
          className="text-sm text-[#EDE7C7]/60 hover:text-[#EDE7C7] transition-colors"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 p-3 rounded-lg hover:bg-[#2A2A2A]/50 transition-colors cursor-pointer"
            >
              <div className="mt-1">
                {activity.type === "whatsapp" ? (
                  <MessageSquare className="h-5 w-5 text-green-500" />
                ) : (
                  <Phone className="h-5 w-5 text-blue-500" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-[#EDE7C7]">{activity.customer}</p>
                  <Badge
                    variant="outline"
                    className={
                      activity.status === "active"
                        ? "border-green-500/50 text-green-500"
                        : activity.status === "completed"
                          ? "border-blue-500/50 text-blue-500"
                          : "border-[#EDE7C7]/50 text-[#EDE7C7]/60"
                    }
                  >
                    {activity.status}
                  </Badge>
                </div>
                <p className="text-sm text-[#EDE7C7]/60">{activity.message}</p>
                <div className="flex items-center gap-1 text-xs text-[#EDE7C7]/40">
                  <Clock className="h-3 w-3" />
                  {activity.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, MessageSquare, Phone, Users, BarChart3, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Conversations", href: "/dashboard/conversations", icon: MessageSquare },
  { name: "Voice Calls", href: "/dashboard/calls", icon: Phone },
  { name: "Leads", href: "/dashboard/leads", icon: Users },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:border-[#2A2A2A] bg-[#0F0F0F]">
      <div className="flex h-16 items-center px-6 border-b border-[#2A2A2A]">
        <Link href="/" className="text-xl font-bold text-[#EDE7C7]">
          AI Agents
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#EDE7C7]/10 text-[#EDE7C7]"
                  : "text-[#EDE7C7]/60 hover:bg-[#EDE7C7]/5 hover:text-[#EDE7C7]",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

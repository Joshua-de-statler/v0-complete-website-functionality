"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, MessageSquare, Phone, BarChart3, Settings, Users, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Conversations", href: "/dashboard/conversations", icon: MessageSquare },
  { name: "Voice Calls", href: "/dashboard/calls", icon: Phone },
  { name: "Leads", href: "/dashboard/leads", icon: Users },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

interface DashboardSidebarProps {
  mobileMenuOpen?: boolean
  onClose?: () => void
}

export function DashboardSidebar({ mobileMenuOpen = false, onClose }: DashboardSidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {mobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-[#0F0F0F] border-r border-[#2A2A2A] transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b border-[#2A2A2A]">
          <Link href="/" className="text-xl font-bold text-[#EDE7C7]">
            AI Agents
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden text-[#EDE7C7]" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-[#EDE7C7]/10 text-[#EDE7C7] shadow-sm"
                    : "text-[#EDE7C7]/60 hover:bg-[#EDE7C7]/5 hover:text-[#EDE7C7]",
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className="truncate">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, MessageSquare, Phone, Users, BarChart3, Settings, X } from "lucide-react"
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

export function DashboardSidebar({ mobileMenuOpen, onClose }: DashboardSidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:border-r lg:border-[#2A2A2A] bg-[#0F0F0F] flex-shrink-0">
        <div className="flex h-14 sm:h-16 items-center px-6 border-b border-[#2A2A2A]">
          <Link href="/" className="text-xl font-bold text-[#EDE7C7] hover:text-[#EDE7C7]/80 transition-colors">
            Zappies AI
          </Link>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-[#EDE7C7]/10 text-[#EDE7C7] shadow-sm"
                    : "text-[#EDE7C7]/60 hover:bg-[#EDE7C7]/5 hover:text-[#EDE7C7]",
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-[#0F0F0F] border-r border-[#2A2A2A] transform transition-transform duration-300 ease-in-out",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 sm:h-16 items-center justify-between px-6 border-b border-[#2A2A2A]">
          <Link
            href="/"
            className="text-xl font-bold text-[#EDE7C7] hover:text-[#EDE7C7]/80 transition-colors"
            onClick={onClose}
          >
            Zappies AI
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-[#2A2A2A] transition-colors duration-200"
          >
            <X className="h-5 w-5 text-[#EDE7C7]" />
          </Button>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)]">
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
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}

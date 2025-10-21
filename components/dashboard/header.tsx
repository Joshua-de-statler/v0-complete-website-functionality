"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut, Settings, Menu } from "lucide-react"
import { useRouter } from "next/navigation"

interface DashboardHeaderProps {
  user: {
    email?: string
  }
  onMenuClick?: () => void
}

export function DashboardHeader({ user, onMenuClick }: DashboardHeaderProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    await fetch("/auth/signout", { method: "POST" })
    router.push("/")
    router.refresh()
  }

  return (
    <header className="h-16 border-b border-[#2A2A2A] bg-[#0F0F0F] flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="lg:hidden text-[#EDE7C7]" onClick={onMenuClick}>
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-[#EDE7C7]">Dashboard</h1>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-[#2A2A2A]">
            <User className="h-5 w-5 text-[#EDE7C7]" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-[#1A1A1A] border-[#2A2A2A]">
          <DropdownMenuLabel className="text-[#EDE7C7]">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium">My Account</p>
              <p className="text-xs text-[#EDE7C7]/60 truncate">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-[#2A2A2A]" />
          <DropdownMenuItem
            onClick={() => router.push("/dashboard/settings")}
            className="text-[#EDE7C7]/80 focus:text-[#EDE7C7] focus:bg-[#2A2A2A] cursor-pointer"
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-[#2A2A2A]" />
          <DropdownMenuItem
            onClick={handleSignOut}
            className="text-[#EDE7C7]/80 focus:text-[#EDE7C7] focus:bg-[#2A2A2A] cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}

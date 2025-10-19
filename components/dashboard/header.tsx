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
import { User, LogOut, Settings } from "lucide-react"
import { useRouter } from "next/navigation"

interface DashboardHeaderProps {
  user: {
    email?: string
  }
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    await fetch("/auth/signout", { method: "POST" })
    router.push("/")
    router.refresh()
  }

  return (
    <header className="h-16 border-b border-[#2A2A2A] bg-[#0F0F0F] flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
      <div className="flex items-center gap-4 pl-12 lg:pl-0">
        <h1 className="text-base sm:text-lg font-semibold text-[#EDE7C7]">Dashboard</h1>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-[#2A2A2A] transition-colors duration-200"
          >
            <User className="h-5 w-5 text-[#EDE7C7]" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="bg-[#1A1A1A] border-[#2A2A2A] w-56 animate-in fade-in-0 zoom-in-95 duration-200"
        >
          <DropdownMenuLabel className="text-[#EDE7C7] truncate">{user.email}</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-[#2A2A2A]" />
          <DropdownMenuItem
            onClick={() => router.push("/dashboard/settings")}
            className="text-[#EDE7C7]/80 focus:text-[#EDE7C7] focus:bg-[#2A2A2A] cursor-pointer transition-colors duration-150"
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-[#2A2A2A]" />
          <DropdownMenuItem
            onClick={handleSignOut}
            className="text-[#EDE7C7]/80 focus:text-[#EDE7C7] focus:bg-[#2A2A2A] cursor-pointer transition-colors duration-150"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}

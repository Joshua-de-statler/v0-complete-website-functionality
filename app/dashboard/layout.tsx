"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { CompanyProvider } from "@/components/dashboard/company-provider"
import { Toaster } from "@/components/ui/toaster"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

function DashboardLayoutClient({
  children,
  user,
  company,
}: {
  children: React.ReactNode
  user: any
  company: any
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [mobileMenuOpen])

  return (
    <CompanyProvider company={company}>
      <div className="flex h-screen bg-[#0A0A0A] overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden fixed top-4 left-4 z-50 text-[#EDE7C7] hover:bg-[#2A2A2A]"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>

        {mobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/60 z-40 animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        <DashboardSidebar mobileMenuOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

        <div className="flex-1 flex flex-col overflow-hidden w-full lg:w-auto">
          <DashboardHeader user={user} />
          <main className="flex-1 overflow-y-auto bg-[#0A0A0A] p-4 sm:p-6 md:p-8 lg:p-10 scroll-smooth">
            <div className="max-w-[1600px] mx-auto w-full">{children}</div>
          </main>
        </div>
      </div>
      <Toaster />
    </CompanyProvider>
  )
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: companyUser, error: companyUserError } = await supabase
    .from("company_users")
    .select("company_id")
    .eq("user_id", user.id)
    .single()

  if (companyUserError || !companyUser) {
    console.error("Dashboard Layout Error: Could not find company link for user.", companyUserError)
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] text-[#EDE7C7] p-4">
        <p className="text-center">Error: Could not verify your company membership. Please contact support.</p>
      </div>
    )
  }

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("*")
    .eq("id", companyUser.company_id)
    .single()

  if (companyError || !company) {
    console.error("Dashboard Layout Error: Could not fetch company details.", companyError)
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] text-[#EDE7C7] p-4">
        <p className="text-center">Error: Could not load company data. Please check permissions and contact support.</p>
      </div>
    )
  }

  return (
    <DashboardLayoutClient user={user} company={company}>
      {children}
    </DashboardLayoutClient>
  )
}

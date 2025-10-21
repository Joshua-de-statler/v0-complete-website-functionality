import React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { CompanyProvider } from "@/components/dashboard/company-provider"
import { Toaster } from "@/components/ui/toaster"

function DashboardLayoutClient({ children, user }: { children: React.ReactNode; user: any }) {
  "use client"

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  return (
    <div className="flex h-screen bg-[#0A0A0A] overflow-hidden">
      <DashboardSidebar mobileMenuOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <DashboardHeader user={user} onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-[#0A0A0A] p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient() // Removed await from createClient() since it's now synchronous
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch the user's link to a company
  const { data: companyUser, error: companyUserError } = await supabase
    .from("company_users")
    .select("company_id")
    .eq("user_id", user.id)
    .single()

  // New Error Check 1: Handle if the user is not linked to any company
  if (companyUserError || !companyUser) {
    console.error("Dashboard Layout Error: Could not find company link for user.", companyUserError)
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] text-[#EDE7C7]">
        <p>Error: Could not verify your company membership. Please contact support.</p>
      </div>
    )
  }

  // Fetch the company's full details
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("*")
    .eq("id", companyUser.company_id)
    .single()

  // New Error Check 2: Handle if the company details could not be fetched (likely an RLS issue)
  if (companyError || !company) {
    console.error("Dashboard Layout Error: Could not fetch company details.", companyError)
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] text-[#EDE7C7]">
        <p>Error: Could not load company data. Please check permissions and contact support.</p>
      </div>
    )
  }

  return (
    <CompanyProvider company={company}>
      <DashboardLayoutClient user={user}>{children}</DashboardLayoutClient>
      <Toaster />
    </CompanyProvider>
  )
}

import type React from "react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { DashboardHeader } from "@/components/dashboard/header"
import { CompanyProvider } from "@/components/dashboard/company-provider"
import { Toaster } from "@/components/ui/toaster" // IMPORT THE CORRECT TOASTER

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: companyUser } = await supabase
    .from("company_users")
    .select("company_id")
    .eq("user_id", user.id)
    .single()

  if (!companyUser) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] text-[#EDE7C7]">
            <p>Error: You are not associated with any company. Please contact support.</p>
        </div>
    )
  }

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("id", companyUser.company_id)
    .single()

  return (
    <CompanyProvider company={company}>
        <div className="flex min-h-screen bg-[#0A0A0A]">
            <DashboardSidebar />
            <div className="flex-1 flex flex-col">
                <DashboardHeader user={user} />
                <main className="flex-1 p-6 lg:p-8">{children}</main>
            </div>
        </div>
        <Toaster /> {/* ADD THE TOASTER HERE */}
    </CompanyProvider>
  )
}

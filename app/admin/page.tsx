import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { LeadsTable } from "@/components/leads-table"
import { LeadStats } from "@/components/lead-stats"

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: leads, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching leads:", error)
  }

  return (
    <div className="min-h-screen bg-[#200E01] text-[#EDE7C7]">
      <div className="border-b border-[#C41E3A]/20 bg-[#200E01]/95 backdrop-blur-md sticky top-0 z-10">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Lead Management</h1>
              <p className="text-[#EDE7C7]/70 mt-1">Manage and track your leads</p>
            </div>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="px-4 py-2 bg-[#C41E3A]/20 border border-[#C41E3A] rounded-lg hover:bg-[#C41E3A]/30 transition-colors"
              >
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="px-8 py-8">
        <LeadStats leads={leads || []} />
        <div className="mt-8">
          <LeadsTable leads={leads || []} />
        </div>
      </div>
    </div>
  )
}

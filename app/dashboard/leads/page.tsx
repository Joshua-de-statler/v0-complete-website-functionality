import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
// Import searchParams from Next.js (available in Server Components)
import { LeadsTable } from "@/components/dashboard/leads-table"
import type { Metadata } from "next" // Import Metadata type

// Define Metadata for the page
export const metadata: Metadata = {
  title: "Leads | Zappies AI Dashboard",
  description: "View and manage all leads captured by your AI agents and web forms.",
}

// Function signature updated to receive searchParams
export default async function LeadsPage({
  searchParams,
}: {
  searchParams: { search?: string }
}) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: leads, error } = await supabase.from("leads").select("id, full_name, email, phone, company_name, message, status, notes, created_at, updated_at, source").order("created_at", { ascending: false })

  // Extract the 'search' query parameter from the URL
  const initialSearchQuery = searchParams.search || ""

  if (error) {
    console.error("LeadsPage Fetch Error:", error)
    // Pass empty array on error, the component will handle the display
    return (
        <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-[#EDE7C7]">Leads Management</h2>
              <p className="text-[#EDE7C7]/60 mt-2">View and manage all your leads in one place.</p>
            </div>
             <p className="text-red-500/80">Error loading leads: {error.message}. Check database connection.</p>
        </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-[#EDE7C7]">Leads Management</h2>
        <p className="text-[#EDE7C7]/60 mt-2">View and manage all your leads in one place.</p>
      </div>

      <LeadsTable 
        leads={leads || []}
        initialSearch={initialSearchQuery} // Pass the initial search term
      />
    </div>
  )
}

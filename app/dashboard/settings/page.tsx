import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { ProfileSettings } from "@/components/dashboard/profile-settings"
import { getCompany } from "@/lib/supabase/company-client"
import type { Metadata } from "next"

// --- METADATA ---
export const metadata: Metadata = {
  title: "Settings | Zappies AI Dashboard",
  description: "Configure your company profile, personal details, and database connection settings.",
}
// --- END METADATA ---


export default async function SettingsPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/auth/login")
  }

  // Fetch the user's profile information
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(`id, full_name`)
    .eq("id", user.id)
    .single()

  if (profileError) {
    console.error("SettingsPage Profile Fetch Error:", profileError)
    // Non-fatal, but pass null profile
  }

  // This will include the company's supabase_url and anon_key
  const companyInfo = await getCompany(supabase, user.id)

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-[#EDE7C7] tracking-tight">Settings</h2>
      <ProfileSettings
        user={{ id: user.id, email: user.email }}
        profile={profile || null}
      />

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-[#EDE7C7]">Technical Notes</h3>
        <p className="text-sm text-[#EDE7C7]/60">
          The Supabase connection settings determine which external database your AI bot reads data from. Ensure your table schemas match the bot&apos;s requirements (e.g., `conversation_history`, `meetings`, `leads`).
        </p>
        <p className="text-sm text-[#EDE7C7]/60">
          Your active Company ID: <span className="font-mono text-[#EDE7C7] bg-[#2A2A2A] px-2 py-1 rounded-sm text-xs">{companyInfo?.id || 'N/A'}</span>
        </p>
      </div>
    </div>
  )
}

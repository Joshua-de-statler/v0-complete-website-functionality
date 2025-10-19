import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProfileSettings } from "@/components/dashboard/profile-settings"

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#EDE7C7]">Settings</h2>
        <p className="text-sm sm:text-base text-[#EDE7C7]/60 mt-2">Manage your account and company settings.</p>
      </div>

      <ProfileSettings user={user} profile={profile} />
    </div>
  )
}

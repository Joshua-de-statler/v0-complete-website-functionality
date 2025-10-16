"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useCompany } from "@/components/dashboard/company-provider"

interface ProfileSettingsProps {
  user: {
    id: string
    email?: string
  }
  profile: {
    full_name: string | null
    company: string | null
  } | null
}

export function ProfileSettings({ user, profile }: ProfileSettingsProps) {
  const companyInfo = useCompany()
  const router = useRouter()
  
  const [fullName, setFullName] = useState(profile?.full_name || "")
  const [companyName, setCompanyName] = useState(companyInfo?.name || "")
  const [supabaseUrl, setSupabaseUrl] = useState(companyInfo?.supabase_url || "")
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(companyInfo?.supabase_anon_key || "")
  
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)

    // --- Defensive Check ---
    // Ensure we have company info before proceeding.
    if (!companyInfo || !companyInfo.id) {
      toast.error("Could not find company information. Please refresh and try again.")
      setIsUpdating(false)
      return;
    }

    const supabase = createClient()

    try {
      // Update the profile table
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", user.id)

      if (profileError) throw profileError

      // Update the companies table
      const { error: companyError } = await supabase
        .from("companies")
        .update({
          name: companyName,
          supabase_url: supabaseUrl,
          supabase_anon_key: supabaseAnonKey,
          updated_at: new Date().toISOString(),
        })
        .eq("id", companyInfo.id) // We now know companyInfo.id exists
        
      if (companyError) throw companyError

      toast.success("Settings updated successfully")
      router.refresh()
    } catch (error) {
      const err = error as Error
      toast.error("Failed to update settings", {
        description: err.message
      })
      console.error(error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <form onSubmit={handleUpdate} className="grid gap-6">
      {/* Cards remain the same */}
      <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
        <CardHeader>
          <CardTitle className="text-[#EDE7C7]">User Profile</CardTitle>
          <CardDescription className="text-[#EDE7C7]/60">Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#EDE7C7]/80">Email</Label>
            <Input id="email" type="email" value={user.email} disabled className="bg-[#0A0A0A] border-[#2A2A2A] text-[#EDE7C7]/60" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-[#EDE7C7]/80">Full Name</Label>
            <Input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your full name" className="bg-[#0A0A0A] border-[#2A2A2A] text-[#EDE7C7]" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
        <CardHeader>
          <CardTitle className="text-[#EDE7C7]">Company & Database</CardTitle>
          <CardDescription className="text-[#EDE7C7]/60">Manage your company details and connect your bot's database.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-[#EDE7C7]/80">Company Name</Label>
            <Input id="companyName" type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Your Company Name" className="bg-[#0A0A0A] border-[#2A2A2A] text-[#EDE7C7]" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supabaseUrl" className="text-[#EDE7C7]/80">Supabase URL</Label>
            <Input id="supabaseUrl" type="url" value={supabaseUrl || ''} onChange={(e) => setSupabaseUrl(e.target.value)} placeholder="https://<your-project-ref>.supabase.co" className="bg-[#0A0A0A] border-[#2A2A2A] text-[#EDE7C7]" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supabaseAnonKey" className="text-[#EDE7C7]/80">Supabase Anon Key</Label>
            <Input id="supabaseAnonKey" type="password" value={supabaseAnonKey || ''} onChange={(e) => setSupabaseAnonKey(e.target.value)} placeholder="Enter your Supabase anon (public) key" className="bg-[#0A0A0A] border-[#2A2A2A] text-[#EDE7C7]" />
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button type="submit" disabled={isUpdating} className="bg-[#EDE7C7] text-[#0A0A0A] hover:bg-[#EDE7C7]/90">
          {isUpdating ? "Saving..." : "Save All Settings"}
        </Button>
      </div>
    </form>
  )
}

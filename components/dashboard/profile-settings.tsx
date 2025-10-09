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
  const [fullName, setFullName] = useState(profile?.full_name || "")
  const [company, setCompany] = useState(profile?.company || "")
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          company: company,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error

      toast.success("Profile updated successfully")
      router.refresh()
    } catch (error) {
      toast.error("Failed to update profile")
      console.error(error)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="grid gap-6">
      <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
        <CardHeader>
          <CardTitle className="text-[#EDE7C7]">Profile Information</CardTitle>
          <CardDescription className="text-[#EDE7C7]/60">Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#EDE7C7]/80">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={user.email}
                disabled
                className="bg-[#0A0A0A] border-[#2A2A2A] text-[#EDE7C7]/60"
              />
              <p className="text-xs text-[#EDE7C7]/40">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-[#EDE7C7]/80">
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="bg-[#0A0A0A] border-[#2A2A2A] text-[#EDE7C7]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company" className="text-[#EDE7C7]/80">
                Company
              </Label>
              <Input
                id="company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Enter your company name"
                className="bg-[#0A0A0A] border-[#2A2A2A] text-[#EDE7C7]"
              />
            </div>

            <Button type="submit" disabled={isUpdating} className="bg-[#EDE7C7] text-[#0A0A0A] hover:bg-[#EDE7C7]/90">
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
        <CardHeader>
          <CardTitle className="text-[#EDE7C7]">Account Information</CardTitle>
          <CardDescription className="text-[#EDE7C7]/60">View your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-[#EDE7C7]/80">User ID</Label>
            <p className="text-sm text-[#EDE7C7]/60 mt-1 font-mono">{user.id}</p>
          </div>
          <div>
            <Label className="text-[#EDE7C7]/80">Account Status</Label>
            <p className="text-sm text-green-500 mt-1">Active</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

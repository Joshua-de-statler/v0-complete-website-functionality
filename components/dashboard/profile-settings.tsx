"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
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
  const { toast } = useToast()
  
  const [companyName, setCompanyName] = useState(companyInfo?.name || "")
  const [supabaseUrl, setSupabaseUrl] = useState(companyInfo?.supabase_url || "")
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(companyInfo?.supabase_anon_key || "")
  
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    
    // --- LOG 1: Log the data we are about to use ---
    console.log("Attempting to save settings. Company Info:", companyInfo);

    if (!companyInfo || !companyInfo.id) {
      toast({
        title: "Frontend Error",
        description: "Could not find company information. Please refresh and try again.",
        variant: "destructive",
      })
      setIsUpdating(false)
      return;
    }

    const supabase = createClient()

    try {
      // --- LOG 2: Log the data being sent ---
      const updates = {
        name: companyName,
        supabase_url: supabaseUrl,
        supabase_anon_key: supabaseAnonKey,
        updated_at: new Date().toISOString(),
      };
      console.log("Sending update to Supabase with data:", updates);

      const { error } = await supabase
        .from("companies")
        .update(updates)
        .eq("id", companyInfo.id)
        
      if (error) {
        // This will now throw the specific error from Supabase
        throw error
      }

      toast({
        title: "Success!",
        description: "Your settings have been updated successfully.",
      })
      router.refresh()

    } catch (error) {
      // --- LOG 3: Log the entire error object from the backend ---
      console.error("An error occurred during the update:", error);
      
      const err = error as any; // Cast as 'any' to inspect all properties
      
      toast({
        title: "Update Failed",
        // Provide a detailed and fallback error message
        description: err.message || `Error code: ${err.code}` || "An unknown database error occurred. Check the console for details.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <form onSubmit={handleUpdate} className="grid gap-6">
      <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
        <CardHeader>
          <CardTitle className="text-[#EDE7C7]">Company & Database Settings</CardTitle>
          <CardDescription className="text-[#EDE7C7]/60">Manage company details and connect your bot's database.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-[#EDE7C7]/80">Company Name</Label>
            <Input id="companyName" type="text" value={companyName || ''} onChange={(e) => setCompanyName(e.target.value)} placeholder="Your Company Name" className="bg-[#0A0A0A] border-[#2A2A2A] text-[#EDE7C7]" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supabaseUrl" className="text-[#EDE7C7]/80">Supabase URL</Label>
            <Input id="supabaseUrl" type="url" value={supabaseUrl || ''} onChange={(e) => setSupabaseUrl(e.target.value)} placeholder="https://<your-project-ref>.supabase.co" className="bg-[#0A0A0A] border-[#2A2A2A] text-[#EDE7C7]" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supabaseAnonKey" className="text-[#EDE7C7]/80">Supabase Anon Key</Label>
            <Input id="supabaseAnonKey" type="text" value={supabaseAnonKey || ''} onChange={(e) => setSupabaseAnonKey(e.target.value)} placeholder="Enter your Supabase anon (public) key" className="bg-[#0A0A0A] border-[#2A2A2A] text-[#EDE7C7]" />
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button type="submit" disabled={isUpdating} className="bg-[#EDE7C7] text-[#0A0A0A] hover:bg-[#EDE7C7]/90">
          {isUpdating ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </form>
  )
}

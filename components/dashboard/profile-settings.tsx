"use client"

import type React from "react"
import { useState, useEffect } from "react"
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
  
  const [companyName, setCompanyName] = useState("")
  const [supabaseUrl, setSupabaseUrl] = useState("")
  const [supabaseAnonKey, setSupabaseAnonKey] = useState("")
  
  const [isUpdating, setIsUpdating] = useState(false)

  // This useEffect ensures the form state is populated when companyInfo becomes available
  useEffect(() => {
    if (companyInfo) {
      console.log("LOG: CompanyProvider data loaded:", companyInfo);
      setCompanyName(companyInfo.name || "");
      setSupabaseUrl(companyInfo.supabase_url || "");
      setSupabaseAnonKey(companyInfo.supabase_anon_key || "");
    } else {
      console.log("LOG: CompanyProvider data is currently null.");
    }
  }, [companyInfo]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    
    console.log("--- SAVE BUTTON CLICKED ---");
    
    // --- LOG 1: Check the data from the provider ---
    console.log("LOG 1: Data from useCompany() hook:", companyInfo);

    if (!companyInfo || !companyInfo.id) {
      console.error("ERROR at LOG 1: Company Info or ID is missing. Aborting update.");
      toast({
        title: "Frontend Error",
        description: "Could not find company information. Please refresh and try again.",
        variant: "destructive",
      })
      setIsUpdating(false)
      return;
    }

    const supabase = createClient()
    console.log("LOG 2: Main Supabase client created.");

    try {
      const updates = {
        name: companyName,
        supabase_url: supabaseUrl,
        supabase_anon_key: supabaseAnonKey,
        updated_at: new Date().toISOString(),
      };
      // --- LOG 3: Log the exact data being sent to the database ---
      console.log("LOG 3: Sending update to 'companies' table with data:", updates);
      console.log(`Query: .eq("id", "${companyInfo.id}")`);

      const { data, error } = await supabase
        .from("companies")
        .update(updates)
        .eq("id", companyInfo.id)
        .select() // IMPORTANT: Add .select() to get back data or a more detailed error
        
      if (error) {
        // This will now throw the specific error from Supabase if one occurs
        throw error
      }

      console.log("LOG 4: Supabase update successful. Response data:", data);

      toast({
        title: "Success!",
        description: "Your settings have been updated successfully.",
      })
      router.refresh()

    } catch (error) {
      // --- LOG 5: This is the most important log. It will show the exact backend error ---
      console.error("--- CATCH BLOCK: An error occurred during the update ---", error);
      
      const err = error as any; 
      
      toast({
        title: "Update Failed",
        description: err.message || `Error code: ${err.code}` || "An unknown database error occurred. Check the console for details.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
      console.log("--- UPDATE PROCESS FINISHED ---");
    }
  }

  return (
    <form onSubmit={handleUpdate} className="grid gap-6">
      <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
        <CardHeader>
          <CardTitle className="text-[#EDE7C7]">Company & Database Settings</CardTitle>
          <CardDescription className="text-[#EDE7C7]/60">Manage your company details and connect your bot's database.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-[#EDE7C7]/80">Company Name</Label>
            <Input id="companyName" type="text" value={companyName || ''} onChange={(e) => setCompanyName(e.target.value)} placeholder="Your Company Name" className="bg-[#0A0A0A] border-[#2A2A2A] text-[#EDE7C7]" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supabaseUrl" className="text-[#EDE7C7]/80">Supabase URL(,)(,)</Label>
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

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useCompany } from "@/components/dashboard/company-provider"
import { AlertCircle, CheckCircle, User, Save } from "lucide-react" // Added User, Save icons

interface ProfileSettingsProps {
  // User object now includes id from Supabase auth
  user: {
    id: string
    email?: string
  }
  // Profile object from the 'profiles' table
  profile: {
    id: string // Should match user.id
    full_name: string | null
    // Removed company field as it's not directly stored here
  } | null
}

export function ProfileSettings({ user, profile }: ProfileSettingsProps) {
  const companyInfo = useCompany()
  const router = useRouter()
  const { toast } = useToast()

  // User Profile State
  const [fullName, setFullName] = useState("")

  // Company Settings State
  const [companyName, setCompanyName] = useState("")
  const [supabaseUrl, setSupabaseUrl] = useState("")
  const [supabaseAnonKey, setSupabaseAnonKey] = useState("")

  // UI State
  const [isUpdating, setIsUpdating] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [validationStatus, setValidationStatus] = useState<"idle" | "success" | "error">("idle")
  const [validationMessage, setValidationMessage] = useState<string>("")

  // Populate form fields on initial load or data change
  useEffect(() => {
    // Populate User Profile fields
    if (profile) {
      setFullName(profile.full_name || "")
    }
    // Populate Company fields
    if (companyInfo) {
      setCompanyName(companyInfo.name || "")
      setSupabaseUrl(companyInfo.supabase_url || "")
      setSupabaseAnonKey(companyInfo.supabase_anon_key || "")
    }
    setValidationStatus("idle") // Reset validation status
  }, [profile, companyInfo])

  // --- handleTestConnection remains the same ---
  const handleTestConnection = async () => {
    if (!supabaseUrl || !supabaseAnonKey) {
      setValidationStatus("error")
      setValidationMessage("Please enter both Supabase URL and Anon Key.")
      return
    }
    setIsValidating(true)
    setValidationStatus("idle")
    setValidationMessage("")

    try {
      const testClient = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
         auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false
        }
      })
      const { data, error } = await testClient.rpc('get_schema_and_tables')

      if (error) {
        console.error("Connection Test Error (Supabase):", error);
        throw new Error(error.message || "Failed to connect. Check URL/Key and network permissions.");
      }

      console.log("Connection Test Success:", data)
      setValidationStatus("success")
      setValidationMessage("Connection successful!")

    } catch (error: any) {
      console.error("Connection Test Error (Catch):", error)
      setValidationStatus("error")
      setValidationMessage(`Connection failed: ${error.message || "Unknown error."}`)
    } finally {
      setIsValidating(false)
    }
  }


  // Updated handleUpdate to save both profile and company info
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)
    setValidationStatus("idle")

    if (!user || !user.id) {
      toast({ title: "Error", description: "User information missing.", variant: "destructive" })
      setIsUpdating(false)
      return
    }
    if (!companyInfo || !companyInfo.id) {
      toast({ title: "Error", description: "Company information missing.", variant: "destructive" })
      setIsUpdating(false)
      return
    }

    const supabase = createClient()
    let updateSuccessful = true // Flag to track success

    try {
      // --- Update User Profile ---
      const profileUpdates = {
        full_name: fullName,
        updated_at: new Date().toISOString(),
      }
      console.log("LOG: Updating 'profiles' table with data:", profileUpdates);
      const { error: profileError } = await supabase
        .from("profiles")
        .update(profileUpdates)
        .eq("id", user.id) // Match the logged-in user's ID

      if (profileError) {
        console.error("Profile Update Error:", profileError);
        toast({ title: "Profile Update Failed", description: profileError.message, variant: "destructive" });
        updateSuccessful = false; // Mark failure
        // Decide whether to stop here or continue with company update
        // For now, we'll stop if the profile update fails.
        throw profileError;
      }
       console.log("LOG: Profile update successful.");

      // --- Update Company Settings (only if profile update was successful) ---
      const companyUpdates = {
        name: companyName,
        supabase_url: supabaseUrl,
        supabase_anon_key: supabaseAnonKey,
        updated_at: new Date().toISOString(),
      }
      console.log("LOG: Updating 'companies' table with data:", companyUpdates);
      const { error: companyError } = await supabase
        .from("companies")
        .update(companyUpdates)
        .eq("id", companyInfo.id)

      if (companyError) {
         console.error("Company Update Error:", companyError);
         toast({ title: "Company Settings Update Failed", description: companyError.message, variant: "destructive" });
         updateSuccessful = false; // Mark failure
         throw companyError;
      }
      console.log("LOG: Company settings update successful.");


      // If both updates were successful
      toast({
        title: "Success!",
        description: "Your settings have been updated successfully.",
      })
      router.refresh() // Refresh to reflect changes

    } catch (error: any) {
      // Error already toasted inside try block if specific update failed
      console.error("--- CATCH BLOCK: An error occurred during settings update ---", error);
      // General error toast if something else went wrong
       if (updateSuccessful) { // Avoid double-toasting if specific update failed
            toast({
                title: "Update Failed",
                description: "An unexpected error occurred during the update.",
                variant: "destructive",
            });
       }
    } finally {
      setIsUpdating(false)
      console.log("--- UPDATE SETTINGS PROCESS FINISHED ---");
    }
  }

  // Reset validation status if URL or Key changes
  useEffect(() => {
    setValidationStatus("idle")
    setValidationMessage("")
  }, [supabaseUrl, supabaseAnonKey])

  return (
    <form onSubmit={handleUpdate} className="grid gap-6">
      {/* User Profile Card */}
       <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
        <CardHeader>
          <CardTitle className="text-[#EDE7C7] flex items-center gap-2"><User className="h-5 w-5"/> Your Profile</CardTitle>
          <CardDescription className="text-[#EDE7C7]/60">Manage your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="space-y-2">
            <Label htmlFor="emailDisplay" className="text-[#EDE7C7]/80">Email</Label>
            {/* Display email as read-only */}
            <Input id="emailDisplay" type="email" value={user.email || ''} readOnly disabled className="bg-[#0A0A0A]/50 border-[#2A2A2A] text-[#EDE7C7]/70 cursor-not-allowed" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-[#EDE7C7]/80">Full Name</Label>
            <Input id="fullName" type="text" value={fullName || ''} onChange={(e) => setFullName(e.target.value)} placeholder="Your Full Name" className="bg-[#0A0A0A] border-[#2A2A2A] text-[#EDE7C7]" />
          </div>
        </CardContent>
      </Card>

      {/* Company & Database Card */}
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
            <Label htmlFor="supabaseUrl" className="text-[#EDE7C7]/80">Supabase URL</Label>
            <Input id="supabaseUrl" type="url" value={supabaseUrl || ''} onChange={(e) => setSupabaseUrl(e.target.value)} placeholder="https://<your-project-ref>.supabase.co" className="bg-[#0A0A0A] border-[#2A2A2A] text-[#EDE7C7]" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supabaseAnonKey" className="text-[#EDE7C7]/80">Supabase Anon Key</Label>
            <Input id="supabaseAnonKey" type="text" value={supabaseAnonKey || ''} onChange={(e) => setSupabaseAnonKey(e.target.value)} placeholder="Enter your Supabase anon (public) key" className="bg-[#0A0A0A] border-[#2A2A2A] text-[#EDE7C7]" />
          </div>
          {/* Validation Feedback */}
          {validationStatus !== "idle" && (
            <div className={`flex items-center gap-2 text-sm mt-2 ${validationStatus === 'success' ? 'text-green-500' : 'text-red-500'}`}>
              {validationStatus === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <span>{validationMessage}</span>
            </div>
          )}
          {/* Test Connection Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTestConnection}
            disabled={isValidating || !supabaseUrl || !supabaseAnonKey}
            className="mt-2 text-[#EDE7C7]/80 border-[#2A2A2A] hover:bg-[#2A2A2A]/50 hover:text-[#EDE7C7]"
          >
            {isValidating ? "Testing..." : "Test Connection"}
          </Button>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isUpdating || isValidating} className="bg-[#EDE7C7] text-[#0A0A0A] hover:bg-[#EDE7C7]/90">
          {isUpdating ? "Saving..." : <><Save className="h-4 w-4 mr-2"/> Save All Settings</>}
        </Button>
      </div>
    </form>
  )
}

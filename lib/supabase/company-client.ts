"use client"

import { createClient } from "@supabase/supabase-js"
import { useCompany } from "@/components/dashboard/company-provider"
import { useMemo } from "react"
import type { SupabaseClient } from "@supabase/supabase-js"

// This is a custom hook that creates a Supabase client for the current company
export function useCompanySupabase() {
  const company = useCompany()

  const client = useMemo(() => {
    if (!company || !company.supabase_url || !company.supabase_anon_key) {
      return null
    }
    return createClient(company.supabase_url, company.supabase_anon_key)
  }, [company])

  return client
}

export async function getCompany(supabase: SupabaseClient, userId: string) {
  try {
    // First get the user's company_id from company_users table
    const { data: companyUser, error: companyUserError } = await supabase
      .from("company_users")
      .select("company_id")
      .eq("user_id", userId)
      .single()

    if (companyUserError || !companyUser) {
      console.error("Error fetching company_user:", companyUserError)
      return null
    }

    // Then fetch the company details
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("id, name, supabase_url, supabase_anon_key")
      .eq("id", companyUser.company_id)
      .single()

    if (companyError) {
      console.error("Error fetching company:", companyError)
      return null
    }

    return company
  } catch (error) {
    console.error("Unexpected error in getCompany:", error)
    return null
  }
}

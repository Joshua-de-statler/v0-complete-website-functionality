"use client"

import { createClient } from "@supabase/supabase-js"
import { useCompany } from "@/components/dashboard/company-provider"
import { useMemo } from "react"
import type { SupabaseClient } from "@supabase/supabase-js"

// This is a custom hook that creates a Supabase client for the current company
export function useCompanySupabase() {
  const company = useCompany()

  // useMemo will only re-run and create a new client if the company's URL or key changes.
  const client = useMemo(() => {
    if (!company || !company.supabase_url || !company.supabase_anon_key) {
      return null
    }
    // Create and return a new Supabase client instance
    return createClient(company.supabase_url, company.supabase_anon_key)
  }, [company]) // The dependency array ensures this only runs when 'company' changes

  return client
}

export async function getCompany(supabase: SupabaseClient, userId: string) {
  // First, find which company the user belongs to
  const { data: companyUser, error: companyUserError } = await supabase
    .from("company_users")
    .select("company_id")
    .eq("user_id", userId)
    .single()

  if (companyUserError || !companyUser) {
    console.error("[v0] Error fetching company_user:", companyUserError)
    return null
  }

  // Then fetch the company details
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("*")
    .eq("id", companyUser.company_id)
    .single()

  if (companyError) {
    console.error("[v0] Error fetching company:", companyError)
    return null
  }

  return company
}

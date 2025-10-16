import { createClient } from "@supabase/supabase-js"
import { useCompany } from "@/components/dashboard/company-provider"

// This is a custom hook that creates a Supabase client for the current company
export function useCompanySupabase() {
  const company = useCompany()

  if (!company || !company.supabase_url || !company.supabase_anon_key) {
    // This can happen if the company hasn't configured their credentials yet.
    // We'll return null and handle this gracefully in the components.
    return null
  }

  // Create and return a new Supabase client instance using the company's credentials.
  // Note: It's important to create this instance inside the hook or component
  // to ensure it uses the correct, current company's credentials.
  return createClient(company.supabase_url, company.supabase_anon_key)
}

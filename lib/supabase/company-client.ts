import { createClient } from "@supabase/supabase-js"
import { useCompany } from "@/components/dashboard/company-provider"
import { useMemo } from "react" // Import useMemo

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

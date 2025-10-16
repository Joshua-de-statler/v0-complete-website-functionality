"use client"

import type React from "react"
import { createContext, useContext } from "react"

// Define the shape of your company data
interface Company {
  id: string
  name: string
  owner_id: string
  supabase_url: string | null
  supabase_anon_key: string | null
  // Add any other company fields here
}

const CompanyContext = createContext<Company | null>(null)

export function CompanyProvider({ children, company }: { children: React.ReactNode; company: Company | null }) {
  return <CompanyContext.Provider value={company}>{children}</CompanyContext.Provider>
}

export function useCompany() {
  const context = useContext(CompanyContext)
  if (context === undefined) {
    throw new Error("useCompany must be used within a CompanyProvider")
  }
  return context
}

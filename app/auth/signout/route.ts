import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers" // Import cookies HERE
import { NextResponse, type NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  const cookieStore = cookies() // Get the cookie store
  const supabase = createClient(cookieStore) // Pass it to createClient

  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    await supabase.auth.signOut()
  }

  return NextResponse.redirect(new URL("/", req.url), {
    status: 302,
  })
}

import { createServerClient, type CookieOptions } from "@supabase/ssr"
// Remove the direct import of cookies
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies' // Import the necessary type

// Modify createClient to accept cookieStore as an argument
export function createClient(cookieStore: ReadonlyRequestCookies) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // Can be ignored if middleware refreshes sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // Can be ignored if middleware refreshes sessions.
          }
        },
      },
    },
  )
}

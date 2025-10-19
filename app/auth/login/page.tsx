"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    console.log(`Attempting login for email: ${email}`); // Log email

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (signInError) {
        // **DETAILED ERROR LOGGING**
        console.error("--- Supabase signInWithPassword Error ---");
        console.error("Error Code:", signInError.code);
        console.error("Error Status:", signInError.status);
        console.error("Error Message:", signInError.message);
        console.error("Full Error Object:", signInError);
        console.error("---------------------------------------");

        // Set a more informative error message if possible
        if (signInError.message.includes("Email not confirmed")) {
          setError("Email not confirmed. Please check your inbox for the verification link.")
        } else if (signInError.status === 400) {
           setError("Invalid login credentials provided to Supabase.")
        } else {
           setError(`Login failed: ${signInError.message}`)
        }
        setIsLoading(false)
        return;
      }

      console.log("Login successful. Received data:", data); // Log success data
      router.push("/dashboard")
      router.refresh()

    } catch (catchError: unknown) {
      console.error("--- Catch Block Error ---");
      console.error("Caught an unexpected error during login:", catchError);
      console.error("-------------------------");
      setError(catchError instanceof Error ? catchError.message : "An unexpected error occurred.")
      setIsLoading(false)
    }
    // Note: Removed finally block for isLoading = false, as it's handled in error/success paths.
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0A0A0A] p-6">
      <div className="w-full max-w-sm">
        <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
          <CardHeader>
            <CardTitle className="text-2xl text-[#EDE7C7]">Login</CardTitle>
            <CardDescription className="text-[#EDE7C7]/60">
              Enter your credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-[#EDE7C7]">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-[#0A0A0A] border-[#2A2A2A] text-[#EDE7C7]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-[#EDE7C7]">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-[#0A0A0A] border-[#2A2A2A] text-[#EDE7C7]"
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button
                  type="submit"
                  className="w-full bg-[#EDE7C7] text-[#0A0A0A] hover:bg-[#EDE7C7]/90"
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm text-[#EDE7C7]/60">
                Don&apos;t have an account?{" "}
                <Link href="/auth/signup" className="text-[#EDE7C7] underline underline-offset-4">
                  Sign up
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

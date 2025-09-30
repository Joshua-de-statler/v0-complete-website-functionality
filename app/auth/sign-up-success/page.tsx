import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-[#200E01]">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card className="bg-[#8B1538]/10 backdrop-blur-md border-[#C41E3A]/20">
            <CardHeader>
              <CardTitle className="text-2xl text-[#EDE7C7]">Check Your Email</CardTitle>
              <CardDescription className="text-[#EDE7C7]/70">
                Confirm your account to access the admin dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-[#EDE7C7]/80">
                We've sent you an email with a confirmation link. Please check your inbox and click the link to activate
                your account.
              </p>
              <Link href="/auth/login">
                <Button className="w-full bg-gradient-to-r from-[#C41E3A] to-[#8B1538] text-[#EDE7C7]">
                  Back to Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

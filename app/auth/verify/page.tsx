import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function VerifyPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#0A0A0A] p-6">
      <div className="w-full max-w-sm">
        <Card className="bg-[#1A1A1A] border-[#2A2A2A]">
          <CardHeader>
            <CardTitle className="text-2xl text-[#EDE7C7]">Check your email</CardTitle>
            <CardDescription className="text-[#EDE7C7]/60">We&apos;ve sent you a verification link</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[#EDE7C7]/80">
              Please check your email and click the verification link to activate your account. Once verified, you can
              log in to access the dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

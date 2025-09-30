import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Background } from "@/components/background"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

export default function PricingPage() {
  return (
    <>
      <Background />
      <Navigation />

      <main className="pt-32 pb-20 px-[5%]">
        <div className="max-w-[1400px] mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-20">
            <div className="inline-block px-5 py-2 bg-[#8B0000]/20 border border-[#8B0000] rounded-full text-sm mb-5">
              Transparent Pricing
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 bg-gradient-to-r from-[#EDE7C7] via-[#8B0000] to-[#EDE7C7] bg-clip-text text-transparent text-balance">
              Invest in Your Business Growth
            </h1>
            <p className="text-xl text-[#EDE7C7]/80 max-w-3xl mx-auto leading-relaxed">
              Choose the plan that fits your business size and goals. All plans include our core AI technology with
              varying levels of customization and support.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {/* Starter Plan */}
            <Card className="bg-[#5B0202]/10 backdrop-blur-md border-[#8B0000]/20 hover:border-[#8B0000] transition-all">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl text-[#EDE7C7] mb-2">Starter</CardTitle>
                <CardDescription className="text-[#EDE7C7]/70">Perfect for growing builders</CardDescription>
                <div className="mt-6">
                  <div className="text-5xl font-bold text-[#EDE7C7]">R4,999</div>
                  <div className="text-[#EDE7C7]/60 mt-2">/month</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#8B0000] mt-0.5 flex-shrink-0" />
                    <span className="text-[#EDE7C7]/80">Lead Qualification AI</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#8B0000] mt-0.5 flex-shrink-0" />
                    <span className="text-[#EDE7C7]/80">Basic Client Communication</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#8B0000] mt-0.5 flex-shrink-0" />
                    <span className="text-[#EDE7C7]/80">Up to 100 leads/month</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#8B0000] mt-0.5 flex-shrink-0" />
                    <span className="text-[#EDE7C7]/80">Email & WhatsApp integration</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#8B0000] mt-0.5 flex-shrink-0" />
                    <span className="text-[#EDE7C7]/80">Basic analytics dashboard</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#8B0000] mt-0.5 flex-shrink-0" />
                    <span className="text-[#EDE7C7]/80">Email support</span>
                  </li>
                </ul>
                <Link href="/demo" className="block">
                  <Button className="w-full py-6 bg-transparent border-2 border-[#8B0000] text-[#EDE7C7] rounded-full font-semibold hover:bg-[#8B0000] transition-all">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Professional Plan - Featured */}
            <Card className="bg-gradient-to-b from-[#8B0000]/20 to-[#5B0202]/10 backdrop-blur-md border-2 border-[#8B0000] hover:border-[#8B0000] transition-all relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#8B0000] text-[#EDE7C7] rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl text-[#EDE7C7] mb-2">Professional</CardTitle>
                <CardDescription className="text-[#EDE7C7]/70">For established builders</CardDescription>
                <div className="mt-6">
                  <div className="text-5xl font-bold text-[#EDE7C7]">R9,999</div>
                  <div className="text-[#EDE7C7]/60 mt-2">/month</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#8B0000] mt-0.5 flex-shrink-0" />
                    <span className="text-[#EDE7C7]/80">Everything in Starter</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#8B0000] mt-0.5 flex-shrink-0" />
                    <span className="text-[#EDE7C7]/80">Project Management AI</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#8B0000] mt-0.5 flex-shrink-0" />
                    <span className="text-[#EDE7C7]/80">Advanced Client Communication</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#8B0000] mt-0.5 flex-shrink-0" />
                    <span className="text-[#EDE7C7]/80">Up to 500 leads/month</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#8B0000] mt-0.5 flex-shrink-0" />
                    <span className="text-[#EDE7C7]/80">Cost Estimation AI</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#8B0000] mt-0.5 flex-shrink-0" />
                    <span className="text-[#EDE7C7]/80">Advanced analytics & insights</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#8B0000] mt-0.5 flex-shrink-0" />
                    <span className="text-[#EDE7C7]/80">Priority support</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#8B0000] mt-0.5 flex-shrink-0" />
                    <span className="text-[#EDE7C7]/80">Custom integrations</span>
                  </li>
                </ul>
                <Link href="/demo" className="block">
                  <Button className="w-full py-6 bg-gradient-to-r from-[#8B0000] to-[#5B0202] text-[#EDE7C7] rounded-full font-semibold hover:scale-105 transition-all">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="bg-[#5B0202]/10 backdrop-blur-md border-[#8B0000]/20 hover:border-[#8B0000] transition-all">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl text-[#EDE7C7] mb-2">Enterprise</CardTitle>
                <CardDescription className="text-[#EDE7C7]/70">For large-scale operations</CardDescription>
                <div className="mt-6">
                  <div className="text-5xl font-bold text-[#EDE7C7]">Custom</div>
                  <div className="text-[#EDE7C7]/60 mt-2">Contact us</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#8B0000] mt-0.5 flex-shrink-0" />
                    <span className="text-[#EDE7C7]/80">Everything in Professional</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#8B0000] mt-0.5 flex-shrink-0" />
                    <span className="text-[#EDE7C7]/80">Unlimited leads</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#8B0000] mt-0.5 flex-shrink-0" />
                    <span className="text-[#EDE7C7]/80">Vendor Management AI</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#8B0000] mt-0.5 flex-shrink-0" />
                    <span className="text-[#EDE7C7]/80">Custom AI agent development</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#8B0000] mt-0.5 flex-shrink-0" />
                    <span className="text-[#EDE7C7]/80">White-label options</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#8B0000] mt-0.5 flex-shrink-0" />
                    <span className="text-[#EDE7C7]/80">Dedicated account manager</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#8B0000] mt-0.5 flex-shrink-0" />
                    <span className="text-[#EDE7C7]/80">24/7 phone support</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#8B0000] mt-0.5 flex-shrink-0" />
                    <span className="text-[#EDE7C7]/80">SLA guarantees</span>
                  </li>
                </ul>
                <Link href="/demo" className="block">
                  <Button className="w-full py-6 bg-transparent border-2 border-[#8B0000] text-[#EDE7C7] rounded-full font-semibold hover:bg-[#8B0000] transition-all">
                    Contact Sales
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* ROI Calculator Section */}
          <div className="bg-[#5B0202]/10 backdrop-blur-md border border-[#8B0000]/20 rounded-3xl p-12 mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center bg-gradient-to-r from-[#EDE7C7] to-[#8B0000] bg-clip-text text-transparent">
              Calculate Your ROI
            </h2>
            <p className="text-xl text-[#EDE7C7]/80 text-center mb-10 max-w-3xl mx-auto">
              Based on our client data, here's what you can expect from implementing Zappies AI:
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-[#8B0000]/10 rounded-2xl">
                <div className="text-4xl mb-3">💰</div>
                <div className="text-3xl font-bold text-[#EDE7C7] mb-2">R2.4M</div>
                <div className="text-[#EDE7C7]/70">Average Annual Savings</div>
              </div>
              <div className="text-center p-6 bg-[#8B0000]/10 rounded-2xl">
                <div className="text-4xl mb-3">📈</div>
                <div className="text-3xl font-bold text-[#EDE7C7] mb-2">4.2x</div>
                <div className="text-[#EDE7C7]/70">Average ROI</div>
              </div>
              <div className="text-center p-6 bg-[#8B0000]/10 rounded-2xl">
                <div className="text-4xl mb-3">⏱️</div>
                <div className="text-3xl font-bold text-[#EDE7C7] mb-2">3 Months</div>
                <div className="text-[#EDE7C7]/70">Typical Payback Period</div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center bg-gradient-to-r from-[#EDE7C7] to-[#8B0000] bg-clip-text text-transparent">
              Frequently Asked Questions
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-[#5B0202]/10 backdrop-blur-md border-[#8B0000]/20">
                <CardHeader>
                  <CardTitle className="text-xl text-[#EDE7C7]">Is there a setup fee?</CardTitle>
                </CardHeader>
                <CardContent className="text-[#EDE7C7]/80">
                  No, all plans include free setup and onboarding. We'll work with you to configure the AI agents to
                  match your business processes.
                </CardContent>
              </Card>

              <Card className="bg-[#5B0202]/10 backdrop-blur-md border-[#8B0000]/20">
                <CardHeader>
                  <CardTitle className="text-xl text-[#EDE7C7]">Can I change plans later?</CardTitle>
                </CardHeader>
                <CardContent className="text-[#EDE7C7]/80">
                  Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next
                  billing cycle.
                </CardContent>
              </Card>

              <Card className="bg-[#5B0202]/10 backdrop-blur-md border-[#8B0000]/20">
                <CardHeader>
                  <CardTitle className="text-xl text-[#EDE7C7]">What integrations are included?</CardTitle>
                </CardHeader>
                <CardContent className="text-[#EDE7C7]/80">
                  All plans include email and WhatsApp integration. Professional and Enterprise plans include custom
                  integrations with your existing CRM and project management tools.
                </CardContent>
              </Card>

              <Card className="bg-[#5B0202]/10 backdrop-blur-md border-[#8B0000]/20">
                <CardHeader>
                  <CardTitle className="text-xl text-[#EDE7C7]">Is there a contract?</CardTitle>
                </CardHeader>
                <CardContent className="text-[#EDE7C7]/80">
                  Starter and Professional plans are month-to-month with no long-term commitment. Enterprise plans
                  typically include annual contracts with volume discounts.
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-[#EDE7C7] to-[#8B0000] bg-clip-text text-transparent">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-[#EDE7C7]/80 mb-8 max-w-2xl mx-auto">
              Schedule a demo to see how Zappies AI can transform your building business and discuss which plan is right
              for you.
            </p>
            <Link href="/demo">
              <Button className="px-10 py-6 text-lg bg-gradient-to-r from-[#8B0000] to-[#5B0202] text-[#EDE7C7] rounded-full font-semibold hover:scale-105 hover:shadow-lg hover:shadow-[#8B0000]/30 transition-all">
                Schedule Your Demo
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}

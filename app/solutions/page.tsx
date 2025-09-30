import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Background } from "@/components/background"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SolutionsPage() {
  return (
    <>
      <Background />
      <Navigation />

      <main className="pt-32 pb-20 px-[5%]">
        <div className="max-w-[1400px] mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-20">
            <div className="inline-block px-5 py-2 bg-[#8B0000]/20 border border-[#8B0000] rounded-full text-sm mb-5">
              AI-Powered Solutions
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 bg-gradient-to-r from-[#EDE7C7] via-[#8B0000] to-[#EDE7C7] bg-clip-text text-transparent text-balance">
              Tailored AI Solutions for Every Stage of Your Build
            </h1>
            <p className="text-xl text-[#EDE7C7]/80 max-w-3xl mx-auto leading-relaxed">
              From initial client contact to project completion, our AI agents work seamlessly across your entire
              operation to deliver measurable results.
            </p>
          </div>

          {/* Solutions Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-20">
            <Card className="bg-[#5B0202]/10 backdrop-blur-md border-[#8B0000]/20 hover:border-[#8B0000] transition-all">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-[#8B0000] to-[#5B0202] rounded-2xl flex items-center justify-center text-3xl mb-4">
                  💬
                </div>
                <CardTitle className="text-2xl text-[#EDE7C7]">Lead Qualification AI</CardTitle>
                <CardDescription className="text-[#EDE7C7]/70">
                  Automatically qualify and nurture leads 24/7
                </CardDescription>
              </CardHeader>
              <CardContent className="text-[#EDE7C7]/80 space-y-3">
                <p>
                  Our AI agents engage with potential clients instantly, asking the right questions to understand their
                  needs, budget, and timeline.
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Instant response to inquiries</li>
                  <li>Budget and timeline qualification</li>
                  <li>Automated follow-up sequences</li>
                  <li>CRM integration and lead scoring</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-[#5B0202]/10 backdrop-blur-md border-[#8B0000]/20 hover:border-[#8B0000] transition-all">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-[#8B0000] to-[#5B0202] rounded-2xl flex items-center justify-center text-3xl mb-4">
                  📋
                </div>
                <CardTitle className="text-2xl text-[#EDE7C7]">Project Management AI</CardTitle>
                <CardDescription className="text-[#EDE7C7]/70">
                  Intelligent project tracking and optimization
                </CardDescription>
              </CardHeader>
              <CardContent className="text-[#EDE7C7]/80 space-y-3">
                <p>
                  Keep projects on track with AI that monitors progress, predicts delays, and suggests optimizations in
                  real-time.
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Real-time progress tracking</li>
                  <li>Delay prediction and prevention</li>
                  <li>Resource allocation optimization</li>
                  <li>Automated status reporting</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-[#5B0202]/10 backdrop-blur-md border-[#8B0000]/20 hover:border-[#8B0000] transition-all">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-[#8B0000] to-[#5B0202] rounded-2xl flex items-center justify-center text-3xl mb-4">
                  👥
                </div>
                <CardTitle className="text-2xl text-[#EDE7C7]">Client Communication AI</CardTitle>
                <CardDescription className="text-[#EDE7C7]/70">
                  Personalized updates and support at scale
                </CardDescription>
              </CardHeader>
              <CardContent className="text-[#EDE7C7]/80 space-y-3">
                <p>
                  Maintain exceptional client relationships with AI that provides personalized updates and answers
                  questions instantly.
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Automated project updates</li>
                  <li>24/7 client support</li>
                  <li>Personalized communication</li>
                  <li>Multi-channel messaging</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-[#5B0202]/10 backdrop-blur-md border-[#8B0000]/20 hover:border-[#8B0000] transition-all">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-[#8B0000] to-[#5B0202] rounded-2xl flex items-center justify-center text-3xl mb-4">
                  💰
                </div>
                <CardTitle className="text-2xl text-[#EDE7C7]">Cost Estimation AI</CardTitle>
                <CardDescription className="text-[#EDE7C7]/70">Accurate quotes powered by market data</CardDescription>
              </CardHeader>
              <CardContent className="text-[#EDE7C7]/80 space-y-3">
                <p>
                  Generate accurate cost estimates instantly using AI trained on South African market data and your
                  historical projects.
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Instant quote generation</li>
                  <li>Material cost tracking</li>
                  <li>Labor estimation</li>
                  <li>Profit margin optimization</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-[#5B0202]/10 backdrop-blur-md border-[#8B0000]/20 hover:border-[#8B0000] transition-all">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-[#8B0000] to-[#5B0202] rounded-2xl flex items-center justify-center text-3xl mb-4">
                  📊
                </div>
                <CardTitle className="text-2xl text-[#EDE7C7]">Analytics & Insights AI</CardTitle>
                <CardDescription className="text-[#EDE7C7]/70">Data-driven decisions for growth</CardDescription>
              </CardHeader>
              <CardContent className="text-[#EDE7C7]/80 space-y-3">
                <p>
                  Unlock business insights with AI that analyzes your operations and identifies opportunities for
                  improvement.
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Performance dashboards</li>
                  <li>Trend analysis</li>
                  <li>Profitability insights</li>
                  <li>Competitive intelligence</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-[#5B0202]/10 backdrop-blur-md border-[#8B0000]/20 hover:border-[#8B0000] transition-all">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-[#8B0000] to-[#5B0202] rounded-2xl flex items-center justify-center text-3xl mb-4">
                  🔧
                </div>
                <CardTitle className="text-2xl text-[#EDE7C7]">Vendor Management AI</CardTitle>
                <CardDescription className="text-[#EDE7C7]/70">Streamlined supplier coordination</CardDescription>
              </CardHeader>
              <CardContent className="text-[#EDE7C7]/80 space-y-3">
                <p>
                  Coordinate with suppliers and subcontractors efficiently using AI that manages orders, schedules, and
                  communications.
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Automated purchase orders</li>
                  <li>Delivery scheduling</li>
                  <li>Vendor performance tracking</li>
                  <li>Price comparison</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Integration Section */}
          <div className="bg-[#5B0202]/10 backdrop-blur-md border border-[#8B0000]/20 rounded-3xl p-12 mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center bg-gradient-to-r from-[#EDE7C7] to-[#8B0000] bg-clip-text text-transparent">
              Seamless Integration with Your Existing Tools
            </h2>
            <p className="text-xl text-[#EDE7C7]/80 text-center mb-10 max-w-3xl mx-auto">
              Our AI agents integrate with the tools you already use, ensuring a smooth transition and immediate value.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="p-6 bg-[#8B0000]/10 rounded-2xl">
                <div className="text-4xl mb-3">📧</div>
                <div className="text-[#EDE7C7] font-semibold">Email</div>
              </div>
              <div className="p-6 bg-[#8B0000]/10 rounded-2xl">
                <div className="text-4xl mb-3">💬</div>
                <div className="text-[#EDE7C7] font-semibold">WhatsApp</div>
              </div>
              <div className="p-6 bg-[#8B0000]/10 rounded-2xl">
                <div className="text-4xl mb-3">📱</div>
                <div className="text-[#EDE7C7] font-semibold">CRM Systems</div>
              </div>
              <div className="p-6 bg-[#8B0000]/10 rounded-2xl">
                <div className="text-4xl mb-3">📊</div>
                <div className="text-[#EDE7C7] font-semibold">Project Tools</div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-[#EDE7C7] to-[#8B0000] bg-clip-text text-transparent">
              Ready to See These Solutions in Action?
            </h2>
            <p className="text-xl text-[#EDE7C7]/80 mb-8 max-w-2xl mx-auto">
              Book a personalized demo to discover how our AI solutions can transform your building business.
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

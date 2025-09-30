import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Background } from "@/components/background"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function CaseStudiesPage() {
  return (
    <>
      <Background />
      <Navigation />

      <main className="pt-32 pb-20 px-[5%]">
        <div className="max-w-[1400px] mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-20">
            <div className="inline-block px-5 py-2 bg-[#8B0000]/20 border border-[#8B0000] rounded-full text-sm mb-5">
              Success Stories
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 bg-gradient-to-r from-[#EDE7C7] via-[#8B0000] to-[#EDE7C7] bg-clip-text text-transparent text-balance">
              Real Results from South Africa's Leading Builders
            </h1>
            <p className="text-xl text-[#EDE7C7]/80 max-w-3xl mx-auto leading-relaxed">
              Discover how premium home builders are transforming their operations and scaling their businesses with
              Zappies AI.
            </p>
          </div>

          {/* Case Studies */}
          <div className="space-y-16 mb-20">
            {/* Case Study 1 */}
            <Card className="bg-[#5B0202]/10 backdrop-blur-md border-[#8B0000]/20 overflow-hidden">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="p-10">
                  <div className="inline-block px-4 py-1 bg-[#8B0000]/30 rounded-full text-sm mb-4">
                    Cape Town, Western Cape
                  </div>
                  <CardHeader className="p-0 mb-6">
                    <CardTitle className="text-3xl text-[#EDE7C7] mb-3">
                      Luxury Homes Cape Town: 3x Lead Conversion
                    </CardTitle>
                    <CardDescription className="text-[#EDE7C7]/70 text-lg">
                      How a boutique builder tripled their lead conversion rate with AI-powered qualification
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 space-y-4 text-[#EDE7C7]/80">
                    <p className="leading-relaxed">
                      Luxury Homes Cape Town was struggling to respond to inquiries quickly enough, losing potential
                      clients to competitors. After implementing our Lead Qualification AI, they saw immediate results.
                    </p>
                    <div className="grid grid-cols-2 gap-4 py-6">
                      <div className="text-center p-4 bg-[#8B0000]/20 rounded-xl">
                        <div className="text-3xl font-bold text-[#EDE7C7] mb-1">3x</div>
                        <div className="text-sm text-[#EDE7C7]/70">Lead Conversion</div>
                      </div>
                      <div className="text-center p-4 bg-[#8B0000]/20 rounded-xl">
                        <div className="text-3xl font-bold text-[#EDE7C7] mb-1">92%</div>
                        <div className="text-sm text-[#EDE7C7]/70">Response Time Reduction</div>
                      </div>
                    </div>
                    <blockquote className="border-l-4 border-[#8B0000] pl-4 italic text-[#EDE7C7]/90">
                      "Zappies AI transformed how we handle inquiries. We're now responding instantly, 24/7, and our
                      conversion rate has never been higher."
                    </blockquote>
                    <p className="text-sm text-[#EDE7C7]/60">— Michael van der Merwe, Owner</p>
                  </CardContent>
                </div>
                <div className="bg-gradient-to-br from-[#8B0000]/20 to-[#5B0202]/10 flex items-center justify-center p-10">
                  <div className="text-center">
                    <div className="text-8xl mb-4">🏠</div>
                    <div className="text-2xl font-bold text-[#EDE7C7]">R4.2M</div>
                    <div className="text-[#EDE7C7]/70">Additional Revenue in 6 Months</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Case Study 2 */}
            <Card className="bg-[#5B0202]/10 backdrop-blur-md border-[#8B0000]/20 overflow-hidden">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-[#8B0000]/20 to-[#5B0202]/10 flex items-center justify-center p-10 order-2 md:order-1">
                  <div className="text-center">
                    <div className="text-8xl mb-4">⏱️</div>
                    <div className="text-2xl font-bold text-[#EDE7C7]">15 Hours</div>
                    <div className="text-[#EDE7C7]/70">Saved Per Week</div>
                  </div>
                </div>
                <div className="p-10 order-1 md:order-2">
                  <div className="inline-block px-4 py-1 bg-[#8B0000]/30 rounded-full text-sm mb-4">
                    Johannesburg, Gauteng
                  </div>
                  <CardHeader className="p-0 mb-6">
                    <CardTitle className="text-3xl text-[#EDE7C7] mb-3">
                      Premier Builds JHB: Automated Project Management
                    </CardTitle>
                    <CardDescription className="text-[#EDE7C7]/70 text-lg">
                      Streamlining operations and eliminating administrative bottlenecks
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 space-y-4 text-[#EDE7C7]/80">
                    <p className="leading-relaxed">
                      Managing 12 concurrent luxury home projects was overwhelming their small team. Our Project
                      Management AI automated status updates, resource allocation, and client communications.
                    </p>
                    <div className="grid grid-cols-2 gap-4 py-6">
                      <div className="text-center p-4 bg-[#8B0000]/20 rounded-xl">
                        <div className="text-3xl font-bold text-[#EDE7C7] mb-1">87%</div>
                        <div className="text-sm text-[#EDE7C7]/70">Less Admin Time</div>
                      </div>
                      <div className="text-center p-4 bg-[#8B0000]/20 rounded-xl">
                        <div className="text-3xl font-bold text-[#EDE7C7] mb-1">100%</div>
                        <div className="text-sm text-[#EDE7C7]/70">On-Time Delivery</div>
                      </div>
                    </div>
                    <blockquote className="border-l-4 border-[#8B0000] pl-4 italic text-[#EDE7C7]/90">
                      "We've gone from drowning in admin work to focusing on what we do best - building exceptional
                      homes. The AI handles everything else."
                    </blockquote>
                    <p className="text-sm text-[#EDE7C7]/60">— Sarah Naidoo, Project Director</p>
                  </CardContent>
                </div>
              </div>
            </Card>

            {/* Case Study 3 */}
            <Card className="bg-[#5B0202]/10 backdrop-blur-md border-[#8B0000]/20 overflow-hidden">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="p-10">
                  <div className="inline-block px-4 py-1 bg-[#8B0000]/30 rounded-full text-sm mb-4">
                    Durban, KwaZulu-Natal
                  </div>
                  <CardHeader className="p-0 mb-6">
                    <CardTitle className="text-3xl text-[#EDE7C7] mb-3">
                      Coastal Custom Homes: Enhanced Client Experience
                    </CardTitle>
                    <CardDescription className="text-[#EDE7C7]/70 text-lg">
                      Delivering white-glove service at scale with AI-powered communication
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 space-y-4 text-[#EDE7C7]/80">
                    <p className="leading-relaxed">
                      High-net-worth clients expect constant communication and updates. Our Client Communication AI
                      provides personalized updates and instant responses while maintaining the premium experience.
                    </p>
                    <div className="grid grid-cols-2 gap-4 py-6">
                      <div className="text-center p-4 bg-[#8B0000]/20 rounded-xl">
                        <div className="text-3xl font-bold text-[#EDE7C7] mb-1">98%</div>
                        <div className="text-sm text-[#EDE7C7]/70">Client Satisfaction</div>
                      </div>
                      <div className="text-center p-4 bg-[#8B0000]/20 rounded-xl">
                        <div className="text-3xl font-bold text-[#EDE7C7] mb-1">5x</div>
                        <div className="text-sm text-[#EDE7C7]/70">More Referrals</div>
                      </div>
                    </div>
                    <blockquote className="border-l-4 border-[#8B0000] pl-4 italic text-[#EDE7C7]/90">
                      "Our clients love the instant updates and 24/7 support. They feel more connected to their project
                      than ever before, and we're getting more referrals than we can handle."
                    </blockquote>
                    <p className="text-sm text-[#EDE7C7]/60">— David Pillay, Managing Director</p>
                  </CardContent>
                </div>
                <div className="bg-gradient-to-br from-[#8B0000]/20 to-[#5B0202]/10 flex items-center justify-center p-10">
                  <div className="text-center">
                    <div className="text-8xl mb-4">⭐</div>
                    <div className="text-2xl font-bold text-[#EDE7C7]">4.9/5</div>
                    <div className="text-[#EDE7C7]/70">Average Client Rating</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Stats Overview */}
          <div className="bg-[#5B0202]/10 backdrop-blur-md border border-[#8B0000]/20 rounded-3xl p-12 mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center bg-gradient-to-r from-[#EDE7C7] to-[#8B0000] bg-clip-text text-transparent">
              Combined Impact Across All Clients
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-[#EDE7C7] mb-2">R12.8M</div>
                <div className="text-[#EDE7C7]/70">Total Revenue Increase</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#EDE7C7] mb-2">450+</div>
                <div className="text-[#EDE7C7]/70">Hours Saved Monthly</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#EDE7C7] mb-2">96%</div>
                <div className="text-[#EDE7C7]/70">Client Satisfaction</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#EDE7C7] mb-2">4.2x</div>
                <div className="text-[#EDE7C7]/70">Average ROI</div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-[#EDE7C7] to-[#8B0000] bg-clip-text text-transparent">
              Ready to Write Your Success Story?
            </h2>
            <p className="text-xl text-[#EDE7C7]/80 mb-8 max-w-2xl mx-auto">
              Join these leading builders and discover how Zappies AI can transform your business.
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

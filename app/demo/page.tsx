"use client"

import { Navigation } from "@/components/navigation"
import { Background } from "@/components/background"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LeadForm } from "@/components/lead-form"

export default function DemoPage() {
  return (
    <>
      <Background />
      <Navigation />

      <main className="pt-32 pb-20 px-[5%]">
        <div className="max-w-[1200px] mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-block px-5 py-2 bg-[#C41E3A]/20 border border-[#C41E3A] rounded-full text-sm mb-5">
              Schedule Your Demo
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 bg-gradient-to-r from-[#EDE7C7] via-[#C41E3A] to-[#EDE7C7] bg-clip-text text-transparent text-balance">
              See Zappies AI in Action
            </h1>
            <p className="text-xl text-[#EDE7C7]/80 max-w-3xl mx-auto leading-relaxed">
              Book a personalized demo and discover how our AI agents can transform your custom home building business.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Form */}
            <Card className="bg-[#8B1538]/10 backdrop-blur-md border-[#C41E3A]/20">
              <CardHeader>
                <CardTitle className="text-2xl text-[#EDE7C7]">Request Your Demo</CardTitle>
                <CardDescription className="text-[#EDE7C7]/70">
                  Fill out the form below and we'll be in touch within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LeadForm />
              </CardContent>
            </Card>

            {/* Info Section */}
            <div className="space-y-8">
              <Card className="bg-[#8B1538]/10 backdrop-blur-md border-[#C41E3A]/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#EDE7C7]">What to Expect</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-[#EDE7C7]/80">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#C41E3A] to-[#8B1538] rounded-full flex items-center justify-center flex-shrink-0 text-xl">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#EDE7C7] mb-1">Personalized Consultation</h3>
                      <p>We'll discuss your specific business needs and challenges</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#C41E3A] to-[#8B1538] rounded-full flex items-center justify-center flex-shrink-0 text-xl">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#EDE7C7] mb-1">Live Demo</h3>
                      <p>See our AI agents in action with real-world scenarios</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#C41E3A] to-[#8B1538] rounded-full flex items-center justify-center flex-shrink-0 text-xl">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#EDE7C7] mb-1">Custom Recommendations</h3>
                      <p>Get tailored suggestions for your business</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#C41E3A] to-[#8B1538] rounded-full flex items-center justify-center flex-shrink-0 text-xl">
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#EDE7C7] mb-1">ROI Analysis</h3>
                      <p>Understand the potential impact on your bottom line</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#8B1538]/10 backdrop-blur-md border-[#C41E3A]/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#EDE7C7]">Demo Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-[#EDE7C7]/80">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">⏱️</div>
                    <div>
                      <div className="font-semibold text-[#EDE7C7]">Duration</div>
                      <div>45-60 minutes</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">💻</div>
                    <div>
                      <div className="font-semibold text-[#EDE7C7]">Format</div>
                      <div>Virtual meeting (Zoom/Teams)</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🎯</div>
                    <div>
                      <div className="font-semibold text-[#EDE7C7]">Focus</div>
                      <div>Your specific business needs</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">💰</div>
                    <div>
                      <div className="font-semibold text-[#EDE7C7]">Cost</div>
                      <div>Completely free, no obligation</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-[#C41E3A]/20 to-[#8B1538]/10 backdrop-blur-md border-[#C41E3A]/30">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">📞</div>
                  <h3 className="text-xl font-bold text-[#EDE7C7] mb-2">Prefer to Talk Now?</h3>
                  <p className="text-[#EDE7C7]/80 mb-4">Call us directly for immediate assistance</p>
                  <a
                    href="tel:+27123456789"
                    className="text-2xl font-bold text-[#C41E3A] hover:text-[#C41E3A]/80 transition-colors"
                  >
                    +27 12 345 6789
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

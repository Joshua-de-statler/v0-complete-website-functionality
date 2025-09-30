"use client"

import type React from "react"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Background } from "@/components/background"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { createClient } from "@/lib/supabase/client"

export default function DemoPage() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    projectsPerYear: "",
    interest: "",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createClient()

      const { error } = await supabase.from("leads").insert({
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company_name: formData.company,
        message: `Projects Per Year: ${formData.projectsPerYear}\nPrimary Interest: ${formData.interest}\n\n${formData.message}`,
        source: "demo_page",
        status: "new",
      })

      if (error) {
        console.error("[v0] Error submitting lead:", error)
        toast({
          title: "Submission Failed",
          description: "There was an error submitting your request. Please try again.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      toast({
        title: "Demo Request Received!",
        description: "We'll contact you within 24 hours to schedule your personalized demo.",
      })

      setFormData({
        name: "",
        email: "",
        phone: "",
        company: "",
        projectsPerYear: "",
        interest: "",
        message: "",
      })
    } catch (error) {
      console.error("[v0] Unexpected error:", error)
      toast({
        title: "Submission Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <>
      <Background />
      <Navigation />
      <Toaster />

      <main className="pt-32 pb-20 px-[5%]">
        <div className="max-w-[1200px] mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-block px-5 py-2 bg-[#8B0000]/20 border border-[#8B0000] rounded-full text-sm mb-5">
              Schedule Your Demo
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 bg-gradient-to-r from-[#EDE7C7] via-[#8B0000] to-[#EDE7C7] bg-clip-text text-transparent text-balance">
              See Zappies AI in Action
            </h1>
            <p className="text-xl text-[#EDE7C7]/80 max-w-3xl mx-auto leading-relaxed">
              Book a personalized demo and discover how our AI agents can transform your custom home building business.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Form */}
            <Card className="bg-[#5B0202]/10 backdrop-blur-md border-[#8B0000]/20">
              <CardHeader>
                <CardTitle className="text-2xl text-[#EDE7C7]">Request Your Demo</CardTitle>
                <CardDescription className="text-[#EDE7C7]/70">
                  Fill out the form below and we'll be in touch within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-[#EDE7C7]">
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      required
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="bg-[#200E01]/50 border-[#8B0000]/30 text-[#EDE7C7] placeholder:text-[#EDE7C7]/40"
                      placeholder="John Smith"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[#EDE7C7]">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="bg-[#200E01]/50 border-[#8B0000]/30 text-[#EDE7C7] placeholder:text-[#EDE7C7]/40"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-[#EDE7C7]">
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="bg-[#200E01]/50 border-[#8B0000]/30 text-[#EDE7C7] placeholder:text-[#EDE7C7]/40"
                      placeholder="+27 XX XXX XXXX"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-[#EDE7C7]">
                      Company Name *
                    </Label>
                    <Input
                      id="company"
                      required
                      value={formData.company}
                      onChange={(e) => handleChange("company", e.target.value)}
                      className="bg-[#200E01]/50 border-[#8B0000]/30 text-[#EDE7C7] placeholder:text-[#EDE7C7]/40"
                      placeholder="Your Building Company"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="projects" className="text-[#EDE7C7]">
                      Projects Per Year *
                    </Label>
                    <Select
                      value={formData.projectsPerYear}
                      onValueChange={(value) => handleChange("projectsPerYear", value)}
                      required
                    >
                      <SelectTrigger className="bg-[#200E01]/50 border-[#8B0000]/30 text-[#EDE7C7]">
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#200E01] border-[#8B0000]/30">
                        <SelectItem value="1-5" className="text-[#EDE7C7]">
                          1-5 projects
                        </SelectItem>
                        <SelectItem value="6-15" className="text-[#EDE7C7]">
                          6-15 projects
                        </SelectItem>
                        <SelectItem value="16-30" className="text-[#EDE7C7]">
                          16-30 projects
                        </SelectItem>
                        <SelectItem value="30+" className="text-[#EDE7C7]">
                          30+ projects
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="interest" className="text-[#EDE7C7]">
                      Primary Interest *
                    </Label>
                    <Select
                      value={formData.interest}
                      onValueChange={(value) => handleChange("interest", value)}
                      required
                    >
                      <SelectTrigger className="bg-[#200E01]/50 border-[#8B0000]/30 text-[#EDE7C7]">
                        <SelectValue placeholder="Select your main interest" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#200E01] border-[#8B0000]/30">
                        <SelectItem value="lead-qualification" className="text-[#EDE7C7]">
                          Lead Qualification
                        </SelectItem>
                        <SelectItem value="project-management" className="text-[#EDE7C7]">
                          Project Management
                        </SelectItem>
                        <SelectItem value="client-communication" className="text-[#EDE7C7]">
                          Client Communication
                        </SelectItem>
                        <SelectItem value="cost-estimation" className="text-[#EDE7C7]">
                          Cost Estimation
                        </SelectItem>
                        <SelectItem value="all" className="text-[#EDE7C7]">
                          All Solutions
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-[#EDE7C7]">
                      Additional Information
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      className="bg-[#200E01]/50 border-[#8B0000]/30 text-[#EDE7C7] placeholder:text-[#EDE7C7]/40 min-h-[100px]"
                      placeholder="Tell us about your specific needs or challenges..."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-6 text-lg bg-gradient-to-r from-[#8B0000] to-[#5B0202] text-[#EDE7C7] rounded-full font-semibold hover:scale-105 hover:shadow-lg hover:shadow-[#8B0000]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Submitting..." : "Schedule Demo"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Info Section */}
            <div className="space-y-8">
              <Card className="bg-[#5B0202]/10 backdrop-blur-md border-[#8B0000]/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#EDE7C7]">What to Expect</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-[#EDE7C7]/80">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#8B0000] to-[#5B0202] rounded-full flex items-center justify-center flex-shrink-0 text-xl">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#EDE7C7] mb-1">Personalized Consultation</h3>
                      <p>We'll discuss your specific business needs and challenges</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#8B0000] to-[#5B0202] rounded-full flex items-center justify-center flex-shrink-0 text-xl">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#EDE7C7] mb-1">Live Demo</h3>
                      <p>See our AI agents in action with real-world scenarios</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#8B0000] to-[#5B0202] rounded-full flex items-center justify-center flex-shrink-0 text-xl">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#EDE7C7] mb-1">Custom Recommendations</h3>
                      <p>Get tailored suggestions for your business</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#8B0000] to-[#5B0202] rounded-full flex items-center justify-center flex-shrink-0 text-xl">
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#EDE7C7] mb-1">ROI Analysis</h3>
                      <p>Understand the potential impact on your bottom line</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#5B0202]/10 backdrop-blur-md border-[#8B0000]/20">
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

              <Card className="bg-gradient-to-br from-[#8B0000]/20 to-[#5B0202]/10 backdrop-blur-md border-[#8B0000]/30">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">📞</div>
                  <h3 className="text-xl font-bold text-[#EDE7C7] mb-2">Prefer to Talk Now?</h3>
                  <p className="text-[#EDE7C7]/80 mb-4">Call us directly for immediate assistance</p>
                  <a
                    href="tel:+27123456789"
                    className="text-2xl font-bold text-[#8B0000] hover:text-[#8B0000]/80 transition-colors"
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

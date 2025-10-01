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
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    companySize: "",
    currentChallenges: "",
    preferredDate: "",
    preferredTime: "",
    message: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createClient()

      const { error } = await supabase.from("leads").insert({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        company_size: formData.companySize,
        current_challenges: formData.currentChallenges,
        preferred_date: formData.preferredDate,
        preferred_time: formData.preferredTime,
        message: formData.message || null,
      })

      if (error) throw error

      toast({
        title: "Demo Request Received!",
        description: "We'll contact you within 24 hours to schedule your personalized demo.",
      })

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        company: "",
        companySize: "",
        currentChallenges: "",
        preferredDate: "",
        preferredTime: "",
        message: "",
      })
    } catch (error) {
      console.error("[v0] Error submitting lead:", error)
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your request. Please try again.",
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
            <Card className="bg-[#5B0202]/10 backdrop-blur-md border-[#C41E3A]/20">
              <CardHeader>
                <CardTitle className="text-2xl text-[#EDE7C7]">Request Your Demo</CardTitle>
                <CardDescription className="text-[#EDE7C7]/70">
                  Fill out the form below and we'll be in touch within 24 hours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-[#EDE7C7]">
                        First Name *
                      </Label>
                      <Input
                        id="firstName"
                        required
                        value={formData.firstName}
                        onChange={(e) => handleChange("firstName", e.target.value)}
                        className="bg-[#200E01]/50 border-[#C41E3A]/30 text-[#EDE7C7] placeholder:text-[#EDE7C7]/40"
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-[#EDE7C7]">
                        Last Name *
                      </Label>
                      <Input
                        id="lastName"
                        required
                        value={formData.lastName}
                        onChange={(e) => handleChange("lastName", e.target.value)}
                        className="bg-[#200E01]/50 border-[#C41E3A]/30 text-[#EDE7C7] placeholder:text-[#EDE7C7]/40"
                        placeholder="Smith"
                      />
                    </div>
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
                      className="bg-[#200E01]/50 border-[#C41E3A]/30 text-[#EDE7C7] placeholder:text-[#EDE7C7]/40"
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
                      className="bg-[#200E01]/50 border-[#C41E3A]/30 text-[#EDE7C7] placeholder:text-[#EDE7C7]/40"
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
                      className="bg-[#200E01]/50 border-[#C41E3A]/30 text-[#EDE7C7] placeholder:text-[#EDE7C7]/40"
                      placeholder="Your Building Company"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companySize" className="text-[#EDE7C7]">
                      Company Size *
                    </Label>
                    <Select value={formData.companySize} onValueChange={(value) => handleChange("companySize", value)}>
                      <SelectTrigger className="bg-[#200E01]/50 border-[#C41E3A]/30 text-[#EDE7C7]">
                        <SelectValue placeholder="Select company size" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#200E01] border-[#C41E3A]/30">
                        <SelectItem value="1-10" className="text-[#EDE7C7]">
                          1-10 employees
                        </SelectItem>
                        <SelectItem value="11-50" className="text-[#EDE7C7]">
                          11-50 employees
                        </SelectItem>
                        <SelectItem value="51-200" className="text-[#EDE7C7]">
                          51-200 employees
                        </SelectItem>
                        <SelectItem value="200+" className="text-[#EDE7C7]">
                          200+ employees
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currentChallenges" className="text-[#EDE7C7]">
                      Current Challenges *
                    </Label>
                    <Select
                      value={formData.currentChallenges}
                      onValueChange={(value) => handleChange("currentChallenges", value)}
                    >
                      <SelectTrigger className="bg-[#200E01]/50 border-[#C41E3A]/30 text-[#EDE7C7]">
                        <SelectValue placeholder="Select your main challenge" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#200E01] border-[#C41E3A]/30">
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
                          Multiple Challenges
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="preferredDate" className="text-[#EDE7C7]">
                        Preferred Date *
                      </Label>
                      <Input
                        id="preferredDate"
                        type="date"
                        required
                        value={formData.preferredDate}
                        onChange={(e) => handleChange("preferredDate", e.target.value)}
                        className="bg-[#200E01]/50 border-[#C41E3A]/30 text-[#EDE7C7]"
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="preferredTime" className="text-[#EDE7C7]">
                        Preferred Time *
                      </Label>
                      <Select
                        value={formData.preferredTime}
                        onValueChange={(value) => handleChange("preferredTime", value)}
                      >
                        <SelectTrigger className="bg-[#200E01]/50 border-[#C41E3A]/30 text-[#EDE7C7]">
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#200E01] border-[#C41E3A]/30">
                          <SelectItem value="09:00" className="text-[#EDE7C7]">
                            09:00 AM
                          </SelectItem>
                          <SelectItem value="10:00" className="text-[#EDE7C7]">
                            10:00 AM
                          </SelectItem>
                          <SelectItem value="11:00" className="text-[#EDE7C7]">
                            11:00 AM
                          </SelectItem>
                          <SelectItem value="14:00" className="text-[#EDE7C7]">
                            02:00 PM
                          </SelectItem>
                          <SelectItem value="15:00" className="text-[#EDE7C7]">
                            03:00 PM
                          </SelectItem>
                          <SelectItem value="16:00" className="text-[#EDE7C7]">
                            04:00 PM
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-[#EDE7C7]">
                      Additional Information
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      className="bg-[#200E01]/50 border-[#C41E3A]/30 text-[#EDE7C7] placeholder:text-[#EDE7C7]/40 min-h-[100px]"
                      placeholder="Tell us about your specific needs or challenges..."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-6 text-lg bg-gradient-to-r from-[#C41E3A] to-[#5B0202] text-[#EDE7C7] rounded-full font-semibold hover:scale-105 hover:shadow-lg hover:shadow-[#C41E3A]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Submitting..." : "Schedule Demo"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Info Section */}
            <div className="space-y-8">
              <Card className="bg-[#5B0202]/10 backdrop-blur-md border-[#C41E3A]/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#EDE7C7]">What to Expect</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-[#EDE7C7]/80">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#C41E3A] to-[#5B0202] rounded-full flex items-center justify-center flex-shrink-0 text-xl">
                      1
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#EDE7C7] mb-1">Personalized Consultation</h3>
                      <p>We'll discuss your specific business needs and challenges</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#C41E3A] to-[#5B0202] rounded-full flex items-center justify-center flex-shrink-0 text-xl">
                      2
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#EDE7C7] mb-1">Live Demo</h3>
                      <p>See our AI agents in action with real-world scenarios</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#C41E3A] to-[#5B0202] rounded-full flex items-center justify-center flex-shrink-0 text-xl">
                      3
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#EDE7C7] mb-1">Custom Recommendations</h3>
                      <p>Get tailored suggestions for your business</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#C41E3A] to-[#5B0202] rounded-full flex items-center justify-center flex-shrink-0 text-xl">
                      4
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#EDE7C7] mb-1">ROI Analysis</h3>
                      <p>Understand the potential impact on your bottom line</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#5B0202]/10 backdrop-blur-md border-[#C41E3A]/20">
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

              <Card className="bg-gradient-to-br from-[#C41E3A]/20 to-[#5B0202]/10 backdrop-blur-md border-[#C41E3A]/30">
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

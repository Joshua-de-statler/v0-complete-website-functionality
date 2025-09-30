"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function LeadForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    companyName: "",
    phone: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    const supabase = createClient()

    try {
      const { error: insertError } = await supabase.from("leads").insert({
        full_name: formData.fullName,
        email: formData.email,
        company_name: formData.companyName || null,
        phone: formData.phone || null,
        message: formData.message || null,
        source: "website",
        status: "new",
      })

      if (insertError) throw insertError

      setSuccess(true)
      setFormData({
        fullName: "",
        email: "",
        companyName: "",
        phone: "",
        message: "",
      })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="p-8 bg-[#C41E3A]/10 backdrop-blur-md border border-[#C41E3A]/30 rounded-3xl text-center">
        <div className="text-5xl mb-4">✓</div>
        <h3 className="text-2xl font-bold mb-3 text-[#EDE7C7]">Thank You!</h3>
        <p className="text-[#EDE7C7]/80 mb-6">
          We've received your information and will be in touch within 24 hours to discuss how our AI solutions can
          transform your building business.
        </p>
        <Button
          onClick={() => setSuccess(false)}
          className="bg-gradient-to-r from-[#C41E3A] to-[#8B1538] text-[#EDE7C7] hover:scale-105 transition-all"
        >
          Submit Another Request
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-[#EDE7C7]">
            Full Name *
          </Label>
          <Input
            id="fullName"
            type="text"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="bg-[#200E01]/50 border-[#C41E3A]/30 text-[#EDE7C7] focus:border-[#C41E3A]"
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
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="bg-[#200E01]/50 border-[#C41E3A]/30 text-[#EDE7C7] focus:border-[#C41E3A]"
            placeholder="john@company.com"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="companyName" className="text-[#EDE7C7]">
            Company Name
          </Label>
          <Input
            id="companyName"
            type="text"
            value={formData.companyName}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            className="bg-[#200E01]/50 border-[#C41E3A]/30 text-[#EDE7C7] focus:border-[#C41E3A]"
            placeholder="Your Building Company"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-[#EDE7C7]">
            Phone Number
          </Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="bg-[#200E01]/50 border-[#C41E3A]/30 text-[#EDE7C7] focus:border-[#C41E3A]"
            placeholder="+27 XX XXX XXXX"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message" className="text-[#EDE7C7]">
          Tell us about your needs
        </Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="bg-[#200E01]/50 border-[#C41E3A]/30 text-[#EDE7C7] focus:border-[#C41E3A] min-h-32"
          placeholder="What challenges are you facing? How many projects do you manage annually?"
        />
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-6 text-lg bg-gradient-to-r from-[#C41E3A] to-[#8B1538] text-[#EDE7C7] rounded-full font-semibold hover:scale-105 hover:shadow-lg hover:shadow-[#C41E3A]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Submitting..." : "Get Your Custom AI Solution"}
      </Button>
    </form>
  )
}

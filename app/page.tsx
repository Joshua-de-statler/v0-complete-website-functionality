"use client"

import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Background } from "@/components/background"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import Spline from "@splinetool/react-spline/next"

export default function HomePage() {
  const [splineLoaded, setSplineLoaded] = useState(false)

  return (
    <>
      <Background />
      <Navigation />

      {/* Hero Section with Spline */}
      <section className="relative min-h-screen flex items-center justify-center px-[5%]">
        {!splineLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#200E01] z-20">
            <div className="w-16 h-16 border-4 border-[#C41E3A]/20 border-t-[#C41E3A] rounded-full animate-spin" />
            <div className="mt-4 text-[#C41E3A] text-sm font-medium">Loading 3D Experience...</div>
          </div>
        )}

        <div className="absolute inset-0 w-full h-full">
          <Spline
            scene="https://prod.spline.design/ds6liaWfJMl9f7OX/scene.splinecode"
            onLoad={() => {
              console.log("[v0] Spline loaded successfully")
              setSplineLoaded(true)
            }}
            onError={(error) => {
              console.error("[v0] Spline failed to load:", error)
              // Still show content even if Spline fails
              setSplineLoaded(true)
            }}
          />
        </div>

        <div
          className={`relative z-10 max-w-[1400px] mx-auto w-full grid md:grid-cols-2 gap-16 items-center transition-opacity duration-700 ${
            splineLoaded ? "opacity-100" : "opacity-0"
          }`}
        >
          <div>
            <div className="inline-block px-5 py-2 bg-[#C41E3A]/20 border border-[#C41E3A] rounded-full text-sm mb-5">
              🚀 Exclusive AI for Premium Builders
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-5 bg-gradient-to-r from-[#EDE7C7] via-[#C41E3A] to-[#EDE7C7] bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradientShift_3s_linear_infinite] text-balance">
              Custom AI Agents Built Specifically to Scale Your Business
            </h1>
            <p className="text-xl text-[#EDE7C7]/80 mb-10 leading-relaxed">
              Transform your custom home building operations with exclusive AI agents designed for South Africa's most
              prestigious builders. Automate client management, streamline project workflows, and scale intelligently.
            </p>
            <div className="flex flex-col sm:flex-row gap-5">
              <Link href="/demo">
                <Button className="px-7 py-6 text-lg bg-gradient-to-r from-[#C41E3A] to-[#8B1538] text-[#EDE7C7] rounded-full font-semibold hover:scale-105 hover:shadow-lg hover:shadow-[#C41E3A]/30 transition-all">
                  Start Your AI Journey
                </Button>
              </Link>
              <a
                href="#features"
                className="px-7 py-3 bg-transparent text-[#EDE7C7] border-2 border-[#C41E3A] rounded-full text-base font-semibold inline-flex items-center gap-2 hover:bg-[#C41E3A] transition-all"
              >
                Watch Demo
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              </a>
            </div>
          </div>

          <div className="relative h-[400px] md:h-[600px]">
            {/* Placeholder for additional content or second Spline if needed */}
          </div>
        </div>
      </section>
    </>
  )
}

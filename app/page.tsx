"use client"

import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Background } from "@/components/background"
import { Button } from "@/components/ui/button"
import { useLayoutEffect, useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Spline from "@splinetool/react-spline/next"

gsap.registerPlugin(ScrollTrigger)

export default function HomePage() {
  const scrollContainerRef = useRef(null)
  const heroLayer1Ref = useRef(null)
  const heroLayer2Ref = useRef(null)
  const [spline1Loaded, setSpline1Loaded] = useState(false)
  const [spline2Loaded, setSpline2Loaded] = useState(false)

  useLayoutEffect(() => {
    if (!spline1Loaded) return

    const ctx = gsap.context(() => {
      gsap.to(heroLayer1Ref.current, {
        opacity: 0,
        scrollTrigger: {
          trigger: scrollContainerRef.current,
          start: "top top",
          end: "50% top",
          scrub: 1.5,
        },
      })

      gsap.fromTo(
        heroLayer2Ref.current,
        { opacity: 0 },
        {
          opacity: 1,
          scrollTrigger: {
            trigger: scrollContainerRef.current,
            start: "25% top",
            end: "75% top",
            scrub: 1.5,
          },
        },
      )
    }, scrollContainerRef)

    return () => ctx.revert()
  }, [spline1Loaded])

  return (
    <>
      <Background />
      <Navigation />

      <div ref={scrollContainerRef} className="relative h-[200vh]">
        {/* HERO LAYER 1 - Sticky */}
        <div
          ref={heroLayer1Ref}
          className="sticky top-0 h-screen w-full flex flex-col items-center justify-center text-center px-[5%]"
        >
          {!spline1Loaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#200E01]">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-[#C41E3A]/20 border-t-[#C41E3A] rounded-full animate-spin" />
                <div className="mt-4 text-[#C41E3A] text-sm font-medium">Loading 3D Experience...</div>
              </div>
            </div>
          )}
          <div
            className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${
              spline1Loaded ? "opacity-100" : "opacity-0"
            }`}
            style={{ willChange: "transform, opacity" }}
          >
            <Spline
              scene="https://prod.spline.design/ds6liaWfJMl9f7OX/scene.splinecode"
              onLoad={() => {
                console.log("[v0] Spline 1 loaded successfully")
                setSpline1Loaded(true)
              }}
              onError={(error) => {
                console.error("[v0] Spline 1 failed to load:", error)
                setSpline1Loaded(true)
              }}
            />
          </div>
          {spline1Loaded && (
            <>
              <h2 className="relative z-10 text-3xl font-bold text-[#EDE7C7]/80 mt-auto mb-8 animate-pulse">
                The Future of Building is Here
              </h2>
              <p className="relative z-10 text-[#EDE7C7]/50 mb-8">Scroll Down to Begin</p>
            </>
          )}
        </div>

        {/* HERO LAYER 2 */}
        <div ref={heroLayer2Ref} className="absolute top-[100vh] left-0 w-full h-screen opacity-0">
          <section className="h-full flex items-center px-[5%]">
            <div className="max-w-[1400px] mx-auto w-full grid md:grid-cols-2 gap-16 items-center">
              <div className="z-10">
                <div className="inline-block px-5 py-2 bg-[#C41E3A]/20 border border-[#C41E3A] rounded-full text-sm mb-5">
                  🚀 Exclusive AI for Premium Builders
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-5 bg-gradient-to-r from-[#EDE7C7] via-[#C41E3A] to-[#EDE7C7] bg-clip-text text-transparent bg-[length:200%_auto] animate-[gradientShift_3s_linear_infinite] text-balance">
                  Custom AI Agents Built Specifically to Scale Your Business
                </h1>
                <p className="text-xl text-[#EDE7C7]/80 mb-10 leading-relaxed">
                  Transform your custom home building operations with exclusive AI agents designed for South Africa's
                  most prestigious builders. Automate client management, streamline project workflows, and scale
                  intelligently.
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

              <div className="relative h-[600px] rounded-3xl overflow-hidden">
                <div className="w-full h-full relative">
                  {!spline2Loaded && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#200E01]/50 backdrop-blur-sm rounded-3xl z-10">
                      <div className="w-16 h-16 border-4 border-[#C41E3A]/20 border-t-[#C41E3A] rounded-full animate-spin" />
                      <div className="mt-4 text-[#C41E3A] text-sm font-medium">Loading 3D Experience...</div>
                    </div>
                  )}
                  <Spline
                    scene="https://prod.spline.design/another-scene-url/scene.splinecode"
                    onLoad={() => {
                      console.log("[v0] Spline 2 loaded successfully")
                      setSpline2Loaded(true)
                    }}
                    onError={(error) => {
                      console.error("[v0] Spline 2 failed to load:", error)
                      setSpline2Loaded(true)
                    }}
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}

"use client"

import Link from "next/link"
import { Navigation } from "@/components/navigation"
import { Background } from "@/components/background"
import { Button } from "@/components/ui/button"
import { useLayoutEffect, useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export default function HomePage() {
  const scrollContainerRef = useRef(null)
  const heroLayer1Ref = useRef(null)
  const heroLayer2Ref = useRef(null)
  const [splineLoaded, setSplineLoaded] = useState(false)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(heroLayer1Ref.current, {
        opacity: 0,
        scrollTrigger: {
          trigger: scrollContainerRef.current,
          start: "top top",
          end: "50% top",
          scrub: true,
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
            scrub: true,
          },
        },
      )
    }, scrollContainerRef)

    return () => ctx.revert()
  }, [])

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
          {!splineLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#200E01]">
              <div className="text-[#C41E3A] text-xl animate-pulse">Loading 3D Experience...</div>
            </div>
          )}
          <iframe
            src="https://my.spline.design/nexbotrobotcharacterconcept-LYbugm6qWDDZhv0Nz4m00WPm/"
            className="absolute inset-0 w-full h-full border-none gpu-accelerated"
            title="3D Robot Intro"
            loading="eager"
            onLoad={() => setSplineLoaded(true)}
          />
          <h2 className="relative z-10 text-3xl font-bold text-[#EDE7C7]/80 mt-auto mb-8 animate-pulse">
            The Future of Building is Here
          </h2>
          <p className="relative z-10 text-[#EDE7C7]/50 mb-8">Scroll Down to Begin</p>
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
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  </a>
                </div>
              </div>

              <div className="relative h-[600px] rounded-3xl overflow-hidden">
                <div className="w-full h-full relative">
                  <iframe
                    src="https://my.spline.design/nexbotrobotcharacterconcept-HiSgMTTXijvS9MMAxqNvexb4/"
                    className="w-full h-full border-none gpu-accelerated"
                    title="3D Robot"
                    loading="lazy"
                  />
                </div>
                <div
                  className="absolute top-[20%] -left-12 px-5 py-4 bg-[#C41E3A]/10 backdrop-blur-md border border-[#C41E3A]/30 rounded-2xl gpu-accelerated"
                  style={{ animation: "float 6s infinite ease-in-out" }}
                >
                  <div className="text-sm font-semibold">24/7 AI Support</div>
                </div>
                <div
                  className="absolute bottom-[30%] -right-12 px-5 py-4 bg-[#C41E3A]/10 backdrop-blur-md border border-[#C41E3A]/30 rounded-2xl gpu-accelerated"
                  style={{ animation: "float 6s infinite ease-in-out 2s" }}
                >
                  <div className="text-sm font-semibold">Smart Automation</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="relative z-10 bg-[#200E01]">
        {/* Features Section */}
        <section id="features" className="py-32 px-[5%] bg-gradient-to-b from-[#200E01] to-[#1a0a01]">
          <div className="max-w-[1400px] mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-6xl font-extrabold mb-5 bg-gradient-to-r from-[#EDE7C7] to-[#C41E3A] bg-clip-text text-transparent">
                Engineered for Excellence
              </h2>
              <p className="text-xl text-[#EDE7C7]/70 max-w-2xl mx-auto">
                Purpose-built AI solutions tailored to the unique needs of South Africa's custom home builders
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              <div className="p-10 bg-[#8B1538]/10 backdrop-blur-md border border-[#C41E3A]/20 rounded-3xl transition-all hover:-translate-y-3 hover:border-[#C41E3A] relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#C41E3A] to-transparent opacity-0 group-hover:opacity-10 transition-opacity" />
                <div className="w-16 h-16 bg-gradient-to-br from-[#C41E3A] to-[#8B1538] rounded-2xl flex items-center justify-center text-2xl mb-5">
                  🏗️
                </div>
                <h3 className="text-2xl font-bold mb-4">Project Intelligence</h3>
                <p className="text-[#EDE7C7]/80 leading-relaxed">
                  AI-powered project management that tracks timelines, budgets, and resources in real-time. Predict
                  delays before they happen and optimize workflows automatically.
                </p>
              </div>

              <div className="p-10 bg-[#8B1538]/10 backdrop-blur-md border border-[#C41E3A]/20 rounded-3xl transition-all hover:-translate-y-3 hover:border-[#C41E3A] relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#C41E3A] to-transparent opacity-0 group-hover:opacity-10 transition-opacity" />
                <div className="w-16 h-16 bg-gradient-to-br from-[#C41E3A] to-[#8B1538] rounded-2xl flex items-center justify-center text-2xl mb-5">
                  🤝
                </div>
                <h3 className="text-2xl font-bold mb-4">Client Experience AI</h3>
                <p className="text-[#EDE7C7]/80 leading-relaxed">
                  Deliver exceptional client experiences with AI that handles inquiries, provides updates, and maintains
                  personalized communication at scale.
                </p>
              </div>

              <div className="p-10 bg-[#8B1538]/10 backdrop-blur-md border border-[#C41E3A]/20 rounded-3xl transition-all hover:-translate-y-3 hover:border-[#C41E3A] relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#C41E3A] to-transparent opacity-0 group-hover:opacity-10 transition-opacity" />
                <div className="w-16 h-16 bg-gradient-to-br from-[#C41E3A] to-[#8B1538] rounded-2xl flex items-center justify-center text-2xl mb-5">
                  📊
                </div>
                <h3 className="text-2xl font-bold mb-4">Market Intelligence</h3>
                <p className="text-[#EDE7C7]/80 leading-relaxed">
                  Stay ahead with AI-driven insights on market trends, material costs, and competitive positioning
                  specific to the South African luxury home market.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 px-[5%] bg-[#C41E3A]/5 border-y border-[#C41E3A]/20">
          <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
            <div>
              <div className="text-5xl font-extrabold bg-gradient-to-r from-[#C41E3A] to-[#EDE7C7] bg-clip-text text-transparent mb-3">
                87%
              </div>
              <div className="text-lg text-[#EDE7C7]/80">Time Saved on Admin</div>
            </div>
            <div>
              <div className="text-5xl font-extrabold bg-gradient-to-r from-[#C41E3A] to-[#EDE7C7] bg-clip-text text-transparent mb-3">
                3.5x
              </div>
              <div className="text-lg text-[#EDE7C7]/80">Faster Client Response</div>
            </div>
            <div>
              <div className="text-5xl font-extrabold bg-gradient-to-r from-[#C41E3A] to-[#EDE7C7] bg-clip-text text-transparent mb-3">
                R2.4M
              </div>
              <div className="text-lg text-[#EDE7C7]/80">Average Cost Saved</div>
            </div>
            <div>
              <div className="text-5xl font-extrabold bg-gradient-to-r from-[#C41E3A] to-[#EDE7C7] bg-clip-text text-transparent mb-3">
                24/7
              </div>
              <div className="text-lg text-[#EDE7C7]/80">AI Availability</div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 px-[5%] text-center bg-[radial-gradient(circle_at_center,rgba(196,30,58,0.1)_0%,transparent_70%)]">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-5 bg-gradient-to-r from-[#EDE7C7] to-[#C41E3A] bg-clip-text text-transparent">
              Ready to Transform Your Building Business?
            </h2>
            <p className="text-xl text-[#EDE7C7]/80 mb-10">
              Join South Africa's leading custom home builders who are already leveraging AI to scale smarter, build
              faster, and deliver exceptional results.
            </p>
            <Link href="/demo">
              <Button className="px-10 py-6 text-lg bg-gradient-to-r from-[#C41E3A] to-[#8B1538] text-[#EDE7C7] rounded-full font-semibold hover:scale-105 hover:shadow-lg hover:shadow-[#C41E3A]/30 transition-all">
                Schedule Your Exclusive Demo
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}

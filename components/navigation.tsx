"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

export function Navigation() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? "py-3 bg-[#200E01]/95 backdrop-blur-md" : "py-5 bg-[#200E01]/80 backdrop-blur-md"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-[5%] flex items-center justify-between">
        <Link
          href="/"
          className="text-2xl font-extrabold bg-gradient-to-r from-[#EDE7C7] to-[#8B0000] bg-clip-text text-transparent cursor-pointer"
        >
          Zappies AI
        </Link>

        <div className="hidden md:flex items-center gap-10">
          <Link
            href="/solutions"
            className={`text-[#EDE7C7] text-base font-medium relative transition-colors hover:text-[#EDE7C7]/80 after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-[2px] after:bg-[#8B0000] after:transition-all hover:after:w-full ${
              pathname === "/solutions" ? "after:w-full" : ""
            }`}
          >
            Solutions
          </Link>
          <Link
            href="/#features"
            className="text-[#EDE7C7] text-base font-medium relative transition-colors hover:text-[#EDE7C7]/80 after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-[2px] after:bg-[#8B0000] after:transition-all hover:after:w-full"
          >
            Features
          </Link>
          <Link
            href="/case-studies"
            className={`text-[#EDE7C7] text-base font-medium relative transition-colors hover:text-[#EDE7C7]/80 after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-[2px] after:bg-[#8B0000] after:transition-all hover:after:w-full ${
              pathname === "/case-studies" ? "after:w-full" : ""
            }`}
          >
            Case Studies
          </Link>
          <Link
            href="/pricing"
            className={`text-[#EDE7C7] text-base font-medium relative transition-colors hover:text-[#EDE7C7]/80 after:absolute after:bottom-[-5px] after:left-0 after:w-0 after:h-[2px] after:bg-[#8B0000] after:transition-all hover:after:w-full ${
              pathname === "/pricing" ? "after:w-full" : ""
            }`}
          >
            Pricing
          </Link>
          <Link href="/demo">
            <Button className="px-7 py-3 bg-gradient-to-r from-[#8B0000] to-[#5B0202] text-[#EDE7C7] rounded-full font-semibold hover:scale-105 hover:shadow-lg hover:shadow-[#8B0000]/30 transition-all">
              Book Demo
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}

"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import PageTransition from "./PageTransition"
import { useScrollAnimation } from "../hooks/useScrollAnimation"

interface MainLayoutProps {
  children: React.ReactNode;
  cartCount?: number;
  wishlistCount?: number;
}

export default function MainLayout({ children, cartCount = 0, wishlistCount = 0 }: MainLayoutProps) {
  const { scrollProgress, showScrollTop, scrollToTop } = useScrollAnimation()
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false)

  const handleNewsletterSignup = (e: React.FormEvent) => {
    e.preventDefault()
    // Add newsletter signup logic here
    setIsNewsletterOpen(false)
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-white relative">
        {children}

        {/* Scroll to top button */}
        <button 
          onClick={scrollToTop}
          className={`fixed bottom-8 right-8 bg-black text-white p-3 rounded-full shadow-lg transition-all duration-300 ${
            showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      </div>
    </PageTransition>
  )
} 
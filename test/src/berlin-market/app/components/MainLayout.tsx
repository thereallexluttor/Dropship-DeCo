"use client"

import { useState } from "react"
import PageTransition from "./PageTransition"
import WhatsAppButton from "./WhatsAppButton"
import PromotionalBanner from "./PromotionalBanner"
interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false)

  const handleNewsletterSignup = (e: React.FormEvent) => {
    e.preventDefault()
    // Add newsletter signup logic here
    setIsNewsletterOpen(false)
  }

  return (
    <PageTransition>
      <div className="bg-white relative flex flex-col" style={{ minHeight: '100vh', marginBottom: 0, paddingBottom: 0, height: 'auto' }}>
        {/* Promotional Banner - Aparece en todas las páginas */}
        <PromotionalBanner />
        
        {children}

        {/* WhatsApp floating button */}
        <WhatsAppButton />
      </div>
    </PageTransition>
  )
} 
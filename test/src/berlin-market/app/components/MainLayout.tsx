"use client"

import { useState } from "react"
import PageTransition from "./PageTransition"
import WhatsAppButton from "./WhatsAppButton"
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
      <div className="min-h-screen bg-white relative">
        {children}

        {/* WhatsApp floating button */}
        <WhatsAppButton />
      </div>
    </PageTransition>
  )
} 
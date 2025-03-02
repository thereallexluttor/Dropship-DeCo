"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { ShoppingBag, Search, Menu, X, Heart } from "lucide-react"
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
      <div className="min-h-screen bg-white">
        <header className="fixed w-full bg-white z-50 transition-all duration-500 ease-in-out hover:bg-black group border-b border-gray-200">
          {/* Progress bar */}
          <div 
            className="absolute bottom-0 left-0 h-0.5 bg-gold transition-all duration-300" 
            style={{
              width: `${scrollProgress}%`
            }} 
          />
          
          {/* Enhanced cart/wishlist indicators */}
          <div className="flex items-center space-x-4">
            <button className="relative group/wishlist">
              <Heart className="h-6 w-6 text-black transition-colors duration-300 ease-in-out group-hover:text-white" />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover/wishlist:opacity-100 transition-opacity duration-300">
                Wishlist
              </span>
            </button>
            
            <button className="relative group/cart">
              <ShoppingBag className="h-6 w-6 text-black transition-colors duration-300 ease-in-out group-hover:text-white" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gold text-white text-xs rounded-full h-4 w-4 flex items-center justify-center animate-bounce">
                  {cartCount}
                </span>
              )}
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs py-1 px-2 rounded opacity-0 group-hover/cart:opacity-100 transition-opacity duration-300">
                Cart
              </span>
            </button>
          </div>
        </header>

        {children}

        {/* Enhanced footer with animations */}
        <footer className="bg-black text-white py-12 mt-16 border-t border-gold/20">
          {/* Newsletter signup */}
          <div className="max-w-md mx-auto px-4 mb-12">
            <h3 className="text-xl font-bold mb-4 text-center">Únete a Nuestra Newsletter</h3>
            <form onSubmit={handleNewsletterSignup} className="flex gap-2">
              <input
                type="email"
                placeholder="Tu email"
                className="flex-1 px-4 py-2 rounded-sm bg-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold transition-all duration-300"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-gold text-white rounded-sm hover:bg-gold/80 transition-all duration-300"
              >
                Suscribirse
              </button>
            </form>
          </div>
        </footer>
        
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
import { ReactNode } from 'react'
import Image from "next/image"
import Link from "next/link"
import { ShoppingBag, Search, Menu, X, Eye } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import PageTransition from "../components/PageTransition"
import FadeInOnScroll from '../components/FadeInOnScroll'
import MainLayout from "../components/MainLayout"

interface CategoryPageProps {
  title: string;
  subtitle: string;
  description: string;
  heroImage: string;
  features?: {
    title: string;
    description: string;
    icon: string;
  }[];
  children: ReactNode;
}

export default function CategoryPage({
  title,
  subtitle,
  description,
  heroImage,
  features,
  children
}: CategoryPageProps) {
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const categories = [
    {
      name: "COLECCIONES",
      items: [
        { name: "Anillos", href: "/anillos" },
        { name: "Collares", href: "/collares" },
        { name: "Pulseras", href: "/pulseras" },
        { name: "Pendientes", href: "/pendientes" }
      ],
    },
    {
      name: "OCASIONES",
      items: [
        { name: "Bodas", href: "/bodas" },
        { name: "Compromiso", href: "/compromiso" },
        { name: "Regalos", href: "/regalos" },
        { name: "Edición Limitada", href: "/edicion-limitada"}
      ],
    },
    {
      name: "MATERIALES",
      items: [
        { name: "Oro 18k", href: "/oro-18k" },
        { name: "Platino", href: "/platino" },
        { name: "Diamantes", href: "/diamantes" },
        { name: "Piedras Preciosas", href: "/piedras-preciosas" }
      ],
    },
    {
      name: "SERVICIOS",
      items: [
        { name: "Personalización", href: "/personalizacion" },
        { name: "Grabado", href: "/grabado" },
        { name: "Mantenimiento", href: "/mantenimiento" },
        { name: "Tasación", href: "/tasacion" }
      ],
    },
  ]

  const handleMouseEnter = (index: number) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setActiveDropdown(index)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null)
    }, 200)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <MainLayout>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className={`
          fixed w-full bg-white z-50 
          transition-all duration-300 ease-in-out
          ${isScrolled ? 'shadow-lg' : ''}
          hover:bg-black group border-b border-gray-200
        `}>
          {/* Mobile Search Bar */}
          <div className={`
            md:hidden
            ${isMobileSearchOpen ? 'block' : 'hidden'}
            absolute top-0 left-0 right-0 bg-white z-20 px-4 py-3
            shadow-lg
          `}>
            <form className="flex items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="
                  flex-1 h-10 px-4 rounded-full
                  bg-gray-100 text-black placeholder-gray-500
                  focus:outline-none focus:ring-2 focus:ring-[#C6A55C]
                  text-sm
                "
                autoFocus
              />
              <button
                type="button"
                onClick={() => {
                  setIsMobileSearchOpen(false)
                  setSearchQuery("")
                }}
                className="p-2"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </form>
          </div>

          <div className="container mx-auto px-4 py-2 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 text-2xl font-sans text-black transition-colors duration-300 ease-in-out group-hover:text-white"
            >
              <img 
                src="/DEU_Berlin_COA.svg.png" 
                alt="Berlin Jewelry Logo" 
                className="h-11 w-auto transition-all duration-300 ease-in-out group-hover:[filter:brightness(0)_invert(1)]" 
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6">
              {categories.map((category, index) => (
                <div
                  key={index}
                  className="relative group/item"
                  onMouseEnter={() => handleMouseEnter(index)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link 
                    href="#"
                    className="text-black text-sm font-bold transition-colors duration-300 ease-in-out group-hover:text-white"
                  >
                    {category.name}
                  </Link>
                  <div
                    className={`
                      absolute left-0 mt-2 w-48 rounded-md shadow-lg 
                      bg-white ring-1 ring-black ring-opacity-5 
                      transition-all duration-300 ease-in-out
                      transform origin-top
                      ${activeDropdown === index 
                        ? "opacity-100 scale-100 translate-y-0 visible" 
                        : "opacity-0 scale-95 -translate-y-2 invisible"}
                    `}
                  >
                    <div className="py-1" role="menu" aria-orientation="vertical">
                      {category.items.map((item, itemIndex) => (
                        <Link
                          key={itemIndex}
                          href={item.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
                          role="menuitem"
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </nav>

            {/* Right side icons */}
            <div className="flex items-center space-x-4">
              {/* Desktop Search */}
              <div className="relative hidden md:block">
                <form className="flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar productos..."
                    className={`
                      ${isSearchOpen ? 'w-48 md:w-64 px-4 opacity-100' : 'w-0 opacity-0'}
                      transition-all duration-300 ease-in-out
                      h-9 rounded-full
                      bg-gray-100 group-hover:bg-gray-800
                      text-black group-hover:text-white
                      placeholder-gray-500 group-hover:placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-[#C6A55C]
                      text-sm
                    `}
                  />
                  {isSearchOpen ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsSearchOpen(false)
                        setSearchQuery("")
                      }}
                      className="absolute right-2 text-gray-500 hover:text-gray-700 group-hover:text-gray-400"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsSearchOpen(true)}
                      className="text-black transition-colors duration-300 ease-in-out group-hover:text-white"
                    >
                      <Search className="h-6 w-6" />
                    </button>
                  )}
                </form>
              </div>

              {/* Mobile Search Icon */}
              <button
                type="button"
                onClick={() => setIsMobileSearchOpen(true)}
                className="md:hidden text-black transition-colors duration-300 ease-in-out group-hover:text-white"
              >
                <Search className="h-6 w-6" />
              </button>

              <ShoppingBag className="h-6 w-6 text-black transition-colors duration-300 ease-in-out group-hover:text-white cursor-pointer" />
              <Menu 
                className="h-6 w-6 text-black transition-colors duration-300 ease-in-out group-hover:text-white cursor-pointer md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              />
            </div>
          </div>

          {/* Mobile Menu */}
          <div className={`
            md:hidden
            ${isMobileMenuOpen ? 'block' : 'hidden'}
            absolute top-full left-0 right-0
            bg-white shadow-lg z-10
          `}>
            <div className="divide-y divide-gray-100">
              {categories.map((category, index) => (
                <div key={index} className="px-4">
                  <button 
                    className="
                      flex justify-between items-center w-full py-4
                      text-black text-sm font-bold
                      transition-colors duration-200
                      hover:text-[#C6A55C]
                    "
                    onClick={() => setActiveDropdown(activeDropdown === index ? null : index)}
                  >
                    {category.name}
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${
                        activeDropdown === index ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div 
                    className={`
                      overflow-hidden transition-all duration-300 ease-in-out
                      ${activeDropdown === index ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}
                    `}
                  >
                    {category.items.map((item, itemIndex) => (
                      <Link
                        key={itemIndex}
                        href={item.href}
                        className="block py-2 pl-4 text-sm text-gray-600 hover:text-[#C6A55C] transition-colors duration-200"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </header>

        <main className="pt-20">
          {/* Hero Section */}
          <section className="relative w-full">
            <div className="relative aspect-[21/9] w-full">
              <Image
                src={heroImage}
                alt={title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent">
                <div className="h-full w-full flex items-center">
                  <div className="container mx-auto px-4">
                    <div className="max-w-3xl">
                      <h1 className="text-4xl md:text-6xl text-white font-light mb-4">
                        {title}
                        <span className="block text-[#C6A55C] font-medium mt-2">{subtitle}</span>
                      </h1>
                      <p className="text-white/90 text-lg md:text-xl font-light max-w-2xl">
                        {description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          {features && (
            <section className="py-16 bg-gradient-to-b from-white to-gray-50">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {features.map((feature, index) => (
                    <FadeInOnScroll key={index} delay={index * 100}>
                      <div className="group text-center p-6 rounded-lg hover:bg-white hover:shadow-xl transition-all duration-300">
                        <div className="w-16 h-16 mx-auto mb-4">
                          <img 
                            src={feature.icon} 
                            alt={feature.title}
                            className="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                          />
                        </div>
                        <h3 className="text-xl font-medium mb-3">{feature.title}</h3>
                        <p className="text-gray-600">{feature.description}</p>
                      </div>
                    </FadeInOnScroll>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Main Content */}
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-black text-white py-16 mt-16 border-t border-[#C6A55C]/20">
          {/* Footer content - Same as in other pages */}
        </footer>
      </div>
    </MainLayout>
  )
} 
"use client"

import Image from "next/image"
import Link from "next/link"
import { ShoppingBag, Search, Menu, X } from "lucide-react"
import { useState, useRef, useEffect } from "react"

export default function AnillosPage() {
  // Reuse the same state and handlers from main page
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)

  const categories = [
    {
      name: "COLECCIONES",
      items: [
        { name: "Ver todo", href: "#" },
        { name: "Anillos", href: "/anillos" },
        { name: "Collares", href: "#" },
        { name: "Pulseras", href: "#" },
        { name: "Pendientes", href: "#" }
      ],
    },
    {
      name: "OCASIONES",
      items: [
        { name: "Bodas", href: "#" },
        { name: "Compromiso", href: "#" },
        { name: "Regalos", href: "#" },
        { name: "Edición Limitada", href: "#" }
      ],
    },
    {
      name: "MATERIALES",
      items: [
        { name: "Oro 18k", href: "#" },
        { name: "Platino", href: "#" },
        { name: "Diamantes", href: "#" },
        { name: "Piedras Preciosas", href: "#" }
      ],
    },
    {
      name: "SERVICIOS",
      items: [
        { name: "Personalización", href: "#" },
        { name: "Grabado", href: "#" },
        { name: "Mantenimiento", href: "#" },
        { name: "Tasación", href: "#" }
      ],
    },
  ]

  // Reuse the same handlers from main page
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Searching for:", searchQuery)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed w-full bg-white z-50 transition-colors duration-300 ease-in-out hover:bg-black group border-b border-gray-200">
        {/* Mobile Search Bar - Full Width when open */}
        <div className={`
          md:hidden
          ${isMobileSearchOpen ? 'block' : 'hidden'}
          absolute top-0 left-0 right-0 bg-white z-20 px-4 py-3
          shadow-lg
        `}>
          <form onSubmit={handleSearch} className="flex items-center gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="
                flex-1
                h-10
                px-4
                rounded-full
                bg-gray-100
                text-black
                placeholder-gray-500
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
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
            Berlin Jewels
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
                  className={`absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 transition-all duration-300 ease-in-out ${
                    activeDropdown === index
                      ? "opacity-100 translate-y-0 visible"
                      : "opacity-0 -translate-y-2 invisible"
                  }`}
                >
                  <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
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
              <form onSubmit={handleSearch} className="flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className={`
                    ${isSearchOpen ? 'w-48 md:w-64 px-4 opacity-100' : 'w-0 opacity-0'}
                    transition-all duration-300 ease-in-out
                    h-9 rounded-full
                    bg-gray-100 group-hover:bg-gray-800
                    text-black group-hover:text-white
                    placeholder-gray-500 group-hover:placeholder-gray-400
                    focus:outline-none focus:ring-2 focus:ring-blue-500
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
          bg-white
          shadow-lg
          z-10
        `}>
          <div className="divide-y divide-gray-100">
            {categories.map((category, index) => (
              <div key={index} className="px-4">
                <button 
                  className="
                    flex justify-between items-center
                    w-full py-4
                    text-black text-sm font-bold
                    transition-colors duration-200
                    hover:text-blue-600
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
                    ${activeDropdown === index ? 'max-h-64 pb-4' : 'max-h-0'}
                  `}
                >
                  {category.items.map((item, itemIndex) => (
                    <Link
                      key={itemIndex}
                      href={item.href}
                      className="block py-2 pl-4 text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200"
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

      <main className="pt-24">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-sans text-black mb-8 text-center">Anillos</h1>
          
          {/* Filters Section */}
          <div className="mb-8 flex flex-wrap gap-4 justify-center">
            <button className="px-4 py-2 border border-black/20 rounded-full text-sm hover:bg-black hover:text-white transition-all">
              Todos los Anillos
            </button>
            <button className="px-4 py-2 border border-black/20 rounded-full text-sm hover:bg-black hover:text-white transition-all">
              Compromiso
            </button>
            <button className="px-4 py-2 border border-black/20 rounded-full text-sm hover:bg-black hover:text-white transition-all">
              Bodas
            </button>
            <button className="px-4 py-2 border border-black/20 rounded-full text-sm hover:bg-black hover:text-white transition-all">
              Diamantes
            </button>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {[1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12].map((item) => (
              <div key={item} className="bg-white group flex flex-col h-full border border-gray-200 hover:border-black/20 transition-all duration-500 rounded-lg overflow-hidden">
                <div className="relative aspect-square">
                  {/* Wishlist Button */}
                  <button className="absolute top-3 right-3 z-[5] bg-white/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <svg 
                      className="w-5 h-5 text-black transition-colors" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={1.5} 
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                      />
                    </svg>
                  </button>
                  
                  {/* Product Image */}
                  <div className="relative aspect-square group-hover:scale-105 transition-transform duration-700">
                    <Image
                      src={`/placeholder.svg`}
                      alt={`Anillo ${item}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4 flex flex-col items-center text-center">
                  <p className="text-xs tracking-wider text-gray-500 font-light mb-1 font-sans">ANILLOS</p>
                  <h3 className="text-sm font-medium text-black mb-2 font-sans">Anillo Diamante Solitario</h3>
                  <p className="text-sm font-light text-black mb-4">2.999 €</p>
                  
                  <Link
                    href="#"
                    className="inline-block text-xs tracking-wider py-2 px-6 text-black border-b border-black/40 hover:border-black transition-all duration-300 font-sans"
                  >
                    Ver Detalles
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Reuse the same footer from main page */}
      <footer className="bg-black text-white py-12 mt-16 border-t border-gold/20">
        {/* ... Footer content ... */}
      </footer>
    </div>
  )
} 
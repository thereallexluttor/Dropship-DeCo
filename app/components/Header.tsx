import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, Search, Menu } from 'lucide-react'
import MobileMenu from './MobileMenu'
import { motion, AnimatePresence } from 'framer-motion'

interface Category {
  name: string
  description: string
  featured: { name: string; href: string }
  items: {
    name: string
    href: string
    description: string
    image: string
  }[]
}

interface HeaderProps {
  categories: Category[]
}

export default function Header({ categories }: HeaderProps) {
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isScrolled, setIsScrolled] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle dropdown hover
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

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search functionality
    console.log("Searching for:", searchQuery)
  }

  return (
    <header 
      className={`
        fixed w-full bg-white z-50 
        transition-all duration-300 ease-in-out
        ${isScrolled ? 'shadow-lg' : ''}
        hover:bg-black group border-b border-gray-200
      `}
      role="banner"
    >
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-2xl font-sans text-black transition-colors duration-300 ease-in-out group-hover:text-white"
            aria-label="Berlin Jewelry - Página principal"
          >
            <Image 
              src="/DEU_Berlin_COA.svg.png" 
              alt=""
              width={44}
              height={44}
              className="h-11 w-auto transition-all duration-300 ease-in-out group-hover:[filter:brightness(0)_invert(1)]" 
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6" role="navigation">
            {categories.map((category, index) => (
              <div
                key={index}
                className="relative group/item"
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
              >
                <button 
                  className="text-black text-sm font-bold transition-colors duration-300 ease-in-out group-hover:text-white"
                  aria-expanded={activeDropdown === index}
                  aria-controls={`desktop-dropdown-${index}`}
                >
                  {category.name}
                </button>
                <AnimatePresence>
                  {activeDropdown === index && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-0 mt-2 w-[480px] rounded-lg shadow-2xl bg-white ring-1 ring-black ring-opacity-5"
                      id={`desktop-dropdown-${index}`}
                      role="menu"
                    >
                      <div className="p-6">
                        <div className="mb-4">
                          <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                          <p className="text-sm text-gray-500">{category.description}</p>
                        </div>
                        
                        {category.featured && (
                          <Link
                            href={category.featured.href}
                            className="block mb-6 p-4 bg-gradient-to-r from-[#C6A55C]/10 to-transparent rounded-lg hover:from-[#C6A55C]/20 transition-all duration-300"
                            role="menuitem"
                          >
                            <span className="text-xs font-medium text-[#C6A55C] uppercase tracking-wide">Destacado</span>
                            <p className="text-sm font-medium text-gray-900 mt-1">{category.featured.name}</p>
                          </Link>
                        )}

                        <div className="grid grid-cols-2 gap-6">
                          {category.items.map((item, itemIndex) => (
                            <Link
                              key={itemIndex}
                              href={item.href}
                              className="group flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                              role="menuitem"
                            >
                              <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-[#C6A55C]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <Image
                                  src={item.image}
                                  alt=""
                                  width={48}
                                  height={48}
                                  className="object-cover transition-all duration-300 group-hover:scale-105"
                                />
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 group-hover:text-[#C6A55C] transition-colors duration-200">
                                  {item.name}
                                </h4>
                                <p className="text-xs text-gray-500">{item.description}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Desktop Search */}
            <div className="relative hidden md:block">
              <form onSubmit={handleSearch} className="flex items-center">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar joyas..."
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
                  aria-label="Buscar productos"
                />
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="text-black transition-colors duration-300 ease-in-out group-hover:text-white"
                  aria-label={isSearchOpen ? "Cerrar búsqueda" : "Abrir búsqueda"}
                >
                  <Search className="h-6 w-6" />
                </button>
              </form>
            </div>

            {/* Cart */}
            <Link
              href="/carrito"
              className="relative group"
              aria-label="Ver carrito"
            >
              <ShoppingBag className="h-6 w-6 text-black transition-colors duration-300 ease-in-out group-hover:text-white cursor-pointer" />
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#C6A55C] text-white text-xs flex items-center justify-center">
                0
              </span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden"
              aria-label="Abrir menú"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <Menu className="h-6 w-6 text-black transition-colors duration-300 ease-in-out group-hover:text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        categories={categories}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
    </header>
  )
} 
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, Search, ShoppingBag } from 'lucide-react'
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

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  categories: Category[]
  searchQuery: string
  onSearchChange: (query: string) => void
}

export default function MobileMenu({
  isOpen,
  onClose,
  categories,
  searchQuery,
  onSearchChange
}: MobileMenuProps) {
  const [expandedCategory, setExpandedCategory] = useState<number | null>(null)
  const [searchVisible, setSearchVisible] = useState(true)

  // Close expanded category when menu closes
  useEffect(() => {
    if (!isOpen) {
      setExpandedCategory(null)
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    if (isOpen) {
      window.addEventListener('keydown', handleEscape)
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      window.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  const handleCategoryClick = useCallback((index: number) => {
    setExpandedCategory(prev => prev === index ? null : index)
  }, [])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-[90%] max-w-md bg-white shadow-xl z-50"
            role="dialog"
            aria-modal="true"
            aria-label="Menú móvil"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <Link 
                href="/" 
                className="flex items-center gap-2" 
                onClick={onClose}
                aria-label="Ir a la página principal"
              >
                <Image
                  src="/DEU_Berlin_COA.svg.png"
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-auto"
                />
              </Link>
              <button 
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                onClick={onClose}
                aria-label="Cerrar menú"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Search Bar */}
            <div 
              className={`
                p-4 border-b
                transition-all duration-300
                ${searchVisible ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}
              `}
            >
              <div className="relative">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Buscar joyas..."
                  className="
                    w-full h-10 pl-10 pr-4
                    bg-gray-100 rounded-lg
                    text-sm text-gray-900
                    placeholder-gray-500
                    focus:outline-none focus:ring-2 focus:ring-[#C6A55C]
                    transition-shadow duration-200
                  "
                  aria-label="Buscar productos"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Categories */}
            <div className="overflow-y-auto h-[calc(100%-8rem)]">
              {categories.map((category, index) => (
                <div key={index} className="border-b border-gray-100">
                  <button 
                    className="
                      flex justify-between items-center w-full p-4
                      text-left text-gray-900 
                      hover:bg-gray-50 transition-colors duration-200
                    "
                    onClick={() => handleCategoryClick(index)}
                    aria-expanded={expandedCategory === index}
                    aria-controls={`category-content-${index}`}
                  >
                    <div>
                      <span className="text-sm font-medium">{category.name}</span>
                      <p className="text-xs text-gray-500 mt-0.5">{category.description}</p>
                    </div>
                    <motion.svg
                      animate={{ rotate: expandedCategory === index ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </button>

                  <motion.div 
                    initial={false}
                    animate={{
                      height: expandedCategory === index ? 'auto' : 0,
                      opacity: expandedCategory === index ? 1 : 0
                    }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                    id={`category-content-${index}`}
                  >
                    {/* Featured item */}
                    {category.featured && (
                      <Link
                        href={category.featured.href}
                        className="block mx-4 mb-4 p-3 bg-gradient-to-r from-[#C6A55C]/10 to-transparent rounded-lg"
                        onClick={onClose}
                      >
                        <span className="text-xs font-medium text-[#C6A55C] uppercase tracking-wide">Destacado</span>
                        <p className="text-sm font-medium text-gray-900 mt-1">{category.featured.name}</p>
                      </Link>
                    )}

                    {/* Category items */}
                    <div className="px-4 pb-4 space-y-2">
                      {category.items.map((item, itemIndex) => (
                        <Link
                          key={itemIndex}
                          href={item.href}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                          onClick={onClose}
                        >
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
                            <Image
                              src={item.image}
                              alt=""
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                            <p className="text-xs text-gray-500">{item.description}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                </div>
              ))}
            </div>

            {/* Bottom actions */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
              <div className="flex justify-between items-center">
                <Link
                  href="/cuenta"
                  className="text-sm text-gray-600 hover:text-[#C6A55C] transition-colors duration-200"
                  onClick={onClose}
                >
                  Mi Cuenta
                </Link>
                <Link
                  href="/carrito"
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#C6A55C] transition-colors duration-200"
                  onClick={onClose}
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>Carrito (0)</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
} 
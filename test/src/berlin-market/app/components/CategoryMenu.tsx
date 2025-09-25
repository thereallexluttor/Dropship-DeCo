"use client"

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface SubCategory {
  name: string
  href: string
}

interface Brand {
  name: string
  logo: string
  href: string
}

interface Promotion {
  type: 'offer' | 'new'
  title: string
  href: string
  icon: string
}

interface Category {
  name: string
  href: string
  subcategories?: SubCategory[]
  promotions?: Promotion[]
  brands?: Brand[]
  bannerImage?: {
    src: string
    alt: string
    href: string
  }
}

interface CategoryMenuProps {
  category: Category
  containerRef: React.RefObject<HTMLDivElement>
}

export default function CategoryMenu({ category, containerRef }: CategoryMenuProps) {
  const [isHovered, setIsHovered] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsHovered(false)
    }, 100) // 300ms de retraso antes de cerrar
  }

  useEffect(() => {
    const handleResize = () => {
      if (isHovered && menuRef.current) {
        // Force a re-render to update position
        setIsHovered(false)
        setTimeout(() => setIsHovered(true), 0)
      }
    }

    window.addEventListener('resize', handleResize)
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      window.removeEventListener('resize', handleResize)
    }
  }, [isHovered])

  const hasManyPromotions = category.promotions && category.promotions.length > 2;
  const menuHeightClass = hasManyPromotions ? 'md:h-[440px]' : 'md:h-[400px]';

  return (
    <div
      className="relative group w-[70px] sm:w-[80px] md:w-[90px] lg:w-[100px] flex-shrink-0 -my-1"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      ref={menuRef}
    >
      <Link
        href={category.href}
        className="flex flex-col items-center justify-center px-0 py-1 rounded-lg hover:bg-gray-50 transition-colors group"
      >
        <span className="text-[10px] sm:text-xs lg:text-sm text-center mt-1 text-gray-700 group-hover:text-[#196428] transition-colors">
          {category.name}
        </span>
      </Link>

      {/* Menú desplegable */}
      {isHovered && (
        <div 
          className="fixed w-full md:w-[95vw] lg:w-[1200px] max-w-[95vw] bg-white rounded-lg shadow-lg border border-gray-200 z-50"
          style={{ 
            marginTop: '0.25rem',
            paddingTop: '0.5rem',
            top: menuRef.current?.getBoundingClientRect().bottom ?? 0,
            left: '50%',
            transform: 'translateX(-50%)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Área invisible para el cursor */}
          <div className="absolute h-4 w-full -top-4" />
          
          <div className={`flex flex-col md:flex-row h-auto ${menuHeightClass} overflow-y-auto md:overflow-y-hidden`}>
            {/* Sección 1: Subcategorías */}
            <div className="w-full md:w-1/5 p-4 md:p-6 md:border-r border-gray-100">
              <h3 className="text-[11px] sm:text-xs lg:text-sm font-medium text-gray-900 pb-2 mb-4">
                Todo en {category.name}
              </h3>
              {category.subcategories && (
                <div className="space-y-2">
                  {category.subcategories.map((subcategory) => (
                    <Link
                      key={subcategory.name}
                      href={subcategory.href}
                      className="flex items-center justify-between py-1.5 sm:py-2 px-2 sm:px-3 text-[11px] sm:text-xs lg:text-sm text-gray-600 hover:bg-gray-50 hover:text-[#196428] rounded-md transition-colors"
                    >
                      <span>{subcategory.name}</span>
                      <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                    </Link>
                  ))}
                </div>
              )}
              <div className="mt-4 pt-4 md:absolute md:bottom-6 md:left-6 md:right-6">
                <Link 
                  href={category.href} 
                  className="text-[#196428] text-[10px] sm:text-xs lg:text-sm hover:underline"
                >
                  Ver todo en {category.name}
                </Link>
              </div>
            </div>

            {/* Sección 2: Ofertas, Novedades y Marcas */}
            <div className="w-full md:w-3/5 p-4 md:p-6 md:border-r border-gray-100 flex flex-col">
              {/* Ofertas y Novedades */}
              {category.promotions && (
                <div className="mb-8 md:mb-10 flex-grow">
                  <div className="grid grid-cols-2 gap-6">
                    {category.promotions.map((promo) => (
                      <Link
                        key={promo.title}
                        href={promo.href}
                        className="group relative overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 hover:shadow-md border border-gray-100"
                      >
                        <div className="flex items-center justify-between p-4 md:p-6">
                          <div className="flex items-center space-x-4">
                            <img src={promo.icon} alt="" className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                            <div>
                              <h4 className="text-[11px] sm:text-xs lg:text-sm font-medium text-gray-900 group-hover:text-[#196428] transition-colors duration-300">
                                {promo.type === 'offer' ? 'Ofertas' : 'Novedades'}
                              </h4>
                              <p className="mt-1 text-[11px] sm:text-xs lg:text-sm text-gray-500">
                                {promo.title}
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 sm:h-4 sm:w-4 text-gray-400 group-hover:text-[#196428] transition-colors duration-300" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Marcas */}
              {category.brands && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[11px] sm:text-xs lg:text-sm font-medium text-gray-900">
                      Principales marcas
                    </h3>
                    <Link 
                      href={`${category.href}/marcas`}
                      className="text-[11px] sm:text-xs lg:text-sm text-[#196428] hover:text-[#196428]/80 hover:underline transition-colors duration-300"
                    >
                      Todas las marcas
                    </Link>
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                    {category.brands.map((brand) => (
                      <Link
                        key={brand.name}
                        href={brand.href}
                        className="group flex items-center justify-center aspect-[4/3] rounded-lg bg-white p-4 transition-all duration-300 hover:shadow-md border border-gray-100"
                      >
                        <img 
                          src={brand.logo} 
                          alt={brand.name} 
                          className="max-h-8 md:max-h-10 w-auto object-contain opacity-90 group-hover:opacity-100 transition-opacity duration-300" 
                        />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sección 3: Banner Vertical */}
            <div className="w-full md:w-1/5 h-48 md:h-full">
              {category.bannerImage && (
                <Link href={category.bannerImage.href} className="block h-full">
                  <img
                    src={category.bannerImage.src}
                    alt={category.bannerImage.alt}
                    className="w-full h-full object-cover md:rounded-r-lg"
                  />
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

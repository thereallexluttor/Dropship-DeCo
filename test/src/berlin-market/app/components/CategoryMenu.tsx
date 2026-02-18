"use client"

import { useEffect, useRef, useCallback, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { useScrollBehavior } from '../hooks/useScrollBehavior'
import { useCategory } from '../contexts/CategoryContext'

// Estos tipos ahora se importan desde el hook useCategories
import { CategoryWithSubcategories } from '../hooks/useCategories'

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

interface Category extends CategoryWithSubcategories {}

interface CategoryMenuProps {
  category: Category
  containerRef: React.RefObject<HTMLDivElement>
}

const CAROUSEL_INTERVAL_MS = 3500

export default function CategoryMenu({ category, containerRef }: CategoryMenuProps) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [bannerSlide, setBannerSlide] = useState(0)
  const [brandsSlide, setBrandsSlide] = useState(0)

  // Usar el contexto global de categorías
  const { isCategoryOpen, toggleCategory, closeAllCategories } = useCategory()
  const isOpen = isCategoryOpen(category.name)

  // Hook para manejar el comportamiento durante scroll
  const { shouldClose, resetCloseState } = useScrollBehavior({
    threshold: 150, // Cerrar menú después de 150px de scroll
    debounceMs: 16,
    onScrollClose: closeAllCategories, // Cerrar todas las categorías al hacer scroll
    enabled: isOpen // Solo habilitar cuando el menú esté abierto
  })

  const handleMouseEnter = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    if (shouldClose) {
      resetCloseState()
    }
    toggleCategory(category.name) // Abrir esta categoría (cierra las demás automáticamente)
  }, [shouldClose, resetCloseState, toggleCategory, category.name])

  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      if (!isOpen) return // Si ya está cerrado, no hacer nada
      closeAllCategories() // Cerrar todas las categorías
    }, 100) // 100ms de retraso antes de cerrar
  }, [isOpen, closeAllCategories])

  useEffect(() => {
    const handleResize = () => {
      if (isOpen && menuRef.current) {
        // Force a re-render to update position
        closeAllCategories()
        setTimeout(() => toggleCategory(category.name), 0)
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      window.removeEventListener('resize', handleResize)
    }
  }, [isOpen, closeAllCategories, toggleCategory, category.name])

  // Cerrar menú si el usuario hace scroll demasiado
  useEffect(() => {
    if (shouldClose && isOpen) {
      closeAllCategories()
    }
  }, [shouldClose, isOpen, closeAllCategories])

  // Carrusel para Mascotas: banners y marcas
  const hasBannerCarousel = "bannerImagesCarousel" in category && (category as CategoryWithSubcategories & { bannerImagesCarousel?: Array<{ src: string; alt: string; href: string }> }).bannerImagesCarousel?.length
  const hasBrandsCarousel = "brandsCarousel" in category && (category as CategoryWithSubcategories & { brandsCarousel?: Array<Array<{ name: string; logo: string; href: string }>> }).brandsCarousel?.length

  useEffect(() => {
    if (!isOpen) {
      setBannerSlide(0)
      setBrandsSlide(0)
      return
    }
    const bannerSlides = (category as CategoryWithSubcategories & { bannerImagesCarousel?: Array<{ src: string; alt: string; href: string }> }).bannerImagesCarousel?.length ?? 0
    const brandsSlides = (category as CategoryWithSubcategories & { brandsCarousel?: Array<Array<{ name: string; logo: string; href: string }>> }).brandsCarousel?.length ?? 0
    const t = setInterval(() => {
      if (bannerSlides > 1) setBannerSlide((s) => (s + 1) % bannerSlides)
      if (brandsSlides > 1) setBrandsSlide((s) => (s + 1) % brandsSlides)
    }, CAROUSEL_INTERVAL_MS)
    return () => clearInterval(t)
  }, [isOpen, category])

  // Función para calcular la posición centrada del menú respecto al contenedor de categorías
  const getCenteredMenuPosition = useCallback(() => {
    if (!containerRef?.current) {
      return {
        left: '50%',
        transform: 'translateX(-50%)'
      }
    }

    const containerRect = containerRef.current.getBoundingClientRect()
    const containerCenterX = containerRect.left + (containerRect.width / 2)

    return {
      left: `${containerCenterX}px`,
      transform: 'translateX(-50%)'
    }
  }, [containerRef])

  return (
    <div
      className="relative group w-[70px] sm:w-[80px] md:w-[80px] lg:w-[100px] flex-shrink-0 -my-1"
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
      {isOpen && !shouldClose && (
        <div
          className="fixed bg-white rounded-lg shadow-xl border border-gray-200 z-50 backdrop-blur-sm"
          style={{
            ...getCenteredMenuPosition(),
            top: menuRef.current ? menuRef.current.getBoundingClientRect().bottom + 4 : 0,
            marginTop: '0.25rem',
            paddingTop: '0.5rem',
            maxHeight: 'min(90vh, 600px)',
            overflowY: 'auto',
            transition: 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out',
            animation: 'fadeInUp 0.2s ease-out',
            width: '100vw',
            maxWidth: 'min(95vw, 1200px)'
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Área invisible para el cursor */}
          <div className="absolute h-4 -top-4 left-1/2 transform -translate-x-1/2 w-full" />
          
          <div className="flex flex-col md:flex-row h-auto min-h-[380px]">
            {/* Sección 1: Subcategorías */}
            <div className="w-full md:w-1/5 p-4 md:p-6 md:border-r border-gray-100 flex flex-col min-h-[380px]">
              <h3 className="text-[11px] sm:text-xs lg:text-sm font-medium text-gray-900 pb-2 mb-4">
                Todo en {category.name}
              </h3>
              {category.subcategories && (
                <div 
                  className="space-y-2 flex-grow overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400" 
                  style={{ 
                    maxHeight: '320px',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#D1D5DB transparent'
                  }}
                >
                  {category.subcategories.map((subcategory) => (
                    <Link
                      key={subcategory.name}
                      href={subcategory.href}
                      className="flex items-center justify-between py-1.5 sm:py-2 px-2 sm:px-3 text-[10px] sm:text-[11px] lg:text-xs text-gray-600 hover:bg-gray-50 hover:text-[#196428] rounded-md transition-colors"
                    >
                      <span className="lowercase">{subcategory.name}</span>
                      <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                    </Link>
                  ))}
                </div>
              )}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <Link 
                  href={category.href} 
                  className="text-[#196428] text-[10px] sm:text-xs lg:text-sm hover:underline"
                >
                  Ver todo en {category.name}
                </Link>
              </div>
            </div>

            {/* Sección 2: Ofertas, Novedades y Marcas */}
            <div className="w-full md:w-3/5 p-4 md:p-6 md:border-r border-gray-100 flex flex-col min-h-[380px]">
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
                            <Image src={promo.icon} alt="" width={32} height={32} className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                            <div>
                              <h4 className="text-[10px] sm:text-[11px] lg:text-xs font-medium text-gray-900 group-hover:text-[#196428] transition-colors duration-300 lowercase">
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

              {/* Marcas - carrusel para Mascotas, estático para el resto */}
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
                  {hasBrandsCarousel ? (
                    <div className="relative overflow-hidden min-h-[100px]">
                      {(category as CategoryWithSubcategories & { brandsCarousel?: Array<Array<{ name: string; logo: string; href: string }>> }).brandsCarousel!.map((slideBrands, idx) => (
                        <div
                          key={idx}
                          className={`grid grid-cols-3 md:grid-cols-5 gap-4 transition-opacity duration-500 ${idx === brandsSlide ? "opacity-100 relative" : "opacity-0 absolute inset-0 pointer-events-none"}`}
                        >
                          {slideBrands.map((brand) => (
                            <Link
                              key={`${idx}-${brand.name}`}
                              href={brand.href}
                              className="group flex items-center justify-center aspect-[4/3] rounded-lg bg-white p-4 transition-all duration-300 hover:shadow-md border border-gray-100"
                            >
                              <div className="relative w-full h-full">
                                <Image 
                                  src={brand.logo} 
                                  alt={brand.name} 
                                  fill
                                  className="object-contain opacity-90 group-hover:opacity-100 transition-opacity duration-300" 
                                  sizes="(max-width: 768px) 33vw, 20vw"
                                />
                              </div>
                            </Link>
                          ))}
                        </div>
                      ))}
                      {((category as CategoryWithSubcategories & { brandsCarousel?: Array<Array<{ name: string; logo: string; href: string }>> }).brandsCarousel?.length ?? 0) > 1 && (
                        <div className="flex justify-center gap-1.5 mt-3">
                          {(category as CategoryWithSubcategories & { brandsCarousel?: Array<Array<{ name: string; logo: string; href: string }>> }).brandsCarousel!.map((_, i) => (
                            <button
                              key={i}
                              type="button"
                              aria-label={`Slide ${i + 1}`}
                              className={`w-1.5 h-1.5 rounded-full transition-colors ${i === brandsSlide ? "bg-[#196428]" : "bg-gray-300"}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                      {category.brands!.map((brand) => (
                        <Link
                          key={brand.name}
                          href={brand.href}
                          className="group flex items-center justify-center aspect-[4/3] rounded-lg bg-white p-4 transition-all duration-300 hover:shadow-md border border-gray-100"
                        >
                          <div className="relative w-full h-full">
                            <Image 
                              src={brand.logo} 
                              alt={brand.name} 
                              fill
                              className="object-contain opacity-90 group-hover:opacity-100 transition-opacity duration-300" 
                              sizes="(max-width: 768px) 33vw, 20vw"
                            />
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sección 3: Banner Vertical - carrusel para Mascotas (PERRO + GATO), estático para el resto */}
            <div className="w-full md:w-1/5 min-h-[200px] md:min-h-[380px] flex items-stretch overflow-hidden md:rounded-r-lg relative">
              {hasBannerCarousel ? (
                <>
                  {(category as CategoryWithSubcategories & { bannerImagesCarousel?: Array<{ src: string; alt: string; href: string }> }).bannerImagesCarousel!.map((banner, idx) => (
                    <Link
                      key={idx}
                      href={banner.href}
                      className={`block w-full absolute inset-0 transition-opacity duration-500 ${idx === bannerSlide ? "opacity-100 z-10" : "opacity-0 pointer-events-none"}`}
                    >
                      <div className="relative w-full h-full min-h-[200px] md:min-h-[380px]">
                        <Image
                          src={banner.src}
                          alt={banner.alt}
                          fill
                          className="object-cover object-center"
                          sizes="(max-width: 768px) 100vw, 20vw"
                        />
                      </div>
                    </Link>
                  ))}
                  {((category as CategoryWithSubcategories & { bannerImagesCarousel?: Array<{ src: string; alt: string; href: string }> }).bannerImagesCarousel?.length ?? 0) > 1 && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                      {(category as CategoryWithSubcategories & { bannerImagesCarousel?: Array<{ src: string; alt: string; href: string }> }).bannerImagesCarousel!.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          aria-label={`Banner ${i + 1}`}
                          className={`w-1.5 h-1.5 rounded-full transition-colors ${i === bannerSlide ? "bg-white" : "bg-white/50"}`}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : category.bannerImage ? (
                <Link href={category.bannerImage.href} className="block w-full">
                  <div className="relative w-full h-full min-h-[200px] md:min-h-[380px]">
                    <Image
                      src={category.bannerImage.src}
                      alt={category.bannerImage.alt}
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 768px) 100vw, 20vw"
                    />
                  </div>
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

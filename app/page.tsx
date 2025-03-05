"use client"

import Image from "next/image"
import Link from "next/link"
import { ShoppingBag, Search, Menu, X, Eye } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import PageTransition from "./components/PageTransition"
import MainLayout from "./components/MainLayout"
import ProductCard from "./components/ProductCard"
import FadeInOnScroll from './components/FadeInOnScroll'

export default function Home() {
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [activeSlide, setActiveSlide] = useState(0)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next')

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

  const handleMouseEnter = (index: number) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setActiveDropdown(index)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null)
    }, 200) // 300ms delay before closing
  }
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideDirection('next')
      setActiveSlide((current) => (current === 3 ? 0 : current + 1))
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Searching for:", searchQuery)
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-white">
        <header className={`
          fixed w-full bg-white z-50 
          transition-all duration-300 ease-in-out
          ${isScrolled ? 'shadow-lg' : ''}
          hover:bg-black group border-b border-gray-200
        `}>
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
              
            </Link>
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

          {/* Updated Mobile Menu */}
          <div className={`
            fixed inset-0 z-50 md:hidden
            ${isMobileMenuOpen ? 'visible' : 'invisible'}
          `}>
            {/* Dark overlay */}
            <div 
              className={`
                absolute inset-0 bg-black/50 
                transition-opacity duration-300
                ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}
              `}
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Menu panel */}
            <div className={`
              absolute right-0 top-0 h-full w-[80%] max-w-sm
              bg-white shadow-xl
              transform transition-transform duration-300
              ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
            `}>
              {/* Close button */}
              <button 
                className="absolute top-4 right-4 p-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>

              {/* Mobile menu content */}
              <div className="pt-16 pb-6 px-4 divide-y divide-gray-100">
                {categories.map((category, index) => (
                  <div key={index} className="py-4">
                    <button 
                      className="
                        flex justify-between items-center w-full
                        text-black text-sm font-bold
                        transition-colors duration-200
                        hover:text-[#C6A55C]
                      "
                      onClick={() => setActiveDropdown(activeDropdown === index ? null : index)}
                    >
                      {category.name}
                      <svg
                        className={`
                          w-4 h-4 transition-transform duration-300
                          ${activeDropdown === index ? 'rotate-180' : ''}
                        `}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div 
                      className={`
                        overflow-hidden transition-all duration-300
                        ${activeDropdown === index ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}
                      `}
                    >
                      {category.items.map((item, itemIndex) => (
                        <Link
                          key={itemIndex}
                          href={item.href}
                          className="
                            block py-2 pl-4 text-sm text-gray-600
                            hover:text-[#C6A55C] transition-colors duration-200
                          "
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </header>

        <main>
          <section className="relative w-full pt-20">
            <div className="container mx-auto px-4">
              <div className="relative aspect-[21/9] w-full overflow-hidden rounded-lg">
                {/* Carousel */}
                <div className="absolute inset-0">
                  {[1, 2, 3, 4].map((_, index) => (
                    <div
                      key={index}
                      className={`
                        absolute inset-0 
                        transition-all duration-[2000ms] ease-in-out
                        ${activeSlide === index 
                          ? "opacity-100 scale-100" 
                          : "opacity-0 scale-110"}
                      `}
                    >
                      <Image
                        src={`/cap${index + 1}.jpg`}
                        alt={`Slide ${index + 1}`}
                        fill
                        className={`
                          object-cover rounded-lg
                          transition-transform duration-[5000ms] ease-out
                          ${activeSlide === index ? 'scale-110' : 'scale-100'}
                        `}
                        priority={index === 0}
                      />
                    </div>
                  ))}
                </div>

                {/* Enhanced Gradient Overlay */}
                <div className="
                  absolute inset-0 
                  bg-gradient-to-r from-black/90 via-black/70 to-transparent 
                  rounded-lg backdrop-blur-[2px] 
                  transition-all duration-500 
                  hover:backdrop-blur-sm group
                ">
                  {/* Gold gradient overlay */}
                  <div className="
                    absolute inset-0 
                    bg-gradient-to-r from-[#C6A55C]/20 via-[#C6A55C]/10 to-transparent 
                    rounded-lg opacity-0 
                    group-hover:opacity-100 
                    transition-opacity duration-1000
                  "></div>
                  
                  {/* Rotating Diamond icon */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="
                      relative transform 
                      transition-transform duration-700 
                      group-hover:rotate-180
                    ">
                      <svg 
                        className="
                          w-24 h-24 md:w-32 md:h-32 
                          text-[#C6A55C] opacity-10
                          transition-all duration-700
                          group-hover:opacity-20
                          group-hover:scale-110
                        " 
                        viewBox="0 0 24 24" 
                        fill="currentColor"
                      >
                        <path d="M12,2L1,12L12,22L23,12L12,2M12,4.3L19.7,12L12,19.7L4.3,12L12,4.3Z"/>
                      </svg>
                    </div>
                  </div>

                  {/* Slide indicators */}
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {[0, 1, 2, 3].map((index) => (
                      <button
                        key={index}
                        onClick={() => setActiveSlide(index)}
                        className={`
                          w-2 h-2 rounded-full 
                          transition-all duration-300
                          ${activeSlide === index 
                            ? 'bg-white w-6' 
                            : 'bg-white/50 hover:bg-white/70'}
                        `}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>

                  {/* Content */}
                  <div className="h-full w-full flex items-center justify-center relative z-10">
                    <div className="
                      text-center w-full max-w-[95%] md:max-w-[80%] lg:max-w-[60%] 
                      space-y-1 md:space-y-3 
                      transform transition-all duration-500 
                      hover:scale-105
                    ">
                      <div className="bg-white/90 text-black px-3 py-1 md:px-4 md:py-1.5 inline-block rounded-sm text-[7px] md:text-xs font-light tracking-[0.2em] font-poppins">
                        EDICIÓN LIMITADA
                      </div>
                      <h1 className="text-base md:text-4xl lg:text-5xl font-poppins text-white leading-[1.4] md:leading-[1.5] tracking-wide drop-shadow-2xl transform transition-all duration-300 hover:scale-110 py-2 my-1">
                        <span className="block text-white font-extralight">Colección</span>
                        <span className="block font-medium">Elegancia Atemporal</span>
                      </h1>
                      <p className="text-[7px] md:text-base lg:text-lg text-white font-light tracking-[0.3em] uppercase font-poppins">
                        Piezas únicas hechas a mano
                      </p>
                      <div className="pt-1 md:pt-4">
                        <Link
                          href="#"
                          className="group/btn relative overflow-hidden bg-white text-black px-6 py-2 md:px-8 md:py-3 text-[8px] md:text-xs lg:text-sm font-poppins tracking-widest transition-all duration-300 inline-block"
                        >
                          <span className="relative z-10 transition-colors duration-300 group-hover/btn:text-white font-light">
                            DESCUBRIR COLECCIÓN
                          </span>
                          <div className="absolute inset-0 bg-black transform translate-y-full transition-transform duration-300 group-hover/btn:translate-y-0"></div>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-sans text-center mb-4">Joyas Destacadas</h2>
              <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto text-sm">
                Descubre nuestra colección de piezas exclusivas, donde cada joya cuenta una historia única de artesanía y elegancia atemporal.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                {[1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12].map((item) => (
                  <FadeInOnScroll key={item} delay={item * 100}>
                    <div className="group relative">
                      {/* Product Image Container */}
                      <div className="
                        relative aspect-square 
                        overflow-hidden 
                        rounded-lg 
                        bg-gray-100
                      ">
                        {/* Product Image */}
                        <Image
                          src="/placeholder.svg"
                          alt={`Anillo Diamante "Eternidad"`}
                          fill
                          className="
                            object-cover
                            transition-transform duration-700
                            group-hover:scale-110
                          "
                        />
                        
                        {/* Quick View Overlay */}
                        <div className="
                          absolute inset-0 
                          bg-black/40 
                          flex items-center justify-center
                          opacity-0 transition-opacity duration-300
                          group-hover:opacity-100
                        ">
                          <button 
                            className="
                              bg-white text-black
                              px-6 py-2
                              rounded-full
                              flex items-center gap-2
                              transform translate-y-4
                              transition-all duration-300
                              group-hover:translate-y-0
                              hover:bg-[#C6A55C] hover:text-white
                            "
                            aria-label="Vista rápida"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="text-sm font-light">Vista Rápida</span>
                          </button>
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="mt-4 space-y-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-sm font-medium text-gray-900 group-hover:text-[#C6A55C] transition-colors duration-300">
                              Anillo Diamante "Eternidad"
                            </h3>
                            <p className="text-xs text-gray-500">Colección Royal</p>
                          </div>
                          <button 
                            className="
                              p-2 rounded-full 
                              text-gray-400 
                              hover:text-[#C6A55C] 
                              transition-colors duration-300
                            "
                            aria-label="Añadir al carrito"
                          >
                            <ShoppingBag className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            4.999 €
                          </p>
                          <div className="flex items-center">
                            <div className="flex text-[#C6A55C]">
                              {[...Array(5)].map((_, i) => (
                                <svg key={i} className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                                </svg>
                              ))}
                            </div>
                            <span className="ml-1 text-xs text-gray-500">(24)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </FadeInOnScroll>
                ))}
              </div>
            </div>
          </section>

          <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
                {/* Image container with hover effects */}
                <div className="md:w-1/2 lg:w-2/5 relative">
                  <div className="relative aspect-[4/5] w-full">
                    {/* Main image */}
                    <div className="
                      relative w-full h-full 
                      rounded-lg overflow-hidden 
                      transform transition-transform duration-700 
                      hover:scale-105
                    ">
                      <Image
                        src="/berlin4k.jpg"
                        alt="About Berlin Jewels"
                        fill
                        className="object-cover"
                        priority
                      />
                      {/* Gradient overlay */}
                      <div className="
                        absolute inset-0 
                        bg-gradient-to-t from-black/30 to-transparent
                        opacity-0 transition-opacity duration-500
                        group-hover:opacity-100
                      "/>
                    </div>
                    
                    {/* Decorative elements */}
                    <div className="
                      absolute -bottom-4 -right-4 
                      w-24 h-24 md:w-32 md:h-32 
                      border-2 border-[#C6A55C]/20 
                      rounded-lg
                      -z-10
                    "/>
                    <div className="
                      absolute -top-4 -left-4 
                      w-24 h-24 md:w-32 md:h-32 
                      border-2 border-[#C6A55C]/20 
                      rounded-lg
                      -z-10
                    "/>
                  </div>
                </div>

                {/* Content */}
                <div className="md:w-1/2 lg:w-3/5 space-y-6">
                  <div className="space-y-2">
                    <p className="text-sm tracking-[0.2em] text-[#C6A55C] font-light">
                      DESDE 1920
                    </p>
                    <h2 className="text-3xl md:text-4xl font-light text-gray-900">
                      Un Legado de <span className="font-medium">Excelencia</span>
                    </h2>
                  </div>

                  <div className="space-y-4 text-gray-600">
                    <p className="text-base leading-relaxed">
                      Desde 1920, Berlin Jewels ha sido sinónimo de elegancia y artesanía excepcional. 
                      Cada pieza que creamos es un testimonio de nuestra dedicación a la excelencia y 
                      nuestra pasión por la joyería fina.
                    </p>
                    <p className="text-base leading-relaxed">
                      Nuestro compromiso con la calidad y la innovación nos ha convertido en un 
                      referente en el mundo de la alta joyería.
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 py-6">
                    {[
                      { number: "100+", label: "Artesanos" },
                      { number: "5000+", label: "Clientes" },
                      { number: "103", label: "Años" },
                    ].map((stat, index) => (
                      <div key={index} className="text-center">
                        <div className="text-2xl font-medium text-gray-900">{stat.number}</div>
                        <div className="text-sm text-gray-500">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="pt-4">
                    <Link
                      href="#"
                      className="
                        group inline-flex items-center gap-2
                        text-sm font-medium text-gray-900
                        hover:text-[#C6A55C]
                        transition-colors duration-300
                      "
                    >
                      <span>Descubrir Nuestra Historia</span>
                      <span className="
                        transform transition-transform duration-300
                        group-hover:translate-x-1
                      ">→</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="bg-black text-white py-16 border-t border-[#C6A55C]/20">
          <div className="container mx-auto px-4">
            {/* Newsletter Section */}
            <div className="mb-16 text-center max-w-2xl mx-auto">
              <h3 className="text-2xl font-light mb-4">
                Únete a Nuestro Mundo de <span className="font-medium">Elegancia</span>
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                Suscríbete para recibir las últimas novedades, colecciones exclusivas y eventos especiales.
              </p>
              <form className="flex gap-2 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Tu correo electrónico"
                  className="
                    flex-1 px-4 py-2
                    bg-white/5 
                    border border-white/10
                    text-white placeholder-gray-500
                    focus:outline-none focus:border-[#C6A55C]
                    transition-colors duration-300
                  "
                />
                <button 
                  type="submit"
                  className="
                    px-6 py-2
                    bg-[#C6A55C] text-black
                    hover:bg-[#D4B56C]
                    transition-colors duration-300
                    text-sm font-medium
                  "
                >
                  Suscribirse
                </button>
              </form>
            </div>

            {/* Main Footer Content */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
              <div className="space-y-4">
                <Link href="/" className="block">
                  <img 
                    src="/DEU_Berlin_COA.svg.png" 
                    alt="Berlin Jewelry Logo" 
                    className="h-12 w-auto [filter:brightness(0)_invert(1)]" 
                  />
                </Link>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Creando joyas excepcionales desde 1920. Cada pieza cuenta una historia de artesanía y pasión.
                </p>
              </div>

              {[
                {
                  title: "Comprar",
                  links: ["Anillos", "Collares", "Pulseras", "Pendientes"]
                },
                {
                  title: "Acerca de",
                  links: ["Nuestra Historia", "Artesanía", "Sostenibilidad", "Prensa"]
                },
                {
                  title: "Atención al Cliente",
                  links: ["Contacto", "Envíos", "Devoluciones", "FAQ"]
                }
              ].map((column, index) => (
                <div key={index} className="space-y-4">
                  <h4 className="text-sm font-medium tracking-wider">{column.title}</h4>
                  <ul className="space-y-2">
                    {column.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <Link 
                          href="#" 
                          className="
                            text-sm text-gray-400
                            hover:text-[#C6A55C]
                            transition-colors duration-300
                            block py-1
                          "
                        >
                          {link}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Bottom Footer */}
            <div className="pt-8 border-t border-white/10">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-6">
                  <Link 
                    href="#" 
                    className="text-sm text-gray-400 hover:text-[#C6A55C] transition-colors duration-300"
                  >
                    Política de Privacidad
                  </Link>
                  <Link 
                    href="#" 
                    className="text-sm text-gray-400 hover:text-[#C6A55C] transition-colors duration-300"
                  >
                    Términos y Condiciones
                  </Link>
                </div>

                <div className="flex items-center gap-4">
                  {/* Social Links */}
                  {['Facebook', 'Instagram', 'Twitter'].map((social) => (
                    <Link
                      key={social}
                      href="#"
                      className="
                        p-2 rounded-full
                        border border-white/10
                        hover:border-[#C6A55C]
                        text-gray-400 hover:text-[#C6A55C]
                        transition-colors duration-300
                      "
                      aria-label={social}
                    >
                      <svg className="w-4 h-4 fill-current" aria-hidden="true">
                        {/* Use the same SVG paths as before */}
                      </svg>
                    </Link>
                  ))}
                </div>

                {/* Trust Badges */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <svg 
                      className="w-4 h-4" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z" 
                      />
                    </svg>
                    <span className="text-xs">Pago Seguro</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    © 2024 Berlin Jewels
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </MainLayout>
  )
}


"use client"

import Image from "next/image"
import Link from "next/link"
import { ShoppingBag, Search, Menu, X } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import PageTransition from "../components/PageTransition"
import MainLayout from "../components/MainLayout"
import ProductCard from "../components/ProductCard"
import FadeInOnScroll from '../components/FadeInOnScroll'

export default function Regalos() {
  // ... existing state declarations
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)

  // ... existing categories array
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
        { name: "Edición Limitada", href: "/edicion-limitada" }
      ],
    },
    {
      name: "MATERIALES",
      items: [
        { name: "Oro 18k", href: "/materiales/oro" },
        { name: "Platino", href: "/materiales/platino" },
        { name: "Diamantes", href: "/materiales/diamantes" },
        { name: "Piedras Preciosas", href: "/materiales/piedras-preciosas" }
      ],
    },
    {
      name: "SERVICIOS",
      items: [
        { name: "Personalización", href: "/servicios/personalizacion" },
        { name: "Grabado", href: "/servicios/grabado" },
        { name: "Mantenimiento", href: "/servicios/mantenimiento" },
        { name: "Tasación", href: "/servicios/tasacion" }
      ],
    },
  ]

  // ... existing handlers and effects
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

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((current) => (current === 3 ? 0 : current + 1));
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  return (
    <MainLayout>
      <div className="min-h-screen bg-white">
        {/* Header Section - Copied from compromiso page */}
        <header className="fixed w-full bg-white z-50 transition-colors duration-300 ease-in-out hover:bg-black group border-b border-gray-200">
          {/* Mobile Search Bar */}
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
                className="flex-1 h-10 px-4 rounded-full bg-gray-100 text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
                    className="text-black text-sm font-bold transition-colors duration-300 ease-in-out group-hover:text-white font-poppins"
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
                    className="flex justify-between items-center w-full py-4 text-black text-sm font-bold transition-colors duration-200 hover:text-blue-600"
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

        <main>
          {/* Hero Section - Modified for Regalos */}
          <section className="relative w-full pt-20">
            <div className="container mx-auto px-4">
              <div className="relative aspect-[21/9] w-full">
                <div className="absolute inset-0">
                  {[1, 2, 3, 4].map((_, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                        activeSlide === index ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <Image
                        src={`/cap${index + 1}.jpg`}
                        alt={`Slide ${index + 1}`}
                        fill
                        className="object-cover rounded-lg"
                        priority={index === 0}
                      />
                    </div>
                  ))}
                </div>

                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent rounded-lg backdrop-blur-[2px] transition-all duration-500 hover:backdrop-blur-sm group">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#C6A55C]/30 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                  
                  <div className="h-full w-full flex items-center justify-center relative z-10">
                    <div className="text-center w-full max-w-[95%] md:max-w-[80%] lg:max-w-[60%] space-y-2 md:space-y-4">
                      <div className="bg-white/90 text-black px-4 py-1.5 md:px-5 md:py-2 inline-block rounded-sm text-[8px] md:text-sm font-light tracking-[0.3em] font-poppins">
                        REGALOS ESPECIALES
                      </div>
                      <h1 className="text-base md:text-4xl lg:text-5xl font-poppins text-white leading-[1.4] md:leading-[1.5] tracking-wide drop-shadow-2xl">
                        <span className="block text-[#C6A55C] font-light italic">Joyas Exclusivas</span>
                        <span className="block font-medium mt-2">Para Momentos Únicos</span>
                      </h1>
                      <p className="text-[8px] md:text-base lg:text-lg text-white/90 font-light tracking-[0.2em] uppercase font-poppins max-w-2xl mx-auto">
                        Encuentra el regalo perfecto para cada ocasión
                      </p>
                      <div className="pt-2 md:pt-6 space-x-4">
                        <Link
                          href="#collection"
                          className="group/btn relative overflow-hidden bg-white/90 text-black px-6 py-2 md:px-8 md:py-3 text-[8px] md:text-sm font-poppins tracking-widest transition-all duration-300 inline-block hover:bg-[#C6A55C] hover:text-white"
                        >
                          VER COLECCIÓN
                        </Link>
                        <Link
                          href="#appointment"
                          className="group/btn relative overflow-hidden border border-white/80 text-white px-6 py-2 md:px-8 md:py-3 text-[8px] md:text-sm font-poppins tracking-widest transition-all duration-300 inline-block hover:bg-white hover:text-black"
                        >
                          ASESORAMIENTO PERSONAL
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section - Modified to use the same icon style */}
          <section className="py-16 bg-gradient-to-b from-white to-[#FDF9F3]">
            <div className="container mx-auto px-4 text-center max-w-4xl">
              <h2 className="text-2xl md:text-3xl font-poppins text-[#1A1A1A] mb-6">Regalos que Perduran en el Tiempo</h2>
              <p className="text-gray-600 leading-relaxed mb-8 font-light font-poppins">
                Descubre nuestra selección de joyas exclusivas, perfectas para celebrar los momentos más especiales
                y crear recuerdos inolvidables.
              </p>
              <div className="grid grid-cols-3 gap-8 mt-12">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <img src="/icons/diamond.png" alt="Calidad" className="w-12 h-12 opacity-80" />
                  </div>
                  <h3 className="text-sm font-medium mb-2 font-poppins">Diamantes GIA</h3>
                  <p className="text-xs text-gray-500 font-poppins">Certificación internacional</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <img src="/icons/exclusive.png" alt="Diseño" className="w-12 h-12 opacity-80" />
                  </div>
                  <h3 className="text-sm font-medium mb-2 font-poppins">Diseño Personalizado</h3>
                  <p className="text-xs text-gray-500 font-poppins">Creaciones únicas</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <img src="/icons/warranty.png" alt="Garantía" className="w-12 h-12 opacity-80" />
                  </div>
                  <h3 className="text-sm font-medium mb-2 font-poppins">Garantía Vitalicia</h3>
                  <p className="text-xs text-gray-500 font-poppins">Cuidado permanente</p>
                </div>
              </div>
            </div>
          </section>

          {/* Product Grid Section - Modified to match compromiso page */}
          <div className="container mx-auto px-4 py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-poppins text-[#1A1A1A] mb-4">Regalos Especiales</h2>
              <p className="text-gray-600 max-w-2xl mx-auto font-light font-poppins">
                Joyas únicas para celebrar momentos inolvidables
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {[1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12].map((item) => (
                <FadeInOnScroll key={item} delay={item * 100}>
                  <div className="bg-white group flex flex-col h-full hover:shadow-xl transition-all duration-500 rounded-sm overflow-hidden">
                    <div className="relative aspect-square">
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
                      
                      <div className="relative aspect-square group-hover:scale-105 transition-transform duration-700">
                        <Image
                          src="/cap1.jpg"
                          alt={`Regalo ${item}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col items-center text-center">
                      <p className="text-xs tracking-wider text-[#C6A55C] font-poppins mb-2">REGALOS ESPECIALES</p>
                      <h3 className="text-sm font-medium text-black mb-2 font-poppins">Collar Diamantes Eternidad</h3>
                      <p className="text-sm font-light text-black mb-4 font-poppins">2.499 €</p>
                      
                      <Link
                        href="#"
                        className="inline-block text-xs tracking-wider py-2 px-6 text-black border-b border-[#C6A55C] hover:text-[#C6A55C] transition-all duration-300 font-poppins"
                      >
                        Ver Detalles
                      </Link>
                    </div>
                  </div>
                </FadeInOnScroll>
              ))}
            </div>
          </div>

          {/* Consultation Section - Modified for Regalos */}
          <section className="py-16 bg-[#FDF9F3]">
            <div className="container mx-auto px-4">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-2xl md:text-3xl font-poppins text-[#1A1A1A] mb-6">
                  Asesoramiento Personalizado
                </h2>
                <p className="text-gray-600 mb-8 font-light font-poppins">
                  Nuestros expertos te ayudarán a elegir el regalo perfecto para esa ocasión especial
                </p>
                <Link
                  href="/consulta"
                  className="inline-block bg-[#C6A55C] text-white px-8 py-3 text-sm font-poppins tracking-wider hover:bg-black transition-colors duration-300"
                >
                  RESERVAR CITA
                </Link>
              </div>
            </div>
          </section>
        </main>

        {/* Footer Section - Copied from compromiso page */}
        <footer className="bg-black text-white py-12 mt-16 border-t border-gold/20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4 font-poppins">Shop</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="hover:text-gold transition-colors font-poppins">
                      Men
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-gold transition-colors font-poppins">
                      Women
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-gold transition-colors font-poppins">
                      Accessories
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-gold transition-colors font-poppins">
                      New Arrivals
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4 font-poppins">About</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="hover:text-gold transition-colors font-poppins">
                      Our Story
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-gold transition-colors font-poppins">
                      Careers
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-gold transition-colors font-poppins">
                      Press
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-gold transition-colors font-poppins">
                      Sustainability
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4 font-poppins">Customer Care</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="hover:text-gold transition-colors font-poppins">
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-gold transition-colors font-poppins">
                      Shipping & Returns
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-gold transition-colors font-poppins">
                      Size Guide
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-gold transition-colors font-poppins">
                      FAQ
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4 font-poppins">Connect</h3>
                <div className="flex space-x-4">
                  <Link href="#" className="text-white hover:text-gold transition-colors font-poppins">
                    <span className="sr-only">Facebook</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>
                  <Link href="#" className="text-white hover:text-gold transition-colors font-poppins">
                    <span className="sr-only">Instagram</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>
                  <Link href="#" className="text-white hover:text-gold transition-colors font-poppins">
                    <span className="sr-only">Twitter</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
            <div className="mt-12 border-t border-gray-800 pt-8 flex justify-between items-center">
              <p className="text-sm font-poppins">&copy; 2023 Berlin Jewels. All rights reserved.</p>
              <div className="flex space-x-6">
                <Link href="#" className="text-sm hover:text-gold transition-colors font-poppins">
                  Privacy Policy
                </Link>
                <Link href="#" className="text-sm hover:text-gold transition-colors font-poppins">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </MainLayout>
  )
} 
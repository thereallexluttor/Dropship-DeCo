"use client"

import Image from "next/image"
import Link from "next/link"
import { ShoppingBag, Search, Menu, X, Eye } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import PageTransition from "../components/PageTransition"
import FadeInOnScroll from '../components/FadeInOnScroll'
import MainLayout from "../components/MainLayout"

export default function AnillosPage() {
  // Reuse the same state and handlers from main page
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)

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

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((current) => (current === 3 ? 0 : current + 1));
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <MainLayout>
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

        <main>
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
                        alt={`Luxury Ring Collection ${index + 1}`}
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
                        COLECCIÓN DE ANILLOS
                      </div>
                      <h1 className="text-base md:text-4xl lg:text-5xl font-poppins text-white leading-[1.4] md:leading-[1.5] tracking-wide drop-shadow-2xl">
                        <span className="block text-[#C6A55C] font-light italic">Diseños Únicos</span>
                        <span className="block font-medium mt-2">Arte en Oro y Diamantes</span>
                      </h1>
                      <p className="text-[8px] md:text-base lg:text-lg text-white/90 font-light tracking-[0.2em] uppercase font-poppins max-w-2xl mx-auto">
                        Cada anillo cuenta una historia única
                      </p>
                      <div className="pt-2 md:pt-6 space-x-4">
                        <Link
                          href="#collection"
                          className="group/btn relative overflow-hidden bg-white/90 text-black px-6 py-2 md:px-8 md:py-3 text-[8px] md:text-sm font-poppins tracking-widest transition-all duration-300 inline-block hover:bg-[#C6A55C] hover:text-white"
                        >
                          EXPLORAR COLECCIÓN
                        </Link>
                        <Link
                          href="#appointment"
                          className="group/btn relative overflow-hidden border border-white/80 text-white px-6 py-2 md:px-8 md:py-3 text-[8px] md:text-sm font-poppins tracking-widest transition-all duration-300 inline-block hover:bg-white hover:text-black"
                        >
                          RESERVAR CITA
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="py-16 bg-gradient-to-b from-white to-[#FDF9F3]">
            <div className="container mx-auto px-4">
              <div className="text-center max-w-4xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-poppins text-[#1A1A1A] mb-6">Artesanía y Excelencia</h2>
                <p className="text-gray-600 leading-relaxed mb-12 font-light font-poppins">
                  Cada anillo es una obra maestra única, creada con los materiales más preciosos y elaborada con dedicación artesanal.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                  <FadeInOnScroll delay={100}>
                    <div className="group">
                      <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <img src="/icons/diamond.png" alt="Calidad" className="w-12 h-12 opacity-80" />
                      </div>
                      <h3 className="text-lg font-medium mb-3">Diamantes Certificados</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Seleccionamos cuidadosamente cada diamante para garantizar la máxima pureza y calidad.
                      </p>
                    </div>
                  </FadeInOnScroll>

                  <FadeInOnScroll delay={200}>
                    <div className="group">
                      <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <img src="/icons/exclusive.png" alt="Artesanía" className="w-12 h-12 opacity-80" />
                      </div>
                      <h3 className="text-lg font-medium mb-3">Artesanía Exclusiva</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Cada pieza es creada a mano por nuestros maestros artesanos con técnicas tradicionales.
                      </p>
                    </div>
                  </FadeInOnScroll>

                  <FadeInOnScroll delay={300}>
                    <div className="group">
                      <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <img src="/icons/warranty.png" alt="Garantía" className="w-12 h-12 opacity-80" />
                      </div>
                      <h3 className="text-lg font-medium mb-3">Garantía de por Vida</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        Respaldamos la calidad de nuestras joyas con una garantía vitalicia.
                      </p>
                    </div>
                  </FadeInOnScroll>
                </div>
              </div>
            </div>
          </section>

          <div className="container mx-auto px-4 py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-poppins text-[#1A1A1A] mb-4">Nuestra Colección de Anillos</h2>
              <p className="text-gray-600 max-w-2xl mx-auto font-light font-poppins">
                Descubre piezas únicas que celebran la elegancia y el diseño atemporal
              </p>
            </div>

            <div className="mb-12 flex flex-wrap gap-4 justify-center">
              <button className="px-8 py-2.5 border border-[#C6A55C] rounded-sm text-sm hover:bg-[#C6A55C] hover:text-white transition-all duration-300 font-poppins">
                Todos los Anillos
              </button>
              <button className="px-8 py-2.5 border border-[#C6A55C] rounded-sm text-sm hover:bg-[#C6A55C] hover:text-white transition-all duration-300 font-poppins">
                Compromiso
              </button>
              <button className="px-8 py-2.5 border border-[#C6A55C] rounded-sm text-sm hover:bg-[#C6A55C] hover:text-white transition-all duration-300 font-poppins">
                Bodas
              </button>
              <button className="px-8 py-2.5 border border-[#C6A55C] rounded-sm text-sm hover:bg-[#C6A55C] hover:text-white transition-all duration-300 font-poppins">
                Diamantes
              </button>
            </div>

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
        </main>

        {/* Update the Personalized Consultation section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0">
            <Image
              src="/cap2.jpg"
              alt="Luxury Consultation"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center text-white">
              <FadeInOnScroll>
                <h2 className="text-2xl md:text-3xl font-poppins mb-6">
                  Asesoramiento Personalizado
                </h2>
                <p className="text-white/90 mb-12 font-light font-poppins max-w-2xl mx-auto">
                  Nuestros expertos en joyería te guiarán en la elección del anillo perfecto que refleje tu estilo único
                </p>
                
                <Link
                  href="/consulta"
                  className="group inline-flex items-center gap-2 bg-[#C6A55C] text-white px-8 py-3 text-sm font-poppins tracking-wider hover:bg-white hover:text-black transition-all duration-300 relative overflow-hidden"
                >
                  <span>SOLICITAR CITA</span>
                  <svg 
                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>

                {/* Testimonials Slider */}
                <div className="mt-16 max-w-2xl mx-auto">
                  <div className="relative px-12">
                    <button className="absolute left-0 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button className="absolute right-0 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    <div className="text-center">
                      <p className="text-lg italic mb-4">
                        "Una experiencia excepcional. El asesoramiento personalizado me ayudó a encontrar el anillo perfecto para mi compromiso."
                      </p>
                      <div className="flex items-center justify-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
                        <span className="w-2 h-2 rounded-full bg-white"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeInOnScroll>
            </div>
          </div>
        </section>

        {/* Update the Footer */}
        <footer className="bg-black text-white py-16 mt-16 border-t border-[#C6A55C]/20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              {/* Logo and Description */}
              <div className="md:col-span-1">
                <Link href="/" className="inline-block mb-6">
                  <img 
                    src="/DEU_Berlin_COA.svg.png" 
                    alt="Berlin Jewelry Logo" 
                    className="h-12 w-auto brightness-0 invert" 
                  />
                </Link>
                <p className="text-sm text-gray-400 leading-relaxed mb-6">
                  Creando joyas excepcionales desde 1920. Cada pieza refleja nuestra pasión por la artesanía y la excelencia.
                </p>
                <div className="flex space-x-4">
                  <Link 
                    href="#" 
                    className="text-gray-400 hover:text-[#C6A55C] transition-colors duration-300"
                    aria-label="Instagram"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
                    </svg>
                  </Link>
                  <Link 
                    href="#" 
                    className="text-gray-400 hover:text-[#C6A55C] transition-colors duration-300"
                    aria-label="Facebook"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                    </svg>
                  </Link>
                  <Link 
                    href="#" 
                    className="text-gray-400 hover:text-[#C6A55C] transition-colors duration-300"
                    aria-label="Pinterest"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
                    </svg>
                  </Link>
                </div>
              </div>

              {/* Navigation Links */}
              <div>
                <h3 className="text-lg font-medium mb-6">Colecciones</h3>
                <ul className="space-y-4">
                  <li>
                    <Link href="/anillos" className="text-sm text-gray-400 hover:text-[#C6A55C] transition-colors duration-300">
                      Anillos
                    </Link>
                  </li>
                  <li>
                    <Link href="/collares" className="text-sm text-gray-400 hover:text-[#C6A55C] transition-colors duration-300">
                      Collares
                    </Link>
                  </li>
                  <li>
                    <Link href="/pulseras" className="text-sm text-gray-400 hover:text-[#C6A55C] transition-colors duration-300">
                      Pulseras
                    </Link>
                  </li>
                  <li>
                    <Link href="/pendientes" className="text-sm text-gray-400 hover:text-[#C6A55C] transition-colors duration-300">
                      Pendientes
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-6">Servicios</h3>
                <ul className="space-y-4">
                  <li>
                    <Link href="#" className="text-sm text-gray-400 hover:text-[#C6A55C] transition-colors duration-300">
                      Personalización
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-sm text-gray-400 hover:text-[#C6A55C] transition-colors duration-300">
                      Mantenimiento
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-sm text-gray-400 hover:text-[#C6A55C] transition-colors duration-300">
                      Tasación
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-sm text-gray-400 hover:text-[#C6A55C] transition-colors duration-300">
                      Seguros
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Newsletter Signup */}
              <div>
                <h3 className="text-lg font-medium mb-6">Newsletter</h3>
                <p className="text-sm text-gray-400 mb-4">
                  Suscríbete para recibir las últimas novedades y ofertas exclusivas.
                </p>
                <form className="space-y-4">
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="Tu email"
                      className="w-full bg-white/5 border border-gray-800 rounded-sm px-4 py-2.5 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-[#C6A55C] transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#C6A55C] text-white px-6 py-2.5 text-sm font-medium hover:bg-[#B69451] transition-colors duration-300"
                  >
                    Suscribirse
                  </button>
                </form>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="mt-16 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-sm text-gray-400">
                &copy; {new Date().getFullYear()} Berlin Jewels. Todos los derechos reservados.
              </p>
              <div className="flex space-x-6">
                <Link href="#" className="text-sm text-gray-400 hover:text-[#C6A55C] transition-colors duration-300">
                  Política de Privacidad
                </Link>
                <Link href="#" className="text-sm text-gray-400 hover:text-[#C6A55C] transition-colors duration-300">
                  Términos y Condiciones
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </MainLayout>
  )
} 
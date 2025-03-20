"use client"

import Image from "next/image"
import Link from "next/link"
import { ShoppingBag, Search, Menu, X, Eye } from "lucide-react"
import { useState, useRef, useEffect, Fragment } from "react"
import MainLayout from "../../components/MainLayout"
import FadeInOnScroll from '../../components/FadeInOnScroll'
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import { Dialog, Transition } from '@headlessui/react'
import ProductCard from '../../components/ProductCard'

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
}

// Sample products data
const sampleProducts: Product[] = [
  {
    id: '1',
    name: 'Pendientes Diamante "Luz Eterna"',
    price: 1999,
    category: 'Colección Premium',
    image: '/earrings/earring1.jpg',
  },
  {
    id: '2',
    name: 'Pendientes de Oro "Infinity"',
    price: 1499,
    category: 'Colección Royal',
    image: '/earrings/earring2.jpg',
  },
  // Add more products as needed
];

// Image Enhancement Styles
const imageEffects = {
  gold: "sepia(30%) hue-rotate(0deg) saturate(170%)",
  platinum: "brightness(112%) contrast(105%)",
  diamond: "brightness(125%) contrast(95%)",
  vintage: "sepia(15%) contrast(115%)"
}

// Custom styles for clip paths
const customStyles = `
  .clip-polygon-badge {
    clip-path: polygon(10% 0%, 90% 0%, 100% 50%, 90% 100%, 10% 100%, 0% 50%);
  }
`;

export default function PendientesPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { scrollProgress, showScrollTop, scrollToTop } = useScrollAnimation()
  const [products] = useState<Product[]>(sampleProducts)
  const [wishlist, setWishlist] = useState<string[]>([])
  const [showQuickView, setShowQuickView] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)
  const [showSizeGuide, setShowSizeGuide] = useState(false)
  const [showVideo, setShowVideo] = useState<string | null>(null)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const categories = [
    {
      name: "COLECCIONES",
      description: "Descubre nuestra exclusiva selección de joyas",
      featured: { name: "Nueva Colección Primavera", href: "/nueva-coleccion" },
      items: [
        { 
          name: "Anillos", 
          href: "/anillos",
          description: "Anillos de compromiso y alta joyería",
          image: "/cap1.jpg" 
        },
        { 
          name: "Collares", 
          href: "/collares",
          description: "Elegantes collares y gargantillas",
          image: "/cap2.jpg"
        },
        { 
          name: "Pulseras", 
          href: "/pulseras",
          description: "Pulseras artesanales exclusivas",
          image: "/cap3.jpg"
        },
        { 
          name: "Pendientes", 
          href: "/pendientes",
          description: "Pendientes para cada ocasión",
          image: "/cap4.jpg"
        }
      ],
    },
    {
      name: "OCASIONES",
      description: "El regalo perfecto para cada momento",
      featured: { name: "Colección Bodas 2024", href: "/bodas" },
      items: [
        { 
          name: "Bodas", 
          href: "/bodas",
          description: "Joyas para el día más especial",
          image: "/cap2.jpg"
        },
        { 
          name: "Compromiso", 
          href: "/compromiso",
          description: "Anillos de compromiso únicos",
          image: "/cap1.jpg"
        },
        { 
          name: "Regalos", 
          href: "/regalos",
          description: "Detalles inolvidables",
          image: "/cap4.jpg"
        },
        { 
          name: "Edición Limitada", 
          href: "/edicion-limitada",
          description: "Piezas exclusivas numeradas",
          image: "/cap3.jpg"
        }
      ],
    },
    {
      name: "MATERIALES",
      description: "La más alta calidad en cada material",
      featured: { name: "Colección Diamantes Rare", href: "/diamantes" },
      items: [
        { 
          name: "Oro 18k", 
          href: "/oro-18k",
          description: "Pureza y elegancia en oro",
          image: "/cap1.jpg"
        },
        { 
          name: "Platino", 
          href: "/platino",
          description: "El metal más noble y duradero",
          image: "/cap2.jpg"
        },
        { 
          name: "Diamantes", 
          href: "/diamantes",
          description: "Diamantes certificados GIA",
          image: "/cap3.jpg"
        },
        { 
          name: "Piedras Preciosas", 
          href: "/piedras-preciosas",
          description: "Gemas de excepcional calidad",
          image: "/cap4.jpg"
        }
      ],
    },
    {
      name: "SERVICIOS",
      description: "Experiencia personalizada de lujo",
      featured: { name: "Diseño a Medida", href: "/personalizacion" },
      items: [
        { 
          name: "Personalización", 
          href: "/personalizacion",
          description: "Diseños únicos a tu medida",
          image: "/cap4.jpg"
        },
        { 
          name: "Grabado", 
          href: "/grabado",
          description: "Mensajes eternos en tus joyas",
          image: "/cap3.jpg"
        },
        { 
          name: "Mantenimiento", 
          href: "/mantenimiento",
          description: "Cuidado experto de tus joyas",
          image: "/cap2.jpg"
        },
        { 
          name: "Tasación", 
          href: "/tasacion",
          description: "Valoración profesional certificada",
          image: "/cap1.jpg"
        }
      ],
    },
  ]

  // Event handlers
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

  // Effects
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
        {/* Header */}
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

          {/* Main Header Content */}
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

            {/* Navigation Menu */}
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
                      absolute left-0 mt-2 w-[480px] rounded-lg shadow-2xl 
                      bg-white ring-1 ring-black ring-opacity-5 
                      transition-all duration-300 ease-in-out
                      transform origin-top
                      ${activeDropdown === index 
                        ? "opacity-100 scale-100 translate-y-0 visible" 
                        : "opacity-0 scale-95 -translate-y-2 invisible"}
                    `}
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
                          >
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-br from-[#C6A55C]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover transition-all duration-300 group-hover:scale-105"
                                style={{
                                  filter: 
                                    item.name.toLowerCase().includes('oro') ? imageEffects.gold :
                                    item.name.toLowerCase().includes('platino') ? imageEffects.platinum :
                                    item.name.toLowerCase().includes('diamante') ? imageEffects.diamond :
                                    imageEffects.vintage
                                }}
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
                  </div>
                </div>
              ))}
            </nav>

            {/* Header Icons */}
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
                        src={`/earrings/earring${index + 1}.jpg`}
                        alt={`Luxury Earring Collection ${index + 1}`}
                        fill
                        className="object-cover rounded-[2rem]"
                        priority={index === 0}
                      />
                    </div>
                  ))}
                </div>

                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent rounded-[2rem] backdrop-blur-[1px] transition-all duration-500 hover:backdrop-blur-sm group">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#8B5A2B]/20 to-transparent rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                  
                  <div className="h-full w-full flex items-center justify-start relative z-10">
                    <div className="pl-8 md:pl-16 max-w-[95%] md:max-w-[70%] lg:max-w-[50%] space-y-3 md:space-y-5">
                      <div className="bg-white/95 text-black px-4 py-1.5 md:px-5 md:py-2 inline-block rounded-full text-[8px] md:text-sm font-light tracking-[0.3em] font-poppins">
                        COLECCIÓN DE PENDIENTES
                      </div>
                      <h1 className="text-base md:text-4xl lg:text-5xl font-poppins text-white leading-[1.4] md:leading-[1.5] tracking-wide drop-shadow-2xl">
                        <span className="block text-[#8B5A2B] font-light italic">Brillo Celestial</span>
                        <span className="block font-medium mt-2">Arte que Ilumina</span>
                      </h1>
                      <p className="text-[9px] md:text-base lg:text-lg text-white/95 font-light tracking-[0.2em] uppercase font-poppins max-w-2xl">
                        Diseños que realzan tu belleza natural
                      </p>
                      <div className="pt-3 md:pt-7 space-x-4">
                        <Link
                          href="#collection"
                          className="group/btn relative overflow-hidden bg-gradient-to-r from-[#8B5A2B] to-[#D7B377] text-white px-6 py-2 md:px-8 md:py-3 text-[8px] md:text-sm font-poppins tracking-widest transition-all duration-300 inline-block hover:from-[#D7B377] hover:to-[#8B5A2B] rounded-full shadow-lg hover:shadow-xl"
                        >
                          EXPLORAR COLECCIÓN
                        </Link>
                        <Link
                          href="#appointment"
                          className="group/btn relative overflow-hidden border border-white/90 text-white px-6 py-2 md:px-8 md:py-3 text-[8px] md:text-sm font-poppins tracking-widest transition-all duration-300 inline-block hover:bg-white hover:text-[#8B5A2B] rounded-full shadow-lg hover:shadow-xl"
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

          <section className="py-16 bg-[url('/pattern-organic.png')] bg-fixed bg-opacity-5">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto bg-white/90 backdrop-blur-sm p-8 md:p-12 rounded-3xl shadow-sm">
                <div className="flex flex-col md:flex-row items-center gap-12">
                  <div className="md:w-2/5">
                    <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden rounded-3xl">
                      <Image 
                        src="/earrings/earring2.jpg" 
                        alt="Colección de Pendientes" 
                        fill 
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      <div className="absolute bottom-6 left-6 right-6">
                        <h3 className="text-white text-xl md:text-2xl font-light italic">Brillo que Cautiva</h3>
                      </div>
                    </div>
                  </div>
                  <div className="md:w-3/5">
                    <h2 className="text-2xl md:text-3xl font-poppins text-[#1A1A1A] mb-4 relative inline-block">
                      <span className="relative z-10">Diseño Radiante</span>
                      <span className="absolute -bottom-2 left-0 h-[2px] w-24 bg-gradient-to-r from-[#8B5A2B] to-[#D7B377]"></span>
                    </h2>
                    <p className="text-gray-600 leading-relaxed my-6 font-light font-poppins">
                      Nuestros pendientes son joyas que iluminan tu rostro y realzan tu belleza natural. Cada pieza está diseñada pensando en el equilibrio perfecto entre elegancia y comodidad.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 flex items-center justify-center bg-[#F9F5F0] rounded-full p-2 mt-1">
                          <img src="/icons/diamond.png" alt="Calidad" className="w-6 h-6 opacity-90" />
                        </div>
                        <div>
                          <h3 className="text-base font-medium mb-1 text-[#1A1A1A]">Piedras Selectas</h3>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            Gemas de la más alta calidad y pureza.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 flex items-center justify-center bg-[#F9F5F0] rounded-full p-2 mt-1">
                          <img src="/icons/exclusive.png" alt="Artesanía" className="w-6 h-6 opacity-90" />
                        </div>
                        <div>
                          <h3 className="text-base font-medium mb-1 text-[#1A1A1A]">Ligereza Perfecta</h3>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            Diseños ligeros para máxima comodidad.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 flex items-center justify-center bg-[#F9F5F0] rounded-full p-2 mt-1">
                          <img src="/icons/warranty.png" alt="Garantía" className="w-6 h-6 opacity-90" />
                        </div>
                        <div>
                          <h3 className="text-base font-medium mb-1 text-[#1A1A1A]">Seguridad Total</h3>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            Sistemas de cierre seguros y confiables.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 flex items-center justify-center bg-[#F9F5F0] rounded-full p-2 mt-1">
                          <img src="/icons/diamond.png" alt="Calidad" className="w-6 h-6 opacity-90" />
                        </div>
                        <div>
                          <h3 className="text-base font-medium mb-1 text-[#1A1A1A]">Diseño Versátil</h3>
                          <p className="text-xs text-gray-600 leading-relaxed">
                            Estilos adaptables para cada ocasión.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="container mx-auto px-4 py-16">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-poppins text-[#1A1A1A] mb-3 relative inline-block">
                <span className="relative z-10">Nuestra Colección</span>
                <span className="absolute -bottom-2 left-0 right-0 mx-auto h-[3px] w-12 bg-[#9C27B0]"></span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto font-light font-poppins mt-6">
                Exploración audaz de formas y volúmenes que transforman la joyería en arte contemporáneo
              </p>
            </div>

            <div className="mb-12 flex flex-wrap gap-4 justify-center">
              <button className="px-6 py-2.5 rounded-full text-sm border-none text-white bg-gradient-to-r from-[#8B5A2B] to-[#D7B377] hover:from-[#D7B377] hover:to-[#8B5A2B] transition-all duration-300 font-poppins shadow-sm">
                Todos los Pendientes
              </button>
              <button className="px-6 py-2.5 rounded-full text-sm border border-[#D7B377] text-[#8B5A2B] hover:bg-[#F9F5F0] transition-all duration-300 font-poppins">
                Oro
              </button>
              <button className="px-6 py-2.5 rounded-full text-sm border border-[#D7B377] text-[#8B5A2B] hover:bg-[#F9F5F0] transition-all duration-300 font-poppins">
                Plata
              </button>
              <button className="px-6 py-2.5 rounded-full text-sm border border-[#D7B377] text-[#8B5A2B] hover:bg-[#F9F5F0] transition-all duration-300 font-poppins">
                Piedras
              </button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {[1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12].map((item) => (
                <FadeInOnScroll key={item} delay={item * 60}>
                  <div className="group relative">
                    {/* Product Image Container */}
                    <div className="
                      relative aspect-square 
                      overflow-hidden 
                      rounded-lg 
                      bg-gray-100
                      before:content-[''] 
                      before:absolute 
                      before:inset-0 
                      before:bg-gradient-to-br 
                      before:from-transparent 
                      before:to-[#9C27B0]/10
                      before:opacity-0
                      before:group-hover:opacity-100
                      before:transition-opacity
                      before:duration-300
                      before:z-10
                    ">
                      {/* Product Image */}
                      <Image
                        src={`/cap${(item % 4) + 1}.jpg`}
                        alt={`Pendientes "${item % 2 === 0 ? 'Hexágono' : 'Cubo Perfecto'}"`}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        quality={90}
                        loading="eager"
                        className="object-cover transition-all duration-700 group-hover:scale-110"
                        style={{
                          filter: item % 4 === 0 ? imageEffects.gold :
                                 item % 4 === 1 ? imageEffects.platinum :
                                 item % 4 === 2 ? imageEffects.diamond :
                                 imageEffects.vintage
                        }}
                      />
                      
                      {/* Quick View Overlay */}
                      <div className="
                        absolute inset-0 
                        bg-gradient-to-t from-black/60 to-black/20
                        flex flex-col items-center justify-end gap-4
                        opacity-0 transition-opacity duration-300
                        group-hover:opacity-100
                        z-20
                        pb-8
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
                            hover:bg-[#8B5A2B] hover:text-white
                            shadow-lg
                          "
                          aria-label="Vista rápida"
                        >
                          <Eye className="w-4 h-4" />
                          <span className="text-sm font-light">Vista Rápida</span>
                        </button>
                        <button 
                          className="
                            bg-gradient-to-r from-[#8B5A2B] to-[#D7B377] text-white
                            px-6 py-2
                            rounded-full
                            flex items-center gap-2
                            transform translate-y-4
                            transition-all duration-300
                            group-hover:translate-y-0
                            hover:from-[#D7B377] hover:to-[#8B5A2B]
                            shadow-lg
                          "
                          aria-label="Añadir al carrito"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          <span className="text-sm font-light">Añadir al Carrito</span>
                        </button>
                      </div>

                      {/* Sale Badge */}
                      {item % 3 === 0 && (
                        <div className="absolute top-4 left-4 bg-[#8B5A2B] text-white px-3 py-1 text-xs font-medium rounded-full z-20 shadow-md">
                          -20%
                        </div>
                      )}

                      {/* New Badge */}
                      {item % 4 === 0 && (
                        <div className="absolute top-4 right-4 bg-gradient-to-r from-[#8B5A2B] to-[#D7B377] text-white px-3 py-1 text-xs font-medium rounded-full z-20 shadow-md">
                          Nuevo
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="mt-4 space-y-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <Link href="#" className="group/title">
                            <h3 className="text-sm font-medium text-gray-900 group-hover/title:text-[#9C27B0] transition-colors duration-300">
                              Pendientes "{item % 2 === 0 ? 'Hexágono' : 'Cubo Perfecto'}"
                            </h3>
                            <p className="text-xs text-gray-500">Colección {item % 3 === 0 ? 'Geométrica' : 'Minimal'}</p>
                          </Link>
                        </div>
                        <button 
                          className="
                            p-2 rounded-full 
                            text-gray-400 
                            hover:text-[#9C27B0] 
                            transition-colors duration-300
                            relative
                          "
                          aria-label="Añadir a favoritos"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-baseline gap-2">
                          {item % 3 === 0 ? (
                            <>
                              <p className="text-sm font-medium text-gray-900">
                                3.999 €
                              </p>
                              <p className="text-xs text-gray-500 line-through">
                                4.999 €
                              </p>
                            </>
                          ) : (
                            <p className="text-sm font-medium text-gray-900">
                              4.999 €
                            </p>
                          )}
                        </div>
                        <div className="flex items-center">
                          <div className="flex text-[#9C27B0]">
                            {[...Array(5)].map((_, i) => (
                              <svg key={i} className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                              </svg>
                            ))}
                          </div>
                          <span className="ml-1 text-xs text-gray-500">(24)</span>
                        </div>
                      </div>

                      {/* Stock Status */}
                      {item % 5 === 0 ? (
                        <p className="text-xs text-red-500">Solo quedan 2 unidades</p>
                      ) : (
                        <p className="text-xs text-green-600">En stock</p>
                      )}
                    </div>

                    {/* Quick Add Button - Mobile Only */}
                    <button 
                      className="
                        md:hidden
                        absolute bottom-4 right-4
                        w-10 h-10
                        bg-[#9C27B0] text-white
                        rounded-full
                        flex items-center justify-center
                        shadow-lg
                        transform translate-y-12 opacity-0
                        group-hover:translate-y-0 group-hover:opacity-100
                        transition-all duration-300
                      "
                    >
                      <ShoppingBag className="w-5 h-5" />
                    </button>
                  </div>
                </FadeInOnScroll>
              ))}
            </div>
          </div>
        </main>

        {/* Personalized Consultation section */}
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
                  Nuestros expertos en joyería te guiarán en la elección del pendiente perfecto que refleje tu estilo único
                </p>
                
                <Link
                  href="/consulta"
                  className="group inline-flex items-center gap-2 bg-gradient-to-r from-[#8B5A2B] to-[#D7B377] text-white px-8 py-3 text-sm font-poppins tracking-wider hover:from-[#D7B377] hover:to-[#8B5A2B] transition-all duration-300 rounded-full shadow-lg hover:shadow-xl"
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
                        "Una experiencia excepcional. El asesoramiento personalizado me ayudó a encontrar los pendientes perfectos para mi boda."
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

        {/* Footer */}
        <footer className="bg-black text-white py-16 mt-16 border-t border-[#9C27B0]/20">
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
                    className="text-gray-400 hover:text-[#8B5A2B] transition-colors duration-300"
                    aria-label="Instagram"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
                    </svg>
                  </Link>
                  <Link 
                    href="#" 
                    className="text-gray-400 hover:text-[#8B5A2B] transition-colors duration-300"
                    aria-label="Facebook"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                    </svg>
                  </Link>
                  <Link 
                    href="#" 
                    className="text-gray-400 hover:text-[#8B5A2B] transition-colors duration-300"
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
                    <Link href="/anillos" className="text-sm text-gray-400 hover:text-[#8B5A2B] transition-colors duration-300">
                      Anillos
                    </Link>
                  </li>
                  <li>
                    <Link href="/collares" className="text-sm text-gray-400 hover:text-[#8B5A2B] transition-colors duration-300">
                      Collares
                    </Link>
                  </li>
                  <li>
                    <Link href="/pulseras" className="text-sm text-gray-400 hover:text-[#8B5A2B] transition-colors duration-300">
                      Pulseras
                    </Link>
                  </li>
                  <li>
                    <Link href="/pendientes" className="text-sm text-gray-400 hover:text-[#8B5A2B] transition-colors duration-300">
                      Pendientes
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-6">Servicios</h3>
                <ul className="space-y-4">
                  <li>
                    <Link href="#" className="text-sm text-gray-400 hover:text-[#8B5A2B] transition-colors duration-300">
                      Personalización
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-sm text-gray-400 hover:text-[#8B5A2B] transition-colors duration-300">
                      Mantenimiento
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-sm text-gray-400 hover:text-[#8B5A2B] transition-colors duration-300">
                      Tasación
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-sm text-gray-400 hover:text-[#8B5A2B] transition-colors duration-300">
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
                      className="w-full bg-white/5 border border-gray-800 rounded-sm px-4 py-2.5 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-[#8B5A2B] transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#8B5A2B] to-[#D7B377] text-white px-6 py-2.5 text-sm font-medium hover:from-[#D7B377] hover:to-[#8B5A2B] transition-colors duration-300 rounded-full"
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
                <Link href="#" className="text-sm text-gray-400 hover:text-[#8B5A2B] transition-colors duration-300">
                  Política de Privacidad
                </Link>
                <Link href="#" className="text-sm text-gray-400 hover:text-[#8B5A2B] transition-colors duration-300">
                  Términos y Condiciones
                </Link>
              </div>
            </div>
          </div>
        </footer>

        {/* Video Modal */}
        <Transition show={!!showVideo} as={Fragment}>
          <Dialog onClose={() => setShowVideo(null)} className="relative z-50">
            <Transition.Child
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black/80" />
            </Transition.Child>

            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Transition.Child
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="relative bg-black rounded-lg overflow-hidden">
                  <button
                    onClick={() => setShowVideo(null)}
                    className="absolute top-4 right-4 text-white/80 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <video
                    src={showVideo || ''}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="max-w-4xl w-full aspect-video"
                  />
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>

        {/* Size Guide Modal */}
        <Transition show={showSizeGuide} as={Fragment}>
          <Dialog onClose={() => setShowSizeGuide(false)} className="relative z-50">
            {/* ... Size guide modal content ... */}
          </Dialog>
        </Transition>
      </div>
    </MainLayout>
  )
} 
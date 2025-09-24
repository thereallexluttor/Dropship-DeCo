"use client"

import Image from "next/image"
import Link from "next/link" 
import { ShoppingBag, Search, Home as HomeIcon, User, ShoppingCart, Info, MapPin } from "lucide-react"
import { useState, useEffect } from "react"
import PageTransition from "./components/PageTransition"
import MainLayout from "./components/MainLayout"
import ProductCard from "./components/ProductCard"
import FadeInOnScroll from './components/FadeInOnScroll'

export default function Home() {
  const [activeSlide, setActiveSlide] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((current) => (current === 3 ? 0 : current + 1));
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Searching for:", searchQuery)
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-white">
        {/* Promotional Banner */}
        <div className="bg-green-500 text-white py-1 overflow-hidden">
          <div className="animate-scroll whitespace-nowrap text-sm font-bold" style={{ animationDuration: '40s' }}>
            <span className="inline-block mr-8">Descuentos en la linea para gatos, - Disfruta las ofertas que tenemos hoy para ti!</span>
            <span className="inline-block mr-8">Descuentos en la linea para gatos, - Disfruta las ofertas que tenemos hoy para ti!</span>
            <span className="inline-block mr-8">Descuentos en la linea para gatos, - Disfruta las ofertas que tenemos hoy para ti!</span>
            <span className="inline-block mr-8">Descuentos en la linea para gatos, - Disfruta las ofertas que tenemos hoy para ti!</span>
          </div>
        </div>

        <header className="w-full bg-white border-b border-gray-200">
          {/* Mobile Header (< 640px) */}
          <div className="md:hidden">
            <div className="container mx-auto px-4 py-3">
              {/* Top Row: Logo and Essential Actions */}
              <div className="flex items-center justify-between mb-3">
                <Link href="/" className="flex items-center">
                  <Image
                    src="/unisantander.png"
                    alt="Logo Unisantander"
                    width={120}
                    height={30}
                    className="w-auto h-6 sm:h-7"
                  />
                </Link>
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-5 w-5 text-gray-500">
                      <ShoppingCart className="h-full w-full" />
                    </div>
                    <span className="text-xs text-gray-500 mt-1">Carrito</span>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <div className="h-5 w-5 text-gray-500">
                      <User className="h-full w-full" />
                    </div>
                    <span className="text-xs text-gray-500 mt-1">Cuenta</span>
                  </div>
                </div>
              </div>
              
              {/* Search Bar */}
              <div className="w-full">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar productos..."
                    className="w-full h-10 px-4 pr-10 rounded-[15px] bg-gray-100 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm border-2 border-gray-200"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                  >
                    <Search className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Tablet Header (640px - 1023px) */}
          <div className="hidden md:block lg:hidden">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center flex-shrink-0">
                  <Image
                    src="/unisantander.png"
                    alt="Logo Unisantander"
                    width={150}
                    height={38}
                    className="w-auto h-8"
                  />
                </Link>

                {/* Search Bar */}
                <div className="flex-1 max-w-sm mx-4">
                  <form onSubmit={handleSearch} className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar productos..."
                      className="w-full h-10 px-4 pr-10 rounded-[15px] bg-gray-100 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm border-2 border-gray-200"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      <Search className="h-5 w-5" />
                    </button>
                  </form>
                </div>

                {/* Navigation Icons */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <div className="flex items-center space-x-1">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-4 w-4 text-gray-500">
                        <HomeIcon className="h-full w-full" />
                      </div>
                      <span className="text-xs text-gray-500 mt-1">Inicio</span>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-4 w-4 text-gray-500">
                        <ShoppingBag className="h-full w-full" />
                      </div>
                      <span className="text-xs text-gray-500 mt-1">Tienda</span>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-4 w-4 text-gray-500">
                        <ShoppingCart className="h-full w-full" />
                      </div>
                      <span className="text-xs text-gray-500 mt-1">Carrito</span>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-4 w-4 text-gray-500">
                        <User className="h-full w-full" />
                      </div>
                      <span className="text-xs text-gray-500 mt-1">Cuenta</span>
                    </div>
                  </div>
                  <div className="w-[1px] h-6 bg-gray-200"></div>
                  <div className="flex items-center space-x-1">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-4 w-4 text-gray-500">
                        <Info className="h-full w-full" />
                      </div>
                      <span className="text-xs text-gray-500 mt-1">Info</span>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-4 w-4 text-gray-500">
                        <MapPin className="h-full w-full" />
                      </div>
                      <span className="text-xs text-gray-500 mt-1">Tiendas</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Large Tablet Header (1024px - 1279px) */}
          <div className="hidden lg:block xl:hidden">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center flex-shrink-0">
                  <Image
                    src="/unisantander.png"
                    alt="Logo Unisantander"
                    width={170}
                    height={43}
                    className="w-auto h-9"
                  />
                </Link>

                {/* Search Bar */}
                <div className="flex-1 max-w-md mx-6">
                  <form onSubmit={handleSearch} className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar productos..."
                      className="w-full h-10 px-4 pr-10 rounded-[15px] bg-gray-100 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm border-2 border-gray-200"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      <Search className="h-5 w-5" />
                    </button>
                  </form>
                </div>

                {/* Navigation Icons */}
                <div className="flex items-center space-x-3 flex-shrink-0">
                  <div className="flex items-center space-x-2">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-4 w-4 text-gray-500">
                        <HomeIcon className="h-full w-full" />
                      </div>
                      <span className="text-xs text-gray-500 mt-1">Inicio</span>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-4 w-4 text-gray-500">
                        <ShoppingBag className="h-full w-full" />
                      </div>
                      <span className="text-xs text-gray-500 mt-1">Tienda</span>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-4 w-4 text-gray-500">
                        <ShoppingCart className="h-full w-full" />
                      </div>
                      <span className="text-xs text-gray-500 mt-1">Carrito</span>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-4 w-4 text-gray-500">
                        <User className="h-full w-full" />
                      </div>
                      <span className="text-xs text-gray-500 mt-1">Cuenta</span>
                    </div>
                  </div>
                  <div className="w-[1px] h-6 bg-gray-200"></div>
                  <div className="flex items-center space-x-2">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-4 w-4 text-gray-500">
                        <Info className="h-full w-full" />
                      </div>
                      <span className="text-xs text-gray-500 mt-1">Info</span>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-4 w-4 text-gray-500">
                        <MapPin className="h-full w-full" />
                      </div>
                      <span className="text-xs text-gray-500 mt-1">Tiendas</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Header (≥ 1280px) */}
          <div className="hidden xl:block">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center flex-shrink-0">
                  <Image
                    src="/unisantander.png"
                    alt="Logo Unisantander"
                    width={200}
                    height={50}
                    className="w-auto h-12"
                  />
                </Link>

                {/* Search Bar */}
                <div className="flex-1 max-w-lg mx-8">
                  <form onSubmit={handleSearch} className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Busca el producto o categoria de tu preferencia..."
                      className="w-full h-10 px-4 pr-10 rounded-[15px] bg-gray-100 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm border-2 border-gray-200"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      <Search className="h-5 w-5" />
                    </button>
                  </form>
                </div>

                {/* Navigation Icons */}
                <div className="flex items-center space-x-4 flex-shrink-0">
                  <div className="flex items-center space-x-3">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-4 w-4 text-gray-500">
                        <HomeIcon className="h-full w-full" />
                      </div>
                      <span className="text-xs text-gray-500 mt-1">Inicio</span>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-4 w-4 text-gray-500">
                        <ShoppingBag className="h-full w-full" />
                      </div>
                      <span className="text-xs text-gray-500 mt-1">Tienda</span>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-4 w-4 text-gray-500">
                        <ShoppingCart className="h-full w-full" />
                      </div>
                      <span className="text-xs text-gray-500 mt-1">Carrito</span>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-4 w-4 text-gray-500">
                        <User className="h-full w-full" />
                      </div>
                      <span className="text-xs text-gray-500 mt-1">Tu Cuenta</span>
                    </div>
                  </div>
                  <div className="w-[1.5px] h-5 bg-gray-200"></div>
                  <div className="flex items-center space-x-3">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-4 w-4 text-gray-500">
                        <Info className="h-full w-full" />
                      </div>
                      <span className="text-xs text-gray-500 mt-1">Sobre Nosotros</span>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-4 w-4 text-gray-500">
                        <MapPin className="h-full w-full" />
                      </div>
                      <span className="text-xs text-gray-500 mt-1">Nuestras Tiendas</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Navigation */}
          <div className="border-t border-gray-200 bg-white">
            <div className="container mx-auto px-4">
              <nav className="flex justify-center space-x-4 sm:space-x-6 lg:space-x-8 py-3 overflow-x-auto scrollbar-hide">
                <Link href="#" className="text-xs sm:text-sm font-bold text-gray-600 whitespace-nowrap px-2 py-1 hover:text-green-600 transition-colors">Perro</Link>
                <Link href="#" className="text-xs sm:text-sm font-bold text-gray-600 whitespace-nowrap px-2 py-1 hover:text-green-600 transition-colors">Gato</Link>
                <Link href="#" className="text-xs sm:text-sm font-bold text-gray-600 whitespace-nowrap px-2 py-1 hover:text-green-600 transition-colors">Animales pequeños</Link>
                <Link href="#" className="text-xs sm:text-sm font-bold text-gray-600 whitespace-nowrap px-2 py-1 hover:text-green-600 transition-colors">Aves</Link>
                <Link href="#" className="text-xs sm:text-sm font-bold text-gray-600 whitespace-nowrap px-2 py-1 hover:text-green-600 transition-colors">Bovinos</Link>
                <Link href="#" className="text-xs sm:text-sm font-bold text-gray-600 whitespace-nowrap px-2 py-1 hover:text-green-600 transition-colors">Equinos</Link>
                <Link href="#" className="text-xs sm:text-sm font-bold text-gray-600 whitespace-nowrap px-2 py-1 hover:text-green-600 transition-colors">Peces</Link>
                <Link href="#" className="text-xs sm:text-sm font-bold text-gray-600 whitespace-nowrap px-2 py-1 hover:text-green-600 transition-colors">Salud animal</Link>
                <Link href="#" className="text-xs sm:text-sm font-bold text-gray-600 whitespace-nowrap px-2 py-1 hover:text-green-600 transition-colors">Ofertas</Link>
                <Link href="#" className="text-xs sm:text-sm font-bold text-gray-600 whitespace-nowrap px-2 py-1 hover:text-green-600 transition-colors">Novedades</Link>
              </nav>
            </div>
          </div>

        </header>

        <main>
          <section className="relative w-full pt-8">
            <div className="container mx-auto px-4">
              <div className="relative aspect-[21/9] w-full">
                {/* Carousel */}
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

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent rounded-lg backdrop-blur-[2px] transition-all duration-500 hover:backdrop-blur-sm group">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#C6A55C]/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                  
                  {/* Diamond icon */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative">
                      <svg 
                        className="w-24 h-24 md:w-32 md:h-32 text-[#C6A55C] opacity-10" 
                        viewBox="0 0 24 24" 
                        fill="currentColor"
                      >
                        <path d="M12,2L1,12L12,22L23,12L12,2M12,4.3L19.7,12L12,19.7L4.3,12L12,4.3Z"/>
                      </svg>
                    </div>
                  </div>

                  <div className="h-full w-full flex items-center justify-center relative z-10">
                    <div className="text-center w-full max-w-[95%] md:max-w-[80%] lg:max-w-[60%] space-y-1 md:space-y-3 transform transition-all duration-500 hover:scale-105">
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
              <h2 className="text-3xl font-sans text-black text-center mb-12">Joyas Destacadas</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                {[1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12].map((item) => (
                  <FadeInOnScroll key={item} delay={item * 100}>
                    <ProductCard product={{ id: item.toString(), name: `Anillo Diamante "Eternidad"`, price: 4.999, category: "Colección Royal", image: "/placeholder.svg" }} />
                  </FadeInOnScroll>
                ))}
              </div>
            </div>
          </section>

          <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/3 relative aspect-square">
                <Image
                  src="/berlin4k.jpg"
                  alt="About Berlin Jewels"
                  fill
                  className="object-cover rounded-lg shadow-lg"
                />
              </div>
              <div className="md:w-2/3 md:pl-10">
                <h2 className="text-2xl font-sans text-black mb-4">Nuestra Historia</h2>
                <p className="text-sm text-black/80 mb-6 font-sans leading-relaxed">
                  Desde 1920, Berlin Jewels ha sido sinónimo de elegancia y artesanía excepcional. Cada pieza que creamos es un testimonio de nuestra dedicación a la excelencia y nuestra pasión por la joyería fina.
                </p>
                <Link
                  href="#"
                  className="inline-block text-xs tracking-wider py-2 px-6 text-black border-b border-black/40 hover:border-black transition-all duration-300 font-sans"
                >
                  Descubrir Más
                </Link>
              </div>
            </div>
          </section>
        </main>

        <footer className="bg-black text-white py-12 border-t border-gold/20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-xl font-bold mb-4">Shop</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="hover:text-gold transition-colors">
                      Men
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-gold transition-colors">
                      Women
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-gold transition-colors">
                      Accessories
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-gold transition-colors">
                      New Arrivals
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">About</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="hover:text-gold transition-colors">
                      Our Story
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-gold transition-colors">
                      Careers
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-gold transition-colors">
                      Press
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-gold transition-colors">
                      Sustainability
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">Customer Care</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="hover:text-gold transition-colors">
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-gold transition-colors">
                      Shipping & Returns
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-gold transition-colors">
                      Size Guide
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-gold transition-colors">
                      FAQ
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">Connect</h3>
                <div className="flex space-x-4">
                  <Link href="#" className="text-white hover:text-gold transition-colors">
                    <span className="sr-only">Facebook</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>
                  <Link href="#" className="text-white hover:text-gold transition-colors">
                    <span className="sr-only">Instagram</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </Link>
                  <Link href="#" className="text-white hover:text-gold transition-colors">
                    <span className="sr-only">Twitter</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
            <div className="mt-12 border-t border-gray-800 pt-8 flex justify-between items-center">
              <p className="text-sm">&copy; 2023 Berlin Jewels. All rights reserved.</p>
              <div className="flex space-x-6">
                <Link href="#" className="text-sm hover:text-gold transition-colors">
                  Privacy Policy
                </Link>
                <Link href="#" className="text-sm hover:text-gold transition-colors">
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

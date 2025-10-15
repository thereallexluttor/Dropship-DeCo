"use client"

import Image from "next/image"
import Link from "next/link"
import {
  ShoppingBag,
  Search,
  Home as HomeIcon,
  User,
  ShoppingCart,
  Info,
  MapPin,
  Menu,
  Dog,
  Cat,
  Rabbit,
  Bird,
  Beef,
  Fish,
  HeartPulse,
  Tag,
  Sparkles,
  Eye,
  EyeOff,
  Check,
  Plus,
  Minus,
  Trash2
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetOverlay,
} from "@/components/ui/sheet"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import MainLayout from "../components/MainLayout"
import CategoryDropdown from "../components/CategoryDropdown"
import AccountPopover from "../components/AccountPopover"
import AccountPopoverContent from "../components/AccountPopoverContent"
import { useCategories } from "../hooks/useCategories"
import { useCart } from "../contexts/CartContext"
import CartCounter from "../components/CartCounter"
import ProductSizeBadges from "../components/ProductSizeBadges"

export default function CarritoPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isAccountDrawerOpen, setIsAccountDrawerOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Usar el contexto del carrito
  const { items, updateQuantity, removeFromCart, getTotalItems, getTotalPrice, clearCart } = useCart()

  // Usar el hook personalizado para cargar categorías dinámicamente
  const { categories, isLoading: categoriesLoading, error: categoriesError } = useCategories()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Searching for:", searchQuery)
  }

  // Crear categorías con datos reales de Supabase
  const processedCategories = categories.map(category => ({
    name: category.name,
    href: category.href,
    subcategories: category.subcategories?.map(sub => ({
      name: sub.name,
      href: sub.href
    })) || [],
    promotions: category.promotions || [],
    brands: category.brands || [],
    bannerImage: category.bannerImage || { src: "/placeholder.jpg", alt: category.name, href: "#" }
  }));

  const navLinks = [
    { name: "Inicio", icon: HomeIcon, href: "/" },
    { name: "Tienda", icon: ShoppingBag, href: "/tienda" },
    { name: "Carrito", icon: ShoppingCart, href: "/carrito" },
    { name: "Cuenta", icon: User, href: "#" },
    { name: "Info", icon: Info, href: "/sobre-nosotros" },
    { name: "Tiendas", icon: MapPin, href: "#nuestras-tiendas" },
  ];

  // Account Popover Content Component
  const AccountContent = () => (
    <div className="w-[200px] xs:w-[220px] sm:w-[240px] md:w-[260px] lg:w-[280px] xl:w-[300px] space-y-2 xs:space-y-2.5 sm:space-y-3 md:space-y-3 lg:space-y-4 xl:space-y-5 bg-[#FCFFEF] p-2 xs:p-2.5 sm:p-3 md:p-3.5 lg:p-4 xl:p-5 rounded-lg max-h-[80vh] overflow-y-auto border border-gray-200/60 shadow-sm">
      {/* Ya soy cliente */}
      <div>

        <form className="space-y-2 md:space-y-2.5" onSubmit={(e) => e.preventDefault()}>
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-2.5 md:px-3 py-1.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#196428] bg-white text-xs md:text-sm"
            />
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-2.5 md:px-3 py-1.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#196428] bg-white text-xs md:text-sm pr-8"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 md:right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="h-3.5 w-3.5 md:h-4 md:w-4" /> : <Eye className="h-3.5 w-3.5 md:h-4 md:w-4" />}
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-[#196428] hover:bg-[#145020] text-white font-semibold py-1.5 rounded-full transition-colors text-xs md:text-sm"
          >
            Iniciar sesión
          </button>
        </form>
        <div className="mt-2 md:mt-2.5 text-center">
          <a href="#" className="text-[#196428] hover:underline text-[9px] md:text-xs font-medium">
            Olvidé mi contraseña
          </a>
        </div>
        <div className="mt-2 md:mt-2.5 text-[8px] md:text-[10px] text-gray-600 text-center leading-tight">
          Protegido por reCAPTCHA - <a href="#" className="underline">Privacidad</a> y{' '}
          <a href="#" className="underline">Condiciones</a>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-300"></div>

      {/* Nuevo aquí */}
      <div>
        <h2 className="text-[10px] xs:text-xs sm:text-sm md:text-sm lg:text-base font-bold text-gray-800 mb-1.5 md:mb-2">
          ¿Nuevo aquí?
        </h2>
        <p className="text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs text-gray-700 mb-1.5 md:mb-2">
          ¡Disfruta de beneficios exclusivos!
        </p>
        <ul className="space-y-1 md:space-y-1.5 mb-2 md:mb-3">
          <li className="flex items-start gap-1.5 md:gap-2">
            <Check className="h-3 w-3 md:h-3.5 md:w-3.5 text-[#196428] flex-shrink-0 mt-0.5" />
            <span className="text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs text-gray-700 leading-tight">
              Compras más <span className="font-bold">rápidas</span>
            </span>
          </li>
          <li className="flex items-start gap-1.5 md:gap-2">
            <Check className="h-3 w-3 md:h-3.5 md:w-3.5 text-[#196428] flex-shrink-0 mt-0.5" />
            <span className="text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs text-gray-700 leading-tight">
              <span className="font-bold">Historial</span> de pedidos
            </span>
          </li>
          <li className="flex items-start gap-1.5 md:gap-2">
            <Check className="h-3 w-3 md:h-3.5 md:w-3.5 text-[#196428] flex-shrink-0 mt-0.5" />
            <span className="text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs text-gray-700 leading-tight">
              <span className="font-bold">Descuentos</span> exclusivos
            </span>
          </li>
          <li className="flex items-start gap-1.5 md:gap-2">
            <Check className="h-3 w-3 md:h-3.5 md:w-3.5 text-[#196428] flex-shrink-0 mt-0.5" />
            <span className="text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs text-gray-700 leading-tight">
              <span className="font-bold">Lista</span> de deseos
            </span>
          </li>
        </ul>
        <button
          type="button"
          className="w-full bg-[#196428] hover:bg-[#145020] text-white font-semibold py-1.5 md:py-2 rounded-full transition-colors text-[9px] xs:text-[10px] sm:text-xs md:text-xs"
        >
          Regístrate ahora
        </button>
      </div>
    </div>
  );

  const formatPrice = (precio: number | string) => {
    const numPrecio = typeof precio === 'string'
      ? parseFloat(precio.replace(/\./g, '').replace(',', '.'))
      : Number(precio)

    return numPrecio.toLocaleString('es-CO')
  }

  return (
    <MainLayout>
      <div className="min-h-screen" style={{ backgroundColor: '#FCFFEF' }}>
        {/* Promotional Banner */}
        <div className="bg-[#196428] text-white py-1 overflow-hidden">
          <div className="animate-scroll whitespace-nowrap text-sm font-bold" style={{ animationDuration: '40s' }}>
            <span className="inline-block mr-8">Descuentos en la linea para gatos, - Disfruta las ofertas que tenemos hoy para ti!</span>
            <span className="inline-block mr-8">Descuentos en la linea para gatos, - Disfruta las ofertas que tenemos hoy para ti!</span>
            <span className="inline-block mr-8">Descuentos en la linea para gatos, - Disfruta las ofertas que tenemos hoy para ti!</span>
            <span className="inline-block mr-8">Descuentos en la linea para gatos, - Disfruta las ofertas que tenemos hoy para ti!</span>
          </div>
        </div>

        <header className="w-full border-b border-gray-200 relative z-50" style={{ backgroundColor: '#FCFFEF' }}>
          {/* Mobile Header (< 640px) */}
          <div className="md:hidden">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <Link href="/" className="flex items-center flex-shrink-0">
                  <Image
                    src="/unisantander.png"
                    alt="Logo Unisantander"
                    width={100}
                    height={25}
                    className="w-auto h-6 sm:h-7"
                  />
                </Link>

                <div className="flex-1 w-full max-w-xs">
                  <form onSubmit={handleSearch} className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar..."
                      className="w-full h-9 px-3 pr-8 rounded-[15px] bg-gray-100 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#196428] text-sm border-2 border-gray-200"
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                    >
                      <Search className="h-4 w-4" />
                    </button>
                  </form>
                </div>

                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <button className="p-2 -mr-2">
                      <Menu className="h-6 w-6 text-gray-700" />
                    </button>
                  </SheetTrigger>
                  <SheetOverlay className="z-[100] bg-black/40" />
                  <SheetContent side="right" className="w-[80%] max-w-[300px] overflow-y-auto z-[101]">
                    <SheetHeader>
                      <SheetTitle className="text-lg font-bold">Menú</SheetTitle>
                    </SheetHeader>
                    <div className="mt-8 flex flex-col gap-6">
                      <div>
                        <h3 className="mb-2 text-sm font-semibold text-gray-500 px-2">Categorías</h3>
                        <nav className="flex flex-col gap-1">
                          {processedCategories.map((category) => (
                            <Link key={category.name} href={category.href} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                              <span className="text-sm font-bold text-gray-800">{category.name}</span>
                            </Link>
                          ))}
                        </nav>
                      </div>
                      <div className="border-t border-gray-200 -mx-6"></div>
                      <nav className="flex flex-col gap-1">
                        {navLinks.map((link) => {
                          if (link.name === "Inicio") {
                            return (
                              <Link key={link.name} href={link.href} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                <link.icon className="h-5 w-5 text-gray-500" />
                                <span className="text-sm font-medium text-gray-500">{link.name}</span>
                              </Link>
                            );
                          }
                          if (link.name === "Carrito") {
                            return (
                              <Link key={link.name} href={link.href} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                <div className="h-5 w-5 text-[#196428]">
                                  <CartCounter />
                                </div>
                                <span className="text-sm font-medium text-[#196428]">{link.name}</span>
                              </Link>
                            );
                          }
                          if (link.name === "Cuenta") {
                            return (
                              <button
                                key={link.name}
                                onClick={() => {
                                  setIsMobileMenuOpen(false);
                                  setTimeout(() => setIsAccountDrawerOpen(true), 300);
                                }}
                                className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 transition-colors text-left w-full"
                              >
                                <link.icon className="h-5 w-5 text-gray-600" />
                                <span className="text-sm font-medium text-gray-800">{link.name}</span>
                              </button>
                            );
                          }
                          if (link.name === "Tiendas" || link.name === "Info") {
                            return (
                              <Link
                                key={link.name}
                                href={link.href}
                                className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                <link.icon className="h-5 w-5 text-gray-600" />
                                <span className="text-sm font-medium text-gray-800">{link.name === "Info" ? "Sobre Nosotros" : link.name}</span>
                              </Link>
                            );
                          }
                          return (
                            <Link key={link.name} href={link.href} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                              <link.icon className="h-5 w-5 text-gray-600" />
                              <span className="text-sm font-medium text-gray-800">{link.name}</span>
                            </Link>
                          );
                        })}
                      </nav>
                    </div>
                  </SheetContent>
                </Sheet>
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
                      className="w-full h-10 px-4 pr-10 rounded-[15px] bg-gray-100 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#196428] text-sm border-2 border-gray-200"
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
                    <Link href="/" className="group flex flex-col items-center justify-center cursor-pointer">
                      <div className="h-4 w-4 text-gray-500 transition-colors">
                        <HomeIcon className="h-full w-full" />
                      </div>
                      <span className="text-xs font-light text-gray-500 mt-1 transition-colors">Inicio</span>
                    </Link>
                    <Link href="/tienda" className="group flex flex-col items-center justify-center cursor-pointer">
                      <div className="h-4 w-4 text-gray-500 group-hover:text-[#196428] transition-colors">
                        <ShoppingBag className="h-full w-full" />
                      </div>
                          <span className="text-xs font-light text-gray-500 mt-1 group-hover:text-[#196428] transition-colors">Tienda</span>
                    </Link>
                    <Link href="/carrito" className="group flex flex-col items-center justify-center cursor-pointer">
                      <div className="h-4 w-4 text-[#196428] transition-colors">
                        <CartCounter />
                      </div>
                          <span className="text-xs font-light text-[#196428] mt-1 transition-colors">Carrito</span>
                    </Link>
                    <AccountPopover />
                  </div>
                  <div className="w-[1px] h-6 bg-gray-200"></div>
                  <div className="flex items-center space-x-1">
                    <Link href="/sobre-nosotros" className="group flex flex-col items-center justify-center cursor-pointer">
                      <div className="h-4 w-4 text-gray-500 group-hover:text-[#196428] transition-colors">
                        <Info className="h-full w-full" />
                      </div>
                          <span className="text-xs font-light text-gray-500 mt-1 group-hover:text-[#196428] transition-colors">Info</span>
                    </Link>
                    <a href="#nuestras-tiendas" className="group flex flex-col items-center justify-center">
                      <div className="h-4 w-4 text-gray-500 group-hover:text-[#196428] transition-colors">
                        <MapPin className="h-full w-full" />
                      </div>
                          <span className="text-xs font-light text-gray-500 mt-1 group-hover:text-[#196428] transition-colors">Tiendas</span>
                    </a>
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
                <Link href="/" className="flex items-center flex-shrink-0 ml-[150px] xl:ml-[150px] 2xl:ml-[180px]">
                  <Image
                    src="/unisantander.png"
                    alt="Logo Unisantander"
                    width={200}
                    height={50}
                    className="w-auto h-12"
                  />
                </Link>

                {/* Search Bar */}
                <div className="flex-1 max-w-lg mx-8 ml-[70px]">
                  <form onSubmit={handleSearch} className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Busca el producto o categoria de tu preferencia..."
                      className="w-full h-10 px-4 pr-10 rounded-[15px] bg-gray-100 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#196428] text-sm border-2 border-gray-200"
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
                    <Link href="/" className="group flex flex-col items-center justify-center cursor-pointer">
                      <div className="h-4 w-4 text-gray-500 transition-colors">
                        <HomeIcon className="h-full w-full" />
                      </div>
                      <span className="text-xs font-light text-gray-500 mt-1 transition-colors">Inicio</span>
                    </Link>
                    <Link href="/tienda" className="group flex flex-col items-center justify-center cursor-pointer">
                      <div className="h-4 w-4 text-gray-500 group-hover:text-[#196428] transition-colors">
                        <ShoppingBag className="h-full w-full" />
                      </div>
                          <span className="text-xs font-light text-gray-500 mt-1 group-hover:text-[#196428] transition-colors">Tienda</span>
                    </Link>
                    <Link href="/carrito" className="group flex flex-col items-center justify-center cursor-pointer">
                      <div className="h-4 w-4 text-[#196428] transition-colors">
                        <CartCounter />
                      </div>
                          <span className="text-xs font-light text-[#196428] mt-1 transition-colors">Carrito</span>
                    </Link>
                    <AccountPopover />
                  </div>
                  <div className="w-[1.5px] h-5 bg-gray-200"></div>
                  <div className="flex items-center space-x-3">
                    <Link href="/sobre-nosotros" className="group flex flex-col items-center justify-center cursor-pointer">
                      <div className="h-4 w-4 text-gray-500 group-hover:text-[#196428] transition-colors">
                        <Info className="h-full w-full" />
                      </div>
                          <span className="text-xs font-light text-gray-500 mt-1 group-hover:text-[#196428] transition-colors">Sobre Nosotros</span>
                    </Link>
                    <Link href="#nuestras-tiendas" className="group flex flex-col items-center justify-center">
                      <div className="h-4 w-4 text-gray-500 group-hover:text-[#196428] transition-colors">
                        <MapPin className="h-full w-full" />
                      </div>
                          <span className="text-xs font-light text-gray-500 mt-1 group-hover:text-[#196428] transition-colors">Nuestras Tiendas</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Título */}
              <div className="mb-8">
                <h1 className="text-3xl font-black text-black mb-2">Carrito de Compras</h1>
                <p className="text-gray-600">
                  {items.length === 0 ? 'Tu carrito está vacío' : `${getTotalItems()} productos en tu carrito`}
                </p>
              </div>

              {items.length === 0 ? (
                /* Carrito vacío */
                <div className="text-center py-16">
                  <ShoppingCart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">Tu carrito está vacío</h2>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    ¡Es hora de llenarlo con productos increíbles para tus mascotas!
                  </p>
                  <Link
                    href="/tienda"
                    className="inline-block bg-[#196428] hover:bg-[#145020] text-white px-8 py-3 rounded-full font-semibold transition-colors"
                  >
                    Continuar Comprando
                  </Link>
                </div>
              ) : (
                /* Carrito con productos */
                <div className="space-y-6">
                  {/* Lista de productos */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                          {/* Imagen del producto */}
                          <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={item.imagen_url || '/placeholder.jpg'}
                              alt={item.nombre}
                              width={80}
                              height={80}
                              className="w-full h-full object-contain"
                            />
                          </div>

                          {/* Información del producto */}
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg text-gray-900 mb-1">{item.nombre}</h3>
                            <p className="text-sm text-gray-600 mb-2">{item.descripcion || 'Descripción del producto'}</p>

                            {/* Mostrar tamaños del producto */}
                            <ProductSizeBadges tamaños={item.tamano} size="sm" className="mb-2" />

                            {/* Indicadores */}
                            <div className="flex gap-2 mb-2">
                              {item.descuento && (
                                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                                  Oferta
                                </span>
                              )}
                              {item.destacado && (
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                  Destacado
                                </span>
                              )}
                              {item.novedad && (
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                  Nuevo
                                </span>
                              )}
                            </div>

                            {/* Precio */}
                            <div className="flex items-center gap-2">
                              {item.descuento && item.descuento_valor ? (
                                <>
                                  <span className="text-red-500 font-medium line-through">
                                    $ {formatPrice(item.precio)}
                                  </span>
                                  <span className="text-[#196428] font-bold text-lg">
                                    $ {formatPrice(Number(item.precio) * (1 - Number(item.descuento_valor) / 100))}
                                  </span>
                                </>
                              ) : (
                                <span className="text-[#196428] font-bold text-lg">
                                  $ {formatPrice(item.precio)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Controles de cantidad */}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </button>

                            <span className="w-12 text-center font-semibold text-lg">
                              {item.quantity}
                            </span>

                            <button
                              onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                              className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>

                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center transition-colors ml-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Resumen del pedido */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen del Pedido</h2>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal ({getTotalItems()} productos)</span>
                        <span>$ {formatPrice(getTotalPrice())}</span>
                      </div>

                      <div className="flex justify-between text-gray-600">
                        <span>Envío</span>
                        <span className="text-green-600 font-medium">Gratis</span>
                      </div>

                      <div className="flex justify-between text-gray-600">
                        <span>Impuestos</span>
                        <span className="text-green-600 font-medium">Incluidos</span>
                      </div>

                      <div className="border-t border-gray-200 pt-3">
                        <div className="flex justify-between text-lg font-bold text-gray-900">
                          <span>Total</span>
                          <span className="text-[#196428]">$ {formatPrice(getTotalPrice())}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <button className="w-full bg-[#196428] hover:bg-[#145020] text-white py-3 px-6 rounded-full font-semibold transition-colors">
                        Proceder al Pago
                      </button>

                      <button
                        onClick={clearCart}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-full font-semibold transition-colors"
                      >
                        Vaciar Carrito
                      </button>

                      <Link
                        href="/tienda"
                        className="block text-center text-[#196428] hover:text-[#145020] font-medium transition-colors"
                      >
                        Continuar Comprando
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        <footer className="bg-[#196428] text-white py-4">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:grid md:grid-cols-4 lg:grid-cols-12 gap-8 md:gap-6 lg:gap-4">
              <div className="md:col-span-1 lg:col-span-2 flex flex-col items-center md:items-start">
                <Image
                  src="/unisantander.png"
                  alt="Unisantander"
                  width={220}
                  height={30}
                  className="mb-4 md:mb-1 w-40 md:w-full"
                />

              </div>
              <div className="md:col-span-2 lg:col-span-7 lg:pl-8 order-first md:order-none">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 md:gap-4">
                  {/* Servicio al cliente */}
                  <div className="md:col-span-1">
                    <h3 className="text-sm font-semibold mb-1.5">Servicio al cliente</h3>
                    <ul className="space-y-[2px] text-[11px]">
                      <li><Link href="#">Ayuda y preguntas frecuentes</Link></li>
                      <li><Link href="#">Contacto</Link></li>
                      <li><Link href="#">Mi cuenta</Link></li>
                      <li><Link href="#">Solicitar contraseña</Link></li>
                      <li><Link href="#">Mis órdenes</Link></li>
                      <li><Link href="#">Mi lista de deseos</Link></li>
                      <li><Link href="#">Entrega rápida</Link></li>
                      <li><Link href="#">Pago seguro y métodos de pago</Link></li>
                      <li><Link href="#">Política de devolución de 30 días</Link></li>
                      <li><Link href="#">Newsletter</Link></li>
                      <li><Link href="#">Haga clic y recople</Link></li>
                      <li><Link href="#">Declaración de accesibilidad</Link></li>
                    </ul>
                  </div>

                  {/* Nuestros mercados */}
                  <div className="md:col-span-1">
                    <h3 className="text-sm font-semibold mb-1.5">Nuestros mercados</h3>
                    <ul className="space-y-[2px] text-[11px]">
                      <li><Link href="#">Encuentra mercados</Link></li>
                      <li><Link href="#">Servicios en el mercado</Link></li>
                      <li><Link href="#">Tarjeta regalo</Link></li>
                      <li><Link href="#">Salón Unisantander</Link></li>
                      <li><Link href="#">Prácticas veterinarias activas</Link></li>
                    </ul>
                  </div>

                  {/* Acerca de Unisantander */}
                  <div className="col-span-2 sm:col-span-1">
                    <h3 className="text-sm font-semibold mb-1.5">Acerca de Unisantander</h3>
                    <ul className="space-y-[2px] text-[11px]">
                      <li><Link href="/sobre-nosotros">Sobre nosotros</Link></li>
                      <li><Link href="#">Carreras</Link></li>
                      <li><Link href="#">Responsabilidad</Link></li>
                      <li><Link href="#">Animal comprometido</Link></li>
                      <li><Link href="#">Cumplimiento</Link></li>
                      <li><Link href="#">Convertirse en socio del mercado</Link></li>
                      <li><Link href="#">Prensa</Link></li>
                      <li><Link href="#">Indicaciones</Link></li>
                    </ul>
                  </div>

                  <div className="hidden lg:block lg:col-span-1">
                    {/* Este div es para mantener el layout en 4 columnas en desktop, se rellena con el conejo */}
                  </div>
                </div>
              </div>
              {/* Footer Rabbit and Social Media */}
              <div className="md:col-span-1 lg:col-span-3 flex flex-col items-center md:items-start">
                {/* Footer Rabbit Image */}
                <div className="relative w-full max-w-[250px] h-[150px] lg:w-[300px] lg:h-[200px]">
                  <Image
                    src="/footer_rabbit.png"
                    alt="Footer Rabbit"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>

                {/* Social Media Icons */}
                <div className="flex justify-center space-x-6 lg:space-x-8 mt-4">
                  <Link href="#" className="text-white hover:text-gray-200">
                    <Image src="/icons/facebook.png" alt="Facebook" width={30} height={30} />
                  </Link>
                  <Link href="#" className="text-white hover:text-gray-200">
                    <Image src="/icons/instagram.png" alt="Instagram" width={30} height={30} />
                  </Link>
                  <Link href="#" className="text-white hover:text-gray-200">
                    <Image src="/icons/youtube.png" alt="YouTube" width={30} height={30} />
                  </Link>
                  <Link href="#" className="text-white hover:text-gray-200">
                    <Image src="/icons/tiktok.png" alt="TikTok" width={30} height={30} />
                  </Link>
                  <Link href="#" className="text-white hover:text-gray-200">
                    <Image src="/icons/whatsapp.png" alt="WhatsApp" width={30} height={30} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Account Drawer for Mobile */}
      <Drawer open={isAccountDrawerOpen} onOpenChange={setIsAccountDrawerOpen}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="text-center border-b border-gray-200">
            <DrawerTitle className="text-lg font-bold text-gray-800">Mi Cuenta</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-6">
            <AccountPopoverContent />
          </div>
        </DrawerContent>
      </Drawer>

    </MainLayout>
  )
}

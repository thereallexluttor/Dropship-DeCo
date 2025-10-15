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
  Check
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import ProductCard from "../components/ProductCard"
import FadeInOnScroll from '../components/FadeInOnScroll'
import CategoryMenu from '../components/CategoryMenu'
import StoreLocator from '../components/StoreLocator'
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
import AccountPopoverContent from "../components/AccountPopover"
import { Marca } from "@/lib/supabase"
import { useCategories } from "../hooks/useCategories"
import { useProducts, ProductWithDetails } from "../hooks/useProducts"
import CartCounter from "../components/CartCounter"
import ProductSizeBadges from "../components/ProductSizeBadges"

export default function TiendaPage() {
  const [activeSlide, setActiveSlide] = useState(0)
  const [activeCardSlide, setActiveCardSlide] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeProductSlide, setActiveProductSlide] = useState(0)
  const [activeBrandSlide, setActiveBrandSlide] = useState(0)
  const [openCategory, setOpenCategory] = useState<string | null>(null)
  const categoriesContainerRef = useRef<HTMLDivElement>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isAccountDrawerOpen, setIsAccountDrawerOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCategoriesDrawerOpen, setIsCategoriesDrawerOpen] = useState(false)
  // Estado para manejar el tamaño seleccionado de cada producto
  const [selectedSizes, setSelectedSizes] = useState<{[key: number]: number}>({})

  // Estado para filtros de marcas
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null)
  const [availableBrands, setAvailableBrands] = useState<Marca[]>([])

  // Hooks para datos de Supabase
  const { categories, isLoading: categoriesLoading, error: categoriesError } = useCategories()
  const { products, productsByCategory, discountedProducts, featuredProducts, newProducts, brands, isLoading: productsLoading, error: productsError, getProductsBySubcategory } = useProducts()

  // Estado para la navegación de categorías
  const [selectedCategory, setSelectedCategory] = useState<number>(999) // ID de categoría por defecto (ofertas)
  const [selectedSubcategory, setSelectedSubcategory] = useState<number>(999) // ID de subcategoría por defecto (ofertas)
  const [currentTitle, setCurrentTitle] = useState<string>("Productos con descuento")
  const [currentBreadcrumbs, setCurrentBreadcrumbs] = useState<string[]>(["🏠", "Ofertas"])

  // Constantes para categorías especiales
  const CATEGORIES = {
    OFERTAS: 999,
    NOVEDADES: 998
  }

  // Función para manejar el cambio de categoría
  const handleCategoryChange = (categoryId: number, subcategoryId: number) => {
    setSelectedCategory(categoryId)
    setSelectedSubcategory(subcategoryId)

    // Limpiar filtro de marca cuando cambia la categoría
    setSelectedBrand(null)

    // Manejar categorías especiales
    if (categoryId === CATEGORIES.NOVEDADES) {
      setCurrentTitle("Novedades")
      setCurrentBreadcrumbs(["🏠", "Novedades"])
      return
    }

    if (categoryId === CATEGORIES.OFERTAS) {
      setCurrentTitle("Productos con descuento")
      setCurrentBreadcrumbs(["🏠", "Ofertas"])
      return
    }

    // Buscar información de la categoría y subcategoría para categorías normales
    const category = categories.find(cat => cat.id === categoryId)
    const categoryData = productsByCategory.find(cat => cat.categoryId === categoryId)
    const subcategoryData = categoryData?.subcategories.find(sub => sub.subcategoryId === subcategoryId)

    if (category && subcategoryData) {
      setCurrentTitle(subcategoryData.subcategoryName)
      setCurrentBreadcrumbs(["🏠", category.name, subcategoryData.subcategoryName])
    }
  }

  // Función para obtener marcas disponibles según la categoría seleccionada
  const getBrandsForCategory = (categoryId: number) => {
    if (categoryId === CATEGORIES.OFERTAS) {
      // Para ofertas, obtener marcas de productos con descuento
      const brandIds = new Set(discountedProducts.map(p => p.id_marca).filter(Boolean))
      return brands.filter(brand => brandIds.has(brand.id))
    }

    if (categoryId === CATEGORIES.NOVEDADES) {
      // Para novedades, obtener marcas de productos nuevos
      const brandIds = new Set(newProducts.map(p => p.id_marca).filter(Boolean))
      return brands.filter(brand => brandIds.has(brand.id))
    }

    // Para categorías normales, obtener marcas de productos en la categoría actual
    const currentProducts = getProductsBySubcategory(selectedCategory, selectedSubcategory) || []
    const brandIds = new Set(currentProducts.map(p => p.id_marca).filter(Boolean))
    return brands.filter(brand => brandIds.has(brand.id))
  }

  // Función para filtrar productos por marca
  const filterProductsByBrand = (products: ProductWithDetails[]) => {
    if (!selectedBrand) return products
    return products.filter(product => product.id_marca === selectedBrand)
  }

  // Obtener productos actuales
  const currentProducts = getProductsBySubcategory(selectedCategory, selectedSubcategory) || []

  // Determinar qué productos mostrar según la categoría seleccionada
  const baseProducts = selectedCategory === CATEGORIES.OFERTAS
    ? discountedProducts
    : selectedCategory === CATEGORIES.NOVEDADES
    ? newProducts
    : currentProducts.length > 0
    ? currentProducts
    : featuredProducts

  // Aplicar filtro de marca si está seleccionado
  const displayProducts = filterProductsByBrand(baseProducts)

  // Efecto para actualizar marcas disponibles cuando cambia la categoría
  useEffect(() => {
    const brandsForCurrentCategory = getBrandsForCategory(selectedCategory)
    setAvailableBrands(brandsForCurrentCategory)
    // Resetear marca seleccionada si ya no está disponible en la nueva categoría
    if (selectedBrand && !brandsForCurrentCategory.find(b => b.id === selectedBrand)) {
      setSelectedBrand(null)
    }
  }, [selectedCategory, selectedSubcategory, products, discountedProducts, newProducts])

  // Función para limpiar filtros
  const clearFilters = () => {
    setSelectedBrand(null)
  }

  // Función para generar categorías dinámicamente
  const renderDynamicCategories = () => {
    return productsByCategory.map((categoryData) => {
      const category = categories.find(cat => cat.id === categoryData.categoryId)
      if (!category) return null

      return (
        <div key={categoryData.categoryId} className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <span className="text-[#196428]">🐕</span>
            {category.name}
          </h3>
          <div className="space-y-1">
            {categoryData.subcategories.map((subcategory) => (
              <button
                key={subcategory.subcategoryId}
                onClick={() => handleCategoryChange(categoryData.categoryId, subcategory.subcategoryId)}
                className={`block text-sm w-full text-left ${selectedCategory === categoryData.categoryId && selectedSubcategory === subcategory.subcategoryId ? "text-[#196428] font-medium bg-green-50 px-2 py-1 rounded" : "text-gray-600 hover:text-[#196428] px-2 py-1 rounded hover:bg-gray-50"}`}
              >
                {subcategory.subcategoryName}
              </button>
            ))}
          </div>
        </div>
      )
    })
  }

  // Efecto para los carruseles de las cards
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCardSlide(current => (current + 1) % 3);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((current) => (current === 3 ? 0 : current + 1));
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const brandTimer = setInterval(() => {
      setActiveBrandSlide(current => (current + 1) % 2); // Asumiendo 2 slides de 4 marcas cada uno
    }, 5000);

    return () => clearInterval(brandTimer);
  }, []);

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

  const productImages = [
    "/cap1.png",
    "/cap2.png",
    "/cap3.png",
    "/cap4.png",
    "/cap1-2.png",
    "/cap2-2.png",
    "/cap3-2.png",
    "/cap4-2.png",
    "/cap1-3.png",
    "/cap2-3.png",
    "/cap3-3.png",
    "/cap4-3.png",
  ];

  // Los productos destacados vienen del hook useProducts (ya se obtiene desde el hook)

  // Brand carousel logic removed - now using dynamic brands from useProducts hook

  const totalProductSlides = Math.ceil(featuredProducts.length / 4);

  const nextProductSlide = () => {
    setActiveProductSlide((current) => (current + 1) % totalProductSlides);
  };

  const prevProductSlide = () => {
    setActiveProductSlide((current) => (current - 1 + totalProductSlides) % totalProductSlides);
  };


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
                          if (link.name === "Tienda") {
                            return (
                              <Link key={link.name} href={link.href} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                <link.icon className="h-5 w-5 text-[#196428]" />
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
                      <div className="h-4 w-4 text-[#196428] transition-colors">
                        <ShoppingBag className="h-full w-full" />
                      </div>
                          <span className="text-xs font-light text-[#196428] mt-1 transition-colors">Tienda</span>
                    </Link>
                    <Link href="/carrito" className="group flex flex-col items-center justify-center cursor-pointer">
                      <div className="h-4 w-4 text-gray-500 group-hover:text-[#196428] transition-colors">
                        <CartCounter />
                      </div>
                          <span className="text-xs font-light text-gray-500 mt-1 group-hover:text-[#196428] transition-colors">Carrito</span>
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
                <div className="flex items-center space-x-3 flex-shrink-0">
                  <div className="flex items-center space-x-2">
                    <Link href="/" className="group flex flex-col items-center justify-center cursor-pointer">
                      <div className="h-4 w-4 text-gray-500 transition-colors">
                        <HomeIcon className="h-full w-full" />
                      </div>
                      <span className="text-xs font-light text-gray-500 mt-1 transition-colors">Inicio</span>
                    </Link>
                    <Link href="/tienda" className="group flex flex-col items-center justify-center cursor-pointer">
                      <div className="h-4 w-4 text-[#196428] transition-colors">
                        <ShoppingBag className="h-full w-full" />
                      </div>
                          <span className="text-xs font-light text-[#196428] mt-1 transition-colors">Tienda</span>
                    </Link>
                    <Link href="/carrito" className="group flex flex-col items-center justify-center cursor-pointer">
                      <div className="h-4 w-4 text-gray-500 group-hover:text-[#196428] transition-colors">
                        <CartCounter />
                      </div>
                          <span className="text-xs font-light text-gray-500 mt-1 group-hover:text-[#196428] transition-colors">Carrito</span>
                    </Link>
                    <AccountPopover />
                  </div>
                  <div className="w-[1px] h-6 bg-gray-200"></div>
                  <div className="flex items-center space-x-2">
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
                      <div className="h-4 w-4 text-[#196428] transition-colors">
                        <ShoppingBag className="h-full w-full" />
                      </div>
                          <span className="text-xs font-light text-[#196428] mt-1 transition-colors">Tienda</span>
                    </Link>
                    <Link href="/carrito" className="group flex flex-col items-center justify-center cursor-pointer">
                      <div className="h-4 w-4 text-gray-500 group-hover:text-[#196428] transition-colors">
                        <CartCounter />
                      </div>
                          <span className="text-xs font-light text-gray-500 mt-1 group-hover:text-[#196428] transition-colors">Carrito</span>
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

        <main>
          {/* Main content with sidebar and products */}
          <section className="py-4 md:py-8" style={{ backgroundColor: '#FCFFEF' }}>
            <div className="container mx-auto px-4">
              <div className="flex gap-4 md:gap-8">
                {/* Sidebar with categories - Hidden on mobile, shown on tablet and desktop */}
                <aside className="hidden md:block md:w-64 lg:w-80 flex-shrink-0">
                  <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
                    <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-4 md:mb-6">Categorías</h2>

                    {/* Ofertas section */}
                    <div className="mb-4 md:mb-6">
                      <h3 className="text-base md:text-lg font-semibold text-gray-700 mb-2 md:mb-3">Ofertas %</h3>
                      <button
                        onClick={() => handleCategoryChange(CATEGORIES.OFERTAS, CATEGORIES.OFERTAS)}
                        className={`block text-sm w-full text-left mb-1 ${selectedCategory === CATEGORIES.OFERTAS && selectedSubcategory === CATEGORIES.OFERTAS ? "text-[#196428] font-medium bg-green-50 px-2 py-1 rounded" : "text-gray-600 hover:text-[#196428] px-2 py-1 rounded hover:bg-gray-50"}`}
                      >
                        Productos con descuento
                      </button>
                    </div>

                    {/* Categorías dinámicas desde Supabase */}
                    {renderDynamicCategories()}

                    {/* Special sections */}
                    <div className="mb-4 md:mb-6">
                      <h3 className="text-base md:text-lg font-semibold text-gray-700 mb-2 md:mb-3">Especiales</h3>
                      <div className="space-y-1">
                        <button
                          onClick={() => handleCategoryChange(CATEGORIES.OFERTAS, CATEGORIES.OFERTAS)}
                          className={`block text-sm w-full text-left ${selectedCategory === CATEGORIES.OFERTAS && selectedSubcategory === CATEGORIES.OFERTAS ? "text-[#196428] font-medium bg-green-50 px-2 py-1 rounded" : "text-gray-600 hover:text-[#196428] px-2 py-1 rounded hover:bg-gray-50"}`}
                        >
                          Ofertas
                        </button>
                        <button
                          onClick={() => handleCategoryChange(CATEGORIES.NOVEDADES, CATEGORIES.NOVEDADES)}
                          className={`block text-sm w-full text-left ${selectedCategory === CATEGORIES.NOVEDADES && selectedSubcategory === CATEGORIES.NOVEDADES ? "text-[#196428] font-medium bg-green-50 px-2 py-1 rounded" : "text-gray-600 hover:text-[#196428] px-2 py-1 rounded hover:bg-gray-50"}`}
                        >
                          Novedades
                        </button>
                      </div>
                    </div>
                  </div>
                </aside>

                {/* Main content area */}
                <div className="flex-1">
                  {/* Mobile Categories Button */}
                  <div className="md:hidden mb-4">
                    <button
                      onClick={() => setIsCategoriesDrawerOpen(true)}
                      className="flex items-center gap-2 bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200 w-full hover:bg-gray-50 transition-colors"
                    >
                      <Menu className="h-5 w-5 text-gray-600" />
                      <span className="text-gray-800 font-medium">Ver Categorías</span>
                    </button>
                  </div>

                  {/* Loading and Error States */}
                  {(categoriesLoading || productsLoading) && (
                    <div className="flex justify-center items-center py-20">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#196428] mx-auto mb-4"></div>
                        <p className="text-gray-600">Cargando productos...</p>
                      </div>
                    </div>
                  )}

                  {(categoriesError || productsError) && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                      <p className="text-red-800">
                        Error: {categoriesError || productsError}
                      </p>
                    </div>
                  )}

                  {/* Title */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      {currentBreadcrumbs.map((breadcrumb, index) => (
                        <div key={index} className="flex items-center gap-2">
                          {index > 0 && <span>&gt;</span>}
                          {breadcrumb.startsWith('🏠') ? (
                            <Link href="/" className="hover:text-[#196428]">{breadcrumb}</Link>
                          ) : (
                            <span className={index === currentBreadcrumbs.length - 1 ? "text-gray-800 font-medium" : "hover:text-[#196428]"}>
                              {breadcrumb}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    <h1 className="text-3xl font-black text-black">{currentTitle}</h1>
                    <p className="text-sm text-gray-600 mt-1">
                      {displayProducts.length} producto{displayProducts.length !== 1 ? 's' : ''} encontrado{displayProducts.length !== 1 ? 's' : ''}
                      {selectedBrand && (
                        <span className="ml-2">
                          • Filtrado por: <span className="font-medium text-[#196428]">
                            {brands.find(b => b.id === selectedBrand)?.nombre_marca}
                          </span>
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Filters - responsive layout */}
                  <div className="mb-6 md:mb-8">
                    {/* Mobile Filter Button */}
                    <div className="md:hidden mb-4">
                      <button className="flex items-center gap-2 bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200 w-full hover:bg-gray-50 transition-colors">
                        <Tag className="h-4 w-4 text-gray-600" />
                        <span className="text-gray-800 font-medium">Filtros y ordenamiento</span>
                      </button>
                    </div>

                    {/* Desktop/Tablet Filters */}
                    <div className="hidden md:flex flex-wrap gap-3 items-center">
                      {/* Filtro de marcas - disponible para todas las categorías */}
                      {availableBrands.length > 0 && (
                        <select
                          value={selectedBrand || ""}
                          onChange={(e) => setSelectedBrand(e.target.value ? parseInt(e.target.value) : null)}
                          className="px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#196428] bg-white"
                        >
                          <option value="">Todas las marcas</option>
                          {availableBrands.map(brand => (
                            <option key={brand.id} value={brand.id}>
                              {brand.nombre_marca}
                            </option>
                          ))}
                        </select>
                      )}

                      {/* Botón para limpiar filtros */}
                      {(selectedBrand) && (
                        <button
                          onClick={clearFilters}
                          className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                        >
                          Limpiar filtros
                        </button>
                      )}

                      {selectedCategory === CATEGORIES.OFERTAS ? (
                        // Filtros para ofertas
                        <>
                          <select className="px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#196428] bg-white">
                            <option>Tipo de oferta</option>
                            <option>Descuento %</option>
                            <option>2x1</option>
                            <option>Liquidación</option>
                          </select>
                          <select className="px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#196428] bg-white">
                            <option>Categoría</option>
                            {productsByCategory.map(cat => (
                              <option key={cat.categoryId}>{cat.categoryName}</option>
                            ))}
                          </select>
                        </>
                      ) : selectedCategory === CATEGORIES.NOVEDADES ? (
                        // Filtros para novedades
                        <>
                          <select className="px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#196428] bg-white">
                            <option>Categoría</option>
                            {productsByCategory.map(cat => (
                              <option key={cat.categoryId}>{cat.categoryName}</option>
                            ))}
                          </select>
                          <select className="px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#196428] bg-white">
                            <option>Tipo de novedad</option>
                            <option>Producto nuevo</option>
                            <option>Lanzamiento reciente</option>
                            <option>Temporada</option>
                          </select>
                        </>
                      ) : (
                        // Filtros generales
                        <>
                          <select className="px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#196428] bg-white">
                            <option>Precio</option>
                            <option>$0 - $10.000</option>
                            <option>$10.001 - $25.000</option>
                            <option>$25.001 - $50.000</option>
                            <option>$50.000+</option>
                          </select>
                          <select className="px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#196428] bg-white">
                            <option>Ordenar por</option>
                            <option>Más popular</option>
                            <option>Precio: menor a mayor</option>
                            <option>Precio: mayor a menor</option>
                            <option>Novedades</option>
                          </select>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Products Grid - responsive layout */}
                  {displayProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                      {displayProducts.map((product: ProductWithDetails) => {
                        const selectedSizeIndex = selectedSizes[product.id!] || 0;
                        const hasSizes = product.tamano && product.tamano.length > 0;
                        const hasPrices = product.precios && product.precios.length > 0;
                        
                        // Obtener el precio según el tamaño seleccionado
                        const getCurrentPrice = () => {
                          if (hasSizes && hasPrices && product.precios![selectedSizeIndex] !== undefined) {
                            return product.precios![selectedSizeIndex];
                          }
                          return 0;
                        };

                        const currentPrice = getCurrentPrice();

                        return (
                      <div key={product.id} className="bg-white rounded-[20px] sm:rounded-[25px] overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                        <div className="relative aspect-square">
                          <Image
                              src={product.imagen_url || "/placeholder.jpg"}
                              alt={product.nombre}
                            fill
                            className="object-contain p-3 sm:p-4"
                          />
                          <button className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-[#196428] hover:bg-[#145020] text-white p-2 sm:p-2.5 rounded-full shadow-md transition-all duration-300">
                            <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                            {product.descuento && (
                            <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                                  Oferta
                                </span>
                              </div>
                            )}
                            {product.destacado && !product.descuento && (
                              <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                  Destacado
                                </span>
                              </div>
                            )}
                            {product.novedad && !product.descuento && !product.destacado && (
                              <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                                  Nuevo
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="p-3 sm:p-4">
                            <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 line-clamp-2">{product.nombre}</h3>
                            <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">{product.descripcion || "Descripción del producto"}</p>

                            {/* Mostrar tamaños del producto - Seleccionables */}
                            {hasSizes && (
                              <div className="mb-3">
                                <p className="text-xs text-gray-500 mb-1">Tamaños disponibles:</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {product.tamano!.map((tamano, index) => (
                                    <button
                                      key={index}
                                      onClick={() => setSelectedSizes({...selectedSizes, [product.id!]: index})}
                                      className={`px-2 py-1 rounded-full text-xs font-medium transition-all ${
                                        selectedSizeIndex === index
                                          ? 'bg-[#196428] text-white shadow-sm'
                                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                      }`}
                                    >
                                      {tamano.cantidad} {tamano.unidad}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Mostrar precio según tamaño seleccionado */}
                            {hasPrices && currentPrice > 0 ? (
                              product.descuento && product.descuento_valor ? (
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                  <p className="text-red-500 font-medium text-xs sm:text-sm line-through">
                                    $ {currentPrice.toLocaleString('es-CO')}
                                  </p>
                                  <p className="text-[#196428] font-medium text-sm sm:text-base">
                                    $ {(() => {
                                      const descuentoValor = typeof product.descuento_valor === 'string' ? parseFloat(product.descuento_valor) : Number(product.descuento_valor)
                                      const precioConDescuento = currentPrice * (1 - (descuentoValor / 100))
                                      return precioConDescuento.toLocaleString('es-CO')
                                    })()}
                                  </p>
                                </div>
                              ) : (
                                <p className="text-[#196428] font-medium text-sm sm:text-base">
                                  $ {currentPrice.toLocaleString('es-CO')}
                                </p>
                              )
                            ) : (
                              <p className="text-gray-400 text-xs sm:text-sm italic">
                                Precio no disponible
                              </p>
                            )}
                        </div>
                      </div>
                        );
                      })}
                  </div>
                  ) : (
                    <div className="text-center py-20">
                      <p className="text-gray-600 text-lg mb-4">No se encontraron productos en esta categoría.</p>
                      <div className="flex gap-4 justify-center">
                        <button
                          onClick={() => handleCategoryChange(CATEGORIES.OFERTAS, CATEGORIES.OFERTAS)}
                          className="bg-[#196428] hover:bg-[#145020] text-white px-6 py-3 rounded-full font-semibold transition-colors"
                        >
                          Ver productos con descuento
                        </button>
                        <button
                          onClick={() => handleCategoryChange(CATEGORIES.NOVEDADES, CATEGORIES.NOVEDADES)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold transition-colors"
                        >
                          Ver novedades
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="bg-[#196428] text-white py-4">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-4">
              {/* Logo Section */}
              <div className="lg:col-span-2 flex flex-col items-center lg:items-start">
                <Image
                  src="/unisantander.png"
                  alt="Unisantander"
                  width={220}
                  height={30}
                  className="mb-4 lg:mb-1 w-40 sm:w-48 lg:w-full"
                />
              </div>

              {/* Links Section */}
              <div className="lg:col-span-7">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-4">
                  {/* Servicio al cliente */}
                  <div>
                    <h3 className="text-sm font-semibold mb-2 lg:mb-1.5">Servicio al cliente</h3>
                    <ul className="space-y-1 lg:space-y-[2px] text-xs lg:text-[11px]">
                      <li><Link href="#" className="hover:underline">Ayuda y preguntas frecuentes</Link></li>
                      <li><Link href="#" className="hover:underline">Contacto</Link></li>
                      <li><Link href="#" className="hover:underline">Mi cuenta</Link></li>
                      <li><Link href="#" className="hover:underline">Solicitar contraseña</Link></li>
                      <li><Link href="#" className="hover:underline">Mis órdenes</Link></li>
                      <li><Link href="#" className="hover:underline">Mi lista de deseos</Link></li>
                      <li><Link href="#" className="hover:underline">Entrega rápida</Link></li>
                      <li><Link href="#" className="hover:underline">Pago seguro y métodos de pago</Link></li>
                      <li><Link href="#" className="hover:underline">Política de devolución de 30 días</Link></li>
                      <li><Link href="#" className="hover:underline">Newsletter</Link></li>
                      <li><Link href="#" className="hover:underline">Haga clic y recople</Link></li>
                      <li><Link href="#" className="hover:underline">Declaración de accesibilidad</Link></li>
                    </ul>
                  </div>

                  {/* Nuestros mercados */}
                  <div>
                    <h3 className="text-sm font-semibold mb-2 lg:mb-1.5">Nuestros mercados</h3>
                    <ul className="space-y-1 lg:space-y-[2px] text-xs lg:text-[11px]">
                      <li><Link href="#" className="hover:underline">Encuentra mercados</Link></li>
                      <li><Link href="#" className="hover:underline">Servicios en el mercado</Link></li>
                      <li><Link href="#" className="hover:underline">Tarjeta regalo</Link></li>
                      <li><Link href="#" className="hover:underline">Salón Unisantander</Link></li>
                      <li><Link href="#" className="hover:underline">Prácticas veterinarias activas</Link></li>
                    </ul>
                  </div>

                  {/* Acerca de Unisantander */}
                  <div>
                    <h3 className="text-sm font-semibold mb-2 lg:mb-1.5">Acerca de Unisantander</h3>
                    <ul className="space-y-1 lg:space-y-[2px] text-xs lg:text-[11px]">
                      <li><Link href="/sobre-nosotros" className="hover:underline">Sobre nosotros</Link></li>
                      <li><Link href="#" className="hover:underline">Carreras</Link></li>
                      <li><Link href="#" className="hover:underline">Responsabilidad</Link></li>
                      <li><Link href="#" className="hover:underline">Animal comprometido</Link></li>
                      <li><Link href="#" className="hover:underline">Cumplimiento</Link></li>
                      <li><Link href="#" className="hover:underline">Convertirse en socio del mercado</Link></li>
                      <li><Link href="#" className="hover:underline">Prensa</Link></li>
                      <li><Link href="#" className="hover:underline">Indicaciones</Link></li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Footer Rabbit and Social Media */}
              <div className="lg:col-span-3 flex flex-col items-center lg:items-end mt-6 lg:mt-0">
                {/* Footer Rabbit Image */}
                <div className="relative w-full max-w-[200px] sm:max-w-[250px] h-[120px] sm:h-[150px] lg:w-[300px] lg:h-[200px] mb-4">
                  <Image
                    src="/footer_rabbit.png"
                    alt="Footer Rabbit"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>

                {/* Social Media Icons */}
                <div className="flex justify-center space-x-4 sm:space-x-6 lg:space-x-8">
                  <Link href="#" className="text-white hover:text-gray-200 transition-colors">
                    <Image src="/icons/facebook.png" alt="Facebook" width={24} height={24} className="sm:w-[30px] sm:h-[30px]" />
                  </Link>
                  <Link href="#" className="text-white hover:text-gray-200 transition-colors">
                    <Image src="/icons/instagram.png" alt="Instagram" width={24} height={24} className="sm:w-[30px] sm:h-[30px]" />
                  </Link>
                  <Link href="#" className="text-white hover:text-gray-200 transition-colors">
                    <Image src="/icons/youtube.png" alt="YouTube" width={24} height={24} className="sm:w-[30px] sm:h-[30px]" />
                  </Link>
                  <Link href="#" className="text-white hover:text-gray-200 transition-colors">
                    <Image src="/icons/tiktok.png" alt="TikTok" width={24} height={24} className="sm:w-[30px] sm:h-[30px]" />
                  </Link>
                  <Link href="#" className="text-white hover:text-gray-200 transition-colors">
                    <Image src="/icons/whatsapp.png" alt="WhatsApp" width={24} height={24} className="sm:w-[30px] sm:h-[30px]" />
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

      {/* Categories Drawer for Mobile */}
      <Drawer open={isCategoriesDrawerOpen} onOpenChange={setIsCategoriesDrawerOpen}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="text-center border-b border-gray-200">
            <DrawerTitle className="text-lg font-bold text-gray-800">Categorías</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-6">
            <div className="space-y-4">
              {/* Ofertas section */}
              <div>
                <h3 className="text-base font-semibold text-gray-700 mb-2">Ofertas %</h3>
                <button
                  onClick={() => {
                    handleCategoryChange(CATEGORIES.OFERTAS, CATEGORIES.OFERTAS);
                    setIsCategoriesDrawerOpen(false);
                  }}
                  className={`block text-sm w-full text-left px-2 py-2 rounded hover:bg-gray-50 ${selectedCategory === CATEGORIES.OFERTAS && selectedSubcategory === CATEGORIES.OFERTAS ? "text-[#196428] font-medium bg-green-50" : "text-gray-600 hover:text-[#196428]"}`}
                >
                  Productos con descuento
                </button>
              </div>

              {/* Categorías dinámicas desde Supabase */}
              {productsByCategory.map((categoryData) => {
                const category = categories.find(cat => cat.id === categoryData.categoryId)
                if (!category) return null

                return (
                  <div key={categoryData.categoryId}>
                    <h3 className="text-base font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <span className="text-[#196428]">🐕</span>
                      {category.name}
                    </h3>
                    <div className="space-y-1 ml-2">
                      {categoryData.subcategories.map((subcategory) => (
                        <button
                          key={subcategory.subcategoryId}
                          onClick={() => {
                            handleCategoryChange(categoryData.categoryId, subcategory.subcategoryId);
                            setIsCategoriesDrawerOpen(false);
                          }}
                          className={`block text-sm w-full text-left px-2 py-1 rounded hover:bg-gray-50 ${selectedCategory === categoryData.categoryId && selectedSubcategory === subcategory.subcategoryId ? "text-[#196428] font-medium bg-green-50" : "text-gray-600 hover:text-[#196428]"}`}
                        >
                          {subcategory.subcategoryName}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}

              {/* Special sections */}
              <div>
                <h3 className="text-base font-semibold text-gray-700 mb-2">Especiales</h3>
                <div className="space-y-1 ml-2">
                  <button
                    onClick={() => {
                      handleCategoryChange(CATEGORIES.OFERTAS, CATEGORIES.OFERTAS);
                      setIsCategoriesDrawerOpen(false);
                    }}
                    className={`block text-sm w-full text-left px-2 py-1 rounded hover:bg-gray-50 ${selectedCategory === CATEGORIES.OFERTAS && selectedSubcategory === CATEGORIES.OFERTAS ? "text-[#196428] font-medium bg-green-50" : "text-gray-600 hover:text-[#196428]"}`}
                  >
                    Ofertas
                  </button>
                  <button
                    onClick={() => {
                      handleCategoryChange(CATEGORIES.NOVEDADES, CATEGORIES.NOVEDADES);
                      setIsCategoriesDrawerOpen(false);
                    }}
                    className={`block text-sm w-full text-left px-2 py-1 rounded hover:bg-gray-50 ${selectedCategory === CATEGORIES.NOVEDADES && selectedSubcategory === CATEGORIES.NOVEDADES ? "text-[#196428] font-medium bg-green-50" : "text-gray-600 hover:text-[#196428]"}`}
                  >
                    Novedades
                  </button>
                </div>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

    </MainLayout>
  )
}


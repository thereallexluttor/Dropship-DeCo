"use client"

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  ShoppingCart,
  Star,
  StarHalf,
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Check,
  Info,
  Package,
  Award,
  MapPin,
  ShoppingBag,
  Search,
  Home as HomeIcon,
  User,
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
  Briefcase,
  Menu
} from 'lucide-react'
import { supabase, Producto, UI } from '@/lib/supabase'
import { useCart } from '@/app/contexts/CartContext'
import MainLayout from '@/app/components/MainLayout'
import Footer from '@/app/components/Footer'
import CartCounter from '@/app/components/CartCounter'
import CategoryMenu from '@/app/components/CategoryMenu'
import SearchAutocomplete from '@/app/components/SearchAutocomplete'
import CategoryDropdown from '@/app/components/CategoryDropdown'
import AccountPopover from '@/app/components/AccountPopover'
import AccountPopoverContent from '@/app/components/AccountPopoverContent'
import { useCategories } from '@/app/hooks/useCategories'
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

// Styles for the header
const headerStyles = `
  @keyframes scroll {
    0% {
      transform: translateX(100%);
    }
    100% {
      transform: translateX(-100%);
    }
  }

  .animate-scroll {
    animation: scroll 20s linear infinite;
  }
`;

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const { addToCart } = useCart()

  // Header states
  const [activeSlide, setActiveSlide] = useState(0)
  const [activeHiddenSlide, setActiveHiddenSlide] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false)
  const [activeProductSlide, setActiveProductSlide] = useState(0)
  const [activeBrandSlide, setActiveBrandSlide] = useState(0)
  const [openCategory, setOpenCategory] = useState<string | null>(null)
  const categoriesContainerRef = useRef<HTMLDivElement>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isAccountDrawerOpen, setIsAccountDrawerOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [productosDestacados, setProductosDestacados] = useState<Producto[]>([])
  const [productosEnOferta, setProductosEnOferta] = useState<Producto[]>([])
  const [uiElements, setUiElements] = useState<UI[]>([])
  const [aliados, setAliados] = useState<{id: number, nombre: string, imagen_url: string}[]>([])
  const [showPopup, setShowPopup] = useState(false)
  const [selectedSizes, setSelectedSizes] = useState<{[key: number]: number}>({})

  // Product states
  const [product, setProduct] = useState<Producto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [relatedProducts, setRelatedProducts] = useState<Producto[]>([])

  // Header hooks
  const { categories, isLoading: categoriesLoading, error: categoriesError } = useCategories()

  // Header functions
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      try {
        // Usar el hook de productos para búsqueda
        window.location.href = `/tienda?search=${encodeURIComponent(searchQuery.trim())}`
      } catch (error) {
        console.error("Error en la búsqueda:", error)
      }
    }
  }

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)

    // Mostrar autocompletado si hay texto
    if (value.trim()) {
      setIsAutocompleteOpen(true)
    } else {
      setIsAutocompleteOpen(false)
    }
  }

  const handleSearchInputFocus = () => {
    if (searchQuery.trim()) {
      setIsAutocompleteOpen(true)
    }
  }

  const handleSearchInputBlur = () => {
    setTimeout(() => {
      setIsAutocompleteOpen(false)
    }, 200)
  }

  const handleCloseAutocomplete = () => {
    setIsAutocompleteOpen(false)
  }

  const handleSelectProduct = (product: any) => {
    setSearchQuery(product.nombre)
    window.location.href = `/tienda?search=${encodeURIComponent(product.nombre)}`
  }

  const handleAddToCartHeader = (producto: Producto) => {
    addToCart(producto, 1)
    console.log(`Agregado al carrito: ${producto.nombre}`)
  }

  const closePopup = () => {
    setShowPopup(false);
    sessionStorage.setItem('hasVisitedHome', 'true');
  }

  // Header useEffects
  useEffect(() => {
    const cargarProductosDestacados = async () => {
      try {
        const { data, error } = await supabase
          .from('productos')
          .select('*')
          .eq('destacado', true);

        if (error) throw error;
        setProductosDestacados(data || []);
      } catch (error) {
        console.error('Error cargando productos destacados:', error);
      }
    };

    const cargarProductosEnOferta = async () => {
      try {
        const { data, error } = await supabase
          .from('productos')
          .select('*')
          .eq('descuento', true);

        if (error) throw error;
        setProductosEnOferta(data || []);
      } catch (error) {
        console.error('Error cargando productos en oferta:', error);
      }
    };

    const cargarElementosUI = async () => {
      try {
        const { data, error } = await supabase
          .from('ui')
          .select('*')
          .order('id', { ascending: false });

        if (error) throw error;
        setUiElements(data || []);
      } catch (error) {
        console.error('Error cargando elementos UI:', error);
      }
    };

    const cargarAliados = async () => {
      try {
        const { data, error } = await supabase
          .from('aliados')
          .select('*')
          .order('id', { ascending: true });

        if (error) throw error;
        setAliados(data || []);
      } catch (error) {
        console.error('Error cargando aliados:', error);
      }
    };

    cargarProductosDestacados();
    cargarProductosEnOferta();
    cargarElementosUI();
    cargarAliados();
  }, []);

  // Cargar producto
  useEffect(() => {
    const loadProduct = async () => {
      if (!params.id) return

      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from('productos')
          .select(`
            *,
            subcategorias:subcategorias_id (
              id,
              nombre,
              descripcion,
              categories_id,
              categories:categories_id (
                id,
                nombre
              )
            ),
            marcas:id_marca (
              id,
              nombre_marca
            )
          `)
          .eq('id', params.id)
          .single()

        if (error) throw error
        setProduct(data)

        // Cargar productos relacionados (misma subcategoría)
        if (data.subcategorias_id) {
          const { data: related, error: relatedError } = await supabase
            .from('productos')
            .select('*')
            .eq('subcategorias_id', data.subcategorias_id)
            .neq('id', params.id)
            .limit(4)

          if (!relatedError && related) {
            setRelatedProducts(related)
          }
        }
      } catch (error) {
        console.error('Error loading product:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadProduct()
  }, [params.id])

  // Obtener precio actual según tamaño seleccionado
  const getCurrentPrice = () => {
    if (!product) return 0
    if (product.precios && product.precios.length > selectedSizeIndex) {
      return product.precios[selectedSizeIndex]
    }
    if (product.stocks && product.stocks.length > selectedSizeIndex) {
      return product.stocks[selectedSizeIndex].precio
    }
    return 0
  }

  // Obtener stock disponible según tamaño seleccionado
  const getCurrentStock = () => {
    if (!product) return 0
    if (product.stocks && product.stocks.length > selectedSizeIndex) {
      return product.stocks[selectedSizeIndex].stock
    }
    // Si no hay campo stocks, asumir stock ilimitado o un número alto
    return 999
  }

  // Calcular precio con descuento
  const getPriceWithDiscount = () => {
    const basePrice = getCurrentPrice()
    if (product?.descuento && product.descuento_valor) {
      const discount = typeof product.descuento_valor === 'string' 
        ? parseFloat(product.descuento_valor) 
        : Number(product.descuento_valor)
      return basePrice * (1 - discount / 100)
    }
    return basePrice
  }

  // Agregar al carrito
  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity, selectedSizeIndex)
      // Opcional: mostrar notificación
    }
  }

  // Cambiar cantidad
  const incrementQuantity = () => setQuantity(prev => prev + 1)
  const decrementQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1)

  // Loading state
  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center bg-[#FCFFEF]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#196428] mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando producto...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  // Product not found
  if (!product) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center bg-[#FCFFEF]">
          <div className="text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Producto no encontrado</h2>
            <p className="text-gray-600 mb-4">El producto que buscas no está disponible</p>
            <Link 
              href="/tienda"
              className="bg-[#196428] hover:bg-[#145020] text-white px-6 py-3 rounded-full font-semibold transition-colors"
            >
              Volver a la tienda
            </Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  const currentPrice = getCurrentPrice()
  const finalPrice = getPriceWithDiscount()
  const hasDiscount = product.descuento && product.descuento_valor
  const currentStock = getCurrentStock()
  const totalPrice = finalPrice * quantity

  // Navigation links
  const navLinks = [
    { name: "Inicio", icon: HomeIcon, href: "/" },
    { name: "Tienda", icon: ShoppingBag, href: "/tienda" },
    { name: "Carrito", icon: ShoppingCart, href: "/carrito" },
    { name: "Cuenta", icon: User, href: "#" },
    { name: "Info", icon: Info, href: "/sobre-nosotros" },
    { name: "Vacantes", icon: Briefcase, href: "/vacantes" },
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
      <style dangerouslySetInnerHTML={{ __html: headerStyles }} />
      <style jsx global>{`
        @keyframes scroll {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        .animate-scroll {
          animation: scroll 20s linear infinite;
        }

        @media (max-width: 768px) {
          .scroll-container::-webkit-scrollbar {
            display: none;
          }
          .scroll-container {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        }
      `}</style>
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

                <div className="flex-1 w-full max-w-xs relative">
                  <form onSubmit={handleSearch} className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchInputChange}
                      onFocus={handleSearchInputFocus}
                      onBlur={handleSearchInputBlur}
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
                  <SearchAutocomplete
                    isOpen={isAutocompleteOpen}
                    searchQuery={searchQuery}
                    searchResults={[]}
                    isSearching={false}
                    onClose={handleCloseAutocomplete}
                    onSelectProduct={handleSelectProduct}
                  />
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
                          {categories.map((category) => (
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
                          if (link.name === "Tiendas" || link.name === "Info" || link.name === "Vacantes") {
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
                <div className="flex-1 max-w-sm mx-4 relative">
                  <form onSubmit={handleSearch} className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchInputChange}
                      onFocus={handleSearchInputFocus}
                      onBlur={handleSearchInputBlur}
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
                  <SearchAutocomplete
                    isOpen={isAutocompleteOpen}
                    searchQuery={searchQuery}
                    searchResults={[]}
                    isSearching={false}
                    onClose={handleCloseAutocomplete}
                    onSelectProduct={handleSelectProduct}
                  />
                </div>

                {/* Navigation Icons */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <div className="flex items-center space-x-1">
                    <Link href="#" className="group flex flex-col items-center justify-center cursor-pointer">
                      <div className="h-4 w-4 text-[#196428] transition-colors">
                        <HomeIcon className="h-full w-full" />
                      </div>
                      <span className="text-xs font-light text-[#196428] mt-1 transition-colors">Inicio</span>
                    </Link>
                    <Link href="/tienda" className="group flex flex-col items-center justify-center cursor-pointer">
                      <div className="h-4 w-4 text-gray-500 group-hover:text-[#196428] transition-colors">
                        <ShoppingBag className="h-full w-full" />
                      </div>
                          <span className="text-xs font-light text-gray-500 mt-1 group-hover:text-[#196428] transition-colors">Tienda</span>
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
                    <Link href="/vacantes" className="group flex flex-col items-center justify-center cursor-pointer">
                      <div className="h-4 w-4 text-gray-500 group-hover:text-[#196428] transition-colors">
                        <Briefcase className="h-full w-full" />
                      </div>
                          <span className="text-xs font-light text-gray-500 mt-1 group-hover:text-[#196428] transition-colors">Vacantes</span>
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
                <div className="flex-1 max-w-md mx-6 relative">
                  <form onSubmit={handleSearch} className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchInputChange}
                      onFocus={handleSearchInputFocus}
                      onBlur={handleSearchInputBlur}
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
                  <SearchAutocomplete
                    isOpen={isAutocompleteOpen}
                    searchQuery={searchQuery}
                    searchResults={[]}
                    isSearching={false}
                    onClose={handleCloseAutocomplete}
                    onSelectProduct={handleSelectProduct}
                  />
                </div>

                {/* Navigation Icons */}
                <div className="flex items-center space-x-3 flex-shrink-0">
                  <div className="flex items-center space-x-2">
                    <Link href="#" className="group flex flex-col items-center justify-center cursor-pointer">
                      <div className="h-4 w-4 text-[#196428] transition-colors">
                        <HomeIcon className="h-full w-full" />
                      </div>
                      <span className="text-xs font-light text-[#196428] mt-1 transition-colors">Inicio</span>
                    </Link>
                    <Link href="/tienda" className="group flex flex-col items-center justify-center cursor-pointer">
                      <div className="h-4 w-4 text-gray-500 group-hover:text-[#196428] transition-colors">
                        <ShoppingBag className="h-full w-full" />
                      </div>
                          <span className="text-xs font-light text-gray-500 mt-1 group-hover:text-[#196428] transition-colors">Tienda</span>
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
                    <Link href="/vacantes" className="group flex flex-col items-center justify-center cursor-pointer">
                      <div className="h-4 w-4 text-gray-500 group-hover:text-[#196428] transition-colors">
                        <Briefcase className="h-full w-full" />
                      </div>
                          <span className="text-xs font-light text-gray-500 mt-1 group-hover:text-[#196428] transition-colors">Vacantes</span>
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
                <div className="flex-1 max-w-lg mx-8 ml-[70px] relative">
                  <form onSubmit={handleSearch} className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchInputChange}
                      onFocus={handleSearchInputFocus}
                      onBlur={handleSearchInputBlur}
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
                  <SearchAutocomplete
                    isOpen={isAutocompleteOpen}
                    searchQuery={searchQuery}
                    searchResults={[]}
                    isSearching={false}
                    onClose={handleCloseAutocomplete}
                    onSelectProduct={handleSelectProduct}
                  />
                </div>

                {/* Navigation Icons */}
                <div className="flex items-center space-x-4 flex-shrink-0">
                  <div className="flex items-center space-x-3">
                    <Link href="#" className="group flex flex-col items-center justify-center cursor-pointer">
                      <div className="h-4 w-4 text-[#196428] transition-colors">
                        <HomeIcon className="h-full w-full" />
                      </div>
                      <span className="text-xs font-light text-[#196428] mt-1 transition-colors">Inicio</span>
                    </Link>
                    <Link href="/tienda" className="group flex flex-col items-center justify-center cursor-pointer">
                      <div className="h-4 w-4 text-gray-500 group-hover:text-[#196428] transition-colors">
                        <ShoppingBag className="h-full w-full" />
                      </div>
                          <span className="text-xs font-light text-gray-500 mt-1 group-hover:text-[#196428] transition-colors">Tienda</span>
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
                    <Link href="/vacantes" className="group flex flex-col items-center justify-center cursor-pointer">
                      <div className="h-4 w-4 text-gray-500 group-hover:text-[#196428] transition-colors">
                        <Briefcase className="h-full w-full" />
                      </div>
                          <span className="text-xs font-light text-gray-500 mt-1 group-hover:text-[#196428] transition-colors">Vacantes</span>
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

        <div className="min-h-screen bg-[#FCFFEF]">
        {/* Breadcrumbs */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-sm">
              <Link href="/" className="text-gray-600 hover:text-[#196428]">Inicio</Link>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <Link href="/tienda" className="text-gray-600 hover:text-[#196428]">Tienda</Link>
              {product.subcategorias && (
                <>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                  <Link 
                    href={`/tienda?category=${product.subcategorias.categories_id}`}
                    className="text-gray-600 hover:text-[#196428]"
                  >
                    {product.subcategorias?.categories?.nombre || 'Categoría'}
                  </Link>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-800 font-medium">{product.subcategorias.nombre}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Product Content */}
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            {/* Left Column - Images */}
            <div className="space-y-3">
              {/* Main Image */}
              <div className="relative aspect-[3/2] bg-white rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg">
                <Image
                  src={product.imagen_url || '/placeholder.jpg'}
                  alt={product.nombre}
                  fill
                  className="object-contain p-1"
                  priority
                />
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  {product.descuento && (
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                      -{product.descuento_valor}% OFF
                    </span>
                  )}
                  {product.destacado && (
                    <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                      DESTACADO
                    </span>
                  )}
                  {product.novedad && (
                    <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                      NUEVO
                    </span>
                  )}
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                  <Truck className="h-5 w-5 text-[#196428] mx-auto mb-1" />
                  <p className="text-xs font-medium text-gray-700">Envío Gratis</p>
                  <p className="text-[10px] text-gray-500">En compras +$50k</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                  <Shield className="h-5 w-5 text-[#196428] mx-auto mb-1" />
                  <p className="text-xs font-medium text-gray-700">Compra Segura</p>
                  <p className="text-[10px] text-gray-500">100% Protegida</p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                  <RotateCcw className="h-5 w-5 text-[#196428] mx-auto mb-1" />
                  <p className="text-xs font-medium text-gray-700">Devolución</p>
                  <p className="text-[10px] text-gray-500">Hasta 30 días</p>
                </div>
              </div>
            </div>

            {/* Right Column - Product Info */}
            <div className="space-y-4">
              {/* Brand */}
              {product.marcas && (
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-[#196428]" />
                  <span className="text-xs text-gray-600">Marca:</span>
                  <span className="text-sm font-semibold text-[#196428]">
                    {product.marcas.nombre_marca}
                  </span>
                </div>
              )}

              {/* Title */}
              <div>
                <h1 className="text-2xl lg:text-3xl font-black text-gray-900 mb-2">
                  {product.nombre}
                </h1>
                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-600">(4.5) 128 reseñas</span>
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-bold text-gray-900">
                    ${finalPrice.toLocaleString('es-CO')}
                  </span>
                  {hasDiscount && (
                    <span className="text-lg text-gray-500 line-through">
                      ${currentPrice.toLocaleString('es-CO')}
                    </span>
                  )}
                </div>
                {hasDiscount && (
                  <div className="mb-2">
                    <span className="inline-flex items-center bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                      Save ${(currentPrice - finalPrice).toLocaleString('es-CO')} ({product.descuento_valor}% off)
                    </span>
                  </div>
                )}
                <p className="text-sm text-gray-600">Price includes VAT</p>
              </div>

              {/* Size Selection */}
              {product.tamano && product.tamano.length > 0 && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Size
                  </label>
                  <div className="space-y-2">
                    {product.tamano.map((size, index) => {
                      const sizeStock = product.stocks && product.stocks[index] ? product.stocks[index].stock : 999
                      const sizePrice = product.precios && product.precios[index] ? product.precios[index] : finalPrice
                      return (
                        <label
                          key={index}
                          className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${
                            selectedSizeIndex === index
                              ? 'border-[#232F3E] bg-gray-50 ring-1 ring-gray-200'
                              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="size"
                              value={index}
                              checked={selectedSizeIndex === index}
                              onChange={() => {
                                setSelectedSizeIndex(index)
                                setQuantity(1) // Reset cantidad cuando cambia tamaño
                              }}
                              className="w-4 h-4 text-[#232F3E] border-gray-300 focus:ring-[#232F3E] focus:ring-2"
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {size.cantidad} {size.unidad}
                              </div>
                              {sizeStock === 0 && (
                                <div className="text-xs text-red-600">
                                  Out of stock
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            ${sizePrice.toLocaleString('es-CO')}
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button
                      onClick={decrementQuantity}
                      className="px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:text-gray-300"
                      disabled={quantity <= 1}
                    >
                      <span className="text-sm font-medium">−</span>
                    </button>
                    <span className="px-3 py-2 text-sm font-medium text-gray-900 min-w-[40px] text-center border-x border-gray-300">
                      {quantity}
                    </span>
                    <button
                      onClick={incrementQuantity}
                      disabled={quantity >= currentStock}
                      className="px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:text-gray-300 disabled:cursor-not-allowed"
                    >
                      <span className="text-sm font-medium">+</span>
                    </button>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500">
                      {currentStock > 0 ? `${currentStock} in stock` : 'Out of stock'}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      Total: ${totalPrice.toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="pt-2">
                <button
                  onClick={handleAddToCart}
                  disabled={currentStock === 0}
                  className="w-full bg-[#196428] hover:bg-[#145020] text-white py-3 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="h-5 w-5 text-white" />
                  Agregar al carrito
                </button>
              </div>

              {/* Description */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4 text-[#196428]" />
                  Descripción del producto
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {product.descripcion || 'Sin descripción disponible.'}
                </p>
              </div>

              {/* Additional Info */}
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h3 className="text-base font-bold text-gray-900 mb-3">Información adicional</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-[#196428] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Envío rápido</p>
                      <p className="text-xs text-gray-600">Recíbelo en 24-48 horas</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-[#196428] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Garantía de calidad</p>
                      <p className="text-xs text-gray-600">Productos 100% originales</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-[#196428] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Atención al cliente</p>
                      <p className="text-xs text-gray-600">Soporte 24/7 para tus consultas</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-black text-gray-900 mb-4">Productos relacionados</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {relatedProducts.map((relatedProduct) => {
                  const hasSizes = relatedProduct.tamano && relatedProduct.tamano.length > 0;
                  const hasPrices = relatedProduct.precios && relatedProduct.precios.length > 0;
                  const hasDiscount = relatedProduct.descuento && relatedProduct.descuento_valor;

                  // Obtener el precio (para productos relacionados, usar el primer precio disponible)
                  const getCurrentPrice = () => {
                    if (hasPrices && relatedProduct.precios![0] !== undefined) {
                      return relatedProduct.precios![0];
                    }
                    if (relatedProduct.stocks && relatedProduct.stocks.length > 0) {
                      return relatedProduct.stocks[0].precio;
                    }
                    return 0;
                  };

                  const currentPrice = getCurrentPrice();

                  // Calcular precio con descuento
                  const getPriceWithDiscount = () => {
                    if (hasDiscount) {
                      const discount = typeof relatedProduct.descuento_valor === 'string'
                        ? parseFloat(relatedProduct.descuento_valor)
                        : Number(relatedProduct.descuento_valor);
                      return currentPrice * (1 - discount / 100);
                    }
                    return currentPrice;
                  };

                  const finalPrice = getPriceWithDiscount();

                  return (
                    <div key={relatedProduct.id} className="bg-white rounded-[20px] sm:rounded-[25px] overflow-hidden shadow-sm border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                      <div className="relative aspect-square">
                        <Link href={`/producto/${relatedProduct.id}`} className="block">
                          <Image
                            src={relatedProduct.imagen_url || "/placeholder.jpg"}
                            alt={relatedProduct.nombre}
                            fill
                            className="object-contain p-3 sm:p-4"
                          />
                        </Link>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            addToCart(relatedProduct, 1, 0)
                          }}
                          className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-[#196428] hover:bg-[#145020] text-white p-2 sm:p-2.5 rounded-full shadow-md transition-all duration-300"
                        >
                          <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>

                        {/* Badges */}
                        {relatedProduct.descuento && (
                          <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                              -{relatedProduct.descuento_valor}% OFF
                            </span>
                          </div>
                        )}
                        {relatedProduct.destacado && !relatedProduct.descuento && (
                          <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                              DESTACADO
                            </span>
                          </div>
                        )}
                        {relatedProduct.novedad && !relatedProduct.descuento && !relatedProduct.destacado && (
                          <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                              NUEVO
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-3 sm:p-4">
                        <Link href={`/producto/${relatedProduct.id}`} className="block">
                          <h3 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2 line-clamp-2 hover:text-[#196428] transition-colors">
                            {relatedProduct.nombre}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">
                            {relatedProduct.descripcion || "Descripción del producto"}
                          </p>
                        </Link>

                        {/* Mostrar tamaños si están disponibles */}
                        {hasSizes && (
                          <div className="mb-3">
                            <p className="text-xs text-gray-500 mb-1">Tamaños disponibles:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {relatedProduct.tamano!.map((tamano, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                                >
                                  {tamano.cantidad} {tamano.unidad}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Mostrar precio */}
                        {hasPrices && currentPrice > 0 ? (
                          hasDiscount ? (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                              <p className="text-red-500 font-medium text-xs sm:text-sm line-through">
                                $ {currentPrice.toLocaleString('es-CO')}
                              </p>
                              <p className="text-[#196428] font-medium text-sm sm:text-base">
                                $ {finalPrice.toLocaleString('es-CO')}
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
            </div>
          )}
        </div>

        <Footer />
      </div>

      {/* Account Drawer for Mobile */}
      <Drawer open={isAccountDrawerOpen} onOpenChange={setIsAccountDrawerOpen}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="text-center border-b border-gray-200">
            <DrawerTitle className="text-lg font-bold text-gray-800">Mi Cuenta</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-6">
            <AccountContent />
          </div>
        </DrawerContent>
      </Drawer>

      {/* Popup - Solo se muestra en primera visita */}
      {showPopup && uiElements.length > 0 && uiElements[0].popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative max-w-sm mx-auto bg-white rounded-lg shadow-xl">
            {/* Botón X para cerrar */}
            <button
              onClick={closePopup}
              className="absolute top-2 right-2 z-10 bg-white hover:bg-gray-100 rounded-full p-1 shadow-md transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Contenido del popup */}
            {uiElements[0].popup.includes('.mp4') || uiElements[0].popup.includes('.webm') || uiElements[0].popup.includes('.mov') ? (
              <video
                src={uiElements[0].popup}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-auto rounded-lg"
              />
            ) : (
              <img
                src={uiElements[0].popup}
                alt="Popup"
                className="w-full h-auto rounded-lg"
              />
            )}
          </div>
        </div>
      )}

      </div>
    </MainLayout>
  )
}


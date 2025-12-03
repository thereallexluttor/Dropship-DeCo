"use client"

import { useState, useEffect, useRef, Suspense } from 'react'
import { useParams, useRouter, usePathname, useSearchParams } from 'next/navigation'
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

function ProductPageContent() {
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { addToCart } = useCart()
  
  // Check if we're on a product page
  const isProductPage = pathname?.startsWith('/producto/')
  
  // Obtener la subcategoría desde la URL (si viene de la página de tienda)
  const subcategoriaFromUrl = searchParams.get('subcategoria')

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
  // Estados para popup (solo si es necesario)
  const [uiElements, setUiElements] = useState<UI[]>([])
  const [showPopup, setShowPopup] = useState(false)
  const popupVideoRef = useRef<HTMLVideoElement | null>(null)
  const [popupMuted, setPopupMuted] = useState(false)

  // Product states
  const [product, setProduct] = useState<Producto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [relatedProducts, setRelatedProducts] = useState<Producto[]>([])
  const [selectedSubcategoryForBreadcrumbs, setSelectedSubcategoryForBreadcrumbs] = useState<any>(null)
  
  // Estado para manejar el tamaño seleccionado de cada producto relacionado
  const [selectedRelatedSizes, setSelectedRelatedSizes] = useState<{[key: number]: number}>({})

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

  const closePopup = () => {
    setShowPopup(false);
    sessionStorage.setItem('hasVisitedHome', 'true');
  }

  const togglePopupMute = () => {
    const video = popupVideoRef.current
    if (!video) return
    const nextMuted = !popupMuted
    setPopupMuted(nextMuted)
    video.muted = nextMuted
    if (!nextMuted) {
      video.volume = 1
      const playPromise = video.play()
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.catch(() => {})
      }
    }
  }

  // Intentar reproducir con sonido cuando el popup aparece
  useEffect(() => {
    if (showPopup && popupVideoRef.current) {
      const video = popupVideoRef.current
      video.muted = popupMuted
      if (!popupMuted) {
        video.volume = 1
        const playPromise = video.play()
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.catch(() => {})
        }
      }
    }
  }, [showPopup, popupMuted])

  // Cargar popup UI solo si es necesario (diferido)
  useEffect(() => {
    // Solo cargar si no se ha visitado antes
    const hasVisited = sessionStorage.getItem('hasVisitedHome')
    if (!hasVisited) {
      const cargarElementosUI = async () => {
        try {
          const { data, error } = await supabase
            .from('ui')
            .select('*')
            .order('id', { ascending: false })
            .limit(1);

          if (error) throw error;
          if (data && data.length > 0 && data[0].popup) {
            setUiElements(data);
            setShowPopup(true);
          }
        } catch (error) {
          console.error('Error cargando elementos UI:', error);
        }
      };
      // Diferir carga del popup para no bloquear la navegación
      setTimeout(() => cargarElementosUI(), 1000);
    }
  }, []);

  // Cargar producto principal primero (crítico)
  useEffect(() => {
    const loadProduct = async () => {
      if (!params.id) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        // Obtener el parámetro de subcategoría de la URL
        const subcategoriaParam = searchParams.get('subcategoria')
        const subcategoriaIdFromUrl = subcategoriaParam ? parseInt(subcategoriaParam) : null

        // Convertir el ID a número, manejando string o string[]
        const idString = Array.isArray(params.id) ? params.id[0] : params.id
        const productId = typeof idString === 'string' ? parseInt(idString) : Number(idString)
        
        if (isNaN(productId)) {
          console.error('ID de producto inválido:', params.id)
          setIsLoading(false)
          return
        }

        // Primero intentar cargar el producto básico
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
          .eq('id', productId)
          .single()

        if (error) {
          console.error('Error cargando producto:', error)
          throw error
        }
        
        if (!data) {
          console.error('Producto no encontrado con ID:', productId)
          setIsLoading(false)
          return
        }
        
        // Cargar subcategorías adicionales si existen
        let subcategorias2 = null
        let subcategorias3 = null
        
        if (data.subcategorias_id2) {
          try {
            const { data: sub2 } = await supabase
              .from('subcategories')
              .select(`
                id,
                nombre,
                descripcion,
                categories_id,
                categories:categories_id (
                  id,
                  nombre
                )
              `)
              .eq('id', data.subcategorias_id2)
              .single()
            if (sub2) subcategorias2 = sub2
          } catch (e) {
            console.log('No se pudo cargar subcategorias_id2:', e)
          }
        }
        
        if (data.subcategorias_id3) {
          try {
            const { data: sub3 } = await supabase
              .from('subcategories')
              .select(`
                id,
                nombre,
                descripcion,
                categories_id,
                categories:categories_id (
                  id,
                  nombre
                )
              `)
              .eq('id', data.subcategorias_id3)
              .single()
            if (sub3) subcategorias3 = sub3
          } catch (e) {
            console.log('No se pudo cargar subcategorias_id3:', e)
          }
        }
        
        // Agregar las subcategorías adicionales al objeto producto
        const productWithAllSubcategories = {
          ...data,
          subcategorias2,
          subcategorias3
        }
        
        setProduct(productWithAllSubcategories)
        
        // Determinar qué subcategoría usar para los breadcrumbs
        let subcategoryToUse = null
        
        if (subcategoriaIdFromUrl) {
          // Si viene un parámetro de subcategoría en la URL, usar esa
          if (data.subcategorias_id === subcategoriaIdFromUrl && data.subcategorias) {
            subcategoryToUse = data.subcategorias
          } else if (data.subcategorias_id2 === subcategoriaIdFromUrl && subcategorias2) {
            subcategoryToUse = subcategorias2
          } else if (data.subcategorias_id3 === subcategoriaIdFromUrl && subcategorias3) {
            subcategoryToUse = subcategorias3
          }
        }
        
        // Si no se encontró por parámetro, usar la primera disponible
        if (!subcategoryToUse) {
          if (data.subcategorias) {
            subcategoryToUse = data.subcategorias
          } else if (subcategorias2) {
            subcategoryToUse = subcategorias2
          } else if (subcategorias3) {
            subcategoryToUse = subcategorias3
          }
        }
        
        setSelectedSubcategoryForBreadcrumbs(subcategoryToUse)
        setIsLoading(false) // Mostrar producto inmediatamente

        // Cargar productos relacionados después (diferido, no crítico)
        // Usar la subcategoría seleccionada para los breadcrumbs
        const subcategoryIdForRelated = subcategoriaIdFromUrl || data.subcategorias_id || data.subcategorias_id2 || data.subcategorias_id3
        if (subcategoryIdForRelated) {
          // Usar setTimeout para no bloquear el renderizado inicial
          setTimeout(async () => {
            try {
              // Intentar con filtros individuales y combinar resultados
              const [result1, result2, result3] = await Promise.all([
                supabase
                  .from('productos')
                  .select('*')
                  .eq('subcategorias_id', subcategoryIdForRelated)
                  .neq('id', productId)
                  .limit(4),
                supabase
                  .from('productos')
                  .select('*')
                  .eq('subcategorias_id2', subcategoryIdForRelated)
                  .neq('id', productId)
                  .limit(4),
                supabase
                  .from('productos')
                  .select('*')
                  .eq('subcategorias_id3', subcategoryIdForRelated)
                  .neq('id', productId)
                  .limit(4)
              ])
              
              // Combinar y eliminar duplicados
              const allRelated = [
                ...(result1.data || []), 
                ...(result2.data || []), 
                ...(result3.data || [])
              ]
              const uniqueRelated = Array.from(
                new Map(allRelated.map(product => [product.id, product])).values()
              ).slice(0, 4)
              
              setRelatedProducts(uniqueRelated)
            } catch (relatedError) {
              console.error('Error cargando productos relacionados:', relatedError)
            }
          }, 100)
        }
      } catch (error) {
        console.error('Error loading product:', error)
        setIsLoading(false)
      }
    }

    loadProduct()
  }, [params.id, searchParams])

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
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FCFFEF' }}>
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
                                <link.icon className={`h-5 w-5 ${isProductPage ? "text-gray-600" : "text-[#196428]"}`} />
                                <span className={`text-sm font-medium ${isProductPage ? "text-gray-800" : "text-[#196428]"}`}>{link.name}</span>
                              </Link>
                            );
                          }
                          if (link.name === "Carrito") {
                            return (
                              <Link key={link.name} href={link.href} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                                <link.icon className={`h-5 w-5 ${isProductPage ? "text-[#196428]" : "text-gray-600"}`} />
                                <span className={`text-sm font-medium ${isProductPage ? "text-[#196428]" : "text-gray-800"}`}>{link.name}</span>
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
                    <Link href="/" className="group flex flex-col items-center justify-center cursor-pointer">
                      <div className={`h-4 w-4 ${isProductPage ? "text-gray-500" : "text-[#196428]"} transition-colors`}>
                        <HomeIcon className="h-full w-full" />
                      </div>
                      <span className={`text-xs font-light ${isProductPage ? "text-gray-500" : "text-[#196428]"} mt-1 transition-colors`}>Inicio</span>
                    </Link>
                    <Link href="/tienda" className="group flex flex-col items-center justify-center cursor-pointer">
                      <div className="h-4 w-4 text-gray-500 group-hover:text-[#196428] transition-colors">
                        <ShoppingBag className="h-full w-full" />
                      </div>
                          <span className="text-xs font-light text-gray-500 mt-1 group-hover:text-[#196428] transition-colors">Tienda</span>
                    </Link>
                    <Link href="/carrito" className="group flex flex-col items-center justify-center cursor-pointer">
                      <div className={`h-4 w-4 ${isProductPage ? "text-[#196428]" : "text-gray-500 group-hover:text-[#196428]"} transition-colors`}>
                        <CartCounter />
                      </div>
                          <span className={`text-xs font-light ${isProductPage ? "text-[#196428]" : "text-gray-500 group-hover:text-[#196428]"} mt-1 transition-colors`}>Carrito</span>
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
                    <Link href="/" className="group flex flex-col items-center justify-center cursor-pointer">
                      <div className={`h-4 w-4 ${isProductPage ? "text-gray-500" : "text-[#196428]"} transition-colors`}>
                        <HomeIcon className="h-full w-full" />
                      </div>
                      <span className={`text-xs font-light ${isProductPage ? "text-gray-500" : "text-[#196428]"} mt-1 transition-colors`}>Inicio</span>
                    </Link>
                    <Link href="/tienda" className="group flex flex-col items-center justify-center cursor-pointer">
                      <div className="h-4 w-4 text-gray-500 group-hover:text-[#196428] transition-colors">
                        <ShoppingBag className="h-full w-full" />
                      </div>
                          <span className="text-xs font-light text-gray-500 mt-1 group-hover:text-[#196428] transition-colors">Tienda</span>
                    </Link>
                    <Link href="/carrito" className="group flex flex-col items-center justify-center cursor-pointer">
                      <div className={`h-4 w-4 ${isProductPage ? "text-[#196428]" : "text-gray-500 group-hover:text-[#196428]"} transition-colors`}>
                        <CartCounter />
                      </div>
                          <span className={`text-xs font-light ${isProductPage ? "text-[#196428]" : "text-gray-500 group-hover:text-[#196428]"} mt-1 transition-colors`}>Carrito</span>
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
                    <Link href="/" className="group flex flex-col items-center justify-center cursor-pointer">
                      <div className={`h-4 w-4 ${isProductPage ? "text-gray-500" : "text-[#196428]"} transition-colors`}>
                        <HomeIcon className="h-full w-full" />
                      </div>
                      <span className={`text-xs font-light ${isProductPage ? "text-gray-500" : "text-[#196428]"} mt-1 transition-colors`}>Inicio</span>
                    </Link>
                    <Link href="/tienda" className="group flex flex-col items-center justify-center cursor-pointer">
                      <div className="h-4 w-4 text-gray-500 group-hover:text-[#196428] transition-colors">
                        <ShoppingBag className="h-full w-full" />
                      </div>
                          <span className="text-xs font-light text-gray-500 mt-1 group-hover:text-[#196428] transition-colors">Tienda</span>
                    </Link>
                    <Link href="/carrito" className="group flex flex-col items-center justify-center cursor-pointer">
                      <div className={`h-4 w-4 ${isProductPage ? "text-[#196428]" : "text-gray-500 group-hover:text-[#196428]"} transition-colors`}>
                        <CartCounter />
                      </div>
                          <span className={`text-xs font-light ${isProductPage ? "text-[#196428]" : "text-gray-500 group-hover:text-[#196428]"} mt-1 transition-colors`}>Carrito</span>
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

        <div className="flex-1 py-8" style={{ backgroundColor: '#FCFFEF' }}>
        <div className="container mx-auto px-4 max-w-[1200px]">
          {/* Breadcrumbs */}
          <div className="mb-6 text-xs sm:text-sm text-gray-500 flex items-center gap-2 pl-2">
              <Link href="/" className="hover:text-gray-900 transition-colors">Inicio</Link>
              <ChevronRight className="h-3 w-3" />
              <Link href="/tienda" className="hover:text-gray-900 transition-colors">Tienda</Link>
              {selectedSubcategoryForBreadcrumbs && (
                <>
                  <ChevronRight className="h-3 w-3" />
                  <Link 
                    href={`/tienda?categoria=${selectedSubcategoryForBreadcrumbs.categories_id}&subcategoria=${selectedSubcategoryForBreadcrumbs.id}`}
                    className="hover:text-gray-900 transition-colors"
                  >
                    {selectedSubcategoryForBreadcrumbs?.categories?.nombre || 'Categoría'}
                  </Link>
                  <ChevronRight className="h-3 w-3" />
                  <Link 
                    href={`/tienda?categoria=${selectedSubcategoryForBreadcrumbs.categories_id}&subcategoria=${selectedSubcategoryForBreadcrumbs.id}`}
                    className="text-gray-900 font-bold hover:text-[#196428]"
                  >
                    {selectedSubcategoryForBreadcrumbs.nombre}
                  </Link>
                </>
              )}
          </div>

          {/* Product Card Container */}
          <div className="bg-white rounded-[30px] shadow-xl overflow-hidden flex flex-col lg:flex-row min-h-[600px] border border-white">
            
            {/* Left Column - Image */}
            <div className="w-full lg:w-[58%] bg-white relative p-8 lg:p-16 flex flex-col items-center justify-center">
               {/* Badges */}
               <div className="absolute top-8 left-8 flex flex-col gap-2 z-10">
                  {product.descuento && (
                    <span className="bg-black text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-wider shadow-sm">
                      -{product.descuento_valor}%
                    </span>
                  )}
                  {product.destacado && !product.descuento && (
                    <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-wider shadow-sm">
                      DESTACADO
                    </span>
                  )}
                  {product.novedad && !product.descuento && !product.destacado && (
                    <span className="bg-green-500 text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-wider shadow-sm">
                      NUEVO
                    </span>
                  )}
               </div>

               {/* Main Image */}
               <div className="relative w-full max-w-md aspect-square z-0">
                  <Image
                    src={product.imagen_url || '/placeholder.jpg'}
                    alt={product.nombre}
                    fill
                    className="object-contain hover:scale-105 transition-transform duration-500"
                    priority
                  />
               </div>
            </div>

            {/* Right Column - Info */}
            <div className="w-full lg:w-[42%] bg-white p-8 lg:p-12 flex flex-col">
               
               {/* Header Info */}
               <div className="mb-1">
                  {product.marcas && (
                      <span className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase mb-2 block">
                          {product.marcas.nombre_marca}
                      </span>
                  )}
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-[1.1] mb-3 tracking-tight">
                      {product.nombre}
                  </h1>
               </div>

               {/* Description */}
               <p className="text-gray-500 text-sm leading-relaxed mb-8">
                   {product.descripcion || "Descripción detallada del producto. Fabricado con los mejores materiales para garantizar calidad y durabilidad."}
               </p>

               {/* Price */}
               <div className="mb-8">
                   <div className="flex items-baseline gap-3">
                       <span className="text-4xl font-bold text-gray-900">
                           ${finalPrice.toLocaleString('es-CO')}
                       </span>
                       {hasDiscount && (
                          <span className="text-lg text-gray-400 line-through decoration-2 font-medium">
                              ${currentPrice.toLocaleString('es-CO')}
                          </span>
                       )}
                   </div>
                   <span className="text-xs text-gray-400 font-medium mt-1 block">Price includes VAT</span>
               </div>

               {/* Stock Info */}
               <div className="mb-8">
                   <span className={`text-sm font-bold ${
                       currentStock > 0 
                           ? 'text-[#196428]' 
                           : 'text-red-600'
                   }`}>
                       {currentStock > 0 
                           ? `${currentStock} unidades disponibles` 
                           : 'Sin stock disponible'}
                   </span>
               </div>

               {/* Size Selector */}
               {product.tamano && product.tamano.length > 0 && (
                   <div className="mb-8">
                       <span className="text-xs font-bold uppercase tracking-wide text-gray-900 mb-3 block">
                           Tamaño
                       </span>
                       <div className="flex flex-wrap gap-2">
                           {product.tamano.map((size, index) => (
                               <button
                                   key={index}
                                   onClick={() => {
                                       setSelectedSizeIndex(index);
                                       setQuantity(1);
                                   }}
                                   className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-semibold transition-all ${
                                       selectedSizeIndex === index
                                       ? 'bg-green-200 text-[#196428] border-2 border-[#196428]'
                                       : 'bg-green-50 text-gray-700'
                                   }`}
                               >
                                   {size.cantidad} {size.unidad}
                               </button>
                           ))}
                       </div>
                   </div>
               )}

               {/* Actions */}
               <div className="mt-auto flex flex-col gap-4">
                   <div className="flex items-center gap-4">
                       {/* Quantity */}
                       <div className="flex items-center border border-gray-200 rounded-xl h-14 w-32 px-2 bg-white">
                           <button 
                               onClick={decrementQuantity}
                               disabled={quantity <= 1}
                               className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-black transition-colors text-xl disabled:opacity-30"
                           >−</button>
                           <span className="flex-1 text-center font-bold text-gray-900 text-lg">{quantity}</span>
                           <button 
                               onClick={incrementQuantity}
                               disabled={quantity >= currentStock}
                               className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-black transition-colors text-xl disabled:opacity-30"
                           >+</button>
                       </div>
                       
                       {/* Add to Cart Button */}
                       <button
                           onClick={handleAddToCart}
                           disabled={currentStock === 0}
                           className="flex-1 h-14 bg-[#196428] hover:bg-[#145020] text-white rounded-xl font-normal text-sm tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                       >
                           Agregar al carrito
                       </button>
                   </div>
               </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-20">
              <h2 className="text-2xl font-black text-gray-900 mb-8 pl-2">Productos relacionados</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 pb-4">
                {relatedProducts.map((relatedProduct) => {
                  const selectedSizeIndex = selectedRelatedSizes[relatedProduct.id!] || 0;
                  const hasSizes = relatedProduct.tamano && relatedProduct.tamano.length > 0;
                  const hasPrices = relatedProduct.precios && relatedProduct.precios.length > 0;

                  const getCurrentPrice = () => {
                    if (hasSizes && hasPrices && relatedProduct.precios![selectedSizeIndex] !== undefined) {
                      return relatedProduct.precios![selectedSizeIndex];
                    }
                    if (relatedProduct.stocks && relatedProduct.stocks.length > selectedSizeIndex) {
                      return relatedProduct.stocks[selectedSizeIndex].precio;
                    }
                    return 0;
                  };

                  const currentPrice = getCurrentPrice();

                  const getPriceWithDiscount = () => {
                    if (relatedProduct.descuento && relatedProduct.descuento_valor) {
                      const discount = typeof relatedProduct.descuento_valor === 'string'
                        ? parseFloat(relatedProduct.descuento_valor)
                        : Number(relatedProduct.descuento_valor);
                      return currentPrice * (1 - discount / 100);
                    }
                    return currentPrice;
                  };

                  const finalPrice = getPriceWithDiscount();
                  const hasDiscount = relatedProduct.descuento && relatedProduct.descuento_valor;

                  return (
                    <Link key={relatedProduct.id} href={`/producto/${relatedProduct.id}`} className="block h-full group">
                      <div className="bg-white rounded-2xl overflow-hidden transition-all duration-300 h-full flex flex-col border border-gray-100 hover:border-gray-200" style={{ fontFamily: '"Helvetica Neue", sans-serif' }}>
                        <div className="relative aspect-[4/3] flex-shrink-0 bg-white">
                          <Image
                            src={relatedProduct.imagen_url || "/placeholder.jpg"}
                            alt={relatedProduct.nombre}
                            fill
                            className="object-contain p-3 sm:p-4 md:p-5 transition-transform duration-300 group-hover:scale-105"
                          />
                          {relatedProduct.descuento && (
                            <div className="absolute top-3 left-3 bg-black text-white px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold tracking-wide">
                              -{relatedProduct.descuento_valor}%
                            </div>
                          )}
                          {relatedProduct.destacado && !relatedProduct.descuento && (
                            <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold tracking-wide">
                              DESTACADO
                            </div>
                          )}
                          {relatedProduct.novedad && !relatedProduct.descuento && !relatedProduct.destacado && (
                            <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold tracking-wide">
                              NUEVO
                            </div>
                          )}
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              addToCart(relatedProduct, 1, selectedSizeIndex)
                            }}
                            className="absolute top-3 right-3 bg-white hover:bg-[#196428] text-gray-700 hover:text-white p-2.5 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
                          >
                            <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                        </div>
                        <div className="p-3 sm:p-4 flex-1 flex flex-col gap-1.5">
                          <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-[#196428] transition-colors">
                            {relatedProduct.nombre}
                          </h3>
                          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed line-clamp-2">
                            {relatedProduct.descripcion || "Producto de calidad premium"}
                          </p>

                          {hasSizes && (
                            <div className="mt-1">
                              <p className="text-[10px] sm:text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wide">Tamaños</p>
                              <div className="flex flex-wrap gap-1.5">
                                {relatedProduct.tamano!.slice(0, 3).map((tamano, index) => (
                                  <button
                                    key={index}
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      setSelectedRelatedSizes({...selectedRelatedSizes, [relatedProduct.id!]: index})
                                    }}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-semibold transition-all ${
                                      selectedSizeIndex === index
                                        ? 'bg-green-200 text-[#196428] border-2 border-[#196428]'
                                        : 'bg-green-50 text-gray-700'
                                    }`}
                                  >
                                    {tamano.cantidad} {tamano.unidad}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {hasPrices && currentPrice > 0 ? (
                            <div className="mt-auto pt-2">
                              {hasDiscount ? (
                                <div className="flex items-baseline gap-2">
                                  <span className="text-lg sm:text-xl font-black text-gray-900">
                                    ${finalPrice.toLocaleString('es-CO')}
                                  </span>
                                  <span className="text-[10px] sm:text-xs font-medium text-gray-400 line-through">
                                    ${currentPrice.toLocaleString('es-CO')}
                                  </span>
                                  <span className="text-[9px] sm:text-[10px] font-semibold text-red-600">
                                    -{relatedProduct.descuento_valor}%
                                  </span>
                                </div>
                              ) : (
                                <span className="text-lg sm:text-xl font-black text-gray-900">
                                  ${currentPrice.toLocaleString('es-CO')}
                                </span>
                              )}
                            </div>
                          ) : (
                            <p className="mt-auto text-gray-400 text-xs italic">Precio no disponible</p>
                          )}
                        </div>
                      </div>
                    </Link>
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
              <div className="relative">
                <video
                  ref={popupVideoRef}
                  src={uiElements[0].popup}
                  autoPlay
                  muted={popupMuted}
                  loop
                  playsInline
                  className="w-full h-auto rounded-lg"
                />
                <button
                  onClick={togglePopupMute}
                  className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full shadow"
                >
                  {popupMuted ? 'Activar sonido' : 'Silenciar'}
                </button>
              </div>
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

export default function ProductPage() {
  return (
    <Suspense fallback={
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center bg-[#FCFFEF]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#196428] mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando producto...</p>
          </div>
        </div>
      </MainLayout>
    }>
      <ProductPageContent />
    </Suspense>
  )
}

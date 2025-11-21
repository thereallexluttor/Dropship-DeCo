"use client"

import Image from "next/image"
import Link from "next/link" 
import { useRouter } from "next/navigation"
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
  Briefcase
} from "lucide-react"
import { useState, useEffect, useRef, useMemo } from "react"
import { supabase, Producto, UI } from '@/lib/supabase'
import { useCategories } from './hooks/useCategories'
import { useProducts } from './hooks/useProducts'
import { useCart } from './contexts/CartContext'
import CartCounter from './components/CartCounter'
import ProductCard from "./components/ProductCard"
import FadeInOnScroll from './components/FadeInOnScroll'
import CategoryMenu from './components/CategoryMenu'
import StoreLocator from './components/StoreLocator'
import ProductSizeBadges from './components/ProductSizeBadges'
import Footer from './components/Footer'
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
import MainLayout from "./components/MainLayout"
import CategoryDropdown from "./components/CategoryDropdown"
import AccountPopover from "./components/AccountPopover"
import AccountPopoverContent from "./components/AccountPopoverContent"
import SearchAutocomplete from "./components/SearchAutocomplete"

// Helper to leverage Supabase Image Transformations for faster, cheaper delivery
function optimizeSupabaseImage(url: string, width: number, quality: number = 60, format: string = 'webp') {
  try {
    const base = typeof window === 'undefined' ? 'http://localhost' : window.location.origin
    const parsed = new URL(url, base)
    if (parsed.hostname.includes('supabase.co')) {
      parsed.searchParams.set('width', String(width))
      parsed.searchParams.set('quality', String(quality))
      parsed.searchParams.set('format', format)
      return parsed.toString()
    }
    return url
  } catch {
    return url
  }
}

export default function Home() {
  const router = useRouter()
  const [activeSlide, setActiveSlide] = useState(0)
  const [activeHiddenSlide, setActiveHiddenSlide] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false)
  const [activeProductSlide, setActiveProductSlide] = useState(0)
  const [activeMobileProductSlide, setActiveMobileProductSlide] = useState(0)
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
  const popupVideoRef = useRef<HTMLVideoElement | null>(null)
  const [popupMuted, setPopupMuted] = useState(false)
  const [showChristmasTheme, setShowChristmasTheme] = useState(false)
  // Estado para manejar el tamaño seleccionado de cada producto
  const [selectedSizes, setSelectedSizes] = useState<{[key: number]: number}>({})

  // Usar el contexto del carrito
  const { addToCart } = useCart()

  // Usar el hook personalizado para cargar categorías dinámicamente
  const { categories, isLoading: categoriesLoading, error: categoriesError } = useCategories()

  // Usar el hook de productos para búsqueda
  const { searchProducts, isSearching, liveSearchResults, isLiveSearching, updateLiveSearchQuery, clearLiveSearchResults } = useProducts()

  // Función para cargar aliados
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

  // Los aliados se cargan dinámicamente desde la base de datos
  // Usar aliados de BD si existen, sino usar las marcas por defecto
  const brands = aliados.length > 0 ? aliados.map(aliado => ({
    src: aliado.imagen_url,
    alt: aliado.nombre
  })) : [
    { src: "/brands/royal-canin.png", alt: "Royal Canin" },
    { src: "/brands/real-nature.png", alt: "Real Nature" },
    { src: "/brands/naturally-good.png", alt: "Naturally Good" },
    { src: "/brands/select-gold.png", alt: "Select Gold" },
    { src: "/brands/purina.png", alt: "Purina" },
    { src: "/brands/hills.png", alt: "Hill's" },
    { src: "/brands/acana.png", alt: "Acana" },
    { src: "/brands/orijen.png", alt: "Orijen" },
    { src: "/brands/eukanuba.png", alt: "Eukanuba" },
    { src: "/brands/advance.png", alt: "Advance" },
    { src: "/brands/crave.png", alt: "Crave" },
    { src: "/brands/ultima.png", alt: "Ultima" },
  ];

  const brandsPerSlide = 6;
  // Calcular el número correcto de slides necesarios
  // Siempre debe haber al menos 1 slide, incluso si hay 0 aliados (usará los datos por defecto)
  const totalBrandSlides = Math.max(1, Math.ceil(brands.length / brandsPerSlide));

  const nextBrandSlide = () => {
    setActiveBrandSlide((current) => (current + 1) % totalBrandSlides);
  };

  const prevBrandSlide = () => {
    setActiveBrandSlide((current) => (current - 1 + totalBrandSlides) % totalBrandSlides);
  };

  // Exponer función para recargar aliados (para uso desde AdminDashboard)
  useEffect(() => {
    (window as any).recargarAliados = cargarAliados;
    return () => {
      delete (window as any).recargarAliados;
    };
  }, []);

  // Cargar datos críticos primero (banners UI), luego diferir el resto
  useEffect(() => {
    // Cargar solo banners UI primero (crítico para mostrar la página)
    const cargarBannersUI = async () => {
      try {
        const { data, error } = await supabase
          .from('ui')
          .select('banner, popup')
          .order('id', { ascending: false })
          .limit(1);

        if (error) throw error;
        if (data && data.length > 0) {
          setUiElements(data);
        }
      } catch (error) {
        console.error('Error cargando banners UI:', error);
      }
    };

    cargarBannersUI();

    // Diferir cargas no críticas para no bloquear el renderizado inicial
    setTimeout(() => {
      // Cargar productos destacados (diferido)
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

      // Cargar productos en oferta (diferido)
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

      // Cargar aliados (diferido)
      cargarAliados();

      // Ejecutar en paralelo
      Promise.all([
        cargarProductosDestacados(),
        cargarProductosEnOferta()
      ]).catch(console.error);
    }, 100);
  }, []);

  // Resetear el slide activo cuando cambie la cantidad de aliados o el total de slides
  useEffect(() => {
    // Resetear si el slide actual es mayor o igual al total de slides disponibles
    if (activeBrandSlide >= totalBrandSlides && totalBrandSlides > 0) {
      setActiveBrandSlide(0);
    }
  }, [aliados.length, totalBrandSlides, activeBrandSlide]);

  // Mostrar popup en primera visita
  useEffect(() => {
    const hasVisited = sessionStorage.getItem('hasVisitedHome');
    const hasPopup = uiElements.length > 0 && uiElements[0].popup;

    if (!hasVisited && hasPopup) {
      // Pequeño delay para asegurar que todo esté cargado
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [uiElements]);

  // Mostrar tema navideño en primera visita
  useEffect(() => {
    const hasSeenChristmas = sessionStorage.getItem('hasSeenChristmas');
    if (!hasSeenChristmas) {
      setShowChristmasTheme(true);
      // Guardar después de 30 segundos para que se muestre por un tiempo
      const timer = setTimeout(() => {
        sessionStorage.setItem('hasSeenChristmas', 'true');
        setShowChristmasTheme(false);
      }, 30000); // 30 segundos
      return () => clearTimeout(timer);
    }
  }, []);


  // Obtener los slides del carrusel (banners de UI o videos por defecto)
  const getCarouselSlides = () => {
    if (uiElements.length > 0 && uiElements[0].banner && uiElements[0].banner.length > 0) {
      return uiElements[0].banner.map((url, index) => ({
        url,
        alt: `Banner promocional ${index + 1}`,
        type: url.includes('.mp4') || url.includes('.webm') || url.includes('.mov') ? 'video' : 'image'
      }));
    }
    return [
      { url: "/farm1.mp4", alt: "Video promocional 1", type: 'video' },
      { url: "/farm2.mp4", alt: "Video promocional 2", type: 'video' },
      { url: "/farm1.mp4", alt: "Video promocional 3", type: 'video' },
      { url: "/farm2.mp4", alt: "Video promocional 4", type: 'video' }
    ];
  };

  // Obtener el hidden banner si existe
  const getHiddenBannerSlides = () => {
    if (uiElements.length > 0 && uiElements[0].hiddenbanner && uiElements[0].hiddenbanner.length > 0) {
      return uiElements[0].hiddenbanner.map((url, index) => ({
        url,
        alt: `Hidden Banner ${index + 1}`,
        type: url.includes('.mp4') || url.includes('.webm') || url.includes('.mov') ? 'video' : 'image'
      }));
    }
    return [];
  };

  const carouselSlides = getCarouselSlides();

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((current) => (current === carouselSlides.length - 1 ? 0 : current + 1));
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [carouselSlides.length]);

  // Timer independiente para el hidden banner
  useEffect(() => {
    const hiddenSlides = getHiddenBannerSlides();
    if (hiddenSlides.length > 0) {
      const timer = setInterval(() => {
        setActiveHiddenSlide((current) => (current === hiddenSlides.length - 1 ? 0 : current + 1));
      }, 5000); // Change slide every 5 seconds

      return () => clearInterval(timer);
    }
  }, [uiElements]);

  useEffect(() => {
    const brandTimer = setInterval(() => {
      setActiveBrandSlide(current => (current + 1) % totalBrandSlides);
    }, 5000);

    return () => clearInterval(brandTimer);
  }, [totalBrandSlides]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      try {
        const results = await searchProducts(searchQuery.trim())
        if (results.length > 0) {
          // Navegar a la página de tienda con los resultados de búsqueda
          window.location.href = `/tienda?search=${encodeURIComponent(searchQuery.trim())}`
        } else {
          console.log("No se encontraron productos para:", searchQuery)
        }
      } catch (error) {
        console.error("Error en la búsqueda:", error)
      }
    }
  }

  // Funciones para manejar el autocompletado
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    updateLiveSearchQuery(value)

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
    // Pequeño delay para permitir clicks en el autocompletado
    setTimeout(() => {
      setIsAutocompleteOpen(false)
    }, 200)
  }

  const handleCloseAutocomplete = () => {
    setIsAutocompleteOpen(false)
  }

  const handleSelectProduct = (product: any) => {
    setSearchQuery(product.nombre)
    updateLiveSearchQuery(product.nombre)
    window.location.href = `/tienda?search=${encodeURIComponent(product.nombre)}`
  }

  const handleAddToCart = (producto: Producto) => {
    addToCart(producto, 1)
    // Aquí podrías agregar una notificación o toast
    console.log(`Agregado al carrito: ${producto.nombre}`)
  }

  const PRODUCTS_PER_SLIDE = 8
  const MOBILE_PRODUCTS_PER_SLIDE = 4 // 2x2 grid
  const totalProductSlides = Math.max(1, Math.ceil(productosDestacados.length / PRODUCTS_PER_SLIDE))
  const totalMobileProductSlides = Math.max(1, Math.ceil(productosDestacados.length / MOBILE_PRODUCTS_PER_SLIDE))

  const nextProductSlide = () => {
    setActiveProductSlide((current) => (current + 1) % totalProductSlides)
  }

  const prevProductSlide = () => {
    setActiveProductSlide((current) => (current - 1 + totalProductSlides) % totalProductSlides)
  }

  const nextMobileProductSlide = () => {
    setActiveMobileProductSlide((current) => (current + 1) % totalMobileProductSlides)
  }

  const prevMobileProductSlide = () => {
    setActiveMobileProductSlide((current) => (current - 1 + totalMobileProductSlides) % totalMobileProductSlides)
  }

  useEffect(() => {
    if (activeProductSlide >= totalProductSlides) {
      setActiveProductSlide(Math.max(0, totalProductSlides - 1))
    }
  }, [activeProductSlide, totalProductSlides])

  useEffect(() => {
    if (activeMobileProductSlide >= totalMobileProductSlides) {
      setActiveMobileProductSlide(Math.max(0, totalMobileProductSlides - 1))
    }
  }, [activeMobileProductSlide, totalMobileProductSlides])

  const closePopup = () => {
    setShowPopup(false);
    sessionStorage.setItem('hasVisitedHome', 'true');
  }

  const togglePopupMute = () => {
    const video = popupVideoRef.current
    if (!video) return
    // Toggle muted and attempt to play with sound after a user gesture
    const nextMuted = !popupMuted
    setPopupMuted(nextMuted)
    video.muted = nextMuted
    if (!nextMuted) {
      video.volume = 1
      const playPromise = video.play()
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.catch(() => {
          // Ignore play errors silently (some browsers block without gesture)
        })
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

  // Generar copos de nieve (fuera del condicional para cumplir con las reglas de hooks)
  const snowflakes = useMemo(() => {
    return Array.from({ length: 50 }).map((_, i) => {
      const left = Math.random() * 100;
      const animationDuration = Math.random() * 3 + 2; // 2-5 segundos
      const animationDelay = Math.random() * 2;
      const size = Math.random() * 10 + 10; // 10-20px
      const opacity = Math.random() * 0.5 + 0.5; // 0.5-1

      return {
        id: i,
        left,
        animationDuration,
        animationDelay,
        size,
        opacity,
      };
    });
  }, [])

  // Categorías se cargan dinámicamente desde el hook useCategories

  // Mostrar indicador de carga mientras se cargan las categorías
  if (categoriesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#196428] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando categorías...</p>
        </div>
      </div>
    );
  }

  // Mostrar error si hay un problema cargando categorías
  if (categoriesError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error cargando categorías: {categoriesError}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#196428] hover:bg-[#145020] text-white px-6 py-2 rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }
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
      <div className="flex flex-col flex-1" style={{ backgroundColor: '#FCFFEF', marginBottom: 0, paddingBottom: 0, minHeight: 0 }}>
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
                    searchResults={liveSearchResults}
                    isSearching={isLiveSearching}
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
                    searchResults={liveSearchResults}
                    isSearching={isLiveSearching}
                    onClose={handleCloseAutocomplete}
                    onSelectProduct={handleSelectProduct}
                  />
                </div>

                {/* Navigation Icons */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <div className="flex items-center space-x-1">
                    <Link href="#" prefetch className="group flex flex-col items-center justify-center cursor-pointer" onMouseEnter={() => router.prefetch("/")}>
                      <div className="h-4 w-4 text-[#196428] transition-colors">
                        <HomeIcon className="h-full w-full" />
                      </div>
                      <span className="text-xs font-light text-[#196428] mt-1 transition-colors">Inicio</span>
                    </Link>
                    <Link href="/tienda" prefetch className="group flex flex-col items-center justify-center cursor-pointer" onMouseEnter={() => router.prefetch("/tienda")}>
                      <div className="h-4 w-4 text-gray-500 group-hover:text-[#196428] transition-colors">
                        <ShoppingBag className="h-full w-full" />
                      </div>
                          <span className="text-xs font-light text-gray-500 mt-1 group-hover:text-[#196428] transition-colors">Tienda</span>
                    </Link>
                    <Link href="/carrito" prefetch className="group flex flex-col items-center justify-center cursor-pointer" onMouseEnter={() => router.prefetch("/carrito")}>
                      <div className="h-4 w-4 text-gray-500 group-hover:text-[#196428] transition-colors">
                        <CartCounter />
                      </div>
                          <span className="text-xs font-light text-gray-500 mt-1 group-hover:text-[#196428] transition-colors">Carrito</span>
                    </Link>
                    <AccountPopover />
                  </div>
                  <div className="w-[1px] h-6 bg-gray-200"></div>
                  <div className="flex items-center space-x-1">
                    <Link href="/sobre-nosotros" prefetch className="group flex flex-col items-center justify-center cursor-pointer" onMouseEnter={() => router.prefetch("/sobre-nosotros")}>
                      <div className="h-4 w-4 text-gray-500 group-hover:text-[#196428] transition-colors">
                        <Info className="h-full w-full" />
                      </div>
                          <span className="text-xs font-light text-gray-500 mt-1 group-hover:text-[#196428] transition-colors">Info</span>
                    </Link>
                    <Link href="/vacantes" prefetch className="group flex flex-col items-center justify-center cursor-pointer" onMouseEnter={() => router.prefetch("/vacantes")}>
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
                    searchResults={liveSearchResults}
                    isSearching={isLiveSearching}
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
                    searchResults={liveSearchResults}
                    isSearching={isLiveSearching}
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

        <main className="flex-1">
          {/* Category Grid */}
          <div className="hidden md:block container mx-auto px-4 py-3 relative">
            <div className="flex flex-col">
              <div className="flex justify-center">
                <div className="flex flex-nowrap justify-center gap-0.5 sm:gap-1 md:gap-0 lg:gap-2" ref={categoriesContainerRef}>
                  {categories.map((category) => (
                    <CategoryMenu key={category.name} category={category} containerRef={categoriesContainerRef} />
                  ))}
                </div>
              </div>
              <div className="w-full h-[1px] bg-gray-200 mt-3"></div>
            </div>
          </div>

          <section className="relative w-full">
            <div className="container mx-auto px-4">
                <div className="relative aspect-[16/6] w-full max-w-6xl mx-auto">
                {/* Carousel */}
                <div className="absolute inset-0">
                  {carouselSlides.map((slide, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                        activeSlide === index ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      {slide.type === 'video' ? (
                        <video
                          src={slide.url}
                          autoPlay
                          muted
                          loop
                          playsInline
                          preload="metadata"
                          className="absolute inset-0 w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="relative w-full h-full">
                          <Image
                            src={slide.url}
                            alt={slide.alt}
                            fill
                            className="object-cover rounded-lg"
                            sizes="100vw"
                            priority={index === 0}
                          />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center">
                        <div className="container mx-auto px-2 xs:px-3 sm:px-4">
                          {/* Texto y botón a la izquierda */}
                          <div className="text-left ml-[3%] xs:ml-[4%] sm:ml-[5%] md:ml-[7%] lg:ml-[8%]">
                            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-white drop-shadow-lg mb-2 sm:mb-3 md:mb-4 lg:mb-5 max-w-[90%] sm:max-w-[80%] md:max-w-[70%] lg:max-w-[60%] leading-tight">
                              Descubre las<br />
                              mejores ofertas
                            </h2>
                            <Link
                              href="/tienda"
                              className="inline-block bg-[#196428] hover:bg-[#196428] text-white
                              text-xs sm:text-sm md:text-base lg:text-lg
                              py-0.5 sm:py-1 md:py-1.5 lg:py-2
                              px-4 sm:px-5 md:px-6 lg:px-7
                              rounded-full border-2 border-white transition-all duration-300 transform hover:scale-105 shadow-lg"
                            >
                              click aquí
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </section>

          {/* Ofertas de la semana */}
          {productosEnOferta.length >= 4 && (
            <section className="py-6 sm:py-8 md:py-10" style={{ backgroundColor: '#FCFFEF' }}>
              <div className="container mx-auto px-3 sm:px-4 max-w-6xl">
                <h2 className="text-2xl sm:text-2.5xl md:text-3xl font-black text-black mb-4 sm:mb-6 md:mb-7">Ofertas de la semana</h2>
                <div className="flex md:grid md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 overflow-x-auto pb-4 md:pb-2 md:overflow-x-hidden scroll-container">
                  <style jsx global>{`
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
                  {productosEnOferta.slice(0, 4).map((producto) => {
                    const selectedSizeIndex = selectedSizes[producto.id!] || 0;
                    const hasSizes = producto.tamano && producto.tamano.length > 0;
                    const hasPrices = producto.precios && producto.precios.length > 0;
                    
                    const getCurrentPrice = () => {
                      if (hasSizes && hasPrices && producto.precios![selectedSizeIndex] !== undefined) {
                        return producto.precios![selectedSizeIndex];
                      }
                      return 0;
                    };

                    const currentPrice = getCurrentPrice();

                    return (
                    <Link key={producto.id} href={`/producto/${producto.id}`} className="flex-none w-[170px] xs:w-[180px] md:w-full block group">
                      <div className="bg-white rounded-2xl overflow-hidden  transition-all duration-300 h-full flex flex-col border border-gray-100 hover:border-gray-200" style={{ fontFamily: '"Helvetica Neue", sans-serif' }}>
                        {/* Imagen del producto */}
                        <div className="relative aspect-[4/3] flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100">
                          <Image
                            src={producto.imagen_url ? optimizeSupabaseImage(producto.imagen_url, 600, 60) : '/placeholder.jpg'}
                            alt={producto.nombre}
                            fill
                            className="object-contain p-3 sm:p-4 md:p-5 transition-transform duration-300 group-hover:scale-105"
                          />
                          {/* Badge de oferta - estilo Nike */}
                          {producto.descuento && (
                            <div className="absolute top-3 left-3 bg-black text-white px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold tracking-wide">
                              OFERTA
                            </div>
                          )}
                          {/* Badge destacado si aplica */}
                          {producto.destacado && !producto.descuento && (
                            <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold tracking-wide">
                              DESTACADO
                            </div>
                          )}
                          {/* Botón de carrito flotante */}
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleAddToCart(producto)
                            }}
                            className="absolute top-3 right-3 bg-white hover:bg-[#196428] text-gray-700 hover:text-white p-2.5 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
                          >
                            <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                          </button>
                        </div>
                        
                        {/* Contenido de la card */}
                        <div className="p-3 sm:p-4 flex-1 flex flex-col gap-1.5">
                          {/* Título */}
                          <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-[#196428] transition-colors">
                            {producto.nombre}
                          </h3>
                          
                          {/* Descripción */}
                          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed line-clamp-2">
                            {(() => {
                              const fallback = 'Producto de calidad premium'
                              const words = (producto.descripcion?.trim() || fallback).split(/\s+/)
                              const truncated = words.slice(0, 8).join(' ')
                              return words.length > 8 ? `${truncated}…` : truncated
                            })()}
                          </p>

                          {/* Tamaños del producto */}
                          {hasSizes && (
                            <div className="mt-1">
                              <p className="text-[10px] sm:text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wide">Tamaños</p>
                              <div className="flex flex-wrap gap-1.5">
                                {producto.tamano!.slice(0, 3).map((tamano, index) => (
                                  <button
                                    key={index}
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      setSelectedSizes({...selectedSizes, [producto.id!]: index})
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

                          {/* Precio */}
                          {hasPrices && currentPrice > 0 ? (
                            <div className="mt-auto pt-2">
                              {producto.descuento_valor ? (
                                <div className="flex items-baseline gap-2">
                                  <span className="text-lg sm:text-xl font-black text-gray-900">
                                    ${(() => {
                                      const descuentoValor = typeof producto.descuento_valor === 'string' ? parseFloat(producto.descuento_valor) : Number(producto.descuento_valor)
                                      const precioConDescuento = currentPrice * (1 - (descuentoValor / 100))
                                      return precioConDescuento.toLocaleString('es-CO')
                                    })()}
                                  </span>
                                  <span className="text-[10px] sm:text-xs font-medium text-gray-400 line-through">
                                    ${currentPrice.toLocaleString('es-CO')}
                                  </span>
                                  <span className="text-[9px] sm:text-[10px] font-semibold text-red-600">
                                    -{producto.descuento_valor}%
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
            </section>
          )}

          {/* Productos destacados */}
          <section className="py-6 sm:py-8 md:py-10" style={{ backgroundColor: '#FCFFEF' }}>
            <div className="container mx-auto px-3 sm:px-4 max-w-6xl">
              <h2 className="text-2xl sm:text-2.5xl md:text-3xl font-black text-black mb-4 sm:mb-6 md:mb-7">Productos destacados</h2>
              
              {/* Vista móvil: carrusel 2x2 */}
              <div className="md:hidden">
                <div className="flex items-center gap-1.5 mb-4">
                  {/* Botón de navegación izquierdo */}
                  <button 
                    onClick={prevMobileProductSlide}
                    className="flex-shrink-0 bg-white p-1.5 rounded-full border border-[#196428] hover:bg-green-50 transition-colors duration-300"
                  >
                    <svg className="w-3.5 h-3.5 text-[#196428]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Contenedor del carrusel */}
                  <div className="flex-grow overflow-hidden pb-2">
                    <div
                      className="flex transition-transform duration-500 ease-in-out"
                      style={{ transform: `translateX(-${activeMobileProductSlide * 100}%)` }}
                    >
                      {Array.from({ length: totalMobileProductSlides }).map((_, slideIndex) => {
                        const slideProducts = productosDestacados.slice(
                          slideIndex * MOBILE_PRODUCTS_PER_SLIDE,
                          slideIndex * MOBILE_PRODUCTS_PER_SLIDE + MOBILE_PRODUCTS_PER_SLIDE
                        )
                        return (
                          <div key={slideIndex} className="w-full flex-shrink-0 px-1">
                            <div className="grid grid-cols-2 gap-3 pb-2">
                              {slideProducts.map((producto) => {
                                const selectedSizeIndex = selectedSizes[producto.id!] || 0
                                const hasSizes = producto.tamano && producto.tamano.length > 0
                                const hasPrices = producto.precios && producto.precios.length > 0

                                const getCurrentPrice = () => {
                                  if (hasSizes && hasPrices && producto.precios![selectedSizeIndex] !== undefined) {
                                    return producto.precios![selectedSizeIndex]
                                  }
                                  return 0
                                }

                                const currentPrice = getCurrentPrice()

                                return (
                                  <Link key={producto.id} href={`/producto/${producto.id}`} className="block h-full group">
                                    <div className="bg-white rounded-2xl overflow-hidden  transition-all duration-300 flex flex-col h-full border border-gray-100 hover:border-gray-200" style={{ fontFamily: '"Helvetica Neue", sans-serif' }}>
                                      <div className="relative aspect-[1/1] flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100">
                                        <Image
                                          src={producto.imagen_url ? optimizeSupabaseImage(producto.imagen_url, 400, 60) : '/placeholder.jpg'}
                                          alt={producto.nombre}
                                          fill
                                          className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
                                        />
                                        {producto.descuento && (
                                          <div className="absolute top-2 left-2 bg-black text-white px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide">
                                            -{producto.descuento_valor}%
                                          </div>
                                        )}
                                        {producto.destacado && !producto.descuento && (
                                          <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide">
                                            DESTACADO
                                          </div>
                                        )}
                                        <button
                                          onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            handleAddToCart(producto)
                                          }}
                                          className="absolute top-2 right-2 bg-white hover:bg-[#196428] text-gray-700 hover:text-white p-1.5 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
                                        >
                                          <ShoppingCart className="h-3.5 w-3.5" />
                                        </button>
                                      </div>
                                      <div className="p-2.5 flex-1 flex flex-col gap-1">
                                        <h3 className="text-xs font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-[#196428] transition-colors">{producto.nombre}</h3>
                                        <p className="text-[10px] text-gray-500 leading-relaxed line-clamp-2">
                                          {(() => {
                                            if (!producto.descripcion) return ''
                                            const words = producto.descripcion.trim().split(/\s+/)
                                            const truncated = words.slice(0, 7).join(' ')
                                            return words.length > 7 ? `${truncated}…` : truncated
                                          })()}
                                        </p>

                                        {hasSizes && (
                                          <div className="mt-0.5 flex-shrink-0">
                                            <div className="flex flex-wrap gap-1">
                                              {producto.tamano!.slice(0, 2).map((tamano, index) => (
                                                <button
                                                  key={index}
                                                  onClick={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    setSelectedSizes({...selectedSizes, [producto.id!]: index})
                                                  }}
                                                  className={`px-1.5 py-0.5 rounded-lg text-[9px] font-semibold transition-all ${
                                                    selectedSizeIndex === index
                                                      ? 'bg-green-200 text-[#196428] border-2 border-[#196428]'
                                                      : 'bg-green-50 text-gray-700'
                                                  }`}
                                                >
                                                  {tamano.cantidad}{tamano.unidad}
                                                </button>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                        {hasPrices && currentPrice > 0 ? (
                                          <div className="mt-auto pt-1">
                                            {producto.descuento ? (
                                              <div className="flex items-baseline gap-1.5">
                                                <span className="text-sm font-black text-gray-900">
                                                  $ {(currentPrice * (1 - Number(producto.descuento_valor || 0)/100)).toLocaleString('es-CO')}
                                                </span>
                                                <span className="text-[9px] font-medium text-gray-400 line-through">
                                                  $ {currentPrice.toLocaleString('es-CO')}
                                                </span>
                                                <span className="text-[8px] font-semibold text-red-600">
                                                  -{producto.descuento_valor}%
                                                </span>
                                              </div>
                                            ) : (
                                              <span className="text-sm font-black text-gray-900">$ {currentPrice.toLocaleString('es-CO')}</span>
                                            )}
                                          </div>
                                        ) : (
                                          <p className="mt-auto text-gray-400 text-[10px] italic flex-shrink-0">No disponible</p>
                                        )}
                                      </div>
                                    </div>
                                  </Link>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Botón de navegación derecho */}
                  <button 
                    onClick={nextMobileProductSlide}
                    className="flex-shrink-0 bg-white p-1.5 rounded-full border border-[#196428] hover:bg-green-50 transition-colors duration-300"
                  >
                    <svg className="w-3.5 h-3.5 text-[#196428]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Indicadores de paginación */}
                <div className="flex justify-center gap-1.5 mt-3">
                  {Array.from({ length: totalMobileProductSlides }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveMobileProductSlide(index)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        activeMobileProductSlide === index ? 'w-6 bg-[#196428]' : 'w-1.5 bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Vista tablet/desktop: carrusel 4x1 con navegación */}
              <div className="hidden md:flex items-center gap-3 md:gap-4">
                {/* Botón de navegación izquierdo */}
                <button 
                  onClick={prevProductSlide}
                  className="flex-shrink-0 bg-white p-2 rounded-full border border-[#196428] hover:bg-green-50 transition-colors duration-300"
                >
                  <svg className="w-5 h-5 text-[#196428]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Contenedor del carrusel */}
                <div className="flex-grow overflow-hidden pb-2">
                  <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${activeProductSlide * 100}%)` }}
                  >
                    {Array.from({ length: totalProductSlides }).map((_, slideIndex) => (
                      <div key={slideIndex} className="w-full flex-shrink-0">
                        <div className="grid grid-cols-4 gap-3 md:gap-4 lg:gap-5 xl:gap-6 pb-2">
                          {productosDestacados.slice(slideIndex * PRODUCTS_PER_SLIDE, slideIndex * PRODUCTS_PER_SLIDE + PRODUCTS_PER_SLIDE).map((producto) => {
                            const selectedSizeIndex = selectedSizes[producto.id!] || 0;
                            const hasSizes = producto.tamano && producto.tamano.length > 0;
                            const hasPrices = producto.precios && producto.precios.length > 0;
                            
                            const getCurrentPrice = () => {
                              if (hasSizes && hasPrices && producto.precios![selectedSizeIndex] !== undefined) {
                                return producto.precios![selectedSizeIndex];
                              }
                              return 0;
                            };

                            const currentPrice = getCurrentPrice();

                            return (
                            <Link key={producto.id} href={`/producto/${producto.id}`} className="block h-full group">
                              <div className="bg-white rounded-2xl overflow-hidden  transition-all duration-300 h-full flex flex-col border border-gray-100 hover:border-gray-200" style={{ fontFamily: '"Helvetica Neue", sans-serif' }}>
                                <div className="relative aspect-[1/1] flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100">
                                  <Image
                                    src={producto.imagen_url ? optimizeSupabaseImage(producto.imagen_url, 600, 60) : '/placeholder.jpg'}
                                    alt={producto.nombre}
                                    fill
                                    className="object-contain p-3 md:p-4 lg:p-5 transition-transform duration-300 group-hover:scale-105"
                                  />
                                  {producto.descuento && (
                                    <div className="absolute top-3 left-3 bg-black text-white px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                                      -{producto.descuento_valor}%
                                    </div>
                                  )}
                                  {producto.destacado && !producto.descuento && (
                                    <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                                      DESTACADO
                                    </div>
                                  )}
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      handleAddToCart(producto)
                                    }}
                                    className="absolute top-3 right-3 bg-white hover:bg-[#196428] text-gray-700 hover:text-white p-2.5 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
                                  >
                                    <ShoppingCart className="h-4 md:h-5 w-4 md:w-5" />
                                  </button>
                                </div>
                                <div className="p-3 md:p-4 flex-1 flex flex-col gap-1.5">
                                  <h3 className="text-base md:text-lg font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-[#196428] transition-colors">{producto.nombre}</h3>
                                  <p className="text-xs md:text-sm text-gray-500 leading-relaxed line-clamp-2">
                                    {(() => {
                                      if (!producto.descripcion) return ''
                                      const words = producto.descripcion.trim().split(/\s+/)
                                      const truncated = words.slice(0, 8).join(' ')
                                      return words.length > 8 ? `${truncated}…` : truncated
                                    })()}
                                  </p>

                                  {hasSizes && (
                                    <div className="mt-1">
                                      <p className="text-[10px] md:text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wide">Tamaños</p>
                                      <div className="flex flex-wrap gap-1.5">
                                        {producto.tamano!.slice(0, 3).map((tamano, index) => (
                                          <button
                                            key={index}
                                            onClick={(e) => {
                                              e.preventDefault()
                                              e.stopPropagation()
                                              setSelectedSizes({...selectedSizes, [producto.id!]: index})
                                            }}
                                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
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
                                      {producto.descuento ? (
                                        <div className="flex items-baseline gap-2">
                                          <span className="text-lg md:text-xl font-black text-gray-900">
                                            ${(currentPrice * (1 - Number(producto.descuento_valor || 0)/100)).toLocaleString('es-CO')}
                                          </span>
                                          <span className="text-[10px] md:text-xs font-medium text-gray-400 line-through">
                                            ${currentPrice.toLocaleString('es-CO')}
                                          </span>
                                          <span className="text-[9px] md:text-[10px] font-semibold text-red-600">
                                            -{producto.descuento_valor}%
                                          </span>
                                        </div>
                                      ) : (
                                        <span className="text-lg md:text-xl font-black text-gray-900">
                                          ${currentPrice.toLocaleString('es-CO')}
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-gray-400 text-xs italic mt-auto">Precio no disponible</p>
                                  )}
                                </div>
                              </div>
                            </Link>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botón de navegación derecho */}
                <button 
                  onClick={nextProductSlide}
                  className="flex-shrink-0 bg-white p-2 rounded-full border border-[#196428] hover:bg-green-50 transition-colors duration-300"
                >
                  <svg className="w-5 h-5 text-[#196428]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </section>

          {/* Hidden Banner Section - Solo se muestra si hay hidden banners */}
          {getHiddenBannerSlides().length > 0 && (
            <section className="relative w-full mt-6 md:mt-8" style={{ backgroundColor: '#FCFFEF' }}>
              <div className="container mx-auto px-3 sm:px-4 max-w-6xl">
                <div className="w-full">
                  <div className="relative aspect-[16/2] w-full">
                    <div className="absolute inset-0">
                      {getHiddenBannerSlides().map((slide, index) => (
                        <div
                          key={index}
                          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                            activeHiddenSlide === index ? "opacity-100" : "opacity-0"
                          }`}
                        >
                          {slide.type === 'video' ? (
                            <video
                              src={slide.url}
                              autoPlay
                              muted
                              loop
                              playsInline
                              preload="metadata"
                              className="absolute inset-0 w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div className="relative w-full h-full">
                              <Image
                                src={slide.url}
                                alt={slide.alt}
                                fill
                                className="object-cover rounded-lg"
                                sizes="100vw"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Nuestras marcas */}
          <section className="py-6 sm:py-8 md:py-10" style={{ backgroundColor: '#FCFFEF' }}>
            <div className="container mx-auto px-3 sm:px-4 max-w-6xl">
              <h2 className="text-2xl sm:text-2.5xl md:text-3xl font-black text-black mb-4 sm:mb-6 md:mb-7">Nuestros aliados</h2>
              <div className="relative">
                <div className="overflow-hidden">
                  <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${activeBrandSlide * 100}%)` }}
                  >
                    {Array.from({ length: totalBrandSlides }).map((_, slideIndex) => (
                      <div key={slideIndex} className="w-full flex-shrink-0">
                        <div className="grid grid-cols-3 sm:flex sm:items-center sm:justify-center gap-4 sm:gap-6 md:gap-8 lg:gap-16">
                          {brands.slice(slideIndex * brandsPerSlide, slideIndex * brandsPerSlide + brandsPerSlide).map((brand, brandIndex) => (
                            <div key={brandIndex} className="w-full sm:w-24 md:w-32 lg:w-40">
                              <div className="relative aspect-[2/1]">
                                <Image
                                  src={optimizeSupabaseImage(brand.src, 400, 60)}
                                  alt={brand.alt}
                                  fill
                                  className="object-contain"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-center mt-4 sm:mt-5 md:mt-6 gap-1.5 sm:gap-2">
                  {Array.from({ length: totalBrandSlides }).map((_, index) => (
                    <button 
                      key={index} 
                      onClick={() => setActiveBrandSlide(index)} 
                      className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors duration-300 ${
                        activeBrandSlide === index ? 'bg-[#196428]' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Encuentra nuestras tiendas */}
          <section id="nuestras-tiendas" className="py-6 sm:py-8 md:py-10 scroll-mt-20" style={{ backgroundColor: '#FCFFEF' }}>
            <div className="container mx-auto px-3 sm:px-4 max-w-6xl">
              <h2 className="text-2xl sm:text-2.5xl md:text-3xl font-black text-black mb-4 sm:mb-6 md:mb-7">Encuentra nuestras tiendas</h2>
              <div className="bg-white rounded-[15px] sm:rounded-[20px] md:rounded-[25px] shadow-sm overflow-hidden">
                <StoreLocator />
              </div>
            </div>
          </section>

        </main>

        <Footer />
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
                  preload="metadata"
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
              <div className="relative w-full">
                <Image
                  src={optimizeSupabaseImage(uiElements[0].popup, 800, 60)}
                  alt="Popup"
                  width={400}
                  height={600}
                  className="w-full h-auto rounded-lg"
                  sizes="(max-width: 768px) 100vw, 400px"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tema Navideño - Solo se muestra en primera visita */}
      {showChristmasTheme && (
        <>
          {/* Estilos para animaciones navideñas */}
          <style jsx global>{`
            @keyframes snowfall {
              0% {
                transform: translateY(-100vh) rotate(0deg);
                opacity: 1;
              }
              100% {
                transform: translateY(100vh) rotate(360deg);
                opacity: 0;
              }
            }

            @keyframes float {
              0%, 100% {
                transform: translateY(0px) rotate(0deg);
              }
              50% {
                transform: translateY(-20px) rotate(5deg);
              }
            }

            @keyframes swing {
              0%, 100% {
                transform: rotate(-3deg);
              }
              50% {
                transform: rotate(3deg);
              }
            }

            .snowflake {
              position: fixed;
              top: -10px;
              color: white;
              font-size: 1em;
              font-family: Arial, sans-serif;
              text-shadow: 0 0 5px rgba(255, 255, 255, 0.8);
              animation: snowfall linear infinite;
              pointer-events: none;
              z-index: 9999;
            }

            .candy-cane {
              animation: swing 3s ease-in-out infinite;
              filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
            }
          `}</style>

          {/* Copos de nieve */}
          {snowflakes.map((snowflake) => (
            <div
              key={snowflake.id}
              className="snowflake"
              style={{
                left: `${snowflake.left}%`,
                animationDuration: `${snowflake.animationDuration}s`,
                animationDelay: `${snowflake.animationDelay}s`,
                fontSize: `${snowflake.size}px`,
                opacity: snowflake.opacity,
              }}
            >
              ❄
            </div>
          ))}

          {/* Imágenes navideñas decorativas */}
          {/* Imagen esquina superior izquierda */}
          <div
            className="navidad-float fixed top-10 left-4 md:left-8 z-[9998] pointer-events-none"
            style={{ animationDelay: '0s' }}
          >
            <Image
              src="/navidad/1.png"
              alt="Decoración navideña"
              width={120}
              height={120}
              className="object-contain"
            />
          </div>

          {/* Imagen esquina superior derecha */}
          <div
            className="navidad-float fixed top-10 right-4 md:right-8 z-[9998] pointer-events-none"
            style={{ animationDelay: '1s' }}
          >
            <Image
              src="/navidad/2.png"
              alt="Decoración navideña"
              width={120}
              height={120}
              className="object-contain"
            />
          </div>

          {/* Imagen esquina inferior izquierda */}
          <div
            className="navidad-float fixed bottom-10 left-4 md:left-8 z-[9998] pointer-events-none"
            style={{ animationDelay: '0.5s' }}
          >
            <Image
              src="/navidad/3.png"
              alt="Decoración navideña"
              width={120}
              height={120}
              className="object-contain"
            />
          </div>

          {/* Imagen esquina inferior derecha */}
          <div
            className="navidad-float fixed bottom-10 right-4 md:right-8 z-[9998] pointer-events-none"
            style={{ animationDelay: '1.5s' }}
          >
            <Image
              src="/navidad/4.png"
              alt="Decoración navideña"
              width={120}
              height={120}
              className="object-contain"
            />
          </div>
        </>
      )}

    </MainLayout>
  )
}

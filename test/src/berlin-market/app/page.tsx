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
import ProductCard from "./components/ProductCard"
import FadeInOnScroll from './components/FadeInOnScroll'
import CategoryMenu from './components/CategoryMenu'
import StoreLocator from './components/StoreLocator'
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

export default function Home() {
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

  const categories = [
    { 
      name: "Perro",
      href: "#",
      subcategories: [
        { name: "Cachorros", href: "#" },
        { name: "Comida para Perros", href: "#" },
        { name: "Snacks y Premios", href: "#" },
        { name: "Paseos al Perro", href: "#" },
        { name: "Cuidado e Higiene", href: "#" },
        { name: "Juguetes para Perro", href: "#" },
      ],
      promotions: [
        {
          type: "offer" as const,
          title: "Ofertas Especiales",
          href: "#",
          icon: "/icons/exclusive.png"
        },
        {
          type: "new" as const,
          title: "Novedades",
          href: "#",
          icon: "/icons/diamond.png"
        }
      ],
      brands: [
        {
          name: "Royal Canin",
          logo: "/placeholder-logo.svg",
          href: "#"
        },
        {
          name: "Purina",
          logo: "/placeholder-logo.svg",
          href: "#"
        },
        {
          name: "Pedigree",
          logo: "/placeholder-logo.svg",
          href: "#"
        }
      ],
      bannerImage: {
        src: "/dog.png",
        alt: "Productos para Perros",
        href: "#"
      }
    },
    { 
      name: "Gato",
      href: "#",
      subcategories: [
        { name: "Gatitos", href: "#" },
        { name: "Comida para Gatos", href: "#" },
        { name: "Arena para Gatos", href: "#" },
        { name: "Cuidado e Higiene", href: "#" },
        { name: "Juguetes para Gatos", href: "#" },
      ],
      promotions: [
        {
          type: "offer" as const,
          title: "Ofertas Felinas",
          href: "#",
          icon: "/icons/exclusive.png"
        },
        {
          type: "new" as const,
          title: "Nuevos Productos",
          href: "#",
          icon: "/icons/warranty.png"
        }
      ],
      brands: [
        {
          name: "Whiskas",
          logo: "/placeholder-logo.svg",
          href: "#"
        },
        {
          name: "Felix",
          logo: "/placeholder-logo.svg",
          href: "#"
        },
        {
          name: "Cat Chow",
          logo: "/placeholder-logo.svg",
          href: "#"
        }
      ],
      bannerImage: {
        src: "/cat.png",
        alt: "Productos para Gatos",
        href: "#"
      }
    },
    { 
      name: "Roedores",
      href: "#",
      subcategories: [
        { name: "Conejos", href: "#" },
        { name: "Hamsters", href: "#" },
        { name: "Comida", href: "#" },
        { name: "Accesorios", href: "#" },
      ],
      promotions: [
        {
          type: "offer" as const,
          title: "Ofertas Especiales",
          href: "#",
          icon: "/icons/exclusive.png"
        },
        {
          type: "new" as const,
          title: "Nuevos Productos",
          href: "#",
          icon: "/icons/diamond.png"
        }
      ],
      brands: [
        {
          name: "Vitakraft",
          logo: "/placeholder-logo.svg",
          href: "#"
        },
        {
          name: "Cunipic",
          logo: "/placeholder-logo.svg",
          href: "#"
        },
        {
          name: "Living World",
          logo: "/placeholder-logo.svg",
          href: "#"
        }
      ],
      bannerImage: {
        src: "/roedores.png",
        alt: "Productos para Animales Pequeños",
        href: "#"
      }
    },
    { 
      name: "Aves",
      href: "#",
      subcategories: [
        { name: "Pájaros", href: "#" },
        { name: "Comida para Aves", href: "#" },
        { name: "Jaulas y Accesorios", href: "#" },
      ],
      promotions: [
        {
          type: "offer" as const,
          title: "Ofertas Aves",
          href: "#",
          icon: "/icons/exclusive.png"
        },
        {
          type: "new" as const,
          title: "Nuevos Productos",
          href: "#",
          icon: "/icons/warranty.png"
        },
        {
          type: "new" as const,
          title: "Nuevos Productos2",
          href: "#",
          icon: "/icons/warranty.png"
        },
        {
          type: "new" as const,
          title: "Nuevos Productos3",
          href: "#",
          icon: "/icons/warranty.png"
        }
      ],
      brands: [
        {
          name: "Versele-Laga",
          logo: "/placeholder-logo.svg",
          href: "#"
        },
        {
          name: "Zupreem",
          logo: "/placeholder-logo.svg",
          href: "#"
        },
        {
          name: "Kaytee",
          logo: "/placeholder-logo.svg",
          href: "#"
        },
        {
          name: "Kaytee",
          logo: "/placeholder-logo.svg",
          href: "#"
        }
      ],
      bannerImage: {
        src: "/aves.png",
        alt: "Productos para Aves",
        href: "#"
      }
    },
    { 
      name: "Bovinos",
      href: "#",
      subcategories: [
        { name: "Alimentación", href: "#" },
        { name: "Salud", href: "#" },
        { name: "Equipamiento", href: "#" },
      ],
      promotions: [
        {
          type: "offer" as const,
          title: "Ofertas Especiales",
          href: "#",
          icon: "/icons/exclusive.png"
        },
        {
          type: "new" as const,
          title: "Novedades",
          href: "#",
          icon: "/icons/diamond.png"
        }
      ],
      brands: [
        {
          name: "Royal Canin",
          logo: "/placeholder-logo.svg",
          href: "#"
        },
        {
          name: "Purina",
          logo: "/placeholder-logo.svg",
          href: "#"
        },
        {
          name: "Pedigree",
          logo: "/placeholder-logo.svg",
          href: "#"
        }
      ],
      bannerImage: {
        src: "/bovinos.png",
        alt: "Productos para Perros",
        href: "#"
      }
    },
    { 
      name: "Peces",
      href: "#",
      subcategories: [
        { name: "Peces Tropicales", href: "#" },
        { name: "Acuarios", href: "#" },
        { name: "Alimentación", href: "#" },
        { name: "Accesorios", href: "#" },
      ],
      promotions: [
        {
          type: "offer" as const,
          title: "Ofertas Especiales",
          href: "#",
          icon: "/icons/exclusive.png"
        },
        {
          type: "new" as const,
          title: "Novedades",
          href: "#",
          icon: "/icons/diamond.png"
        }
      ],
      brands: [
        {
          name: "Royal Canin",
          logo: "/placeholder-logo.svg",
          href: "#"
        },
        {
          name: "Purina",
          logo: "/placeholder-logo.svg",
          href: "#"
        },
        {
          name: "Pedigree",
          logo: "/placeholder-logo.svg",
          href: "#"
        }
      ],
      bannerImage: {
        src: "/fish.png",
        alt: "Productos para Perros",
        href: "#"
      }
    },
    { 
      name: "Salud animal",
      href: "#",
      subcategories: [
        { name: "Medicamentos", href: "#" },
        { name: "Vitaminas y Suplementos", href: "#" },
        { name: "Antiparasitarios", href: "#" },
        { name: "Cuidado Dental", href: "#" },
        { name: "Primeros Auxilios", href: "#" },
        
      ],
      promotions: [
        {
          type: "offer" as const,
          title: "Ofertas en Salud",
          href: "#",
          icon: "/icons/exclusive.png"
        },
        {
          type: "new" as const,
          title: "Nuevos Productos",
          href: "#",
          icon: "/icons/diamond.png"
        }
      ],
      brands: [
        {
          name: "Zoetis",
          logo: "/placeholder-logo.svg",
          href: "#"
        },
        {
          name: "Bayer",
          logo: "/placeholder-logo.svg",
          href: "#"
        },
        {
          name: "MSD Animal Health",
          logo: "/placeholder-logo.svg",
          href: "#"
        },
        {
          name: "Virbac",
          logo: "/placeholder-logo.svg",
          href: "#"
        }
      ],
      bannerImage: {
        src: "/veterinario.png",
        alt: "Salud Animal",
        href: "#"
      }
    },
    { name: "Ofertas", 
      href: "#",
      subcategories: [
        { name: "Ofertas del Día", href: "#" },
        { name: "Descuentos Especiales", href: "#" },
        { name: "Packs Ahorro", href: "#" },
        { name: "Últimas Unidades", href: "#" },
        { name: "Liquidación", href: "#" },
        
      ],
      promotions: [
        {
          type: "offer" as const,
          title: "¡Ofertas Flash!",
          href: "#",
          icon: "/icons/exclusive.png"
        },
        {
          type: "new" as const,
          title: "Nuevos Descuentos",
          href: "#",
          icon: "/icons/diamond.png"
        }
      ],
      bannerImage: {
        src: "/ofertas.png",
        alt: "Ofertas y Descuentos",
        href: "#"
      }
     },
    { name: "Novedades",
      href: "#",
      subcategories: [
        { name: "Nuevos Productos", href: "#" },
        { name: "Recién Llegados", href: "#" },
        { name: "Productos Exclusivos", href: "#" },
        { name: "Ediciones Limitadas", href: "#" }
      ],
      promotions: [
        {
          type: "new" as const,
          title: "¡Lo Último!",
          href: "#",
          icon: "/icons/diamond.png"
        },
        {
          type: "offer" as const,
          title: "Pre-Venta Exclusiva",
          href: "#",
          icon: "/icons/exclusive.png"
        }
      ],
      bannerImage: {
        src: "/new.png",
        alt: "Novedades y Nuevos Productos",
        href: "#"
      }
    },
  ];

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

  const featuredProducts = Array.from({ length: 12 }, (_, i) => ({
    id: `${i + 1}`,
    name: `Producto Destacado ${i + 1}`,
    price: `${(Math.random() * 50 + 10).toFixed(3)}`,
    image: productImages[i % productImages.length],
    tag: i % 3 === 0 ? "Exclusivo" : null,
    tagColor: "bg-[#196428]",
  }));

  const brands = [
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
  const totalBrandSlides = Math.ceil(brands.length / brandsPerSlide);

  const nextBrandSlide = () => {
    setActiveBrandSlide((current) => (current + 1) % totalBrandSlides);
  };

  const prevBrandSlide = () => {
    setActiveBrandSlide((current) => (current - 1 + totalBrandSlides) % totalBrandSlides);
  };


  const totalProductSlides = Math.ceil(featuredProducts.length / 4);

  const nextProductSlide = () => {
    setActiveProductSlide((current) => (current + 1) % totalProductSlides);
  };

  const prevProductSlide = () => {
    setActiveProductSlide((current) => (current - 1 + totalProductSlides) % totalProductSlides);
  };

  const renderProduct = (product: typeof featuredProducts[0]) => (
    <div key={product.id} className="bg-white rounded-[25px] overflow-hidden shadow-sm border border-gray-200">
      <div className="relative aspect-square">
        <div className="relative aspect-square">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain p-4"
          />
        </div>
        <button className="absolute top-4 right-4 bg-[#196428] hover:bg-[#196428] text-white p-2 rounded-full shadow-md transition-all duration-300">
          <ShoppingCart className="h-5 w-5" />
        </button>
        {product.tag && (
          <div className="absolute top-4 left-4">
            <span className={`${product.tagColor} text-white text-xs px-2 py-1 rounded`}>
              {product.tag}
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-2">Descripción del producto</p>
        <p className="text-[#196428] hover:text-[#196428] font-medium text-sm">$ {product.price}</p>
      </div>
    </div>
  );

  const navLinks = [
    { name: "Inicio", icon: HomeIcon, href: "/" },
    { name: "Tienda", icon: ShoppingBag, href: "#" },
    { name: "Carrito", icon: ShoppingCart, href: "#" },
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
                    <Link href="#" className="group flex flex-col items-center justify-center cursor-pointer">
                      <div className="h-4 w-4 text-[#196428] transition-colors">
                        <HomeIcon className="h-full w-full" />
                      </div>
                      <span className="text-xs font-light text-[#196428] mt-1 transition-colors">Inicio</span>
                    </Link>
                    <div className="group flex flex-col items-center justify-center cursor-pointer">
                      <div className="h-4 w-4 text-gray-500 group-hover:text-[#196428] transition-colors">
                        <ShoppingBag className="h-full w-full" />
                      </div>
                          <span className="text-xs font-light text-gray-500 mt-1 group-hover:text-[#196428] transition-colors">Tienda</span>
                    </div>
                    <div className="group flex flex-col items-center justify-center cursor-pointer">
                      <div className="h-4 w-4 text-gray-500 group-hover:text-[#196428] transition-colors">
                        <ShoppingCart className="h-full w-full" />
                      </div>
                          <span className="text-xs font-light text-gray-500 mt-1 group-hover:text-[#196428] transition-colors">Carrito</span>
                    </div>
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
                    <Link href="#" className="group flex flex-col items-center justify-center cursor-pointer">
                      <div className="h-4 w-4 text-[#196428] transition-colors">
                        <HomeIcon className="h-full w-full" />
                      </div>
                      <span className="text-xs font-light text-[#196428] mt-1 transition-colors">Inicio</span>
                    </Link>
                    <div className="group flex flex-col items-center justify-center cursor-pointer">
                      <div className="h-4 w-4 text-gray-500 group-hover:text-[#196428] transition-colors">
                        <ShoppingBag className="h-full w-full" />
                      </div>
                          <span className="text-xs font-light text-gray-500 mt-1 group-hover:text-[#196428] transition-colors">Tienda</span>
                    </div>
                    <div className="group flex flex-col items-center justify-center cursor-pointer">
                      <div className="h-4 w-4 text-gray-500 group-hover:text-[#196428] transition-colors">
                        <ShoppingCart className="h-full w-full" />
                      </div>
                          <span className="text-xs font-light text-gray-500 mt-1 group-hover:text-[#196428] transition-colors">Carrito</span>
                    </div>
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
                    <Link href="#" className="group flex flex-col items-center justify-center cursor-pointer">
                      <div className="h-4 w-4 text-[#196428] transition-colors">
                        <HomeIcon className="h-full w-full" />
                      </div>
                      <span className="text-xs font-light text-[#196428] mt-1 transition-colors">Inicio</span>
                    </Link>
                    <div className="group flex flex-col items-center justify-center cursor-pointer">
                      <div className="h-4 w-4 text-gray-500 group-hover:text-[#196428] transition-colors">
                        <ShoppingBag className="h-full w-full" />
                      </div>
                          <span className="text-xs font-light text-gray-500 mt-1 group-hover:text-[#196428] transition-colors">Tienda</span>
                    </div>
                    <div className="group flex flex-col items-center justify-center cursor-pointer">
                      <div className="h-4 w-4 text-gray-500 group-hover:text-[#196428] transition-colors">
                        <ShoppingCart className="h-full w-full" />
                      </div>
                          <span className="text-xs font-light text-gray-500 mt-1 group-hover:text-[#196428] transition-colors">Carrito</span>
                    </div>
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
                  {[
                    { video: "/farm1.mp4", alt: "Video promocional 1" },
                    { video: "/farm2.mp4", alt: "Video promocional 2" },
                    { video: "/farm1.mp4", alt: "Video promocional 3" },
                    { video: "/farm2.mp4", alt: "Video promocional 4" }
                  ].map((slide, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                        activeSlide === index ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <video
                        src={slide.video}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 flex items-center">
                        <div className="container mx-auto px-2 xs:px-3 sm:px-4">
                          {/* Texto y botón a la izquierda */}
                          <div className="text-left ml-[3%] xs:ml-[4%] sm:ml-[5%] md:ml-[7%] lg:ml-[8%]">
                            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black text-white drop-shadow-lg mb-2 sm:mb-3 md:mb-4 lg:mb-5 max-w-[90%] sm:max-w-[80%] md:max-w-[70%] lg:max-w-[60%] leading-tight">
                              Descubre las<br />
                              mejores ofertas
                            </h2>
                            <Link
                              href="#"
                              className="inline-block bg-[#196428] hover:bg-[#196428] text-white
                              text-xs sm:text-sm md:text-base lg:text-lg
                              py-1.5 sm:py-2 md:py-2.5 lg:py-3
                              px-4 sm:px-5 md:px-6 lg:px-7
                              rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg"
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
          <section className="py-6 sm:py-8 md:py-10" style={{ backgroundColor: '#FCFFEF' }}>
            <div className="container mx-auto px-3 sm:px-4 max-w-6xl">
              <h2 className="text-2xl sm:text-2.5xl md:text-3xl font-black text-black mb-4 sm:mb-6 md:mb-7">Ofertas de la semana</h2>
              <div className="flex md:grid md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 overflow-x-auto pb-4 md:pb-0 md:overflow-x-hidden">
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
                {/* Hill's */}
                <div className="flex-none w-[200px] md:w-full bg-white rounded-[15px] sm:rounded-[20px] md:rounded-[25px] overflow-hidden shadow-sm border border-gray-200">
                  <div className="relative aspect-square">
                    <div className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${activeCardSlide === 0 ? "opacity-100" : "opacity-0"}`}>
                      <Image
                        src="/cap1.png"
                        alt="Plan científico Hill"
                        fill
                        className="object-contain p-2 sm:p-3 md:p-4"
                      />
                    </div>
                    <div className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${activeCardSlide === 1 ? "opacity-100" : "opacity-0"}`}>
                      <Image
                        src="/cap1-2.png"
                        alt="Plan científico Hill"
                        fill
                        className="object-contain p-2 sm:p-3 md:p-4"
                      />
                    </div>
                    <div className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${activeCardSlide === 2 ? "opacity-100" : "opacity-0"}`}>
                      <Image
                        src="/cap1-3.png"
                        alt="Plan científico Hill"
                        fill
                        className="object-contain p-2 sm:p-3 md:p-4"
                      />
                    </div>
                  </div>
                  <div className="p-2 sm:p-3 md:p-4">
                    <h3 className="text-sm sm:text-base md:text-lg font-medium mb-1 sm:mb-2">Plan científico Hill</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Descubre comida de alta calidad para tus mascotas</p>
                    <Link 
                      href="#" 
                      className="inline-block text-[#196428] hover:text-[#196428] font-medium text-xs sm:text-sm"
                    >
                      Ahorra ahora
                    </Link>
                  </div>
                </div>

                {/* Carny */}
                <div className="flex-none w-[200px] md:w-full bg-white rounded-[15px] sm:rounded-[20px] md:rounded-[25px] overflow-hidden shadow-sm border border-gray-200">
                  <div className="relative aspect-square">
                    <div className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${activeCardSlide === 0 ? "opacity-100" : "opacity-0"}`}>
                      <Image
                        src="/cap2.png"
                        alt="Carny"
                        fill
                        className="object-contain p-2 sm:p-3 md:p-4"
                      />
                    </div>
                    <div className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${activeCardSlide === 1 ? "opacity-100" : "opacity-0"}`}>
                      <Image
                        src="/cap2-2.png"
                        alt="Carny"
                        fill
                        className="object-contain p-2 sm:p-3 md:p-4"
                      />
                    </div>
                    <div className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${activeCardSlide === 2 ? "opacity-100" : "opacity-0"}`}>
                      <Image
                        src="/cap2-3.png"
                        alt="Carny"
                        fill
                        className="object-contain p-2 sm:p-3 md:p-4"
                      />
                    </div>
                  </div>
                  <div className="p-2 sm:p-3 md:p-4">
                    <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-1 sm:mb-2">Carny</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Comida única e irresistible</p>
                    <Link 
                      href="#" 
                      className="inline-block text-[#196428] hover:text-[#196428] font-medium text-xs sm:text-sm"
                    >
                      Ahorra ahora
                    </Link>
                  </div>
                </div>

                {/* Royal Canin */}
                <div className="flex-none w-[200px] md:w-full bg-white rounded-[15px] sm:rounded-[20px] md:rounded-[25px] overflow-hidden shadow-sm border border-gray-200">
                  <div className="relative aspect-square">
                    <div className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${activeCardSlide === 0 ? "opacity-100" : "opacity-0"}`}>
                      <Image
                        src="/cap3.png"
                        alt="Royal canin"
                        fill
                        className="object-contain p-2 sm:p-3 md:p-4"
                      />
                    </div>
                    <div className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${activeCardSlide === 1 ? "opacity-100" : "opacity-0"}`}>
                      <Image
                        src="/cap3-2.png"
                        alt="Royal canin"
                        fill
                        className="object-contain p-2 sm:p-3 md:p-4"
                      />
                    </div>
                    <div className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${activeCardSlide === 2 ? "opacity-100" : "opacity-0"}`}>
                      <Image
                        src="/cap3-3.png"
                        alt="Royal canin"
                        fill
                        className="object-contain p-2 sm:p-3 md:p-4"
                      />
                    </div>
                  </div>
                  <div className="p-2 sm:p-3 md:p-4">
                    <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-1 sm:mb-2">Royal canin</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Para las necesidades especiales de tu gato</p>
                    <Link 
                      href="#" 
                      className="inline-block text-[#196428] hover:text-[#196428] font-medium text-xs sm:text-sm"
                    >
                      Ahorra ahora
                    </Link>
                  </div>
                </div>

                {/* Felix */}
                <div className="flex-none w-[200px] md:w-full bg-white rounded-[15px] sm:rounded-[20px] md:rounded-[25px] overflow-hidden shadow-sm border border-gray-200">
                  <div className="relative aspect-square">
                    <div className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${activeCardSlide === 0 ? "opacity-100" : "opacity-0"}`}>
                      <Image
                        src="/cap4.png"
                        alt="Felix"
                        fill
                        className="object-contain p-2 sm:p-3 md:p-4"
                      />
                    </div>
                    <div className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${activeCardSlide === 1 ? "opacity-100" : "opacity-0"}`}>
                      <Image
                        src="/cap4-2.png"
                        alt="Felix"
                        fill
                        className="object-contain p-2 sm:p-3 md:p-4"
                      />
                    </div>
                    <div className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${activeCardSlide === 2 ? "opacity-100" : "opacity-0"}`}>
                      <Image
                        src="/cap4-3.png"
                        alt="Felix"
                        fill
                        className="object-contain p-2 sm:p-3 md:p-4"
                      />
                    </div>
                  </div>
                  <div className="p-2 sm:p-3 md:p-4">
                    <h3 className="text-sm sm:text-base md:text-lg font-semibold mb-1 sm:mb-2">Felix</h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">Ahorra en comida irresistible para tu gato</p>
                    <Link 
                      href="#" 
                      className="inline-block text-[#196428] hover:text-[#196428] font-medium text-xs sm:text-sm"
                    >
                      Ahorra ahora
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Productos destacados */}
          <section className="py-6 sm:py-8 md:py-10" style={{ backgroundColor: '#FCFFEF' }}>
            <div className="container mx-auto px-3 sm:px-4 max-w-6xl">
              <h2 className="text-2xl sm:text-2.5xl md:text-3xl font-black text-black mb-4 sm:mb-6 md:mb-7">Productos destacados</h2>
              
              {/* Vista móvil: scroll horizontal */}
              <div className="md:hidden overflow-x-auto pb-4 scroll-container">
                <div className="flex gap-3">
                  {featuredProducts.map((product) => (
                    <div key={product.id} className="flex-none w-[200px] bg-white rounded-[15px] overflow-hidden shadow-sm border border-gray-200">
                      <div className="relative aspect-square">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-contain p-2"
                        />
                        <button className="absolute top-2 right-2 bg-[#196428] hover:bg-[#196428] text-white p-1.5 rounded-full shadow-md transition-all duration-300">
                          <ShoppingCart className="h-3 w-3" />
                        </button>
                        {product.tag && (
                          <div className="absolute top-2 left-2">
                            <span className={`${product.tagColor} text-white text-[10px] px-1.5 py-0.5 rounded`}>
                              {product.tag}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="p-2">
                        <h3 className="text-sm font-semibold mb-1">{product.name}</h3>
                        <p className="text-xs text-gray-600 mb-1">Descripción del producto</p>
                        <p className="text-[#196428] hover:text-[#196428] font-medium text-xs">$ {product.price}</p>
                      </div>
                    </div>
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
                <div className="flex-grow overflow-hidden">
                  <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${activeProductSlide * 100}%)` }}
                  >
                    {Array.from({ length: totalProductSlides }).map((_, slideIndex) => (
                      <div key={slideIndex} className="w-full flex-shrink-0">
                        <div className="grid grid-cols-4 gap-4 md:gap-5">
                          {featuredProducts.slice(slideIndex * 4, slideIndex * 4 + 4).map((product) => (
                            <div key={product.id} className="bg-white rounded-[20px] md:rounded-[25px] overflow-hidden shadow-sm border border-gray-200">
                              <div className="relative aspect-square">
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  fill
                                  className="object-contain p-3 md:p-4"
                                />
                                <button className="absolute top-3 md:top-4 right-3 md:right-4 bg-[#196428] hover:bg-[#196428] text-white p-2 rounded-full shadow-md transition-all duration-300">
                                  <ShoppingCart className="h-4 md:h-5 w-4 md:w-5" />
                                </button>
                                {product.tag && (
                                  <div className="absolute top-3 md:top-4 left-3 md:left-4">
                                    <span className={`${product.tagColor} text-white text-xs px-2 py-1 rounded`}>
                                      {product.tag}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="p-3 md:p-4">
                                <h3 className="text-base md:text-lg font-semibold mb-2">{product.name}</h3>
                                <p className="text-sm text-gray-600 mb-2">Descripción del producto</p>
                                <p className="text-[#196428] hover:text-[#196428] font-medium text-sm">$ {product.price}</p>
                              </div>
                            </div>
                          ))}
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

          {/* Nuestras marcas */}
          <section className="py-6 sm:py-8 md:py-10" style={{ backgroundColor: '#FCFFEF' }}>
            <div className="container mx-auto px-3 sm:px-4 max-w-6xl">
              <h2 className="text-2xl sm:text-2.5xl md:text-3xl font-black text-black mb-4 sm:mb-6 md:mb-7">Nuestras marcas</h2>
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
                                  src={brand.src}
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

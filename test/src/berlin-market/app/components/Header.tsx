"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Search, 
  Home as HomeIcon, 
  ShoppingBag, 
  User, 
  ShoppingCart, 
  Info, 
  MapPin,
  Menu,
} from "lucide-react"
import { useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetOverlay,
} from "@/components/ui/sheet"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import AccountPopover from "./AccountPopover"
import AccountPopoverContent from "./AccountPopoverContent"

interface HeaderProps {
  searchQuery?: string
  onSearchChange?: (query: string) => void
  onSearchSubmit?: (e: React.FormEvent) => void
}

export default function Header({ searchQuery = "", onSearchChange, onSearchSubmit }: HeaderProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAccountDrawerOpen, setIsAccountDrawerOpen] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (onSearchSubmit) {
      onSearchSubmit(e)
    }
  }

  const navLinks = [
    { name: "Inicio", icon: HomeIcon, href: "/" },
    { name: "Tienda", icon: ShoppingBag, href: "#" },
    { name: "Carrito", icon: ShoppingCart, href: "#" },
    { name: "Cuenta", icon: User, href: "#" },
    { name: "Info", icon: Info, href: "/sobre-nosotros" },
    { name: "Tiendas", icon: MapPin, href: "/#nuestras-tiendas" },
  ]

  return (
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
                  onChange={(e) => onSearchChange?.(e.target.value)}
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
                  <div className="border-t border-gray-200 -mx-6"></div>
                  <nav className="flex flex-col gap-1">
                    {navLinks.map((link) => {
                      if (link.name === "Inicio") {
                        const isActive = pathname === "/";
                        return (
                          <Link key={link.name} href={link.href} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                            <link.icon className={`h-5 w-5 ${isActive ? "text-[#196428]" : "text-gray-600"}`} />
                            <span className={`text-sm font-medium ${isActive ? "text-[#196428]" : "text-gray-800"}`}>{link.name}</span>
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
                        const isActive = link.name === "Info" && pathname === "/sobre-nosotros";
                        return (
                          <Link 
                            key={link.name} 
                            href={link.href} 
                            className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 transition-colors"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <link.icon className={`h-5 w-5 ${isActive ? "text-[#196428]" : "text-gray-600"}`} />
                            <span className={`text-sm font-medium ${isActive ? "text-[#196428]" : "text-gray-800"}`}>{link.name === "Info" ? "Sobre Nosotros" : link.name}</span>
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
            <Link href="/" className="flex items-center flex-shrink-0">
              <Image
                src="/unisantander.png"
                alt="Logo Unisantander"
                width={150}
                height={38}
                className="w-auto h-8"
              />
            </Link>

            <div className="flex-1 max-w-sm mx-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
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

            <div className="flex items-center space-x-2 flex-shrink-0">
              <div className="flex items-center space-x-1">
                <Link href="/" className="group flex flex-col items-center justify-center cursor-pointer">
                  <div className={`h-4 w-4 ${pathname === "/" ? "text-[#196428]" : "text-gray-500"} transition-colors`}>
                    <HomeIcon className="h-full w-full" />
                  </div>
                  <span className={`text-xs font-light ${pathname === "/" ? "text-[#196428]" : "text-gray-500"} mt-1 transition-colors`}>Inicio</span>
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
                  <div className={`h-4 w-4 ${pathname === "/sobre-nosotros" ? "text-[#196428]" : "text-gray-500 group-hover:text-[#196428]"} transition-colors`}>
                    <Info className="h-full w-full" />
                  </div>
                  <span className={`text-xs font-light ${pathname === "/sobre-nosotros" ? "text-[#196428]" : "text-gray-500 group-hover:text-[#196428]"} mt-1 transition-colors`}>Info</span>
                </Link>
                <Link href="/#nuestras-tiendas" className="group flex flex-col items-center justify-center">
                  <div className="h-4 w-4 text-gray-500 group-hover:text-[#196428] transition-colors">
                    <MapPin className="h-full w-full" />
                  </div>
                  <span className="text-xs font-light text-gray-500 mt-1 group-hover:text-[#196428] transition-colors">Tiendas</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Large Tablet Header (1024px - 1279px) */}
      <div className="hidden lg:block xl:hidden">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center flex-shrink-0">
              <Image
                src="/unisantander.png"
                alt="Logo Unisantander"
                width={170}
                height={43}
                className="w-auto h-9"
              />
            </Link>

            <div className="flex-1 max-w-md mx-6">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
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

            <div className="flex items-center space-x-3 flex-shrink-0">
              <div className="flex items-center space-x-2">
                <Link href="/" className="group flex flex-col items-center justify-center cursor-pointer">
                  <div className={`h-4 w-4 ${pathname === "/" ? "text-[#196428]" : "text-gray-500"} transition-colors`}>
                    <HomeIcon className="h-full w-full" />
                  </div>
                  <span className={`text-xs font-light ${pathname === "/" ? "text-[#196428]" : "text-gray-500"} mt-1 transition-colors`}>Inicio</span>
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
                  <div className={`h-4 w-4 ${pathname === "/sobre-nosotros" ? "text-[#196428]" : "text-gray-500 group-hover:text-[#196428]"} transition-colors`}>
                    <Info className="h-full w-full" />
                  </div>
                  <span className={`text-xs font-light ${pathname === "/sobre-nosotros" ? "text-[#196428]" : "text-gray-500 group-hover:text-[#196428]"} mt-1 transition-colors`}>Info</span>
                </Link>
                <Link href="/#nuestras-tiendas" className="group flex flex-col items-center justify-center">
                  <div className="h-4 w-4 text-gray-500 group-hover:text-[#196428] transition-colors">
                    <MapPin className="h-full w-full" />
                  </div>
                  <span className="text-xs font-light text-gray-500 mt-1 group-hover:text-[#196428] transition-colors">Tiendas</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Header (≥ 1280px) */}
      <div className="hidden xl:block">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center flex-shrink-0 ml-[150px] xl:ml-[150px] 2xl:ml-[180px]">
              <Image
                src="/unisantander.png"
                alt="Logo Unisantander"
                width={200}
                height={50}
                className="w-auto h-12"
              />
            </Link>

            <div className="flex-1 max-w-lg mx-8 ml-[70px]">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
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

            <div className="flex items-center space-x-4 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <Link href="/" className="group flex flex-col items-center justify-center cursor-pointer">
                  <div className={`h-4 w-4 ${pathname === "/" ? "text-[#196428]" : "text-gray-500"} transition-colors`}>
                    <HomeIcon className="h-full w-full" />
                  </div>
                  <span className={`text-xs font-light ${pathname === "/" ? "text-[#196428]" : "text-gray-500"} mt-1 transition-colors`}>Inicio</span>
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
                  <div className={`h-4 w-4 ${pathname === "/sobre-nosotros" ? "text-[#196428]" : "text-gray-500 group-hover:text-[#196428]"} transition-colors`}>
                    <Info className="h-full w-full" />
                  </div>
                  <span className={`text-xs font-light ${pathname === "/sobre-nosotros" ? "text-[#196428]" : "text-gray-500 group-hover:text-[#196428]"} mt-1 transition-colors`}>Sobre Nosotros</span>
                </Link>
                <Link href="/#nuestras-tiendas" className="group flex flex-col items-center justify-center">
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
    </header>
  )
}


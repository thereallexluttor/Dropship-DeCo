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
  Briefcase,
  FileText,
  Users,
  Calendar,
  MapPin as MapPinIcon,
  Clock,
  DollarSign,
  Send,
  Upload,
  HeartPulse,
  Plus,
  Edit,
  CheckCircle,
  XCircle
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import Footer from '../components/Footer'
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
import { useCart, CartItemWithSize } from "../contexts/CartContext"
import CartCounter from "../components/CartCounter"
import ProductSizeBadges from "../components/ProductSizeBadges"
import { supabase } from '@/lib/supabase'
import { Trabajo, Aplicacion, obtenerTrabajos, subirCV, enviarAplicacion, crearTrabajo, editarTrabajo } from '@/lib/vacantes'

// Tipos para las tablas de Supabase
interface ApplicationData {
  trabajo_id: number;
  nombre_aplicante: string;
  email_aplicante: string;
  telefono_aplicante: string;
  experiencia_laboral: string;
  disponibilidad: string;
  mensaje: string;
  cv_url: string;
  estado: string;
  notas_revision?: string;
}

const Vacantes = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAccountDrawerOpen, setIsAccountDrawerOpen] = useState(false)
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Trabajo | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [trabajos, setTrabajos] = useState<Trabajo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Estados para crear/editar trabajos
  const [isCreateJobModalOpen, setIsCreateJobModalOpen] = useState(false)
  const [isEditJobModalOpen, setIsEditJobModalOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<Trabajo | null>(null)

  // Estados para el formulario de aplicación
  const [formData, setFormData] = useState<{
    nombre: string;
    email: string;
    telefono: string;
    experiencia: string;
    disponibilidad: string;
    mensaje: string;
    cv: File | null;
  }>({
    nombre: '',
    email: '',
    telefono: '',
    experiencia: '',
    disponibilidad: '',
    mensaje: '',
    cv: null
  })

  // Estados para el formulario de trabajo
  const [jobFormData, setJobFormData] = useState<{
    titulo: string;
    departamento: string;
    ubicacion: string;
    tipo_contrato: string;
    salario: string;
    descripcion: string;
    requisitos: string[];
    beneficios: string[];
    activo: boolean;
  }>({
    titulo: '',
    departamento: '',
    ubicacion: '',
    tipo_contrato: '',
    salario: '',
    descripcion: '',
    requisitos: [],
    beneficios: [],
    activo: true
  })

  // Obtener trabajos desde Supabase
  useEffect(() => {
    const cargarTrabajos = async () => {
      try {
        setIsLoading(true)
        // Cargar trabajos de forma optimizada
        const trabajosData = await obtenerTrabajos()
        setTrabajos(trabajosData)
      } catch (error) {
        console.error('Error obteniendo trabajos:', error)
      } finally {
        // Mostrar página inmediatamente después de cargar
        setIsLoading(false)
      }
    }

    cargarTrabajos()
  }, [])

  // Función para recargar trabajos
  const recargarTrabajos = async () => {
    try {
      const trabajosData = await obtenerTrabajos()
      setTrabajos(trabajosData)
    } catch (error) {
      console.error('Error recargando trabajos:', error)
    }
  }

  const { categories } = useCategories()
  const { items, removeFromCart, updateQuantity, getTotalPrice } = useCart()

  const handleApplication = (job: Trabajo) => {
    setSelectedJob(job)
    setIsApplicationModalOpen(true)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Searching for:", searchQuery)
  }

  const navLinks = [
    { name: "Inicio", icon: HomeIcon, href: "/" },
    { name: "Tienda", icon: ShoppingBag, href: "/tienda" },
    { name: "Carrito", icon: ShoppingCart, href: "/carrito" },
    { name: "Cuenta", icon: User, href: "#" },
    { name: "Info", icon: Info, href: "/sobre-nosotros" },
    { name: "Vacantes", icon: Briefcase, href: "/vacantes" },
    { name: "Tiendas", icon: MapPin, href: "/contacto" },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement
    const { name, value } = target
    const files = target.files

    if (name === 'cv' && files && files.length > 0) {
      setFormData(prev => ({ ...prev, cv: files[0] }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmitApplication = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!selectedJob || !formData.cv) {
      alert('Por favor completa todos los campos requeridos incluyendo el CV.')
      return
    }

    try {
      setIsSubmitting(true)

      // Subir CV al bucket de Supabase
      const cvUrl = await subirCV(formData.cv)

      // Crear datos de la aplicación
      const applicationData: ApplicationData = {
        trabajo_id: selectedJob.id,
        nombre_aplicante: formData.nombre,
        email_aplicante: formData.email,
        telefono_aplicante: formData.telefono,
        experiencia_laboral: formData.experiencia,
        disponibilidad: formData.disponibilidad,
        mensaje: formData.mensaje,
        cv_url: cvUrl,
        estado: 'pendiente'
      }

      // Enviar aplicación usando la función de utilidad
      const savedApplication = await enviarAplicacion(applicationData)

      // Enviar correo de notificación a talentohumano@unisander.com
      try {
        const emailResponse = await fetch('/api/send-application-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jobTitle: selectedJob.titulo,
            jobDepartment: selectedJob.departamento,
            jobLocation: selectedJob.ubicacion,
            jobContractType: selectedJob.tipo_contrato,
            jobSalary: selectedJob.salario,
            applicantName: formData.nombre,
            applicantEmail: formData.email,
            applicantPhone: formData.telefono,
            applicantExperience: formData.experiencia,
            applicantAvailability: formData.disponibilidad,
            applicantMessage: formData.mensaje,
            cvUrl: cvUrl,
            applicationId: savedApplication.id,
            applicationDate: savedApplication.fecha_aplicacion
          })
        })

        if (!emailResponse.ok) {
          console.error('Error al enviar el correo de notificación')
          // No detener el proceso si falla el envío del correo
        }
      } catch (emailError) {
        console.error('Error al enviar el correo:', emailError)
        // No detener el proceso si falla el envío del correo
      }

      alert(`¡Aplicación enviada exitosamente para el puesto de ${selectedJob?.titulo || 'trabajo'}! Te contactaremos pronto.`)

      // Limpiar formulario y cerrar modal
      setIsApplicationModalOpen(false)
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        experiencia: '',
        disponibilidad: '',
        mensaje: '',
        cv: null
      })
    } catch (error) {
      console.error('Error enviando aplicación:', error)
      alert('Error enviando la aplicación. Por favor intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Funciones para manejar trabajos
  const handleCreateJob = () => {
    setJobFormData({
      titulo: '',
      departamento: '',
      ubicacion: '',
      tipo_contrato: '',
      salario: '',
      descripcion: '',
      requisitos: [],
      beneficios: [],
      activo: true
    })
    setIsCreateJobModalOpen(true)
  }

  const handleEditJob = (job: Trabajo) => {
    setEditingJob(job)
    setJobFormData({
      titulo: job.titulo,
      departamento: job.departamento,
      ubicacion: job.ubicacion,
      tipo_contrato: job.tipo_contrato,
      salario: job.salario,
      descripcion: job.descripcion,
      requisitos: job.requisitos || [],
      beneficios: job.beneficios || [],
      activo: job.activo
    })
    setIsEditJobModalOpen(true)
  }

  const handleJobInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setJobFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleRequisitosChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const requisitosArray = e.target.value.split('\n').filter(req => req.trim() !== '')
    setJobFormData(prev => ({ ...prev, requisitos: requisitosArray }))
  }

  const handleBeneficiosChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const beneficiosArray = e.target.value.split('\n').filter(ben => ben.trim() !== '')
    setJobFormData(prev => ({ ...prev, beneficios: beneficiosArray }))
  }

  const handleSubmitJob = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)

      if (isEditJobModalOpen && editingJob) {
        // Editar trabajo existente
        await editarTrabajo(editingJob.id, jobFormData)
        alert('Trabajo actualizado exitosamente')
        setIsEditJobModalOpen(false)
      } else {
        // Crear nuevo trabajo
        await crearTrabajo(jobFormData)
        alert('Trabajo creado exitosamente')
        setIsCreateJobModalOpen(false)
      }

      // Recargar trabajos
      await recargarTrabajos()

      // Limpiar formulario
      setJobFormData({
        titulo: '',
        departamento: '',
        ubicacion: '',
        tipo_contrato: '',
        salario: '',
        descripcion: '',
        requisitos: [],
        beneficios: [],
        activo: true
      })
      setEditingJob(null)
    } catch (error) {
      console.error('Error guardando trabajo:', error)
      alert('Error guardando el trabajo. Por favor intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <MainLayout>
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
                              <link.icon className="h-5 w-5 text-gray-500" />
                              <span className="text-sm font-medium text-gray-500">{link.name}</span>
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
                        if (link.name === "Vacantes") {
                          return (
                            <Link key={link.name} href={link.href} className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                              <link.icon className="h-5 w-5 text-[#196428]" />
                              <span className="text-sm font-medium text-[#196428]">{link.name}</span>
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
                    <div className="h-4 w-4 text-[#196428] transition-colors">
                      <Briefcase className="h-full w-full" />
                    </div>
                        <span className="text-xs font-light text-[#196428] mt-1 transition-colors">Vacantes</span>
                  </Link>
                  <a href="/contacto" className="group flex flex-col items-center justify-center">
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
                    <div className="h-4 w-4 text-[#196428] transition-colors">
                      <Briefcase className="h-full w-full" />
                    </div>
                        <span className="text-xs font-light text-[#196428] mt-1 transition-colors">Vacantes</span>
                  </Link>
                  <a href="/contacto" className="group flex flex-col items-center justify-center">
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
                    <div className="h-4 w-4 text-[#196428] transition-colors">
                      <Briefcase className="h-full w-full" />
                    </div>
                        <span className="text-xs font-light text-[#196428] mt-1 transition-colors">Vacantes</span>
                  </Link>
                  <Link href="/contacto" className="group flex flex-col items-center justify-center">
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

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#196428] to-[#2d7a3d] text-white py-16 lg:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl lg:text-5xl font-bold mb-4">
            Únete a Nuestro Equipo
          </h1>
          <p className="text-lg lg:text-xl mb-8 max-w-3xl mx-auto">
            En Unisantander estamos en constante crecimiento y buscamos personas apasionadas por las mascotas que quieran formar parte de nuestra familia.
          </p>
        </div>
      </section>

      {/* Job Offers Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Ofertas de Empleo Disponibles
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Explora nuestras oportunidades laborales y encuentra el puesto perfecto para ti.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#196428]"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trabajos.map((trabajo) => (
                <div key={trabajo.id} className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 overflow-hidden">
                  <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">{trabajo.titulo}</h3>
                        <p className="text-sm text-[#196428] font-medium">{trabajo.departamento}</p>
                      </div>
                      <div className="ml-3 flex-shrink-0">
                        <div className="w-10 h-10 bg-[#196428] rounded-full flex items-center justify-center">
                          <Briefcase className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span className="truncate">{trabajo.ubicacion}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                        <span>{trabajo.tipo_contrato}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <DollarSign className="w-4 h-4 mr-2 flex-shrink-0 text-green-600" />
                        <span className="font-semibold text-green-600">{trabajo.salario}</span>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-5 line-clamp-2 leading-relaxed">
                      {trabajo.descripcion}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2">
                    <Link
                      href={`/vacantes/${trabajo.id}`}
                        className="flex-1 bg-[#196428] hover:bg-[#2d7a3d] text-white font-medium py-2.5 px-4 rounded-md transition-colors flex items-center justify-center text-sm text-center"
                      >
                        Ver detalles de la oferta de trabajo
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Application Modal */}
      {isApplicationModalOpen && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Aplicar a: {selectedJob?.titulo || 'Puesto de trabajo'}
              </h2>
                <button
                  onClick={() => setIsApplicationModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitApplication} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#196428] focus:border-transparent"
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correo electrónico *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#196428] focus:border-transparent"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#196428] focus:border-transparent"
                      placeholder="+34 600 000 000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experiencia laboral
                    </label>
                    <select
                      name="experiencia"
                      value={formData.experiencia}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#196428] focus:border-transparent"
                    >
                      <option value="">Seleccionar experiencia</option>
                      <option value="0-1">Menos de 1 año</option>
                      <option value="1-3">1-3 años</option>
                      <option value="3-5">3-5 años</option>
                      <option value="5+">Más de 5 años</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Disponibilidad
                  </label>
                  <select
                    name="disponibilidad"
                    value={formData.disponibilidad}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#196428] focus:border-transparent"
                  >
                    <option value="">Seleccionar disponibilidad</option>
                    <option value="inmediata">Inmediata</option>
                    <option value="2-semanas">En 2 semanas</option>
                    <option value="1-mes">En 1 mes</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensaje adicional
                  </label>
                  <textarea
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#196428] focus:border-transparent"
                    placeholder="Cuéntanos por qué quieres trabajar con nosotros..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currículum Vitae (CV) *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      {formData.cv ? formData.cv.name : "Arrastra tu CV aquí o haz clic para seleccionar"}
                    </p>
                    <input
                      type="file"
                      name="cv"
                      onChange={handleInputChange}
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      id="cv-upload"
                      required
                    />
                    <label
                      htmlFor="cv-upload"
                      className="inline-block bg-[#196428] hover:bg-[#2d7a3d] text-white px-4 py-2 rounded-lg cursor-pointer text-sm transition-colors"
                    >
                      Seleccionar archivo
                    </label>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-[#196428] hover:bg-[#2d7a3d] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Enviar Aplicación</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsApplicationModalOpen(false)}
                    disabled={isSubmitting}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear trabajo */}
      {isCreateJobModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Crear Nueva Oferta de Trabajo
                </h2>
                <button
                  onClick={() => setIsCreateJobModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitJob} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título del puesto *
                    </label>
                    <input
                      type="text"
                      name="titulo"
                      value={jobFormData.titulo}
                      onChange={handleJobInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#196428] focus:border-transparent"
                      placeholder="Ej: Desarrollador Frontend"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Departamento *
                    </label>
                    <select
                      name="departamento"
                      value={jobFormData.departamento}
                      onChange={handleJobInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#196428] focus:border-transparent"
                    >
                      <option value="">Seleccionar departamento</option>
                      <option value="Tecnología">Tecnología</option>
                      <option value="Ventas">Ventas</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Recursos Humanos">Recursos Humanos</option>
                      <option value="Operaciones">Operaciones</option>
                      <option value="Finanzas">Finanzas</option>
                      <option value="Atención al Cliente">Atención al Cliente</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ubicación *
                    </label>
                    <input
                      type="text"
                      name="ubicacion"
                      value={jobFormData.ubicacion}
                      onChange={handleJobInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#196428] focus:border-transparent"
                      placeholder="Ej: Madrid, España"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de contrato *
                    </label>
                    <select
                      name="tipo_contrato"
                      value={jobFormData.tipo_contrato}
                      onChange={handleJobInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#196428] focus:border-transparent"
                    >
                      <option value="">Seleccionar tipo</option>
                      <option value="Tiempo completo">Tiempo completo</option>
                      <option value="Medio tiempo">Medio tiempo</option>
                      <option value="Por horas">Por horas</option>
                      <option value="Temporal">Temporal</option>
                      <option value="Freelance">Freelance</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salario *
                  </label>
                  <input
                    type="text"
                    name="salario"
                    value={jobFormData.salario}
                    onChange={handleJobInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#196428] focus:border-transparent"
                    placeholder="Ej: 30.000 - 35.000 €/año"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción del puesto *
                  </label>
                  <textarea
                    name="descripcion"
                    value={jobFormData.descripcion}
                    onChange={handleJobInputChange}
                    rows={4}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#196428] focus:border-transparent"
                    placeholder="Describe las responsabilidades y funciones del puesto..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Requisitos (uno por línea)
                    </label>
                    <textarea
                      value={jobFormData.requisitos.join('\n')}
                      onChange={handleRequisitosChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#196428] focus:border-transparent"
                      placeholder="Experiencia mínima de 2 años&#10;Conocimientos de JavaScript&#10;Licenciatura en Informática"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Beneficios (uno por línea)
                    </label>
                    <textarea
                      value={jobFormData.beneficios.join('\n')}
                      onChange={handleBeneficiosChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#196428] focus:border-transparent"
                      placeholder="Seguro médico&#10;Flexibilidad horaria&#10;Formación continua"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="activo"
                    name="activo"
                    checked={jobFormData.activo}
                    onChange={(e) => setJobFormData(prev => ({ ...prev, activo: e.target.checked }))}
                    className="h-4 w-4 text-[#196428] focus:ring-[#196428] border-gray-300 rounded"
                  />
                  <label htmlFor="activo" className="ml-2 block text-sm text-gray-700">
                    Publicar oferta inmediatamente
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-[#196428] hover:bg-[#2d7a3d] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>{isEditJobModalOpen ? 'Actualizando...' : 'Creando...'}</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>{isEditJobModalOpen ? 'Actualizar Oferta' : 'Crear Oferta'}</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateJobModalOpen(false)
                      setIsEditJobModalOpen(false)
                      setEditingJob(null)
                    }}
                    disabled={isSubmitting}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </MainLayout>
  )
}

export default Vacantes

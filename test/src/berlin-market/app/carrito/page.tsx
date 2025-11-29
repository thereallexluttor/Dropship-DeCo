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
  Trash2,
  Briefcase
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import MainLayout from "../components/MainLayout"
import Header from "../components/Header"
import AccountPopover from "../components/AccountPopover"
import AccountPopoverContent from "../components/AccountPopoverContent"
import Footer from "../components/Footer"
import { useCategories } from "../hooks/useCategories"
import { useCart, CartItemWithSize } from "../contexts/CartContext"
import CartCounter from "../components/CartCounter"
import ProductSizeBadges from "../components/ProductSizeBadges"
import { supabase } from "../../lib/supabase"

export default function CarritoPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isAccountDrawerOpen, setIsAccountDrawerOpen] = useState(false)

  // Estado de autenticación
  const [user, setUser] = useState<any>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  // Estados para el formulario de autenticación modal
  const [modalShowPassword, setModalShowPassword] = useState(false)
  const [modalShowConfirmPassword, setModalShowConfirmPassword] = useState(false)
  const [modalIsRegistering, setModalIsRegistering] = useState(false)
  const [modalIsLoading, setModalIsLoading] = useState(false)
  const [modalEmail, setModalEmail] = useState("")
  const [modalPassword, setModalPassword] = useState("")
  const [modalRegisterEmail, setModalRegisterEmail] = useState("")
  const [modalRegisterPassword, setModalRegisterPassword] = useState("")
  const [modalConfirmPassword, setModalConfirmPassword] = useState("")
  const [modalNombre, setModalNombre] = useState("")
  const [modalTelefono, setModalTelefono] = useState("")
  const [modalDireccion, setModalDireccion] = useState("")

  // Estado para mostrar carga durante el procesamiento del pago
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  // Dirección y zona para entrega y cálculo de envío
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [deliveryZone, setDeliveryZone] = useState<'bucaramanga_am' | 'piedecuesta' | ''>('')
  const [shippingFee, setShippingFee] = useState<number>(0)
  const [pickupInStore, setPickupInStore] = useState(false)

  // Usar el contexto del carrito
  const { items, updateQuantity, removeFromCart, updateProductSize, getTotalItems, getTotalPrice, clearCart } = useCart()

  // Usar el hook personalizado para cargar categorías dinámicamente
  const { categories, isLoading: categoriesLoading, error: categoriesError } = useCategories()


  // Efecto para verificar autenticación
  useEffect(() => {
    checkAuth()

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  // Calcular envío basado en reglas proporcionadas
  useEffect(() => {
    const subtotal = getTotalPrice()
    let fee = 0
    if (pickupInStore) {
      fee = 0
    } else if (deliveryZone === 'bucaramanga_am') {
      fee = subtotal < 100000 ? 4000 : 0
    } else if (deliveryZone === 'piedecuesta') {
      fee = subtotal < 150000 ? 8000 : 0
    }
    setShippingFee(fee)
  }, [deliveryZone, items, getTotalPrice, pickupInStore])

  // Función para manejar el pago
  const handlePayment = async () => {
    if (!user) {
      // Si no está autenticado, mostrar modal de autenticación
      setIsAuthModalOpen(true)
    } else {
      // Validar que el carrito no esté vacío
      if (items.length === 0) {
        alert('Tu carrito está vacío. Agrega algunos productos antes de proceder al pago.')
        return
      }

      // Validar dirección y zona de entrega
      if (!pickupInStore && !deliveryAddress.trim()) {
        alert('Por favor ingresa la dirección de entrega y detalles antes de confirmar el pedido.')
        return
      }
      if (!pickupInStore && !deliveryZone) {
        alert('Por favor selecciona la ciudad/zona de entrega para calcular el envío.')
        return
      }

      // Mostrar indicador de carga
      setIsProcessingPayment(true)

      try {
        // Obtener información del usuario desde la tabla usuarios
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('id, nombre')
          .eq('correo', user.email)
          .single() as { data: { id: number; nombre: string } | null; error: any }

        if (userError || !userData) {
          alert('Error: No se pudo encontrar la información del usuario')
          setIsProcessingPayment(false)
          return
        }

        // Validar que todos los productos tienen IDs válidos
        for (const item of items) {
          if (!item.id || item.id <= 0) {
            alert('Error: Uno o más productos en el carrito no tienen ID válido.')
            setIsProcessingPayment(false)
            return
          }
          if (!item.unitPrice || item.unitPrice <= 0) {
            alert('Error: Uno o más productos en el carrito no tienen precio válido.')
            setIsProcessingPayment(false)
            return
          }
          if (!item.quantity || item.quantity <= 0) {
            alert('Error: Uno o más productos en el carrito no tienen cantidad válida.')
            setIsProcessingPayment(false)
            return
          }
        }

        // Preparar los items del carrito para el detalle del pedido
        const orderItems = items.map(item => ({
          producto_id: item.id!,
          cantidad: item.quantity,
          subtotal: item.unitPrice * item.quantity,
          tamano_index: item.selectedSizeIndex || 0
        }))

        // Calcular envío y total del pedido (según reglas)
        const cartSubtotal = getTotalPrice()
        const currentShipping = pickupInStore ? 0 : (deliveryZone === 'bucaramanga_am'
          ? (cartSubtotal < 100000 ? 4000 : 0)
          : (deliveryZone === 'piedecuesta' ? (cartSubtotal < 150000 ? 8000 : 0) : 0))
        const totalAmount = cartSubtotal + currentShipping

        // Crear el pedido en la tabla pedidos
        const { data: orderResult, error: orderError } = await supabase
          .from('pedidos')
          .insert([
            {
              usuario_id: userData.id,
              fecha: new Date().toISOString(),
              total: totalAmount,
              estado: 'pendiente',
              Direccion: pickupInStore ? 'Recoger en tienda' : `${deliveryAddress} | Zona: ${deliveryZone === 'bucaramanga_am' ? 'Bucaramanga / Área Metropolitana' : 'Piedecuesta'}`
            }
          ])
          .select()
          .single()

        if (orderError) {
          console.error('Error creando pedido:', orderError)
          alert('Error al procesar el pedido. Por favor, inténtalo de nuevo.')
          setIsProcessingPayment(false)
          return
        }

        // Crear los items del detalle del pedido
        const { error: detailError } = await supabase
          .from('detalle_pedido')
          .insert(
            orderItems.map(item => ({
              pedido_id: orderResult.id,
              producto_id: item.producto_id,
              cantidad: item.cantidad,
              subtotal: item.subtotal,
              tamano_index: item.tamano_index
            }))
          )

        if (detailError) {
          console.error('Error creando detalle del pedido:', detailError)
          alert('Error al procesar los productos del pedido. Por favor, inténtalo de nuevo.')
          setIsProcessingPayment(false)
          return
        }

        // Si el pedido se creó exitosamente, enviar correo de confirmación
        try {
          const userName = (userData as any).nombre || ''
          const emailResponse = await fetch('/api/send-order-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userEmail: user.email,
              userName: userName,
              orderId: orderResult.id,
              orderDate: orderResult.fecha,
              totalAmount: totalAmount,
              address: pickupInStore ? 'Recoger en tienda' : `${deliveryAddress} | Zona: ${deliveryZone === 'bucaramanga_am' ? 'Bucaramanga / Área Metropolitana' : 'Piedecuesta'}`,
              items: items,
              orderStatus: orderResult.estado
            })
          })

          if (!emailResponse.ok) {
            console.error('Error al enviar el correo de confirmación')
          }
        } catch (emailError) {
          console.error('Error al enviar el correo:', emailError)
          // No detener el proceso si falla el envío del correo
        }

        // Limpiar el carrito
        clearCart()

        // Mostrar mensaje de éxito
        alert(`¡Pedido creado exitosamente!

📦 Número de pedido: ${orderResult.id}
📊 Estado: ${orderResult.estado}
💰 Total: $${totalAmount.toLocaleString('es-CO')}
🚚 Envío: $${currentShipping.toLocaleString('es-CO')}
⏰ Fecha: ${new Date(orderResult.fecha).toLocaleDateString('es-CO')}
📧 Te hemos enviado un correo de confirmación a ${user.email}

Te notificaremos cuando tu pedido sea procesado.`)

        // Finalizar el indicador de carga
        setIsProcessingPayment(false)

      } catch (error) {
        console.error('Error en el proceso de pago:', error)
        alert('Error inesperado al procesar el pedido. Por favor, inténtalo de nuevo.')
        setIsProcessingPayment(false)
      }
    }
  }

  // Función para manejar registro en el modal
  const handleModalRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (modalRegisterPassword !== modalConfirmPassword) {
      alert("Las contraseñas no coinciden")
      return
    }

    if (!modalRegisterEmail || !modalRegisterPassword || !modalNombre || !modalTelefono || !modalDireccion) {
      alert("Por favor completa todos los campos")
      return
    }

    setModalIsLoading(true)

    try {
      // Crear usuario en Supabase Auth con email confirmation
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: modalRegisterEmail,
        password: modalRegisterPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            nombre: modalNombre,
            telefono: modalTelefono,
            direccion: modalDireccion
          }
        }
      })

      if (authError) throw authError

      if (authData.user) {
        // Guardar información adicional en la tabla usuarios
        const { error: insertError } = await supabase
          .from('usuarios')
          .insert([
            {
              nombre: modalNombre,
              correo: modalRegisterEmail,
              telefono: modalTelefono,
              direccion: modalDireccion,
              rol: 'cliente',
              password: modalRegisterPassword
            }
          ])

        if (insertError) throw insertError

        alert("¡Registro exitoso! Revisa tu email para confirmar tu cuenta.")
        // Limpiar formulario
        setModalRegisterEmail("")
        setModalRegisterPassword("")
        setModalConfirmPassword("")
        setModalNombre("")
        setModalTelefono("")
        setModalDireccion("")
        setModalIsRegistering(false)
        setIsAuthModalOpen(false)
      }
    } catch (error) {
      console.error('Error en registro:', error)
      alert("Error en el registro. Inténtalo de nuevo.")
    } finally {
      setModalIsLoading(false)
    }
  }

  // Función para manejar login en el modal
  const handleModalLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setModalIsLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: modalEmail,
        password: modalPassword,
      })

      if (error) throw error

      if (data.user) {
        alert("Inicio de sesión exitoso")
        setIsAuthModalOpen(false)
        // Limpiar formulario
        setModalEmail("")
        setModalPassword("")
      }
    } catch (error) {
      console.error('Error en login:', error)
      alert("Error en el inicio de sesión. Verifica tus credenciales.")
    } finally {
      setModalIsLoading(false)
    }
  }


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
        <Header 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={(e) => {
            e.preventDefault()
            if (searchQuery.trim()) {
              router.push(`/tienda?search=${encodeURIComponent(searchQuery.trim())}`)
            }
          }}
          onAccountClick={() => setIsAccountDrawerOpen(true)}
        />

        <main className="py-4 sm:py-6 md:py-8">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="max-w-4xl mx-auto">
              {/* Título */}
              <div className="mb-4 sm:mb-6 md:mb-8">
                <h1 className="text-2xl sm:text-3xl font-black text-black mb-1 sm:mb-2">Carrito de Compras</h1>
                <p className="text-sm sm:text-base text-gray-600">
                  {items.length === 0 ? 'Tu carrito está vacío' : `${getTotalItems()} productos en tu carrito`}
                </p>
              </div>

              {items.length === 0 ? (
                /* Carrito vacío */
                <div className="text-center py-8 sm:py-12 md:py-16">
                  <ShoppingCart className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 text-gray-300 mx-auto mb-4 sm:mb-6" />
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2 sm:mb-4">Tu carrito está vacío</h2>
                  <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto px-4">
                    ¡Es hora de llenarlo con productos increíbles para tus mascotas!
                  </p>
                  <Link
                    href="/tienda"
                    className="inline-block bg-[#196428] hover:bg-[#145020] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold transition-colors text-sm sm:text-base"
                  >
                    Continuar Comprando
                  </Link>
                </div>
              ) : (
                /* Carrito con productos */
                <div className="space-y-4 sm:space-y-6">
                  {/* Lista de productos */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
                    <div className="space-y-3 sm:space-y-4">
                      {items.map((item) => (
                        <div key={item.id!} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border border-gray-200 rounded-lg">
                          {/* Imagen del producto */}
                          <div className="w-full sm:w-20 h-20 sm:h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 mx-auto sm:mx-0">
                            <Image
                              src={item.imagen_url || '/placeholder.jpg'}
                              alt={item.nombre}
                              width={80}
                              height={80}
                              className="w-full h-full object-contain"
                            />
                          </div>

                          {/* Información del producto */}
                          <div className="flex-1 w-full sm:w-auto">
                            <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-1">{item.nombre}</h3>
                            <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">{item.descripcion || 'Descripción del producto'}</p>

                            {/* Mostrar tamaños del producto con selección */}
                            <div className="mb-2">
                              <p className="text-xs text-gray-500 mb-1">Tamaño seleccionado:</p>
                              <ProductSizeBadges
                                tamaños={item.tamano}
                                size="sm"
                                selectedIndex={item.selectedSizeIndex}
                                onSizeSelect={(newSizeIndex) => updateProductSize(item.id!, newSizeIndex)}
                                interactive={true}
                                className="mb-2"
                              />
                            </div>

                            {/* Indicadores */}
                            <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2">
                              {item.descuento && (
                                <span className="bg-red-100 text-red-800 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                                  Oferta
                                </span>
                              )}
                              {item.destacado && (
                                <span className="bg-blue-100 text-blue-800 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                                  Destacado
                                </span>
                              )}
                              {item.novedad && (
                                <span className="bg-green-100 text-green-800 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded">
                                  Nuevo
                                </span>
                              )}
                            </div>

                            {/* Precio */}
                            <div className="flex items-center gap-2 mb-3 sm:mb-0">
                              {item.discountApplied > 0 ? (
                                <>
                                  <span className="text-red-500 font-medium line-through text-sm sm:text-base">
                                    $ {formatPrice(item.unitPrice / (1 - item.discountApplied / 100))}
                                  </span>
                                  <span className="text-[#196428] font-bold text-base sm:text-lg">
                                    $ {formatPrice(item.unitPrice)}
                                  </span>
                                </>
                              ) : (
                                <span className="text-[#196428] font-bold text-base sm:text-lg">
                                  $ {formatPrice(item.unitPrice)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Controles de cantidad */}
                          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-start border-t sm:border-t-0 pt-3 sm:pt-0">
                            <div className="flex items-center gap-2 sm:gap-3">
                              <button
                                onClick={() => updateQuantity(item.id!, (item.quantity || 1) - 1)}
                                className="w-9 h-9 sm:w-8 sm:h-8 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-full flex items-center justify-center transition-colors touch-manipulation"
                                aria-label="Disminuir cantidad"
                              >
                                <Minus className="h-4 w-4" />
                              </button>

                              <span className="w-12 text-center font-semibold text-base sm:text-lg">
                                {item.quantity}
                              </span>

                              <button
                                onClick={() => updateQuantity(item.id!, (item.quantity || 1) + 1)}
                                className="w-9 h-9 sm:w-8 sm:h-8 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-full flex items-center justify-center transition-colors touch-manipulation"
                                aria-label="Aumentar cantidad"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.id!)}
                              className="w-9 h-9 sm:w-8 sm:h-8 bg-red-100 hover:bg-red-200 active:bg-red-300 text-red-600 rounded-full flex items-center justify-center transition-colors touch-manipulation sm:ml-2"
                              aria-label="Eliminar producto"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Resumen del pedido */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-5 md:p-6">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Resumen del Pedido</h2>

                    {/* Opción de recoger en tienda, zona y dirección */}
                    <div className="space-y-3 mb-4 sm:mb-6">
                      <div className="flex items-center gap-2">
                        <input
                          id="pickupInStore"
                          type="checkbox"
                          checked={pickupInStore}
                          onChange={(e) => {
                            const checked = e.target.checked
                            setPickupInStore(checked)
                            if (checked) {
                              setDeliveryZone('' as any)
                              setDeliveryAddress('')
                            }
                          }}
                          className="h-4 w-4 sm:h-5 sm:w-5 text-[#196428] border-gray-300 rounded touch-manipulation"
                        />
                        <label htmlFor="pickupInStore" className="text-sm sm:text-base font-medium text-gray-800 cursor-pointer">Recoger en tienda</label>
                      </div>

                      {!pickupInStore && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Ciudad/Zona de entrega</label>
                            <select
                              value={deliveryZone}
                              onChange={(e) => setDeliveryZone(e.target.value as any)}
                              className="w-full px-3 py-2.5 sm:py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#196428] bg-white text-sm touch-manipulation"
                            >
                              <option value="">Selecciona una opción</option>
                              <option value="bucaramanga_am">Bucaramanga / Área Metropolitana</option>
                              <option value="piedecuesta">Piedecuesta</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Dirección de entrega y detalles</label>
                            <textarea
                              value={deliveryAddress}
                              onChange={(e) => setDeliveryAddress(e.target.value)}
                              rows={3}
                              placeholder="Ej: Calle 10 # 20-30, Apto 401, Barrio XXX, Referencia: Portería azul"
                              className="w-full px-3 py-2.5 sm:py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#196428] bg-white text-sm resize-none"
                            />
                          </div>
                        </>
                      )}
                    </div>

                    <div className="space-y-2.5 sm:space-y-3 mb-4 sm:mb-6">
                      <div className="flex justify-between text-sm sm:text-base text-gray-600">
                        <span>Subtotal ({getTotalItems()} productos)</span>
                        <span className="font-medium">$ {formatPrice(getTotalPrice())}</span>
                      </div>

                      <div className="flex justify-between text-sm sm:text-base text-gray-600">
                        <span>Envío</span>
                        <span className={shippingFee > 0 ? 'text-gray-800 font-medium' : 'text-green-600 font-medium'}>
                          {shippingFee > 0 ? `$ ${formatPrice(shippingFee)}` : 'Gratis'}
                        </span>
                      </div>

                      <div className="flex justify-between text-sm sm:text-base text-gray-600">
                        <span>Impuestos</span>
                        <span className="text-green-600 font-medium">Incluidos</span>
                      </div>

                      <div className="border-t border-gray-200 pt-2.5 sm:pt-3">
                        <div className="flex justify-between text-base sm:text-lg font-bold text-gray-900">
                          <span>Total</span>
                          <span className="text-[#196428]">$ {formatPrice(getTotalPrice() + shippingFee)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2.5 sm:space-y-3">
                      <button
                        onClick={handlePayment}
                        disabled={isProcessingPayment}
                        className="w-full bg-[#196428] hover:bg-[#145020] active:bg-[#0f3a15] disabled:bg-gray-400 text-white py-3 sm:py-3.5 px-6 rounded-full font-semibold transition-colors disabled:cursor-not-allowed text-sm sm:text-base touch-manipulation"
                      >
                        {isProcessingPayment
                          ? 'Procesando...'
                          : (user ? 'Confirmar Pedido' : 'Proceder al Pago')
                        }
                      </button>

                      <button
                        onClick={clearCart}
                        className="w-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 py-3 sm:py-3.5 px-6 rounded-full font-semibold transition-colors text-sm sm:text-base touch-manipulation"
                      >
                        Vaciar Carrito
                      </button>

                      <Link
                        href="/tienda"
                        className="block text-center text-[#196428] hover:text-[#145020] font-medium transition-colors text-sm sm:text-base py-2"
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

        <Footer />
      </div>

      {/* Modal de Autenticación para el Pago */}
      <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
        <DialogContent className="w-[95vw] max-w-sm mx-auto bg-[#FBFFE6] border-2 border-gray-200 shadow-2xl rounded-xl sm:rounded-2xl max-h-[90vh] flex flex-col">
          <DialogHeader className="text-center border-b border-gray-200 pb-3 sm:pb-4 pt-2 flex-shrink-0">
            <DialogTitle className="text-lg sm:text-xl font-bold text-gray-800">Iniciar Sesión o Registrarse</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-gray-600 mt-1">
              Para proceder con el pago, necesitas tener una cuenta
            </DialogDescription>
          </DialogHeader>
          <div className="px-3 sm:px-4 py-3 sm:py-4 overflow-y-auto flex-1">
            {/* Formulario de Login/Registro para el Modal */}
            <div className="w-full space-y-3">
                {/* Ya soy cliente */}
                {!modalIsRegistering && (
                  <div className="space-y-3">
                    <form className="space-y-3" onSubmit={handleModalLogin}>
                      <div>
                        <input
                          type="email"
                          placeholder="Email"
                          value={modalEmail}
                          onChange={(e) => setModalEmail(e.target.value)}
                          className="w-full px-3 py-2.5 sm:py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#196428] bg-white text-sm transition-all duration-200 touch-manipulation"
                        />
                      </div>
                      <div className="relative">
                        <input
                          type={modalShowPassword ? "text" : "password"}
                          placeholder="Contraseña"
                          value={modalPassword}
                          onChange={(e) => setModalPassword(e.target.value)}
                          className="w-full px-3 py-2.5 sm:py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#196428] bg-white text-sm pr-10 sm:pr-12 transition-all duration-200 touch-manipulation"
                        />
                        <button
                          type="button"
                          onClick={() => setModalShowPassword(!modalShowPassword)}
                          className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors touch-manipulation p-1"
                        >
                          {modalShowPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      <button
                        type="submit"
                        disabled={modalIsLoading}
                        className="w-full bg-[#196428] hover:bg-[#145020] active:bg-[#0f3a15] text-white font-semibold py-2.5 sm:py-2 rounded-lg transition-all duration-200 text-sm disabled:opacity-50 hover:shadow-lg touch-manipulation"
                      >
                        {modalIsLoading ? "Cargando..." : "Iniciar sesión"}
                      </button>
                    </form>

                    <div className="flex flex-col space-y-2">
                      <div className="text-center">
                        <a href="#" className="text-[#196428] hover:underline text-xs font-medium transition-colors">
                          Olvidé mi contraseña
                        </a>
                      </div>
                      <div className="text-[10px] text-gray-600 text-center leading-tight">
                        Protegido por reCAPTCHA - <a href="#" className="underline hover:text-[#196428] transition-colors">Privacidad</a> y{' '}
                        <a href="#" className="underline hover:text-[#196428] transition-colors">Condiciones</a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Divider */}
                <div className="border-t border-gray-300"></div>

                {/* Nuevo aquí / Formulario de registro */}
                <div className="space-y-3">
                  {!modalIsRegistering ? (
                    <>
                      <div className="text-center">
                        <h2 className="text-base font-bold text-gray-800 mb-2">
                          ¿Nuevo aquí?
                        </h2>
                        <p className="text-xs text-gray-700 mb-3">
                          ¡Disfruta de beneficios exclusivos!
                        </p>
                      </div>

                      <ul className="space-y-2 mb-4">
                        <li className="flex items-start gap-3">
                          <Check className="h-4 w-4 text-[#196428] flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700 leading-tight">
                            Compras más <span className="font-bold">rápidas</span>
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="h-4 w-4 text-[#196428] flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700 leading-tight">
                            <span className="font-bold">Historial</span> de pedidos
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="h-4 w-4 text-[#196428] flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700 leading-tight">
                            <span className="font-bold">Descuentos</span> exclusivos
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="h-4 w-4 text-[#196428] flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700 leading-tight">
                            <span className="font-bold">Lista</span> de deseos
                          </span>
                        </li>
                      </ul>

                      <button
                        type="button"
                        onClick={() => setModalIsRegistering(true)}
                        className="w-full bg-[#196428] hover:bg-[#145020] text-white font-semibold py-2 rounded-lg transition-all duration-200 text-sm hover:shadow-lg"
                      >
                        Regístrate ahora
                      </button>
                    </>
                  ) : (
                    /* Formulario de registro */
                    <div className="space-y-3">
                      <div className="text-center mb-3">
                        <h3 className="text-base font-bold text-gray-800">
                          Crear cuenta
                        </h3>
                        <p className="text-xs text-gray-600 mt-1">
                          Completa tus datos para registrarte
                        </p>
                      </div>

                      <form className="space-y-3" onSubmit={handleModalRegister}>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Nombre completo"
                            value={modalNombre}
                            onChange={(e) => setModalNombre(e.target.value)}
                            className="w-full px-3 py-2.5 sm:py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#196428] bg-white text-sm transition-all duration-200 touch-manipulation"
                          />
                        </div>

                        <div className="relative">
                          <input
                            type="email"
                            placeholder="Email"
                            value={modalRegisterEmail}
                            onChange={(e) => setModalRegisterEmail(e.target.value)}
                            className="w-full px-3 py-2.5 sm:py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#196428] bg-white text-sm transition-all duration-200 touch-manipulation"
                          />
                        </div>

                        <div className="relative">
                          <input
                            type="tel"
                            placeholder="Teléfono"
                            value={modalTelefono}
                            onChange={(e) => setModalTelefono(e.target.value)}
                            className="w-full px-3 py-2.5 sm:py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#196428] bg-white text-sm transition-all duration-200 touch-manipulation"
                          />
                        </div>

                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Dirección completa"
                            value={modalDireccion}
                            onChange={(e) => setModalDireccion(e.target.value)}
                            className="w-full px-3 py-2.5 sm:py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#196428] bg-white text-sm transition-all duration-200 touch-manipulation"
                          />
                        </div>

                        <div className="relative">
                          <input
                            type={modalShowPassword ? "text" : "password"}
                            placeholder="Contraseña"
                            value={modalRegisterPassword}
                            onChange={(e) => setModalRegisterPassword(e.target.value)}
                            className="w-full px-3 py-2.5 sm:py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#196428] bg-white text-sm pr-10 transition-all duration-200 touch-manipulation"
                          />
                          <button
                            type="button"
                            onClick={() => setModalShowPassword(!modalShowPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors touch-manipulation p-1"
                          >
                            {modalShowPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>

                        <div className="relative">
                          <input
                            type={modalShowConfirmPassword ? "text" : "password"}
                            placeholder="Confirmar contraseña"
                            value={modalConfirmPassword}
                            onChange={(e) => setModalConfirmPassword(e.target.value)}
                            className="w-full px-3 py-2.5 sm:py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#196428] bg-white text-sm pr-10 transition-all duration-200 touch-manipulation"
                          />
                          <button
                            type="button"
                            onClick={() => setModalShowConfirmPassword(!modalShowConfirmPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors touch-manipulation p-1"
                          >
                            {modalShowConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>

                        <button
                          type="submit"
                          disabled={modalIsLoading}
                          className="w-full bg-[#196428] hover:bg-[#145020] active:bg-[#0f3a15] text-white font-semibold py-2.5 sm:py-2 rounded-lg transition-all duration-200 text-sm disabled:opacity-50 hover:shadow-lg touch-manipulation"
                        >
                          {modalIsLoading ? "Registrando..." : "Crear cuenta"}
                        </button>

                        <button
                          type="button"
                          onClick={() => setModalIsRegistering(false)}
                          className="w-full text-[#196428] hover:underline text-xs font-medium transition-colors text-center"
                        >
                          ← Volver al inicio de sesión
                        </button>
                      </form>
                    </div>
                  )}
                </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Account Drawer for Mobile */}
      <Drawer open={isAccountDrawerOpen} onOpenChange={setIsAccountDrawerOpen}>
        <DrawerContent className="max-h-[85vh] z-[110]">
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
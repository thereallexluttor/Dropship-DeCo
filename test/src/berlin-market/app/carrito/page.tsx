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
import { loadStoresFromSupabase, type Store } from "../lib/stores"
import CartCounter from "../components/CartCounter"
import ProductSizeBadges from "../components/ProductSizeBadges"
import PaymentStatusModal from "../components/PaymentStatusModal"
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

  // Estados para el modal de estado de pago
  const [paymentStatusModalOpen, setPaymentStatusModalOpen] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'approved' | 'cancelled' | 'verifying' | null>(null)
  const [currentOrderId, setCurrentOrderId] = useState<number | string | undefined>()
  const [currentTotalAmount, setCurrentTotalAmount] = useState<number | undefined>()
  const [currentRequestId, setCurrentRequestId] = useState<string | undefined>()

  // Dirección y zona para entrega y cálculo de envío
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [deliveryZone, setDeliveryZone] = useState<'bucaramanga_am' | 'piedecuesta' | ''>('')
  const [shippingFee, setShippingFee] = useState<number>(0)
  const [pickupInStore, setPickupInStore] = useState(false)
  
  // Ref para prevenir múltiples ejecuciones simultáneas del procesamiento de pago
  const isProcessingPaymentRef = useRef(false)
  const processedRequestIdsRef = useRef<Set<string>>(new Set())
  const paymentStatusPollingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Usar el contexto del carrito
  const { items, updateQuantity, removeFromCart, updateProductSize, getTotalItems, getTotalPrice, clearCart, restoreCart } = useCart()

  // Usar el hook personalizado para cargar categorías dinámicamente
  const { categories, isLoading: categoriesLoading, error: categoriesError } = useCategories()

  // Cargar tiendas para mostrar nombre en items del carrito
  const [tiendas, setTiendas] = useState<Store[]>([])
  useEffect(() => {
    loadStoresFromSupabase().then(setTiendas)
  }, [])


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

  // Limpiar polling al desmontar el componente
  useEffect(() => {
    return () => {
      if (paymentStatusPollingIntervalRef.current) {
        clearInterval(paymentStatusPollingIntervalRef.current)
        paymentStatusPollingIntervalRef.current = null
      }
    }
  }, [])

  // Verificar estado del pago cuando regresa desde la pasarela
  useEffect(() => {
    const checkPaymentStatus = async () => {
      // Prevenir ejecuciones múltiples simultáneas
      if (isProcessingPaymentRef.current) {
        console.log('⏸️ Procesamiento de pago ya en curso, saltando ejecución')
        return
      }

      debugCartState('INICIO_VERIFICACION_PAGO')

      // Verificar si hay parámetro de retorno de pago en la URL
      const urlParams = new URLSearchParams(window.location.search)
      const paymentReturn = urlParams.get('payment_return')

      console.log('🔍 Parámetro payment_return:', paymentReturn)

      if (paymentReturn === 'true') {
        console.log('💳 Detectado retorno desde pasarela de pago')

        // Limpiar URL inmediatamente para evitar recargas
        window.history.replaceState({}, '', '/carrito')

        // Buscar el requestId guardado en localStorage
        const pendingPaymentData = localStorage.getItem('pendingPayment')
        console.log('💾 Datos de pago pendientes en localStorage:', !!pendingPaymentData)

        if (!pendingPaymentData) {
          console.log('❌ No hay datos de pago pendiente - usuario canceló o navega manualmente')
          // No mostrar modal si no hay datos
          return
        }

        try {
          console.log('🔍 Verificando datos de pago pendientes...')
          const { requestId, orderData, cartState, timestamp } = JSON.parse(pendingPaymentData)
          console.log('📦 Datos parseados:', { requestId, hasOrderData: !!orderData, hasCartState: !!cartState, timestamp })

          // MOSTRAR MODAL INMEDIATAMENTE con estado "verifying" para prevenir pagos duplicados
          setCurrentOrderId(orderData?.orderId)
          setCurrentTotalAmount(orderData?.totalAmount)
          setCurrentRequestId(requestId)
          setPaymentStatus('verifying')
          setPaymentStatusModalOpen(true)
          
          // Marcar que estamos procesando para prevenir ejecuciones simultáneas
          isProcessingPaymentRef.current = true

          // Verificar si este requestId ya fue procesado ANTES de continuar
          const processedOrderKey = `processed_order_${requestId}`
          const orderAlreadyProcessed = localStorage.getItem(processedOrderKey)
          
          if (orderAlreadyProcessed || processedRequestIdsRef.current.has(requestId)) {
            console.log('⚠️ Este requestId ya fue procesado anteriormente:', {
              requestId,
              localStorage: !!orderAlreadyProcessed,
              ref: processedRequestIdsRef.current.has(requestId)
            })
            // Limpiar datos y carrito
            localStorage.removeItem('pendingPayment')
            clearCart()
            
            // Actualizar modal para mostrar que el pedido ya existe
            setPaymentStatus('approved')
            setCurrentOrderId(orderData?.orderId || 'existente')
            return
          }

          // Si hay datos pendientes, intentar restaurar el estado del carrito inmediatamente
          if (cartState) {
            console.log('🔄 Restaurando estado del carrito...')
            restoreCartState(cartState)
            debugCartState('DESPUES_RESTAURACION_INICIAL')
          }
          
          // Verificar si los datos son muy antiguos (más de 1 hora)
          if (timestamp && Date.now() - timestamp > 3600000) {
            console.log('Datos de pago pendiente muy antiguos, limpiando...')
            localStorage.removeItem('pendingPayment')
            window.history.replaceState({}, '', '/carrito')
            return
          }
          
          if (!requestId) {
            console.error('No se encontró requestId en los datos guardados')
            localStorage.removeItem('pendingPayment')
            window.history.replaceState({}, '', '/carrito')
            // El carrito se mantiene intacto - usuario canceló antes de iniciar
            return
          }

          console.log('🔍 Consultando estado del pago con requestId:', requestId)
          debugCartState('ANTES_CONSULTA_PAGO')

          // Consultar el estado de la sesión de pago
          const statusResponse = await fetch('/api/check-payment-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ requestId }),
          })

          console.log('📡 Respuesta de consulta de pago:', { ok: statusResponse.ok, status: statusResponse.status })

          // Si la consulta falla, asumir que el usuario canceló o la sesión no existe
          if (!statusResponse.ok) {
            const errorData = await statusResponse.json().catch(() => ({}))
            console.log('❌ No se pudo consultar el estado del pago (posible cancelación):', errorData)

            // Limpiar datos y mantener el carrito intacto
            localStorage.removeItem('pendingPayment')
            window.history.replaceState({}, '', '/carrito')
            // No mostrar alert para evitar spam - el usuario simplemente canceló
            return
          }

          const sessionStatus = await statusResponse.json()
          const paymentStatus = sessionStatus.status?.status || sessionStatus.payment?.[0]?.status?.status

          console.log('💳 Estado del pago recibido:', {
            sessionStatus,
            paymentStatus,
            statusPath: sessionStatus.status?.status,
            paymentPath: sessionStatus.payment?.[0]?.status?.status
          })

          // Limpiar URL ANTES de procesar el resultado
          console.log('🧹 Limpiando URL')
          window.history.replaceState({}, '', '/carrito')

          // Verificar el estado del pago
          if (paymentStatus === 'APPROVED') {
            console.log('✅ Pago aprobado - verificando si ya fue procesado')

            // CRÍTICO: Verificar si este requestId ya fue procesado ANTES de hacer cualquier cosa
            const processedOrderKey = `processed_order_${requestId}`
            const orderAlreadyProcessed = localStorage.getItem(processedOrderKey)
            
            // También verificar en el ref para prevenir ejecuciones simultáneas
            if (orderAlreadyProcessed || processedRequestIdsRef.current.has(requestId)) {
              console.log('⚠️ Pedido ya fue procesado anteriormente, evitando duplicado')
              console.log('🔍 Verificación:', {
                localStorage: !!orderAlreadyProcessed,
                ref: processedRequestIdsRef.current.has(requestId),
                requestId
              })
              
              // Limpiar datos pendientes y carrito
              localStorage.removeItem('pendingPayment')
              clearCart()
              debugCartState('PEDIDO_YA_PROCESADO')
              
              // Actualizar modal para mostrar estado aprobado (ya está abierto)
              setCurrentOrderId(orderData?.orderId || 'existente')
              setCurrentTotalAmount(orderData?.totalAmount)
              setCurrentRequestId(requestId)
              setPaymentStatus('approved')
              
              // Resetear flag de procesamiento
              isProcessingPaymentRef.current = false
              
              return
            }

            // Marcar que estamos procesando este requestId
            processedRequestIdsRef.current.add(requestId)
            localStorage.setItem(processedOrderKey, Date.now().toString())

            try {
              debugCartState('PAGO_APROBADO_ANTES_CREAR_PEDIDO')

              // Pago aprobado: crear el pedido y limpiar el carrito
              const orderResult = await createOrderFromPendingPayment(orderData, requestId, 'APPROVED')

              const orderId = orderResult?.alreadyExists ? 'existente' : orderResult?.id || 'desconocido'
              
              // Actualizar modal con estado aprobado (ya está abierto)
              setCurrentOrderId(orderId)
              setCurrentTotalAmount(orderData.totalAmount)
              setCurrentRequestId(requestId)
              setPaymentStatus('approved')

              // Limpiar datos pendientes después de crear el pedido exitosamente
              localStorage.removeItem('pendingPayment')

              // SOLO limpiar el carrito cuando el pago está explícitamente aprobado
              clearCart()
              debugCartState('DESPUES_LIMPIAR_CARRITO_APROBADO')
            } catch (error) {
              console.error('❌ Error procesando pedido aprobado:', error)
              // Si hay error, remover las marcas para permitir reintento
              isProcessingPaymentRef.current = false
              processedRequestIdsRef.current.delete(requestId)
              localStorage.removeItem(processedOrderKey)
              
              // Cerrar modal y mostrar error
              setPaymentStatusModalOpen(false)
              setPaymentStatus(null)
              throw error
            } finally {
              // Resetear el flag de procesamiento después de un delay para evitar condiciones de carrera
              setTimeout(() => {
                isProcessingPaymentRef.current = false
              }, 2000)
            }
          } else {
            console.log('❌ Pago NO aprobado - estado:', paymentStatus)
            debugCartState('PAGO_NO_APROBADO_INICIO')
            
            // Restaurar el estado del carrito desde los datos guardados
            if (cartState) {
              restoreCartState(cartState)
            } else {
              console.log('⚠️ No hay estado del carrito para restaurar')
            }

            // Verificar que el carrito no se haya vaciado
            console.log('🛒 Estado actual del carrito después de restauración:', {
              itemsCount: items.length,
              totalPrice: getTotalPrice(),
              pickupInStore,
              deliveryAddress,
              deliveryZone
            })
            debugCartState('DESPUES_RESTAURACION_PAGO_NO_APROBADO')

            if (paymentStatus === 'PENDING' || paymentStatus === 'PENDING_VALIDATION') {
              // Pago pendiente: actualizar modal (ya está abierto) y empezar polling
              setCurrentOrderId(orderData?.orderId)
              setCurrentTotalAmount(orderData?.totalAmount)
              setCurrentRequestId(requestId)
              setPaymentStatus('pending')
              
              // Iniciar polling para verificar estado cada 5 segundos
              if (paymentStatusPollingIntervalRef.current) {
                clearInterval(paymentStatusPollingIntervalRef.current)
              }
              paymentStatusPollingIntervalRef.current = setInterval(() => {
                checkPaymentStatusForPolling()
              }, 5000)
              
              // NO limpiar datos pendientes - necesitamos el requestId para polling
            } else if (paymentStatus === 'REJECTED' || paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED') {
              // Pago cancelado/rechazado: actualizar modal (ya está abierto)
              setCurrentOrderId(orderData?.orderId)
              setCurrentTotalAmount(orderData?.totalAmount)
              setCurrentRequestId(requestId)
              setPaymentStatus('cancelled')
              
              // Limpiar datos pendientes cuando el pago es cancelado
              localStorage.removeItem('pendingPayment')
            } else {
              // Estado desconocido o null/undefined - probablemente el usuario canceló
              // Cerrar modal y limpiar
              console.log('🚫 Estado de pago desconocido o cancelado:', paymentStatus, '- Carrito mantenido intacto')
              setPaymentStatusModalOpen(false)
              setPaymentStatus(null)
              localStorage.removeItem('pendingPayment')
              return // Salir sin mostrar mensaje
            }
            
            // Resetear flag de procesamiento después de determinar el estado
            isProcessingPaymentRef.current = false
          }
        } catch (error) {
          console.error('Error verificando estado del pago:', error)
          
          // Resetear flags en caso de error
          isProcessingPaymentRef.current = false
          
          // Cerrar modal y limpiar datos pendientes
          setPaymentStatusModalOpen(false)
          setPaymentStatus(null)
          localStorage.removeItem('pendingPayment')
          
          // No mostrar alert en caso de error - asumir que el usuario canceló
          // El carrito se mantiene intacto
        }
      } else {
        // Si no hay parámetro payment_return pero hay datos pendientes antiguos, limpiarlos
        const pendingPaymentData = localStorage.getItem('pendingPayment')
        if (pendingPaymentData) {
          try {
            const { timestamp } = JSON.parse(pendingPaymentData)
            // Si los datos tienen más de 1 hora, limpiarlos
            if (timestamp && Date.now() - timestamp > 3600000) {
              localStorage.removeItem('pendingPayment')
            }
          } catch (e) {
            // Si hay error parseando, limpiar de todas formas
            localStorage.removeItem('pendingPayment')
          }
        }

        // Limpiar pedidos procesados antiguos (más de 24 horas)
        const processedOrderKeys = Object.keys(localStorage).filter(key => key.startsWith('processed_order_'))
        processedOrderKeys.forEach(key => {
          try {
            // Extraer timestamp del key (formato: processed_order_requestId_timestamp)
            const parts = key.split('_')
            if (parts.length >= 4) {
              const timestamp = parseInt(parts[parts.length - 1])
              // Si tiene más de 24 horas, limpiar
              if (!isNaN(timestamp) && Date.now() - timestamp > 86400000) {
                localStorage.removeItem(key)
              }
            }
          } catch (e) {
            // Si hay error, limpiar el key problemático
            localStorage.removeItem(key)
          }
        })
      }
    }

    checkPaymentStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Función para restaurar el estado completo del carrito desde los datos guardados
  const restoreCartState = (cartState: any) => {
    try {
      console.log('🔄 Iniciando restauración del carrito:', {
        hasItems: !!cartState.items,
        itemsCount: cartState.items?.length || 0,
        pickupInStore: cartState.pickupInStore,
        deliveryAddress: cartState.deliveryAddress,
        deliveryZone: cartState.deliveryZone,
        shippingFee: cartState.shippingFee
      })

      // Restaurar items del carrito usando la función del contexto
      if (cartState.items && Array.isArray(cartState.items) && cartState.items.length > 0) {
        console.log('🛒 Restaurando items del carrito:', cartState.items.length, 'productos')
        restoreCart(cartState.items)
      } else {
        console.log('⚠️ No hay items para restaurar en el carrito')
      }

      // Restaurar opciones de entrega
      if (cartState.pickupInStore !== undefined) {
        console.log('📦 Restaurando opción de recogida:', cartState.pickupInStore)
        setPickupInStore(cartState.pickupInStore)
      }
      if (cartState.deliveryAddress) {
        console.log('🏠 Restaurando dirección de entrega:', cartState.deliveryAddress)
        setDeliveryAddress(cartState.deliveryAddress)
      }
      if (cartState.deliveryZone) {
        console.log('📍 Restaurando zona de entrega:', cartState.deliveryZone)
        setDeliveryZone(cartState.deliveryZone)
      }
      if (cartState.shippingFee !== undefined) {
        console.log('💰 Restaurando costo de envío:', cartState.shippingFee)
        setShippingFee(cartState.shippingFee)
      }

      console.log('✅ Estado del carrito restaurado exitosamente')
    } catch (error) {
      console.error('❌ Error restaurando estado del carrito:', error)
    }
  }

  // Función para hacer debugging detallado del estado del carrito
  const debugCartState = (context: string) => {
    console.log(`🐛 DEBUG [${context}]:`, {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      cartItems: items.length,
      cartDetails: items.map(item => ({
        id: item.id,
        nombre: item.nombre,
        quantity: item.quantity,
        selectedSizeIndex: item.selectedSizeIndex,
        unitPrice: item.unitPrice
      })),
      totalPrice: getTotalPrice(),
      pickupInStore,
      deliveryAddress,
      deliveryZone,
      shippingFee,
      localStorageKeys: Object.keys(localStorage).filter(key =>
        key.includes('cart') || key.includes('pending') || key.includes('payment')
      ),
      pendingPaymentData: localStorage.getItem('pendingPayment') ? 'EXISTS' : 'NOT_FOUND',
      userAuthenticated: !!user
    })
  }

  // Función para verificar el estado del pago (usado para polling)
  const checkPaymentStatusForPolling = async () => {
    if (!currentRequestId) return

    try {
      const statusResponse = await fetch('/api/check-payment-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestId: currentRequestId }),
      })

      if (!statusResponse.ok) {
        console.log('❌ Error verificando estado del pago para polling')
        return
      }

      const sessionStatus = await statusResponse.json()
      const paymentStatus = sessionStatus.status?.status || sessionStatus.payment?.[0]?.status?.status

      console.log('🔄 Estado del pago (polling):', paymentStatus)

      if (paymentStatus === 'APPROVED' || paymentStatus === 'APPROVED_PARTIAL') {
        // Pago aprobado: actualizar modal y limpiar polling
        if (paymentStatusPollingIntervalRef.current) {
          clearInterval(paymentStatusPollingIntervalRef.current)
          paymentStatusPollingIntervalRef.current = null
        }
        
        setPaymentStatus('approved')
        
        // Verificar si el pedido ya existe o crearlo
        const pendingPaymentData = localStorage.getItem('pendingPayment')
        if (pendingPaymentData) {
          try {
            const { orderData: savedOrderData, requestId: savedRequestId } = JSON.parse(pendingPaymentData)
            
            // Verificar si ya existe el pedido
            const { data: userData } = await supabase
              .from('usuarios')
              .select('id')
              .eq('correo', user?.email)
              .single()

            if (userData) {
              const { data: existingOrders } = await supabase
                .from('pedidos')
                .select('id')
                .eq('usuario_id', userData.id)
                .eq('total', savedOrderData.totalAmount)
                .eq('Direccion', savedOrderData.address)
                .gte('fecha', new Date(Date.now() - 600000).toISOString())
                .order('fecha', { ascending: false })
                .limit(1)

              if (existingOrders && existingOrders.length > 0) {
                setCurrentOrderId(existingOrders[0].id)
              } else {
                // Crear el pedido (pago ya está aprobado según el polling)
                const orderResult = await createOrderFromPendingPayment(savedOrderData, savedRequestId || currentRequestId || '', 'APPROVED')
                setCurrentOrderId(orderResult?.id || 'desconocido')
              }
            }
            
            localStorage.removeItem('pendingPayment')
            clearCart()
          } catch (error) {
            console.error('Error procesando pago aprobado en polling:', error)
          }
        }
      } else if (paymentStatus === 'REJECTED' || paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED') {
        // Pago cancelado: actualizar modal y limpiar polling
        if (paymentStatusPollingIntervalRef.current) {
          clearInterval(paymentStatusPollingIntervalRef.current)
          paymentStatusPollingIntervalRef.current = null
        }
        
        setPaymentStatus('cancelled')
        localStorage.removeItem('pendingPayment')
      }
      // Si sigue pendiente, el polling continuará
    } catch (error) {
      console.error('Error en polling de estado de pago:', error)
    }
  }

  // Función para crear el pedido desde los datos pendientes guardados
  const createOrderFromPendingPayment = async (orderData: any, requestId: string, paymentStatus?: string) => {
    try {
      console.log('🔄 Creando pedido desde datos pendientes...', { requestId, paymentStatus })

      // Determinar el estado inicial del pedido basado en el estado del pago
      // Si el pago está aprobado, crear el pedido directamente como aprobado
      const isApproved = paymentStatus === 'APPROVED' || paymentStatus === 'APPROVED_PARTIAL'
      const initialEstado = isApproved ? 'aprobado' : 'pendiente'
      
      console.log(`📦 Creando pedido con estado inicial: ${initialEstado}`, { 
        paymentStatus, 
        isApproved 
      })

      // Verificar si ya existe un pedido con los mismos datos (usuario, total, dirección)
      // para evitar duplicados en caso de que el proceso se ejecute múltiples veces
      // Usar una ventana de tiempo más amplia (10 minutos) para capturar posibles duplicados
      const { data: existingOrders, error: checkError } = await supabase
        .from('pedidos')
        .select('id, fecha')
        .eq('usuario_id', orderData.userId)
        .eq('total', orderData.totalAmount)
        .eq('Direccion', orderData.address)
        .gte('fecha', new Date(Date.now() - 600000).toISOString()) // Últimos 10 minutos
        .order('fecha', { ascending: false })
        .limit(1)

      if (checkError) {
        console.error('Error verificando pedidos existentes:', checkError)
        // Continuar con la creación del pedido si falla la verificación
      } else if (existingOrders && existingOrders.length > 0) {
        const existingOrder = existingOrders[0]
        const orderAge = Date.now() - new Date(existingOrder.fecha).getTime()
        console.log('⚠️ Pedido ya existe, evitando duplicado:', {
          orderId: existingOrder.id,
          orderAge: `${Math.round(orderAge / 1000)} segundos`,
          requestId
        })
        return { id: existingOrder.id, alreadyExists: true }
      }

      // Crear el pedido en la tabla pedidos
      const { data: orderResult, error: orderError } = await supabase
        .from('pedidos')
        .insert([
          {
            usuario_id: orderData.userId,
            fecha: new Date().toISOString(),
            total: orderData.totalAmount,
            estado: initialEstado, // Si el pago está aprobado, crear directamente como aprobado
            Direccion: orderData.address,
          }
        ])
        .select()
        .single()

      if (orderError) {
        console.error('Error creando pedido:', orderError)
        throw orderError
      }

      console.log('✅ Pedido creado exitosamente:', orderResult.id)

      // Verificar si el detalle del pedido ya existe antes de crearlo
      const { data: existingDetails, error: detailCheckError } = await supabase
        .from('detalle_pedido')
        .select('id')
        .eq('pedido_id', orderResult.id)
        .limit(1)

      if (detailCheckError) {
        console.error('Error verificando detalle existente:', detailCheckError)
      }

      // Crear los items del detalle del pedido solo si es un pedido nuevo Y no tiene detalles
      if (!orderResult.alreadyExists && (!existingDetails || existingDetails.length === 0)) {
        const { error: detailError } = await supabase
          .from('detalle_pedido')
          .insert(
            orderData.orderItems.map((item: any) => ({
              pedido_id: orderResult.id,
              producto_id: item.producto_id,
              cantidad: item.cantidad,
              subtotal: item.subtotal,
              tamano_index: item.tamano_index
            }))
          )

        if (detailError) {
          console.error('Error creando detalle del pedido:', detailError)
          throw detailError
        }
        console.log('✅ Detalle del pedido creado exitosamente')
      } else {
        if (orderResult.alreadyExists) {
          console.log('📋 Saltando creación de detalle porque el pedido ya existía')
        } else if (existingDetails && existingDetails.length > 0) {
          console.log('📋 Saltando creación de detalle porque ya existe detalle para este pedido')
        }
      }

      // Guardar el registro en pagos_pendientes para que el webhook y la sonda puedan encontrarlo
      try {
        // Si el pago está aprobado, guardar el estado como APPROVED en lugar de PENDING
        const pagoEstado = isApproved ? 'APPROVED' : 'PENDING'
        
        const { error: pagoPendienteError } = await supabase
          .from('pagos_pendientes')
          .insert({
            request_id: requestId,
            pedido_id: orderResult.id,
            referencia: String(orderResult.id),
            monto: orderData.totalAmount,
            estado: pagoEstado,
            ultima_verificacion: isApproved ? new Date().toISOString() : null,
          })

        if (pagoPendienteError) {
          console.error('⚠️ Error guardando en pagos_pendientes:', pagoPendienteError)
          // No lanzar error aquí, solo registrar - el pedido ya fue creado
        } else {
          console.log(`✅ Registro guardado en pagos_pendientes con estado ${pagoEstado}:`, { requestId, pedido_id: orderResult.id })
        }
      } catch (pagoError) {
        console.error('⚠️ Error al guardar en pagos_pendientes:', pagoError)
        // No lanzar error aquí, solo registrar - el pedido ya fue creado
      }

      // Enviar correo de confirmación solo si es un pedido nuevo
      if (!orderResult.alreadyExists) {
        try {
          const emailResponse = await fetch('/api/send-order-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userEmail: orderData.userEmail,
              userName: orderData.userName,
              orderId: orderResult.id,
              orderDate: orderResult.fecha,
              totalAmount: orderData.totalAmount,
              address: orderData.address,
              items: orderData.items,
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
      } else {
        console.log('📧 Saltando envío de email porque el pedido ya existía')
      }

      return { id: orderResult.id, alreadyExists: orderResult.alreadyExists || false }
    } catch (error) {
      console.error('Error creando pedido desde datos pendientes:', error)
      throw error
    }
  }

  // Función para verificar si hay un pago pendiente
  const checkPendingPayment = async () => {
    if (!user) return null

    try {
      // Obtener información del usuario desde la tabla usuarios
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('correo', user.email)
        .single()

      if (userError || !userData) {
        return null
      }

      // Buscar pedidos pendientes del usuario en los últimos 30 minutos
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
      
      const { data: pendingOrders, error: ordersError } = await supabase
        .from('pedidos')
        .select('id, fecha, total, estado')
        .eq('usuario_id', userData.id)
        .eq('estado', 'pendiente')
        .gte('fecha', thirtyMinutesAgo)
        .order('fecha', { ascending: false })
        .limit(1)

      if (ordersError || !pendingOrders || pendingOrders.length === 0) {
        return null
      }

      return pendingOrders[0]
    } catch (error) {
      console.error('Error verificando pago pendiente:', error)
      return null
    }
  }

  // Función para manejar el pago
  const handlePayment = async () => {
    debugCartState('INICIO_HANDLE_PAYMENT')

    if (!user) {
      // Si no está autenticado, mostrar modal de autenticación
      console.log('🔐 Usuario no autenticado - mostrando modal de login')
      setIsAuthModalOpen(true)
    } else {
      // Verificar si hay un pago pendiente antes de permitir crear uno nuevo
      const pendingOrder = await checkPendingPayment()
      
      if (pendingOrder) {
        const orderAge = Math.round((Date.now() - new Date(pendingOrder.fecha).getTime()) / 1000 / 60)
        const message = `⚠️ Tienes un pedido pendiente de pago.\n\n` +
          `📦 Pedido #${pendingOrder.id}\n` +
          `💰 Total: $${pendingOrder.total.toLocaleString('es-CO')}\n` +
          `⏰ Creado hace ${orderAge} minuto(s)\n\n` +
          `Por favor, completa el pago de este pedido antes de crear uno nuevo para evitar pagos duplicados.\n\n` +
          `Si ya realizaste el pago, espera unos momentos y verifica tu historial de compras.`
        
        alert(message)
        return
      }

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
          tamano_index: item.selectedSizeIndex || 0,
          tienda_id: item.selectedStoreId ?? item.stocks?.[item.selectedSizeIndex ?? 0]?.tienda ?? item.Tienda ?? 0
        }))

        // Calcular envío y total del pedido (según reglas)
        const cartSubtotal = getTotalPrice()
        const currentShipping = pickupInStore ? 0 : (deliveryZone === 'bucaramanga_am'
          ? (cartSubtotal < 100000 ? 4000 : 0)
          : (deliveryZone === 'piedecuesta' ? (cartSubtotal < 150000 ? 8000 : 0) : 0))
        const totalAmount = cartSubtotal + currentShipping

        // Preparar datos del pedido y estado completo del carrito para guardar en localStorage
        const orderData = {
          userId: userData.id,
          userEmail: user.email,
          userName: (userData as any).nombre || '',
          totalAmount,
          address: pickupInStore ? 'Recoger en tienda' : `${deliveryAddress} | Zona: ${deliveryZone === 'bucaramanga_am' ? 'Bucaramanga / Área Metropolitana' : 'Piedecuesta'}`,
          orderItems,
          items: items.map(item => ({
            id: item.id,
            nombre: item.nombre,
            descripcion: item.descripcion,
            imagen_url: item.imagen_url,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            selectedSizeIndex: item.selectedSizeIndex,
            selectedStoreId: item.selectedStoreId,
            tamano: item.tamano
          }))
        }

        // Guardar también el estado completo del carrito para restauración
        const cartState = {
          items,
          pickupInStore,
          deliveryAddress,
          deliveryZone,
          shippingFee,
          userId: userData.id,
          timestamp: Date.now()
        }

        // Crear sesión de pago con AvalPayCenter / PlacetoPay
        try {
          // Generar un ID temporal para la referencia del pago
          const tempOrderId = `TEMP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          
          const sessionResponse = await fetch('/api/payment-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderId: tempOrderId,
              totalAmount,
              buyerEmail: user.email,
              buyerName: (userData as any).nombre || '',
              // En un entorno real deberías obtener la IP real desde el backend/proxy
              ipAddress: '127.0.0.1',
              userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Unisantander WC',
            }),
          })

          if (!sessionResponse.ok) {
            console.error('Error al crear sesión de pago:', await sessionResponse.json())
            alert('Error al iniciar la sesión de pago. Por favor, inténtalo nuevamente.')
            setIsProcessingPayment(false)
            return
          }

          const sessionData = await sessionResponse.json()

          if (!sessionData.processUrl || !sessionData.requestId) {
            console.error('Respuesta de sesión de pago sin processUrl o requestId:', sessionData)
            alert('No se recibió la URL de procesamiento de pago. Intenta de nuevo más tarde.')
            setIsProcessingPayment(false)
            return
          }

          // Guardar los datos del pedido, estado del carrito y requestId en localStorage para verificar después
          // Incluir timestamp para poder limpiar datos antiguos
          localStorage.setItem('pendingPayment', JSON.stringify({
            requestId: sessionData.requestId,
            orderData,
            cartState,
            timestamp: Date.now()
          }))

          // Redirigir al usuario a la pasarela de pago
          console.log('🔗 Redirigiendo a pasarela de pago:', sessionData.processUrl)
          debugCartState('ANTES_REDIRECCION_PASARELA')

          window.location.href = sessionData.processUrl
          return
        } catch (paymentSessionError) {
          console.error('Error inesperado al crear la sesión de pago:', paymentSessionError)
          alert('Ocurrió un error al conectar con la pasarela de pago. Inténtalo nuevamente.')
          setIsProcessingPayment(false)
          return
        }

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

    // Validar que el nombre solo contenga caracteres alfabéticos y espacios
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(modalNombre.trim())) {
      alert("El nombre solo puede contener letras y espacios")
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
    <div className="w-[200px] xs:w-[220px] sm:w-[240px] md:w-[260px] lg:w-[280px] xl:w-[300px] space-y-2 xs:space-y-2.5 sm:space-y-3 md:space-y-3 lg:space-y-4 xl:space-y-5 bg-white p-2 xs:p-2.5 sm:p-3 md:p-3.5 lg:p-4 xl:p-5 rounded-lg max-h-[80vh] overflow-y-auto border border-gray-200/60 shadow-sm">
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
      <div className="min-h-screen" style={{ backgroundColor: '#ffffff' }}>
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
                <div className="space-y-4 sm:space-y-6">
                  {/* Lista de productos */}
                  <div className="relative bg-gradient-to-br from-white via-[#fafbf5] to-white rounded-2xl shadow-[0_4px_20px_rgba(25,100,40,0.08)] border border-[#196428]/10 p-4 sm:p-5 md:p-7 overflow-hidden">
                    {/* Decorative background pattern */}
                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
                      backgroundImage: `radial-gradient(circle at 2px 2px, #196428 1px, transparent 0)`,
                      backgroundSize: '24px 24px'
                    }}></div>
                    
                    <div className="relative space-y-4 sm:space-y-5">
                      {items.map((item, index) => {
                        const storeId = item.selectedStoreId ?? item.stocks?.[item.selectedSizeIndex ?? 0]?.tienda ?? item.Tienda ?? 0
                        const tienda = tiendas.find((t) => t.id === storeId)
                        const itemKey = `${item.id}-${item.selectedSizeIndex ?? 0}-${storeId}`
                        return (
                        <div 
                          key={itemKey} 
                          className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 p-4 sm:p-5 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-200/60 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(25,100,40,0.12)] hover:border-[#196428]/20 transition-all duration-300 ease-out"
                        >
                          {/* Imagen del producto */}
                          <div className="relative w-full sm:w-24 h-24 sm:h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden flex-shrink-0 mx-auto sm:mx-0 ring-2 ring-gray-100 group-hover:ring-[#196428]/20 transition-all duration-300">
                            <Image
                              src={item.imagen_url || '/placeholder.jpg'}
                              alt={item.nombre}
                              width={96}
                              height={96}
                              className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>

                          {/* Información del producto */}
                          <div className="flex-1 w-full sm:w-auto min-w-0">
                            <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-1.5 leading-tight tracking-tight">{item.nombre}</h3>
                            <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">{item.descripcion || 'Descripción del producto'}</p>

                            {/* Mostrar tamaños del producto con selección */}
                            <div className="mb-3">
                              <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Tamaño seleccionado:</p>
                              <ProductSizeBadges
                                tamaños={item.tamano}
                                size="sm"
                                selectedIndex={item.selectedSizeIndex}
                                onSizeSelect={(newSizeIndex) => updateProductSize(item.id!, newSizeIndex, item.selectedStoreId)}
                                interactive={true}
                                className="mb-2"
                              />
                              {tienda && (
                                <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                                  {tienda.name} — {tienda.city}
                                </p>
                              )}
                            </div>

                            {/* Indicadores */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              {item.descuento && (
                                <span className="inline-flex items-center gap-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-sm">
                                  <Tag className="h-3 w-3" />
                                  Oferta
                                </span>
                              )}
                              {item.destacado && (
                                <span className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-sm">
                                  <Sparkles className="h-3 w-3" />
                                  Destacado
                                </span>
                              )}
                              {item.novedad && (
                                <span className="inline-flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-sm">
                                  <Sparkles className="h-3 w-3" />
                                  Nuevo
                                </span>
                              )}
                            </div>

                            {/* Precio */}
                            <div className="flex items-baseline gap-2.5 mb-3 sm:mb-0">
                              {item.discountApplied > 0 ? (
                                <>
                                  <span className="text-gray-400 font-medium line-through text-sm sm:text-base">
                                    $ {formatPrice(item.unitPrice / (1 - item.discountApplied / 100))}
                                  </span>
                                  <span className="text-[#196428] font-black text-lg sm:text-xl tracking-tight">
                                    $ {formatPrice(item.unitPrice)}
                                  </span>
                                </>
                              ) : (
                                <span className="text-[#196428] font-black text-lg sm:text-xl tracking-tight">
                                  $ {formatPrice(item.unitPrice)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Controles de cantidad */}
                          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start border-t sm:border-t-0 border-gray-200/60 pt-4 sm:pt-0">
                            <div className="flex items-center gap-2.5 bg-gray-50 rounded-xl p-1.5">
                              <button
                                onClick={() => updateQuantity(item.id!, (item.quantity || 1) - 1, item.selectedSizeIndex, item.selectedStoreId)}
                                className="w-9 h-9 sm:w-10 sm:h-10 bg-white hover:bg-[#196428] hover:text-white active:bg-[#145020] text-gray-700 rounded-lg flex items-center justify-center transition-all duration-200 touch-manipulation shadow-sm hover:shadow-md"
                                aria-label="Disminuir cantidad"
                              >
                                <Minus className="h-4 w-4" />
                              </button>

                              <span className="w-14 text-center font-bold text-base sm:text-lg text-gray-900">
                                {item.quantity}
                              </span>

                              <button
                                onClick={() => updateQuantity(item.id!, (item.quantity || 1) + 1, item.selectedSizeIndex, item.selectedStoreId)}
                                className="w-9 h-9 sm:w-10 sm:h-10 bg-white hover:bg-[#196428] hover:text-white active:bg-[#145020] text-gray-700 rounded-lg flex items-center justify-center transition-all duration-200 touch-manipulation shadow-sm hover:shadow-md"
                                aria-label="Aumentar cantidad"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.id!, item.selectedSizeIndex, item.selectedStoreId)}
                              className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-red-50 to-red-100 hover:from-red-500 hover:to-red-600 active:from-red-600 active:to-red-700 text-red-600 hover:text-white rounded-lg flex items-center justify-center transition-all duration-200 touch-manipulation shadow-sm hover:shadow-md"
                              aria-label="Eliminar producto"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )})}
                    </div>
                  </div>

                  {/* Resumen del pedido */}
                  <div className="relative bg-gradient-to-br from-white via-[#fafbf5] to-white rounded-2xl shadow-[0_4px_20px_rgba(25,100,40,0.08)] border border-[#196428]/10 p-5 sm:p-6 md:p-8 overflow-hidden">
                    {/* Decorative accent */}
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#196428] via-[#2d7a3d] to-[#196428]"></div>
                    
                    {/* Subtle background pattern */}
                    <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{
                      backgroundImage: `linear-gradient(45deg, #196428 1px, transparent 1px), linear-gradient(-45deg, #196428 1px, transparent 1px)`,
                      backgroundSize: '20px 20px',
                      backgroundPosition: '0 0, 10px 10px'
                    }}></div>
                    
                    <div className="relative">
                      <div className="flex items-center gap-3 mb-5 sm:mb-6">
                        <div className="w-1 h-8 bg-gradient-to-b from-[#196428] to-[#2d7a3d] rounded-full"></div>
                        <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">Resumen del Pedido</h2>
                      </div>

                      {/* Opción de recoger en tienda, zona y dirección */}
                    <div className="space-y-4 mb-6 sm:mb-8">
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#196428]/5 to-transparent rounded-xl border border-[#196428]/10 hover:border-[#196428]/20 transition-all duration-200">
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
                          className="h-5 w-5 sm:h-5 sm:w-5 text-[#196428] border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-[#196428] focus:ring-offset-2 cursor-pointer touch-manipulation transition-all"
                        />
                        <label htmlFor="pickupInStore" className="text-sm sm:text-base font-bold text-gray-800 cursor-pointer flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-[#196428]" />
                          Recoger en tienda
                        </label>
                      </div>

                      {!pickupInStore && (
                        <div className="space-y-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/60">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Ciudad/Zona de entrega</label>
                            <select
                              value={deliveryZone}
                              onChange={(e) => setDeliveryZone(e.target.value as any)}
                              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#196428] focus:border-[#196428] bg-white text-sm font-medium touch-manipulation transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              <option value="">Selecciona una opción</option>
                              <option value="bucaramanga_am">Bucaramanga / Área Metropolitana</option>
                              <option value="piedecuesta">Piedecuesta</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Dirección de entrega y detalles</label>
                            <textarea
                              value={deliveryAddress}
                              onChange={(e) => setDeliveryAddress(e.target.value)}
                              rows={3}
                              placeholder="Ej: Calle 10 # 20-30, Apto 401, Barrio XXX, Referencia: Portería azul"
                              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#196428] focus:border-[#196428] bg-white text-sm resize-none transition-all duration-200 shadow-sm hover:shadow-md font-medium"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 p-5 bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/60">
                      <div className="flex justify-between items-center py-2 border-b border-gray-200/60">
                        <span className="text-sm sm:text-base text-gray-700 font-medium">Subtotal ({getTotalItems()} productos)</span>
                        <span className="text-sm sm:text-base font-bold text-gray-900">$ {formatPrice(getTotalPrice())}</span>
                      </div>

                      {(!pickupInStore && deliveryZone) && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-200/60">
                          <span className="text-sm sm:text-base text-gray-700 font-medium flex items-center gap-2">
                            <Briefcase className="h-4 w-4 text-gray-500" />
                            Envío
                          </span>
                          <span className={`text-sm sm:text-base font-bold ${shippingFee > 0 ? 'text-gray-900' : 'text-emerald-600'}`}>
                            {shippingFee > 0 ? `$ ${formatPrice(shippingFee)}` : (
                              <span className="inline-flex items-center gap-1">
                                <Check className="h-4 w-4" />
                                Gratis
                              </span>
                            )}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center py-2">
                        <span className="text-sm sm:text-base text-gray-700 font-medium flex items-center gap-2">
                          <Info className="h-4 w-4 text-gray-500" />
                          Impuestos
                        </span>
                        <span className="text-sm sm:text-base font-bold text-emerald-600 inline-flex items-center gap-1">
                          <Check className="h-4 w-4" />
                          Incluidos
                        </span>
                      </div>

                      <div className="border-t-2 border-[#196428]/20 pt-4 mt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">Total</span>
                          <span className="text-2xl sm:text-3xl font-black text-[#196428] tracking-tight">$ {formatPrice(getTotalPrice() + shippingFee)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                      <button
                        onClick={handlePayment}
                        disabled={isProcessingPayment || paymentStatusModalOpen || isProcessingPaymentRef.current}
                        className="group relative w-full bg-gradient-to-r from-[#196428] to-[#2d7a3d] hover:from-[#145020] hover:to-[#196428] active:from-[#0f3a15] active:to-[#145020] disabled:from-gray-400 disabled:to-gray-500 text-white py-4 sm:py-4 px-6 rounded-xl font-bold text-sm sm:text-base transition-all duration-300 disabled:cursor-not-allowed touch-manipulation shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 overflow-hidden"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {(isProcessingPayment || paymentStatusModalOpen || isProcessingPaymentRef.current) ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              {paymentStatusModalOpen ? 'Verificando pago...' : 'Procesando...'}
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="h-5 w-5" />
                              {user ? 'Confirmar Pedido' : 'Proceder al Pago'}
                            </>
                          )}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      </button>

                      <button
                        onClick={clearCart}
                        className="w-full bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 active:from-gray-200 active:to-gray-300 text-gray-700 py-3.5 sm:py-4 px-6 rounded-xl font-bold transition-all duration-200 text-sm sm:text-base touch-manipulation shadow-sm hover:shadow-md border border-gray-200/60 hover:border-gray-300"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <Trash2 className="h-4 w-4" />
                          Vaciar Carrito
                        </span>
                      </button>

                      <Link
                        href="/tienda"
                        className="block text-center text-[#196428] hover:text-[#145020] font-bold transition-all duration-200 text-sm sm:text-base py-3 hover:underline decoration-2 underline-offset-4"
                      >
                        <span className="flex items-center justify-center gap-2">
                          Continuar Comprando
                          <Plus className="h-4 w-4 rotate-45" />
                        </span>
                      </Link>
                    </div>
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
                            onChange={(e) => {
                              const value = e.target.value;
                              // Solo permitir letras, espacios y caracteres especiales comunes en nombres (ñ, acentos)
                              const filteredValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
                              setModalNombre(filteredValue);
                            }}
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

      {/* Modal de Estado de Pago */}
      <PaymentStatusModal
        isOpen={paymentStatusModalOpen}
        onClose={() => {
          setPaymentStatusModalOpen(false)
          // Limpiar polling si está activo
          if (paymentStatusPollingIntervalRef.current) {
            clearInterval(paymentStatusPollingIntervalRef.current)
            paymentStatusPollingIntervalRef.current = null
          }
          // Si el pago fue aprobado o cancelado, limpiar estado
          if (paymentStatus === 'approved' || paymentStatus === 'cancelled') {
            setPaymentStatus(null)
            setCurrentOrderId(undefined)
            setCurrentTotalAmount(undefined)
            setCurrentRequestId(undefined)
          }
        }}
        status={paymentStatus}
        orderId={currentOrderId}
        totalAmount={currentTotalAmount}
        requestId={currentRequestId}
        onCheckStatus={checkPaymentStatusForPolling}
      />

    </MainLayout>
  )
}
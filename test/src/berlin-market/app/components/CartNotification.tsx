"use client"

import { useEffect, useState } from 'react'
import Image from "next/image"
import { ShoppingCart, Check, AlertTriangle, X } from 'lucide-react'
import { Producto } from '@/lib/supabase'
import { NotificationType, NOTIFICATION_TYPES } from '@/app/contexts/CartNotificationContext'

// Hook personalizado para detectar si es móvil
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)

    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  return isMobile
}

interface CartNotificationProps {
  product: Producto
  quantity: number
  onClose: () => void
  isVisible: boolean
  index?: number // Para manejar múltiples notificaciones
  type?: NotificationType
  message?: string
}

export default function CartNotification({ product, quantity, onClose, isVisible, index = 0, type = NOTIFICATION_TYPES.SUCCESS, message }: CartNotificationProps) {
  const [isAnimating, setIsAnimating] = useState(isVisible)
  const [shouldRender, setShouldRender] = useState(isVisible)
  const isMobile = useIsMobile()

  // Configuración de estilos según el tipo de notificación
  const getNotificationConfig = () => {
    switch (type) {
      case NOTIFICATION_TYPES.ERROR:
        return {
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          icon: <X className="w-3 h-3 sm:w-4 sm:h-4" />,
          textColor: 'text-red-700',
          message: message || 'No hay suficiente stock disponible'
        }
      case NOTIFICATION_TYPES.WARNING:
        return {
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          icon: <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4" />,
          textColor: 'text-yellow-700',
          message: message || 'Stock limitado disponible'
        }
      default: // NOTIFICATION_TYPES.SUCCESS
        return {
          bgColor: 'bg-white',
          borderColor: 'border-gray-200',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          icon: <Check className="w-3 h-3 sm:w-4 sm:h-4" />,
          textColor: 'text-green-700',
          message: message || 'Agregado al carrito'
        }
    }
  }

  const config = getNotificationConfig()

  useEffect(() => {
    if (isVisible && !shouldRender) {
      // Nueva notificación: comenzar animación de entrada
      setShouldRender(true)
      setIsAnimating(true)
    } else if (!isVisible && shouldRender) {
      // Notificación siendo removida: comenzar animación de salida
      setIsAnimating(false)
      // Esperar a que termine la animación antes de dejar de renderizar
      const timer = setTimeout(() => {
        setShouldRender(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isVisible, shouldRender])

  // Estado para rastrear si el componente fue cerrado manualmente
  const [manuallyClosed, setManuallyClosed] = useState(false)

  useEffect(() => {
    if (shouldRender && isVisible && isAnimating && !manuallyClosed) {
      // Auto-close después de 3 segundos (solo cuando está completamente visible y animando)
      const timer = setTimeout(() => {
        onClose()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [shouldRender, isVisible, isAnimating, onClose, manuallyClosed])

  // Efecto adicional para manejar el caso inicial cuando el componente se monta
  useEffect(() => {
    if (isVisible && shouldRender && !isAnimating) {
      // Si se monta con isVisible=true pero no está animando, comenzar la animación
      setIsAnimating(true)
    }
  }, [isVisible, shouldRender, isAnimating])

  if (!shouldRender) return null

  return (
    <div
      className={`fixed bottom-4 right-4 transform transition-all duration-300 ease-in-out ${
        isAnimating && isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-full opacity-0 scale-95'
      } sm:bottom-4 sm:right-4`}
      style={{
        // Posicionamiento dinámico para múltiples notificaciones
        bottom: `${1 + index * 4}rem`,
        right: `${1 + index * 1}rem`,
        zIndex: 50 - index,
        // Responsive para móviles usando el hook personalizado
        ...(isMobile && {
          bottom: `${1 + index * 3.5}rem`,
          right: `${0.5 + index * 0.5}rem`,
          left: `${0.5 + index * 0.5}rem`,
          maxWidth: 'calc(100vw - 1rem)'
        })
      }}
    >
      <div className={`${config.bgColor} border ${config.borderColor} rounded-lg shadow-lg p-3 sm:p-4 max-w-sm w-full mx-4 sm:mx-0 backdrop-blur-sm`}>
        <div className="flex items-start space-x-3">
          {/* Product Image */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg overflow-hidden relative">
              {product.imagen_url ? (
                <Image
                  src={product.imagen_url}
                  alt={product.nombre}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                </div>
              )}
              {/* Quantity badge */}
              {quantity > 1 && (
                <div className="absolute -top-1 -right-1 bg-green-600 text-white quantity-badge rounded-full text-xs">
                  {quantity}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                  {product.nombre}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Cantidad: {quantity}
                </p>
              </div>

              {/* Close button */}
              <button
                onClick={() => {
                  setManuallyClosed(true)
                  setIsAnimating(false)
                  setTimeout(onClose, 150) // Cierre inmediato con animación corta
                }}
                className="flex-shrink-0 ml-2 p-1 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Status indicator */}
            <div className="flex items-center mt-2">
              <div className={`flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 ${config.iconBg} rounded-full mr-2 animate-pulse`}>
                <span className={config.iconColor}>
                  {config.icon}
                </span>
              </div>
              <span className={`text-xs sm:text-sm font-medium ${config.textColor}`}>
                {config.message}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

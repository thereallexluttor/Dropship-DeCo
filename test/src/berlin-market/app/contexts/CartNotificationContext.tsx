"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'
import { Producto } from '@/lib/supabase'
import CartNotification from '@/app/components/CartNotification'

interface NotificationItem {
  id: string
  product: Producto
  quantity: number
  timestamp: number
}

interface CartNotificationContextType {
  showNotification: (product: Producto, quantity: number) => void
}

const CartNotificationContext = createContext<CartNotificationContextType | undefined>(undefined)

export const useCartNotification = () => {
  const context = useContext(CartNotificationContext)
  if (context === undefined) {
    throw new Error('useCartNotification must be used within a CartNotificationProvider')
  }
  return context
}

export const CartNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const lastNotificationRef = React.useRef<{productId: number, timestamp: number} | null>(null)

  const showNotification = useCallback((product: Producto, quantity: number) => {
    const now = Date.now()

    // Verificar que el producto tenga un id válido
    if (!product.id) {
      console.warn('Cannot show notification: product.id is undefined')
      return
    }

    // Prevenir duplicados: si es el mismo producto dentro de 100ms, ignorar
    if (lastNotificationRef.current &&
        lastNotificationRef.current.productId === product.id &&
        now - lastNotificationRef.current.timestamp < 100) {
      return
    }

    // Actualizar referencia
    lastNotificationRef.current = { productId: product.id, timestamp: now }
    
    // Crear nueva notificación independiente
    const id = `notification-${now}-${Math.random()}`
    const newNotification: NotificationItem = {
      id,
      product,
      quantity, // Solo la cantidad agregada, no acumulada
      timestamp: now
    }

    setNotifications(prev => {
      // Agregar nueva notificación sin combinar con existentes
      return [...prev, newNotification].slice(-3) // Mantener máximo 3
    })
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  return (
    <CartNotificationContext.Provider value={{ showNotification }}>
      {children}
      {notifications.map((notification, index) => (
        <CartNotification
          key={notification.id}
          product={notification.product}
          quantity={notification.quantity}
          isVisible={true} // Siempre visible mientras esté en el array
          index={index}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </CartNotificationContext.Provider>
  )
}

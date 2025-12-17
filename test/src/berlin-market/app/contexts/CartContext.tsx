"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Producto, TamanoProducto } from '@/lib/supabase'
import { useCartNotification, NotificationType, NOTIFICATION_TYPES } from './CartNotificationContext'

export interface CartItemWithSize extends Producto {
  quantity: number
  selectedSizeIndex: number  // Índice del tamaño seleccionado (0-based)
  unitPrice: number          // Precio unitario para el tamaño seleccionado
  discountApplied: number    // Descuento aplicado en porcentaje (0 si no hay descuento)
}

interface CartContextType {
  items: CartItemWithSize[]
  addToCart: (product: Producto, quantity?: number, selectedSizeIndex?: number) => void
  removeFromCart: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  updateProductSize: (productId: number, newSizeIndex: number) => void
  clearCart: () => void
  restoreCart: (cartItems: CartItemWithSize[]) => void
  getTotalItems: () => number
  getTotalPrice: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    // En lugar de lanzar un error, devolver valores por defecto
    return {
      items: [],
      addToCart: () => {},
      removeFromCart: () => {},
      updateQuantity: () => {},
      updateProductSize: () => {},
      clearCart: () => {},
      restoreCart: () => {},
      getTotalItems: () => 0,
      getTotalPrice: () => 0,
    }
  }
  return context
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItemWithSize[]>([])
  const { showNotification } = useCartNotification()

  // Cargar carrito desde localStorage al montar el componente
  useEffect(() => {
    const savedCart = localStorage.getItem('cart')
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        // Verificar que los items tengan la estructura correcta
        if (Array.isArray(parsedCart)) {
          // Migrar items antiguos que no tienen selectedSizeIndex
          const migratedCart = parsedCart.map((item: any) => {
            if (!item.selectedSizeIndex && item.selectedSizeIndex !== 0) {
              return {
                ...item,
                selectedSizeIndex: 0,
                unitPrice: calculateUnitPrice(item, 0),
                discountApplied: item.descuento && item.descuento_valor
                  ? (typeof item.descuento_valor === 'string'
                      ? parseFloat(item.descuento_valor)
                      : Number(item.descuento_valor))
                  : 0
              }
            }
            return item
          })
          setItems(migratedCart)
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      }
    }
  }, [])

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  // Función helper para verificar el stock disponible
  const checkStockAvailability = (product: Producto, quantity: number, selectedSizeIndex: number = 0): { available: boolean, availableStock: number } => {
    // Verificar si el producto tiene stock disponible
    if (product.stocks && product.stocks.length > 0) {
      const stock = product.stocks[selectedSizeIndex] || product.stocks[0]
      if (stock && stock.stock !== undefined) {
        // Buscar si ya existe el producto en el carrito con el mismo tamaño
        const existingItem = items.find(item =>
          item.id === product.id && item.selectedSizeIndex === selectedSizeIndex
        )
        const currentQuantity = existingItem ? existingItem.quantity : 0
        const availableStock = stock.stock - currentQuantity

        return {
          available: availableStock >= quantity,
          availableStock
        }
      }
    }

    // Si no hay información de stock, permitir agregar (comportamiento por defecto)
    return { available: true, availableStock: Infinity }
  }

  // Función helper para calcular el precio unitario correcto
  const calculateUnitPrice = (product: Producto, selectedSizeIndex: number = 0): number => {
    // Si el producto tiene precios definidos
    if (product.precios && product.precios.length > 0) {
      const basePrice = product.precios[selectedSizeIndex] || product.precios[0] || 0

      // Aplicar descuento si existe
      if (product.descuento && product.descuento_valor) {
        const discountValue = typeof product.descuento_valor === 'string'
          ? parseFloat(product.descuento_valor)
          : Number(product.descuento_valor)
        return basePrice * (1 - (discountValue / 100))
      }

      return basePrice
    }

    // Si el producto tiene stocks con precios
    if (product.stocks && product.stocks.length > 0) {
      const stock = product.stocks[selectedSizeIndex] || product.stocks[0]
      if (stock) {
        // Aplicar descuento si existe
        if (product.descuento && product.descuento_valor) {
          const discountValue = typeof product.descuento_valor === 'string'
            ? parseFloat(product.descuento_valor)
            : Number(product.descuento_valor)
          return stock.precio * (1 - (discountValue / 100))
        }

        return stock.precio
      }
    }

    return 0
  }

  const addToCart = (product: Producto, quantity: number = 1, selectedSizeIndex: number = 0) => {
    // Verificar stock disponible ANTES de agregar al carrito
    const stockCheck = checkStockAvailability(product, quantity, selectedSizeIndex)

    if (!stockCheck.available) {
      // Mostrar notificación de error si no hay stock suficiente
      showNotification(
        product,
        quantity,
        NOTIFICATION_TYPES.ERROR,
        `No hay suficiente stock. Disponible: ${stockCheck.availableStock}`
      )
      return // No agregar al carrito
    }

    // Mostrar notificación de éxito y agregar al carrito
    showNotification(product, quantity, NOTIFICATION_TYPES.SUCCESS, 'Agregado al carrito')

    setItems(prevItems => {
      // Buscar si ya existe el mismo producto con el mismo tamaño
      const existingItem = prevItems.find(item =>
        item.id === product.id && item.selectedSizeIndex === selectedSizeIndex
      )

      const unitPrice = calculateUnitPrice(product, selectedSizeIndex)
      const discountApplied = product.descuento && product.descuento_valor
        ? (typeof product.descuento_valor === 'string'
            ? parseFloat(product.descuento_valor)
            : Number(product.descuento_valor))
        : 0

      if (existingItem) {
        // Si el producto ya existe con el mismo tamaño, aumentar la cantidad
        const newQuantity = existingItem.quantity + quantity
        return prevItems.map(item =>
          item.id === product.id && item.selectedSizeIndex === selectedSizeIndex
            ? { ...item, quantity: newQuantity }
            : item
        )
      } else {
        // Si es un nuevo producto o diferente tamaño, agregarlo
        const newItem: CartItemWithSize = {
          ...product,
          quantity,
          selectedSizeIndex,
          unitPrice,
          discountApplied
        }
        return [...prevItems, newItem]
      }
    })
  }

  const removeFromCart = (productId: number) => {
    setItems(prevItems => prevItems.filter(item => item.id !== productId))
  }

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setItems(prevItems => {
      const itemToUpdate = prevItems.find(item => item.id === productId)
      if (itemToUpdate) {
        // Verificar stock disponible antes de actualizar
        const stockCheck = checkStockAvailability(itemToUpdate, quantity - itemToUpdate.quantity, itemToUpdate.selectedSizeIndex)

        if (!stockCheck.available) {
          // Mostrar notificación de error si no hay stock suficiente
          showNotification(
            itemToUpdate,
            quantity - itemToUpdate.quantity,
            NOTIFICATION_TYPES.ERROR,
            `No hay suficiente stock. Disponible: ${stockCheck.availableStock}`
          )
          return prevItems // No actualizar la cantidad
        }
      }

      return prevItems.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      )
    })
  }

  const updateProductSize = (productId: number, newSizeIndex: number) => {
    setItems(prevItems =>
      prevItems.map(item => {
        if (item.id === productId) {
          const newUnitPrice = calculateUnitPrice(item, newSizeIndex)
          return {
            ...item,
            selectedSizeIndex: newSizeIndex,
            unitPrice: newUnitPrice
          }
        }
        return item
      })
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const restoreCart = (cartItems: CartItemWithSize[]) => {
    console.log('🔄 Restaurando carrito completo desde CartContext:', cartItems.length, 'items')
    setItems(cartItems)
  }

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return items.reduce((total, item) => {
      return total + (item.unitPrice * item.quantity)
    }, 0)
  }

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateProductSize,
    clearCart,
    restoreCart,
    getTotalItems,
    getTotalPrice,
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

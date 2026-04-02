"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Producto, TamanoProducto } from '@/lib/supabase'
import { SHOPPING_PAUSED, SHOPPING_PAUSE_MESSAGE } from '@/lib/shoppingPause'
import { useCartNotification, NotificationType, NOTIFICATION_TYPES } from './CartNotificationContext'

export interface CartItemWithSize extends Producto {
  quantity: number
  selectedSizeIndex: number  // Índice del tamaño seleccionado (0-based)
  selectedStoreId: number   // Tienda de la que proviene el inventario
  unitPrice: number         // Precio unitario para el tamaño seleccionado
  discountApplied: number   // Descuento aplicado en porcentaje (0 si no hay descuento)
}

interface CartContextType {
  items: CartItemWithSize[]
  addToCart: (product: Producto, quantity?: number, selectedSizeIndex?: number, selectedStoreId?: number) => void
  removeFromCart: (productId: number, selectedSizeIndex?: number, selectedStoreId?: number) => void
  updateQuantity: (productId: number, quantity: number, selectedSizeIndex?: number, selectedStoreId?: number) => void
  updateProductSize: (productId: number, newSizeIndex: number, selectedStoreId?: number) => void
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
          // Migrar items antiguos que no tienen selectedSizeIndex o selectedStoreId
          const migratedCart = parsedCart.map((item: any) => {
            let sizeIndex = item.selectedSizeIndex
            if (sizeIndex === undefined || sizeIndex === null) {
              sizeIndex = 0
            }
            const storeId = item.selectedStoreId ?? item.stocks?.[sizeIndex]?.tienda ?? item.Tienda ?? 0
            if (!item.selectedSizeIndex && item.selectedSizeIndex !== 0) {
              return {
                ...item,
                selectedSizeIndex: sizeIndex,
                selectedStoreId: storeId,
                unitPrice: calculateUnitPrice(item, sizeIndex),
                discountApplied: item.descuento && item.descuento_valor
                  ? (typeof item.descuento_valor === 'string'
                      ? parseFloat(item.descuento_valor)
                      : Number(item.descuento_valor))
                  : 0
              }
            }
            return { ...item, selectedStoreId: item.selectedStoreId ?? storeId }
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
        // Buscar si ya existe el producto en el carrito con el mismo tamaño y tienda
        const effectiveStoreId = product.stocks?.[selectedSizeIndex]?.tienda ?? product.Tienda ?? 0
        const existingItem = items.find(item =>
          item.id === product.id &&
          item.selectedSizeIndex === selectedSizeIndex &&
          (item.selectedStoreId ?? 0) === effectiveStoreId
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

  const addToCart = (product: Producto, quantity: number = 1, selectedSizeIndex: number = 0, selectedStoreId?: number) => {
    if (SHOPPING_PAUSED) {
      showNotification(product, quantity, NOTIFICATION_TYPES.ERROR, SHOPPING_PAUSE_MESSAGE)
      return
    }

    const effectiveStoreId = selectedStoreId ?? product.stocks?.[selectedSizeIndex]?.tienda ?? product.Tienda ?? 0

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
      // Buscar si ya existe el mismo producto con el mismo tamaño y tienda
      const existingItem = prevItems.find(item =>
        item.id === product.id &&
        item.selectedSizeIndex === selectedSizeIndex &&
        (item.selectedStoreId ?? 0) === effectiveStoreId
      )

      const unitPrice = calculateUnitPrice(product, selectedSizeIndex)
      const discountApplied = product.descuento && product.descuento_valor
        ? (typeof product.descuento_valor === 'string'
            ? parseFloat(product.descuento_valor)
            : Number(product.descuento_valor))
        : 0

      if (existingItem) {
        // Si el producto ya existe con el mismo tamaño y tienda, aumentar la cantidad
        const newQuantity = existingItem.quantity + quantity
        return prevItems.map(item =>
          item.id === product.id &&
          item.selectedSizeIndex === selectedSizeIndex &&
          (item.selectedStoreId ?? 0) === effectiveStoreId
            ? { ...item, quantity: newQuantity }
            : item
        )
      } else {
        // Si es un nuevo producto o diferente tamaño/tienda, agregarlo
        const newItem: CartItemWithSize = {
          ...product,
          quantity,
          selectedSizeIndex,
          selectedStoreId: effectiveStoreId,
          unitPrice,
          discountApplied
        }
        return [...prevItems, newItem]
      }
    })
  }

  const removeFromCart = (productId: number, selectedSizeIndex?: number, selectedStoreId?: number) => {
    setItems(prevItems => {
      if (selectedSizeIndex === undefined || selectedStoreId === undefined) {
        return prevItems.filter(item => item.id !== productId)
      }
      return prevItems.filter(item =>
        item.id !== productId ||
        (item.selectedSizeIndex ?? 0) !== selectedSizeIndex ||
        (item.selectedStoreId ?? 0) !== selectedStoreId
      )
    })
  }

  const updateQuantity = (productId: number, quantity: number, selectedSizeIndex?: number, selectedStoreId?: number) => {
    if (SHOPPING_PAUSED && quantity > 0) {
      const existing = items.find(item => {
        if (item.id !== productId) return false
        if (selectedSizeIndex !== undefined && selectedStoreId !== undefined) {
          return (item.selectedSizeIndex ?? 0) === selectedSizeIndex && (item.selectedStoreId ?? 0) === selectedStoreId
        }
        return true
      })
      if (existing && quantity > existing.quantity) {
        showNotification(existing, quantity - existing.quantity, NOTIFICATION_TYPES.ERROR, SHOPPING_PAUSE_MESSAGE)
        return
      }
    }

    if (quantity <= 0) {
      if (selectedSizeIndex !== undefined && selectedStoreId !== undefined) {
        removeFromCart(productId, selectedSizeIndex, selectedStoreId)
      } else {
        removeFromCart(productId)
      }
      return
    }

    setItems(prevItems => {
      const itemToUpdate = prevItems.find(item => {
        if (item.id !== productId) return false
        if (selectedSizeIndex !== undefined && selectedStoreId !== undefined) {
          return (item.selectedSizeIndex ?? 0) === selectedSizeIndex && (item.selectedStoreId ?? 0) === selectedStoreId
        }
        return true
      })
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

      const matchItem = (item: CartItemWithSize) => {
        if (item.id !== productId) return false
        if (selectedSizeIndex !== undefined && selectedStoreId !== undefined) {
          return (item.selectedSizeIndex ?? 0) === selectedSizeIndex && (item.selectedStoreId ?? 0) === selectedStoreId
        }
        return true
      }

      return prevItems.map(item =>
        matchItem(item) ? { ...item, quantity } : item
      )
    })
  }

  const updateProductSize = (productId: number, newSizeIndex: number, selectedStoreId?: number) => {
    setItems(prevItems =>
      prevItems.map(item => {
        if (item.id !== productId) return item
        if (selectedStoreId !== undefined && (item.selectedStoreId ?? 0) !== selectedStoreId) return item
        const newUnitPrice = calculateUnitPrice(item, newSizeIndex)
        const newStoreId = item.stocks?.[newSizeIndex]?.tienda ?? item.selectedStoreId ?? item.Tienda ?? 0
        return {
          ...item,
          selectedSizeIndex: newSizeIndex,
          selectedStoreId: newStoreId,
          unitPrice: newUnitPrice
        }
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

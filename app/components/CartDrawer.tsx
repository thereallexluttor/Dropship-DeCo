"use client"

import { Fragment, useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, ShoppingBag, Trash2, CreditCard, ArrowRight } from 'lucide-react'
import { useCart, CartItem } from '../contexts/CartContext'

export default function CartDrawer() {
  const { 
    items, 
    isCartOpen, 
    closeCart, 
    removeItem, 
    updateQuantity,
    clearCart,
    totalPrice,
    totalItems
  } = useCart()
  
  const [lastAddedItem, setLastAddedItem] = useState<string | null>(null)
  const [removingItem, setRemovingItem] = useState<string | null>(null)
  const itemsRef = useRef<string[]>([])
  
  // Detectar cuando se añade un nuevo producto
  useEffect(() => {
    const currentItems = items.map(item => item.id)
    
    // Comprobar si hay algún item nuevo
    if (currentItems.length > itemsRef.current.length) {
      // Encontrar el item que se acaba de añadir
      const newItemId = currentItems.find(id => !itemsRef.current.includes(id))
      if (newItemId) {
        setLastAddedItem(newItemId)
        
        // Resetear después de 2 segundos
        setTimeout(() => {
          setLastAddedItem(null)
        }, 2000)
      }
    }
    
    // Actualizar la referencia
    itemsRef.current = currentItems
  }, [items])

  // Cerrar el carrito al presionar Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) {
        closeCart()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isCartOpen, closeCart])

  // Bloquear el scroll cuando el carrito está abierto
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [isCartOpen])

  const handleQuantityUpdate = (item: CartItem, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(item.id, newQuantity)
    }
  }

  const handleRemoveItem = (id: string) => {
    setRemovingItem(id)
    // Retrasar la eliminación para permitir la animación
    setTimeout(() => {
      removeItem(id)
      setRemovingItem(null)
    }, 300)
  }

  // Variantes para las animaciones de Framer Motion
  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.8 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 400, damping: 25 } },
    exit: { opacity: 0, scale: 0.5, transition: { duration: 0.3 } }
  }

  return (
    <>
      <AnimatePresence>
        {isCartOpen && (
          <Fragment>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-50"
              onClick={closeCart}
            />
            
            {/* Cart Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-xl flex flex-col font-poppins"
            >
              {/* Header */}
              <div className="py-4 px-6 border-b flex justify-between items-center bg-gradient-to-r from-[#8B5A2B]/5 to-transparent">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-[#C6A55C]" />
                  <h2 className="text-lg font-medium">Mi Carrito</h2>
                  <span className="text-sm text-gray-500">
                    ({items.length} {items.length === 1 ? 'artículo' : 'artículos'})
                  </span>
                </div>
                <button
                  onClick={closeCart}
                  className="p-1 rounded-md hover:bg-gray-100 transition-colors duration-200"
                  aria-label="Cerrar carrito"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Cart Content */}
              <div className="flex-grow overflow-y-auto py-6 px-6">
                {items.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center justify-center h-full text-center"
                  >
                    <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">Tu carrito está vacío</h3>
                    <p className="text-sm text-gray-500 mb-6">Añade algunos artículos para comenzar</p>
                    <button
                      onClick={closeCart}
                      className="px-6 py-2 bg-[#C6A55C] hover:bg-[#B89540] text-white rounded-md transition-colors duration-300"
                    >
                      Continuar Comprando
                    </button>
                  </motion.div>
                ) : (
                  <motion.ul 
                    className="divide-y"
                    initial="hidden"
                    animate="visible"
                  >
                    <AnimatePresence>
                      {items.map((item) => (
                        <motion.li 
                          key={item.id} 
                          className={`py-6 flex ${lastAddedItem === item.id ? 'bg-[#C6A55C]/10 rounded-md' : ''} ${removingItem === item.id ? 'animate-puff-out' : ''}`}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          variants={itemVariants}
                          layoutId={`cart-item-${item.id}`}
                        >
                          {/* Product Image */}
                          <div className="relative h-24 w-24 rounded-md overflow-hidden flex-shrink-0 bg-gray-100">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          
                          {/* Product Info */}
                          <div className="ml-4 flex-1 flex flex-col">
                            <div className="flex justify-between">
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 mb-1">{item.name}</h4>
                                {item.category && (
                                  <p className="text-xs text-gray-500">{item.category}</p>
                                )}
                              </div>
                              <p className="text-sm font-medium text-gray-900">
                                {(item.price * item.quantity).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                              </p>
                            </div>
                            
                            <div className="mt-auto flex justify-between items-center">
                              {/* Quantity Controls */}
                              <div className="flex items-center border rounded-md overflow-hidden">
                                <button
                                  onClick={() => handleQuantityUpdate(item, item.quantity - 1)}
                                  className="p-1 px-2 hover:bg-gray-100 text-gray-600"
                                  aria-label="Reducir cantidad"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="px-2 text-sm">{item.quantity}</span>
                                <button
                                  onClick={() => handleQuantityUpdate(item, item.quantity + 1)}
                                  className="p-1 px-2 hover:bg-gray-100 text-gray-600"
                                  aria-label="Aumentar cantidad"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              </div>
                              
                              {/* Remove Button */}
                              <button
                                onClick={() => handleRemoveItem(item.id)}
                                className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                                aria-label="Eliminar artículo"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </motion.ul>
                )}
              </div>
              
              {/* Footer with total and checkout */}
              {items.length > 0 && (
                <motion.div 
                  className="py-4 px-6 border-t bg-gradient-to-r from-[#8B5A2B]/5 to-transparent"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-500">Subtotal</span>
                    <span className="text-sm font-medium text-gray-900">
                      {totalPrice.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="text-sm text-gray-500">Envío</span>
                    <span className="text-sm font-medium text-gray-900">Gratis</span>
                  </div>
                  <div className="flex justify-between mb-6">
                    <span className="text-base font-medium text-gray-900">Total</span>
                    <span className="text-base font-medium text-gray-900">
                      {totalPrice.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      className="flex-1 bg-gradient-to-r from-[#8B5A2B] to-[#D7B377] hover:from-[#D7B377] hover:to-[#8B5A2B] text-white py-3 rounded-md transition-all duration-300 flex justify-center items-center gap-2 shadow-md"
                    >
                      <span>Finalizar Compra</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <button
                      onClick={clearCart}
                      className="px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-300"
                      aria-label="Vaciar carrito"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </Fragment>
        )}
      </AnimatePresence>
    </>
  )
} 
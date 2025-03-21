"use client"

import Image from "next/image"
import Link from "next/link"
import { Eye, ShoppingBag, Heart, Award, Star, ArrowRight } from "lucide-react"
import { useCart } from "../contexts/CartContext"
import { useState } from "react"
import { motion } from "framer-motion"

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

export default function ProductCard({ id, name, price, image, category }: ProductCardProps) {
  const { addItem } = useCart()
  const [isWishlist, setIsWishlist] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Generar un descuento aleatorio para algunos productos
  const hasDiscount = id.length > 1 && parseInt(id) % 3 === 0
  const discountPercent = hasDiscount ? 20 : 0
  const originalPrice = hasDiscount ? Math.round(price / 0.8) : price
  
  // Marcar algunos productos como nuevos
  const isNew = id.length > 1 && parseInt(id) % 4 === 0

  // Marcar algunos productos como destacados
  const isFeatured = id.length > 1 && parseInt(id) % 5 === 0

  // Marcar algunos productos como de temporada
  const isSeasonal = id.length > 1 && parseInt(id) % 7 === 0

  const handleAddToCart = () => {
    addItem({
      id,
      name,
      price,
      image,
      category,
      quantity: 1
    })
    
    // Mostrar notificación
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 2000)
  }

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsWishlist(!isWishlist)
  }

  return (
    <motion.div 
      className="group relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Notificación de añadido al carrito */}
      {showNotification && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-4 right-4 left-4 z-30 bg-gradient-to-r from-[#8B5A2B] to-[#D7B377] text-white text-xs py-2 px-3 rounded-full shadow-lg text-center font-medium"
        >
          ¡Añadido al carrito!
        </motion.div>
      )}
      
      <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100 shadow-md group-hover:shadow-xl transition-all duration-500">
        <Image
          src={image}
          alt={name}
          fill
          className={`object-cover transition-all duration-700 ${isHovered ? 'scale-110 brightness-90' : 'scale-100'}`}
        />
        
        {/* Etiquetas y badges */}
        <div className="absolute top-0 left-0 p-3 z-10 flex flex-col gap-2">
          {hasDiscount && (
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md"
            >
              {discountPercent}% DESCUENTO
            </motion.div>
          )}
          
          {isNew && (
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              className="bg-[#C6A55C] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span> NUEVO
            </motion.div>
          )}

          {isFeatured && (
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              className="bg-purple-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1"
            >
              <Award className="h-3 w-3" /> DESTACADO
            </motion.div>
          )}

          {isSeasonal && (
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              className="bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md"
            >
              TEMPORADA
            </motion.div>
          )}
        </div>
        
        {/* Wishlist button */}
        <motion.button 
          onClick={toggleWishlist}
          whileTap={{ scale: 0.9 }}
          className={`absolute top-3 right-3 bg-white p-2 rounded-full shadow-md z-10 transition-all duration-300 ${isWishlist ? 'text-red-500' : 'text-gray-400'} hover:text-red-500 hover:shadow-lg`}
          aria-label={isWishlist ? "Quitar de favoritos" : "Añadir a favoritos"}
        >
          <Heart className="h-4 w-4" fill={isWishlist ? "currentColor" : "none"} />
        </motion.button>
        
        {/* Action buttons overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-center pb-4">
          <div className="translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 space-x-2 px-4 w-full flex">
            <motion.button
              onClick={handleAddToCart}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 bg-gradient-to-r from-[#8B5A2B] to-[#D7B377] hover:from-[#D7B377] hover:to-[#8B5A2B] text-white py-2 px-3 rounded-md transition-colors duration-300 text-sm font-medium shadow-md flex items-center justify-center gap-1"
              aria-label="Añadir al carrito"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Comprar</span>
            </motion.button>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1"
            >
              <Link
                href={`/product/${id}`}
                className="w-full flex items-center justify-center gap-1 bg-white hover:bg-gray-900 text-gray-900 hover:text-white py-2 px-3 rounded-md shadow-md transition-colors duration-300 text-sm font-medium"
                aria-label="Ver detalles"
              >
                <Eye className="h-4 w-4" />
                <span>Ver más</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2 px-1">
        {/* Valoración */}
        <div className="flex items-center gap-1">
          {Array(5).fill(0).map((_, i) => (
            <Star 
              key={i} 
              className="h-3 w-3" 
              fill={i < 4 ? (i === 3 && parseInt(id) % 2 === 0 ? "none" : "#C6A55C") : "none"}
              stroke={i < 4 ? "#C6A55C" : "#D1D5DB"}
            />
          ))}
          <span className="text-xs text-gray-500 ml-1">({Math.floor(Math.random() * 100) + 5})</span>
        </div>

        <div className="flex justify-between items-start">
          <Link href={`/product/${id}`} className="group/title block">
            <h3 className="text-sm font-medium text-gray-900 group-hover/title:text-[#C6A55C] transition-colors duration-300 truncate">
              {name}
            </h3>
            <p className="text-xs text-gray-500">{category}</p>
          </Link>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hasDiscount ? (
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-[#C6A55C]">
                    {price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                  </p>
                  <p className="text-xs text-gray-500 line-through">
                    {originalPrice.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                  </p>
                </div>
                <p className="text-xs text-green-600 font-medium">Ahorras {(originalPrice - price).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</p>
              </div>
            ) : (
              <p className="text-sm font-bold text-gray-900">
                {price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
              </p>
            )}
          </div>
          <Link href={`/product/${id}`} className="text-xs font-medium text-[#C6A55C] hover:text-[#8B5A2B] transition-colors flex items-center">
            Detalles
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </div>
      </div>
    </motion.div>
  )
} 
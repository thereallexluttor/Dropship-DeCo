"use client"

import { TamanoProducto } from '@/lib/supabase'

interface ProductSizeBadgesProps {
  tamaños?: TamanoProducto[] | null
  className?: string
  size?: 'sm' | 'md' | 'lg'
  selectedIndex?: number
  onSizeSelect?: (index: number) => void
  interactive?: boolean
}

const ProductSizeBadges = ({
  tamaños,
  className = '',
  size = 'md',
  selectedIndex = 0,
  onSizeSelect,
  interactive = false
}: ProductSizeBadgesProps) => {
  if (!tamaños || tamaños.length === 0) return null

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base'
  }

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {tamaños.map((tamano, index) => {
        const isSelected = index === selectedIndex
        const baseClasses = `${sizeClasses[size]} font-medium rounded-md border transition-colors`

        let badgeClasses = ''
        if (interactive && onSizeSelect) {
          // Modo interactivo (para carrito)
          badgeClasses = isSelected
            ? `${baseClasses} bg-[#196428] text-white border-[#196428] cursor-pointer`
            : `${baseClasses} bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 cursor-pointer`
        } else {
          // Modo solo lectura (para tienda)
          badgeClasses = isSelected
            ? `${baseClasses} bg-[#196428] text-white border-[#196428]`
            : `${baseClasses} bg-blue-100 text-blue-800 border-blue-200`
        }

        return (
          <span
            key={index}
            className={badgeClasses}
            onClick={interactive && onSizeSelect ? () => onSizeSelect(index) : undefined}
          >
            {tamano.cantidad} {tamano.unidad}
          </span>
        )
      })}
    </div>
  )
}

export default ProductSizeBadges

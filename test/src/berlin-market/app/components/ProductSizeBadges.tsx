"use client"

import { TamanoProducto } from '@/lib/supabase'

interface ProductSizeBadgesProps {
  tamaños?: TamanoProducto[] | null
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const ProductSizeBadges = ({ tamaños, className = '', size = 'md' }: ProductSizeBadgesProps) => {
  if (!tamaños || tamaños.length === 0) return null

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-1.5 text-sm',
    lg: 'px-3 py-2 text-base'
  }

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {tamaños.map((tamano, index) => (
        <span
          key={index}
          className={`${sizeClasses[size]} bg-blue-100 text-blue-800 font-medium rounded-md border border-blue-200 hover:bg-blue-200 transition-colors`}
        >
          {tamano.cantidad} {tamano.unidad}
        </span>
      ))}
    </div>
  )
}

export default ProductSizeBadges

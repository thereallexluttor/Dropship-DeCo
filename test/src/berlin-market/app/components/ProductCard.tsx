"use client"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingBag, Eye } from 'lucide-react'

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    category: string;
    image: string;
  }
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const tinyBlurDataURL =
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNlZWVlZWUiIC8+PC9zdmc+'
  
  return (
    <div 
      className="group relative flex flex-col h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden rounded-lg">
        {/* Quick actions */}
        <div className={`absolute right-4 flex flex-col gap-2 transition-all duration-500 ${
          isHovered ? 'opacity-100 translate-y-4' : 'opacity-0 translate-y-0'
        }`}>
          <button className="p-2 bg-white/90 rounded-full hover:bg-gold hover:text-white transition-all duration-300">
            <Heart className="w-5 h-5" />
          </button>
          <button className="p-2 bg-white/90 rounded-full hover:bg-gold hover:text-white transition-all duration-300">
            <ShoppingBag className="w-5 h-5" />
          </button>
          <button className="p-2 bg-white/90 rounded-full hover:bg-gold hover:text-white transition-all duration-300">
            <Eye className="w-5 h-5" />
          </button>
        </div>

        {/* Product image with zoom effect */}
        <div className="relative w-full h-full transform transition-transform duration-700 group-hover:scale-110">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            placeholder="blur"
            blurDataURL={tinyBlurDataURL}
            loading="lazy"
            quality={70}
          />
        </div>

        {/* Hover overlay */}
        <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`} />
      </div>

      {/* Product info with animated underline effect */}
      <div className="p-4 text-center">
        <p className="text-xs tracking-wider text-gray-500 mb-1">{product.category}</p>
        <h3 className="relative text-sm font-medium mb-2 inline-block">
          {product.name}
          <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gold transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
        </h3>
        <p className="text-sm font-light mb-4">{product.price} €</p>
        
        <Link
          href={`/product/${product.id}`}
          className="inline-block text-xs tracking-wider py-2 px-6 text-black border-b border-black/40 hover:border-black transition-all duration-300"
        >
          Ver Detalles
        </Link>
      </div>
    </div>
  )
} 
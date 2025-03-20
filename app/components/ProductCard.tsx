"use client"

import Image from "next/image"
import Link from "next/link"
import { Eye, ShoppingBag } from "lucide-react"

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

export default function ProductCard({ id, name, price, image, category }: ProductCardProps) {
  return (
    <div className="group relative">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-all duration-700 group-hover:scale-110"
        />
      </div>
      <div className="mt-4 space-y-1">
        <div className="flex justify-between items-start">
          <div>
            <Link href={`/product/${id}`} className="group/title">
              <h3 className="text-sm font-medium text-gray-900 group-hover/title:text-[#C6A55C] transition-colors duration-300">
                {name}
              </h3>
              <p className="text-xs text-gray-500">{category}</p>
            </Link>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900">
            {price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
          </p>
        </div>
      </div>
    </div>
  )
} 
"use client"

import { useCart } from "../contexts/CartContext"
import { ShoppingCart } from "lucide-react"

export default function CartCounter() {
  const { getTotalItems } = useCart()
  const totalItems = getTotalItems()

  return (
    <div className="relative">
      <ShoppingCart className="h-4 w-4" />
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
          {totalItems > 99 ? '99+' : totalItems}
        </span>
      )}
    </div>
  )
}

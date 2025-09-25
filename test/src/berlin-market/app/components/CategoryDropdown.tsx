"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'

interface SubCategory {
  name: string
  href: string
}

interface Category {
  name: string
  href: string
  subcategories?: SubCategory[]
}

interface CategoryDropdownProps {
  category: Category
  isOpen: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export default function CategoryDropdown({ category, isOpen, onMouseEnter, onMouseLeave }: CategoryDropdownProps) {
  return (
      <div
      className="relative group"
      style={{ isolation: 'isolate' }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Link 
        href={category.href}
        className={`text-sm font-medium whitespace-nowrap px-3 py-2 transition-colors ${
          isOpen ? 'text-[#196428] border-b-2 border-[#196428]' : 'text-gray-700 hover:text-[#196428]'
        }`}
      >
        {category.name}
      </Link>

      {isOpen && category.subcategories && (
        <div 
            className="absolute mt-0"
            style={{ 
              zIndex: 50,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'max-content',
              minWidth: '220px'
            }}
          >
          <div className="bg-white rounded-md shadow-xl border border-gray-200 relative backdrop-blur-sm">
            <div className="py-2">
              <div className="px-4 pb-2 mb-2 border-b border-gray-100">
                <h3 className="text-sm font-medium text-gray-900">Todo para {category.name}</h3>
              </div>
              {category.subcategories.map((subcategory) => (
                <Link
                  key={subcategory.name}
                  href={subcategory.href}
                  className="flex items-center justify-between px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#196428]"
                >
                  {subcategory.name}
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Link>
              ))}
              <div className="mt-2 px-4 pt-2 border-t border-gray-100">
                <Link href={category.href} className="text-[#196428] text-xs hover:underline">
                  Ver todo en {category.name}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

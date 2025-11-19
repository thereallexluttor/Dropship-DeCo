"use client"

import { useState, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import { useScrollBehavior } from '../hooks/useScrollBehavior'

// Estos tipos ahora se importan desde el hook useCategories
import { CategoryWithSubcategories } from '../hooks/useCategories'

interface SubCategory {
  name: string
  href: string
}

interface Category extends CategoryWithSubcategories {}

interface CategoryDropdownProps {
  category: Category
  isOpen: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export default function CategoryDropdown({ category, isOpen, onMouseEnter, onMouseLeave }: CategoryDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Hook para manejar el comportamiento durante scroll
  const { shouldClose, resetCloseState } = useScrollBehavior({
    threshold: 150, // Cerrar menú después de 150px de scroll
    debounceMs: 16
  })

  // Función mejorada para manejar mouse enter
  const handleMouseEnter = useCallback(() => {
    if (shouldClose) {
      resetCloseState()
    }
    onMouseEnter()
  }, [shouldClose, resetCloseState, onMouseEnter])

  // Función para calcular la posición del dropdown considerando el scroll
  const getDropdownPosition = useCallback(() => {
    if (!dropdownRef.current) return {}

    const rect = dropdownRef.current.getBoundingClientRect()
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop

    return {
      top: rect.bottom + scrollTop + 4, // 4px de margen
    }
  }, [])

  // Cerrar dropdown si el usuario hace scroll demasiado
  useEffect(() => {
    if (shouldClose && isOpen) {
      onMouseLeave()
    }
  }, [shouldClose, isOpen, onMouseLeave])
  return (
      <div
      className="relative group"
      style={{ isolation: 'isolate' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onMouseLeave}
      ref={dropdownRef}
    >
      <Link 
        href={category.href}
        className={`text-sm font-medium whitespace-nowrap px-3 py-2 transition-colors ${
          isOpen ? 'text-[#196428] border-b-2 border-[#196428]' : 'text-gray-700 hover:text-[#196428]'
        }`}
      >
        {category.name}
      </Link>

      {isOpen && !shouldClose && category.subcategories && (
        <div
            className="absolute mt-0"
            style={{
              zIndex: 50,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'max-content',
              minWidth: '220px',
              animation: 'fadeInUp 0.2s ease-out',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)'
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
                  className="flex items-center justify-between px-4 py-1.5 text-xs text-gray-600 hover:bg-gray-50 hover:text-[#196428]"
                >
                  <span className="lowercase">{subcategory.name}</span>
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

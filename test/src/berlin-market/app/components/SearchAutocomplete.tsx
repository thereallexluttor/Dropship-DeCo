"use client"

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Clock, Package, Tag } from 'lucide-react'
import { ProductWithDetails } from '../hooks/useProducts'

interface SearchAutocompleteProps {
  isOpen: boolean
  searchQuery: string
  searchResults: ProductWithDetails[]
  isSearching: boolean
  onClose: () => void
  onSelectProduct?: (product: ProductWithDetails) => void
  onSearchQuery?: (query: string) => void
}

export default function SearchAutocomplete({
  isOpen,
  searchQuery,
  searchResults,
  isSearching,
  onClose,
  onSelectProduct,
  onSearchQuery
}: SearchAutocompleteProps) {
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const autocompleteRef = useRef<HTMLDivElement>(null)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // Cargar búsquedas recientes desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // Guardar búsqueda reciente
  const saveRecentSearch = (query: string) => {
    if (query.trim() && !recentSearches.includes(query.trim())) {
      const updated = [query.trim(), ...recentSearches.slice(0, 9)]
      setRecentSearches(updated)
      localStorage.setItem('recentSearches', JSON.stringify(updated))
    }
  }

  // Manejar navegación con teclado
  useEffect(() => {
    if (!isOpen) {
      setSelectedIndex(-1)
      return
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev =>
          prev < searchResults.length - 1 ? prev + 1 : prev
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault()
        if (selectedIndex < searchResults.length) {
          handleProductSelect(searchResults[selectedIndex])
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, searchResults, onClose])

  // Resetear selección cuando cambian los resultados
  useEffect(() => {
    setSelectedIndex(-1)
  }, [searchResults])

  const handleProductSelect = (product: ProductWithDetails) => {
    saveRecentSearch(searchQuery)
    if (onSelectProduct) {
      onSelectProduct(product)
    } else {
      // Navegar a la página del producto o tienda con filtro
      window.location.href = `/tienda?search=${encodeURIComponent(product.nombre)}`
    }
    onClose()
  }

  const handleRecentSearchSelect = (recentQuery: string) => {
    if (onSearchQuery) {
      onSearchQuery(recentQuery)
    }
    saveRecentSearch(recentQuery)
    window.location.href = `/tienda?search=${encodeURIComponent(recentQuery)}`
    onClose()
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('recentSearches')
  }

  if (!isOpen) return null

  const displayResults = searchQuery.trim() ? searchResults : recentSearches.slice(0, 5)

  return (
    <div
      ref={autocompleteRef}
      className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-hidden"
    >
      {/* Loading state */}
      {isSearching && searchQuery.trim() && (
        <div className="flex items-center gap-3 p-4 text-gray-500">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#196428]"></div>
          <span>Buscando productos...</span>
        </div>
      )}

      {/* No results */}
      {!isSearching && searchQuery.trim() && searchResults.length === 0 && (
        <div className="p-4 text-gray-500 text-center">
          <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No se encontraron productos para &quot;{searchQuery}&quot;</p>
        </div>
      )}

      {/* Recent searches when no query */}
      {!searchQuery.trim() && recentSearches.length > 0 && (
        <div>
          <div className="flex items-center justify-between p-3 border-b border-gray-100">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Clock className="h-4 w-4" />
              Búsquedas recientes
            </div>
            <button
              onClick={clearRecentSearches}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Limpiar
            </button>
          </div>
          {recentSearches.slice(0, 5).map((recentQuery, index) => (
            <button
              key={recentQuery}
              onClick={() => handleRecentSearchSelect(recentQuery)}
              className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left transition-colors"
            >
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-700">{recentQuery}</span>
            </button>
          ))}
        </div>
      )}

      {/* Search results */}
      {searchQuery.trim() && searchResults.length > 0 && (
        <div>
          <div className="flex items-center gap-2 p-3 border-b border-gray-100">
            <Package className="h-4 w-4 text-[#196428]" />
            <span className="text-sm font-medium text-gray-700">
              Productos encontrados ({searchResults.length})
            </span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {searchResults.slice(0, 8).map((product, index) => (
              <button
                key={product.id}
                onClick={() => handleProductSelect(product)}
                className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left transition-colors ${
                  selectedIndex === index ? 'bg-green-50' : ''
                }`}
              >
                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image
                    src={product.imagen_url || '/placeholder.jpg'}
                    alt={product.nombre}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {product.nombre}
                    </span>
                    {product.descuento && (
                      <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                        OFERTA
                      </span>
                    )}
                    {product.destacado && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                        DESTACADO
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {product.descripcion || 'Sin descripción'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {product.marca && (
                      <span className="text-xs text-gray-400">
                        {product.marca.nombre_marca}
                      </span>
                    )}
                    {product.precios && product.precios.length > 0 && (
                      <span className="text-xs font-medium text-[#196428]">
                        Desde ${product.precios[0]?.toLocaleString('es-CO') || '0'}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Ver todos los resultados */}
          {searchResults.length > 8 && (
            <Link
              href={`/tienda?search=${encodeURIComponent(searchQuery)}`}
              onClick={() => {
                saveRecentSearch(searchQuery)
                onClose()
              }}
              className="block w-full p-3 text-center text-sm font-medium text-[#196428] hover:bg-green-50 border-t border-gray-100 transition-colors"
            >
              Ver todos los resultados ({searchResults.length})
            </Link>
          )}
        </div>
      )}

      {/* Empty state for no recent searches */}
      {!searchQuery.trim() && recentSearches.length === 0 && (
        <div className="p-4 text-gray-500 text-center">
          <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Escribe para buscar productos</p>
          <p className="text-xs mt-1">Encuentra comida, juguetes y accesorios para mascotas</p>
        </div>
      )}
    </div>
  )
}

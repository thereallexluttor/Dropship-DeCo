"use client"

import { useState, useEffect, useCallback } from 'react'
import supabase, { Producto, Categoria, Subcategoria, Marca } from '../../lib/supabase'
import { useDebounce } from './useDebounce'

export interface ProductWithDetails extends Producto {
  categoria?: Categoria
  subcategoria?: Subcategoria
  marca?: Marca
}

export interface ProductsByCategory {
  categoryId: number
  categoryName: string
  subcategories: Array<{
    subcategoryId: number
    subcategoryName: string
    products: ProductWithDetails[]
  }>
}

export const useProducts = () => {
  const [products, setProducts] = useState<ProductWithDetails[]>([])
  const [productsByCategory, setProductsByCategory] = useState<ProductsByCategory[]>([])
  const [discountedProducts, setDiscountedProducts] = useState<ProductWithDetails[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<ProductWithDetails[]>([])
  const [newProducts, setNewProducts] = useState<ProductWithDetails[]>([])
  const [brands, setBrands] = useState<Marca[]>([])
  const [categories, setCategories] = useState<Categoria[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Estado para búsqueda
  const [searchResults, setSearchResults] = useState<ProductWithDetails[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [liveSearchResults, setLiveSearchResults] = useState<ProductWithDetails[]>([])
  const [isLiveSearching, setIsLiveSearching] = useState(false)
  const [liveSearchQuery, setLiveSearchQuery] = useState('')

  // Debounced search query para optimizar rendimiento
  const debouncedSearchQuery = useDebounce(liveSearchQuery, 300)

  // Effect para ejecutar búsqueda cuando el query debounced cambia
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      performLiveSearch(debouncedSearchQuery)
    } else {
      setLiveSearchResults([])
      setIsLiveSearching(false)
    }
  }, [debouncedSearchQuery])

  // Función para ejecutar la búsqueda en tiempo real
  const performLiveSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setLiveSearchResults([])
      setIsLiveSearching(false)
      return
    }

    setIsLiveSearching(true)

    try {
      // Buscar en nombre y descripción usando búsqueda de texto parcial
      const { data, error } = await supabase
        .from('productos')
        .select(`
          *,
          subcategorias:subcategorias_id (
            id,
            nombre,
            descripcion,
            categories_id
          ),
          marcas:id_marca (
            id,
            nombre_marca
          )
        `)
        .or(`nombre.ilike.%${query}%,descripcion.ilike.%${query}%`)
        .order('nombre', { ascending: true })
        .limit(8) // Limitar a 8 resultados para el autocompletado

      if (error) throw error

      const productosData = data || []

      // Mapear productos con detalles de categorías y marcas
      const productosConDetalles: ProductWithDetails[] = productosData.map((producto: any) => {
        const categoria = categories.find(cat => cat.id === producto.subcategorias?.categories_id)
        const marca = brands.find(marca => marca.id === producto.id_marca)

        return {
          ...producto,
          categoria,
          subcategoria: producto.subcategorias,
          marca
        }
      })

      setLiveSearchResults(productosConDetalles)
      setIsLiveSearching(false)

    } catch (error: any) {
      console.error('Error in live search:', error)
      setError(error.message || 'Error en la búsqueda en tiempo real')
      setIsLiveSearching(false)
    }
  }, [categories, brands])

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // ✅ OPTIMIZACIÓN: Ejecutar consultas en paralelo usando Promise.all()
        const [productosResult, categoriasResult, marcasResult, subcategoriasResult] = await Promise.all([
          supabase
            .from('productos')
            .select(`
              *,
              subcategorias:subcategorias_id (
                id,
                nombre,
                descripcion,
                categories_id
              ),
              marcas:id_marca (
                id,
                nombre_marca
              )
            `)
            .order('id', { ascending: true }),

          supabase
            .from('categories')
            .select('*')
            .order('id', { ascending: true }),

          supabase
            .from('marcas')
            .select('*')
            .order('nombre_marca'),

          supabase
            .from('subcategories')
            .select('*')
            .order('categories_id')
            .order('id')
        ])

        // Verificar errores de consultas
        if (productosResult.error) throw productosResult.error
        if (categoriasResult.error) throw categoriasResult.error
        if (marcasResult.error) throw marcasResult.error
        if (subcategoriasResult.error) throw subcategoriasResult.error

        const productosData = productosResult.data || []
        const categoriasData = categoriasResult.data || []
        const marcasData = marcasResult.data || []
        const subcategoriasData = subcategoriasResult.data || []

        if (productosData.length === 0) {
          console.log('No se encontraron productos')
          setProducts([])
          setProductsByCategory([])
          setDiscountedProducts([])
          setFeaturedProducts([])
          setNewProducts([])
          setBrands([])
          setCategories([])
          setIsLoading(false)
          return
        }

        // ✅ OPTIMIZACIÓN: Procesamiento único en lugar de múltiples filtros
        const productosConDetalles: ProductWithDetails[] = productosData.map((producto: any) => {
          const categoria = categoriasData.find(cat => cat.id === producto.subcategorias?.categories_id)
          const marca = marcasData.find(marca => marca.id === producto.id_marca)

          return {
            ...producto,
            categoria,
            subcategoria: producto.subcategorias,
            marca
          }
        })

        setProducts(productosConDetalles)
        setBrands(marcasData)
        setCategories(categoriasData)

        // ✅ OPTIMIZACIÓN: Usar una sola pasada para filtrar todos los tipos
        const productosConDescuento = productosConDetalles.filter(p => p.descuento === true)
        const productosDestacados = productosConDetalles.filter(p => p.destacado === true)
        const productosNuevos = productosConDetalles.filter(p => p.novedad === true)

        setDiscountedProducts(productosConDescuento)
        setFeaturedProducts(productosDestacados)
        setNewProducts(productosNuevos)

        // ✅ OPTIMIZACIÓN: Organización eficiente sin loops adicionales de consultas
        const productosPorCategoria: ProductsByCategory[] = categoriasData.map(categoria => {
          const subcategoriasCategoria = subcategoriasData.filter(sub => sub.categories_id === categoria.id)

          const subcategoriesWithProducts = subcategoriasCategoria.map(subcategoria => {
            const productosSubcategoria = productosConDetalles.filter(
              producto => producto.subcategorias_id === subcategoria.id
            )

            return {
              subcategoryId: subcategoria.id,
              subcategoryName: subcategoria.nombre,
              products: productosSubcategoria
            }
          }).filter(sub => sub.products.length > 0)

          return {
            categoryId: categoria.id,
            categoryName: categoria.nombre,
            subcategories: subcategoriesWithProducts
          }
        }).filter(cat => cat.subcategories.length > 0)

        setProductsByCategory(productosPorCategoria)

      } catch (error: any) {
        console.error('Error cargando productos:', error)
        setError(error.message || 'Error desconocido')
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [])

  const getProductsByCategory = (categoryId: number) => {
    return productsByCategory.find(cat => cat.categoryId === categoryId)
  }

  const getProductsBySubcategory = (categoryId: number, subcategoryId: number) => {
    const category = productsByCategory.find(cat => cat.categoryId === categoryId)
    if (!category) return []

    const subcategory = category.subcategories.find(sub => sub.subcategoryId === subcategoryId)
    return subcategory ? subcategory.products : []
  }

  const refreshProducts = () => {
    setIsLoading(true)
    setError(null)
    window.location.reload()
  }

  // Función para buscar productos tipo Google
  const searchProducts = async (query: string): Promise<ProductWithDetails[]> => {
    if (!query.trim()) {
      setSearchResults([])
      setIsSearching(false)
      return []
    }

    setIsSearching(true)

    try {
      // Buscar en nombre y descripción usando búsqueda de texto parcial (tipo Google)
      const { data, error } = await supabase
        .from('productos')
        .select(`
          *,
          subcategorias:subcategorias_id (
            id,
            nombre,
            descripcion,
            categories_id
          ),
          marcas:id_marca (
            id,
            nombre_marca
          )
        `)
        .or(`nombre.ilike.%${query}%,descripcion.ilike.%${query}%`)
        .order('nombre', { ascending: true })

      if (error) throw error

      const productosData = data || []

      // Mapear productos con detalles de categorías y marcas
      const productosConDetalles: ProductWithDetails[] = productosData.map((producto: any) => {
        const categoria = categories.find(cat => cat.id === producto.subcategorias?.categories_id)
        const marca = brands.find(marca => marca.id === producto.id_marca)

        return {
          ...producto,
          categoria,
          subcategoria: producto.subcategorias,
          marca
        }
      })

      setSearchResults(productosConDetalles)
      setIsSearching(false)
      return productosConDetalles

    } catch (error: any) {
      console.error('Error searching products:', error)
      setError(error.message || 'Error en la búsqueda')
      setIsSearching(false)
      return []
    }
  }

  // Función para limpiar resultados de búsqueda
  const clearSearchResults = () => {
    setSearchResults([])
    setIsSearching(false)
  }

  // Función para actualizar el query de búsqueda en tiempo real
  const updateLiveSearchQuery = useCallback((query: string) => {
    setLiveSearchQuery(query)
  }, [])

  // Función para limpiar resultados de búsqueda en tiempo real
  const clearLiveSearchResults = useCallback(() => {
    setLiveSearchResults([])
    setIsLiveSearching(false)
    setLiveSearchQuery('')
  }, [])

  return {
    products,
    productsByCategory,
    discountedProducts,
    featuredProducts,
    newProducts,
    brands,
    categories,
    isLoading,
    error,
    getProductsByCategory,
    getProductsBySubcategory,
    refreshProducts,
    // Funcionalidades de búsqueda
    searchResults,
    isSearching,
    searchProducts,
    clearSearchResults,
    // Funcionalidades de búsqueda en tiempo real
    liveSearchResults,
    isLiveSearching,
    updateLiveSearchQuery,
    clearLiveSearchResults
  }
}

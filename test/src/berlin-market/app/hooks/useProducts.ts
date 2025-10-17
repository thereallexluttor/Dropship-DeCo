"use client"

import { useState, useEffect } from 'react'
import supabase, { Producto, Categoria, Subcategoria, Marca } from '@/lib/supabase'

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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  return {
    products,
    productsByCategory,
    discountedProducts,
    featuredProducts,
    newProducts,
    brands,
    isLoading,
    error,
    getProductsByCategory,
    getProductsBySubcategory,
    refreshProducts
  }
}

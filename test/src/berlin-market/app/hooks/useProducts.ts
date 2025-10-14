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
        // Cargar productos con detalles de categoría, subcategoría y marca
        const { data: productosData, error: productosError } = await supabase
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
          .order('id', { ascending: true })

        if (productosError) {
          console.error('Error cargando productos:', productosError)
          setError(productosError.message)
          setIsLoading(false)
          return
        }

        if (!productosData || productosData.length === 0) {
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

        // Obtener las categorías para completar la información
        const { data: categoriasData } = await supabase
          .from('categories')
          .select('*')

        // Obtener las marcas
        const { data: marcasData } = await supabase
          .from('marcas')
          .select('*')
          .order('nombre_marca')

        // Procesar productos y agregar información de categoría y marca
        const productosConDetalles: ProductWithDetails[] = productosData.map((producto: any) => {
          const categoria = categoriasData?.find(cat => cat.id === producto.subcategorias?.categories_id)
          const marca = marcasData?.find(marca => marca.id === producto.id_marca)

          return {
            ...producto,
            categoria,
            subcategoria: producto.subcategorias,
            marca
          }
        })

        // Guardar marcas
        if (marcasData) {
          setBrands(marcasData)
        }

        setProducts(productosConDetalles)

        // Filtrar productos con descuento
        const productosConDescuento = productosConDetalles.filter(producto => producto.descuento === true)
        setDiscountedProducts(productosConDescuento)

        // Filtrar productos destacados
        const productosDestacados = productosConDetalles.filter(producto => producto.destacado === true)
        setFeaturedProducts(productosDestacados)

        // Filtrar productos nuevos
        const productosNuevos = productosConDetalles.filter(producto => producto.novedad === true)
        setNewProducts(productosNuevos)

        // Organizar productos por categoría y subcategoría
        const productosPorCategoria: ProductsByCategory[] = []

        if (categoriasData) {
          for (const categoria of categoriasData) {
            const { data: subcategoriasData } = await supabase
              .from('subcategories')
              .select('*')
              .eq('categories_id', categoria.id)

            if (subcategoriasData && subcategoriasData.length > 0) {
              const subcategoriesWithProducts = subcategoriasData.map(subcategoria => {
                const productosSubcategoria = productosConDetalles.filter(
                  producto => producto.subcategorias_id === subcategoria.id
                )

                return {
                  subcategoryId: subcategoria.id,
                  subcategoryName: subcategoria.nombre,
                  products: productosSubcategoria
                }
              }).filter(sub => sub.products.length > 0)

              if (subcategoriesWithProducts.length > 0) {
                productosPorCategoria.push({
                  categoryId: categoria.id,
                  categoryName: categoria.nombre,
                  subcategories: subcategoriesWithProducts
                })
              }
            }
          }
        }

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

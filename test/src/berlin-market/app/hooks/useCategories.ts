"use client"

import { useState, useEffect } from 'react'
import supabase, { Categoria, Subcategoria } from '@/lib/supabase'

export interface CategoryWithSubcategories {
  id: number
  name: string
  href: string
  descripcion?: string
  imagen_marca1?: string | null
  imagen_marca2?: string | null
  imagen_marca3?: string | null
  categoria_imagen?: string | null
  subcategories?: Array<{
    name: string
    href: string
  }>
  promotions?: Array<{
    type: 'offer' | 'new'
    title: string
    href: string
    icon: string
  }>
  brands?: Array<{
    name: string
    logo: string
    href: string
  }>
  bannerImage?: {
    src: string
    alt: string
    href: string
  }
}

export const useCategories = () => {
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCategories = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Cargar categorías
        const { data: categoriasData, error: categoriasError } = await supabase
          .from('categories')
          .select('*')
          .order('id', { ascending: true })

        if (categoriasError) {
          console.error('Error cargando categorías:', categoriasError)
          setError(categoriasError.message)
          setIsLoading(false)
          return
        }

        if (!categoriasData || categoriasData.length === 0) {
          console.log('No se encontraron categorías')
          setCategories([])
          setIsLoading(false)
          return
        }

        // Cargar subcategorías
        const { data: subcategoriasData, error: subcategoriasError } = await supabase
          .from('subcategories')
          .select('*')
          .order('categories_id')
          .order('id')

        if (subcategoriasError) {
          console.error('Error cargando subcategorías:', subcategoriasError)
          setError(subcategoriasError.message)
          setIsLoading(false)
          return
        }

        // Combinar categorías con subcategorías
        const categoriesWithSubcategories: CategoryWithSubcategories[] = categoriasData.map((categoria: Categoria) => {
          const subcats = subcategoriasData?.filter(sub => sub.categories_id === categoria.id) || []

          return {
            id: categoria.id || 0,
            name: categoria.nombre,
            href: `/tienda?categoria=${categoria.id}`,
            descripcion: categoria.descripcion,
            imagen_marca1: categoria.imagen_marca1,
            imagen_marca2: categoria.imagen_marca2,
            imagen_marca3: categoria.imagen_marca3,
            categoria_imagen: categoria.categoria_imagen,
            subcategories: subcats.map(sub => ({
              name: sub.nombre,
              href: `/tienda?categoria=${categoria.id}&subcategoria=${sub.id}`
            })),
            // Por ahora agregamos algunos datos estáticos para las promociones y marcas
            // Estos podrían venir de tablas adicionales en el futuro
            promotions: [
              {
                type: "offer" as const,
                title: "Ofertas Especiales",
                href: `/tienda?categoria=${categoria.id}&ofertas=true`,
                icon: "/icons/exclusive.png"
              },
              {
                type: "new" as const,
                title: "Novedades",
                href: `/tienda?categoria=${categoria.id}&novedades=true`,
                icon: "/icons/diamond.png"
              }
            ],
            brands: [
              {
                name: "Royal Canin",
                logo: categoria.imagen_marca1 || "/placeholder-logo.svg",
                href: `/tienda?categoria=${categoria.id}&marca=royal-canin`
              },
              {
                name: "Purina",
                logo: categoria.imagen_marca2 || "/placeholder-logo.svg",
                href: `/tienda?categoria=${categoria.id}&marca=purina`
              },
              {
                name: "Marca 3",
                logo: categoria.imagen_marca3 || "/placeholder-logo.svg",
                href: `/tienda?categoria=${categoria.id}&marca=marca3`
              }
            ],
            bannerImage: {
              src: categoria.categoria_imagen || `/placeholder.jpg`,
              alt: categoria.nombre,
              href: `/tienda?categoria=${categoria.id}`
            }
          }
        })

        setCategories(categoriesWithSubcategories)
      } catch (error: any) {
        console.error('Error cargando categorías:', error)
        setError(error.message || 'Error desconocido')
      } finally {
        setIsLoading(false)
      }
    }

    loadCategories()
  }, [])

  const refreshCategories = () => {
    setIsLoading(true)
    setError(null)
    // Simplemente recargar usando el useEffect
    window.location.reload()
  }

  return {
    categories,
    isLoading,
    error,
    refreshCategories
  }
}

"use client"

import { useState, useEffect } from 'react'
import supabase, { Categoria, Subcategoria } from '../../lib/supabase'

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
  /** Para Mascotas: carrusel de banners PERRO + GATO */
  bannerImagesCarousel?: Array<{ src: string; alt: string; href: string }>
  /** Para Mascotas: carrusel de marcas PERRO + GATO (cada slide = 3 marcas) */
  brandsCarousel?: Array<Array<{ name: string; logo: string; href: string }>>
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
        // ✅ OPTIMIZACIÓN: Consulta única con JOIN eficiente
        const { data: categoriasConSubcategorias, error } = await supabase
          .from('categories')
          .select(`
            *,
            subcategories (*)
          `)
          .order('id')

        if (error) {
          console.error('Error cargando categorías:', error)
          setError(error.message)
          setIsLoading(false)
          return
        }

        if (!categoriasConSubcategorias || categoriasConSubcategorias.length === 0) {
          console.log('No se encontraron categorías')
          setCategories([])
          setIsLoading(false)
          return
        }

        // ✅ OPTIMIZACIÓN: Procesamiento único sin consultas adicionales
        let categoriesWithSubcategories: CategoryWithSubcategories[] = categoriasConSubcategorias.map((categoria: any) => ({
          id: categoria.id,
          name: categoria.nombre,
          href: `/tienda?categoria=${categoria.id}`,
          descripcion: categoria.descripcion,
          imagen_marca1: categoria.imagen_marca1,
          imagen_marca2: categoria.imagen_marca2,
          imagen_marca3: categoria.imagen_marca3,
          categoria_imagen: categoria.categoria_imagen,
          subcategories: categoria.subcategories?.map((sub: any) => ({
            name: sub.nombre,
            href: `/tienda?categoria=${categoria.id}&subcategoria=${sub.id}`
          })) || [],
          // Datos estáticos - podrían venir de tablas adicionales en el futuro
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
        }))

        // Agrupar PERRO (id:4) y GATO (id:5) en una sola categoría "Mascotas"
        const perroCategory = categoriesWithSubcategories.find(cat => cat.id === 4)
        const gatoCategory = categoriesWithSubcategories.find(cat => cat.id === 5)

        if (perroCategory && gatoCategory) {
          // Agrupar subcategorías por nombre normalizado (evitar duplicados y combinar PERRO + GATO)
          const normalizeName = (name: string) =>
            (name || "").trim().toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ")
          const byKey = new Map<string, { name: string; subcategoryIds: number[] }>()
          const addSub = (sub: { name: string; href: string }) => {
            const id = parseInt(sub.href.split("subcategoria=")[1] || "0", 10)
            if (isNaN(id)) return
            const key = normalizeName(sub.name)
            const existing = byKey.get(key)
            if (existing) {
              if (!existing.subcategoryIds.includes(id)) existing.subcategoryIds.push(id)
            } else {
              byKey.set(key, { name: sub.name.trim(), subcategoryIds: [id] })
            }
          }
          ;(perroCategory.subcategories || []).forEach(addSub)
          ;(gatoCategory.subcategories || []).forEach(addSub)
          const subcategoriasAgrupadas = Array.from(byKey.values()).map(({ name, subcategoryIds }) => ({
            name,
            href: `/tienda?categoria=997&subcategoria=${subcategoryIds.join(",")}`
          }))

          // Crear la categoría "Mascotas" combinada
          // Usar id especial 997 para identificar la categoría agrupada (999 y 998 ya están en uso)
          const mascotasCategory: CategoryWithSubcategories = {
            id: 997, // ID especial para la categoría agrupada
            name: "Mascotas",
            href: `/tienda?categoria=997`, // Usar ID numérico especial
            descripcion: "Productos para perros y gatos",
            // Usar imágenes de PERRO como base (puedes cambiar a GATO si prefieres)
            imagen_marca1: perroCategory.imagen_marca1 || gatoCategory.imagen_marca1,
            imagen_marca2: perroCategory.imagen_marca2 || gatoCategory.imagen_marca2,
            imagen_marca3: perroCategory.imagen_marca3 || gatoCategory.imagen_marca3,
            categoria_imagen: perroCategory.categoria_imagen || gatoCategory.categoria_imagen,
            subcategories: subcategoriasAgrupadas,
            promotions: [
              {
                type: "offer" as const,
                title: "Ofertas Especiales",
                href: "/tienda?categoria=999",
                icon: "/icons/exclusive.png"
              },
              {
                type: "new" as const,
                title: "Novedades",
                href: "/tienda?categoria=998",
                icon: "/icons/diamond.png"
              }
            ],
            brands: [
              {
                name: "Royal Canin",
                logo: perroCategory.imagen_marca1 || gatoCategory.imagen_marca1 || "/placeholder-logo.svg",
                href: `/tienda?categoria=997&marca=royal-canin`
              },
              {
                name: "Purina",
                logo: perroCategory.imagen_marca2 || gatoCategory.imagen_marca2 || "/placeholder-logo.svg",
                href: `/tienda?categoria=997&marca=purina`
              },
              {
                name: "Marca 3",
                logo: perroCategory.imagen_marca3 || gatoCategory.imagen_marca3 || "/placeholder-logo.svg",
                href: `/tienda?categoria=997&marca=marca3`
              }
            ],
            bannerImage: {
              src: perroCategory.categoria_imagen || gatoCategory.categoria_imagen || `/placeholder.jpg`,
              alt: "Mascotas",
              href: `/tienda?categoria=997`
            },
            bannerImagesCarousel: [
              {
                src: perroCategory.categoria_imagen || `/placeholder.jpg`,
                alt: "Perros",
                href: `/tienda?categoria=997`
              },
              {
                src: gatoCategory.categoria_imagen || `/placeholder.jpg`,
                alt: "Gatos",
                href: `/tienda?categoria=997`
              }
            ],
            brandsCarousel: [
              [
                { name: "Royal Canin", logo: perroCategory.imagen_marca1 || "/placeholder-logo.svg", href: `/tienda?categoria=997&marca=royal-canin` },
                { name: "Purina", logo: perroCategory.imagen_marca2 || "/placeholder-logo.svg", href: `/tienda?categoria=997&marca=purina` },
                { name: "Marca 3", logo: perroCategory.imagen_marca3 || "/placeholder-logo.svg", href: `/tienda?categoria=997&marca=marca3` }
              ],
              [
                { name: "Royal Canin", logo: gatoCategory.imagen_marca1 || "/placeholder-logo.svg", href: `/tienda?categoria=997&marca=royal-canin` },
                { name: "Purina", logo: gatoCategory.imagen_marca2 || "/placeholder-logo.svg", href: `/tienda?categoria=997&marca=purina` },
                { name: "Marca 3", logo: gatoCategory.imagen_marca3 || "/placeholder-logo.svg", href: `/tienda?categoria=997&marca=marca3` }
              ]
            ]
          }

          // Remover PERRO y GATO de la lista y agregar Mascotas
          categoriesWithSubcategories = categoriesWithSubcategories
            .filter(cat => cat.id !== 4 && cat.id !== 5)
            .concat(mascotasCategory)
        }

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

"use client"

import Image from "next/image"
import Link from "next/link"
import {
  ShoppingBag,
  Search,
  Home as HomeIcon,
  User,
  ShoppingCart,
  Info,
  MapPin,
  Menu,
  Dog,
  Cat,
  Rabbit,
  Bird,
  Beef,
  Fish,
  HeartPulse,
  Tag,
  Sparkles,
  Eye,
  EyeOff,
  Check,
  Briefcase,
  ChevronRight
} from "lucide-react"
import { useState, useEffect, useRef, useMemo, Suspense, useLayoutEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import ProductCard from "../components/ProductCard"
import FadeInOnScroll from '../components/FadeInOnScroll'
import CategoryMenu from '../components/CategoryMenu'
import StoreLocator from '../components/StoreLocator'
import Footer from '../components/Footer'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Slider } from "@/components/ui/slider"
import MainLayout from "../components/MainLayout"
import CategoryDropdown from "../components/CategoryDropdown"
import AccountPopoverContent from "../components/AccountPopoverContent"
import Header from "../components/Header"
import { Marca } from "@/lib/supabase"
import { useCategories } from "../hooks/useCategories"
import { useProducts, ProductWithDetails } from "../hooks/useProducts"
import ProductSizeBadges from "../components/ProductSizeBadges"
import { useCart } from "../contexts/CartContext"
import { loadStoresFromSupabase, type Store } from "../lib/stores"
import { productAvailableInStore, filterProductDataByStore } from "@/lib/productStoreUtils"

function TiendaPageContent() {
  const [activeSlide, setActiveSlide] = useState(0)
  const [activeCardSlide, setActiveCardSlide] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeProductSlide, setActiveProductSlide] = useState(0)
  const [activeBrandSlide, setActiveBrandSlide] = useState(0)
  const [openCategory, setOpenCategory] = useState<string | null>(null)
  const categoriesContainerRef = useRef<HTMLDivElement>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isAccountDrawerOpen, setIsAccountDrawerOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCategoriesDrawerOpen, setIsCategoriesDrawerOpen] = useState(false)
  const [isFiltersDrawerOpen, setIsFiltersDrawerOpen] = useState(false)
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false)
  // Estado para manejar el tamaño seleccionado de cada producto
  const [selectedSizes, setSelectedSizes] = useState<{[key: number]: number}>({})

  // Estado para filtros de marcas
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null)
  const [availableBrands, setAvailableBrands] = useState<Marca[]>([])

  // Estado para filtros avanzados (disponible para todas las categorías)
  const [showOnlyOffers, setShowOnlyOffers] = useState(false)
  const [showOnlyDiscounts, setShowOnlyDiscounts] = useState(false)
  const [selectedProductCategory, setSelectedProductCategory] = useState<number | null>(null)
  const [selectedProductSubcategory, setSelectedProductSubcategory] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<string>("Más popular") // Estado para ordenamiento

  // Configuración de paginado por filas (7 filas en desktop: 4 productos por fila)
  const PRODUCTS_PER_ROW_DESKTOP = 4
  const ROWS_PER_BATCH = 7
  const PRODUCTS_PER_BATCH = PRODUCTS_PER_ROW_DESKTOP * ROWS_PER_BATCH
  const [visibleProductCount, setVisibleProductCount] = useState<number>(PRODUCTS_PER_BATCH)

  // Estado para tiendas y tienda seleccionada (0 = Todas las tiendas)
  const [tiendas, setTiendas] = useState<Store[]>([])
  const [selectedStoreId, setSelectedStoreId] = useState<number>(0) // 0 = Todas las tiendas, >0 = tienda específica

  // Hooks para datos de Supabase
  const { categories, isLoading: categoriesLoading, error: categoriesError } = useCategories()
  const { products, productsByCategory, discountedProducts, featuredProducts, newProducts, brands, categories: productCategories, isLoading: productsLoading, error: productsError, getProductsBySubcategory, getAllProductsByCategory, searchResults, isSearching, searchProducts, clearSearchResults, liveSearchResults, isLiveSearching, updateLiveSearchQuery, clearLiveSearchResults } = useProducts()

  // Hook para el carrito de compras
  const { addToCart } = useCart()

  // Hooks para navegación y parámetros de URL
  const searchParams = useSearchParams()
  const router = useRouter()
  const searchQueryParam = searchParams.get('search')
  const categoryParam = searchParams.get('categoria')
  const subcategoryParam = searchParams.get('subcategoria')

  // Estado para filtros desde URL
  const [isSearchFromUrl, setIsSearchFromUrl] = useState(false)
  const [selectedCategoryFromUrl, setSelectedCategoryFromUrl] = useState<number | null>(null)
  const [selectedSubcategoryFromUrl, setSelectedSubcategoryFromUrl] = useState<number | null>(null)
  const [isUpdatingFromUrl, setIsUpdatingFromUrl] = useState(false)

  // Constantes para categorías especiales
  const CATEGORIES = {
    MASCOTAS: 997, // Categoría agrupada de PERRO (4) y GATO (5)
    OFERTAS: 999,
    NOVEDADES: 998,
    TODOS_LOS_PRODUCTOS: 1000
  }

  // Efecto para manejar búsqueda desde URL
  useEffect(() => {
    if (searchQueryParam && !isSearchFromUrl) {
      setIsSearchFromUrl(true)
      setSearchQuery(searchQueryParam)
      searchProducts(searchQueryParam)
    }
  }, [searchQueryParam, isSearchFromUrl, searchProducts])

  // Efecto para manejar filtros de categoría y subcategoría desde URL (se ejecuta antes del paint)
  useLayoutEffect(() => {
    // Solo procesar si hay datos disponibles
    if (categories.length > 0 && productsByCategory.length > 0) {
      if (categoryParam) {
        const categoryId = parseInt(categoryParam)
        if (!isNaN(categoryId) && selectedCategoryFromUrl !== categoryId) {
          console.log('Configurando categoría desde URL:', categoryId)
          setSelectedCategoryFromUrl(categoryId)
          setSelectedCategory(categoryId)
          
          // Si no hay parámetro de búsqueda, limpiar la búsqueda
          if (!searchQueryParam) {
            setSearchQuery("")
            clearSearchResults()
            clearLiveSearchResults()
          }

          // Si también hay subcategoría, verificar que pertenece a la categoría
          if (subcategoryParam) {
            // Mascotas puede usar subcategoria=5,6 (IDs separados por coma)
            const subcategoryIds = subcategoryParam.includes(",")
              ? subcategoryParam.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n))
              : [parseInt(subcategoryParam)].filter(n => !isNaN(n))
            
            if (subcategoryIds.length > 0) {
              const subcategoryId = subcategoryIds[0]
              console.log('Configurando subcategoría desde URL:', subcategoryIds)
              setSelectedSubcategoryFromUrl(subcategoryId)
              setSelectedSubcategory(subcategoryId)

              // Caso especial: Mascotas (subcategorías agrupadas por nombre)
              if (categoryId === CATEGORIES.MASCOTAS) {
                setSelectedMascotasSubcategoryIds(subcategoryIds)
                const groups = getMascotasGroupedSubcategories()
                const idsMatch = (a: number[], b: number[]) => {
                  if (a.length !== b.length) return false
                  const sa = [...a].sort((x, y) => x - y)
                  const sb = [...b].sort((x, y) => x - y)
                  return sa.every((x, i) => x === sb[i])
                }
                const group = groups.find(g => idsMatch(g.subcategoryIds, subcategoryIds))
                const category = categories.find(cat => cat.id === categoryId)
                if (category) {
                  setCurrentTitle(group?.displayName ?? "Subcategoría")
                  setCurrentBreadcrumbs(["Inicio", "Tienda", category.name, group?.displayName ?? "Subcategoría"])
                }
              } else {
                // Verificar que la subcategoría pertenece a la categoría (categorías normales)
                const categoryData = productsByCategory.find(cat => cat.categoryId === categoryId)
                const subcategoryData = categoryData?.subcategories.find(sub => sub.subcategoryId === subcategoryId)

                if (subcategoryData) {
                  // La subcategoría existe en la categoría, configurarla
                  // Buscar información de la categoría y subcategoría
                  const category = categories.find(cat => cat.id === categoryId)
                  if (category && subcategoryData) {
                    setCurrentTitle(subcategoryData.subcategoryName)
                    setCurrentBreadcrumbs(["Inicio", "Tienda", category.name, subcategoryData.subcategoryName])
                  }
                } else {
                  // La subcategoría no existe en la categoría, resetear a "Todas las subcategorías"
                  console.log('Subcategoría no encontrada en la categoría, reseteando')
                  // Usar 0 como indicador de "todas las subcategorías de esta categoría"
                  setSelectedSubcategory(0)

                  // Solo mostrar categoría
                  const category = categories.find(cat => cat.id === categoryId)
                  if (category) {
                    setCurrentTitle(category.name)
                    setCurrentBreadcrumbs(["Inicio", "Tienda", category.name])
                  }
                }
              }
            }
          } else {
            // Solo categoría, mostrar todos los productos de esa categoría
            setSelectedSubcategory(0)
            if (categoryId === CATEGORIES.MASCOTAS) setSelectedMascotasSubcategoryIds(null)
            const category = categories.find(cat => cat.id === categoryId)
            if (category) {
              setCurrentTitle(category.name)
              setCurrentBreadcrumbs(["Inicio", "Tienda", category.name])
            }
          }
        }
      } else if (!categoryParam && selectedCategoryFromUrl === null) {
        // No hay parámetros de URL, mostrar todos los productos (solo la primera vez)
        console.log('Sin parámetros de URL, mostrando todos los productos')
        setSelectedCategoryFromUrl(CATEGORIES.TODOS_LOS_PRODUCTOS)
        setSelectedCategory(CATEGORIES.TODOS_LOS_PRODUCTOS)
        setSelectedSubcategory(CATEGORIES.TODOS_LOS_PRODUCTOS)
        setCurrentTitle("Todos los productos")
        setCurrentBreadcrumbs(["Inicio", "Tienda"])
        // Limpiar búsqueda si no hay parámetro de búsqueda
        if (!searchQueryParam) {
          setSearchQuery("")
          clearSearchResults()
          clearLiveSearchResults()
        }
        // Limpiar filtros avanzados
        setSelectedProductCategory(null)
        setSelectedProductSubcategory(null)
        setShowOnlyOffers(false)
        setShowOnlyDiscounts(false)
        setSelectedBrand(null)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryParam, subcategoryParam, categories, productsByCategory])

  // Función para agregar productos al carrito considerando el tamaño y tienda seleccionados
  const handleAddToCart = (product: ProductWithDetails) => {
    const selectedSizeIndex = selectedSizes[product.id!] || 0
    const storeId = selectedStoreId > 0 ? selectedStoreId : product.stocks?.[selectedSizeIndex]?.tienda ?? product.Tienda ?? 0
    addToCart(product, 1, selectedSizeIndex, storeId)
  }

  // Tipos para categorías
  type CategoryType = typeof categories extends (infer T)[] ? T : never

  // Estado para la navegación de categorías
  const [selectedCategory, setSelectedCategory] = useState<number>(1000) // ID de categoría por defecto (todos los productos)
  const [selectedSubcategory, setSelectedSubcategory] = useState<number>(1000) // ID de subcategoría por defecto (todos los productos)
  const [selectedMascotasSubcategoryIds, setSelectedMascotasSubcategoryIds] = useState<number[] | null>(null) // Subcategorías agrupadas en Mascotas
  const [currentTitle, setCurrentTitle] = useState<string>("Todos los productos")
  const [currentBreadcrumbs, setCurrentBreadcrumbs] = useState<string[]>(["Inicio", "Tienda"])

  // Normalizar nombre para agrupar subcategorías (ej: " CONCENTRADO" y "CONCENTRADO" -> mismo grupo)
  const normalizeSubcategoryName = (name: string) =>
    (name || "")
      .trim()
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")

  // Agrupar subcategorías de PERRO y GATO por nombre normalizado
  const getMascotasGroupedSubcategories = () => {
    const perroData = productsByCategory.find(cat => cat.categoryId === 4)
    const gatoData = productsByCategory.find(cat => cat.categoryId === 5)
    const allSubs = [
      ...(perroData?.subcategories || []).map(s => ({ ...s, categoryId: 4 })),
      ...(gatoData?.subcategories || []).map(s => ({ ...s, categoryId: 5 }))
    ]
    const byKey = new Map<string, { displayName: string; subcategoryIds: number[] }>()
    for (const sub of allSubs) {
      const key = normalizeSubcategoryName(sub.subcategoryName)
      const existing = byKey.get(key)
      if (existing) {
        if (!existing.subcategoryIds.includes(sub.subcategoryId)) {
          existing.subcategoryIds.push(sub.subcategoryId)
        }
      } else {
        byKey.set(key, {
          displayName: sub.subcategoryName.trim(),
          subcategoryIds: [sub.subcategoryId]
        })
      }
    }
    return Array.from(byKey.values())
  }

  // Actualizar título cuando hay búsqueda
  useEffect(() => {
    if (searchQueryParam) {
      setCurrentTitle(`Resultados para &quot;${searchQueryParam}&quot;`)
      setCurrentBreadcrumbs(["Inicio", "Tienda", `Búsqueda: &quot;${searchQueryParam}&quot;`])
    }
  }, [searchQueryParam])

  // Función para manejar el cambio de categoría
  const handleCategoryChange = (
    categoryId: number,
    subcategoryId: number,
    mascotasGroup?: { displayName: string; subcategoryIds: number[] }
  ) => {
    // Actualizar estados inmediatamente
    setSelectedCategory(categoryId)
    setSelectedSubcategory(subcategoryId)
    setSelectedMascotasSubcategoryIds(mascotasGroup?.subcategoryIds ?? null)

    // Limpiar búsqueda cuando se cambia de categoría
    setSearchQuery("")
    clearSearchResults()
    clearLiveSearchResults()

    // Limpiar filtros cuando cambia la categoría desde el sidebar
    setSelectedBrand(null)
    setSelectedProductCategory(null)
    setSelectedProductSubcategory(null)
    setShowOnlyOffers(false)
    setShowOnlyDiscounts(false)

    // Manejar categorías especiales
    if (categoryId === CATEGORIES.TODOS_LOS_PRODUCTOS) {
      setCurrentTitle("Todos los productos")
      setCurrentBreadcrumbs(["Inicio", "Tienda"])
      // Actualizar URL sin esperar
      router.push('/tienda')
      return
    }

    if (categoryId === CATEGORIES.NOVEDADES) {
      setCurrentTitle("Novedades")
      setCurrentBreadcrumbs(["Inicio", "Tienda", "Novedades"])
      // Actualizar URL sin esperar
      router.push('/tienda?categoria=998')
      return
    }

    if (categoryId === CATEGORIES.OFERTAS) {
      setCurrentTitle("Productos con descuento")
      setCurrentBreadcrumbs(["Inicio", "Tienda", "Ofertas"])
      // Actualizar URL sin esperar
      router.push('/tienda?categoria=999')
      return
    }

    // Manejar categoría Mascotas (agrupada de PERRO y GATO)
    if (categoryId === CATEGORIES.MASCOTAS) {
      const category = categories.find(cat => cat.id === categoryId)
      if (category) {
        if (subcategoryId === 0 || !mascotasGroup?.subcategoryIds?.length) {
          // Todas las subcategorías de Mascotas
          setCurrentTitle(category.name)
          setCurrentBreadcrumbs(["Inicio", "Tienda", category.name])
          router.push('/tienda?categoria=997')
        } else {
          // Subcategoría agrupada - mostrar productos de PERRO y GATO
          setCurrentTitle(mascotasGroup.displayName)
          setCurrentBreadcrumbs(["Inicio", "Tienda", category.name, mascotasGroup.displayName])
          router.push(`/tienda?categoria=997&subcategoria=${mascotasGroup.subcategoryIds.join(",")}`)
        }
      }
      return
    }

    // Buscar información de la categoría y subcategoría para categorías normales
    const category = categories.find(cat => cat.id === categoryId)
    const categoryData = productsByCategory.find(cat => cat.categoryId === categoryId)
    const subcategoryData = categoryData?.subcategories.find(sub => sub.subcategoryId === subcategoryId)

    if (category && subcategoryData) {
      setCurrentTitle(subcategoryData.subcategoryName)
      setCurrentBreadcrumbs(["Inicio", "Tienda", category.name, subcategoryData.subcategoryName])
      // Actualizar URL sin esperar
      router.push(`/tienda?categoria=${categoryId}&subcategoria=${subcategoryId}`)
    } else if (category) {
      // Solo categoría, sin subcategoría específica
      setCurrentTitle(category.name)
      setCurrentBreadcrumbs(["Inicio", "Tienda", category.name])
      // Actualizar URL sin esperar
      router.push(`/tienda?categoria=${categoryId}`)
    }
  }

  // Función para manejar clics en breadcrumbs
  const handleBreadcrumbClick = (breadcrumbName: string, breadcrumbIndex: number) => {
    // Si se hace clic en "Tienda", mostrar todos los productos
    if (breadcrumbName === "Tienda") {
      handleCategoryChange(CATEGORIES.TODOS_LOS_PRODUCTOS, CATEGORIES.TODOS_LOS_PRODUCTOS)
      return
    }

    // Buscar la categoría por nombre en el array de breadcrumbs
    // El índice en currentBreadcrumbs es: ["Inicio", "Tienda", categoryName, subcategoryName?]
    // breadcrumbIndex 0 = "Inicio", 1 = "Tienda", 2 = categoryName, 3 = subcategoryName
    
    if (breadcrumbIndex === 2) {
      // Es una categoría (ej: "PERRO")
      const category = categories.find(cat => cat.name === breadcrumbName)
      if (category) {
        // Mostrar todos los productos de esa categoría
        handleCategoryChange(category.id, 0)
        return
      }
    } else if (breadcrumbIndex === 3) {
      // Es una subcategoría (ej: "ALIMENTO HÚMEDO")
      const categoryName = currentBreadcrumbs[2]
      const category = categories.find(cat => cat.name === categoryName)
      
      if (category) {
        if (category.id === CATEGORIES.MASCOTAS) {
          const group = getMascotasGroupedSubcategories().find(
            g => normalizeSubcategoryName(g.displayName) === normalizeSubcategoryName(breadcrumbName)
          )
          if (group) {
            handleCategoryChange(CATEGORIES.MASCOTAS, 1, group)
            return
          }
        } else {
          const categoryData = productsByCategory.find(cat => cat.categoryId === category.id)
          if (categoryData) {
            const subcategory = categoryData.subcategories.find(sub => sub.subcategoryName === breadcrumbName)
            if (subcategory) {
              handleCategoryChange(category.id, subcategory.subcategoryId)
              return
            }
          }
        }
      }
    }

    // Manejar casos especiales
    if (breadcrumbName === "Ofertas") {
      handleCategoryChange(CATEGORIES.OFERTAS, CATEGORIES.OFERTAS)
    } else if (breadcrumbName === "Novedades") {
      handleCategoryChange(CATEGORIES.NOVEDADES, CATEGORIES.NOVEDADES)
    }
  }

  // Función para obtener marcas disponibles según la categoría seleccionada
  const getBrandsForCategory = (categoryId: number) => {
    if (categoryId === CATEGORIES.TODOS_LOS_PRODUCTOS) {
      // Para todos los productos, obtener marcas de todos los productos disponibles
      const brandIds = new Set(products.map(p => p.id_marca).filter(Boolean))
      return brands.filter(brand => brandIds.has(brand.id))
    }

    if (categoryId === CATEGORIES.OFERTAS) {
      // Para ofertas, obtener marcas de productos con descuento
      const brandIds = new Set(discountedProducts.map(p => p.id_marca).filter(Boolean))
      return brands.filter(brand => brandIds.has(brand.id))
    }

    if (categoryId === CATEGORIES.NOVEDADES) {
      // Para novedades, obtener marcas de productos nuevos
      const brandIds = new Set(newProducts.map(p => p.id_marca).filter(Boolean))
      return brands.filter(brand => brandIds.has(brand.id))
    }

    // Caso especial: Mascotas (combina PERRO id:4 y GATO id:5)
    if (categoryId === CATEGORIES.MASCOTAS) {
      let mascotasProducts: ProductWithDetails[] = []
      if (!selectedMascotasSubcategoryIds?.length) {
        const productosPerro = getAllProductsByCategory(4) || []
        const productosGato = getAllProductsByCategory(5) || []
        mascotasProducts = [...productosPerro, ...productosGato]
      } else {
        for (const subId of selectedMascotasSubcategoryIds) {
          mascotasProducts.push(...(getProductsBySubcategory(4, subId) || []))
          mascotasProducts.push(...(getProductsBySubcategory(5, subId) || []))
        }
      }
      const brandIds = new Set(mascotasProducts.map(p => p.id_marca).filter(Boolean))
      return brands.filter(brand => brandIds.has(brand.id))
    }

    // Para categorías normales, obtener marcas de productos en la categoría actual
    // Si selectedSubcategory es 0, significa que se seleccionó toda la categoría
    const currentProducts = (selectedSubcategory === 0 && 
      categoryId !== CATEGORIES.TODOS_LOS_PRODUCTOS && 
      categoryId !== CATEGORIES.OFERTAS && 
      categoryId !== CATEGORIES.NOVEDADES)
      ? getAllProductsByCategory(categoryId) || []
      : getProductsBySubcategory(selectedCategory, selectedSubcategory) || []
    const brandIds = new Set(currentProducts.map(p => p.id_marca).filter(Boolean))
    return brands.filter(brand => brandIds.has(brand.id))
  }

  // Función para filtrar productos por marca
  const filterProductsByBrand = (products: ProductWithDetails[]) => {
    if (!selectedBrand) return products
    return products.filter(product => product.id_marca === selectedBrand)
  }

  // Función para obtener el precio de un producto (considera precios[] y stocks[].precio)
  const getProductPrice = (product: ProductWithDetails): number => {
    if (product.precios && Array.isArray(product.precios) && product.precios.length > 0) {
      return product.precios[0]
    }
    if (product.stocks && Array.isArray(product.stocks) && product.stocks.length > 0) {
      return product.stocks[0].precio
    }
    return 0
  }

  // Función para calcular el rango de precios de los productos actuales
  const calculatePriceRange = (products: ProductWithDetails[]): { min: number, max: number } => {
    if (products.length === 0) {
      return { min: 0, max: 1000000 }
    }

    let minPrice = Infinity
    let maxPrice = 0

    products.forEach(product => {
      const price = getProductPrice(product)
      if (price > 0) {
        minPrice = Math.min(minPrice, price)
        maxPrice = Math.max(maxPrice, price)
      }
    })

    // Si no se encontraron precios válidos, usar valores por defecto
    if (minPrice === Infinity) {
      minPrice = 0
    }
    if (maxPrice === 0) {
      maxPrice = 1000000
    }

    return { min: minPrice, max: maxPrice }
  }

  // Función para filtrar productos con filtros avanzados (disponible para todas las categorías)
  const filterProductsByAdvancedFilters = (products: ProductWithDetails[]) => {

    let filteredProducts = [...products]

    // Filtro por tienda: considera Tienda, stocks.tienda y stocks.tiendas (JSONB con varias tiendas)
    if (selectedStoreId > 0) {
      filteredProducts = filteredProducts.filter((product) =>
        productAvailableInStore(product, selectedStoreId)
      )
    }

    // Filtro por rango de precio
    if (priceRange[0] !== priceBounds.min || priceRange[1] !== priceBounds.max) {
      filteredProducts = filteredProducts.filter(product => {
        const price = getProductPrice(product)
        return price >= priceRange[0] && price <= priceRange[1]
      })
    }

    // Filtro para mostrar solo ofertas
    if (showOnlyOffers) {
      filteredProducts = filteredProducts.filter(product => product.destacado === true)
    }

    // Filtro para mostrar solo productos con descuento
    if (showOnlyDiscounts) {
      filteredProducts = filteredProducts.filter(product => product.descuento === true)
    }

    // Filtro por categoría específica
    // En Mascotas (997) mostramos productos de categorías 4 y 5, ignoramos este filtro
    if (selectedProductCategory && selectedCategory !== CATEGORIES.MASCOTAS) {
      filteredProducts = filteredProducts.filter(product => {
        return product.subcategoria?.categories_id === selectedProductCategory
      })
    }

    // Filtro por subcategoría específica (incluye subcategorias_id, subcategorias_id2 y subcategorias_id3)
    if (selectedProductSubcategory) {
      filteredProducts = filteredProducts.filter(product => {
        return product.subcategorias_id === selectedProductSubcategory ||
               product.subcategorias_id2 === selectedProductSubcategory ||
               product.subcategorias_id3 === selectedProductSubcategory
      })
    }

    return filteredProducts
  }

  // Función para ordenar productos
  const sortProducts = (products: ProductWithDetails[]) => {
    const sortedProducts = [...products]

    switch (sortBy) {
      case "Precio: menor a mayor":
        return sortedProducts.sort((a, b) => {
          const priceA = getProductPrice(a)
          const priceB = getProductPrice(b)
          return priceA - priceB
        })
      case "Precio: mayor a menor":
        return sortedProducts.sort((a, b) => {
          const priceA = getProductPrice(a)
          const priceB = getProductPrice(b)
          return priceB - priceA
        })
      case "Nombre A-Z":
        return sortedProducts.sort((a, b) => a.nombre.localeCompare(b.nombre))
      case "Novedades":
        return sortedProducts.sort((a, b) => {
          // Ordenar por productos nuevos primero, luego por fecha de creación si está disponible
          if (a.novedad && !b.novedad) return -1
          if (!a.novedad && b.novedad) return 1
          return 0
        })
      case "Más popular":
      default:
        // Para popular, mantenemos el orden original por ahora
        // En el futuro podríamos implementar lógica basada en ventas o ratings
        return sortedProducts
    }
  }

  // Obtener productos actuales
  // Si selectedSubcategory es 0, significa que se seleccionó toda la categoría
  // Solo aplicar esta lógica para categorías normales (no especiales)
  const currentProducts = (() => {
    // Caso especial: Mascotas (combina PERRO id:4 y GATO id:5)
    if (selectedCategory === CATEGORIES.MASCOTAS) {
      if (!selectedMascotasSubcategoryIds?.length) {
        // Todas las subcategorías de Mascotas (combinar PERRO y GATO)
        const productosPerro = getAllProductsByCategory(4) || []
        const productosGato = getAllProductsByCategory(5) || []
        const allProducts = [...productosPerro, ...productosGato]
        return Array.from(new Map(allProducts.map(product => [product.id, product])).values())
      }
      // Subcategoría agrupada - productos de todas las subcategorías del grupo (PERRO y GATO)
      const allProducts: ProductWithDetails[] = []
      for (const subId of selectedMascotasSubcategoryIds) {
        const fromPerro = getProductsBySubcategory(4, subId) || []
        const fromGato = getProductsBySubcategory(5, subId) || []
        allProducts.push(...fromPerro, ...fromGato)
      }
      return Array.from(new Map(allProducts.map(product => [product.id, product])).values())
    }
    
    // Categorías normales
    if (selectedSubcategory === 0 && 
      selectedCategory !== CATEGORIES.TODOS_LOS_PRODUCTOS && 
      selectedCategory !== CATEGORIES.OFERTAS && 
      selectedCategory !== CATEGORIES.NOVEDADES) {
      return getAllProductsByCategory(selectedCategory) || []
    }
    
    return getProductsBySubcategory(selectedCategory, selectedSubcategory) || []
  })()

  // Determinar qué productos mostrar según la categoría seleccionada o búsqueda
  let baseProducts = selectedCategory === CATEGORIES.TODOS_LOS_PRODUCTOS
    ? products // Todos los productos disponibles
    : selectedCategory === CATEGORIES.OFERTAS
    ? discountedProducts
    : selectedCategory === CATEGORIES.NOVEDADES
    ? newProducts
    : selectedCategory === CATEGORIES.MASCOTAS
    ? currentProducts // Mascotas ya está manejado en currentProducts
    : currentProducts.length > 0
    ? currentProducts
    : featuredProducts

  // Si hay resultados de búsqueda y hay una búsqueda activa, mostrar esos en lugar de los productos normales
  if ((searchQueryParam || searchQuery.trim()) && (searchResults.length > 0 || isSearching)) {
    baseProducts = searchResults.length > 0 ? searchResults : []
  }

  // Calcular el rango de precios de los productos base usando useMemo
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const priceBounds = useMemo(() => {
    return calculatePriceRange(baseProducts)
  }, [baseProducts])

  // Estado para el rango de precio del slider
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000])

  // Actualizar el rango del slider cuando cambie el rango de precios calculado
  useEffect(() => {
    const newMin = Math.max(0, priceBounds.min)
    const newMax = Math.max(newMin + 1000, priceBounds.max) // Asegurar que max sea al menos 1000 más que min

    setPriceRange([newMin, newMax])
  }, [priceBounds.min, priceBounds.max])

  // ✅ OPTIMIZACIÓN: Memoizar cálculo costoso de productos filtrados
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const displayProducts = useMemo(() => {
    let result = baseProducts

    // Aplicar filtro de marca si está seleccionado
    result = filterProductsByBrand(result)

    // Aplicar filtros avanzados para todas las categorías
    result = filterProductsByAdvancedFilters(result)

    // Aplicar ordenamiento
    result = sortProducts(result)

    // Filtrar tamano, precios y stocks por tienda seleccionada para evitar info mezclada
    if (selectedStoreId > 0) {
      result = result.map((p) => filterProductDataByStore(p, selectedStoreId))
    }

    return result
  }, [
    baseProducts,
    selectedBrand,
    selectedCategory,
    priceRange,
    showOnlyOffers,
    showOnlyDiscounts,
    selectedProductCategory,
    selectedProductSubcategory,
    sortBy,
    selectedStoreId
  ])

  // Reiniciar el conteo visible cuando cambie el conjunto de productos
  useEffect(() => {
    if (displayProducts.length === 0) {
      setVisibleProductCount(0)
      return
    }

    const initial = Math.min(PRODUCTS_PER_BATCH, displayProducts.length)
    setVisibleProductCount(initial)
  }, [displayProducts.length, PRODUCTS_PER_BATCH])

  // Efecto para actualizar marcas disponibles cuando cambia la categoría
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const brandsForCurrentCategory = getBrandsForCategory(selectedCategory)
    setAvailableBrands(brandsForCurrentCategory)
    // Resetear marca seleccionada si ya no está disponible en la nueva categoría
    if (selectedBrand && !brandsForCurrentCategory.find(b => b.id === selectedBrand)) {
      setSelectedBrand(null)
    }

    // Los filtros avanzados ahora están disponibles para todas las categorías
    // No necesitamos limpiar filtros avanzados cuando cambia la categoría
  }, [selectedCategory, selectedSubcategory, products, discountedProducts, newProducts])

  // Efecto para limpiar filtros avanzados cuando cambia la categoría desde el sidebar
  useEffect(() => {
    // Cuando estamos en una categoría específica (Mascotas, Ofertas, Novedades u otra), limpiar filtros avanzados
    // para que se muestren todos los productos de esa categoría (en Mascotas = categorías 4 y 5)
    if (selectedCategory !== CATEGORIES.TODOS_LOS_PRODUCTOS) {
      setSelectedProductCategory(null)
      setSelectedProductSubcategory(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory])

  // Cargar tiendas al montar el componente
  useEffect(() => {
    const cargarTiendas = async () => {
      try {
        const stores = await loadStoresFromSupabase()
        setTiendas(stores)
      } catch (error) {
        console.error('Error cargando tiendas:', error)
      }
    }
    cargarTiendas()
  }, [])

  // Función para limpiar filtros básicos
  const clearFilters = () => {
    setSelectedBrand(null)
  }

  // Función para limpiar filtros avanzados
  const clearAdvancedFilters = () => {
    // Resetear al rango completo de precios disponibles
    const newMin = Math.max(0, priceBounds.min)
    const newMax = Math.max(newMin + 1000, priceBounds.max)
    setPriceRange([newMin, newMax])
    setShowOnlyOffers(false)
    setShowOnlyDiscounts(false)
    setSelectedProductCategory(null)
    setSelectedProductSubcategory(null)
    setSortBy("Más popular")
    setSelectedBrand(null) // También limpiar la marca seleccionada
  }

  // Función para limpiar todos los filtros
  const clearAllFilters = () => {
    clearFilters()
    clearAdvancedFilters()
  }

  // Función para generar categorías dinámicamente
  const renderDynamicCategories = () => {
    // Filtrar PERRO (id:4) y GATO (id:5) y crear entrada especial para Mascotas
    const filteredCategories = productsByCategory.filter(cat => cat.categoryId !== 4 && cat.categoryId !== 5)
    
    const mascotasGroups = getMascotasGroupedSubcategories()
    
    const mascotasCategoryData = {
      categoryId: CATEGORIES.MASCOTAS,
      categoryName: "Mascotas",
      groupedSubcategories: mascotasGroups,
      subcategories: [] as Array<{ subcategoryId: number; subcategoryName: string }>
    }
    
    // Combinar todas las categorías (filtradas + Mascotas)
    const allCategories = [mascotasCategoryData, ...filteredCategories]
    
    return allCategories.map((categoryData) => {
      const category = categories.find(cat => cat.id === categoryData.categoryId)
      if (!category) return null

      const isMascotas = categoryData.categoryId === CATEGORIES.MASCOTAS

      return (
        <div key={categoryData.categoryId} className="mb-5">
          <button
            onClick={() => handleCategoryChange(categoryData.categoryId, 0)}
            className={`w-full text-left text-xs font-medium uppercase tracking-wider mb-2 transition-all duration-200 ${
              selectedCategory === categoryData.categoryId && 
              (isMascotas ? !selectedMascotasSubcategoryIds : selectedSubcategory === 0)
                ? "text-[#196428] font-semibold"
                : "text-gray-500 hover:text-[#196428] cursor-pointer"
            }`}
          >
            {category.name}
          </button>
          <div className="space-y-1">
            {isMascotas
              ? mascotasGroups.map((group) => {
                  const isSelected = selectedCategory === CATEGORIES.MASCOTAS &&
                    selectedMascotasSubcategoryIds &&
                    selectedMascotasSubcategoryIds.length === group.subcategoryIds.length &&
                    selectedMascotasSubcategoryIds.every((id, i) => id === group.subcategoryIds[i])
                  return (
                    <button
                      key={group.displayName + group.subcategoryIds.join("-")}
                      onClick={() => handleCategoryChange(CATEGORIES.MASCOTAS, 1, group)}
                      className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg transition-all duration-200 ${
                        isSelected
                          ? "text-[#196428] font-medium bg-[#196428]/5"
                          : "text-gray-700 hover:text-[#196428] hover:bg-gray-50"
                      }`}
                    >
                      <span className="lowercase">{group.displayName}</span>
                    </button>
                  )
                })
              : (categoryData as { subcategories: Array<{ subcategoryId: number; subcategoryName: string }> }).subcategories?.map((subcategory) => (
                <button
                  key={subcategory.subcategoryId}
                  onClick={() => handleCategoryChange(categoryData.categoryId, subcategory.subcategoryId)}
                  className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg transition-all duration-200 ${
                    selectedCategory === categoryData.categoryId && selectedSubcategory === subcategory.subcategoryId
                      ? "text-[#196428] font-medium bg-[#196428]/5"
                      : "text-gray-700 hover:text-[#196428] hover:bg-gray-50"
                  }`}
                >
                  <span className="lowercase">{subcategory.subcategoryName}</span>
                </button>
              ))}
            {/* Subcategorías especiales por categoría: Ofertas y Novedades (excluye Tienda, Ofertas, Especiales) */}
            {(() => {
              const lowerName = (category.name || '').toLowerCase();
              const isExcluded = lowerName === 'tienda' || lowerName === 'ofertas' || lowerName === 'especiales';
              if (isExcluded) return null;
              return (
                <>
                  <button
                    onClick={() => handleCategoryChange(CATEGORIES.OFERTAS, CATEGORIES.OFERTAS)}
                    className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg transition-all duration-200 ${
                      selectedCategory === CATEGORIES.OFERTAS && selectedSubcategory === CATEGORIES.OFERTAS
                        ? "text-[#196428] font-medium bg-[#196428]/5"
                        : "text-gray-700 hover:text-[#196428] hover:bg-gray-50"
                    }`}
                  >
                    <span className="lowercase">Ofertas</span>
                  </button>
                  <button
                    onClick={() => handleCategoryChange(CATEGORIES.NOVEDADES, CATEGORIES.NOVEDADES)}
                    className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg transition-all duration-200 ${
                      selectedCategory === CATEGORIES.NOVEDADES && selectedSubcategory === CATEGORIES.NOVEDADES
                        ? "text-[#196428] font-medium bg-[#196428]/5"
                        : "text-gray-700 hover:text-[#196428] hover:bg-gray-50"
                    }`}
                  >
                    <span className="lowercase">Novedades</span>
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      )
    })
  }

  // Efecto para los carruseles de las cards
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCardSlide(current => (current + 1) % 3);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((current) => (current === 3 ? 0 : current + 1));
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const brandTimer = setInterval(() => {
      setActiveBrandSlide(current => (current + 1) % 2); // Asumiendo 2 slides de 4 marcas cada uno
    }, 5000);

    return () => clearInterval(brandTimer);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      try {
        await searchProducts(searchQuery.trim())
        // Si estamos en la página de tienda, la búsqueda se maneja internamente
        // No necesitamos navegar a una nueva página
      } catch (error) {
        console.error("Error en la búsqueda:", error)
      }
    }
  }

  // Funciones para manejar el autocompletado
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    updateLiveSearchQuery(value)

    // Mostrar autocompletado si hay texto
    if (value.trim()) {
      setIsAutocompleteOpen(true)
    } else {
      setIsAutocompleteOpen(false)
    }
  }

  const handleSearchInputFocus = () => {
    if (searchQuery.trim()) {
      setIsAutocompleteOpen(true)
    }
  }

  const handleSearchInputBlur = () => {
    // Pequeño delay para permitir clicks en el autocompletado
    setTimeout(() => {
      setIsAutocompleteOpen(false)
    }, 200)
  }

  const handleCloseAutocomplete = () => {
    setIsAutocompleteOpen(false)
  }

  const handleSelectProduct = (product: ProductWithDetails) => {
    setSearchQuery(product.nombre)
    updateLiveSearchQuery(product.nombre)
    // En la página de tienda, buscar el producto internamente
    searchProducts(product.nombre)
    setIsAutocompleteOpen(false)
  }

  // Crear categorías con datos reales de Supabase
  const processedCategories = categories.map(category => ({
    name: category.name,
    href: category.href,
    subcategories: category.subcategories?.map(sub => ({
      name: sub.name,
      href: sub.href
    })) || [],
    promotions: category.promotions || [],
    brands: category.brands || [],
    bannerImage: category.bannerImage || { src: "/placeholder.jpg", alt: category.name, href: "#" }
  }));

  const productImages = [
    "/cap1.png",
    "/cap2.png",
    "/cap3.png",
    "/cap4.png",
    "/cap1-2.png",
    "/cap2-2.png",
    "/cap3-2.png",
    "/cap4-2.png",
    "/cap1-3.png",
    "/cap2-3.png",
    "/cap3-3.png",
    "/cap4-3.png",
  ];

  // Los productos destacados vienen del hook useProducts (ya se obtiene desde el hook)

  // Brand carousel logic removed - now using dynamic brands from useProducts hook

  const totalProductSlides = Math.ceil(featuredProducts.length / 4);

  const nextProductSlide = () => {
    setActiveProductSlide((current) => (current + 1) % totalProductSlides);
  };

  const prevProductSlide = () => {
    setActiveProductSlide((current) => (current - 1 + totalProductSlides) % totalProductSlides);
  };


  const navLinks = [
    { name: "Inicio", icon: HomeIcon, href: "/" },
    { name: "Tienda", icon: ShoppingBag, href: "/tienda" },
    { name: "Carrito", icon: ShoppingCart, href: "/carrito" },
    { name: "Cuenta", icon: User, href: "#" },
    { name: "Info", icon: Info, href: "/contacto" },
    { name: "Vacantes", icon: Briefcase, href: "/vacantes" },
    { name: "Tiendas", icon: MapPin, href: "#nuestras-tiendas" },
  ];

  // Account Popover Content Component
  const AccountContent = () => (
    <div className="w-[200px] xs:w-[220px] sm:w-[240px] md:w-[260px] lg:w-[280px] xl:w-[300px] space-y-2 xs:space-y-2.5 sm:space-y-3 md:space-y-3 lg:space-y-4 xl:space-y-5 bg-white p-2 xs:p-2.5 sm:p-3 md:p-3.5 lg:p-4 xl:p-5 rounded-lg max-h-[80vh] overflow-y-auto border border-gray-200/60 shadow-sm">
      {/* Ya soy cliente */}
      <div>

        <form className="space-y-2 md:space-y-2.5" onSubmit={(e) => e.preventDefault()}>
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-2.5 md:px-3 py-1.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#196428] bg-white text-xs md:text-sm"
            />
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-2.5 md:px-3 py-1.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-[#196428] bg-white text-xs md:text-sm pr-8"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 md:right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="h-3.5 w-3.5 md:h-4 md:w-4" /> : <Eye className="h-3.5 w-3.5 md:h-4 md:w-4" />}
            </button>
          </div>
          <button
            type="submit"
            className="w-full bg-[#196428] hover:bg-[#145020] text-white font-semibold py-1.5 rounded-full transition-colors text-xs md:text-sm"
          >
            Iniciar sesión
          </button>
        </form>
        <div className="mt-2 md:mt-2.5 text-center">
          <a href="#" className="text-[#196428] hover:underline text-[9px] md:text-xs font-medium">
            Olvidé mi contraseña
          </a>
        </div>
        <div className="mt-2 md:mt-2.5 text-[8px] md:text-[10px] text-gray-600 text-center leading-tight">
          Protegido por reCAPTCHA - <a href="#" className="underline">Privacidad</a> y{' '}
          <a href="#" className="underline">Condiciones</a>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-300"></div>

      {/* Nuevo aquí */}
      <div>
        <h2 className="text-[10px] xs:text-xs sm:text-sm md:text-sm lg:text-base font-bold text-gray-800 mb-1.5 md:mb-2">
          ¿Nuevo aquí?
        </h2>
        <p className="text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs text-gray-700 mb-1.5 md:mb-2">
          ¡Disfruta de beneficios exclusivos!
        </p>
        <ul className="space-y-1 md:space-y-1.5 mb-2 md:mb-3">
          <li className="flex items-start gap-1.5 md:gap-2">
            <Check className="h-3 w-3 md:h-3.5 md:w-3.5 text-[#196428] flex-shrink-0 mt-0.5" />
            <span className="text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs text-gray-700 leading-tight">
              Compras más <span className="font-bold">rápidas</span>
            </span>
          </li>
          <li className="flex items-start gap-1.5 md:gap-2">
            <Check className="h-3 w-3 md:h-3.5 md:w-3.5 text-[#196428] flex-shrink-0 mt-0.5" />
            <span className="text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs text-gray-700 leading-tight">
              <span className="font-bold">Historial</span> de pedidos
            </span>
          </li>
          <li className="flex items-start gap-1.5 md:gap-2">
            <Check className="h-3 w-3 md:h-3.5 md:w-3.5 text-[#196428] flex-shrink-0 mt-0.5" />
            <span className="text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs text-gray-700 leading-tight">
              <span className="font-bold">Descuentos</span> exclusivos
            </span>
          </li>
          <li className="flex items-start gap-1.5 md:gap-2">
            <Check className="h-3 w-3 md:h-3.5 md:w-3.5 text-[#196428] flex-shrink-0 mt-0.5" />
            <span className="text-[8px] xs:text-[9px] sm:text-[10px] md:text-xs text-gray-700 leading-tight">
              <span className="font-bold">Lista</span> de deseos
            </span>
          </li>
        </ul>
        <button
          type="button"
          className="w-full bg-[#196428] hover:bg-[#145020] text-white font-semibold py-1.5 md:py-2 rounded-full transition-colors text-[9px] xs:text-[10px] sm:text-xs md:text-xs"
        >
          Regístrate ahora
        </button>
      </div>
    </div>
  );

  return (
    <MainLayout>
      <div className="min-h-screen" style={{ backgroundColor: '#ffffff' }}>
        <Header
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={handleSearch}
          onAccountClick={() => setIsAccountDrawerOpen(true)}
        />

        <main>
          {/* Main content with sidebar and products */}
          <section className="py-4 md:py-8" style={{ backgroundColor: '#ffffff' }}>
            <div className="container mx-auto px-4">
              <div className="flex gap-4 md:gap-8">
                {/* Sidebar with categories - Hidden on mobile, shown on tablet and desktop */}
                <aside className="hidden md:block md:w-56 lg:w-64 flex-shrink-0">
                  <div className="bg-white rounded-xl p-4 md:p-5 border border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-900 mb-5 tracking-tight">Categorías</h2>

                    <div className="space-y-5">
                      {/* Selector de tienda */}
                      <div>
                        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Selecciona tu tienda</h3>
                        <select
                          value={selectedStoreId}
                          onChange={(e) => setSelectedStoreId(Number(e.target.value))}
                          className="w-full text-xs py-1.5 px-2.5 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#196428] focus:border-[#196428] transition-all cursor-pointer"
                          aria-label="Selecciona la tienda para ver productos disponibles"
                        >
                          {tiendas.length === 0 ? (
                            <option value={0}>Cargando tiendas...</option>
                          ) : (
                            <>
                              <option value={0}>Todas las tiendas</option>
                              {tiendas.map((tienda) => (
                                <option key={tienda.id} value={tienda.id}>
                                  {tienda.name} — {tienda.city}
                                </option>
                              ))}
                            </>
                          )}
                        </select>
                      </div>

                      {/* Todos los productos section */}
                      <div>
                        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Categorías</h3>
                        <button
                          onClick={() => handleCategoryChange(CATEGORIES.TODOS_LOS_PRODUCTOS, CATEGORIES.TODOS_LOS_PRODUCTOS)}
                          className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg transition-all duration-200 ${
                            selectedCategory === CATEGORIES.TODOS_LOS_PRODUCTOS && selectedSubcategory === CATEGORIES.TODOS_LOS_PRODUCTOS
                              ? "text-[#196428] font-medium bg-[#196428]/5"
                              : "text-gray-700 hover:text-[#196428] hover:bg-gray-50"
                          }`}
                        >
                          <span className="lowercase">Todos los productos</span>
                        </button>
                      </div>

                      {/* Ofertas section */}
                      <div>
                        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Ofertas</h3>
                        <button
                          onClick={() => handleCategoryChange(CATEGORIES.OFERTAS, CATEGORIES.OFERTAS)}
                          className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg transition-all duration-200 ${
                            selectedCategory === CATEGORIES.OFERTAS && selectedSubcategory === CATEGORIES.OFERTAS
                              ? "text-[#196428] font-medium bg-[#196428]/5"
                              : "text-gray-700 hover:text-[#196428] hover:bg-gray-50"
                          }`}
                        >
                          <span className="lowercase">Productos con descuento</span>
                        </button>
                      </div>

                      {/* Categorías dinámicas desde Supabase */}
                      {renderDynamicCategories()}

                      {/* Special sections */}
                      <div>
                        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Especiales</h3>
                        <div className="space-y-1">
                          <button
                            onClick={() => handleCategoryChange(CATEGORIES.OFERTAS, CATEGORIES.OFERTAS)}
                            className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg transition-all duration-200 ${
                              selectedCategory === CATEGORIES.OFERTAS && selectedSubcategory === CATEGORIES.OFERTAS
                                ? "text-[#196428] font-medium bg-[#196428]/5"
                                : "text-gray-700 hover:text-[#196428] hover:bg-gray-50"
                            }`}
                          >
                            <span className="lowercase">Ofertas</span>
                          </button>
                          <button
                            onClick={() => handleCategoryChange(CATEGORIES.NOVEDADES, CATEGORIES.NOVEDADES)}
                            className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg transition-all duration-200 ${
                              selectedCategory === CATEGORIES.NOVEDADES && selectedSubcategory === CATEGORIES.NOVEDADES
                                ? "text-[#196428] font-medium bg-[#196428]/5"
                                : "text-gray-700 hover:text-[#196428] hover:bg-gray-50"
                            }`}
                          >
                            <span className="lowercase">Novedades</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </aside>

                {/* Main content area */}
                <div className="flex-1">
                  {/* Mobile Navigation Buttons */}
                  <div className="md:hidden mb-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsCategoriesDrawerOpen(true)}
                        className="flex items-center justify-center gap-2 bg-white px-4 py-2.5 rounded-lg border border-gray-200 flex-1 hover:border-gray-300 hover:bg-gray-50 transition-all text-sm font-medium text-gray-700"
                      >
                        <Menu className="h-4 w-4" />
                        <span>Categorías</span>
                      </button>
                      <button 
                        onClick={() => setIsFiltersDrawerOpen(true)}
                        className="flex items-center justify-center gap-2 bg-[#196428] px-4 py-2.5 rounded-lg text-white flex-1 hover:bg-[#145020] transition-all text-sm font-medium"
                      >
                        <Tag className="h-4 w-4" />
                        <span>Filtros</span>
                      </button>
                    </div>
                  </div>

                  {/* Loading and Error States */}
                  {(categoriesLoading || productsLoading) && (
                    <div className="flex justify-center items-center py-20">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#196428] mx-auto mb-4"></div>
                        <p className="text-gray-600">Cargando productos...</p>
                      </div>
                    </div>
                  )}

                  {(categoriesError || productsError) && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                      <p className="text-red-800">
                        Error: {categoriesError || productsError}
                      </p>
                    </div>
                  )}

                  {/* Title */}
                  <div className="mb-6">
                    {/* Breadcrumbs - Estilo página de producto */}
                    <div className="bg-white border-b border-gray-200 mb-6">
                      <div className="container mx-auto px-4 py-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Link href="/" className="text-gray-600 hover:text-[#196428]">Inicio</Link>
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                          <button
                            onClick={() => handleBreadcrumbClick("Tienda", 1)}
                            className="text-gray-600 hover:text-[#196428] cursor-pointer"
                          >
                            Tienda
                          </button>
                          {currentBreadcrumbs.slice(2).map((breadcrumb, index) => {
                            const isLast = index === currentBreadcrumbs.slice(2).length - 1;
                            const breadcrumbIndex = index + 2; // +2 porque los primeros dos son "Inicio" y "Tienda"

                            return (
                              <div key={index} className="flex items-center gap-2">
                                <ChevronRight className="h-4 w-4 text-gray-400" />
                                {isLast ? (
                                  <span className="text-gray-800 font-medium">{breadcrumb}</span>
                                ) : (
                                  <button
                                    onClick={() => handleBreadcrumbClick(breadcrumb, breadcrumbIndex)}
                                    className="text-gray-600 hover:text-[#196428] cursor-pointer"
                                  >
                                    {breadcrumb}
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <h1 className="text-3xl font-black text-black">{currentTitle}</h1>
                    <p className="text-sm text-gray-600 mt-1">
                      {isSearching ? (
                        <span className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#196428]"></div>
                          Buscando productos...
                        </span>
                      ) : (
                        <>
                          {displayProducts.length} producto{displayProducts.length !== 1 ? 's' : ''} encontrado{displayProducts.length !== 1 ? 's' : ''}
                          {selectedBrand && (
                            <span className="ml-2">
                              • Filtrado por: <span className="font-medium text-[#196428]">
                                {brands.find(b => b.id === selectedBrand)?.nombre_marca}
                              </span>
                            </span>
                          )}
                        </>
                      )}
                    </p>
                  </div>

                  {/* Filters - responsive layout */}
                  <div className="mb-6 md:mb-8">

                    {/* Mobile Filters Drawer */}
                    <Drawer open={isFiltersDrawerOpen} onOpenChange={setIsFiltersDrawerOpen}>
                      <DrawerContent className="max-h-[90vh]">
                        <DrawerHeader className="border-b border-gray-100 pb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-[#196428]/10 rounded-lg">
                                <Tag className="w-4 h-4 text-[#196428]" />
                              </div>
                              <DrawerTitle className="text-base font-semibold text-gray-800">Filtros</DrawerTitle>
                            </div>
                            {(() => {
                              const hasPriceFilter = Math.abs(priceRange[0] - priceBounds.min) > 10 || Math.abs(priceRange[1] - priceBounds.max) > 10
                              const hasAdvancedFilter = hasPriceFilter || showOnlyOffers || showOnlyDiscounts || selectedBrand || 
                                (selectedCategory === CATEGORIES.TODOS_LOS_PRODUCTOS && (selectedProductCategory || selectedProductSubcategory))
                              return hasAdvancedFilter
                            })() && (
                              <button
                                onClick={clearAdvancedFilters}
                                className="text-xs font-medium text-[#196428] hover:text-[#145020] transition-colors px-2 py-1 rounded-md hover:bg-[#196428]/5"
                              >
                                Limpiar todo
                              </button>
                            )}
                          </div>
                        </DrawerHeader>
                        <div className="overflow-y-auto px-4 py-5">
                          <div className="flex flex-col gap-5">
                            {/* Sección de Marca */}
                            <div className="space-y-2.5">
                              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-[#196428]"></span>
                                Marca
                              </label>
                              <div className="relative">
                                {availableBrands.length > 0 && (
                                  <select
                                    value={selectedBrand || ""}
                                    onChange={(e) => setSelectedBrand(e.target.value ? parseInt(e.target.value) : null)}
                                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#196428]/20 focus:border-[#196428] transition-all appearance-none hover:border-gray-300 hover:bg-white shadow-sm"
                                  >
                                    <option value="">Todas las marcas</option>
                                    {availableBrands.map(brand => (
                                      <option key={brand.id} value={brand.id}>
                                        {brand.nombre_marca}
                                      </option>
                                    ))}
                                  </select>
                                )}
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </div>
                            </div>

                            {/* Sección de Precio */}
                            <div className="space-y-3">
                              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-[#196428]"></span>
                                Precio
                              </label>
                              <div className="space-y-2.5 bg-gray-50 rounded-lg p-3 border border-gray-100">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs font-medium text-gray-500">Desde</span>
                                    <span className="text-sm font-semibold text-[#196428]">${priceRange[0].toLocaleString('es-CO')}</span>
                                  </div>
                                  <div className="w-px h-4 bg-gray-300"></div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs font-medium text-gray-500">Hasta</span>
                                    <span className="text-sm font-semibold text-[#196428]">${priceRange[1].toLocaleString('es-CO')}</span>
                                  </div>
                                </div>
                                <div className="px-1">
                                  <Slider
                                    value={priceRange}
                                    onValueChange={(value) => setPriceRange(value as [number, number])}
                                    max={priceBounds.max}
                                    min={priceBounds.min}
                                    step={1000}
                                    className="w-full"
                                  />
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
                                  <span>${priceBounds.min.toLocaleString('es-CO')}</span>
                                  <span>${priceBounds.max.toLocaleString('es-CO')}</span>
                                </div>
                              </div>
                            </div>

                            {/* Sección de Categorías y Subcategorías (solo para "todos los productos") */}
                            {selectedCategory === CATEGORIES.TODOS_LOS_PRODUCTOS && (
                              <>
                                <div className="space-y-2.5">
                                  <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-[#196428]"></span>
                                    Categoría
                                  </label>
                                  <div className="relative">
                                    <select
                                      value={selectedProductCategory || ""}
                                      onChange={(e) => {
                                        const categoryId = e.target.value ? Number(e.target.value) : null
                                        setSelectedProductCategory(categoryId)
                                        setSelectedProductSubcategory(null)
                                      }}
                                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#196428]/20 focus:border-[#196428] transition-all appearance-none hover:border-gray-300 hover:bg-white shadow-sm"
                                    >
                                      <option value="">Todas las categorías</option>
                                      {categories.map((cat: CategoryType) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                      ))}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                      </svg>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-2.5">
                                  <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-[#196428]"></span>
                                    Subcategoría
                                  </label>
                                  <div className="relative">
                                    <select
                                      value={selectedProductSubcategory || ""}
                                      onChange={(e) => {
                                        const subcategoryId = e.target.value ? Number(e.target.value) : null
                                        setSelectedProductSubcategory(subcategoryId)
                                      }}
                                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#196428]/20 focus:border-[#196428] transition-all appearance-none hover:border-gray-300 hover:bg-white shadow-sm"
                                    >
                                      <option value="">Todas las subcategorías</option>
                                      {(() => {
                                        if (selectedProductCategory) {
                                          const categoryData = productsByCategory.find(cat => cat.categoryId === selectedProductCategory)
                                          if (categoryData) {
                                            return categoryData.subcategories.map(sub => (
                                              <option key={sub.subcategoryId} value={sub.subcategoryId}>{sub.subcategoryName}</option>
                                            ))
                                          }
                                        }
                                        return productsByCategory.map(cat =>
                                          cat.subcategories.map(sub => (
                                            <option key={sub.subcategoryId} value={sub.subcategoryId}>{sub.subcategoryName}</option>
                                          ))
                                        )
                                      })()}
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                      </svg>
                                    </div>
                                  </div>
                                </div>
                              </>
                            )}

                            {/* Sección de Filtros Especiales */}
                            <div className="space-y-2.5">
                              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-[#196428]"></span>
                                Especiales
                              </label>
                              <div className="relative">
                                <select
                                  value={
                                    showOnlyOffers ? "ofertas" : 
                                    showOnlyDiscounts ? "descuentos" : 
                                    "ninguno"
                                  }
                                  onChange={(e) => {
                                    const value = e.target.value
                                    setShowOnlyOffers(value === "ofertas")
                                    setShowOnlyDiscounts(value === "descuentos")
                                  }}
                                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#196428]/20 focus:border-[#196428] transition-all appearance-none hover:border-gray-300 hover:bg-white shadow-sm"
                                >
                                  <option value="ninguno">Sin filtro especial</option>
                                  <option value="ofertas">Solo ofertas</option>
                                  <option value="descuentos">Solo descuentos</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </div>
                            </div>

                            {/* Sección de Ordenamiento */}
                            <div className="space-y-2.5">
                              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-[#196428]"></span>
                                Ordenar por
                              </label>
                              <div className="relative">
                                <select
                                  value={sortBy}
                                  onChange={(e) => setSortBy(e.target.value)}
                                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#196428]/20 focus:border-[#196428] transition-all appearance-none hover:border-gray-300 hover:bg-white shadow-sm"
                                >
                                  <option value="Más popular">Más popular</option>
                                  <option value="Precio: menor a mayor">Precio: menor a mayor</option>
                                  <option value="Precio: mayor a menor">Precio: mayor a menor</option>
                                  <option value="Novedades">Novedades</option>
                                  <option value="Nombre A-Z">Nombre A-Z</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <DrawerFooter className="border-t border-gray-100 pt-4 pb-4">
                          <DrawerClose asChild>
                            <button className="w-full bg-gradient-to-r from-[#196428] to-[#145020] text-white px-4 py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-all shadow-md hover:shadow-lg">
                              Aplicar filtros
                            </button>
                          </DrawerClose>
                        </DrawerFooter>
                      </DrawerContent>
                    </Drawer>

                    {/* Desktop/Tablet Filters */}
                    <div className="hidden md:block bg-white rounded-xl border border-gray-200 shadow-sm p-3">
                      <div className="flex flex-col gap-2.5">
                        {/* Header mejorado */}
                        <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
                          <div className="flex items-center gap-1.5">
                            <div className="p-1 bg-[#196428]/10 rounded">
                              <Tag className="w-3 h-3 text-[#196428]" />
                            </div>
                            <h3 className="text-xs font-semibold text-gray-800">Filtros</h3>
                          </div>
                          {(() => {
                            const hasPriceFilter = Math.abs(priceRange[0] - priceBounds.min) > 10 || Math.abs(priceRange[1] - priceBounds.max) > 10
                            const hasAdvancedFilter = hasPriceFilter || showOnlyOffers || showOnlyDiscounts || selectedBrand || 
                              (selectedCategory === CATEGORIES.TODOS_LOS_PRODUCTOS && (selectedProductCategory || selectedProductSubcategory))
                            return hasAdvancedFilter
                          })() && (
                            <button
                              onClick={clearAdvancedFilters}
                              className="text-[10px] font-medium text-[#196428] hover:text-[#145020] transition-colors px-1.5 py-0.5 rounded hover:bg-[#196428]/5"
                            >
                              Limpiar
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-2.5">
                          {/* Fila 1 - Columna 1: Marca */}
                          <div className="space-y-1 flex flex-col">
                            <label className="text-[10px] font-semibold text-gray-700 flex items-center gap-1">
                              <span className="w-0.5 h-0.5 rounded-full bg-[#196428]"></span>
                              Marca
                            </label>
                            <div className="relative">
                              {availableBrands.length > 0 && (
                                <select
                                  value={selectedBrand || ""}
                                  onChange={(e) => setSelectedBrand(e.target.value ? parseInt(e.target.value) : null)}
                                  className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-[11px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#196428]/20 focus:border-[#196428] transition-all appearance-none hover:border-gray-300 hover:bg-white"
                                >
                                  <option value="">Todas</option>
                                  {availableBrands.map(brand => (
                                    <option key={brand.id} value={brand.id}>
                                      {brand.nombre_marca}
                                    </option>
                                  ))}
                                </select>
                              )}
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                          </div>

                          {/* Fila 1 - Columna 2: Subcategoría */}
                          {selectedCategory === CATEGORIES.TODOS_LOS_PRODUCTOS ? (
                            <div className="space-y-1 flex flex-col">
                              <label className="text-[10px] font-semibold text-gray-700 flex items-center gap-1">
                                <span className="w-0.5 h-0.5 rounded-full bg-[#196428]"></span>
                                Subcategoría
                              </label>
                              <div className="relative">
                                <select
                                  value={selectedProductSubcategory || ""}
                                  onChange={(e) => {
                                    const subcategoryId = e.target.value ? Number(e.target.value) : null
                                    setSelectedProductSubcategory(subcategoryId)
                                  }}
                                  className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-[11px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#196428]/20 focus:border-[#196428] transition-all appearance-none hover:border-gray-300 hover:bg-white"
                                >
                                  <option value="">Todas</option>
                                  {(() => {
                                    if (selectedProductCategory) {
                                      const categoryData = productsByCategory.find(cat => cat.categoryId === selectedProductCategory)
                                      if (categoryData) {
                                        return categoryData.subcategories.map(sub => (
                                          <option key={sub.subcategoryId} value={sub.subcategoryId}>{sub.subcategoryName}</option>
                                        ))
                                      }
                                    }
                                    return productsByCategory.map(cat =>
                                      cat.subcategories.map(sub => (
                                        <option key={sub.subcategoryId} value={sub.subcategoryId}>{sub.subcategoryName}</option>
                                      ))
                                    )
                                  })()}
                                </select>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1 flex flex-col">
                              <label className="text-[10px] font-semibold text-gray-700 flex items-center gap-1">
                                <span className="w-0.5 h-0.5 rounded-full bg-[#196428]"></span>
                                Subcategoría
                              </label>
                              <div className="relative">
                                <select disabled className="w-full px-2 py-1.5 bg-gray-100 border border-gray-200 rounded-md text-[11px] text-gray-400 cursor-not-allowed">
                                  <option>N/A</option>
                                </select>
                              </div>
                            </div>
                          )}

                          {/* Fila 1 - Columna 3: Especiales */}
                          <div className="space-y-1 flex flex-col">
                            <label className="text-[10px] font-semibold text-gray-700 flex items-center gap-1">
                              <span className="w-0.5 h-0.5 rounded-full bg-[#196428]"></span>
                              Especiales
                            </label>
                            <div className="relative">
                              <select
                                value={
                                  showOnlyOffers ? "ofertas" : 
                                  showOnlyDiscounts ? "descuentos" : 
                                  "ninguno"
                                }
                                onChange={(e) => {
                                  const value = e.target.value
                                  setShowOnlyOffers(value === "ofertas")
                                  setShowOnlyDiscounts(value === "descuentos")
                                }}
                                className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-[11px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#196428]/20 focus:border-[#196428] transition-all appearance-none hover:border-gray-300 hover:bg-white"
                              >
                                <option value="ninguno">Ninguno</option>
                                <option value="ofertas">Ofertas</option>
                                <option value="descuentos">Descuentos</option>
                              </select>
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                          </div>

                          {/* Fila 2 - Columna 1: Categoría */}
                          {selectedCategory === CATEGORIES.TODOS_LOS_PRODUCTOS ? (
                            <div className="space-y-1 flex flex-col">
                              <label className="text-[10px] font-semibold text-gray-700 flex items-center gap-1">
                                <span className="w-0.5 h-0.5 rounded-full bg-[#196428]"></span>
                                Categoría
                              </label>
                              <div className="relative">
                                <select
                                  value={selectedProductCategory || ""}
                                  onChange={(e) => {
                                    const categoryId = e.target.value ? Number(e.target.value) : null
                                    setSelectedProductCategory(categoryId)
                                    setSelectedProductSubcategory(null)
                                  }}
                                  className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-[11px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#196428]/20 focus:border-[#196428] transition-all appearance-none hover:border-gray-300 hover:bg-white"
                                >
                                  <option value="">Todas</option>
                                  {categories.map((cat: CategoryType) => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                  ))}
                                </select>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                  <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1 flex flex-col">
                              <label className="text-[10px] font-semibold text-gray-700 flex items-center gap-1">
                                <span className="w-0.5 h-0.5 rounded-full bg-[#196428]"></span>
                                Categoría
                              </label>
                              <div className="relative">
                                <select disabled className="w-full px-2 py-1.5 bg-gray-100 border border-gray-200 rounded-md text-[11px] text-gray-400 cursor-not-allowed">
                                  <option>N/A</option>
                                </select>
                              </div>
                            </div>
                          )}

                          {/* Fila 2 - Columna 2: Ordenar por */}
                          <div className="space-y-1 flex flex-col">
                            <label className="text-[10px] font-semibold text-gray-700 flex items-center gap-1">
                              <span className="w-0.5 h-0.5 rounded-full bg-[#196428]"></span>
                              Ordenar por
                            </label>
                            <div className="relative">
                              <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-[11px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#196428]/20 focus:border-[#196428] transition-all appearance-none hover:border-gray-300 hover:bg-white"
                              >
                                <option value="Más popular">Más popular</option>
                                <option value="Precio: menor a mayor">Precio: menor a mayor</option>
                                <option value="Precio: mayor a menor">Precio: mayor a menor</option>
                                <option value="Novedades">Novedades</option>
                                <option value="Nombre A-Z">Nombre A-Z</option>
                              </select>
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                          </div>

                          {/* Fila 2 - Columna 3: Precio */}
                          <div className="space-y-1 flex flex-col">
                            <label className="text-[10px] font-semibold text-gray-700 flex items-center gap-1">
                              <span className="w-0.5 h-0.5 rounded-full bg-[#196428]"></span>
                              Precio
                            </label>
                            <div className="space-y-1 bg-gray-50 rounded-md p-1.5 border border-gray-100 flex-1 flex flex-col justify-center">
                              <div className="flex items-center justify-between gap-1 mb-0.5">
                                <span className="text-[10px] font-medium text-[#196428]">${priceRange[0].toLocaleString('es-CO')}</span>
                                <span className="text-[8px] text-gray-400">-</span>
                                <span className="text-[10px] font-medium text-[#196428]">${priceRange[1].toLocaleString('es-CO')}</span>
                              </div>
                              <div className="px-0.5">
                                <Slider
                                  value={priceRange}
                                  onValueChange={(value) => setPriceRange(value as [number, number])}
                                  max={priceBounds.max}
                                  min={priceBounds.min}
                                  step={1000}
                                  className="w-full"
                                />
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Products Grid - responsive layout */}
                  {displayProducts.length > 0 ? (
                  <>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 pb-2">
                      {displayProducts.slice(0, visibleProductCount).map((product: ProductWithDetails) => {
                        const selectedSizeIndex = selectedSizes[product.id!] || 0;
                        const hasSizes = product.tamano && product.tamano.length > 0;
                        const hasPrices = product.precios && product.precios.length > 0;
                        
                        // Obtener el precio según el tamaño seleccionado
                        const getCurrentPrice = () => {
                          if (hasSizes && hasPrices && product.precios![selectedSizeIndex] !== undefined) {
                            return product.precios![selectedSizeIndex];
                          }
                          return 0;
                        };

                        const currentPrice = getCurrentPrice();

                        // Determinar la subcategoría actual para pasarla en la URL
                        const getCurrentSubcategoryForProduct = () => {
                          // Si estamos en una subcategoría específica, usar esa
                          if (selectedSubcategory !== CATEGORIES.TODOS_LOS_PRODUCTOS && 
                              selectedSubcategory !== CATEGORIES.OFERTAS && 
                              selectedSubcategory !== CATEGORIES.NOVEDADES &&
                              selectedSubcategory !== 0) {
                            return selectedSubcategory
                          }
                          // Si el producto tiene subcategorias_id, usar esa por defecto
                          if (product.subcategorias_id) {
                            return product.subcategorias_id
                          }
                          // Si tiene subcategorias_id2, usar esa
                          if (product.subcategorias_id2) {
                            return product.subcategorias_id2
                          }
                          // Si tiene subcategorias_id3, usar esa
                          if (product.subcategorias_id3) {
                            return product.subcategorias_id3
                          }
                          return null
                        }

                        const currentSubcategoryId = getCurrentSubcategoryForProduct()
                        const queryParams = new URLSearchParams()
                        if (currentSubcategoryId) queryParams.set('subcategoria', String(currentSubcategoryId))
                        if (selectedStoreId > 0) queryParams.set('tienda', String(selectedStoreId))
                        const productUrl = queryParams.toString()
                          ? `/producto/${product.id}?${queryParams}`
                          : `/producto/${product.id}`

                        return (
                        <Link key={product.id} href={productUrl} className="block h-full group">
                          <div className="bg-white rounded-2xl overflow-hidden transition-all duration-300 h-full flex flex-col border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md" style={{ fontFamily: '"Helvetica Neue", sans-serif' }}>
                            <div className="relative aspect-[4/3] flex-shrink-0 bg-white">
                              <Image
                                src={product.imagen_url || "/placeholder.jpg"}
                                alt={product.nombre}
                                fill
                                quality={60}
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                placeholder="blur"
                                blurDataURL={'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNlZWVlZWUiIC8+PC9zdmc+'}
                                loading="lazy"
                                className="object-contain p-3 sm:p-4 md:p-5 transition-transform duration-300 group-hover:scale-105"
                              />
                              {product.descuento && (
                                <div className="absolute top-3 left-3 bg-black text-white px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold tracking-wide">
                                  -{product.descuento_valor}%
                                </div>
                              )}
                              {product.destacado && !product.descuento && (
                                <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold tracking-wide">
                                  DESTACADO
                                </div>
                              )}
                              {product.novedad && !product.descuento && !product.destacado && (
                                <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold tracking-wide">
                                  NUEVO
                                </div>
                              )}
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  handleAddToCart(product)
                                }}
                                className="absolute top-3 right-3 bg-white hover:bg-[#196428] text-gray-700 hover:text-white p-2.5 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
                              >
                                <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />
                              </button>
                            </div>
                            <div className="p-3 sm:p-4 flex-1 flex flex-col gap-1.5">
                              <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-[#196428] transition-colors">{product.nombre}</h3>
                              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed line-clamp-2">
                                {product.descripcion || "Producto de calidad premium"}
                              </p>

                              {hasSizes && (
                                <div className="mt-1">
                                  <p className="text-[10px] sm:text-xs text-gray-400 mb-1.5 font-medium uppercase tracking-wide">Tamaños</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {product.tamano!.slice(0, 3).map((tamano, index) => (
                                      <button
                                        key={index}
                                        onClick={(e) => {
                                          e.preventDefault()
                                          e.stopPropagation()
                                          setSelectedSizes({...selectedSizes, [product.id!]: index})
                                        }}
                                        className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-semibold transition-all ${
                                          selectedSizeIndex === index
                                            ? 'bg-green-200 text-[#196428] border-2 border-[#196428]'
                                            : 'bg-green-50 text-gray-700'
                                        }`}
                                      >
                                        {tamano.cantidad} {tamano.unidad}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {hasPrices && currentPrice > 0 ? (
                                <div className="mt-auto pt-2">
                                  {product.descuento && product.descuento_valor ? (
                                    <div className="flex items-baseline gap-2">
                                      <span className="text-lg sm:text-xl font-black text-gray-900">
                                        ${(() => {
                                          const descuentoValor = typeof product.descuento_valor === 'string' ? parseFloat(product.descuento_valor) : Number(product.descuento_valor)
                                          const precioConDescuento = currentPrice * (1 - (descuentoValor / 100))
                                          return precioConDescuento.toLocaleString('es-CO')
                                        })()}
                                      </span>
                                      <span className="text-[10px] sm:text-xs font-medium text-gray-400 line-through">
                                        ${currentPrice.toLocaleString('es-CO')}
                                      </span>
                                      <span className="text-[9px] sm:text-[10px] font-semibold text-red-600">
                                        -{product.descuento_valor}%
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-lg sm:text-xl font-black text-gray-900">
                                      ${currentPrice.toLocaleString('es-CO')}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <p className="mt-auto text-gray-400 text-xs italic">Precio no disponible</p>
                              )}
                            </div>
                          </div>
                        </Link>
                        );
                      })}
                  </div>
                  {visibleProductCount < displayProducts.length && (
                    <div className="mt-8 flex justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          setVisibleProductCount((prev) => {
                            if (prev >= displayProducts.length) {
                              return prev
                            }
                            const next = prev + PRODUCTS_PER_BATCH
                            return next >= displayProducts.length ? displayProducts.length : next
                          })
                        }}
                        className="px-6 py-2 rounded-full bg-[#196428] hover:bg-[#145020] text-white text-sm font-semibold transition-colors shadow-sm"
                      >
                        Cargar más productos
                      </button>
                    </div>
                  )}
                  </>
                  ) : (
                    <div className="text-center py-20">
                      <p className="text-gray-600 text-lg mb-4">
                        {searchQueryParam
                          ? `No se encontraron productos para &quot;${searchQueryParam}&quot;`
                          : "No se encontraron productos en esta categoría."
                        }
                      </p>
                      {searchQueryParam && (
                        <div className="mb-6">
                          <button
                            onClick={() => {
                              setSearchQuery("")
                              setIsSearchFromUrl(false)
                              // Limpiar búsqueda y volver a todos los productos
                              window.location.href = "/tienda"
                            }}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-full font-semibold transition-colors"
                          >
                            Ver todos los productos
                          </button>
                        </div>
                      )}
                      {!searchQueryParam && (
                        <div className="flex gap-4 justify-center">
                          <button
                            onClick={() => handleCategoryChange(CATEGORIES.OFERTAS, CATEGORIES.OFERTAS)}
                            className="bg-[#196428] hover:bg-[#145020] text-white px-6 py-3 rounded-full font-semibold transition-colors"
                          >
                            Ver productos con descuento
                          </button>
                          <button
                            onClick={() => handleCategoryChange(CATEGORIES.NOVEDADES, CATEGORIES.NOVEDADES)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold transition-colors"
                          >
                            Ver novedades
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>

      {/* Account Drawer for Mobile */}
      <Drawer open={isAccountDrawerOpen} onOpenChange={setIsAccountDrawerOpen}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="text-center border-b border-gray-200">
            <DrawerTitle className="text-lg font-bold text-gray-800">Mi Cuenta</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-6">
            <AccountPopoverContent />
          </div>
        </DrawerContent>
      </Drawer>

      {/* Categories Drawer for Mobile */}
      <Drawer open={isCategoriesDrawerOpen} onOpenChange={setIsCategoriesDrawerOpen}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="text-center border-b border-gray-200">
            <DrawerTitle className="text-lg font-bold text-gray-800">Categorías</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-6">
            <div className="space-y-4">
              {/* Selector de tienda */}
              <div>
                <h3 className="text-base font-semibold text-gray-700 mb-2">Selecciona tu tienda</h3>
                <select
                  value={selectedStoreId}
                  onChange={(e) => setSelectedStoreId(Number(e.target.value))}
                  className="w-full text-sm py-2 px-3 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#196428] focus:border-[#196428] transition-all cursor-pointer"
                  aria-label="Selecciona la tienda para ver productos disponibles"
                >
                  {tiendas.length === 0 ? (
                    <option value={0}>Cargando tiendas...</option>
                  ) : (
                    <>
                      <option value={0}>Todas las tiendas</option>
                      {tiendas.map((tienda) => (
                        <option key={tienda.id} value={tienda.id}>
                          {tienda.name} — {tienda.city}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              {/* Todos los productos section */}
              <div>
                <h3 className="text-base font-semibold text-gray-700 mb-2">Categorías</h3>
                <button
                  onClick={() => {
                    handleCategoryChange(CATEGORIES.TODOS_LOS_PRODUCTOS, CATEGORIES.TODOS_LOS_PRODUCTOS);
                    setIsCategoriesDrawerOpen(false);
                  }}
                  className={`block text-sm w-full text-left px-2 py-2 rounded hover:bg-gray-50 ${selectedCategory === CATEGORIES.TODOS_LOS_PRODUCTOS && selectedSubcategory === CATEGORIES.TODOS_LOS_PRODUCTOS ? "text-[#196428] font-medium bg-green-50" : "text-gray-600 hover:text-[#196428]"}`}
                >
                  Todos los productos
                </button>
              </div>

              {/* Ofertas section */}
              <div>
                <h3 className="text-base font-semibold text-gray-700 mb-2">Ofertas %</h3>
                <button
                  onClick={() => {
                    handleCategoryChange(CATEGORIES.OFERTAS, CATEGORIES.OFERTAS);
                    setIsCategoriesDrawerOpen(false);
                  }}
                  className={`block text-sm w-full text-left px-2 py-2 rounded hover:bg-gray-50 ${selectedCategory === CATEGORIES.OFERTAS && selectedSubcategory === CATEGORIES.OFERTAS ? "text-[#196428] font-medium bg-green-50" : "text-gray-600 hover:text-[#196428]"}`}
                >
                  Productos con descuento
                </button>
              </div>

              {/* Categorías dinámicas desde Supabase */}
              {(() => {
                const filteredCategories = productsByCategory.filter(cat => cat.categoryId !== 4 && cat.categoryId !== 5)
                const mascotasGroups = getMascotasGroupedSubcategories()
                
                const mascotasCategoryData = {
                  categoryId: CATEGORIES.MASCOTAS,
                  categoryName: "Mascotas",
                  groupedSubcategories: mascotasGroups
                }
                const allCategories = [mascotasCategoryData, ...filteredCategories]
                
                return allCategories.map((categoryData) => {
                  const category = categories.find(cat => cat.id === categoryData.categoryId)
                  if (!category) return null
                  const isMascotas = categoryData.categoryId === CATEGORIES.MASCOTAS

                  return (
                    <div key={categoryData.categoryId}>
                      <button
                        onClick={() => {
                          handleCategoryChange(categoryData.categoryId, 0);
                          setIsCategoriesDrawerOpen(false);
                        }}
                        className={`w-full text-left text-base font-semibold mb-2 transition-colors ${
                          selectedCategory === categoryData.categoryId &&
                          (isMascotas ? !selectedMascotasSubcategoryIds : selectedSubcategory === 0)
                            ? "text-[#196428]"
                            : "text-gray-700 hover:text-[#196428]"
                        }`}
                      >
                        {category.name}
                      </button>
                      <div className="space-y-1 ml-2">
                        {isMascotas
                          ? mascotasGroups.map((group) => {
                              const isSelected = selectedCategory === CATEGORIES.MASCOTAS &&
                                selectedMascotasSubcategoryIds &&
                                selectedMascotasSubcategoryIds.length === group.subcategoryIds.length &&
                                selectedMascotasSubcategoryIds.every((id, i) => id === group.subcategoryIds[i])
                              return (
                                <button
                                  key={group.displayName + group.subcategoryIds.join("-")}
                                  onClick={() => {
                                    handleCategoryChange(CATEGORIES.MASCOTAS, 1, group);
                                    setIsCategoriesDrawerOpen(false);
                                  }}
                                  className={`block text-xs w-full text-left px-2 py-1 rounded hover:bg-gray-50 ${isSelected ? "text-[#196428] font-medium bg-green-50" : "text-gray-600 hover:text-[#196428]"}`}
                                >
                                  <span className="lowercase">{group.displayName}</span>
                                </button>
                              )
                            })
                          : (categoryData as { subcategories: Array<{ subcategoryId: number; subcategoryName: string }> }).subcategories?.map((subcategory) => (
                            <button
                              key={subcategory.subcategoryId}
                              onClick={() => {
                                handleCategoryChange(categoryData.categoryId, subcategory.subcategoryId);
                                setIsCategoriesDrawerOpen(false);
                              }}
                              className={`block text-xs w-full text-left px-2 py-1 rounded hover:bg-gray-50 ${selectedCategory === categoryData.categoryId && selectedSubcategory === subcategory.subcategoryId ? "text-[#196428] font-medium bg-green-50" : "text-gray-600 hover:text-[#196428]"}`}
                            >
                              <span className="lowercase">{subcategory.subcategoryName}</span>
                            </button>
                          ))}
                    {/* Subcategorías especiales por categoría: Ofertas y Novedades (excluye Tienda, Ofertas, Especiales) */}
                    {(() => {
                      const lowerName = (category.name || '').toLowerCase();
                      const isExcluded = lowerName === 'tienda' || lowerName === 'ofertas' || lowerName === 'especiales';
                      if (isExcluded) return null;
                      return (
                        <>
                          <button
                            onClick={() => {
                              handleCategoryChange(CATEGORIES.OFERTAS, CATEGORIES.OFERTAS);
                              setIsCategoriesDrawerOpen(false);
                            }}
                            className={`block text-sm w-full text-left px-2 py-1 rounded hover:bg-gray-50 ${selectedCategory === CATEGORIES.OFERTAS && selectedSubcategory === CATEGORIES.OFERTAS ? "text-[#196428] font-medium bg-green-50" : "text-gray-600 hover:text-[#196428]"}`}
                          >
                            Ofertas
                          </button>
                          <button
                            onClick={() => {
                              handleCategoryChange(CATEGORIES.NOVEDADES, CATEGORIES.NOVEDADES);
                              setIsCategoriesDrawerOpen(false);
                            }}
                            className={`block text-sm w-full text-left px-2 py-1 rounded hover:bg-gray-50 ${selectedCategory === CATEGORIES.NOVEDADES && selectedSubcategory === CATEGORIES.NOVEDADES ? "text-[#196428] font-medium bg-green-50" : "text-gray-600 hover:text-[#196428]"}`}
                          >
                            Novedades
                          </button>
                        </>
                      );
                    })()}
                    </div>
                  </div>
                  )
                })
              })()}

              {/* Special sections */}
              <div>
                <h3 className="text-base font-semibold text-gray-700 mb-2">Especiales</h3>
                <div className="space-y-1 ml-2">
                  <button
                    onClick={() => {
                      handleCategoryChange(CATEGORIES.OFERTAS, CATEGORIES.OFERTAS);
                      setIsCategoriesDrawerOpen(false);
                    }}
                    className={`block text-xs w-full text-left px-2 py-1 rounded hover:bg-gray-50 ${selectedCategory === CATEGORIES.OFERTAS && selectedSubcategory === CATEGORIES.OFERTAS ? "text-[#196428] font-medium bg-green-50" : "text-gray-600 hover:text-[#196428]"}`}
                  >
                    <span className="lowercase">Ofertas</span>
                  </button>
                  <button
                    onClick={() => {
                      handleCategoryChange(CATEGORIES.NOVEDADES, CATEGORIES.NOVEDADES);
                      setIsCategoriesDrawerOpen(false);
                    }}
                    className={`block text-xs w-full text-left px-2 py-1 rounded hover:bg-gray-50 ${selectedCategory === CATEGORIES.NOVEDADES && selectedSubcategory === CATEGORIES.NOVEDADES ? "text-[#196428] font-medium bg-green-50" : "text-gray-600 hover:text-[#196428]"}`}
                  >
                    <span className="lowercase">Novedades</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

    </MainLayout>
  )
}

export default function TiendaPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#196428]"></div></div>}>
      <TiendaPageContent />
    </Suspense>
  )
}

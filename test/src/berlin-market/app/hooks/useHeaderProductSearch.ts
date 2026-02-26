"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { useProducts, type ProductWithDetails } from "./useProducts"

interface UseHeaderProductSearchResult {
  searchQuery: string
  isAutocompleteOpen: boolean
  liveSearchResults: ProductWithDetails[]
  isLiveSearching: boolean
  handleSearchInputChange: (value: string) => void
  handleSearchInputFocus: () => void
  handleSearchInputBlur: () => void
  handleSelectAutocompleteProduct: (product: ProductWithDetails) => void
  handleSearchSubmit: (e: React.FormEvent) => void
}

export const useHeaderProductSearch = (): UseHeaderProductSearchResult => {
  const router = useRouter()

  const {
    liveSearchResults,
    isLiveSearching,
    updateLiveSearchQuery,
    clearLiveSearchResults,
  } = useProducts()

  const [searchQuery, setSearchQuery] = useState("")
  const [isAutocompleteOpen, setIsAutocompleteOpen] = useState(false)

  const handleSearchInputChange = useCallback(
    (value: string) => {
      setSearchQuery(value)
      updateLiveSearchQuery(value)

      if (value.trim()) {
        setIsAutocompleteOpen(true)
      } else {
        setIsAutocompleteOpen(false)
        clearLiveSearchResults()
      }
    },
    [clearLiveSearchResults, updateLiveSearchQuery],
  )

  const handleSearchInputFocus = useCallback(() => {
    if (searchQuery.trim()) {
      setIsAutocompleteOpen(true)
    }
  }, [searchQuery])

  const handleSearchInputBlur = useCallback(() => {
    setTimeout(() => {
      setIsAutocompleteOpen(false)
    }, 200)
  }, [])

  const handleSelectAutocompleteProduct = useCallback(
    (product: ProductWithDetails) => {
      const query = product.nombre

      setSearchQuery(query)
      updateLiveSearchQuery(query)
      setIsAutocompleteOpen(false)
      clearLiveSearchResults()

      router.push(`/tienda?search=${encodeURIComponent(query)}`)
    },
    [clearLiveSearchResults, router, updateLiveSearchQuery],
  )

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()

      if (!searchQuery.trim()) {
        return
      }

      setIsAutocompleteOpen(false)
      clearLiveSearchResults()

      router.push(`/tienda?search=${encodeURIComponent(searchQuery.trim())}`)
    },
    [clearLiveSearchResults, router, searchQuery],
  )

  return {
    searchQuery,
    isAutocompleteOpen,
    liveSearchResults,
    isLiveSearching,
    handleSearchInputChange,
    handleSearchInputFocus,
    handleSearchInputBlur,
    handleSelectAutocompleteProduct,
    handleSearchSubmit,
  }
}


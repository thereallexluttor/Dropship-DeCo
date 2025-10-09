"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface CategoryContextType {
  openCategory: string | null
  setOpenCategory: (categoryName: string | null) => void
  isCategoryOpen: (categoryName: string) => boolean
  closeAllCategories: () => void
  toggleCategory: (categoryName: string) => void
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined)

interface CategoryProviderProps {
  children: ReactNode
}

export function CategoryProvider({ children }: CategoryProviderProps) {
  const [openCategory, setOpenCategory] = useState<string | null>(null)

  const isCategoryOpen = useCallback((categoryName: string) => {
    return openCategory === categoryName
  }, [openCategory])

  const closeAllCategories = useCallback(() => {
    setOpenCategory(null)
  }, [])

  const toggleCategory = useCallback((categoryName: string) => {
    setOpenCategory(current => current === categoryName ? null : categoryName)
  }, [])

  const value: CategoryContextType = {
    openCategory,
    setOpenCategory,
    isCategoryOpen,
    closeAllCategories,
    toggleCategory
  }

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  )
}

export function useCategory() {
  const context = useContext(CategoryContext)
  if (context === undefined) {
    throw new Error('useCategory must be used within a CategoryProvider')
  }
  return context
}

"use client"

import { useState, useEffect, useCallback, useRef } from 'react'

interface UseScrollBehaviorOptions {
  threshold?: number // Distancia de scroll antes de cerrar el menú
  debounceMs?: number // Tiempo de debounce para el evento scroll
  onScrollClose?: () => void // Función a ejecutar cuando se debe cerrar el menú
  enabled?: boolean // Si el comportamiento de scroll está habilitado
}

export function useScrollBehavior(options: UseScrollBehaviorOptions = {}) {
  const { threshold = 100, debounceMs = 16, onScrollClose, enabled = true } = options

  const [scrollY, setScrollY] = useState(0)
  const [shouldClose, setShouldClose] = useState(false)
  const previousScrollY = useRef(0)
  const debounceTimer = useRef<NodeJS.Timeout>()

  const handleScroll = useCallback(() => {
    if (!enabled) return

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      const currentScrollY = window.scrollY
      setScrollY(currentScrollY)

      // Calcular la diferencia de scroll
      const scrollDifference = Math.abs(currentScrollY - previousScrollY.current)

      // Si el usuario hizo scroll más de la distancia threshold, cerrar el menú
      if (scrollDifference > threshold) {
        setShouldClose(true)
        onScrollClose?.()
      }

      previousScrollY.current = currentScrollY
    }, debounceMs)
  }, [threshold, debounceMs, onScrollClose, enabled])

  const resetCloseState = useCallback(() => {
    setShouldClose(false)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [handleScroll])

  return {
    scrollY,
    shouldClose,
    resetCloseState
  }
}

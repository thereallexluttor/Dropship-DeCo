"use client"

import { useEffect, useState } from 'react'
import supabase from '@/lib/supabase'

export default function PromotionalBanner() {
  const [lines, setLines] = useState<string[]>([])

  useEffect(() => {
    const fetchBannerLines = async () => {
      try {
        const { data, error } = await supabase
          .from('barra')
          .select('line1, line2, line3')
          .order('id', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (error) {
          console.error('Error cargando líneas del banner:', error)
          return
        }

        if (!data) {
          setLines([])
          return
        }

        const rawLines = [
          data.line1?.trim() ?? '',
          data.line2?.trim() ?? '',
          data.line3?.trim() ?? '',
        ]

        // Consideramos "vacío" cuando no hay ningún carácter alfanumérico real
        const hasRealContent = rawLines.some((line) =>
          /[a-zA-Z0-9ÁÉÍÓÚáéíóúÑñ]/.test(line)
        )

        if (!hasRealContent) {
          setLines([])
          return
        }

        const validLines = rawLines.filter((line) => line !== '')

        setLines(validLines)
      } catch (error) {
        console.error('Error inesperado cargando líneas del banner:', error)
        setLines([])
      }
    }

    void fetchBannerLines()
  }, [])

  // Si no hay líneas, no mostrar el banner
  if (!lines || lines.length === 0) {
    return null
  }

  return (
    <div className="bg-[#196428] text-white py-1 overflow-hidden">
      <div className="flex animate-scroll-infinite whitespace-nowrap text-sm font-bold">
        {/* Primera copia del contenido */}
        <div className="inline-flex">
          {lines.map((linea, index) => (
            <span key={`copy1-${index}`} className="inline-block mr-8">
              {linea}
            </span>
          ))}
        </div>
        {/* Segunda copia del contenido - necesaria para el loop infinito */}
        <div className="inline-flex">
          {lines.map((linea, index) => (
            <span key={`copy2-${index}`} className="inline-block mr-8">
              {linea}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}


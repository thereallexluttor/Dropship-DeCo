"use client"

import { useEffect, useState } from "react"
import MainLayout from "../components/MainLayout"
import Header from "../components/Header"
import Footer from "../components/Footer"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function CarrerasPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  useEffect(() => {
    router.replace("/vacantes")
  }, [router])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <MainLayout>
      <div className="min-h-screen" style={{ backgroundColor: '#FCFFEF' }}>
        <div className="bg-[#196428] text-white py-1 overflow-hidden">
          <div className="animate-scroll whitespace-nowrap text-sm font-bold" style={{ animationDuration: '40s' }}>
            <span className="inline-block mr-8">Únete a nuestro equipo — Oportunidades abiertas</span>
            <span className="inline-block mr-8">Únete a nuestro equipo — Oportunidades abiertas</span>
          </div>
        </div>

        <Header 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={handleSearch}
        />

        <main className="py-16 sm:py-20 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
            <div className="mb-12">
              <nav className="flex items-center text-sm text-gray-500">
                <Link href="/" className="hover:text-gray-700 transition-colors">Inicio</Link>
                <span className="mx-2">/</span>
                <span className="text-gray-900">Carreras</span>
              </nav>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl text-gray-900 mb-6 text-center" style={{ fontFamily: 'HelveticaNeueHeavy, sans-serif', fontWeight: '900' }}>
              Redirigiendo a Vacantes…
            </h1>
            <p className="text-center text-gray-700 mb-8">Si no eres redirigido automáticamente, usa el siguiente enlace.</p>
            <p className="text-center">
              <Link href="/vacantes" className="text-white bg-[#196428] px-5 py-2 rounded-md hover:opacity-90 transition">Ir a Vacantes</Link>
            </p>
          </div>
        </main>

        <Footer />
      </div>
    </MainLayout>
  )
}



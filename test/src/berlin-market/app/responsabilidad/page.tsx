"use client"

import { useState } from "react"
import MainLayout from "../components/MainLayout"
import Header from "../components/Header"
import Footer from "../components/Footer"
import Link from "next/link"

export default function ResponsabilidadPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <MainLayout>
      <div className="min-h-screen" style={{ backgroundColor: '#ffffff' }}>
        <div className="bg-[#196428] text-white py-1 overflow-hidden">
          <div className="animate-scroll whitespace-nowrap text-sm font-bold" style={{ animationDuration: '40s' }}>
            <span className="inline-block mr-8">Responsabilidad social y ambiental</span>
            <span className="inline-block mr-8">Responsabilidad social y ambiental</span>
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
                <span className="text-gray-900">Políticas</span>
              </nav>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl text-gray-900 mb-8 text-center" style={{ fontFamily: 'HelveticaNeueHeavy, sans-serif', fontWeight: '900' }}>
              Política de Tratamiento de Datos Personales
            </h1>

            <div className="prose prose-gray max-w-none">
              <section className="mb-12">
                <h2 className="text-2xl sm:text-3xl text-gray-900 mb-4">Resumen</h2>
                <p className="text-gray-700">En cumplimiento de la normativa aplicable en materia de protección de datos personales (incluyendo, cuando corresponda, la Ley 1581 de 2012 y sus decretos reglamentarios), informamos nuestras prácticas de tratamiento, finalidades y los derechos de los titulares.</p>
              </section>

              <section className="mb-12">
                <h2 className="text-2xl sm:text-3xl text-gray-900 mb-4">Documento completo</h2>
                <p className="text-gray-700 mb-4">Puede consultar el documento completo de la Política de Tratamiento de Datos Personales a continuación o descargarlo.</p>
                <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50" style={{ minHeight: '600px' }}>
                  <iframe
                    src="/POLITICA%20DE%20TRATAMIENTO%20DE%20DATOS%20PERSONALES.pdf"
                    title="Política de Tratamiento de Datos Personales"
                    className="w-full"
                    style={{ height: '70vh', minHeight: '600px' }}
                  />
                </div>
                <a
                  href="/POLITICA%20DE%20TRATAMIENTO%20DE%20DATOS%20PERSONALES.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4 text-[#196428] font-medium hover:underline"
                >
                  Descargar PDF
                </a>
              </section>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </MainLayout>
  )
}



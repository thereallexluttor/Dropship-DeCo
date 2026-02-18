"use client"

import { useState } from "react"
import MainLayout from "../components/MainLayout"
import Header from "../components/Header"
import Footer from "../components/Footer"
import Link from "next/link"

export default function PrensaPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <MainLayout>
      <div className="min-h-screen" style={{ backgroundColor: '#ffffff' }}>
        <div className="bg-[#196428] text-white py-1 overflow-hidden">
          <div className="animate-scroll whitespace-nowrap text-sm font-bold" style={{ animationDuration: '40s' }}>
            <span className="inline-block mr-8">Sala de prensa</span>
            <span className="inline-block mr-8">Sala de prensa</span>
          </div>
        </div>

        <Header 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={handleSearch}
        />

        <main className="py-16 sm:py-20 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
            <div className="mb-12">
              <nav className="flex items-center text-sm text-gray-500">
                <Link href="/" className="hover:text-gray-700 transition-colors">Inicio</Link>
                <span className="mx-2">/</span>
                <span className="text-gray-900">Prensa</span>
              </nav>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl text-gray-900 mb-4 text-center" style={{ fontFamily: 'HelveticaNeueHeavy, sans-serif', fontWeight: '900' }}>
              Blog y Prensa
            </h1>
            <p className="text-center text-gray-700 max-w-3xl mx-auto mb-12">Consejos breves y noticias sobre el cuidado de animales.</p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { slug: "perros", title: "Cuidado básico de perros", excerpt: "Vacunación, desparasitación y nutrición balanceada para todas las etapas.", image: "/dog.png" },
                { slug: "gatos", title: "Cuidado básico de gatos", excerpt: "Ambiente enriquecido, arenero limpio y alimentación adecuada.", image: "/cat.png" },
                { slug: "bovinos", title: "Manejo sanitario en bovinos", excerpt: "Plan sanitario, mineralización y manejo de praderas.", image: "/bovinos.png" },
                { slug: "equinos", title: "Bienestar en equinos", excerpt: "Herrado, desparasitación estratégica y control de colicos.", image: "/veterinario.png" },
                { slug: "aves", title: "Salud en aves de corral", excerpt: "Bioseguridad, calidad del agua y densidades adecuadas.", image: "/aves.png" },
                { slug: "roedores", title: "Pequeños mamíferos", excerpt: "Fibra, enriquecimiento y revisiones periódicas.", image: "/roedores.png" },
              ].map((post) => (
                <article key={post.slug} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="h-40 bg-gray-100 flex items-center justify-center">
                    {/* Simple image placeholder */}
                    <img src={post.image} alt={post.title} className="h-full object-contain" />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{post.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{post.excerpt}</p>
                    <Link href="#" className="text-[#196428] text-sm hover:underline">Leer más</Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </MainLayout>
  )
}



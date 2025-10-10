"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import MainLayout from "../components/MainLayout"
import Header from "../components/Header"
import Footer from "../components/Footer"

export default function AboutUs() {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Searching for:", searchQuery)
  }

  return (
    <MainLayout>
      <div className="min-h-screen" style={{ backgroundColor: '#FCFFEF' }}>
        {/* Promotional Banner */}
        <div className="bg-[#196428] text-white py-1 overflow-hidden">
          <div className="animate-scroll whitespace-nowrap text-sm font-bold" style={{ animationDuration: '40s' }}>
            <span className="inline-block mr-8">Descuentos en la linea para gatos, - Disfruta las ofertas que tenemos hoy para ti!</span>
            <span className="inline-block mr-8">Descuentos en la linea para gatos, - Disfruta las ofertas que tenemos hoy para ti!</span>
            <span className="inline-block mr-8">Descuentos en la linea para gatos, - Disfruta las ofertas que tenemos hoy para ti!</span>
            <span className="inline-block mr-8">Descuentos en la linea para gatos, - Disfruta las ofertas que tenemos hoy para ti!</span>
          </div>
        </div>

        <Header 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={handleSearch}
        />

        <main className="py-16 sm:py-20 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
            {/* Breadcrumb */}
            <div className="mb-12">
              <nav className="flex items-center text-sm text-gray-500">
                <Link href="/" className="hover:text-gray-700 transition-colors">
                  Inicio
                </Link>
                <span className="mx-2">/</span>
                <span className="text-gray-900">Sobre Nosotros</span>
              </nav>
            </div>

            {/* Page Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl text-gray-900 mb-12 text-center" style={{ fontFamily: 'HelveticaNeueHeavy, sans-serif', fontWeight: '900' }}>
              Sobre Nosotros
            </h1>

            {/* Banner después del título Sobre Nosotros */}
            <div className="mb-20">
              <div className="relative h-48 sm:h-56 md:h-64 bg-gray-100 rounded-lg overflow-hidden">
                <video
                  src="/farm1.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent"></div>
                <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 text-white">
                  <p className="text-sm sm:text-base font-medium drop-shadow-lg">Comprometidos con la excelencia</p>
                </div>
              </div>
            </div>
            
            {/* Misión y Visión */}
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 mb-20">
              {/* Misión */}
              <div className="space-y-4">
                <h2 className="text-2xl sm:text-3xl font-light text-gray-900 border-b border-gray-200 pb-2">
                  Misión
                </h2>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  Brindar productos agropecuarios y farmacéuticos de alta calidad, junto con asesoría técnica y profesional, para mejorar la productividad del campo y la salud de nuestras comunidades.
                </p>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  Nos enfocamos en atender con responsabilidad social y cercanía a nuestros clientes, impulsando el desarrollo rural, el mejoramiento de la salud y el crecimiento sostenible en los territorios donde hacemos presencia.
                </p>
              </div>

              {/* Visión */}
              <div className="space-y-4">
                <h2 className="text-2xl sm:text-3xl font-light text-gray-900 border-b border-gray-200 pb-2">
                  Visión
                </h2>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  En el 2028 Ser una empresa reconocida en varios departamentos de Colombia por ofrecer soluciones integrales en insumos agropecuarios y productos farmacéuticos, destacándonos por la calidad, el servicio humano y la cercanía con nuestras comunidades.
                </p>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  Nos proyectamos como un aliado estratégico para el desarrollo del campo y la salud, comprometidos con la sostenibilidad, la innovación y el bienestar de las personas y productores en las regiones donde operamos.
                </p>
              </div>
            </div>

            {/* Valores Corporativos */}
            <div className="space-y-12">
              <div className="text-center">
                <h2 className="text-3xl sm:text-4xl font-light text-gray-900 mb-8">Identidad Corporativa</h2>

                {/* Banner después del título Identidad Corporativa */}
                <div className="mb-12">
                  <div className="relative h-32 sm:h-40 md:h-48 bg-gray-100 rounded-lg overflow-hidden">
                    <video
                      src="/farm2.mp4"
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
                    <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 text-white">
                      <p className="text-xs sm:text-sm font-medium drop-shadow-lg">Nuestros valores en acción</p>
                    </div>
                  </div>
                </div>

                <p className="text-xl sm:text-2xl text-gray-600">Valores Corporativos</p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Trabajo en equipo */}
                <div className="space-y-3">
                  <h3 className="text-lg sm:text-xl font-medium text-gray-900">
                    Trabajo en equipo
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Fomentamos un entorno colaborativo donde el respeto, la comunicación y la diversidad de ideas permiten alcanzar objetivos comunes. Creemos que los mejores resultados se logran cuando trabajamos unidos.
                  </p>
                </div>

                {/* Transparencia */}
                <div className="space-y-3">
                  <h3 className="text-lg sm:text-xl font-medium text-gray-900">
                    Transparencia
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Nos conducimos con claridad, honestidad y apertura en todas nuestras interacciones. Creemos que una comunicación veraz fortalece la confianza y genera relaciones duraderas.
                  </p>
                </div>

                {/* Integridad */}
                <div className="space-y-3">
                  <h3 className="text-lg sm:text-xl font-medium text-gray-900">
                    Integridad
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Actuamos con ética, coherencia y responsabilidad en cada decisión. Mantenemos nuestro compromiso con lo correcto, porque sabemos que la confianza se construye con hechos.
                  </p>
                </div>

                {/* Sostenibilidad */}
                <div className="space-y-3">
                  <h3 className="text-lg sm:text-xl font-medium text-gray-900">
                    Sostenibilidad
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Trabajamos pensando en el largo plazo. Promovemos prácticas responsables con el medio ambiente, la sociedad y la economía, comprometidos con generar un impacto positivo.
                  </p>
                </div>

                {/* Responsabilidad */}
                <div className="space-y-3">
                  <h3 className="text-lg sm:text-xl font-medium text-gray-900">
                    Responsabilidad
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Asumimos nuestras acciones con seriedad y compromiso. Cumplimos lo que prometemos, respondemos por nuestros resultados y buscamos mejorar continuamente.
                  </p>
                </div>

                {/* Creatividad */}
                <div className="space-y-3">
                  <h3 className="text-lg sm:text-xl font-medium text-gray-900">
                    Creatividad
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Impulsamos la innovación como motor de transformación. Fomentamos un entorno donde las ideas nuevas son bienvenidas y la solución de problemas se aborda con originalidad.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </MainLayout>
  )
}


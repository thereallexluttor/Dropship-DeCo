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
      <div className="min-h-screen" style={{ backgroundColor: '#FCFFEF' }}>
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
                <span className="text-gray-900">Responsabilidad</span>
              </nav>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl text-gray-900 mb-8 text-center" style={{ fontFamily: 'HelveticaNeueHeavy, sans-serif', fontWeight: '900' }}>
              Responsabilidad y Protección de Datos
            </h1>

            <div className="prose prose-gray max-w-none">
              <section className="mb-12">
                <h2 className="text-2xl sm:text-3xl text-gray-900 mb-4">Política de Tratamiento de Datos Personales</h2>
                <p className="text-gray-700">En cumplimiento de la normativa aplicable en materia de protección de datos personales (incluyendo, cuando corresponda, la Ley 1581 de 2012 y sus decretos reglamentarios), informamos nuestras prácticas de tratamiento, finalidades y los derechos de los titulares.</p>
              </section>

              <section className="grid md:grid-cols-2 gap-8 mb-12">
                <div>
                  <h3 className="text-xl text-gray-900 mb-2">1. Responsable del Tratamiento</h3>
                  <p className="text-gray-700">UNISANTANDER S.A.S. es responsable del tratamiento de la información. Para ejercer sus derechos, escriba al correo de contacto publicado en esta web o a nuestras sedes.</p>
                </div>
                <div>
                  <h3 className="text-xl text-gray-900 mb-2">2. Datos que recolectamos</h3>
                  <p className="text-gray-700">Identificación, contacto, información transaccional, preferencias y datos de navegación/cookies estrictamente necesarios para la operación del sitio y mejora del servicio.</p>
                </div>
              </section>

              <section className="grid md:grid-cols-2 gap-8 mb-12">
                <div>
                  <h3 className="text-xl text-gray-900 mb-2">3. Finalidades</h3>
                  <ul className="list-disc pl-5 text-gray-700 space-y-2">
                    <li>Gestionar compras, pedidos, pagos, envíos y garantías.</li>
                    <li>Atención al cliente, PQRS y comunicaciones comerciales autorizadas.</li>
                    <li>Mejorar experiencia, seguridad y prevención del fraude.</li>
                    <li>Cumplir obligaciones legales, contables y fiscales.</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl text-gray-900 mb-2">4. Derechos del titular</h3>
                  <ul className="list-disc pl-5 text-gray-700 space-y-2">
                    <li>Acceder, conocer, actualizar y rectificar sus datos.</li>
                    <li>Solicitar prueba de autorización y ser informado del uso.</li>
                    <li>Presentar quejas ante la autoridad competente.</li>
                    <li>Revocar la autorización y/o solicitar supresión cuando proceda.</li>
                  </ul>
                </div>
              </section>

              <section className="grid md:grid-cols-2 gap-8 mb-12">
                <div>
                  <h3 className="text-xl text-gray-900 mb-2">5. Seguridad y conservación</h3>
                  <p className="text-gray-700">Aplicamos medidas técnicas y organizativas razonables para proteger la información. Conservamos los datos por el tiempo necesario para cumplir las finalidades y exigencias legales.</p>
                </div>
                <div>
                  <h3 className="text-xl text-gray-900 mb-2">6. Transferencias y transmisión</h3>
                  <p className="text-gray-700">Podemos compartir datos con aliados y encargados bajo contratos de confidencialidad y protección, y con autoridades cuando sea requerido por ley.</p>
                </div>
              </section>

              <section className="mb-12">
                <h3 className="text-xl text-gray-900 mb-2">7. Cookies</h3>
                <p className="text-gray-700">Usamos cookies necesarias para funcionamiento y analítica básica. Puede gestionar preferencias desde su navegador. Para más detalle consulte nuestra política de cookies cuando esté disponible.</p>
              </section>

              <section className="mb-4">
                <h3 className="text-xl text-gray-900 mb-2">Canales para ejercer derechos</h3>
                <p className="text-gray-700">Envíe su solicitud a través de nuestro canal de contacto publicado en esta web o acérquese a nuestras sedes físicas. Responderemos en los plazos legales.</p>
              </section>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </MainLayout>
  )
}



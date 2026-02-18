"use client"

import { useState } from "react"
import MainLayout from "../components/MainLayout"
import Header from "../components/Header"
import Footer from "../components/Footer"
import Link from "next/link"

export default function CumplimientoPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
  }

  return (
    <MainLayout>
      <div className="min-h-screen" style={{ backgroundColor: '#ffffff' }}>
        <div className="bg-[#196428] text-white py-1 overflow-hidden">
          <div className="animate-scroll whitespace-nowrap text-sm font-bold" style={{ animationDuration: '40s' }}>
            <span className="inline-block mr-8">Cumplimiento y ética</span>
            <span className="inline-block mr-8">Cumplimiento y ética</span>
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
                <span className="text-gray-900">Cumplimiento</span>
              </nav>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl text-gray-900 mb-8 text-center" style={{ fontFamily: 'HelveticaNeueHeavy, sans-serif', fontWeight: '900' }}>
              Cumplimiento y Políticas Corporativas
            </h1>

            <div className="grid md:grid-cols-2 gap-10">
              <section>
                <h2 className="text-2xl text-gray-900 mb-3">Política de Ventas</h2>
                <ul className="list-disc pl-5 text-gray-700 space-y-2">
                  <li>Precios y promociones publicados pueden variar según disponibilidad y región.</li>
                  <li>Pedidos confirmados están sujetos a validación de stock, pago y verificación antifraude.</li>
                  <li>Garantías y devoluciones se gestionan conforme a la ley y términos del fabricante.</li>
                  <li>Medios de pago aceptados y tiempos de despacho se informan antes de confirmar la compra.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl text-gray-900 mb-3">Política de Compras y Proveedores</h2>
                <ul className="list-disc pl-5 text-gray-700 space-y-2">
                  <li>Selección de proveedores basada en calidad, cumplimiento, precios y buenas prácticas.</li>
                  <li>Contratos claros con obligaciones de entrega, calidad, trazabilidad y ética empresarial.</li>
                  <li>Prevención de conflicto de interés y cumplimiento de normas sanitarias y fiscales.</li>
                  <li>Evaluaciones periódicas de desempeño y mejora continua.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl text-gray-900 mb-3">Ética y Anticorrupción</h2>
                <p className="text-gray-700">Tolerancia cero a sobornos, fraudes o prácticas indebidas. Mecanismos internos de reporte y auditoría. Capacitación continua a colaboradores y aliados.</p>
              </section>

              <section>
                <h2 className="text-2xl text-gray-900 mb-3">Seguridad y Trazabilidad</h2>
                <p className="text-gray-700">Trazabilidad de productos veterinarios y agropecuarios, control de fechas de vencimiento, condiciones de almacenamiento y transporte conforme a normativa.</p>
              </section>

              <section className="md:col-span-2">
                <h2 className="text-2xl text-gray-900 mb-3">Canales de Atención</h2>
                <p className="text-gray-700">Para solicitar información o radicar PQRS relacionadas con ventas o compras, utilice nuestro canal de contacto oficial publicado en esta web. Respondemos dentro de los plazos legales.</p>
              </section>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </MainLayout>
  )
}



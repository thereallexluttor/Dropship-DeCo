"use client"

import { useState } from "react"
import MainLayout from "../components/MainLayout"
import Header from "../components/Header"
import Footer from "../components/Footer"
import Link from "next/link"

export default function AyudaPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
  }

  const sections = [
    {
      id: "pedidos-envios",
      title: "Pedidos y envíos",
      items: [
        { q: "¿Cómo hago un pedido?", a: "Navega por la tienda, agrega productos al carrito y finaliza el pago. Recibirás confirmación por pantalla y por correo (si lo registraste)." },
        { q: "¿Cuánto tarda el envío?", a: "Depende de tu ubicación, método de entrega y disponibilidad. El estimado se muestra antes de pagar." },
        { q: "¿Puedo programar la entrega?", a: "En algunas ciudades ofrecemos franjas horarias. Si está disponible, la verás durante el checkout." },
        { q: "¿Cómo rastreo mi pedido?", a: "Te enviaremos actualizaciones al correo/WhatsApp registrado. También puedes revisar el estado desde Mi cuenta." },
      ],
    },
    {
      id: "pagos-facturacion",
      title: "Pagos y facturación",
      items: [
        { q: "¿Qué métodos de pago aceptan?", a: "Tarjetas, transferencias y otros medios habilitados según tu ciudad. Todos los pagos se procesan de forma segura." },
        { q: "¿Mi pago no pasó, qué hago?", a: "Verifica saldo, datos y reintenta. Si persiste, intenta otro medio o contáctanos en Contacto." },
        { q: "¿Puedo solicitar factura?", a: "Sí. Diligencia tus datos de facturación al pagar o solicita desde Mi cuenta con el número de pedido." },
      ],
    },
    {
      id: "devoluciones-garantias",
      title: "Devoluciones y garantías",
      items: [
        { q: "¿Puedo devolver un producto?", a: "Sí, conforme a la ley y a las políticas del fabricante. Debe estar en correcto estado y dentro de los tiempos establecidos." },
        { q: "Producto dañado o incompleto", a: "Repórtalo en un plazo razonable adjuntando fotos. Gestionaremos cambio o reembolso según evaluación." },
        { q: "¿Cómo tramito la garantía?", a: "Contáctanos con el número de pedido y evidencia. Revisaremos con el fabricante y te guiaremos en el proceso." },
      ],
    },
    {
      id: "cuenta-seguridad",
      title: "Cuenta y seguridad",
      items: [
        { q: "¿Cómo creo una cuenta?", a: "Desde la opción Mi cuenta puedes registrarte con correo o proveedores habilitados." },
        { q: "Olvidé mi contraseña", a: "Usa la opción de recuperación en Mi cuenta. Revisa tu correo (incluida la carpeta de spam)." },
        { q: "Privacidad de mis datos", a: "Tratamos tus datos conforme a nuestra política de protección de datos. Puedes consultar tus derechos en la sección Responsabilidad." },
      ],
    },
  ]

  const quickLinks = [
    { href: "/contacto", label: "Contacto" },
    { href: "/cuenta", label: "Mi cuenta" },
    { href: "/responsabilidad", label: "Protección de datos" },
    { href: "/cumplimiento", label: "Políticas corporativas" },
  ]

  

  return (
    <MainLayout>
      <div className="min-h-screen" style={{ backgroundColor: '#FCFFEF' }}>
        <div className="bg-[#196428] text-white py-1 overflow-hidden">
          <div className="animate-scroll whitespace-nowrap text-sm font-bold" style={{ animationDuration: '40s' }}>
            <span className="inline-block mr-8">Centro de Ayuda</span>
            <span className="inline-block mr-8">Centro de Ayuda</span>
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
                <span className="text-gray-900">Ayuda y preguntas frecuentes</span>
              </nav>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl text-gray-900 mb-10 text-center" style={{ fontFamily: 'HelveticaNeueHeavy, sans-serif', fontWeight: '900' }}>
              Ayuda y preguntas frecuentes
            </h1>

            {/* Accesos rápidos */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
              {quickLinks.map((l) => (
                <Link key={l.href} href={l.href} className="bg-white text-center rounded-lg p-3 shadow-sm border hover:border-[#196428] hover:shadow transition">
                  <span className="text-sm font-medium text-gray-800">{l.label}</span>
                </Link>
              ))}
            </div>

            {/* Buscador simple (cliente) */}
            <div className="mb-10">
              <label className="block text-sm text-gray-600 mb-1">Busca en las preguntas</label>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Escribe una palabra clave (ej. envío, pago, garantía)"
                className="w-full h-11 px-4 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#196428]"
              />
            </div>

            {/* Índice por categorías */}
            <div className="flex flex-wrap gap-2 mb-8">
              {sections.map((s) => (
                <a key={s.id} href={`#${s.id}`} className="text-sm px-3 py-1 rounded-full bg-white border text-gray-800 hover:border-[#196428] hover:text-[#196428] transition">
                  {s.title}
                </a>
              ))}
            </div>

            {/* Secciones de FAQ */}
            <div className="space-y-10">
              {sections.map((s) => (
                <section key={s.id} id={s.id} className="scroll-mt-24">
                  <h2 className="text-2xl sm:text-3xl text-gray-900 mb-4">{s.title}</h2>
                  <div className="space-y-4">
                    {(searchQuery
                      ? s.items.filter(it => (it.q + it.a).toLowerCase().includes(searchQuery.toLowerCase()))
                      : s.items
                    ).map((f, idx) => (
                      <div key={idx} className="bg-white rounded-lg p-5 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-900">{f.q}</h3>
                        <p className="text-gray-700 mt-2">{f.a}</p>
                      </div>)
                    )}
                  </div>
                </section>
              ))}
            </div>

            {/* CTA de contacto */}
            <div className="mt-12 bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-xl font-semibold text-gray-900">¿Aún necesitas ayuda?</h3>
              <p className="text-gray-700 mt-1">Visita la página de Contacto para ver teléfonos, ubicaciones y nuestro mapa interactivo.</p>
              <div className="mt-4">
                <Link href="/contacto" className="inline-block bg-[#196428] text-white px-5 py-2 rounded-md hover:opacity-90 transition">Ir a Contacto</Link>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </MainLayout>
  )
}



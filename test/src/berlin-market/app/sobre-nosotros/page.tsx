"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import MainLayout from "../components/MainLayout"
import Header from "../components/Header"
import Footer from "../components/Footer"
import AccountPopoverContent from "../components/AccountPopoverContent"
import supabase, { SobreNosotros } from "@/lib/supabase"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"

export default function AboutUs() {
  const [searchQuery, setSearchQuery] = useState("")
  const [contenido, setContenido] = useState<SobreNosotros | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAccountDrawerOpen, setIsAccountDrawerOpen] = useState(false)

  useEffect(() => {
    const cargarContenido = async () => {
      try {
        const { data, error } = await supabase
          .from('sobre_nosotros')
          .select('*')
          .eq('id', 1)
          .single()

        if (error) {
          console.error('Error cargando contenido:', error)
        } else {
          setContenido(data)
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    cargarContenido()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Searching for:", searchQuery)
  }

  // Valores por defecto si no hay datos cargados
  const datos = contenido || {
    banner_texto: 'Comprometidos con la excelencia',
    mision_titulo: 'Misión',
    mision_parrafo1: 'Brindar productos agropecuarios y farmacéuticos de alta calidad, junto con asesoría técnica y profesional, para mejorar la productividad del campo y la salud de nuestras comunidades.',
    mision_parrafo2: 'Nos enfocamos en atender con responsabilidad social y cercanía a nuestros clientes, impulsando el desarrollo rural, el mejoramiento de la salud y el crecimiento sostenible en los territorios donde hacemos presencia.',
    vision_titulo: 'Visión',
    vision_parrafo1: 'En el 2028 Ser una empresa reconocida en varios departamentos de Colombia por ofrecer soluciones integrales en insumos agropecuarios y productos farmacéuticos, destacándonos por la calidad, el servicio humano y la cercanía con nuestras comunidades.',
    vision_parrafo2: 'Nos proyectamos como un aliado estratégico para el desarrollo del campo y la salud, comprometidos con la sostenibilidad, la innovación y el bienestar de las personas y productores en las regiones donde operamos.',
    identidad_titulo: 'Identidad Corporativa',
    identidad_banner_texto: 'Nuestros valores en acción',
    valores_titulo: 'Valores Corporativos',
    valor1_titulo: 'Trabajo en equipo',
    valor1_descripcion: 'Fomentamos un entorno colaborativo donde el respeto, la comunicación y la diversidad de ideas permiten alcanzar objetivos comunes. Creemos que los mejores resultados se logran cuando trabajamos unidos.',
    valor2_titulo: 'Transparencia',
    valor2_descripcion: 'Nos conducimos con claridad, honestidad y apertura en todas nuestras interacciones. Creemos que una comunicación veraz fortalece la confianza y genera relaciones duraderas.',
    valor3_titulo: 'Integridad',
    valor3_descripcion: 'Actuamos con ética, coherencia y responsabilidad en cada decisión. Mantenemos nuestro compromiso con lo correcto, porque sabemos que la confianza se construye con hechos.',
    valor4_titulo: 'Sostenibilidad',
    valor4_descripcion: 'Trabajamos pensando en el largo plazo. Promovemos prácticas responsables con el medio ambiente, la sociedad y la economía, comprometidos con generar un impacto positivo.',
    valor5_titulo: 'Responsabilidad',
    valor5_descripcion: 'Asumimos nuestras acciones con seriedad y compromiso. Cumplimos lo que prometemos, respondemos por nuestros resultados y buscamos mejorar continuamente.',
    valor6_titulo: 'Creatividad',
    valor6_descripcion: 'Impulsamos la innovación como motor de transformación. Fomentamos un entorno donde las ideas nuevas son bienvenidas y la solución de problemas se aborda con originalidad.',
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
          onAccountClick={() => setIsAccountDrawerOpen(true)}
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

            {/* Misión y Visión */}
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 mb-20">
              {/* Misión */}
              <div className="space-y-4">
                <h2 className="text-2xl sm:text-3xl font-light text-gray-900 border-b border-gray-200 pb-2">
                  {datos.mision_titulo}
                </h2>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  {datos.mision_parrafo1}
                </p>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  {datos.mision_parrafo2}
                </p>
              </div>

              {/* Visión */}
              <div className="space-y-4">
                <h2 className="text-2xl sm:text-3xl font-light text-gray-900 border-b border-gray-200 pb-2">
                  {datos.vision_titulo}
                </h2>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  {datos.vision_parrafo1}
                </p>
                <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                  {datos.vision_parrafo2}
                </p>
              </div>
            </div>

            {/* Valores Corporativos */}
            <div className="space-y-12">
              <div className="text-center">
                <h2 className="text-4xl sm:text-5xl md:text-6xl text-gray-900 mb-12" style={{ fontFamily: 'HelveticaNeueHeavy, sans-serif', fontWeight: '900' }}>{datos.identidad_titulo}</h2>

                <p className="text-xl sm:text-2xl text-gray-600">{datos.valores_titulo}</p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Valor 1 */}
                <div className="space-y-3">
                  <h3 className="text-lg sm:text-xl font-medium text-gray-900">
                    {datos.valor1_titulo}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {datos.valor1_descripcion}
                  </p>
                </div>

                {/* Valor 2 */}
                <div className="space-y-3">
                  <h3 className="text-lg sm:text-xl font-medium text-gray-900">
                    {datos.valor2_titulo}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {datos.valor2_descripcion}
                  </p>
                </div>

                {/* Valor 3 */}
                <div className="space-y-3">
                  <h3 className="text-lg sm:text-xl font-medium text-gray-900">
                    {datos.valor3_titulo}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {datos.valor3_descripcion}
                  </p>
                </div>

                {/* Valor 4 */}
                <div className="space-y-3">
                  <h3 className="text-lg sm:text-xl font-medium text-gray-900">
                    {datos.valor4_titulo}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {datos.valor4_descripcion}
                  </p>
                </div>

                {/* Valor 5 */}
                <div className="space-y-3">
                  <h3 className="text-lg sm:text-xl font-medium text-gray-900">
                    {datos.valor5_titulo}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {datos.valor5_descripcion}
                  </p>
                </div>

                {/* Valor 6 */}
                <div className="space-y-3">
                  <h3 className="text-lg sm:text-xl font-medium text-gray-900">
                    {datos.valor6_titulo}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {datos.valor6_descripcion}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>

      {/* Account Drawer for Mobile */}
      <Drawer open={isAccountDrawerOpen} onOpenChange={setIsAccountDrawerOpen}>
        <DrawerContent className="max-h-[85vh] z-[110]">
          <DrawerHeader className="text-center border-b border-gray-200">
            <DrawerTitle className="text-lg font-bold text-gray-800">Mi Cuenta</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-6">
            <AccountPopoverContent />
          </div>
        </DrawerContent>
      </Drawer>
    </MainLayout>
  )
}


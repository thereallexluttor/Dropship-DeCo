"use client"

import CategoryPage from "../templates/CategoryPage"
import Image from "next/image"
import Link from "next/link"
import { ShoppingBag, Eye, Palette, Hammer, Clock, MessageCircle } from "lucide-react"
import FadeInOnScroll from '../components/FadeInOnScroll'
import { useState } from 'react'

export default function PersonalizacionPage() {
  const [activeStep, setActiveStep] = useState(0)

  const designSteps = [
    {
      title: "Consulta Inicial",
      description: "Reunión personal con nuestros diseñadores para entender tu visión.",
      icon: MessageCircle,
      duration: "60 minutos"
    },
    {
      title: "Diseño Conceptual",
      description: "Creación de bocetos y renderizados 3D de tu pieza única.",
      icon: Palette,
      duration: "1-2 semanas"
    },
    {
      title: "Elaboración",
      description: "Fabricación artesanal de tu joya por nuestros maestros orfebres.",
      icon: Hammer,
      duration: "2-3 semanas"
    },
    {
      title: "Entrega",
      description: "Presentación de tu pieza única con certificado de autenticidad.",
      icon: Clock,
      duration: "1 semana"
    }
  ]

  return (
    <CategoryPage
      title="Personalización"
      subtitle="Tu Joya, Tu Historia"
      description="Crea una pieza única que refleje tu personalidad y estilo, guiado por nuestros expertos artesanos."
      heroImage="/cap3.jpg"
      features={[
        {
          title: "Diseño Exclusivo",
          description: "Cada pieza es única, diseñada específicamente para ti.",
          icon: "/icons/exclusive.png"
        },
        {
          title: "Artesanía Superior",
          description: "Elaboración artesanal por maestros orfebres con décadas de experiencia.",
          icon: "/icons/warranty.png"
        },
        {
          title: "Materiales Premium",
          description: "Selección de los mejores materiales y piedras preciosas.",
          icon: "/icons/diamond.png"
        }
      ]}
    >
      {/* Design Process */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-light mb-4">
                El Proceso de
                <span className="font-medium"> Diseño</span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Un viaje personalizado para crear la joya de tus sueños
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              <FadeInOnScroll>
                <div className="sticky top-32">
                  <div className="relative aspect-video rounded-lg overflow-hidden">
                    <Image
                      src="/cap2.jpg"
                      alt="Design Process"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white">
                          <h3 className="text-2xl font-light mb-4">
                            {designSteps[activeStep].title}
                          </h3>
                          <p className="text-white/80 max-w-md mx-auto mb-4">
                            {designSteps[activeStep].description}
                          </p>
                          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                            <Clock className="w-4 h-4" />
                            <span>{designSteps[activeStep].duration}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-8">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-500">Progreso</span>
                      <span className="text-sm font-medium">{((activeStep + 1) / designSteps.length * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#C6A55C] transition-all duration-500"
                        style={{ width: `${(activeStep + 1) / designSteps.length * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </FadeInOnScroll>

              <FadeInOnScroll delay={200}>
                <div className="space-y-6">
                  {designSteps.map((step, index) => (
                    <button
                      key={index}
                      className={`
                        w-full text-left p-6 rounded-lg transition-all duration-300
                        ${activeStep === index 
                          ? 'bg-gray-900 text-white' 
                          : 'bg-white hover:bg-gray-50'}
                      `}
                      onClick={() => setActiveStep(index)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`
                          p-3 rounded-full
                          ${activeStep === index 
                            ? 'bg-[#C6A55C]' 
                            : 'bg-gray-100'}
                        `}>
                          <step.icon className={`
                            w-6 h-6
                            ${activeStep === index 
                              ? 'text-white' 
                              : 'text-gray-500'}
                          `} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-medium mb-2">
                            {step.title}
                          </h3>
                          <p className={activeStep === index ? 'text-gray-300' : 'text-gray-600'}>
                            {step.description}
                          </p>
                          <div className={`
                            mt-4 text-sm flex items-center gap-2
                            ${activeStep === index ? 'text-gray-300' : 'text-gray-500'}
                          `}>
                            <Clock className="w-4 h-4" />
                            <span>{step.duration}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </FadeInOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Custom Pieces */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-light mb-4">
              Creaciones
              <span className="font-medium"> Recientes</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Descubre algunas de nuestras últimas joyas personalizadas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <FadeInOnScroll key={item} delay={item * 100}>
                <div className="group">
                  <div className="relative aspect-[4/5] rounded-lg overflow-hidden mb-6">
                    <Image
                      src="/placeholder.svg"
                      alt="Custom Jewelry"
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <button className="bg-white text-black px-6 py-3 rounded-full flex items-center gap-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#C6A55C] hover:text-white">
                          <Eye className="w-4 h-4" />
                          <span>Ver Historia</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-lg font-medium mb-2 group-hover:text-gray-900 transition-colors">
                    Anillo de Compromiso Personalizado
                  </h3>
                  <p className="text-gray-600 text-sm">
                    "Una pieza única que captura nuestra historia de amor"
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <Image
                        src="/placeholder.svg"
                        alt="Client"
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">María G.</div>
                      <div className="text-gray-500">Madrid</div>
                    </div>
                  </div>
                </div>
              </FadeInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Design Options */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <FadeInOnScroll>
                <div className="space-y-6">
                  <h2 className="text-3xl font-light">
                    Opciones de
                    <span className="block font-medium">Personalización</span>
                  </h2>
                  <p className="text-gray-400 leading-relaxed">
                    Explora las infinitas posibilidades para crear tu joya perfecta.
                  </p>
                  <div className="space-y-8 pt-6">
                    {[
                      {
                        title: "Diseño",
                        description: "Desde clásico hasta contemporáneo, adaptamos el diseño a tu estilo."
                      },
                      {
                        title: "Materiales",
                        description: "Elige entre oro, platino y una amplia selección de piedras preciosas."
                      },
                      {
                        title: "Acabados",
                        description: "Diferentes texturas y acabados para lograr el look perfecto."
                      },
                      {
                        title: "Grabado",
                        description: "Añade un mensaje personal o fecha especial a tu pieza."
                      }
                    ].map((option, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-[#C6A55C] font-medium">{index + 1}</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium mb-2">{option.title}</h3>
                          <p className="text-gray-400">{option.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeInOnScroll>

              <FadeInOnScroll delay={200}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="relative aspect-square rounded-lg overflow-hidden">
                      <Image
                        src="/cap1.jpg"
                        alt="Custom Design Options"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="relative aspect-square rounded-lg overflow-hidden">
                      <Image
                        src="/cap4.jpg"
                        alt="Custom Design Options"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="relative aspect-[9/16] rounded-lg overflow-hidden">
                    <Image
                      src="/cap2.jpg"
                      alt="Custom Design Options"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </FadeInOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* Start Your Journey */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <FadeInOnScroll>
              <h2 className="text-3xl font-light mb-6">
                Comienza Tu
                <span className="font-medium"> Historia</span>
              </h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Da el primer paso para crear una joya única que cuente tu historia.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/consulta"
                  className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-sm hover:bg-[#C6A55C] transition-all duration-300"
                >
                  <span>Agendar Consulta</span>
                  <svg 
                    className="w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
                <Link
                  href="/inspiracion"
                  className="inline-flex items-center justify-center gap-2 border border-gray-900 text-gray-900 px-8 py-3 rounded-sm hover:bg-gray-900 hover:text-white transition-all duration-300"
                >
                  <span>Galería de Inspiración</span>
                  <svg 
                    className="w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </FadeInOnScroll>
          </div>
        </div>
      </section>

      {/* New section for Joyas Personalizadas */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-light mb-4">
                Joyas <span className="font-medium">Personalizadas</span>
              </h2>
              <p className="text-gray-600 text-sm">
                Crea tu joya única con nuestro servicio de personalización, donde tus ideas se transforman en piezas excepcionales hechas a medida.
              </p>
            </div>
            <div className="flex gap-4 mt-6 md:mt-0">
              <button className="px-6 py-2 border border-[#C6A55C] text-[#C6A55C] hover:bg-[#C6A55C] hover:text-white transition-colors duration-300 text-sm rounded-full">
                Filtrar
              </button>
              <button className="px-6 py-2 border border-[#C6A55C] text-[#C6A55C] hover:bg-[#C6A55C] hover:text-white transition-colors duration-300 text-sm rounded-full">
                Ordenar
              </button>
            </div>
          </div>

          {/* Rest of the component content remains unchanged */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <FadeInOnScroll key={item} delay={item * 100}>
                <div className="group">
                  <div className="relative aspect-[4/5] rounded-lg overflow-hidden mb-6">
                    <Image
                      src="/placeholder.svg"
                      alt="Custom Jewelry"
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <button className="bg-white text-black px-6 py-3 rounded-full flex items-center gap-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#C6A55C] hover:text-white">
                          <Eye className="w-4 h-4" />
                          <span>Ver Historia</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 group-hover/title:text-[#C6A55C] transition-colors duration-300">
                    Diseño Personalizado "Unique"
                  </h3>
                  <p className="text-xs text-gray-500">Colección Custom</p>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <Image
                        src="/placeholder.svg"
                        alt="Client"
                        width={32}
                        height={32}
                        className="object-cover"
                      />
                    </div>
                    <div className="text-sm">
                      <div className="font-medium">María G.</div>
                      <div className="text-gray-500">Madrid</div>
                    </div>
                  </div>
                </div>
              </FadeInOnScroll>
            ))}
          </div>
        </div>
      </section>
    </CategoryPage>
  )
} 
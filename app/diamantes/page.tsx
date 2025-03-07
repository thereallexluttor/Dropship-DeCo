"use client"

import CategoryPage from "../templates/CategoryPage"
import Image from "next/image"
import Link from "next/link"
import { ShoppingBag, Eye, ZoomIn } from "lucide-react"
import FadeInOnScroll from '../components/FadeInOnScroll'
import { useState } from 'react'

export default function DiamantesPage() {
  const [activeTab, setActiveTab] = useState(0)

  const diamondQualities = [
    {
      title: "Color",
      description: "Del incoloro al ligeramente amarillo",
      scale: ["D", "E", "F", "G", "H", "I", "J", "K"],
      current: "D-F"
    },
    {
      title: "Claridad",
      description: "Pureza interna del diamante",
      scale: ["IF", "VVS1", "VVS2", "VS1", "VS2", "SI1", "SI2"],
      current: "VVS1"
    },
    {
      title: "Corte",
      description: "Proporciones y simetría",
      scale: ["Excelente", "Muy Bueno", "Bueno", "Regular"],
      current: "Excelente"
    },
    {
      title: "Quilates",
      description: "Peso del diamante",
      scale: ["0.5", "1.0", "1.5", "2.0", "2.5", "3.0+"],
      current: "1.0"
    }
  ]

  return (
    <CategoryPage
      title="Diamantes"
      subtitle="Brillos Eternos"
      description="Descubre nuestra excepcional colección de diamantes certificados, donde cada piedra cuenta una historia de perfección y belleza."
      heroImage="/cap4.jpg"
      features={[
        {
          title: "Certificación GIA",
          description: "Todos nuestros diamantes están certificados por el Gemological Institute of America.",
          icon: "/icons/warranty.png"
        },
        {
          title: "Origen Ético",
          description: "Comprometidos con el proceso Kimberley y el abastecimiento responsable.",
          icon: "/icons/diamond.png"
        },
        {
          title: "Máxima Calidad",
          description: "Seleccionamos solo los diamantes de mayor calidad y pureza.",
          icon: "/icons/exclusive.png"
        }
      ]}
    >
      {/* Interactive Diamond Guide */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-light mb-4">
                Guía del
                <span className="font-medium"> Diamante</span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Explore las características que hacen único a cada diamante
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <FadeInOnScroll>
                <div className="relative aspect-square">
                  <div className="absolute inset-0 rounded-lg overflow-hidden group">
                    <Image
                      src="/cap2.jpg"
                      alt="Diamond Close-up"
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300">
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button className="bg-white text-black p-4 rounded-full">
                          <ZoomIn className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeInOnScroll>

              <FadeInOnScroll delay={200}>
                <div className="space-y-8">
                  <div className="flex gap-4 overflow-x-auto pb-4">
                    {diamondQualities.map((quality, index) => (
                      <button
                        key={index}
                        className={`
                          px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap
                          transition-all duration-300
                          ${activeTab === index 
                            ? 'bg-gray-900 text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                        `}
                        onClick={() => setActiveTab(index)}
                      >
                        {quality.title}
                      </button>
                    ))}
                  </div>

                  <div className="bg-white p-8 rounded-lg shadow-lg">
                    <h3 className="text-2xl font-medium mb-4">
                      {diamondQualities[activeTab].title}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {diamondQualities[activeTab].description}
                    </p>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {diamondQualities[activeTab].scale.map((value, index) => (
                          <div
                            key={index}
                            className={`
                              px-4 py-2 rounded-full text-sm
                              ${value === diamondQualities[activeTab].current
                                ? 'bg-[#C6A55C] text-white'
                                : 'bg-gray-100 text-gray-600'}
                            `}
                          >
                            {value}
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 mt-4">
                        Calidad seleccionada: {diamondQualities[activeTab].current}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeInOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* Collection Showcase */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-light mb-4">
                Joyas con <span className="font-medium">Diamantes</span>
              </h2>
              <p className="text-gray-600 text-sm">
                Explora nuestra colección de joyas con diamantes certificados GIA, donde cada piedra es seleccionada cuidadosamente por su pureza y brillo excepcional.
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <FadeInOnScroll key={item} delay={item * 100}>
                <div className="group">
                  <div className="relative aspect-[4/5] rounded-lg overflow-hidden mb-6">
                    <Image
                      src="/placeholder.svg"
                      alt="Diamond Jewelry"
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <button className="bg-white text-black px-6 py-3 rounded-full flex items-center gap-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#C6A55C] hover:text-white">
                          <Eye className="w-4 h-4" />
                          <span>Vista Rápida</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-900 group-hover/title:text-[#C6A55C] transition-colors duration-300">
                      Solitario Diamante "Brilliance"
                    </h3>
                    <p className="text-xs text-gray-500">Colección Diamantes</p>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-lg font-medium">12.999 €</span>
                      <button className="p-2 rounded-full text-gray-400 hover:text-gray-900 transition-colors duration-300">
                        <ShoppingBag className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </FadeInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Diamond Education */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <FadeInOnScroll>
                <div className="space-y-6">
                  <h2 className="text-3xl font-light">
                    El Conocimiento es
                    <span className="block font-medium">Poder</span>
                  </h2>
                  <p className="text-gray-400 leading-relaxed">
                    Comprenda las características que hacen único a cada diamante y 
                    tome una decisión informada en su compra.
                  </p>
                  <div className="grid grid-cols-2 gap-8 pt-8">
                    {[
                      {
                        number: "4C",
                        title: "Criterios",
                        description: "Color, Claridad, Corte, Quilates"
                      },
                      {
                        number: "GIA",
                        title: "Certificación",
                        description: "Estándar internacional"
                      },
                      {
                        number: "100%",
                        title: "Trazabilidad",
                        description: "Origen verificado"
                      },
                      {
                        number: "∞",
                        title: "Durabilidad",
                        description: "El mineral más duro"
                      }
                    ].map((stat, index) => (
                      <div key={index} className="text-center">
                        <div className="text-2xl font-medium text-[#C6A55C] mb-2">
                          {stat.number}
                        </div>
                        <div className="text-sm font-medium mb-1">{stat.title}</div>
                        <div className="text-xs text-gray-400">{stat.description}</div>
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
                        alt="Diamond Education"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="relative aspect-square rounded-lg overflow-hidden">
                      <Image
                        src="/cap3.jpg"
                        alt="Diamond Education"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="relative aspect-[9/16] rounded-lg overflow-hidden">
                    <Image
                      src="/cap4.jpg"
                      alt="Diamond Education"
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

      {/* Expert Consultation */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <FadeInOnScroll>
              <h2 className="text-3xl font-light mb-6">
                Asesoramiento
                <span className="font-medium"> Experto</span>
              </h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Nuestros gemólogos certificados están disponibles para guiarte en la 
                selección del diamante perfecto para tu joya.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/consulta"
                  className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-sm hover:bg-[#C6A55C] transition-all duration-300"
                >
                  <span>Solicitar Cita</span>
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
                  href="/educacion-diamantes"
                  className="inline-flex items-center justify-center gap-2 border border-gray-900 text-gray-900 px-8 py-3 rounded-sm hover:bg-gray-900 hover:text-white transition-all duration-300"
                >
                  <span>Aprender Más</span>
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
    </CategoryPage>
  )
} 
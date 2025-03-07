"use client"

import CategoryPage from "../templates/CategoryPage"
import Image from "next/image"
import Link from "next/link"
import { ShoppingBag, Eye, Info } from "lucide-react"
import FadeInOnScroll from '../components/FadeInOnScroll'
import { useState } from 'react'

export default function PiedrasPreciosasPage() {
  const [selectedStone, setSelectedStone] = useState('ruby')

  const stones = {
    ruby: {
      name: "Rubí",
      color: "Rojo intenso",
      hardness: "9.0",
      origin: "Myanmar, Tailandia",
      description: "Símbolo de pasión y amor, el rubí es una de las piedras más valiosas y codiciadas."
    },
    sapphire: {
      name: "Zafiro",
      color: "Azul profundo",
      hardness: "9.0",
      origin: "Sri Lanka, Madagascar",
      description: "Conocido por su intenso color azul y su excepcional dureza, símbolo de nobleza."
    },
    emerald: {
      name: "Esmeralda",
      color: "Verde vivo",
      hardness: "7.5-8.0",
      origin: "Colombia, Zambia",
      description: "La reina de las piedras verdes, símbolo de esperanza y renovación."
    },
    tanzanite: {
      name: "Tanzanita",
      color: "Azul violáceo",
      hardness: "6.5-7.0",
      origin: "Tanzania",
      description: "Una gema moderna con un color único y cautivador."
    }
  }

  return (
    <CategoryPage
      title="Piedras Preciosas"
      subtitle="Colores de la Naturaleza"
      description="Explora nuestra selecta colección de piedras preciosas, cada una con su propia historia y carácter único."
      heroImage="/cap1.jpg"
      features={[
        {
          title: "Origen Certificado",
          description: "Todas nuestras piedras preciosas cuentan con certificación de origen y calidad.",
          icon: "/icons/warranty.png"
        },
        {
          title: "Selección Experta",
          description: "Cada piedra es cuidadosamente seleccionada por nuestros gemólogos expertos.",
          icon: "/icons/diamond.png"
        },
        {
          title: "Piezas Únicas",
          description: "Cada joya es única, reflejando la belleza natural de cada piedra.",
          icon: "/icons/exclusive.png"
        }
      ]}
    >
      {/* Interactive Stone Selector */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-light mb-4">
                Descubre las
                <span className="font-medium"> Piedras Preciosas</span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Cada piedra preciosa tiene su propia personalidad y significado
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              <FadeInOnScroll>
                <div className="sticky top-32">
                  <div className="relative aspect-square rounded-lg overflow-hidden">
                    <Image
                      src="/cap2.jpg"
                      alt={stones[selectedStone as keyof typeof stones].name}
                      fill
                      className="object-cover transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0">
                      <div className="absolute bottom-8 left-8 right-8">
                        <h3 className="text-3xl font-light text-white mb-2">
                          {stones[selectedStone as keyof typeof stones].name}
                        </h3>
                        <p className="text-white/80">
                          {stones[selectedStone as keyof typeof stones].description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <div className="text-sm text-gray-500 mb-1">Dureza</div>
                      <div className="text-xl font-medium">
                        {stones[selectedStone as keyof typeof stones].hardness}
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm">
                      <div className="text-sm text-gray-500 mb-1">Color</div>
                      <div className="text-xl font-medium">
                        {stones[selectedStone as keyof typeof stones].color}
                      </div>
                    </div>
                  </div>
                </div>
              </FadeInOnScroll>

              <FadeInOnScroll delay={200}>
                <div className="space-y-6">
                  {Object.entries(stones).map(([key, stone]) => (
                    <button
                      key={key}
                      className={`
                        w-full text-left p-6 rounded-lg transition-all duration-300
                        ${selectedStone === key 
                          ? 'bg-gray-900 text-white' 
                          : 'bg-white hover:bg-gray-50'}
                      `}
                      onClick={() => setSelectedStone(key)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-medium mb-2">{stone.name}</h3>
                          <p className={selectedStone === key ? 'text-gray-300' : 'text-gray-600'}>
                            {stone.description}
                          </p>
                          <div className={`mt-4 text-sm ${selectedStone === key ? 'text-gray-300' : 'text-gray-500'}`}>
                            Origen: {stone.origin}
                          </div>
                        </div>
                        <Info className={`w-5 h-5 ${selectedStone === key ? 'text-[#C6A55C]' : 'text-gray-400'}`} />
                      </div>
                    </button>
                  ))}
                </div>
              </FadeInOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collection */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-light mb-4">
                Joyas con <span className="font-medium">Piedras Preciosas</span>
              </h2>
              <p className="text-gray-600 text-sm">
                Descubre nuestra colección de joyas con piedras preciosas de la más alta calidad, cada una seleccionada por su color, claridad y brillo excepcional.
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
            {[1, 2, 3].map((item) => (
              <FadeInOnScroll key={item} delay={item * 100}>
                <div className="group">
                  <div className="relative aspect-[4/5] rounded-lg overflow-hidden mb-6">
                    <Image
                      src="/placeholder.svg"
                      alt="Precious Stone Jewelry"
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
                  <h3 className="text-sm font-medium text-gray-900 group-hover/title:text-[#C6A55C] transition-colors duration-300">
                    Anillo Zafiro "Royal Blue"
                  </h3>
                  <p className="text-xs text-gray-500">Colección Gemas</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium">5.999 €</span>
                    <button className="p-2 rounded-full text-gray-400 hover:text-gray-900 transition-colors duration-300">
                      <ShoppingBag className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </FadeInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Care Guide */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <FadeInOnScroll>
                <div className="space-y-6">
                  <h2 className="text-3xl font-light">
                    Guía de
                    <span className="block font-medium">Cuidado</span>
                  </h2>
                  <p className="text-gray-400 leading-relaxed">
                    Mantén el brillo y la belleza de tus piedras preciosas siguiendo 
                    nuestras recomendaciones de cuidado experto.
                  </p>
                  <div className="space-y-8 pt-6">
                    {[
                      {
                        title: "Limpieza Regular",
                        description: "Utiliza agua tibia y jabón suave, evitando productos químicos agresivos."
                      },
                      {
                        title: "Almacenamiento",
                        description: "Guarda cada pieza por separado para evitar rayones entre las piedras."
                      },
                      {
                        title: "Protección",
                        description: "Evita el contacto con perfumes, cremas y productos químicos."
                      }
                    ].map((tip, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-[#C6A55C] font-medium">{index + 1}</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium mb-2">{tip.title}</h3>
                          <p className="text-gray-400">{tip.description}</p>
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
                        src="/cap3.jpg"
                        alt="Stone Care"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="relative aspect-square rounded-lg overflow-hidden">
                      <Image
                        src="/cap4.jpg"
                        alt="Stone Care"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="relative aspect-[9/16] rounded-lg overflow-hidden">
                    <Image
                      src="/cap1.jpg"
                      alt="Stone Care"
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
                <span className="font-medium"> Personalizado</span>
              </h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Nuestros expertos en gemología te ayudarán a elegir la piedra 
                preciosa perfecta para tu joya.
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
                  href="/guia-piedras"
                  className="inline-flex items-center justify-center gap-2 border border-gray-900 text-gray-900 px-8 py-3 rounded-sm hover:bg-gray-900 hover:text-white transition-all duration-300"
                >
                  <span>Guía Completa</span>
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
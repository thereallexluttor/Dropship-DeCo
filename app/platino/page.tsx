"use client"

import CategoryPage from "../templates/CategoryPage"
import Image from "next/image"
import Link from "next/link"
import { ShoppingBag, Eye, Play } from "lucide-react"
import FadeInOnScroll from '../components/FadeInOnScroll'

export default function PlatinoPage() {
  return (
    <CategoryPage
      title="Platino"
      subtitle="Elegancia Eterna"
      description="Descubre la pureza y el brillo eterno del platino, el metal precioso más noble y duradero en alta joyería."
      heroImage="/cap3.jpg"
      features={[
        {
          title: "95% Pureza",
          description: "Nuestro platino tiene una pureza garantizada del 95%, superando los estándares internacionales.",
          icon: "/icons/warranty.png"
        },
        {
          title: "Resistencia Superior",
          description: "El platino es 30 veces más raro que el oro y significativamente más duradero.",
          icon: "/icons/diamond.png"
        },
        {
          title: "Hipoalergénico",
          description: "Ideal para pieles sensibles, el platino es naturalmente hipoalergénico.",
          icon: "/icons/exclusive.png"
        }
      ]}
    >
      {/* Unique Properties */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <FadeInOnScroll>
                <div className="relative aspect-square">
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg transform -rotate-6"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-white rounded-lg transform rotate-3">
                    <Image
                      src="/cap4.jpg"
                      alt="Platino Puro"
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                </div>
              </FadeInOnScroll>

              <FadeInOnScroll delay={200}>
                <div className="space-y-8">
                  <h2 className="text-4xl font-light">
                    La Nobleza del
                    <span className="block font-medium text-gray-900">Platino</span>
                  </h2>
                  
                  <div className="space-y-6">
                    {[
                      {
                        title: "Pureza Excepcional",
                        description: "El platino utilizado en nuestras joyas tiene una pureza del 95%, creando piezas de una calidad incomparable."
                      },
                      {
                        title: "Brillo Eterno",
                        description: "A diferencia de otros metales, el platino mantiene su brillo y color blanquecino natural a lo largo del tiempo."
                      },
                      {
                        title: "Durabilidad Superior",
                        description: "Su densidad y dureza hacen del platino el metal ideal para joyas que perdurarán generaciones."
                      }
                    ].map((feature, index) => (
                      <div key={index} className="group">
                        <h3 className="text-xl font-medium mb-2 group-hover:text-gray-900 transition-colors">
                          {feature.title}
                        </h3>
                        <p className="text-gray-600 leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeInOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="relative aspect-[21/9] rounded-lg overflow-hidden">
            <Image
              src="/cap1.jpg"
              alt="Crafting Process"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm">
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="group relative">
                  <div className="absolute inset-0 bg-white/20 rounded-full blur-xl group-hover:bg-white/30 transition-colors duration-300"></div>
                  <div className="relative w-20 h-20 flex items-center justify-center rounded-full bg-white text-black hover:scale-110 transition-transform duration-300">
                    <Play className="w-8 h-8" />
                  </div>
                </button>
              </div>
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
                Joyas de <span className="font-medium">Platino</span>
              </h2>
              <p className="text-gray-600 text-sm">
                Explora nuestra colección de joyas en platino puro, donde la elegancia y la durabilidad se combinan para crear piezas verdaderamente excepcionales.
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

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((item) => (
              <FadeInOnScroll key={item} delay={item * 100}>
                <div className="group">
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-6">
                    <Image
                      src="/placeholder.svg"
                      alt="Platinum Jewelry"
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <button className="bg-white text-black px-6 py-3 rounded-full flex items-center gap-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-gray-900 hover:text-white">
                          <Eye className="w-4 h-4" />
                          <span>Vista Rápida</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 group-hover/title:text-[#C6A55C] transition-colors duration-300">
                    Anillo Platino "Pure"
                  </h3>
                  <p className="text-xs text-gray-500">Colección Platinum</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium">3.999 €</span>
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

      {/* Care Instructions */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <FadeInOnScroll>
                <div className="space-y-6">
                  <h2 className="text-3xl font-light">
                    Cuidado del
                    <span className="block font-medium text-white">Platino</span>
                  </h2>
                  <p className="text-gray-400 leading-relaxed">
                    El platino es conocido por su durabilidad y resistencia, pero un cuidado adecuado 
                    asegurará que sus joyas mantengan su belleza atemporal.
                  </p>
                  <div className="space-y-8 pt-6">
                    {[
                      {
                        title: "Limpieza Regular",
                        description: "Use un paño suave y una solución específica para platino"
                      },
                      {
                        title: "Almacenamiento",
                        description: "Guarde sus joyas de platino por separado para evitar rayones"
                      },
                      {
                        title: "Mantenimiento Profesional",
                        description: "Recomendamos una revisión anual por nuestros expertos"
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
                <div className="relative aspect-square">
                  <Image
                    src="/cap2.jpg"
                    alt="Platinum Care"
                    fill
                    className="object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent rounded-lg"></div>
                </div>
              </FadeInOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* Consultation CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <FadeInOnScroll>
              <h2 className="text-3xl font-light mb-6">
                Asesoramiento
                <span className="font-medium"> Personalizado</span>
              </h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Nuestros expertos en platino están disponibles para guiarte en la selección 
                de la pieza perfecta que refleje tu estilo único.
              </p>
              <Link
                href="/consulta"
                className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-sm hover:bg-[#C6A55C] transition-all duration-300"
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
            </FadeInOnScroll>
          </div>
        </div>
      </section>
    </CategoryPage>
  )
} 
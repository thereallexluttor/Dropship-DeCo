"use client"

import CategoryPage from "../templates/CategoryPage"
import Image from "next/image"
import Link from "next/link"
import { ShoppingBag, Eye } from "lucide-react"
import FadeInOnScroll from '../components/FadeInOnScroll'

export default function Oro18kPage() {
  return (
    <CategoryPage
      title="Oro 18k"
      subtitle="La Pureza del Lujo"
      description="Descubre nuestra exclusiva colección de joyas en oro de 18 quilates, donde cada pieza es una obra maestra de pureza y elegancia."
      heroImage="/cap1.jpg"
      features={[
        {
          title: "Pureza Garantizada",
          description: "Todas nuestras piezas están certificadas con 18 quilates de pureza, garantizando la más alta calidad.",
          icon: "/icons/warranty.png"
        },
        {
          title: "Artesanía Superior",
          description: "Cada joya es creada por maestros artesanos con décadas de experiencia en orfebrería.",
          icon: "/icons/exclusive.png"
        },
        {
          title: "Diseño Atemporal",
          description: "Creaciones que trascienden las tendencias, convirtiéndose en legados familiares.",
          icon: "/icons/diamond.png"
        }
      ]}
    >
      {/* Collection Highlights */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <FadeInOnScroll>
              <div className="space-y-6">
                <h2 className="text-3xl font-light">
                  El Arte del
                  <span className="block font-medium text-[#C6A55C]">Oro 18k</span>
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  El oro de 18 quilates representa la perfecta combinación entre pureza y durabilidad. 
                  Con un 75% de oro puro, nuestras joyas mantienen el prestigioso color dorado mientras 
                  ofrecen la resistencia necesaria para convertirse en piezas eternas.
                </p>
                <div className="grid grid-cols-2 gap-6 pt-6">
                  <div>
                    <div className="text-3xl font-medium text-[#C6A55C]">75%</div>
                    <div className="text-sm text-gray-500">Oro Puro</div>
                  </div>
                  <div>
                    <div className="text-3xl font-medium text-[#C6A55C]">100%</div>
                    <div className="text-sm text-gray-500">Certificado</div>
                  </div>
                </div>
              </div>
            </FadeInOnScroll>
            <FadeInOnScroll delay={200}>
              <div className="relative aspect-square rounded-lg overflow-hidden">
                <Image
                  src="/cap2.jpg"
                  alt="Oro 18k Craftsmanship"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/20 hover:bg-black/40 transition-colors duration-300" />
              </div>
            </FadeInOnScroll>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-light mb-4">
                Joyas en <span className="font-medium">Oro 18k</span>
              </h2>
              <p className="text-gray-600 text-sm">
                Descubre nuestra exquisita colección de joyas en oro de 18 quilates, donde la tradición artesanal se une con diseños contemporáneos.
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <FadeInOnScroll key={item} delay={item * 100}>
                <div className="group">
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-4">
                    <Image
                      src="/placeholder.svg"
                      alt="Featured Product"
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300">
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        <button className="bg-white text-black px-6 py-3 rounded-full flex items-center gap-2 hover:bg-[#C6A55C] hover:text-white transition-colors duration-300">
                          <Eye className="w-4 h-4" />
                          <span>Vista Rápida</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 group-hover/title:text-[#C6A55C] transition-colors duration-300">
                    Collar Oro 18k "Elegance"
                  </h3>
                  <p className="text-xs text-gray-500">Colección Gold</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium">2.499 €</span>
                    <button className="p-2 rounded-full text-gray-400 hover:text-[#C6A55C] transition-colors duration-300">
                      <ShoppingBag className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </FadeInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Craftsmanship Process */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-light mb-4">
              El Proceso de
              <span className="font-medium"> Creación</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Cada pieza de oro 18k pasa por un meticuloso proceso artesanal
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Selección",
                description: "Cuidadosa selección del oro de 18 quilates más puro"
              },
              {
                step: "02",
                title: "Fundición",
                description: "Proceso de fundición a temperatura controlada"
              },
              {
                step: "03",
                title: "Modelado",
                description: "Creación de la forma mediante técnicas tradicionales"
              },
              {
                step: "04",
                title: "Acabado",
                description: "Pulido y acabado final para un brillo perfecto"
              }
            ].map((process, index) => (
              <FadeInOnScroll key={index} delay={index * 100}>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#C6A55C] to-[#E2C992] rounded-lg opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                  <div className="relative bg-white p-6 rounded-lg">
                    <div className="text-4xl font-light text-[#C6A55C] mb-4">{process.step}</div>
                    <h3 className="text-xl font-medium mb-2">{process.title}</h3>
                    <p className="text-gray-600">{process.description}</p>
                  </div>
                </div>
              </FadeInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Quality Guarantee */}
      <section className="py-16 bg-black text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <FadeInOnScroll>
              <h2 className="text-3xl font-light mb-6">
                Garantía de
                <span className="font-medium text-[#C6A55C]"> Autenticidad</span>
              </h2>
              <p className="text-gray-400 mb-8">
                Cada pieza viene con un certificado de autenticidad que garantiza su pureza y origen
              </p>
              <Link
                href="/certificacion"
                className="inline-flex items-center gap-2 bg-[#C6A55C] text-white px-8 py-3 rounded-sm hover:bg-white hover:text-black transition-all duration-300"
              >
                <span>Más Información</span>
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
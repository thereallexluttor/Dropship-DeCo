"use client"

import CategoryPage from "../templates/CategoryPage"
import Image from "next/image"
import Link from "next/link"
import { ShoppingBag, Eye, Type, Pen, Heart } from "lucide-react"
import FadeInOnScroll from '../components/FadeInOnScroll'
import { useState } from 'react'

export default function GrabadoPage() {
  const [selectedStyle, setSelectedStyle] = useState('classic')

  const engravingStyles = {
    classic: {
      name: "Clásico",
      description: "Elegantes letras cursivas o romanas, perfectas para mensajes tradicionales.",
      examples: ["Amor Eterno", "Para Siempre", "14.02.2024"],
      price: "desde 49€"
    },
    modern: {
      name: "Moderno",
      description: "Diseños contemporáneos con tipografías minimalistas y símbolos.",
      examples: ["♡ forever", "m+j", "14·02·24"],
      price: "desde 59€"
    },
    artistic: {
      name: "Artístico",
      description: "Grabados ornamentales con diseños florales y motivos decorativos.",
      examples: ["❀ Anna ❀", "~Amor~", "♥2024♥"],
      price: "desde 79€"
    },
    custom: {
      name: "Personalizado",
      description: "Diseños únicos creados según tus especificaciones.",
      examples: ["Caligrafía", "Símbolos", "Dibujos"],
      price: "desde 99€"
    }
  }

  return (
    <CategoryPage
      title="Grabado"
      subtitle="Mensajes Eternos"
      description="Personaliza tus joyas con mensajes y símbolos que perdurarán para siempre."
      heroImage="/cap4.jpg"
      features={[
        {
          title: "Técnica Experta",
          description: "Grabado realizado por maestros artesanos con años de experiencia.",
          icon: "/icons/exclusive.png"
        },
        {
          title: "Múltiples Estilos",
          description: "Amplia variedad de tipografías y diseños para elegir.",
          icon: "/icons/warranty.png"
        },
        {
          title: "Personalización Total",
          description: "Creamos diseños únicos según tus preferencias.",
          icon: "/icons/diamond.png"
        }
      ]}
    >
      {/* Engraving Styles Selector */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-light mb-4">
                Estilos de
                <span className="font-medium"> Grabado</span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Elige entre nuestros estilos de grabado o crea uno personalizado
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              <FadeInOnScroll>
                <div className="sticky top-32">
                  <div className="relative aspect-square rounded-lg overflow-hidden">
                    <Image
                      src="/cap1.jpg"
                      alt={engravingStyles[selectedStyle as keyof typeof engravingStyles].name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center text-white max-w-md px-8">
                          <h3 className="text-3xl font-light mb-4">
                            Estilo {engravingStyles[selectedStyle as keyof typeof engravingStyles].name}
                          </h3>
                          <p className="text-white/80 mb-6">
                            {engravingStyles[selectedStyle as keyof typeof engravingStyles].description}
                          </p>
                          <div className="flex flex-wrap justify-center gap-3">
                            {engravingStyles[selectedStyle as keyof typeof engravingStyles].examples.map((example, index) => (
                              <span
                                key={index}
                                className="px-4 py-2 bg-white/10 rounded-full text-sm"
                              >
                                {example}
                              </span>
                            ))}
                          </div>
                          <div className="mt-6 text-[#C6A55C] font-medium">
                            {engravingStyles[selectedStyle as keyof typeof engravingStyles].price}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeInOnScroll>

              <FadeInOnScroll delay={200}>
                <div className="space-y-6">
                  {Object.entries(engravingStyles).map(([key, style]) => (
                    <button
                      key={key}
                      className={`
                        w-full text-left p-6 rounded-lg transition-all duration-300
                        ${selectedStyle === key 
                          ? 'bg-gray-900 text-white' 
                          : 'bg-white hover:bg-gray-50'}
                      `}
                      onClick={() => setSelectedStyle(key)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`
                          p-3 rounded-full
                          ${selectedStyle === key 
                            ? 'bg-[#C6A55C]' 
                            : 'bg-gray-100'}
                        `}>
                          {key === 'classic' && <Type className={`w-6 h-6 ${selectedStyle === key ? 'text-white' : 'text-gray-500'}`} />}
                          {key === 'modern' && <Pen className={`w-6 h-6 ${selectedStyle === key ? 'text-white' : 'text-gray-500'}`} />}
                          {key === 'artistic' && <Heart className={`w-6 h-6 ${selectedStyle === key ? 'text-white' : 'text-gray-500'}`} />}
                          {key === 'custom' && <Type className={`w-6 h-6 ${selectedStyle === key ? 'text-white' : 'text-gray-500'}`} />}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-medium mb-2">
                            Estilo {style.name}
                          </h3>
                          <p className={selectedStyle === key ? 'text-gray-300' : 'text-gray-600'}>
                            {style.description}
                          </p>
                          <div className={`mt-4 text-sm ${selectedStyle === key ? 'text-[#C6A55C]' : 'text-gray-500'}`}>
                            {style.price}
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

      {/* Process Steps */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-light mb-4">
              Proceso de
              <span className="font-medium"> Grabado</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Un proceso meticuloso para garantizar la perfección en cada detalle
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Diseño",
                description: "Selecciona el estilo y personaliza tu mensaje con nuestros expertos.",
                icon: Type
              },
              {
                title: "Preparación",
                description: "Cuidadosa preparación de la superficie para un grabado perfecto.",
                icon: Pen
              },
              {
                title: "Grabado",
                description: "Proceso de grabado realizado con precisión milimétrica.",
                icon: Heart
              }
            ].map((step, index) => (
              <FadeInOnScroll key={index} delay={index * 100}>
                <div className="text-center p-8 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gray-50 flex items-center justify-center">
                    <step.icon className="w-8 h-8 text-gray-900" />
                  </div>
                  <h3 className="text-xl font-medium mb-4">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </FadeInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Examples Gallery */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <FadeInOnScroll>
                <div className="space-y-6">
                  <h2 className="text-3xl font-light">
                    Galería de
                    <span className="block font-medium">Inspiración</span>
                  </h2>
                  <p className="text-gray-400 leading-relaxed">
                    Descubre ejemplos de nuestros trabajos de grabado y encuentra 
                    inspiración para tu pieza única.
                  </p>
                  <div className="grid grid-cols-2 gap-6">
                    {[
                      { number: "1000+", label: "Grabados Realizados" },
                      { number: "100%", label: "Satisfacción" },
                      { number: "50+", label: "Estilos" },
                      { number: "25", label: "Años de Experiencia" }
                    ].map((stat, index) => (
                      <div key={index} className="text-center p-6 bg-white/5 rounded-lg">
                        <div className="text-2xl font-medium text-[#C6A55C] mb-2">
                          {stat.number}
                        </div>
                        <div className="text-sm text-gray-400">{stat.label}</div>
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
                        src="/cap2.jpg"
                        alt="Engraving Example"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="relative aspect-square rounded-lg overflow-hidden">
                      <Image
                        src="/cap3.jpg"
                        alt="Engraving Example"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="relative aspect-[9/16] rounded-lg overflow-hidden">
                    <Image
                      src="/cap4.jpg"
                      alt="Engraving Example"
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

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <FadeInOnScroll>
              <h2 className="text-3xl font-light mb-6">
                Personaliza Tu
                <span className="font-medium"> Joya</span>
              </h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Añade un toque personal a tus joyas con nuestro servicio de grabado profesional.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/consulta"
                  className="inline-flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-3 rounded-sm hover:bg-[#C6A55C] transition-all duration-300"
                >
                  <span>Solicitar Grabado</span>
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
                  href="/galeria-grabados"
                  className="inline-flex items-center justify-center gap-2 border border-gray-900 text-gray-900 px-8 py-3 rounded-sm hover:bg-gray-900 hover:text-white transition-all duration-300"
                >
                  <span>Ver Galería</span>
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

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-light mb-4">
                Servicio de <span className="font-medium">Grabado</span>
              </h2>
              <p className="text-gray-600 text-sm">
                Personaliza tus joyas con nuestro servicio de grabado profesional, añadiendo un toque único y personal a cada pieza.
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
            {[
              {
                title: "Diseño",
                description: "Selecciona el estilo y personaliza tu mensaje con nuestros expertos.",
                icon: Type
              },
              {
                title: "Preparación",
                description: "Cuidadosa preparación de la superficie para un grabado perfecto.",
                icon: Pen
              },
              {
                title: "Grabado",
                description: "Proceso de grabado realizado con precisión milimétrica.",
                icon: Heart
              }
            ].map((step, index) => (
              <FadeInOnScroll key={index} delay={index * 100}>
                <div className="text-center p-8 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gray-50 flex items-center justify-center">
                    <step.icon className="w-8 h-8 text-gray-900" />
                  </div>
                  <h3 className="text-xl font-medium mb-4">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </FadeInOnScroll>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <FadeInOnScroll>
                <div className="space-y-6">
                  <h2 className="text-3xl font-light">
                    Galería de
                    <span className="block font-medium">Inspiración</span>
                  </h2>
                  <p className="text-gray-400 leading-relaxed">
                    Descubre ejemplos de nuestros trabajos de grabado y encuentra 
                    inspiración para tu pieza única.
                  </p>
                  <div className="grid grid-cols-2 gap-6">
                    {[
                      { number: "1000+", label: "Grabados Realizados" },
                      { number: "100%", label: "Satisfacción" },
                      { number: "50+", label: "Estilos" },
                      { number: "25", label: "Años de Experiencia" }
                    ].map((stat, index) => (
                      <div key={index} className="text-center p-6 bg-white/5 rounded-lg">
                        <div className="text-2xl font-medium text-[#C6A55C] mb-2">
                          {stat.number}
                        </div>
                        <div className="text-sm text-gray-400">{stat.label}</div>
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
                        src="/cap2.jpg"
                        alt="Engraving Example"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="relative aspect-square rounded-lg overflow-hidden">
                      <Image
                        src="/cap3.jpg"
                        alt="Engraving Example"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                  <div className="relative aspect-[9/16] rounded-lg overflow-hidden">
                    <Image
                      src="/cap4.jpg"
                      alt="Engraving Example"
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
    </CategoryPage>
  )
} 
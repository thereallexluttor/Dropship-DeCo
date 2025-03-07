"use client"

import CategoryPage from "../templates/CategoryPage"
import Image from "next/image"
import Link from "next/link"
import { Scale, FileText, Search, Award, ArrowRight, Gem, ScrollText, Shield } from "lucide-react"
import FadeInOnScroll from '../components/FadeInOnScroll'
import { useState } from 'react'

export default function TasacionPage() {
  const [activeTab, setActiveTab] = useState('jewelry')

  const appraisalTypes = {
    jewelry: {
      title: "Joyería Moderna",
      description: "Tasación de piezas contemporáneas y diseños actuales",
      process: [
        "Evaluación visual detallada",
        "Análisis de materiales y gemas",
        "Valoración de diseño y marca",
        "Certificación oficial"
      ]
    },
    antique: {
      title: "Joyería Antigua",
      description: "Valoración de piezas históricas y antigüedades",
      process: [
        "Investigación histórica",
        "Autenticación de época",
        "Evaluación de estado",
        "Documentación detallada"
      ]
    },
    collection: {
      title: "Colecciones",
      description: "Tasación completa de colecciones privadas",
      process: [
        "Inventario detallado",
        "Valoración individual",
        "Evaluación de conjunto",
        "Informe completo"
      ]
    }
  }

  return (
    <CategoryPage
      title="Servicio de Tasación"
      subtitle="Valoración Profesional"
      description="Conoce el valor real de tus joyas con nuestro servicio experto de tasación."
      heroImage="/cap4.jpg"
      features={[
        {
          title: "Certificación GIA",
          description: "Tasadores certificados por el Instituto Gemológico de América.",
          icon: "/icons/diamond.png"
        },
        {
          title: "Precisión",
          description: "Tecnología avanzada para valoraciones exactas.",
          icon: "/icons/exclusive.png"
        },
        {
          title: "Confidencialidad",
          description: "Servicio discreto y confidencial garantizado.",
          icon: "/icons/warranty.png"
        }
      ]}
    >
      {/* Service Types Section */}
      <section className="py-20 bg-gradient-to-b from-white to-[#FDF9F3]">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-light mb-6">
              Servicios de <span className="font-medium">Tasación</span>
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Ofrecemos servicios especializados de tasación para diferentes tipos de joyas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {Object.entries(appraisalTypes).map(([key, type], index) => (
              <FadeInOnScroll key={key} delay={index * 100}>
                <div 
                  className={`
                    relative p-8 rounded-lg transition-all duration-300 cursor-pointer
                    ${activeTab === key 
                      ? 'bg-[#C6A55C] text-white shadow-xl transform hover:scale-105' 
                      : 'bg-white hover:bg-black/5'}
                  `}
                  onClick={() => setActiveTab(key)}
                >
                  <h3 className="text-xl font-medium mb-4">{type.title}</h3>
                  <p className="text-sm mb-6 opacity-90">{type.description}</p>

                  <ul className="space-y-3">
                    {type.process.map((step, i) => (
                      <li key={i} className="flex items-center text-sm">
                        <ArrowRight className="w-4 h-4 mr-2" />
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`
                      mt-8 w-full py-3 text-sm font-medium transition-all duration-300
                      ${activeTab === key
                        ? 'bg-white text-[#C6A55C] hover:bg-black hover:text-white'
                        : 'bg-[#C6A55C] text-white hover:bg-black'}
                    `}
                  >
                    Solicitar Tasación
                  </button>
                </div>
              </FadeInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <FadeInOnScroll>
                <div className="space-y-6">
                  <h2 className="text-3xl font-light">
                    Proceso de
                    <span className="block font-medium">Tasación</span>
                  </h2>
                  <p className="text-gray-400 leading-relaxed">
                    Nuestro proceso de tasación combina experiencia, tecnología y atención al detalle
                    para proporcionar valoraciones precisas y profesionales.
                  </p>
                  <div className="space-y-8 pt-6">
                    {[
                      {
                        icon: Search,
                        title: "Examen Inicial",
                        description: "Análisis detallado de materiales, gemas y estado general"
                      },
                      {
                        icon: Scale,
                        title: "Valoración",
                        description: "Evaluación precisa según estándares internacionales"
                      },
                      {
                        icon: ScrollText,
                        title: "Certificación",
                        description: "Emisión de certificado oficial de tasación"
                      },
                      {
                        icon: FileText,
                        title: "Documentación",
                        description: "Informe completo con fotografías y detalles"
                      }
                    ].map((step, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#C6A55C]/20 flex items-center justify-center flex-shrink-0">
                          <step.icon className="w-6 h-6 text-[#C6A55C]" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium mb-2">{step.title}</h3>
                          <p className="text-gray-400 text-sm">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeInOnScroll>

              <FadeInOnScroll delay={200}>
                <div className="relative aspect-square">
                  <Image
                    src="/cap3.jpg"
                    alt="Appraisal Process"
                    fill
                    className="object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg"></div>
                </div>
              </FadeInOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-b from-[#FDF9F3] to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-light mb-6">
                Beneficios de Nuestra <span className="font-medium">Tasación</span>
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Descubre por qué nuestro servicio de tasación es la elección preferida
                de coleccionistas y amantes de la joyería
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Award,
                  title: "Certificación Internacional",
                  description: "Tasaciones reconocidas por las principales aseguradoras y entidades financieras"
                },
                {
                  icon: Gem,
                  title: "Tecnología Avanzada",
                  description: "Utilizamos equipamiento de última generación para análisis precisos"
                },
                {
                  icon: Shield,
                  title: "Confidencialidad Total",
                  description: "Garantizamos la privacidad y seguridad de toda la información"
                }
              ].map((benefit, index) => (
                <FadeInOnScroll key={index} delay={index * 100}>
                  <div className="bg-white p-8 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 group">
                    <div className="w-16 h-16 rounded-full bg-[#C6A55C]/10 flex items-center justify-center mb-6 group-hover:bg-[#C6A55C]/20 transition-colors duration-300">
                      <benefit.icon className="w-8 h-8 text-[#C6A55C]" />
                    </div>
                    <h3 className="text-lg font-medium mb-3">{benefit.title}</h3>
                    <p className="text-gray-600 text-sm">{benefit.description}</p>
                  </div>
                </FadeInOnScroll>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/cap1.jpg"
            alt="Luxury Appraisal"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <FadeInOnScroll>
              <h2 className="text-3xl font-light mb-6">
                Descubre el Valor Real de
                <span className="block font-medium mt-2">Tus Joyas</span>
              </h2>
              <p className="text-white/90 mb-12 font-light max-w-2xl mx-auto">
                Nuestros expertos tasadores están a tu disposición para realizar una valoración profesional
              </p>
              
              <Link
                href="/consulta"
                className="inline-flex items-center gap-2 bg-[#C6A55C] text-white px-8 py-3 text-sm font-medium tracking-wider hover:bg-white hover:text-black transition-all duration-300"
              >
                <span>SOLICITAR TASACIÓN</span>
                <span className="transform transition-transform group-hover:translate-x-1">→</span>
              </Link>

              <div className="mt-12 grid grid-cols-3 gap-8">
                {[
                  { number: "5000+", label: "Tasaciones Realizadas" },
                  { number: "100%", label: "Confidencialidad" },
                  { number: "30+", label: "Años de Experiencia" }
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-medium text-[#C6A55C]">{stat.number}</div>
                    <div className="text-sm text-white/80">{stat.label}</div>
                  </div>
                ))}
              </div>
            </FadeInOnScroll>
          </div>
        </div>
      </section>

      {/* New Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-light mb-4">
                Servicio de <span className="font-medium">Tasación</span>
              </h2>
              <p className="text-gray-600 text-sm">
                Obtén una valoración profesional y certificada de tus joyas con nuestro servicio de tasación especializado.
              </p>
            </div>
            <div className="flex gap-4 mt-6 md:mt-0">
              <button className="px-6 py-2 border border-[#C6A55C] text-[#C6A55C] hover:bg-[#C6A55C] hover:text-white transition-colors duration-300 text-sm rounded-full">
                Solicitar Tasación
              </button>
              <button className="px-6 py-2 border border-[#C6A55C] text-[#C6A55C] hover:bg-[#C6A55C] hover:text-white transition-colors duration-300 text-sm rounded-full">
                Más Información
              </button>
            </div>
          </div>

          {/* Service Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Tasación Certificada",
                description: "Valoración completa con certificado oficial para seguros y documentación.",
                price: "Desde 149€"
              },
              {
                title: "Tasación Express",
                description: "Valoración rápida para ventas o referencias inmediatas.",
                price: "Desde 79€"
              },
              {
                title: "Tasación Detallada",
                description: "Análisis exhaustivo de gemas y metales preciosos.",
                price: "Desde 199€"
              }
            ].map((service, index) => (
              <FadeInOnScroll key={index} delay={index * 100}>
                <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900">{service.title}</h3>
                    <p className="text-sm text-gray-600 mt-2">{service.description}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#C6A55C] font-medium">{service.price}</span>
                    <button className="text-sm text-gray-600 hover:text-[#C6A55C] transition-colors duration-300">
                      Solicitar →
                    </button>
                  </div>
                </div>
              </FadeInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-light text-center mb-16">
            Por Qué <span className="font-medium">Elegirnos</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              {
                title: "Experiencia",
                description: "Más de 25 años de experiencia en tasación de joyas"
              },
              {
                title: "Certificación",
                description: "Tasadores certificados internacionalmente"
              },
              {
                title: "Precisión",
                description: "Tecnología de última generación para análisis"
              },
              {
                title: "Garantía",
                description: "100% de garantía en nuestras valoraciones"
              }
            ].map((feature, index) => (
              <FadeInOnScroll key={index} delay={index * 100}>
                <div className="text-center p-6">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#C6A55C]/10 flex items-center justify-center">
                    <span className="text-2xl font-medium text-[#C6A55C]">{index + 1}</span>
                  </div>
                  <h3 className="text-lg font-medium mb-3">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              </FadeInOnScroll>
            ))}
          </div>
        </div>
      </section>
    </CategoryPage>
  )
} 
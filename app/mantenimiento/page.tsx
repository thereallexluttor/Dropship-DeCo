"use client"

import CategoryPage from "../templates/CategoryPage"
import Image from "next/image"
import Link from "next/link"
import { Wrench, Clock, Shield, Sparkles, Calendar } from "lucide-react"
import FadeInOnScroll from '../components/FadeInOnScroll'
import { useState } from 'react'

export default function MantenimientoPage() {
  const [activeService, setActiveService] = useState('basic')

  const services = {
    basic: {
      name: "Mantenimiento Básico",
      price: "99€",
      duration: "2-3 días",
      includes: [
        "Limpieza profesional",
        "Pulido básico",
        "Revisión de seguridad",
        "Informe de estado"
      ]
    },
    premium: {
      name: "Mantenimiento Premium",
      price: "199€",
      duration: "3-5 días",
      includes: [
        "Limpieza profunda ultrasónica",
        "Pulido completo",
        "Revisión detallada",
        "Baño de rodio (si necesario)",
        "Informe detallado",
        "Garantía extendida"
      ]
    },
    restoration: {
      name: "Restauración",
      price: "Según evaluación",
      duration: "7-14 días",
      includes: [
        "Evaluación completa",
        "Restauración personalizada",
        "Refuerzo estructural",
        "Pulido profesional",
        "Certificado de restauración",
        "Garantía de trabajo"
      ]
    }
  }

  return (
    <CategoryPage
      title="Servicio de Mantenimiento"
      subtitle="Cuidado Experto para tus Joyas"
      description="Mantén el brillo y la belleza de tus joyas con nuestro servicio profesional de mantenimiento."
      heroImage="/cap1.jpg"
      features={[
        {
          title: "Experiencia",
          description: "Más de 100 años cuidando joyas exclusivas.",
          icon: "/icons/exclusive.png"
        },
        {
          title: "Tecnología",
          description: "Equipamiento de última generación para el cuidado de tus joyas.",
          icon: "/icons/warranty.png"
        },
        {
          title: "Garantía",
          description: "Satisfacción garantizada en todos nuestros servicios.",
          icon: "/icons/diamond.png"
        }
      ]}
    >
      {/* Service Selection Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-light mb-4">
                Servicio de <span className="font-medium">Mantenimiento</span>
              </h2>
              <p className="text-gray-600 text-sm">
                Mantén tus joyas en perfecto estado con nuestro servicio profesional de mantenimiento y restauración.
              </p>
            </div>
            <div className="flex gap-4 mt-6 md:mt-0">
              <button className="px-6 py-2 border border-[#C6A55C] text-[#C6A55C] hover:bg-[#C6A55C] hover:text-white transition-colors duration-300 text-sm rounded-full">
                Agendar Cita
              </button>
              <button className="px-6 py-2 border border-[#C6A55C] text-[#C6A55C] hover:bg-[#C6A55C] hover:text-white transition-colors duration-300 text-sm rounded-full">
                Consultar Estado
              </button>
            </div>
          </div>

          {/* Service Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Limpieza Profesional",
                description: "Devuelve el brillo original a tus joyas con nuestra limpieza especializada.",
                price: "Desde 49€"
              },
              {
                title: "Restauración",
                description: "Reparación y restauración de piezas dañadas o desgastadas.",
                price: "Desde 99€"
              },
              {
                title: "Pulido y Acabado",
                description: "Renovación completa del acabado de tus joyas.",
                price: "Desde 79€"
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
                      Más información →
                    </button>
                  </div>
                </div>
              </FadeInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* Process Timeline */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-light text-center mb-16">
            Nuestro <span className="font-medium">Proceso</span>
          </h2>
          <div className="max-w-4xl mx-auto">
            {[
              {
                step: "01",
                title: "Diagnóstico",
                description: "Evaluación detallada del estado de tu joya"
              },
              {
                step: "02",
                title: "Presupuesto",
                description: "Propuesta transparente de servicios y costos"
              },
              {
                step: "03",
                title: "Mantenimiento",
                description: "Trabajo profesional con técnicas especializadas"
              },
              {
                step: "04",
                title: "Entrega",
                description: "Devolución de tu joya en perfecto estado"
              }
            ].map((step, index) => (
              <FadeInOnScroll key={index} delay={index * 100}>
                <div className="flex items-start gap-8 mb-12">
                  <div className="flex-shrink-0 w-16 h-16 bg-[#C6A55C] text-white rounded-full flex items-center justify-center text-xl font-medium">
                    {step.step}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
              </FadeInOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-b from-[#FDF9F3] to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-light mb-6">
                Preguntas <span className="font-medium">Frecuentes</span>
              </h2>
              <p className="text-gray-600">
                Resolvemos tus dudas sobre nuestro servicio de mantenimiento
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  q: "¿Con qué frecuencia debo realizar el mantenimiento de mis joyas?",
                  a: "Recomendamos un mantenimiento básico cada 6-12 meses, dependiendo del uso y tipo de joya."
                },
                {
                  q: "¿Cuánto tiempo tarda el servicio de mantenimiento?",
                  a: "El tiempo varía según el servicio elegido, desde 2-3 días para mantenimiento básico hasta 2 semanas para restauraciones."
                },
                {
                  q: "¿Ofrecen garantía en los servicios de mantenimiento?",
                  a: "Sí, todos nuestros servicios incluyen garantía. La duración varía según el tipo de servicio."
                },
                {
                  q: "¿Qué incluye el servicio de mantenimiento básico?",
                  a: "Incluye limpieza profesional, pulido básico, revisión de seguridad e informe de estado."
                }
              ].map((faq, index) => (
                <FadeInOnScroll key={index} delay={index * 100}>
                  <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                    <h3 className="text-lg font-medium mb-3">{faq.q}</h3>
                    <p className="text-gray-600 text-sm">{faq.a}</p>
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
            src="/cap2.jpg"
            alt="Luxury Maintenance"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-white">
            <FadeInOnScroll>
              <h2 className="text-3xl font-light mb-6">
                Confía el Cuidado de tus Joyas a
                <span className="block font-medium mt-2">Expertos Artesanos</span>
              </h2>
              <p className="text-white/90 mb-12 font-light max-w-2xl mx-auto">
                Nuestro equipo de expertos está listo para brindar el mejor cuidado a tus piezas más preciadas
              </p>
              
              <Link
                href="/consulta"
                className="inline-flex items-center gap-2 bg-[#C6A55C] text-white px-8 py-3 text-sm font-medium tracking-wider hover:bg-white hover:text-black transition-all duration-300"
              >
                <span>RESERVAR CITA</span>
                <span className="transform transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </FadeInOnScroll>
          </div>
        </div>
      </section>
    </CategoryPage>
  )
} 
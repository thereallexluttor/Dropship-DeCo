"use client"

import Image from "next/image"
import { useState, useEffect } from "react"

const testimonials = [
  {
    name: "María González",
    role: "Colección Nupcial",
    image: "/cap3.jpg",
    quote: "El anillo de compromiso que elegimos es simplemente perfecto. El servicio personalizado y la atención al detalle superaron todas nuestras expectativas.",
    rating: 5
  },
  {
    name: "Carlos Ruiz",
    role: "Colección Diamantes",
    image: "/cap1.jpg",
    quote: "La calidad y artesanía de las joyas es excepcional. Cada pieza cuenta una historia única y el equipo hace que la experiencia sea inolvidable.",
    rating: 5
  },
  {
    name: "Laura Martínez",
    role: "Colección Personalizada",
    image: "/cap2.jpg",
    quote: "El proceso de diseño personalizado fue mágico. Convirtieron mi visión en una joya extraordinaria que llevaré toda la vida.",
    rating: 5
  }
]

export default function Testimonials() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="py-16 bg-[url('/pattern-organic.png')] bg-fixed bg-opacity-5">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto bg-white/90 backdrop-blur-sm p-8 md:p-12 rounded-lg shadow-sm">
          <div className="text-center mb-12 overflow-hidden">
            <div 
              className="relative mb-3 inline-block"
              style={{
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                opacity: isVisible ? 1 : 0,
                transition: 'transform 0.7s ease-out, opacity 0.7s ease-out'
              }}
            >
              <span className="inline-block py-1 px-3 text-xs tracking-widest uppercase text-[#8B5A2B] font-medium bg-[#F9F5EC] rounded-sm">
                Testimonios
              </span>
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[120%] h-[2px] bg-gradient-to-r from-transparent via-[#8B5A2B] to-transparent opacity-30"></span>
            </div>
            
            <h2 
              className="text-2xl md:text-3xl font-sans text-[#1A1A1A] relative inline-block"
              style={{
                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                opacity: isVisible ? 1 : 0,
                transition: 'transform 0.8s ease-out 0.2s, opacity 0.8s ease-out 0.2s'
              }}
            >
              <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-[#8B5A2B] to-[#D7B377]">Lo Que Dicen Nuestros Clientes</span>
              <span 
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-[2px] w-24 bg-gradient-to-r from-[#8B5A2B] to-[#D7B377]"
                style={{
                  transform: isVisible ? 'scaleX(1)' : 'scaleX(0)',
                  transition: 'transform 1s ease-out 0.5s',
                  transformOrigin: 'center'
                }}
              ></span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300"
                style={{
                  transform: isVisible ? 'translateY(0)' : 'translateY(40px)',
                  opacity: isVisible ? 1 : 0,
                  transition: `transform 0.7s ease-out ${0.3 + index * 0.1}s, opacity 0.7s ease-out ${0.3 + index * 0.1}s`
                }}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4 border-2 border-[#F9F5EC]">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-[#1A1A1A] font-medium">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex text-[#C6A55C] mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 italic">{testimonial.quote}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
} 
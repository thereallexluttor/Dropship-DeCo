"use client"

import { useState, useEffect } from "react"
import { useCart } from "../contexts/CartContext"
import { sampleProducts } from "../data/sampleProducts"
import ProductCard from "./ProductCard"
import { motion } from "framer-motion"

export default function FeaturedProducts() {
  const [isVisible, setIsVisible] = useState(false)
  const [page, setPage] = useState(0)
  // Mostrar 16 productos destacados
  const featuredProducts = sampleProducts
  
  // Calcular productos a mostrar por página (4 filas x 4 columnas en desktop)
  const productsPerPage = 16
  const paginatedProducts = featuredProducts.slice(
    page * productsPerPage, 
    (page + 1) * productsPerPage
  )

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [])

  const fadeUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1 * custom,
        duration: 0.6,
        ease: [0.215, 0.61, 0.355, 1] // ease-out-cubic
      }
    })
  }

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div 
            className="relative mb-3 inline-block"
            style={{
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
              opacity: isVisible ? 1 : 0,
              transition: 'transform 0.7s ease-out, opacity 0.7s ease-out'
            }}
          >
            <span className="inline-block py-1 px-4 text-xs tracking-widest uppercase text-[#8B5A2B] font-medium bg-[#F9F5EC] rounded-full">
              Nuestra Selección
            </span>
          </div>
          
          <h2 
            className="text-3xl md:text-4xl font-serif mb-4 text-[#1A1A1A] relative inline-block"
            style={{
              transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
              opacity: isVisible ? 1 : 0,
              transition: 'transform 0.8s ease-out 0.2s, opacity 0.8s ease-out 0.2s'
            }}
          >
            <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-[#8B5A2B] to-[#D7B377]">Piezas Destacadas</span>
            <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 h-[2px] w-36 bg-gradient-to-r from-[#8B5A2B] to-[#D7B377]"
              style={{
                transform: isVisible ? 'scaleX(1)' : 'scaleX(0)',
                transition: 'transform 1s ease-out 0.5s',
                transformOrigin: 'center'
              }}
            ></span>
          </h2>

          <p 
            className="text-gray-600 text-lg mt-6 mb-8 mx-auto max-w-2xl font-light"
            style={{
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
              opacity: isVisible ? 1 : 0,
              transition: 'transform 0.8s ease-out 0.3s, opacity 0.8s ease-out 0.3s'
            }}
          >
            Descubre nuestra colección exclusiva de joyas elegantemente diseñadas por nuestros artesanos. Cada pieza representa la perfección en artesanía y belleza atemporal.
          </p>

          <div className="flex justify-center gap-3 mb-10">
            <motion.span 
              className="h-1 w-20 bg-[#C6A55C] opacity-30 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '5rem' }}
              transition={{ delay: 0.6, duration: 0.8 }}
            ></motion.span>
            <motion.span 
              className="h-1 w-10 bg-[#C6A55C] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '2.5rem' }}
              transition={{ delay: 0.7, duration: 0.8 }}
            ></motion.span>
            <motion.span 
              className="h-1 w-5 bg-[#C6A55C] opacity-60 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: '1.25rem' }}
              transition={{ delay: 0.8, duration: 0.8 }}
            ></motion.span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {paginatedProducts.map((product, index) => (
            <motion.div
              key={product.id}
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeUpVariants}
            >
              <ProductCard
                id={product.id}
                name={product.name}
                price={product.price}
                image={product.image || "/placeholder.jpg"}
                category={product.category}
              />
            </motion.div>
          ))}
        </div>

        {featuredProducts.length > productsPerPage && (
          <div className="flex justify-center mt-16">
            <button 
              onClick={() => setPage(prev => Math.max(prev - 1, 0))}
              disabled={page === 0}
              className="px-5 py-2 border border-[#C6A55C] text-[#C6A55C] rounded-l-full hover:bg-[#C6A55C]/10 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              aria-label="Página anterior"
            >
              &larr;
            </button>
            <span className="px-6 py-2 bg-[#F9F5EC] text-[#8B5A2B] font-medium">
              {page + 1} / {Math.ceil(featuredProducts.length / productsPerPage)}
            </span>
            <button 
              onClick={() => setPage(prev => Math.min(prev + 1, Math.ceil(featuredProducts.length / productsPerPage) - 1))}
              disabled={page >= Math.ceil(featuredProducts.length / productsPerPage) - 1}
              className="px-5 py-2 border border-[#C6A55C] text-[#C6A55C] rounded-r-full hover:bg-[#C6A55C]/10 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
              aria-label="Página siguiente"
            >
              &rarr;
            </button>
          </div>
        )}
      </div>
    </section>
  )
} 
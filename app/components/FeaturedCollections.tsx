"use client"

import Image from "next/image"
import Link from "next/link"
import { categories } from "../data/categories"

// Image Enhancement Styles
const imageEffects = {
  gold: "sepia(50%) hue-rotate(5deg) saturate(150%)",
  platinum: "brightness(110%) contrast(110%)",
  diamond: "brightness(120%) contrast(90%)",
  vintage: "sepia(20%) contrast(105%)"
}

export default function FeaturedCollections() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block mb-2 text-xs tracking-widest uppercase text-[#8B5A2B] font-medium">Explora</span>
          <h2 className="text-2xl md:text-3xl font-poppins text-[#1A1A1A] relative inline-block">
            <span className="relative z-10">Nuestras Colecciones</span>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-[2px] w-24 bg-gradient-to-r from-[#8B5A2B] to-[#D7B377]"></span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Link href={category.featured.href} key={index}>
              <div className="group relative overflow-hidden rounded-lg">
                <div className="aspect-[3/4] relative">
                  <Image
                    src={category.items[0].image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    style={{ filter: imageEffects.vintage }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-xl font-light mb-2">{category.name}</h3>
                    <p className="text-sm font-light opacity-90 mb-4">{category.description}</p>
                    <div className="flex items-center text-sm font-medium text-white/90 group-hover:text-white transition-colors duration-300">
                      <span>Ver Colección</span>
                      <svg 
                        className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-300" 
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
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
} 
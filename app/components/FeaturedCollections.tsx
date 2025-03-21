"use client"

import Image from "next/image"
import Link from "next/link"
import { categories } from "../data/categories"
import { useState, useEffect } from "react"

// Image Enhancement Styles
const imageEffects = {
  gold: "sepia(50%) hue-rotate(5deg) saturate(150%)",
  platinum: "brightness(110%) contrast(110%)",
  diamond: "brightness(120%) contrast(90%)",
  vintage: "sepia(20%) contrast(105%)"
}

interface Category {
  name: string;
  description: string;
  featured: {
    href: string;
  };
  items: {
    image: string;
    [key: string]: any;
  }[];
}

export default function FeaturedCollections() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
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
              Explora
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
            <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-[#8B5A2B] to-[#D7B377]">Nuestras Colecciones</span>
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-[2px] w-24 bg-gradient-to-r from-[#8B5A2B] to-[#D7B377]"
              style={{
                transform: isVisible ? 'scaleX(1)' : 'scaleX(0)',
                transition: 'transform 1s ease-out 0.5s',
                transformOrigin: 'center'
              }}
            ></span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Card key={index} category={category} />
          ))}
        </div>
      </div>
    </section>
  )
}

const Card = ({ category }: { category: Category }) => {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateY = ((x - centerX) / centerX) * 10; // Max rotation ±10deg
    const rotateX = ((centerY - y) / centerY) * 10; // Inverse Y for correct tilt direction
    
    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setRotation({ x: 0, y: 0 });
  };

  const transformStyle = isHovering
    ? `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale3d(1.05, 1.05, 1.05)`
    : 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';

  // Usar la imagen dedicada para OCASIONES
  const imageSrc = category.name === "OCASIONES" 
    ? "/ocasiones.jpg" 
    : category.name === "MATERIALES"
      ? "/goldsilver.jpeg"
      : category.name === "SERVICIOS"
        ? "/orfebre.jpg"
        : category.items[0].image;

  return (
    <Link href={category.featured.href}>
      <div 
        className="group relative overflow-hidden rounded-lg shadow-lg transition-all duration-300 ease-out"
        style={{ 
          transform: transformStyle,
          transition: 'transform 0.2s ease-out'
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="aspect-[3/4] relative">
          <Image
            src={imageSrc}
            alt={category.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            style={{ filter: imageEffects.vintage }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>
          <div 
            className="absolute bottom-0 left-0 right-0 p-6 text-white"
            style={{
              transform: isHovering ? 'translateZ(50px)' : 'translateZ(0)',
              transition: 'transform 0.2s ease-out'
            }}
          >
            <h3 
              className="text-xl font-light mb-2 transition-all duration-300 ease-out"
              style={{
                transform: isHovering ? 'translateY(-5px)' : 'translateY(0)',
                opacity: isHovering ? 1 : 0.9,
                textShadow: isHovering ? '0 0 12px rgba(255,255,255,0.3)' : 'none',
                letterSpacing: isHovering ? '0.02em' : 'normal'
              }}
            >
              {category.name}
            </h3>
            <p 
              className="text-sm font-light mb-4 transition-all duration-500 ease-out"
              style={{
                transform: isHovering ? 'translateY(-3px)' : 'translateY(0)',
                opacity: isHovering ? 0.95 : 0.8,
                maxHeight: isHovering ? '80px' : '60px',
                overflow: 'hidden'
              }}
            >
              {category.description}
            </p>
            <div 
              className="flex items-center text-sm font-medium text-white/90 group-hover:text-white transition-all duration-300 ease-out"
              style={{
                transform: isHovering ? 'translateY(-2px) translateX(3px)' : 'translateY(0) translateX(0)',
                opacity: isHovering ? 1 : 0.9
              }}
            >
              <span className="relative overflow-hidden">
                Ver Colección
                <span 
                  className="absolute bottom-0 left-0 w-full h-[1px] bg-white"
                  style={{
                    transform: isHovering ? 'scaleX(1)' : 'scaleX(0)',
                    transformOrigin: 'left',
                    transition: 'transform 0.3s ease-out',
                    opacity: 0.7
                  }}
                ></span>
              </span>
              <svg 
                className="w-4 h-4 ml-2 transform transition-all duration-300 ease-out" 
                style={{
                  transform: isHovering ? 'translateX(3px)' : 'translateX(0)'
                }}
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
  );
}; 
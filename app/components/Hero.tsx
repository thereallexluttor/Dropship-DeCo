"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSwipeable } from "react-swipeable"

// Image Enhancement Styles
const imageEffects = {
  gold: "sepia(50%) hue-rotate(5deg) saturate(150%)",
  platinum: "brightness(110%) contrast(110%)",
  diamond: "brightness(120%) contrast(90%)",
  vintage: "sepia(20%) contrast(105%)"
}

// Animation keyframes for moving gradient
const gradientKeyframes = `
  @keyframes gradientMove {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`;

const slides = [
  {
    image: "/cap1.jpg",
    title: "Colección Primavera 2024",
    subtitle: "Elegancia Atemporal",
    description: "Piezas únicas hechas a mano con los materiales más finos",
    cta: { text: "Descubrir Colección", href: "/colecciones" }
  },
  {
    image: "/cap2.jpg",
    title: "Anillos de Compromiso",
    subtitle: "Momentos Eternos",
    description: "Diseños exclusivos para ocasiones inolvidables",
    cta: { text: "Ver Colección", href: "/anillos" }
  },
  {
    image: "/cap3.jpg",
    title: "Edición Limitada",
    subtitle: "Joyas Únicas",
    description: "Colección numerada de piezas irrepetibles",
    cta: { text: "Descubrir Ahora", href: "/edicion-limitada" }
  },
  {
    image: "/cap4.jpg",
    title: "Diamantes Certificados",
    subtitle: "Pureza Garantizada",
    description: "La más alta calidad en piedras preciosas",
    cta: { text: "Explorar Colección", href: "/diamantes" }
  }
]

export default function Hero() {
  const [activeSlide, setActiveSlide] = useState(0)
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next')
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Responsive handler
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Navigation functions
  const goToNextSlide = useCallback(() => {
    setSlideDirection('next')
    setActiveSlide((current) => (current === slides.length - 1 ? 0 : current + 1))
  }, [])

  const goToPrevSlide = useCallback(() => {
    setSlideDirection('prev')
    setActiveSlide((current) => (current === 0 ? slides.length - 1 : current - 1))
  }, [])

  const goToSlide = useCallback((index: number) => {
    setSlideDirection(index > activeSlide ? 'next' : 'prev')
    setActiveSlide(index)
  }, [activeSlide])

  // Swipe handlers for mobile
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => goToNextSlide(),
    onSwipedRight: () => goToPrevSlide(),
    preventScrollOnSwipe: true,
    trackTouch: true,
    trackMouse: true
  })

  // Autoplay functionality
  useEffect(() => {
    if (isAutoplayPaused) return
    
    const timer = setInterval(() => {
      goToNextSlide()
    }, 5000)

    return () => clearInterval(timer)
  }, [goToNextSlide, isAutoplayPaused])

  // Pause autoplay when user interacts with carousel
  const handleCarouselInteraction = () => {
    setIsAutoplayPaused(true)
    // Resume autoplay after 10 seconds of inactivity
    setTimeout(() => setIsAutoplayPaused(false), 10000)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevSlide()
        handleCarouselInteraction()
      } else if (e.key === 'ArrowRight') {
        goToNextSlide()
        handleCarouselInteraction()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToNextSlide, goToPrevSlide])

  return (
    <>
      <style jsx global>{gradientKeyframes}</style>
      <section 
        className="relative w-full pt-3 md:pt-5" 
        aria-label="Carrusel de destacados"
        onClick={handleCarouselInteraction}
      >
        <div className="container mx-auto px-2 sm:px-4">
          <div 
            {...swipeHandlers}
            className="relative aspect-[3/4] xs:aspect-[4/5] sm:aspect-[16/9] md:aspect-[18/9] lg:aspect-[21/9] w-full rounded-lg md:rounded-2xl overflow-hidden shadow-xl"
          >
            {/* Carousel */}
            <div className="absolute inset-0 rounded-lg md:rounded-2xl overflow-hidden">
              {slides.map((slide, index) => (
                <div
                  key={index}
                  className={`
                    absolute inset-0 rounded-lg md:rounded-2xl overflow-hidden
                    transition-all duration-[1200ms] ease-in-out
                    ${activeSlide === index 
                      ? "opacity-100 scale-100" 
                      : "opacity-0 scale-110"}
                  `}
                  aria-hidden={activeSlide !== index}
                >
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 85vw"
                    quality={90}
                    priority={index === 0}
                    className={`
                      object-cover rounded-lg md:rounded-2xl
                      transition-transform duration-[8000ms] ease-out
                      ${activeSlide === index ? 'scale-110' : 'scale-100'}
                    `}
                    style={{
                      filter: index % 4 === 0 ? imageEffects.gold :
                             index % 4 === 1 ? imageEffects.platinum :
                             index % 4 === 2 ? imageEffects.diamond :
                             imageEffects.vintage
                    }}
                  />

                  {/* Animated Gradient Overlay - Gold and Purple */}
                  <div 
                    className="absolute inset-0 rounded-lg md:rounded-2xl backdrop-blur-[0px] transition-all duration-500 hover:backdrop-blur-[1px]"
                    style={{
                      background: "linear-gradient(120deg, rgba(139,90,43,0.15), rgba(106,13,173,0.10), rgba(0,0,0,0))",
                      backgroundSize: "200% 200%",
                      animation: "gradientMove 15s ease-in-out infinite"
                    }}
                  >
                    {/* Extra darker gradient for mobile only - improves text visibility */}
                    <div 
                      className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-75 md:opacity-0"
                    ></div>
                    
                    <div 
                      className="absolute inset-0 opacity-20 md:opacity-15 md:group-hover:opacity-25 transition-opacity duration-1000"
                      style={{
                        background: "linear-gradient(135deg, rgba(212,175,55,0.10), rgba(128,0,128,0.05))",
                        backgroundSize: "200% 200%",
                        animation: "gradientMove 12s ease-in-out infinite reverse"
                      }}
                    ></div>
                    
                    <div className="h-full w-full flex flex-col justify-end md:justify-center md:items-start relative z-10">
                      <div className="px-5 pb-8 md:pb-0 md:pl-16 md:pr-0 md:max-w-[70%] lg:max-w-[50%] space-y-2 md:space-y-5 w-full">
                        <div className="bg-white/95 text-black px-3 py-1 md:px-5 md:py-2 inline-block rounded-full text-[10px] xs:text-xs md:text-sm font-bold tracking-[0.3em] font-poppins">
                          BERLIN JEWELS
                        </div>
                        <h2 className="text-base xs:text-xl sm:text-2xl md:text-4xl lg:text-5xl font-poppins text-white leading-[1.3] md:leading-[1.5] tracking-wide drop-shadow-md md:drop-shadow-2xl font-bold">
                          <span className="block text-[#D7B377] font-bold italic">{slide.subtitle}</span>
                          <span className="block font-bold mt-1 md:mt-2">{slide.title}</span>
                        </h2>
                        <p className="text-[10px] xs:text-xs sm:text-sm md:text-base lg:text-lg text-white/95 font-bold tracking-wide md:tracking-[0.2em] uppercase font-poppins max-w-2xl">
                          {slide.description}
                        </p>
                        <div className="pt-3 md:pt-7 flex flex-row flex-wrap gap-2 md:gap-4">
                          <Link
                            href={slide.cta.href}
                            className="group/btn relative overflow-hidden bg-gradient-to-r from-[#8B5A2B] to-[#D7B377] text-white px-4 py-2 xs:px-5 xs:py-2.5 md:px-8 md:py-3 text-[10px] xs:text-xs md:text-sm font-bold font-poppins tracking-widest transition-all duration-300 inline-block hover:from-[#D7B377] hover:to-[#8B5A2B] rounded-full shadow-lg hover:shadow-xl"
                            aria-label={slide.cta.text}
                            tabIndex={activeSlide === index ? 0 : -1}
                          >
                            {slide.cta.text}
                            <span className="absolute inset-0 w-full h-full bg-white/10 opacity-0 group-hover/btn:opacity-100 transform translate-x-full group-hover/btn:translate-x-0 transition-all duration-700"></span>
                          </Link>
                          <Link
                            href="/contacto"
                            className="group/btn relative overflow-hidden bg-white text-black border border-transparent px-4 py-2 xs:px-5 xs:py-2.5 md:px-8 md:py-3 text-[10px] xs:text-xs md:text-sm font-bold font-poppins tracking-widest transition-all duration-300 inline-block hover:bg-transparent hover:text-white hover:border-white rounded-full shadow-lg hover:shadow-xl"
                            aria-label="Contactar"
                            tabIndex={activeSlide === index ? 0 : -1}
                          >
                            CONTACTAR
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation buttons - only visible on mobile */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 md:hidden">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevSlide();
                  handleCarouselInteraction();
                }}
                className="w-8 h-8 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Diapositiva anterior"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z" clipRule="evenodd" />
                </svg>
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  goToNextSlide();
                  handleCarouselInteraction();
                }}
                className="w-8 h-8 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Siguiente diapositiva"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Slide indicators - dots for mobile */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5 md:hidden">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToSlide(index);
                    handleCarouselInteraction();
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    activeSlide === index ? 'bg-white scale-125' : 'bg-white/50'
                  }`}
                  aria-label={`Ir a diapositiva ${index + 1}`}
                  aria-current={activeSlide === index ? 'true' : 'false'}
                ></button>
              ))}
            </div>

            {/* Loading Progress Indicator */}
            {!isAutoplayPaused && (
              <div className="absolute bottom-0 left-0 h-0.5 bg-white/30 w-full hidden md:block">
                <div 
                  className="h-full bg-white/80 transition-all ease-linear duration-5000"
                  style={{ 
                    width: `${(activeSlide * 100) / (slides.length - 1)}%`,
                  }}
                ></div>
              </div>
            )}
          </div>
        </div>

        {/* Accessibility features */}
        <div className="sr-only" aria-live="polite">
          {`Mostrando diapositiva ${activeSlide + 1} de ${slides.length}: ${slides[activeSlide].title}`}
        </div>
      </section>
    </>
  )
} 
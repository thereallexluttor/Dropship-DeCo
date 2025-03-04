"use client"

import { useEffect, useRef } from 'react'

interface FadeInOnScrollProps {
  children: React.ReactNode
  delay?: number
}

export default function FadeInOnScroll({ children, delay = 0 }: FadeInOnScrollProps) {
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('fade-in')
            }, delay)
          }
        })
      },
      {
        threshold: 0.1,
      }
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current)
      }
    }
  }, [delay])

  return (
    <div 
      ref={elementRef} 
      className="opacity-0 translate-y-4 transition-all duration-700 ease-out"
    >
      {children}
    </div>
  )
} 
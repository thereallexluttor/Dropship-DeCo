"use client"

import { useEffect, useRef } from 'react'
import { useInView } from 'react-intersection-observer'

interface FadeInOnScrollProps {
  children: React.ReactNode
  delay?: number
}

export default function FadeInOnScroll({ children, delay = 0 }: FadeInOnScrollProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        inView
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-10'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
} 
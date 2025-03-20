export const colors = {
  primary: '#C6A55C',
  primaryDark: '#8B5A2B',
  black: '#1A1A1A',
  white: '#FFFFFF',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  }
} as const

export const imageEffects = {
  gold: "sepia(50%) hue-rotate(5deg) saturate(150%)",
  platinum: "brightness(110%) contrast(110%)",
  diamond: "brightness(120%) contrast(90%)",
  vintage: "sepia(20%) contrast(105%)"
} as const

export const transitions = {
  fast: "duration-200",
  medium: "duration-300",
  slow: "duration-500",
  easing: "ease-in-out"
} as const

export const shadows = {
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
  inner: "shadow-inner"
} as const

export const gradients = {
  primary: "bg-gradient-to-r from-[#C6A55C] to-[#8B5A2B]",
  primaryHover: "hover:from-[#8B5A2B] hover:to-[#C6A55C]",
  overlay: "bg-gradient-to-t from-black/70 via-black/20 to-transparent",
  overlayHover: "group-hover:from-black/80 group-hover:via-black/30 group-hover:to-transparent"
} as const

export const animations = {
  fadeIn: "animate-fadeIn",
  slideUp: "animate-slideUp",
  slideDown: "animate-slideDown",
  pulse: "animate-pulse"
} as const

export const typography = {
  h1: "text-4xl md:text-5xl font-poppins font-light leading-tight",
  h2: "text-3xl md:text-4xl font-poppins font-light leading-tight",
  h3: "text-2xl md:text-3xl font-poppins font-light leading-tight",
  h4: "text-xl md:text-2xl font-poppins font-light leading-tight",
  body: "text-base font-poppins leading-relaxed",
  small: "text-sm font-poppins",
  tiny: "text-xs font-poppins tracking-wide"
} as const

export const containers = {
  page: "container mx-auto px-4",
  section: "py-16 md:py-24",
  narrow: "max-w-2xl mx-auto",
  wide: "max-w-7xl mx-auto"
} as const

export const buttons = {
  base: `
    inline-flex items-center justify-center
    px-6 py-2 rounded-full
    font-medium text-sm
    transition-all duration-300
    focus:outline-none focus:ring-2 focus:ring-offset-2
  `,
  primary: `
    bg-[#C6A55C] text-white
    hover:bg-[#8B5A2B]
    focus:ring-[#C6A55C]
  `,
  secondary: `
    border-2 border-[#C6A55C] text-[#C6A55C]
    hover:bg-[#C6A55C] hover:text-white
    focus:ring-[#C6A55C]
  `,
  ghost: `
    text-gray-600 hover:text-[#C6A55C]
    hover:bg-gray-50
  `
} as const

export const inputs = {
  base: `
    w-full px-4 py-2 rounded-lg
    bg-white border border-gray-200
    text-gray-900 placeholder-gray-500
    focus:outline-none focus:ring-2 focus:ring-[#C6A55C] focus:border-transparent
    transition-all duration-200
  `,
  search: `
    pl-10 pr-4 h-10 rounded-full
    bg-gray-100
    text-sm text-gray-900 placeholder-gray-500
    focus:outline-none focus:ring-2 focus:ring-[#C6A55C]
    transition-all duration-200
  `
} as const

export const cards = {
  base: `
    bg-white rounded-lg overflow-hidden
    transition-all duration-300
  `,
  hover: `
    hover:shadow-lg
    transform transition-transform duration-300
    hover:-translate-y-1
  `,
  product: `
    group relative
    bg-white rounded-lg overflow-hidden
    transition-all duration-300
    hover:shadow-lg
  `
} as const

export const aspectRatios = {
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
  wide: "aspect-[21/9]"
} as const

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const 
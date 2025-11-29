import { createClient } from '@supabase/supabase-js'

// Estas variables de entorno deberían estar configuradas en tu proyecto
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ecwotusxxggwogzuzoup.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjd290dXN4eGdnd29nenV6b3VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNDcyNTAsImV4cCI6MjA3NTkyMzI1MH0.L1C8PYRkVFB2Gvpryvz6kMdv6qXwuE8Ymh-pHkiwifM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Tipos para la tabla usuarios
export interface Usuario {
  id?: number
  nombre: string
  correo: string
  telefono: string
  direccion: string
  rol: string
  password: string
  created_at?: string
  updated_at?: string
}

// Tipos para la tabla categories
export interface Categoria {
  id?: number
  nombre: string
  descripcion: string
  imagen_marca1?: string | null
  imagen_marca2?: string | null
  imagen_marca3?: string | null
  categoria_imagen?: string | null
  created_at?: string
  updated_at?: string
}

// Tipos para la tabla subcategories
export interface Subcategoria {
  id?: number
  categories_id: number
  nombre: string
  descripcion: string
  created_at?: string
  updated_at?: string
}

// Tipos para la tabla marcas
export interface Marca {
  id?: number
  nombre_marca: string
  created_at?: string
  updated_at?: string
}

// Tipos para tamaños de productos
export interface TamanoProducto {
  unidad: 'ML' | 'L' | 'G' | 'KG' | 'MG' | 'OZ' | 'LB' | 'UI' | 'Unidad' | 'Caja' | 'Tabletas' | 'Comprimidos' | 'Capsulas' | 'Sachet' | 'Blister'
  cantidad: number
}

// Tipos para el campo stocks (jsonb) que relaciona tamaño, precio y stock
export interface ProductoStock {
  id?: string  // identificador único para cada combinación
  cantidad: number  // cantidad del tamaño
  unidad: 'ML' | 'L' | 'G' | 'KG' | 'MG' | 'OZ' | 'LB' | 'UI' | 'Unidad' | 'Caja' | 'Tabletas' | 'Comprimidos' | 'Capsulas' | 'Sachet' | 'Blister'
  precio: number   // precio para este tamaño
  stock: number    // stock disponible para este tamaño
}

// Tipos para la tabla productos
export interface Producto {
  id?: number
  subcategorias_id: number
  nombre: string
  descripcion: string
  imagen_url?: string | null
  descuento?: boolean
  descuento_valor?: number | string
  destacado?: boolean
  novedad?: boolean
  id_marca?: number | null
  stocks?: ProductoStock[] | null  // Campo jsonb que contiene todas las combinaciones de tamaño, precio y stock
  // Campos antiguos mantenidos para compatibilidad durante la transición
  tamano?: TamanoProducto[] | null
  precios?: number[] | null  // Array de precios que corresponden a cada tamaño
  created_at?: string
  updated_at?: string
  // Relaciones con joins
  subcategorias?: {
    id: number
    nombre: string
    descripcion: string
    categories_id: number
    categories?: {
      id: number
      nombre: string
    }
  } | null
  marcas?: {
    id: number
    nombre_marca: string
  } | null
}

// Tipos para la tabla ui
export interface UI {
  id?: number
  banner?: string[] | null  // Array de URLs de imágenes o videos
  hiddenbanner?: string[] | null  // Array de URLs de imágenes o videos
  popup?: string | null  // URL de una imagen o video
  created_at?: string
  updated_at?: string
}

// Tipos para la tabla barra
export interface Barra {
  id?: number
  line1?: string | null
  line2?: string | null
  line3?: string | null
}

// Tipos para la tabla sobre_nosotros
export interface SobreNosotros {
  id?: number
  // Banner principal
  banner_texto?: string
  // Misión
  mision_titulo?: string
  mision_parrafo1?: string
  mision_parrafo2?: string
  // Visión
  vision_titulo?: string
  vision_parrafo1?: string
  vision_parrafo2?: string
  // Identidad Corporativa
  identidad_titulo?: string
  identidad_banner_texto?: string
  valores_titulo?: string
  // Valores (6 valores)
  valor1_titulo?: string
  valor1_descripcion?: string
  valor2_titulo?: string
  valor2_descripcion?: string
  valor3_titulo?: string
  valor3_descripcion?: string
  valor4_titulo?: string
  valor4_descripcion?: string
  valor5_titulo?: string
  valor5_descripcion?: string
  valor6_titulo?: string
  valor6_descripcion?: string
  created_at?: string
  updated_at?: string
}

// Tipos para la tabla tiendas
export interface Tienda {
  id?: number
  nombre: string
  direccion: string
  ciudad: string
  telefono: string
  contacto: string
  lat: number
  lng: number
  created_at?: string
  updated_at?: string
}

export default supabase

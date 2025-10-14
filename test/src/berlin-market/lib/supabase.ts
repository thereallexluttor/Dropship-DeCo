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

// Tipos para la tabla productos
export interface Producto {
  id?: number
  subcategorias_id: number
  nombre: string
  descripcion: string
  precio: number | string
  stock: number | string
  imagen_url?: string | null
  descuento?: boolean
  descuento_valor?: number | string
  destacado?: boolean
  created_at?: string
  updated_at?: string
}

export default supabase

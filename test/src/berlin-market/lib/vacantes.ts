import { supabase } from './supabase'

// Tipos para las tablas de Supabase
export interface Trabajo {
  id: number;
  titulo: string;
  departamento: string;
  ubicacion: string;
  tipo_contrato: string;
  salario: string;
  descripcion: string;
  requisitos: string[];
  beneficios: string[];
  activo: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface Aplicacion {
  id: number;
  trabajo_id: number;
  nombre_aplicante: string;
  email_aplicante: string;
  telefono_aplicante: string;
  experiencia_laboral: string;
  disponibilidad: string;
  mensaje: string;
  cv_url: string;
  estado: string;
  fecha_aplicacion: string;
  fecha_revision: string | null;
  notas_revision?: string | null;
}

// Función para obtener todos los trabajos activos
export const obtenerTrabajos = async (): Promise<Trabajo[]> => {
  try {
    const { data, error } = await supabase
      .from('trabajos')
      .select('*')
      .eq('activo', true)
      .order('fecha_creacion', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error obteniendo trabajos:', error)
    throw error
  }
}

// Función para obtener un trabajo específico por ID
export const obtenerTrabajoPorId = async (id: number): Promise<Trabajo | null> => {
  try {
    const { data, error } = await supabase
      .from('trabajos')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error obteniendo trabajo:', error)
    return null
  }
}

// Función para subir CV al bucket de Supabase
export const subirCV = async (file: File): Promise<string> => {
  try {
    // Verificar que el archivo sea válido
    if (!file || file.size === 0) {
      throw new Error('Archivo inválido o vacío')
    }

    // Verificar el tamaño del archivo (máximo 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB en bytes
    if (file.size > maxSize) {
      throw new Error('El archivo es demasiado grande. Máximo 10MB permitido.')
    }

    // Verificar el tipo de archivo
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Tipo de archivo no permitido. Solo se aceptan PDF, DOC y DOCX.')
    }

    const fileExt = file.name.split('.').pop() || 'pdf'
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `cvs/${fileName}`

    console.log('Subiendo archivo:', filePath, 'Tamaño:', file.size, 'Tipo:', file.type)

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Error de subida:', uploadError)
      throw new Error(`Error al subir archivo: ${uploadError.message}`)
    }

    console.log('Archivo subido exitosamente:', uploadData)

    // Obtener la URL pública del archivo
    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(filePath)

    console.log('URL pública obtenida:', data.publicUrl)
    return data.publicUrl
  } catch (error) {
    console.error('Error subiendo CV:', error)
    throw error
  }
}

// Función para enviar aplicación
export const enviarAplicacion = async (applicationData: Omit<Aplicacion, 'id' | 'fecha_aplicacion' | 'fecha_revision'>): Promise<Aplicacion> => {
  try {
    console.log('Enviando aplicación:', applicationData)

    // Verificar que todos los campos requeridos estén presentes
    const requiredFields = ['trabajo_id', 'nombre_aplicante', 'email_aplicante', 'telefono_aplicante', 'experiencia_laboral', 'disponibilidad', 'mensaje', 'cv_url', 'estado']
    for (const field of requiredFields) {
      if (!applicationData[field as keyof typeof applicationData]) {
        throw new Error(`Campo requerido faltante: ${field}`)
      }
    }

    const { data, error } = await supabase
      .from('aplicaciones')
      .insert([applicationData])
      .select()
      .single()

    if (error) {
      console.error('Error de base de datos:', error)
      throw new Error(`Error al guardar aplicación en base de datos: ${error.message}`)
    }

    console.log('Aplicación guardada exitosamente:', data)
    return data
  } catch (error) {
    console.error('Error enviando aplicación:', error)
    throw error
  }
}

// Función para obtener aplicaciones por estado
export const obtenerAplicacionesPorEstado = async (estado: string): Promise<Aplicacion[]> => {
  try {
    const { data, error } = await supabase
      .from('aplicaciones')
      .select(`
        id,
        trabajo_id,
        nombre_aplicante,
        email_aplicante,
        telefono_aplicante,
        experiencia_laboral,
        disponibilidad,
        mensaje,
        cv_url,
        estado,
        fecha_aplicacion,
        fecha_revision,
        notas_revision,
        trabajos!trabajo_id(titulo, departamento, ubicacion)
      `)
      .eq('estado', estado)
      .order('fecha_aplicacion', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error obteniendo aplicaciones:', error)
    throw error
  }
}

// Función para actualizar estado de aplicación
export const actualizarEstadoAplicacion = async (id: number, estado: string, notas?: string): Promise<void> => {
  try {
    console.log(`Actualizando aplicación ${id} a estado: ${estado}`)

    const updateData: any = {
      estado,
      fecha_revision: new Date().toISOString()
    }

    if (notas) {
      updateData.notas_revision = notas
    }

    console.log('Datos de actualización:', updateData)

    const { data, error } = await supabase
      .from('aplicaciones')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error de base de datos:', error)
      throw new Error(`Error al actualizar aplicación: ${error.message}`)
    }

    console.log('Aplicación actualizada exitosamente:', data)
  } catch (error) {
    console.error('Error actualizando aplicación:', error)
    throw error
  }
}

// Función para crear un nuevo trabajo
export const crearTrabajo = async (trabajoData: Omit<Trabajo, 'id' | 'fecha_creacion' | 'fecha_actualizacion'>): Promise<Trabajo> => {
  try {
    const { data, error } = await supabase
      .from('trabajos')
      .insert([trabajoData])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creando trabajo:', error)
    throw error
  }
}

// Función para editar un trabajo existente
export const editarTrabajo = async (id: number, trabajoData: Partial<Omit<Trabajo, 'id' | 'fecha_creacion'>>): Promise<Trabajo> => {
  try {
    const { data, error } = await supabase
      .from('trabajos')
      .update({ ...trabajoData, fecha_actualizacion: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error editando trabajo:', error)
    throw error
  }
}

// Función para obtener estadísticas de aplicaciones
export const obtenerEstadisticasAplicaciones = async () => {
  try {
    const { data, error } = await supabase
      .from('aplicaciones')
      .select('estado')

    if (error) throw error

    const estadisticas = data.reduce((acc: any, aplicacion) => {
      acc[aplicacion.estado] = (acc[aplicacion.estado] || 0) + 1
      return acc
    }, {})

    return estadisticas
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error)
    throw error
  }
}

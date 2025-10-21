"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Send,
  Upload,
  CheckCircle,
  XCircle
} from "lucide-react"
import Footer from '../../components/Footer'
import MainLayout from "../../components/MainLayout"
import { supabase } from '@/lib/supabase'
import { Trabajo, obtenerTrabajos, subirCV, enviarAplicacion } from '@/lib/vacantes'

// Tipos para las tablas de Supabase (compatible con enviarAplicacion)
interface ApplicationData {
  trabajo_id: number;
  nombre_aplicante: string;
  email_aplicante: string;
  telefono_aplicante: string;
  experiencia_laboral: string;
  disponibilidad: string;
  mensaje: string;
  cv_url: string;
  estado: string;
}

const OfertaDetalle = () => {
  const params = useParams()
  const router = useRouter()
  const [trabajo, setTrabajo] = useState<Trabajo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)

  // Estados para el formulario de aplicación
  const [formData, setFormData] = useState<{
    nombre: string;
    email: string;
    telefono: string;
    experiencia: string;
    disponibilidad: string;
    mensaje: string;
    cv: File | null;
  }>({
    nombre: '',
    email: '',
    telefono: '',
    experiencia: '',
    disponibilidad: '',
    mensaje: '',
    cv: null
  })

  useEffect(() => {
    const cargarDatos = async () => {
      if (!params.id) return

      try {
        setIsLoading(true)

        // Verificar autenticación del usuario
        const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
        if (!authError && currentUser) {
          setUser(currentUser)
        }

        // Cargar datos del trabajo
        const trabajosData = await obtenerTrabajos()
        const trabajoEncontrado = trabajosData.find(t => t.id === parseInt(params.id as string))

        if (trabajoEncontrado) {
          setTrabajo(trabajoEncontrado)
        } else {
          // Si no se encuentra el trabajo, redirigir a vacantes
          router.push('/vacantes')
        }
      } catch (error) {
        console.error('Error obteniendo datos:', error)
        router.push('/vacantes')
      } finally {
        setIsLoading(false)
      }
    }

    cargarDatos()
  }, [params.id, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement
    const { name, value } = target
    const files = target.files

    if (name === 'cv' && files && files.length > 0) {
      setFormData(prev => ({ ...prev, cv: files[0] }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmitApplication = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!trabajo || !formData.cv) {
      alert('Por favor completa todos los campos requeridos incluyendo el CV.')
      return
    }

    try {
      setIsSubmitting(true)

      // Verificar autenticación del usuario
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        alert('Debes iniciar sesión para enviar una aplicación.')
        return
      }

      console.log('Usuario autenticado:', user.email)

      // Subir CV al bucket de Supabase
      const cvUrl = await subirCV(formData.cv)

      // Crear datos de la aplicación
      const applicationData: ApplicationData = {
        trabajo_id: trabajo.id,
        nombre_aplicante: formData.nombre,
        email_aplicante: formData.email,
        telefono_aplicante: formData.telefono,
        experiencia_laboral: formData.experiencia,
        disponibilidad: formData.disponibilidad,
        mensaje: formData.mensaje,
        cv_url: cvUrl,
        estado: 'pendiente'
      }

      // Enviar aplicación usando la función de utilidad
      await enviarAplicacion(applicationData)

      alert(`¡Aplicación enviada exitosamente para el puesto de ${trabajo?.titulo || 'trabajo'}! Te contactaremos pronto.`)

      // Limpiar formulario y cerrar modal
      setIsApplicationModalOpen(false)
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        experiencia: '',
        disponibilidad: '',
        mensaje: '',
        cv: null
      })
    } catch (error) {
      console.error('Error enviando aplicación:', error)
      alert('Error enviando la aplicación. Por favor intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#196428]"></div>
        </div>
      </MainLayout>
    )
  }

  if (!trabajo) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Oferta no encontrada</h1>
            <Link href="/vacantes" className="text-[#196428] hover:underline">
              Volver a vacantes
            </Link>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Volver</span>
              </button>
              <div className="h-6 w-[1px] bg-gray-300"></div>
              <h1 className="text-xl font-semibold text-gray-800">Detalles de la Oferta</h1>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Job Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{trabajo.titulo}</h1>
                  <p className="text-xl text-[#196428] font-semibold mb-4">{trabajo.departamento}</p>

                  {/* Job Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-5 h-5 mr-3 text-gray-400" />
                      <span>{trabajo.ubicacion}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-5 h-5 mr-3 text-gray-400" />
                      <span>{trabajo.tipo_contrato}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <DollarSign className="w-5 h-5 mr-3 text-green-600" />
                      <span className="font-semibold text-green-600">{trabajo.salario}</span>
                    </div>
                  </div>
                </div>

              </div>

              <div className="border-t border-gray-200 pt-6">
                {user ? (
                  <button
                    onClick={() => setIsApplicationModalOpen(true)}
                    className="bg-[#196428] hover:bg-[#2d7a3d] text-white font-semibold py-3 px-8 rounded-lg transition-colors flex items-center space-x-2 mx-auto"
                  >
                    <Send className="w-5 h-5" />
                    <span>Aplicar a la Oferta</span>
                  </button>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-600 mb-3">Debes iniciar sesión para aplicar a esta oferta</p>
                    <Link
                      href="/cuenta"
                      className="bg-[#196428] hover:bg-[#2d7a3d] text-white font-semibold py-2 px-6 rounded-lg transition-colors inline-block"
                    >
                      Iniciar Sesión
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Job Description */}
            <div className="max-w-4xl">
              {/* Main Content */}
              <div className="space-y-8">
                {/* Description */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Descripción del Puesto</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">{trabajo.descripcion}</p>
                </div>

                {/* Requirements */}
                {trabajo.requisitos && trabajo.requisitos.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Requisitos</h2>
                    <ul className="space-y-2">
                      {trabajo.requisitos.map((requisito, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{requisito}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Benefits */}
                {trabajo.beneficios && trabajo.beneficios.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Beneficios</h2>
                    <ul className="space-y-2">
                      {trabajo.beneficios.map((beneficio, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{beneficio}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {isApplicationModalOpen && trabajo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Aplicar a: {trabajo?.titulo || 'Puesto de trabajo'}
                </h2>
                <button
                  onClick={() => setIsApplicationModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitApplication} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#196428] focus:border-transparent"
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correo electrónico *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#196428] focus:border-transparent"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#196428] focus:border-transparent"
                      placeholder="+34 600 000 000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experiencia laboral
                    </label>
                    <select
                      name="experiencia"
                      value={formData.experiencia}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#196428] focus:border-transparent"
                    >
                      <option value="">Seleccionar experiencia</option>
                      <option value="0-1">Menos de 1 año</option>
                      <option value="1-3">1-3 años</option>
                      <option value="3-5">3-5 años</option>
                      <option value="5+">Más de 5 años</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Disponibilidad
                  </label>
                  <select
                    name="disponibilidad"
                    value={formData.disponibilidad}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#196428] focus:border-transparent"
                  >
                    <option value="">Seleccionar disponibilidad</option>
                    <option value="inmediata">Inmediata</option>
                    <option value="2-semanas">En 2 semanas</option>
                    <option value="1-mes">En 1 mes</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensaje adicional
                  </label>
                  <textarea
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#196428] focus:border-transparent"
                    placeholder="Cuéntanos por qué quieres trabajar con nosotros..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currículum Vitae (CV) *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-2">
                      {formData.cv ? formData.cv.name : "Arrastra tu CV aquí o haz clic para seleccionar"}
                    </p>
                    <input
                      type="file"
                      name="cv"
                      onChange={handleInputChange}
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      id="cv-upload"
                      required
                    />
                    <label
                      htmlFor="cv-upload"
                      className="inline-block bg-[#196428] hover:bg-[#2d7a3d] text-white px-4 py-2 rounded-lg cursor-pointer text-sm transition-colors"
                    >
                      Seleccionar archivo
                    </label>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-[#196428] hover:bg-[#2d7a3d] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Enviar Aplicación</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsApplicationModalOpen(false)}
                    disabled={isSubmitting}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-800 font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </MainLayout>
  )
}

export default OfertaDetalle

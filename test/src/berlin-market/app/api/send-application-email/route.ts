import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

// Inicializar Resend con la API key
const resend = new Resend('re_GJUqDTzA_7ebg7BLvry5HDYpsB4bfNCSg')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      jobTitle,
      jobDepartment,
      jobLocation,
      jobContractType,
      jobSalary,
      applicantName,
      applicantEmail,
      applicantPhone,
      applicantExperience,
      applicantAvailability,
      applicantMessage,
      cvUrl,
      applicationId,
      applicationDate
    } = body

    // Validar que tenemos todos los datos necesarios
    if (!jobTitle || !applicantName || !applicantEmail || !applicantPhone || !cvUrl) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos para enviar el correo' },
        { status: 400 }
      )
    }

    // Mapear experiencia laboral a texto legible
    const experienciaMap: { [key: string]: string } = {
      '0-1': 'Menos de 1 año',
      '1-3': '1-3 años',
      '3-5': '3-5 años',
      '5+': 'Más de 5 años'
    }

    // Mapear disponibilidad a texto legible
    const disponibilidadMap: { [key: string]: string } = {
      'inmediata': 'Inmediata',
      '2-semanas': 'En 2 semanas',
      '1-mes': 'En 1 mes',
      'flexible': 'Flexible'
    }

    const experienciaTexto = experienciaMap[applicantExperience] || applicantExperience || 'No especificada'
    const disponibilidadTexto = disponibilidadMap[applicantAvailability] || applicantAvailability || 'No especificada'

    // Crear el contenido HTML del correo
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nueva Aplicación de Trabajo</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #196428;">
            <h1 style="color: #196428; margin: 0; font-size: 28px;">Unisantander</h1>
            <p style="color: #6b7280; margin: 5px 0 0 0;">Nueva Aplicación de Trabajo</p>
            ${applicationId ? `
            <div style="background-color: #196428; color: #ffffff; padding: 15px; border-radius: 10px; margin: 15px 0; font-size: 24px; font-weight: bold; letter-spacing: 2px;">
              Aplicación #${applicationId}
            </div>` : ''}
          </div>

          <!-- Greeting -->
          <div style="margin-bottom: 20px;">
            <h2 style="color: #196428; margin: 0 0 10px 0;">📋 Nueva Aplicación Recibida</h2>
            <p style="color: #4b5563; margin: 0;">Se ha recibido una nueva aplicación para una oferta de trabajo en Unisantander.</p>
          </div>

          <!-- Job Details -->
          <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px; border-bottom: 2px solid #196428; padding-bottom: 10px;">Información de la Oferta de Trabajo</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Puesto:</td>
                <td style="padding: 8px 0; text-align: right;"><strong style="color: #196428; font-size: 16px;">${jobTitle}</strong></td>
              </tr>
              ${jobDepartment ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Departamento:</td>
                <td style="padding: 8px 0; text-align: right;"><strong>${jobDepartment}</strong></td>
              </tr>` : ''}
              ${jobLocation ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Ubicación:</td>
                <td style="padding: 8px 0; text-align: right;"><strong>${jobLocation}</strong></td>
              </tr>` : ''}
              ${jobContractType ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Tipo de contrato:</td>
                <td style="padding: 8px 0; text-align: right;"><strong>${jobContractType}</strong></td>
              </tr>` : ''}
              ${jobSalary ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Salario:</td>
                <td style="padding: 8px 0; text-align: right;"><strong style="color: #059669;">${jobSalary}</strong></td>
              </tr>` : ''}
              ${applicationDate ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Fecha de aplicación:</td>
                <td style="padding: 8px 0; text-align: right;"><strong>${new Date(applicationDate).toLocaleDateString('es-CO', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</strong></td>
              </tr>` : ''}
            </table>
          </div>

          <!-- Applicant Details -->
          <div style="background-color: #eff6ff; border-left: 4px solid #196428; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px; border-bottom: 2px solid #196428; padding-bottom: 10px;">Información del Aplicante</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Nombre completo:</td>
                <td style="padding: 8px 0; text-align: right;"><strong style="color: #196428; font-size: 16px;">${applicantName}</strong></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Correo electrónico:</td>
                <td style="padding: 8px 0; text-align: right;">
                  <a href="mailto:${applicantEmail}" style="color: #196428; text-decoration: none; font-weight: 600;">${applicantEmail}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Teléfono:</td>
                <td style="padding: 8px 0; text-align: right;">
                  <a href="tel:${applicantPhone}" style="color: #196428; text-decoration: none; font-weight: 600;">${applicantPhone}</a>
                </td>
              </tr>
              ${applicantExperience ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Experiencia laboral:</td>
                <td style="padding: 8px 0; text-align: right;"><strong>${experienciaTexto}</strong></td>
              </tr>` : ''}
              ${applicantAvailability ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Disponibilidad:</td>
                <td style="padding: 8px 0; text-align: right;"><strong>${disponibilidadTexto}</strong></td>
              </tr>` : ''}
            </table>
          </div>

          <!-- Message -->
          ${applicantMessage ? `
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #92400e; margin: 0 0 15px 0; font-size: 18px; font-weight: bold;">💬 Mensaje del Aplicante</h3>
            <p style="color: #78350f; margin: 0; font-size: 14px; line-height: 1.8; white-space: pre-wrap;">${applicantMessage}</p>
          </div>` : ''}

          <!-- CV Link -->
          <div style="background-color: #196428; border-radius: 8px; padding: 20px; margin-bottom: 20px; text-align: center;">
            <h3 style="color: #ffffff; margin: 0 0 15px 0; font-size: 18px; font-weight: bold;">📄 Currículum Vitae</h3>
            <a 
              href="${cvUrl}" 
              target="_blank" 
              rel="noopener noreferrer"
              style="display: inline-block; background-color: #ffffff; color: #196428; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px; margin-top: 10px; transition: all 0.3s ease;"
            >
              📥 Ver/Descargar CV
            </a>
            <p style="color: #d1fae5; margin: 15px 0 0 0; font-size: 12px;">
              Haz clic en el botón para ver o descargar el currículum del aplicante
            </p>
          </div>

          <!-- Action Required -->
          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
            <h4 style="color: #991b1b; margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">⚠️ Acción Requerida</h4>
            <p style="color: #7f1d1d; margin: 0; font-size: 14px; line-height: 1.6;">
              Por favor, revisa esta aplicación y contacta al candidato para continuar con el proceso de selección.
            </p>
          </div>

          <!-- Contact Info -->
          <div style="text-align: center; padding-top: 20px; border-top: 2px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">Este es un correo automático del sistema de aplicaciones de Unisantander.</p>
            <p style="margin: 0;">
              <a href="mailto:talentohumano@unisander.com" style="color: #196428; text-decoration: none; font-weight: 600;">talentohumano@unisander.com</a>
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} Unisantander. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    // Enviar correo a talentohumano@unisander.com
    const data = await resend.emails.send({
      from: 'noreply@unisantander.co',
      to: 'talentohumano@unisander.com',
      subject: `📋 Nueva Aplicación - ${jobTitle} - ${applicantName}`,
      html: htmlContent
    })

    return NextResponse.json({
      success: true,
      message: 'Correo de notificación enviado exitosamente',
      data: data
    })

  } catch (error) {
    console.error('Error al enviar correo de aplicación:', error)
    return NextResponse.json(
      { 
        error: 'Error al enviar el correo',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}



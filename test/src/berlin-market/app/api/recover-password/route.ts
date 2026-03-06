import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabase } from '@/lib/supabase'

const resend = new Resend(process.env.RESEND_API_KEY || 're_GJUqDTzA_7ebg7BLvry5HDYpsB4bfNCSg')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const email = (body?.email as string | undefined)?.trim()

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email inválido' },
        { status: 400 }
      )
    }

    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('correo, nombre, password')
      .eq('correo', email)
      .single()

    if (error || !usuario) {
      console.error('Usuario no encontrado o error al buscar usuario:', error)
      return NextResponse.json(
        {
          success: false,
          error:
            'Si el correo existe en nuestro sistema, recibirás un email con tu contraseña.',
        },
        { status: 200 }
      )
    }

    const nombre = usuario.nombre || 'Cliente'
    const password = usuario.password

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Recuperación de contraseña</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827; background-color: #f3f4f6; padding: 24px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; padding: 24px; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08); border: 1px solid #e5e7eb;">
            <div style="text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px solid #196428;">
              <h1 style="margin: 0; font-size: 24px; color: #196428;">Unisantander</h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #6b7280;">Recuperación de contraseña</p>
            </div>

            <div style="margin-bottom: 20px;">
              <p style="margin: 0 0 12px 0; font-size: 15px;">Hola ${nombre},</p>
              <p style="margin: 0 0 12px 0; font-size: 14px; color: #374151;">
                Hemos recibido una solicitud para recuperar la contraseña de tu cuenta en Unisantander asociada a este correo electrónico.
              </p>
            </div>

            <div style="margin: 20px 0; padding: 16px; background-color: #ecfdf3; border-left: 4px solid #16a34a; border-radius: 8px;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #166534; font-weight: 600;">
                Tu contraseña actual es:
              </p>
              <p style="margin: 0; font-size: 18px; font-weight: 700; color: #14532d;">
                ${password}
              </p>
            </div>

            <div style="margin-bottom: 20px;">
              <p style="margin: 0 0 8px 0; font-size: 13px; color: #4b5563;">
                Te recomendamos cambiar tu contraseña después de iniciar sesión para mantener segura tu cuenta.
              </p>
              <p style="margin: 0; font-size: 13px; color: #9ca3af;">
                Si tú no solicitaste este correo, puedes ignorarlo. Nadie más podrá cambiar tu contraseña sin acceso a este email.
              </p>
            </div>

            <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #9ca3af;">
                © ${new Date().getFullYear()} Unisantander. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    const { error: resendError } = await resend.emails.send({
      from: 'noreply@unisantander.co',
      to: usuario.correo,
      subject: 'Recuperación de contraseña - Unisantander',
      html: htmlContent,
    })

    if (resendError) {
      console.error('Error al enviar correo de recuperación de contraseña:', resendError)
      return NextResponse.json(
        {
          success: false,
          error: 'No se pudo enviar el correo de recuperación de contraseña.',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error en el endpoint /api/recover-password:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al procesar la solicitud de recuperación de contraseña.',
      },
      { status: 500 }
    )
  }
}


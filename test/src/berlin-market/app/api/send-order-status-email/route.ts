import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

// Inicializar Resend con la API key
const resend = new Resend('re_GJUqDTzA_7ebg7BLvry5HDYpsB4bfNCSg')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      userEmail, 
      userName, 
      orderId, 
      orderDate, 
      totalAmount, 
      items, 
      orderStatus, 
      address 
    } = body

    // Validar que tenemos todos los datos necesarios
    if (!userEmail || !orderId || !totalAmount || !orderStatus) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos para enviar el correo' },
        { status: 400 }
      )
    }

    // Validar que el estado es uno de los permitidos para seguimiento
    const estadosPermitidos = ['pagado', 'enviado', 'entregado']
    if (!estadosPermitidos.includes(orderStatus)) {
      return NextResponse.json(
        { error: `El estado "${orderStatus}" no requiere correo de seguimiento` },
        { status: 400 }
      )
    }

    // Crear el contenido HTML del correo según el estado
    const itemsHtml = items?.map((item: any) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
          <strong>${item.nombre || item.nombre_producto}</strong><br/>
          ${item.descripcion ? `<span style="color: #6b7280; font-size: 14px;">${item.descripcion}</span>` : ''}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">
          ${item.quantity || item.cantidad}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">
          $${((item.unitPrice || (item.subtotal / (item.quantity || item.cantidad)))).toLocaleString('es-CO')}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">
          <strong>$${(item.subtotal || (item.unitPrice * item.quantity)).toLocaleString('es-CO')}</strong>
        </td>
      </tr>
    `).join('') || ''

    // Configuración de contenido según el estado
    let subject = ''
    let statusTitle = ''
    let statusMessage = ''
    let statusIcon = ''
    let statusColor = ''
    let actionSection = ''

    switch (orderStatus) {
      case 'pagado':
        subject = `✅ Pago Confirmado - Pedido #${orderId} - Unisantander`
        statusTitle = 'Pago Confirmado'
        statusIcon = '💳'
        statusColor = '#2563eb'
        statusMessage = 'Tu pago ha sido confirmado exitosamente. Estamos preparando tu pedido para su envío.'
        actionSection = `
          <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
            <h4 style="color: #1e40af; margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">📦 Próximos pasos:</h4>
            <p style="color: #1e3a8a; margin: 0; font-size: 14px; line-height: 1.6;">
              Estamos preparando tu pedido con mucho cuidado. Te notificaremos cuando esté listo para ser enviado.
            </p>
          </div>
        `
        break
      
      case 'enviado':
        subject = `📦 Tu Pedido #${orderId} Ha Sido Enviado - Unisantander`
        statusTitle = 'Pedido Enviado'
        statusIcon = '📦'
        statusColor = '#9333ea'
        statusMessage = '¡Tu pedido ha sido enviado! Está en camino hacia la dirección de entrega que proporcionaste.'
        actionSection = `
          <div style="background-color: #faf5ff; border-left: 4px solid #9333ea; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
            <h4 style="color: #6b21a8; margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">🚚 Información de envío:</h4>
            <p style="color: #581c87; margin: 0 0 10px 0; font-size: 14px; line-height: 1.6;">
              Tu pedido está en camino. El tiempo de entrega estimado es de 3-5 días hábiles.
            </p>
            ${address ? `
              <p style="color: #581c87; margin: 10px 0 0 0; font-size: 14px; line-height: 1.6;">
                <strong>Dirección de entrega:</strong><br/>
                ${address}
              </p>
            ` : ''}
          </div>
        `
        break
      
      case 'entregado':
        subject = `✅ Tu Pedido #${orderId} Ha Sido Entregado - Unisantander`
        statusTitle = 'Pedido Entregado'
        statusIcon = '✅'
        statusColor = '#16a34a'
        statusMessage = '¡Tu pedido ha sido entregado exitosamente! Esperamos que disfrutes tus productos.'
        actionSection = `
          <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
            <h4 style="color: #15803d; margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">🎉 ¡Gracias por tu compra!</h4>
            <p style="color: #166534; margin: 0 0 10px 0; font-size: 14px; line-height: 1.6;">
              Esperamos que estés completamente satisfecho con tu compra. Si tienes alguna pregunta o necesitas asistencia, no dudes en contactarnos.
            </p>
            <p style="color: #166534; margin: 10px 0 0 0; font-size: 14px; line-height: 1.6;">
              <strong>¿Te gustó tu experiencia?</strong> Nos encantaría conocer tu opinión.
            </p>
          </div>
        `
        break
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Actualización de Pedido</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid ${statusColor};">
            <h1 style="color: #196428; margin: 0; font-size: 28px;">Unisantander</h1>
            <p style="color: #6b7280; margin: 5px 0 0 0;">Actualización de Pedido</p>
            <div style="background-color: ${statusColor}; color: #ffffff; padding: 15px; border-radius: 10px; margin: 15px 0; font-size: 36px; font-weight: bold; letter-spacing: 2px;">
              ${statusIcon} ${statusTitle}
            </div>
          </div>

          <!-- Greeting -->
          <div style="margin-bottom: 20px;">
            <h2 style="color: ${statusColor}; margin: 0 0 10px 0;">¡Hola${userName ? ', ' + userName : ''}!</h2>
            <p style="color: #4b5563; margin: 0;">${statusMessage}</p>
          </div>

          <!-- Order Details -->
          <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Detalles del Pedido</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Número de pedido:</td>
                <td style="padding: 8px 0; text-align: right;"><strong style="font-size: 18px; color: ${statusColor}; font-weight: bold;">#${orderId}</strong></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Fecha:</td>
                <td style="padding: 8px 0; text-align: right;"><strong>${new Date(orderDate).toLocaleDateString('es-CO', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</strong></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;">Estado:</td>
                <td style="padding: 8px 0; text-align: right;">
                  <span style="background-color: ${orderStatus === 'pagado' ? '#dbeafe' : orderStatus === 'enviado' ? '#f3e8ff' : '#dcfce7'}; color: ${orderStatus === 'pagado' ? '#1e40af' : orderStatus === 'enviado' ? '#6b21a8' : '#15803d'}; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 500;">
                    ${statusIcon} ${orderStatus === 'pagado' ? 'Pagado' : orderStatus === 'enviado' ? 'Enviado' : 'Entregado'}
                  </span>
                </td>
              </tr>
              ${address ? `
              <tr>
                <td style="padding: 8px 0; color: #6b7280; vertical-align: top;">Dirección de entrega:</td>
                <td style="padding: 8px 0; text-align: right;">${address}</td>
              </tr>` : ''}
            </table>
          </div>

          <!-- Products Table -->
          ${itemsHtml ? `
          <div style="margin-bottom: 20px;">
            <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Productos</h3>
            <table style="width: 100%; border-collapse: collapse; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
              <thead>
                <tr style="background-color: #f9fafb;">
                  <th style="padding: 12px 10px; text-align: left; color: #374151; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Producto</th>
                  <th style="padding: 12px 10px; text-align: center; color: #374151; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Cantidad</th>
                  <th style="padding: 12px 10px; text-align: right; color: #374151; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Precio</th>
                  <th style="padding: 12px 10px; text-align: right; color: #374151; font-weight: 600; border-bottom: 2px solid #e5e7eb;">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>
          ` : ''}

          <!-- Total -->
          <div style="background-color: ${statusColor}; border-radius: 8px; padding: 20px; margin-bottom: 20px; color: #ffffff;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 20px; font-weight: 600;">Total:</span>
              <span style="font-size: 28px; font-weight: bold;">$${totalAmount.toLocaleString('es-CO')}</span>
            </div>
          </div>

          <!-- Action Section (depende del estado) -->
          ${actionSection}

          <!-- Contact Info -->
          <div style="text-align: center; padding-top: 20px; border-top: 2px solid #e5e7eb;">
            <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">¿Tienes alguna pregunta sobre tu pedido?</p>
            <p style="margin: 0;">
              <a href="mailto:sistemas@unisander.com" style="color: #196428; text-decoration: none; font-weight: 600;">sistemas@unisander.com</a>
            </p>
            <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 12px;">
              WhatsApp: <a href="https://wa.me/3152255019" style="color: #196428; text-decoration: none; font-weight: 600;">3152255019</a>
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

    // Enviar correo al cliente
    const data = await resend.emails.send({
      from: 'noreply@unisantander.co',
      to: userEmail,
      subject: subject,
      html: htmlContent
    })

    // Enviar copia para registro interno
    const internalEmail = await resend.emails.send({
      from: 'noreply@unisantander.co',
      to: 'distribuidora@unisander.com',
      subject: subject,
      html: htmlContent
    })

    return NextResponse.json({
      success: true,
      message: 'Correo de seguimiento enviado exitosamente',
      data: {
        customerEmail: data,
        internalEmail: internalEmail
      }
    })

  } catch (error) {
    console.error('Error al enviar correo de seguimiento:', error)
    return NextResponse.json(
      { 
        error: 'Error al enviar el correo de seguimiento',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}


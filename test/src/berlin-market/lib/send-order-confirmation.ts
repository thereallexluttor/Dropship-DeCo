import { Resend } from 'resend'
import { supabase } from './supabase'

const resend = new Resend(process.env.RESEND_API_KEY || 're_GJUqDTzA_7ebg7BLvry5HDYpsB4bfNCSg')

const GUEST_USER_ID = 35

interface OrderItem {
  nombre: string
  descripcion: string
  quantity: number
  unitPrice: number
}

interface SendParams {
  pedidoId: number
  buyerEmail?: string
  buyerName?: string
  buyerPhone?: string
}

export const sendOrderConfirmationEmail = async ({
  pedidoId,
  buyerEmail,
  buyerName,
  buyerPhone,
}: SendParams): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log(`📧 Preparando email de confirmación para pedido #${pedidoId}`)

    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos')
      .select('id, usuario_id, fecha, total, estado, Direccion')
      .eq('id', pedidoId)
      .single()

    if (pedidoError || !pedido) {
      const msg = `Pedido #${pedidoId} no encontrado`
      console.error('❌ Email:', msg, pedidoError)
      return { success: false, error: msg }
    }

    let email = buyerEmail || ''
    let name = buyerName || ''
    let phone = buyerPhone || ''

    if (!email) {
      try {
        const { data: pagoRow } = await supabase
          .from('pagos_pendientes')
          .select('*')
          .eq('pedido_id', pedidoId)
          .order('id', { ascending: false })
          .limit(1)
          .single()

        if (pagoRow) {
          email = email || pagoRow.email_comprador || ''
          name = name || pagoRow.nombre_comprador || ''
          phone = phone || pagoRow.telefono_comprador || ''
        }
      } catch {
        // columns might not exist yet
      }
    }

    if (!email && pedido.usuario_id !== GUEST_USER_ID) {
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('correo, nombre, telefono')
        .eq('id', pedido.usuario_id)
        .single()

      if (usuario) {
        email = email || usuario.correo || ''
        name = name || usuario.nombre || ''
        phone = phone || usuario.telefono || ''
      }
    }

    if (!email) {
      const msg = `No se encontró email del comprador para pedido #${pedidoId} (usuario_id: ${pedido.usuario_id})`
      console.error('❌ Email:', msg)
      return { success: false, error: msg }
    }

    const { data: detalles } = await supabase
      .from('detalle_pedido')
      .select('producto_id, cantidad, subtotal')
      .eq('pedido_id', pedidoId)

    const items: OrderItem[] = []
    if (detalles && detalles.length > 0) {
      const productIds = [...new Set(detalles.map(d => d.producto_id))]
      const { data: productos } = await supabase
        .from('productos')
        .select('id, nombre, descripcion')
        .in('id', productIds)

      const productoMap = new Map((productos || []).map((p: any) => [p.id, p]))

      for (const d of detalles) {
        const prod = productoMap.get(d.producto_id)
        items.push({
          nombre: prod?.nombre || 'Producto',
          descripcion: prod?.descripcion || '',
          quantity: d.cantidad,
          unitPrice: d.cantidad > 0 ? Math.round(d.subtotal / d.cantidad) : 0,
        })
      }
    }

    const htmlContent = buildOrderEmailHtml({
      orderId: pedido.id,
      orderDate: pedido.fecha,
      totalAmount: pedido.total,
      address: pedido.Direccion,
      orderStatus: pedido.estado,
      userName: name,
      userPhone: phone,
      items,
    })

    console.log(`📧 Enviando email a ${email} para pedido #${pedido.id}`)

    const { error: customerError } = await resend.emails.send({
      from: 'noreply@unisantander.co',
      to: email,
      subject: `🎯 Confirmación de Pedido #${pedido.id} - Unisantander`,
      html: htmlContent,
    })

    if (customerError) {
      console.error('❌ Error Resend (cliente):', customerError)
      return { success: false, error: `Resend error: ${JSON.stringify(customerError)}` }
    }

    const { error: internalError } = await resend.emails.send({
      from: 'noreply@unisantander.co',
      to: 'distribuidora@unisander.com',
      subject: `📋 Registro - Pedido #${pedido.id} - ${name || 'Cliente'} - $${pedido.total.toLocaleString('es-CO')}${phone ? ' - Tel: ' + phone : ''}`,
      html: htmlContent,
    })

    if (internalError) {
      console.error('⚠️ Error Resend (interno):', internalError)
    }

    console.log(`✅ Emails enviados exitosamente para pedido #${pedido.id} a ${email}`)
    return { success: true }
  } catch (error) {
    console.error('❌ Error inesperado enviando email:', error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

function buildOrderEmailHtml(params: {
  orderId: number
  orderDate: string
  totalAmount: number
  address: string
  orderStatus: string
  userName: string
  userPhone: string
  items: OrderItem[]
}): string {
  const { orderId, orderDate, totalAmount, address, orderStatus, userName, userPhone, items } = params

  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">
        <strong>${item.nombre}</strong><br/>
        <span style="color: #6b7280; font-size: 14px;">${item.descripcion || ''}</span>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        ${item.quantity}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        $${item.unitPrice.toLocaleString('es-CO')}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        <strong>$${(item.unitPrice * item.quantity).toLocaleString('es-CO')}</strong>
      </td>
    </tr>
  `).join('')

  const statusBg = orderStatus === 'aprobado' ? '#dcfce7' : '#fef3c7'
  const statusColor = orderStatus === 'aprobado' ? '#166534' : '#92400e'
  const statusLabel = orderStatus === 'pendiente' ? 'Pendiente' : orderStatus === 'aprobado' ? 'Aprobado' : orderStatus

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de Pedido</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
  <div style="background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #196428;">
      <h1 style="color: #196428; margin: 0; font-size: 28px;">Unisantander</h1>
      <p style="color: #6b7280; margin: 5px 0 0 0;">Confirmación de Pedido</p>
      <div style="background-color: #196428; color: #ffffff; padding: 15px; border-radius: 10px; margin: 15px 0; font-size: 36px; font-weight: bold; letter-spacing: 2px;">
        #${orderId}
      </div>
    </div>
    <div style="margin-bottom: 20px;">
      <h2 style="color: #196428; margin: 0 0 10px 0;">¡Gracias por tu compra${userName ? ', ' + userName : ''}!</h2>
      <p style="color: #4b5563; margin: 0;">Hemos recibido tu pedido y lo estamos procesando. Te mantendremos informado sobre su estado.</p>
    </div>
    <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
      <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">Detalles del Pedido</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Número de pedido:</td>
          <td style="padding: 8px 0; text-align: right;"><strong style="font-size: 18px; color: #196428; font-weight: bold;">#${orderId}</strong></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Fecha:</td>
          <td style="padding: 8px 0; text-align: right;"><strong>${new Date(orderDate).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #6b7280;">Estado:</td>
          <td style="padding: 8px 0; text-align: right;">
            <span style="background-color: ${statusBg}; color: ${statusColor}; padding: 4px 12px; border-radius: 20px; font-size: 14px; font-weight: 500;">
              ${statusLabel}
            </span>
          </td>
        </tr>
        ${address ? `<tr>
          <td style="padding: 8px 0; color: #6b7280; vertical-align: top;">Dirección de entrega:</td>
          <td style="padding: 8px 0; text-align: right;">${address}</td>
        </tr>` : ''}
        ${userPhone ? `<tr>
          <td style="padding: 8px 0; color: #6b7280; vertical-align: top;">Teléfono de contacto:</td>
          <td style="padding: 8px 0; text-align: right;">${userPhone}</td>
        </tr>` : ''}
      </table>
    </div>
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
    <div style="background-color: #196428; border-radius: 8px; padding: 20px; margin-bottom: 20px; color: #ffffff;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 20px; font-weight: 600;">Total pagado:</span>
        <span style="font-size: 28px; font-weight: bold;">$${totalAmount.toLocaleString('es-CO')}</span>
      </div>
    </div>
    <div style="background-color: #ecfdf3; border-left: 4px solid #16a34a; padding: 16px; margin-bottom: 20px; border-radius: 8px;">
      <h4 style="color: #166534; margin: 0 0 10px 0; font-size: 18px; font-weight: bold;">✅ Pago recibido correctamente</h4>
      <p style="color: #14532d; margin: 0 0 8px 0; font-size: 14px; line-height: 1.6;">
        Hemos procesado tu pago a través de nuestra pasarela de pagos y tu pedido <strong>#${orderId}</strong> ha quedado registrado con éxito.
      </p>
      <p style="color: #166534; margin: 0 0 8px 0; font-size: 14px; line-height: 1.6;">
        No necesitas realizar ningún paso adicional de pago. Te enviaremos actualizaciones cuando tu pedido cambie de estado y esté listo para despacho o recogida.
      </p>
    </div>
    <div style="text-align: center; padding-top: 20px; border-top: 2px solid #e5e7eb;">
      <p style="color: #6b7280; margin: 0 0 10px 0; font-size: 14px;">¿Tienes alguna pregunta sobre tu pedido?</p>
      <p style="margin: 0;">
        <a href="mailto:sistemas@unisander.com" style="color: #196428; text-decoration: none; font-weight: 600;">sistemas@unisander.com</a>
      </p>
      <p style="color: #6b7280; margin: 5px 0 0 0; font-size: 12px;">
        WhatsApp: <a href="https://wa.me/3112777907" style="color: #196428; text-decoration: none; font-weight: 600;">3112777907</a>
      </p>
    </div>
    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <p style="color: #9ca3af; font-size: 12px; margin: 0;">
        © ${new Date().getFullYear()} Unisantander. Todos los derechos reservados.
      </p>
    </div>
  </div>
</body>
</html>`
}

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabase } from '@/lib/supabase'

// Función para validar la autenticación del webhook
function buildAuth() {
  const seed = new Date().toISOString()
  const nonceBuffer = crypto.randomBytes(16)
  const nonce = nonceBuffer.toString('base64')

  const secretKey = process.env.AVAL_SECRET_KEY || ''
  
  // tranKey = base64( sha1( nonce + seed + secretKey ) )
  const sha1 = crypto.createHash('sha1')
  sha1.update(Buffer.concat([
    nonceBuffer,
    Buffer.from(seed, 'utf8'),
    Buffer.from(secretKey, 'utf8'),
  ]))
  const tranKey = sha1.digest('base64')

  return {
    login: process.env.AVAL_LOGIN || '',
    tranKey,
    nonce,
    seed,
  }
}

/**
 * Endpoint de webhook para recibir notificaciones de pago de Evertec/AvalPayCenter
 * 
 * Este endpoint recibe notificaciones cuando cambia el estado de un pago.
 * Debe ser configurado en el panel de Evertec como URL de notificación.
 * 
 * URL de producción: https://tu-dominio.com/api/payment-webhook
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('🔔 Webhook recibido de Evertec:', JSON.stringify(body, null, 2))

    // Estructura típica de notificación de AvalPayCenter/Evertec
    const {
      requestId,
      status,
      statusDate,
      reference,
      payment,
      // Otros campos que pueda enviar Evertec
    } = body

    if (!requestId) {
      console.error('❌ Webhook sin requestId')
      return NextResponse.json(
        { error: 'requestId es requerido' },
        { status: 400 }
      )
    }

    // Buscar el pedido pendiente en localStorage no es posible desde el servidor
    // Necesitamos buscar en la base de datos usando el requestId o reference
    // Por ahora, intentamos buscar por reference (que es el orderId)
    
    let orderId = reference
    if (orderId && orderId.startsWith('TEMP_')) {
      // Si es un ID temporal, necesitamos buscar el pedido real
      // Esto debería estar guardado en una tabla de transacciones
      console.log('⚠️ ID temporal detectado, buscando pedido real...')
    }

    // Mapear el estado de Evertec al estado de nuestro sistema
    let orderStatus = 'pendiente'
    if (status) {
      // Estados típicos de AvalPayCenter/Evertec:
      // APPROVED, REJECTED, PENDING, FAILED, etc.
      const statusUpper = status.toUpperCase()
      
      if (statusUpper === 'APPROVED' || statusUpper === 'APPROVED_PARTIAL') {
        orderStatus = 'pagado'
      } else if (statusUpper === 'REJECTED' || statusUpper === 'FAILED' || statusUpper === 'CANCELLED') {
        orderStatus = 'cancelado'
      } else if (statusUpper === 'PENDING' || statusUpper === 'PENDING_VALIDATION') {
        orderStatus = 'pendiente'
      }
    }

    // Si tenemos el orderId, actualizar el pedido en la base de datos
    if (orderId) {
      try {
        // Limpiar el orderId si es temporal (TEMP_xxx)
        const cleanOrderId = orderId.replace('TEMP_', '').split('_')[0]
        
        // Intentar buscar el pedido por ID (puede ser numérico o string)
        let pedido = null
        let pedidoError = null
        
        // Intentar como número primero
        const numericId = parseInt(cleanOrderId, 10)
        if (!isNaN(numericId)) {
          const result = await supabase
            .from('pedidos')
            .select('id, estado')
            .eq('id', numericId)
            .single()
          pedido = result.data
          pedidoError = result.error
        }
        
        // Si no se encontró, intentar buscar por alguna referencia guardada
        // (esto requeriría una tabla de mapeo requestId -> pedido_id)
        
        if (!pedidoError && pedido) {
          // Actualizar el estado del pedido
          const { error: updateError } = await supabase
            .from('pedidos')
            .update({
              estado: orderStatus,
              updated_at: new Date().toISOString(),
            })
            .eq('id', pedido.id)

          if (updateError) {
            console.error('❌ Error actualizando pedido:', updateError)
          } else {
            console.log(`✅ Pedido ${pedido.id} actualizado a estado: ${orderStatus}`)
            
            // Si el pago fue aprobado, actualizar el stock (si existe la función)
            if (orderStatus === 'pagado') {
              try {
                // Aquí podrías llamar a una función que actualice el stock
                // Por ahora solo lo registramos
                console.log(`📦 Stock debería actualizarse para pedido ${pedido.id}`)
              } catch (stockError) {
                console.error('⚠️ Error actualizando stock:', stockError)
              }
            }
          }
        } else {
          console.log('⚠️ Pedido no encontrado con referencia:', orderId, pedidoError)
        }
      } catch (dbError) {
        console.error('❌ Error en base de datos:', dbError)
      }
    }

    // Guardar la notificación en una tabla de transacciones (opcional pero recomendado)
    try {
      const { error: transError } = await supabase
        .from('transacciones_pago')
        .insert({
          request_id: requestId,
          referencia: reference,
          estado: status,
          estado_fecha: statusDate || new Date().toISOString(),
          datos_completos: body,
          created_at: new Date().toISOString(),
        })

      if (transError) {
        console.error('⚠️ Error guardando transacción (tabla puede no existir):', transError)
      }
    } catch (transError) {
      console.log('⚠️ Tabla transacciones_pago no existe, continuando...')
    }

    // Responder a Evertec que recibimos la notificación
    return NextResponse.json(
      {
        status: 'received',
        requestId,
        message: 'Notificación recibida correctamente',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('❌ Error procesando webhook:', error)
    return NextResponse.json(
      {
        error: 'Error procesando la notificación',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

// También aceptar GET para verificación (algunas pasarelas verifican el endpoint)
export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      message: 'Webhook endpoint activo',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  )
}


import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabase } from '@/lib/supabase'
import { AVAL_LOGIN, AVAL_SECRET_KEY } from '@/lib/avalpay'

// Función para validar la autenticación del webhook
function buildAuth() {
  const seed = new Date().toISOString()
  const nonceBuffer = crypto.randomBytes(16)
  const nonce = nonceBuffer.toString('base64')

  // tranKey = base64( sha1( nonce + seed + secretKey ) )
  const sha1 = crypto.createHash('sha1')
  sha1.update(Buffer.concat([
    nonceBuffer,
    Buffer.from(seed, 'utf8'),
    Buffer.from(AVAL_SECRET_KEY, 'utf8'),
  ]))
  const tranKey = sha1.digest('base64')

  return {
    login: AVAL_LOGIN,
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

    // Mapear el estado de Evertec al estado de nuestro sistema
    let orderStatus = 'pendiente'
    if (status) {
      // Estados típicos de AvalPayCenter/Evertec:
      // APPROVED, REJECTED, PENDING, FAILED, etc.
      // Validar que status sea un string antes de llamar toUpperCase()
      const statusUpper = typeof status === 'string' 
        ? status.toUpperCase() 
        : String(status).toUpperCase()
      
      if (statusUpper === 'APPROVED' || statusUpper === 'APPROVED_PARTIAL') {
        orderStatus = 'aprobado'
      } else if (statusUpper === 'REJECTED' || statusUpper === 'FAILED' || statusUpper === 'CANCELLED') {
        orderStatus = 'cancelado'
      } else if (statusUpper === 'PENDING' || statusUpper === 'PENDING_VALIDATION') {
        orderStatus = 'pendiente'
      }
    }

    // Buscar el pedido usando el request_id en la tabla pagos_pendientes
    if (requestId) {
      try {
        // Buscar el registro en pagos_pendientes usando el request_id
        const { data: pagoPendiente, error: pagoError } = await supabase
          .from('pagos_pendientes')
          .select('id, pedido_id, estado')
          .eq('request_id', requestId)
          .single()

        if (pagoError) {
          console.error('❌ Error buscando pago pendiente:', pagoError)
          
          // Fallback: Intentar buscar por referencia si existe
          if (reference) {
            console.log('🔄 Intentando buscar por referencia como fallback:', reference)
            const cleanOrderId = reference.replace('TEMP_', '').split('_')[0]
            const numericId = parseInt(cleanOrderId, 10)
            
            if (!isNaN(numericId)) {
              const { data: pedido, error: pedidoError } = await supabase
                .from('pedidos')
                .select('id, estado')
                .eq('id', numericId)
                .single()

              if (!pedidoError && pedido) {
                console.log('✅ Pedido encontrado por referencia:', pedido.id)
                
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
                  
                  // Si el pago fue aprobado, actualizar el stock
                  if (orderStatus === 'aprobado') {
                    console.log(`📦 Stock debería actualizarse para pedido ${pedido.id}`)
                  }
                }
              }
            }
          }
        } else if (pagoPendiente) {
          // Encontramos el registro en pagos_pendientes
          console.log(`✅ Pago pendiente encontrado: pedido_id=${pagoPendiente.pedido_id}`)
          
          // Actualizar el estado del pedido
          const { error: updateError } = await supabase
            .from('pedidos')
            .update({
              estado: orderStatus,
              updated_at: new Date().toISOString(),
            })
            .eq('id', pagoPendiente.pedido_id)

          if (updateError) {
            console.error('❌ Error actualizando pedido:', updateError)
          } else {
            console.log(`✅ Pedido ${pagoPendiente.pedido_id} actualizado a estado: ${orderStatus}`)
            
            // Actualizar el estado en pagos_pendientes
            const statusUpper = typeof status === 'string' 
              ? status.toUpperCase() 
              : String(status).toUpperCase()
            
            await supabase
              .from('pagos_pendientes')
              .update({
                estado: statusUpper,
                ultima_verificacion: new Date().toISOString(),
              })
              .eq('id', pagoPendiente.id)
            
            // Si el pago fue aprobado, actualizar el stock
            if (orderStatus === 'aprobado') {
              console.log(`📦 Stock debería actualizarse para pedido ${pagoPendiente.pedido_id}`)
            }
          }
        } else {
          console.log('⚠️ No se encontró pago pendiente con request_id:', requestId)
        }
      } catch (dbError) {
        console.error('❌ Error en base de datos:', dbError)
      }
    } else {
      console.error('❌ Webhook sin requestId - no se puede procesar')
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


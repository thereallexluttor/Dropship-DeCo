import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabase } from '@/lib/supabase'

// Configuración desde variables de entorno
const AVAL_BASE_URL = process.env.AVAL_BASE_URL || 'https://checkout.test.avalpaycenter.com'
const AVAL_LOGIN = process.env.AVAL_LOGIN || '4e0401c7a15ab65aee70b3eadfac901d'
const AVAL_SECRET_KEY = process.env.AVAL_SECRET_KEY || 'AxVOBpgS6E4jWv4t'

// Clave secreta para proteger el endpoint del cronjob
const CRON_SECRET = process.env.CRON_SECRET || 'change-this-secret-key'

// Genera la estructura de autenticación requerida por la pasarela
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
 * Endpoint para verificar pagos pendientes (Cronjob/Sonda)
 * 
 * Este endpoint se ejecuta periódicamente para verificar el estado de pagos pendientes
 * que no han recibido notificación del webhook.
 * 
 * Configuración en Vercel:
 * - Frecuencia configurada: Cada 20 minutos
 * - URL: https://tu-dominio.com/api/verify-pending-payments?secret=CRON_SECRET
 */
export async function GET(request: NextRequest) {
  try {
    // Verificar secreto para proteger el endpoint
    // En Vercel Cron Jobs, el secreto viene en el header 'authorization'
    // También se puede pasar como query parameter para pruebas manuales
    const authHeader = request.headers.get('authorization')
    const secretParam = request.nextUrl.searchParams.get('secret')
    const secret = authHeader?.replace('Bearer ', '') || secretParam

    // Si no hay secreto configurado, permitir acceso (solo para desarrollo)
    if (CRON_SECRET && CRON_SECRET !== 'change-this-secret-key' && secret !== CRON_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🔍 Iniciando verificación de pagos pendientes...')
    const startTime = Date.now()

    // Obtener pagos pendientes que necesitan verificación
    // Verificar pagos con estado PENDING o PENDING_VALIDATION
    // y que no se hayan verificado en los últimos 5 minutos
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()

    const { data: pagosPendientes, error: fetchError } = await supabase
      .from('pagos_pendientes')
      .select('id, request_id, pedido_id, referencia, monto, estado, ultima_verificacion')
      .in('estado', ['PENDING', 'PENDING_VALIDATION'])
      .or(`ultima_verificacion.is.null,ultima_verificacion.lt.${fiveMinutesAgo}`)
      .limit(50) // Limitar a 50 pagos por ejecución para no sobrecargar

    if (fetchError) {
      console.error('❌ Error obteniendo pagos pendientes:', fetchError)
      // Si la tabla no existe, retornar éxito pero sin procesar
      if (fetchError.code === '42P01') {
        return NextResponse.json(
          {
            message: 'Tabla pagos_pendientes no existe. Ejecuta database_pagos_pendientes.sql',
            processed: 0,
            updated: 0,
          },
          { status: 200 }
        )
      }
      throw fetchError
    }

    if (!pagosPendientes || pagosPendientes.length === 0) {
      console.log('✅ No hay pagos pendientes para verificar')
      return NextResponse.json(
        {
          message: 'No hay pagos pendientes para verificar',
          processed: 0,
          updated: 0,
        },
        { status: 200 }
      )
    }

    console.log(`📋 Encontrados ${pagosPendientes.length} pagos pendientes para verificar`)

    let processed = 0
    let updated = 0
    let errors = 0

    // Procesar cada pago pendiente
    for (const pago of pagosPendientes) {
      try {
        processed++

        // Consultar el estado del pago en Evertec
        const auth = buildAuth()
        const response = await fetch(`${AVAL_BASE_URL}/api/session/${pago.request_id}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ auth }),
        })

        if (!response.ok) {
          console.error(`❌ Error consultando pago ${pago.request_id}:`, response.status)
          errors++
          continue
        }

        const sessionData = await response.json()

        // Obtener el estado del pago
        const newStatus = sessionData.status?.status || sessionData.status || 'UNKNOWN'
        const statusUpper = typeof newStatus === 'string' 
          ? newStatus.toUpperCase() 
          : String(newStatus).toUpperCase()

        // Mapear el estado de Evertec al estado de nuestro sistema
        let orderStatus = 'pendiente'
        if (statusUpper === 'APPROVED' || statusUpper === 'APPROVED_PARTIAL') {
          orderStatus = 'aprobado'
        } else if (statusUpper === 'REJECTED' || statusUpper === 'FAILED' || statusUpper === 'CANCELLED') {
          orderStatus = 'cancelado'
        } else if (statusUpper === 'PENDING' || statusUpper === 'PENDING_VALIDATION') {
          orderStatus = 'pendiente'
        }

        // Si el estado cambió, actualizar el pedido
        if (statusUpper !== pago.estado) {
          console.log(`🔄 Actualizando pago ${pago.request_id}: ${pago.estado} -> ${statusUpper}`)

          // Actualizar el estado del pedido
          const { error: updatePedidoError } = await supabase
            .from('pedidos')
            .update({
              estado: orderStatus,
              updated_at: new Date().toISOString(),
            })
            .eq('id', pago.pedido_id)

          if (updatePedidoError) {
            console.error(`❌ Error actualizando pedido ${pago.pedido_id}:`, updatePedidoError)
            errors++
          } else {
            console.log(`✅ Pedido ${pago.pedido_id} actualizado a estado: ${orderStatus}`)
            updated++

            // Si el pago fue aprobado, actualizar el stock (si existe la función)
            if (orderStatus === 'aprobado') {
              console.log(`📦 Stock debería actualizarse para pedido ${pago.pedido_id}`)
            }
          }

          // Actualizar el registro en pagos_pendientes
          await supabase
            .from('pagos_pendientes')
            .update({
              estado: statusUpper,
              ultima_verificacion: new Date().toISOString(),
            })
            .eq('id', pago.id)
        } else {
          // Solo actualizar la fecha de última verificación
          await supabase
            .from('pagos_pendientes')
            .update({
              ultima_verificacion: new Date().toISOString(),
            })
            .eq('id', pago.id)
        }
      } catch (error) {
        console.error(`❌ Error procesando pago ${pago.request_id}:`, error)
        errors++
      }
    }

    const duration = Date.now() - startTime

    const result = {
      message: 'Verificación completada',
      processed,
      updated,
      errors,
      duration_ms: duration,
      timestamp: new Date().toISOString(),
    }

    console.log('✅ Verificación completada:', result)

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('❌ Error en verificación de pagos pendientes:', error)
    return NextResponse.json(
      {
        error: 'Error verificando pagos pendientes',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

// También permitir POST para llamadas manuales
export async function POST(request: NextRequest) {
  return GET(request)
}


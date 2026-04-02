import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import {
  AVAL_BASE_URL,
  AVAL_LOGIN,
  AVAL_SECRET_KEY,
  AVAL_RETURN_URL,
  AVAL_NOTIFICATION_URL,
} from '@/lib/avalpay'
import { SHOPPING_PAUSED, SHOPPING_PAUSE_MESSAGE } from '@/lib/shoppingPause'

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

// Obtener la IP real del cliente desde headers (requerido por la pasarela en producción)
function getClientIp(request: NextRequest, bodyIp?: string): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp
  const cfIp = request.headers.get('cf-connecting-ip')
  if (cfIp) return cfIp
  return bodyIp || '127.0.0.1'
}

export async function POST(request: NextRequest) {
  try {
    if (SHOPPING_PAUSED) {
      return NextResponse.json(
        { error: SHOPPING_PAUSE_MESSAGE },
        { status: 503 }
      )
    }

    const body = await request.json()

    const {
      orderId,
      totalAmount,
      buyerEmail,
      buyerName,
      ipAddress: bodyIp,
      userAgent,
    } = body || {}

    if (!orderId || totalAmount == null || totalAmount === '' || !buyerEmail) {
      return NextResponse.json(
        { error: 'orderId, totalAmount y buyerEmail son requeridos' },
        { status: 400 }
      )
    }

    // Garantizar que el monto sea un entero en pesos (la pasarela espera COP sin decimales)
    const amountAsInteger = Math.round(Number(totalAmount))
    if (amountAsInteger <= 0) {
      return NextResponse.json(
        { error: 'El monto total debe ser mayor a 0' },
        { status: 400 }
      )
    }
    // La pasarela Aval tiene un monto mínimo de 10.000 COP
    const AVAL_MIN_AMOUNT = 10000
    if (amountAsInteger < AVAL_MIN_AMOUNT) {
      return NextResponse.json(
        { error: `El pedido mínimo es de $${AVAL_MIN_AMOUNT.toLocaleString('es-CO')} COP. Agrega más productos para continuar.` },
        { status: 400 }
      )
    }

    const auth = buildAuth()

    const expiration = new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutos

    // URLs fijas para el entorno productivo en unisantander.co
    const returnUrl = AVAL_RETURN_URL
    const notificationUrl = AVAL_NOTIFICATION_URL

    const clientIp = getClientIp(request, bodyIp)

    const sessionPayload = {
      locale: 'es_CO',
      auth,
      payment: {
        reference: String(orderId),
        description: `Pedido #${orderId}`,
        amount: {
          currency: 'COP',
          total: amountAsInteger,
        },
      },
      expiration,
      returnUrl,
      ...(notificationUrl && { notificationUrl }),
      ipAddress: clientIp,
      userAgent: userAgent || 'Unisantander WC',
      buyer: {
        email: buyerEmail,
        name: buyerName || '',
      },
    }

    console.log('📤 Payload enviado a Aval Pay Center:', JSON.stringify(sessionPayload, null, 2))
    console.log('📤 URL:', `${AVAL_BASE_URL}/api/session`)
    console.log('📤 Monto enviado (COP):', amountAsInteger)

    const response = await fetch(`${AVAL_BASE_URL}/api/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionPayload),
    })

    const data = await response.json()

    console.log('📥 Respuesta Aval Pay Center:', JSON.stringify(data, null, 2))
    console.log('📥 HTTP Status:', response.status)

    if (!response.ok || data?.status?.status === 'FAILED') {
      console.error('❌ Error creando sesión de pago Aval:', data)
      console.error('❌ Monto rechazado:', amountAsInteger, 'COP')
      const avalMessage = data?.status?.message ?? data?.message
      const errorMessage = typeof avalMessage === 'string' ? avalMessage : 'Error al crear la sesión de pago'
      return NextResponse.json(
        {
          error: errorMessage,
          details: data,
          sentAmount: amountAsInteger,
        },
        { status: response.ok ? 400 : response.status }
      )
    }

    // Devolvemos la respuesta tal cual, pero destacando processUrl y requestId
    return NextResponse.json(
      {
        ...data,
        processUrl: data.processUrl,
        requestId: data.requestId,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error inesperado en /api/payment-session:', error)
    return NextResponse.json(
      {
        error: 'Error inesperado al crear la sesión de pago',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}



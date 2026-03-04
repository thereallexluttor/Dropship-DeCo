import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import {
  AVAL_BASE_URL,
  AVAL_LOGIN,
  AVAL_SECRET_KEY,
  AVAL_RETURN_URL,
  AVAL_NOTIFICATION_URL,
} from '@/lib/avalpay'

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

    // La API de Aval/PlacetoPay espera el monto en centavos (unidad mínima de COP)
    // Fórmula: pesos × 100 = centavos (ej: 10.000 COP → 1.000.000)
    const amountInPesos = Math.round(Number(totalAmount))
    if (amountInPesos <= 0) {
      return NextResponse.json(
        { error: 'El monto total debe ser mayor a 0' },
        { status: 400 }
      )
    }
    const amountInCentavos = amountInPesos * 100

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
          total: amountInCentavos,
        },
      },
      expiration,
      returnUrl,
      // Incluir URL de notificación si la API de Evertec la soporta
      ...(notificationUrl && { notificationUrl }),
      ipAddress: clientIp,
      userAgent: userAgent || 'Unisantander WC',
      buyer: {
        email: buyerEmail,
        name: buyerName || '',
      },
    }

    const response = await fetch(`${AVAL_BASE_URL}/api/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionPayload),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Error creando sesión de pago Aval:', data)
      const avalMessage = data?.status?.message ?? data?.message
      const errorMessage = typeof avalMessage === 'string' ? avalMessage : 'Error al crear la sesión de pago'
      return NextResponse.json(
        {
          error: errorMessage,
          details: data,
        },
        { status: response.status }
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



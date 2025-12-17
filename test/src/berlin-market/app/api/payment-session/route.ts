import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Credenciales de prueba proporcionadas
const AVAL_BASE_URL = 'https://checkout.test.avalpaycenter.com'
const AVAL_LOGIN = '4e0401c7a15ab65aee70b3eadfac901d'
const AVAL_SECRET_KEY = 'AxVOBpgS6E4jWv4t'

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      orderId,
      totalAmount,
      buyerEmail,
      buyerName,
      ipAddress,
      userAgent,
    } = body || {}

    if (!orderId || !totalAmount || !buyerEmail) {
      return NextResponse.json(
        { error: 'orderId, totalAmount y buyerEmail son requeridos' },
        { status: 400 }
      )
    }

    const auth = buildAuth()

    const expiration = new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutos

    const origin = request.nextUrl.origin
    // El returnUrl incluirá el requestId después de crear la sesión
    const returnUrl = `${origin}/carrito?payment_return=true`

    const sessionPayload = {
      locale: 'es_CO',
      auth,
      payment: {
        reference: String(orderId),
        description: `Pedido #${orderId}`,
        amount: {
          currency: 'COP',
          total: totalAmount,
        },
      },
      expiration,
      returnUrl,
      ipAddress: ipAddress || '127.0.0.1',
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
      return NextResponse.json(
        {
          error: 'Error al crear la sesión de pago',
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



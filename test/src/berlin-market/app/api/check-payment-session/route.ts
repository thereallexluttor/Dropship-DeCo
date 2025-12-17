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
    const { requestId } = body

    if (!requestId) {
      return NextResponse.json(
        { error: 'requestId es requerido' },
        { status: 400 }
      )
    }

    const auth = buildAuth()

    const response = await fetch(`${AVAL_BASE_URL}/api/session/${requestId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ auth }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error('Error consultando sesión de pago Aval:', data)
      return NextResponse.json(
        {
          error: 'Error al consultar la sesión de pago',
          details: data,
        },
        { status: response.status }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Error inesperado en /api/check-payment-session:', error)
    return NextResponse.json(
      {
        error: 'Error inesperado al consultar la sesión de pago',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}



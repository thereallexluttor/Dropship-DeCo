import { NextRequest, NextResponse } from 'next/server'
import supabase from '@/lib/supabase'

const CRON_SECRET = process.env.CRON_SECRET || 'change-this-secret-key'

/**
 * Cron: expira descuentos cuyo último día de vigencia ya pasó (comparación por fecha calendario).
 * Tras la fecha elegida (inclusive ese día), al día siguiente este job deja descuento en false
 * y descuento_valor / descuento_valido_hasta en null.
 *
 * Protección: mismo patrón que verify-pending-payments (Authorization Bearer o ?secret=).
 * Zona horaria del "hoy" del cron: DISCOUNT_CRON_TIMEZONE (por defecto America/Bogota).
 *
 * Programar en Vercel (ver vercel.json) o llamar manualmente:
 * GET /api/expire-descuentos?secret=CRON_SECRET
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const secretParam = request.nextUrl.searchParams.get('secret')
    const secret = authHeader?.replace('Bearer ', '') || secretParam
    const isVercelCron = request.headers.get('x-vercel-cron') === '1'

    if (
      !isVercelCron &&
      CRON_SECRET &&
      CRON_SECRET !== 'change-this-secret-key' &&
      secret !== CRON_SECRET
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const tz = process.env.DISCOUNT_CRON_TIMEZONE || 'America/Bogota'
    const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: tz })

    const { data, error } = await supabase
      .from('productos')
      .update({
        descuento: false,
        descuento_valor: null,
        descuento_valido_hasta: null,
      })
      .eq('descuento', true)
      .not('descuento_valido_hasta', 'is', null)
      .lt('descuento_valido_hasta', todayStr)
      .select('id')

    if (error) {
      if (error.code === '42703' || error.message?.includes('descuento_valido_hasta')) {
        return NextResponse.json(
          {
            error:
              'Columna descuento_valido_hasta no existe. Ejecuta sql/add_descuento_valido_hasta.sql en Supabase.',
            details: error.message,
          },
          { status: 500 }
        )
      }
      console.error('expire-descuentos:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const count = data?.length ?? 0
    return NextResponse.json({
      ok: true,
      timezone: tz,
      today: todayStr,
      expiredCount: count,
    })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

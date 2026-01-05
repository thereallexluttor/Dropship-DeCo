/**
 * Script de prueba para el endpoint del cronjob
 * 
 * Uso:
 *   CRON_SECRET=tu-secreto node scripts/test-cronjob.js
 * 
 * O configura CRON_SECRET en .env.local
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'
const CRON_SECRET = process.env.CRON_SECRET || '7[LT[n8PmXJqy$03DgM^pYtLXB<m7r%G'

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function testCronjob() {
  log('\n' + '='.repeat(60), 'cyan')
  log('🧪 TEST: Cronjob - Verificación de Pagos Pendientes', 'cyan')
  log('='.repeat(60), 'cyan')
  log(`Base URL: ${BASE_URL}`, 'blue')
  log(`Secret: ${CRON_SECRET.substring(0, 10)}...`, 'blue')
  log('')

  try {
    const url = `${BASE_URL}/api/verify-pending-payments?secret=${CRON_SECRET}`
    log(`📡 Llamando a: ${url.replace(CRON_SECRET, '***')}`, 'blue')

    const startTime = Date.now()
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const duration = Date.now() - startTime
    const data = await response.json()

    if (response.ok) {
      log('✅ Cronjob ejecutado exitosamente', 'green')
      log(`   Procesados: ${data.processed || 0}`, 'blue')
      log(`   Actualizados: ${data.updated || 0}`, 'blue')
      log(`   Errores: ${data.errors || 0}`, data.errors > 0 ? 'yellow' : 'blue')
      log(`   Duración: ${data.duration_ms || duration}ms`, 'blue')
      log(`   Mensaje: ${data.message || 'OK'}`, 'blue')
      return true
    } else {
      log('❌ Cronjob falló', 'red')
      log(`   Status: ${response.status}`, 'red')
      log(`   Error: ${data.error || JSON.stringify(data)}`, 'red')
      return false
    }
  } catch (error) {
    log('❌ Error ejecutando cronjob', 'red')
    log(`   Error: ${error.message}`, 'red')
    return false
  }
}

// Ejecutar test
testCronjob()
  .then(success => {
    if (success) {
      log('\n🎉 Test completado exitosamente', 'green')
      process.exit(0)
    } else {
      log('\n⚠️  Test falló', 'yellow')
      process.exit(1)
    }
  })
  .catch(error => {
    log(`\n❌ Error fatal: ${error.message}`, 'red')
    process.exit(1)
  })


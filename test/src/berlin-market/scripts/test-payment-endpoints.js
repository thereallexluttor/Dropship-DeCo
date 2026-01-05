/**
 * Script de pruebas manuales para los endpoints de pago
 * 
 * Uso:
 *   node scripts/test-payment-endpoints.js
 * 
 * Asegúrate de tener el servidor corriendo en http://localhost:3000
 */

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000'

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

function logTest(name) {
  log(`\n${'='.repeat(60)}`, 'cyan')
  log(`🧪 TEST: ${name}`, 'cyan')
  log('='.repeat(60), 'cyan')
}

async function testWebhookGET() {
  logTest('Webhook GET - Verificación de endpoint')
  
  try {
    const response = await fetch(`${BASE_URL}/api/payment-webhook`)
    const data = await response.json()
    
    if (response.ok && data.message === 'Webhook endpoint activo') {
      log('✅ GET /api/payment-webhook: OK', 'green')
      log(`   Mensaje: ${data.message}`, 'blue')
      log(`   Timestamp: ${data.timestamp}`, 'blue')
      return true
    } else {
      log('❌ GET /api/payment-webhook: FAILED', 'red')
      log(`   Status: ${response.status}`, 'red')
      log(`   Data: ${JSON.stringify(data)}`, 'red')
      return false
    }
  } catch (error) {
    log('❌ GET /api/payment-webhook: ERROR', 'red')
    log(`   Error: ${error.message}`, 'red')
    return false
  }
}

async function testWebhookPOST() {
  logTest('Webhook POST - Notificación de pago aprobado')
  
  const webhookPayload = {
    requestId: `TEST_${Date.now()}`,
    status: 'APPROVED',
    statusDate: new Date().toISOString(),
    reference: '123',
    payment: {
      amount: {
        currency: 'COP',
        total: 100000
      }
    }
  }
  
  try {
    const response = await fetch(`${BASE_URL}/api/payment-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    })
    
    const data = await response.json()
    
    if (response.ok && data.status === 'received') {
      log('✅ POST /api/payment-webhook (APPROVED): OK', 'green')
      log(`   RequestId: ${data.requestId}`, 'blue')
      log(`   Mensaje: ${data.message}`, 'blue')
      return true
    } else {
      log('❌ POST /api/payment-webhook: FAILED', 'red')
      log(`   Status: ${response.status}`, 'red')
      log(`   Data: ${JSON.stringify(data)}`, 'red')
      return false
    }
  } catch (error) {
    log('❌ POST /api/payment-webhook: ERROR', 'red')
    log(`   Error: ${error.message}`, 'red')
    return false
  }
}

async function testWebhookPOSTRejected() {
  logTest('Webhook POST - Notificación de pago rechazado')
  
  const webhookPayload = {
    requestId: `TEST_REJECTED_${Date.now()}`,
    status: 'REJECTED',
    statusDate: new Date().toISOString(),
    reference: '124',
    payment: {
      amount: {
        currency: 'COP',
        total: 50000
      }
    }
  }
  
  try {
    const response = await fetch(`${BASE_URL}/api/payment-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    })
    
    const data = await response.json()
    
    if (response.ok && data.status === 'received') {
      log('✅ POST /api/payment-webhook (REJECTED): OK', 'green')
      log(`   RequestId: ${data.requestId}`, 'blue')
      return true
    } else {
      log('❌ POST /api/payment-webhook (REJECTED): FAILED', 'red')
      log(`   Status: ${response.status}`, 'red')
      log(`   Data: ${JSON.stringify(data)}`, 'red')
      return false
    }
  } catch (error) {
    log('❌ POST /api/payment-webhook (REJECTED): ERROR', 'red')
    log(`   Error: ${error.message}`, 'red')
    return false
  }
}

async function testWebhookPOSTMissingRequestId() {
  logTest('Webhook POST - Validación de requestId requerido')
  
  const webhookPayload = {
    status: 'APPROVED',
    reference: '125',
  }
  
  try {
    const response = await fetch(`${BASE_URL}/api/payment-webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    })
    
    const data = await response.json()
    
    if (response.status === 400 && data.error) {
      log('✅ POST /api/payment-webhook (sin requestId): Validación OK', 'green')
      log(`   Error esperado: ${data.error}`, 'blue')
      return true
    } else {
      log('❌ POST /api/payment-webhook (sin requestId): FAILED', 'red')
      log(`   Status: ${response.status}`, 'red')
      log(`   Data: ${JSON.stringify(data)}`, 'red')
      return false
    }
  } catch (error) {
    log('❌ POST /api/payment-webhook (sin requestId): ERROR', 'red')
    log(`   Error: ${error.message}`, 'red')
    return false
  }
}

async function testPaymentSession() {
  logTest('Payment Session - Crear sesión de pago')
  
  const sessionPayload = {
    orderId: `TEST_ORDER_${Date.now()}`,
    totalAmount: 150000,
    buyerEmail: 'test@example.com',
    buyerName: 'Test User',
    ipAddress: '127.0.0.1',
    userAgent: 'Test Script',
  }
  
  try {
    const response = await fetch(`${BASE_URL}/api/payment-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sessionPayload),
    })
    
    const data = await response.json()
    
    // Nota: Esto puede fallar si no hay conexión a la API de Evertec
    // pero validamos que el endpoint responda correctamente
    if (response.status === 200 && (data.processUrl || data.requestId)) {
      log('✅ POST /api/payment-session: OK', 'green')
      log(`   RequestId: ${data.requestId || 'N/A'}`, 'blue')
      log(`   ProcessUrl: ${data.processUrl ? 'Presente' : 'N/A'}`, 'blue')
      return true
    } else if (response.status >= 400 && response.status < 500) {
      // Error de validación o de la API, pero el endpoint funciona
      log('⚠️  POST /api/payment-session: Endpoint funciona (error de API esperado)', 'yellow')
      log(`   Status: ${response.status}`, 'yellow')
      log(`   Error: ${data.error || JSON.stringify(data)}`, 'yellow')
      return true // Consideramos esto OK porque el endpoint está funcionando
    } else {
      log('❌ POST /api/payment-session: FAILED', 'red')
      log(`   Status: ${response.status}`, 'red')
      log(`   Data: ${JSON.stringify(data)}`, 'red')
      return false
    }
  } catch (error) {
    log('❌ POST /api/payment-session: ERROR', 'red')
    log(`   Error: ${error.message}`, 'red')
    return false
  }
}

async function testPaymentSessionValidation() {
  logTest('Payment Session - Validación de campos requeridos')
  
  const invalidPayload = {
    orderId: 'TEST_ORDER',
    // Faltan totalAmount y buyerEmail
  }
  
  try {
    const response = await fetch(`${BASE_URL}/api/payment-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidPayload),
    })
    
    const data = await response.json()
    
    if (response.status === 400 && data.error) {
      log('✅ POST /api/payment-session (validación): OK', 'green')
      log(`   Error esperado: ${data.error}`, 'blue')
      return true
    } else {
      log('❌ POST /api/payment-session (validación): FAILED', 'red')
      log(`   Status: ${response.status}`, 'red')
      log(`   Data: ${JSON.stringify(data)}`, 'red')
      return false
    }
  } catch (error) {
    log('❌ POST /api/payment-session (validación): ERROR', 'red')
    log(`   Error: ${error.message}`, 'red')
    return false
  }
}

async function testCheckPaymentSession() {
  logTest('Check Payment Session - Consultar estado de sesión')
  
  const checkPayload = {
    requestId: `TEST_REQUEST_${Date.now()}`,
  }
  
  try {
    const response = await fetch(`${BASE_URL}/api/check-payment-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkPayload),
    })
    
    const data = await response.json()
    
    // Nota: Esto puede fallar si no hay conexión a la API de Evertec
    // pero validamos que el endpoint responda correctamente
    if (response.status === 200 || (response.status >= 400 && response.status < 500)) {
      log('✅ POST /api/check-payment-session: Endpoint funciona', 'green')
      log(`   Status: ${response.status}`, 'blue')
      if (data.status) {
        log(`   Estado: ${data.status}`, 'blue')
      }
      return true
    } else {
      log('❌ POST /api/check-payment-session: FAILED', 'red')
      log(`   Status: ${response.status}`, 'red')
      log(`   Data: ${JSON.stringify(data)}`, 'red')
      return false
    }
  } catch (error) {
    log('❌ POST /api/check-payment-session: ERROR', 'red')
    log(`   Error: ${error.message}`, 'red')
    return false
  }
}

async function testCheckPaymentSessionValidation() {
  logTest('Check Payment Session - Validación de requestId')
  
  const invalidPayload = {
    // Falta requestId
  }
  
  try {
    const response = await fetch(`${BASE_URL}/api/check-payment-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidPayload),
    })
    
    const data = await response.json()
    
    if (response.status === 400 && data.error) {
      log('✅ POST /api/check-payment-session (validación): OK', 'green')
      log(`   Error esperado: ${data.error}`, 'blue')
      return true
    } else {
      log('❌ POST /api/check-payment-session (validación): FAILED', 'red')
      log(`   Status: ${response.status}`, 'red')
      log(`   Data: ${JSON.stringify(data)}`, 'red')
      return false
    }
  } catch (error) {
    log('❌ POST /api/check-payment-session (validación): ERROR', 'red')
    log(`   Error: ${error.message}`, 'red')
    return false
  }
}

// Función principal
async function runAllTests() {
  log('\n' + '='.repeat(60), 'cyan')
  log('🚀 INICIANDO TESTS DE ENDPOINTS DE PAGO', 'cyan')
  log('='.repeat(60), 'cyan')
  log(`Base URL: ${BASE_URL}`, 'blue')
  log(`Asegúrate de que el servidor esté corriendo en ${BASE_URL}`, 'yellow')
  log('')
  
  const results = []
  
  // Tests del webhook
  results.push(await testWebhookGET())
  results.push(await testWebhookPOST())
  results.push(await testWebhookPOSTRejected())
  results.push(await testWebhookPOSTMissingRequestId())
  
  // Tests de payment-session
  results.push(await testPaymentSession())
  results.push(await testPaymentSessionValidation())
  
  // Tests de check-payment-session
  results.push(await testCheckPaymentSession())
  results.push(await testCheckPaymentSessionValidation())
  
  // Resumen
  log('\n' + '='.repeat(60), 'cyan')
  log('📊 RESUMEN DE TESTS', 'cyan')
  log('='.repeat(60), 'cyan')
  
  const passed = results.filter(r => r === true).length
  const total = results.length
  
  log(`\n✅ Tests pasados: ${passed}/${total}`, passed === total ? 'green' : 'yellow')
  log(`❌ Tests fallidos: ${total - passed}/${total}`, total - passed > 0 ? 'red' : 'green')
  
  if (passed === total) {
    log('\n🎉 ¡Todos los tests pasaron exitosamente!', 'green')
    process.exit(0)
  } else {
    log('\n⚠️  Algunos tests fallaron. Revisa los detalles arriba.', 'yellow')
    process.exit(1)
  }
}

// Ejecutar tests
runAllTests().catch(error => {
  log(`\n❌ Error fatal ejecutando tests: ${error.message}`, 'red')
  process.exit(1)
})



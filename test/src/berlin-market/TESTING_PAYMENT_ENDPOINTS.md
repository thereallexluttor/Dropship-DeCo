# Guía de Testing - Endpoints de Pago

Esta guía describe cómo probar los endpoints de pago implementados para la integración con Evertec/AvalPayCenter.

## 📋 Endpoints a Probar

1. **POST /api/payment-webhook** - Recibe notificaciones de pago
2. **GET /api/payment-webhook** - Verifica que el endpoint esté activo
3. **POST /api/payment-session** - Crea una sesión de pago
4. **POST /api/check-payment-session** - Consulta el estado de una sesión

---

## 🚀 Método 1: Script de Pruebas Automatizado

### Requisitos
- Node.js instalado
- Servidor de desarrollo corriendo (`npm run dev`)

### Ejecutar Tests

```bash
# Desde la raíz del proyecto
node scripts/test-payment-endpoints.js
```

### Configurar URL Base (opcional)

```bash
# Si tu servidor corre en otro puerto
TEST_BASE_URL=http://localhost:3001 node scripts/test-payment-endpoints.js
```

### Resultados Esperados

El script ejecutará los siguientes tests:

1. ✅ **Webhook GET** - Verifica que el endpoint responda
2. ✅ **Webhook POST (APPROVED)** - Notificación de pago aprobado
3. ✅ **Webhook POST (REJECTED)** - Notificación de pago rechazado
4. ✅ **Webhook POST (sin requestId)** - Validación de campos requeridos
5. ✅ **Payment Session** - Crear sesión de pago
6. ✅ **Payment Session (validación)** - Validar campos requeridos
7. ✅ **Check Payment Session** - Consultar estado
8. ✅ **Check Payment Session (validación)** - Validar requestId

---

## 🧪 Método 2: Pruebas Manuales con cURL

### 1. Verificar Webhook (GET)

```bash
curl -X GET http://localhost:3000/api/payment-webhook
```

**Respuesta esperada:**
```json
{
  "message": "Webhook endpoint activo",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### 2. Probar Webhook con Pago Aprobado (POST)

```bash
curl -X POST http://localhost:3000/api/payment-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": "TEST_123456",
    "status": "APPROVED",
    "statusDate": "2024-01-01T12:00:00.000Z",
    "reference": "123",
    "payment": {
      "amount": {
        "currency": "COP",
        "total": 100000
      }
    }
  }'
```

**Respuesta esperada:**
```json
{
  "status": "received",
  "requestId": "TEST_123456",
  "message": "Notificación recibida correctamente"
}
```

### 3. Probar Webhook con Pago Rechazado (POST)

```bash
curl -X POST http://localhost:3000/api/payment-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": "TEST_123457",
    "status": "REJECTED",
    "statusDate": "2024-01-01T12:00:00.000Z",
    "reference": "124"
  }'
```

### 4. Probar Validación (sin requestId)

```bash
curl -X POST http://localhost:3000/api/payment-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "status": "APPROVED",
    "reference": "125"
  }'
```

**Respuesta esperada (error 400):**
```json
{
  "error": "requestId es requerido"
}
```

### 5. Crear Sesión de Pago

```bash
curl -X POST http://localhost:3000/api/payment-session \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "ORDER_123",
    "totalAmount": 150000,
    "buyerEmail": "test@example.com",
    "buyerName": "Test User",
    "ipAddress": "127.0.0.1",
    "userAgent": "curl/7.68.0"
  }'
```

**Nota:** Esto requiere conexión a la API de Evertec. Si no hay conexión, recibirás un error pero el endpoint está funcionando.

### 6. Consultar Estado de Sesión

```bash
curl -X POST http://localhost:3000/api/check-payment-session \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": "REQUEST_123"
  }'
```

---

## 🧪 Método 3: Pruebas con Postman o Insomnia

### Colección de Pruebas

Importa estas requests en Postman o Insomnia:

#### 1. Webhook GET
- **Method:** GET
- **URL:** `http://localhost:3000/api/payment-webhook`

#### 2. Webhook POST (Aprobado)
- **Method:** POST
- **URL:** `http://localhost:3000/api/payment-webhook`
- **Headers:** `Content-Type: application/json`
- **Body (JSON):**
```json
{
  "requestId": "TEST_APPROVED",
  "status": "APPROVED",
  "statusDate": "2024-01-01T12:00:00.000Z",
  "reference": "123",
  "payment": {
    "amount": {
      "currency": "COP",
      "total": 100000
    }
  }
}
```

#### 3. Webhook POST (Rechazado)
- **Method:** POST
- **URL:** `http://localhost:3000/api/payment-webhook`
- **Headers:** `Content-Type: application/json`
- **Body (JSON):**
```json
{
  "requestId": "TEST_REJECTED",
  "status": "REJECTED",
  "statusDate": "2024-01-01T12:00:00.000Z",
  "reference": "124"
}
```

#### 4. Payment Session
- **Method:** POST
- **URL:** `http://localhost:3000/api/payment-session`
- **Headers:** `Content-Type: application/json`
- **Body (JSON):**
```json
{
  "orderId": "ORDER_123",
  "totalAmount": 150000,
  "buyerEmail": "test@example.com",
  "buyerName": "Test User"
}
```

---

## 🔍 Verificación en Base de Datos

Después de ejecutar los tests del webhook, verifica en Supabase:

### 1. Verificar Transacciones Registradas

```sql
SELECT * FROM transacciones_pago 
ORDER BY created_at DESC 
LIMIT 10;
```

### 2. Verificar Actualización de Pedidos

```sql
SELECT id, estado, updated_at 
FROM pedidos 
WHERE id IN (123, 124, 125)
ORDER BY updated_at DESC;
```

---

## 🐛 Solución de Problemas

### El servidor no responde

1. Verifica que el servidor esté corriendo:
   ```bash
   npm run dev
   ```

2. Verifica que estés usando la URL correcta:
   - Por defecto: `http://localhost:3000`
   - Si cambiaste el puerto, ajusta la URL

### Error de conexión a Evertec

Los endpoints `payment-session` y `check-payment-session` requieren conexión a la API de Evertec. Si no hay conexión:

- ✅ El endpoint sigue funcionando (responde con error de API)
- ⚠️ Para pruebas completas, necesitas credenciales válidas
- 💡 Usa el entorno de pruebas: `AVAL_BASE_URL=https://checkout.test.avalpaycenter.com`

### El webhook no actualiza pedidos

1. Verifica que el `reference` en el webhook coincida con un `id` de pedido existente
2. Revisa los logs del servidor para ver errores
3. Verifica que la tabla `pedidos` exista y tenga la estructura correcta

### Error al guardar transacciones

Si ves el error "Tabla transacciones_pago no existe":

1. Ejecuta el script SQL:
   ```bash
   # En Supabase SQL Editor
   # Ejecuta: database_transacciones_pago.sql
   ```

2. O simplemente ignora el error (la tabla es opcional)

---

## ✅ Checklist de Validación

Antes de pasar a producción, verifica:

- [ ] Webhook GET responde correctamente
- [ ] Webhook POST recibe notificaciones de pago aprobado
- [ ] Webhook POST recibe notificaciones de pago rechazado
- [ ] Webhook valida campos requeridos (requestId)
- [ ] Payment Session crea sesiones correctamente
- [ ] Payment Session valida campos requeridos
- [ ] Check Payment Session consulta estados
- [ ] Las transacciones se guardan en la base de datos (opcional)
- [ ] Los pedidos se actualizan cuando llegan notificaciones
- [ ] Los logs muestran información útil para debugging

---

## 📊 Ejemplo de Salida del Script

```
============================================================
🚀 INICIANDO TESTS DE ENDPOINTS DE PAGO
============================================================
Base URL: http://localhost:3000
Asegúrate de que el servidor esté corriendo en http://localhost:3000

============================================================
🧪 TEST: Webhook GET - Verificación de endpoint
============================================================
✅ GET /api/payment-webhook: OK
   Mensaje: Webhook endpoint activo
   Timestamp: 2024-01-01T12:00:00.000Z

============================================================
🧪 TEST: Webhook POST - Notificación de pago aprobado
============================================================
✅ POST /api/payment-webhook (APPROVED): OK
   RequestId: TEST_1234567890
   Mensaje: Notificación recibida correctamente

...

============================================================
📊 RESUMEN DE TESTS
============================================================

✅ Tests pasados: 8/8
❌ Tests fallidos: 0/8

🎉 ¡Todos los tests pasaron exitosamente!
```

---

## 🎯 Próximos Pasos

Después de validar los tests:

1. **Configurar variables de entorno de producción**
2. **Desplegar en producción**
3. **Proporcionar URLs a Evertec para certificación**
4. **Monitorear logs durante las pruebas de certificación**

---

**Última actualización:** $(date)


# Configuración del Cronjob/Sonda Periódica

Este documento explica cómo configurar el cronjob que verifica periódicamente el estado de los pagos pendientes.

## ⚠️ IMPORTANTE: Plan Hobby de Vercel

**Si tienes el plan Hobby de Vercel**, solo puedes ejecutar cron jobs **una vez al día**. 

Para ejecutar la sonda cada 20 minutos, necesitas usar un **servicio externo de cron jobs**. Consulta `CRONJOB_EXTERNO_SETUP.md` para instrucciones detalladas.

## 📋 Descripción

El cronjob se ejecuta periódicamente (cada 20 minutos) para verificar el estado de pagos pendientes que no han recibido notificación del webhook de Evertec. Esto asegura que los pedidos se actualicen incluso si el webhook falla o hay problemas de conectividad.

## 🔧 Configuración

### 1. Crear la Tabla en Supabase

Ejecuta el script SQL en tu dashboard de Supabase:

```bash
# Archivo: database_pagos_pendientes.sql
# Ejecuta este script en Supabase SQL Editor
```

Este script crea la tabla `pagos_pendientes` que mapea `requestId` con `pedido_id`.

### 2. Configurar Variables de Entorno

Agrega la siguiente variable de entorno en tu plataforma de hosting (Vercel, etc.):

```env
CRON_SECRET=tu-secreto-super-seguro-aqui
```

**⚠️ IMPORTANTE:** Usa un secreto fuerte y único. Este secreto protege el endpoint del cronjob.

### 3. Configurar Cron Jobs

#### ⚠️ Plan Hobby: Usar Servicio Externo

**Si tienes plan Hobby de Vercel**, consulta `CRONJOB_EXTERNO_SETUP.md` para usar un servicio externo gratuito (cron-job.org, EasyCron, etc.) que ejecute cada 20 minutos.

#### Opción A: Vercel Cron Job (Solo para Plan Pro/Enterprise)

Si tienes plan Pro o Enterprise, puedes usar Vercel Cron Jobs directamente:

El archivo `vercel.json` está configurado para ejecutarse una vez al día (backup):

```json
{
  "crons": [
    {
      "path": "/api/verify-pending-payments",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**Para ejecutar cada 20 minutos en Vercel Pro:**
- Cambia el schedule a: `*/20 * * * *`
- O configura manualmente en Vercel Dashboard → Settings → Cron Jobs

### 4. Frecuencias Recomendadas

| Frecuencia | Cron Expression | Descripción |
|------------|----------------|-------------|
| Cada 5 minutos | `*/5 * * * *` | Alta frecuencia, útil para pruebas |
| Cada 10 minutos | `*/10 * * * *` | Alta frecuencia |
| Cada 15 minutos | `*/15 * * * *` | Frecuencia media |
| Cada 20 minutos | `*/20 * * * *` | **Configurado actualmente** |
| Cada 30 minutos | `*/30 * * * *` | Baja frecuencia |

**Configuración recomendada:** `*/20 * * * *` (cada 20 minutos) usando servicio externo.

**Vercel Hobby:** `0 2 * * *` (una vez al día a las 2 AM como backup).

## 🔄 Flujo de Funcionamiento

1. **Usuario inicia pago**: Se crea una sesión de pago con Evertec
2. **Registro en BD**: El `requestId` se guarda en `pagos_pendientes` con estado `PENDING`
3. **Webhook (Tiempo Real)**: Si Evertec envía notificación, el webhook actualiza el estado inmediatamente
4. **Cronjob (Backup)**: Cada 20 minutos (mediante servicio externo), el cronjob verifica pagos pendientes que no han recibido notificación
5. **Actualización**: Si encuentra cambios de estado, actualiza el pedido automáticamente

## 📊 Endpoint del Cronjob

**URL:** `GET /api/verify-pending-payments?secret=CRON_SECRET`

**Parámetros:**
- `secret` (requerido): Secreto configurado en variables de entorno

**Respuesta Exitosa:**
```json
{
  "message": "Verificación completada",
  "processed": 5,
  "updated": 2,
  "errors": 0,
  "duration_ms": 1234,
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Campos:**
- `processed`: Número de pagos verificados
- `updated`: Número de pedidos actualizados
- `errors`: Número de errores encontrados
- `duration_ms`: Tiempo de ejecución en milisegundos

## 🧪 Pruebas Manuales

Puedes probar el endpoint manualmente:

```bash
# Reemplaza TU_SECRETO con el secreto configurado
curl "https://tu-dominio.com/api/verify-pending-payments?secret=TU_SECRETO"
```

O desde el navegador (solo para pruebas):
```
https://tu-dominio.com/api/verify-pending-payments?secret=TU_SECRETO
```

## 📝 Integración con payment-session

Para que el cronjob funcione completamente, necesitas guardar el `requestId` en la tabla `pagos_pendientes` cuando se crea una sesión de pago.

**Ejemplo de integración:**

Cuando creas el pedido después de recibir el `requestId` de Evertec, guarda el mapeo:

```typescript
// Después de crear el pedido
const { data: pedido } = await supabase
  .from('pedidos')
  .insert([{ ... }])
  .select()
  .single()

// Guardar el mapeo requestId -> pedido_id
await supabase
  .from('pagos_pendientes')
  .insert({
    request_id: requestId,
    pedido_id: pedido.id,
    referencia: orderId,
    monto: totalAmount,
    estado: 'PENDING',
  })
```

## 🔍 Monitoreo

### Verificar que el Cronjob Funciona

1. **Logs de Vercel**: Revisa los logs en Vercel Dashboard → Deployments → Functions
2. **Logs del Endpoint**: Busca mensajes como:
   - `🔍 Iniciando verificación de pagos pendientes...`
   - `✅ Verificación completada`

### Consultar Pagos Pendientes

```sql
-- Ver todos los pagos pendientes
SELECT * FROM pagos_pendientes 
WHERE estado IN ('PENDING', 'PENDING_VALIDATION')
ORDER BY created_at DESC;

-- Ver pagos pendientes que necesitan verificación
SELECT * FROM pagos_pendientes 
WHERE estado IN ('PENDING', 'PENDING_VALIDATION')
  AND (ultima_verificacion IS NULL 
       OR ultima_verificacion < NOW() - INTERVAL '10 minutes')
ORDER BY ultima_verificacion ASC NULLS FIRST;
```

## ⚠️ Consideraciones

1. **Límite de Procesamiento**: El cronjob procesa máximo 50 pagos por ejecución para evitar sobrecarga
2. **Frecuencia Mínima**: No configures el cronjob más frecuente que cada 5 minutos
3. **Secreto Seguro**: Nunca compartas el `CRON_SECRET` públicamente
4. **Tabla Opcional**: Si no creas la tabla, el cronjob funcionará pero no procesará pagos

## 🆘 Solución de Problemas

### El cronjob no se ejecuta

1. Verifica que `vercel.json` esté en la raíz del proyecto
2. Verifica que el secreto en `vercel.json` coincida con `CRON_SECRET`
3. Revisa los logs de Vercel para errores

### Error "Tabla no existe"

Ejecuta el script `database_pagos_pendientes.sql` en Supabase.

### El cronjob no actualiza pedidos

1. Verifica que existan registros en `pagos_pendientes`
2. Verifica que los `requestId` sean válidos
3. Revisa los logs para errores de conexión con Evertec

## 📞 Respuesta para Evertec

**Pregunta:** "Por favor indicarnos cada cuanto se ejecuta la sonda en el ambiente."

**Respuesta:**

"La sonda se ejecuta cada 10 minutos (`*/10 * * * *`). El sistema verifica automáticamente el estado de los pagos pendientes que no han recibido notificación del webhook, asegurando que todos los pedidos se actualicen correctamente incluso en caso de problemas de conectividad o fallos en el webhook.

El endpoint de verificación está disponible en: `https://tu-dominio.com/api/verify-pending-payments`

Además del sistema de sonda periódica, el sistema también procesa notificaciones en tiempo real a través del webhook cuando Evertec envía actualizaciones de estado."

---

**Última actualización:** $(date)


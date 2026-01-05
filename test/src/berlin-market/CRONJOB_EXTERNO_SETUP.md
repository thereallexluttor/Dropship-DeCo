# Configuración de Cronjob Externo (Plan Hobby de Vercel)

Como el plan Hobby de Vercel solo permite cron jobs una vez al día, esta guía explica cómo usar un servicio externo gratuito para ejecutar la sonda cada 20 minutos.

## 📋 Limitación del Plan Hobby

- **Vercel Hobby**: Solo permite cron jobs que se ejecutan **una vez al día**
- **Solución**: Usar un servicio externo de cron jobs gratuito

## 🔧 Opción Recomendada: cron-job.org (Gratuito)

### Paso 1: Crear Cuenta

1. Ve a [https://cron-job.org](https://cron-job.org)
2. Crea una cuenta gratuita (no requiere tarjeta de crédito)
3. Plan gratuito permite hasta 3 cron jobs

### Paso 2: Configurar el Cronjob

1. Haz clic en "Create cronjob"
2. Configura los siguientes valores:

   **Title:** `Verificación Pagos Pendientes Evertec`
   
   **Address (URL):**
   ```
   https://tu-dominio.com/api/verify-pending-payments?secret=TU_CRON_SECRET
   ```
   *(Reemplaza `TU_CRON_SECRET` con el secreto configurado en Vercel)*

   **Schedule:**
   - Selecciona "Every X minutes"
   - Ingresa: `20` minutos

   **Request method:** `GET`

   **Save response:** Opcional (útil para debugging)

3. Haz clic en "Create cronjob"

### Paso 3: Verificar Funcionamiento

1. Espera a que se ejecute el primer cronjob (máximo 20 minutos)
2. Revisa los logs en cron-job.org
3. Verifica los logs en Vercel Dashboard

## 🔄 Alternativa: EasyCron (Gratuito)

### Configuración Similar:

1. Ve a [https://www.easycron.com](https://www.easycron.com)
2. Crea cuenta gratuita
3. Configura:
   - **URL:** `https://tu-dominio.com/api/verify-pending-payments?secret=TU_CRON_SECRET`
   - **Schedule:** `*/20 * * * *` (cada 20 minutos)
   - **Method:** GET

## 🔄 Alternativa: UptimeRobot (Gratuito)

UptimeRobot también ofrece cron jobs gratuitos:

1. Ve a [https://uptimerobot.com](https://uptimerobot.com)
2. Crea cuenta gratuita
3. Agrega un "HTTP(s) Monitor" con:
   - **URL:** `https://tu-dominio.com/api/verify-pending-payments?secret=TU_CRON_SECRET`
   - **Interval:** 20 minutos

## 📊 Configuración Actual

### Vercel Cron Job (Backup Diario)

El `vercel.json` está configurado para ejecutarse **una vez al día a las 2:00 AM** como respaldo:

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

### Cronjob Externo (Cada 20 Minutos)

Usa uno de los servicios mencionados arriba para ejecutar cada 20 minutos.

## 🔐 Seguridad

**⚠️ IMPORTANTE:** El secreto protege tu endpoint. Asegúrate de:

1. Usar un secreto fuerte y único
2. No compartir el secreto públicamente
3. Configurarlo como variable de entorno en Vercel:
   ```env
   CRON_SECRET=tu-secreto-super-seguro-aqui
   ```

## 🧪 Prueba Manual

Puedes probar el endpoint manualmente antes de configurar el cronjob externo:

```bash
curl "https://tu-dominio.com/api/verify-pending-payments?secret=TU_CRON_SECRET"
```

## 📝 Respuesta para Evertec

**Pregunta:** "Por favor indicarnos cada cuanto se ejecuta la sonda en el ambiente."

**Respuesta:**

"La sonda se ejecuta cada 20 minutos mediante un servicio externo de cron jobs. El sistema verifica automáticamente el estado de los pagos pendientes que no han recibido notificación del webhook, asegurando que todos los pedidos se actualicen correctamente incluso en caso de problemas de conectividad o fallos en el webhook.

El endpoint de verificación está disponible en: `https://tu-dominio.com/api/verify-pending-payments`

Además del sistema de sonda periódica, el sistema también procesa notificaciones en tiempo real a través del webhook cuando Evertec envía actualizaciones de estado."

---

**Última actualización:** $(date)


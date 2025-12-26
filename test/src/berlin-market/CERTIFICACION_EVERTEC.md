# Certificación de Producción - Evertec/AvalPayCenter

Este documento contiene la información necesaria para completar el proceso de certificación con Evertec y pasar de la plataforma de pruebas a producción.

## 📋 Información Requerida por Evertec

Para proceder con la certificación, Evertec necesita la siguiente información:

### 1. URL del Sitio a Certificar
**URL de Producción de tu Aplicación:**
```
https://tu-dominio.com
```
*(Reemplaza `tu-dominio.com` con tu dominio real de producción)*

### 2. URL de Notificación (Webhook)
**Endpoint para recibir notificaciones de pago:**
```
https://tu-dominio.com/api/payment-webhook
```
*(Reemplaza `tu-dominio.com` con tu dominio real de producción)*

Este endpoint recibe notificaciones automáticas de Evertec cuando cambia el estado de un pago (aprobado, rechazado, pendiente, etc.).

### 3. URL de Retorno
**URL a la que el usuario regresa después del pago:**
```
https://tu-dominio.com/carrito?payment_return=true
```

### 4. Cuenta para Flujos Transaccionales
Si es necesario, proporciona una cuenta de prueba o de producción para realizar los flujos transaccionales durante la certificación.

---

## 🔧 Configuración de Variables de Entorno

Para pasar a producción, necesitas configurar las siguientes variables de entorno en tu servidor:

### Variables Requeridas

Crea un archivo `.env.local` (para desarrollo local) o configura estas variables en tu plataforma de hosting (Vercel, Netlify, etc.):

```env
# URL base de la API de Evertec
# Producción: https://checkout.avalpaycenter.com
# Pruebas: https://checkout.test.avalpaycenter.com
AVAL_BASE_URL=https://checkout.avalpaycenter.com

# Credenciales de producción (proporcionadas por Evertec)
AVAL_LOGIN=tu_login_de_produccion
AVAL_SECRET_KEY=tu_secret_key_de_produccion

# URL de notificación (opcional, se genera automáticamente si no se especifica)
AVAL_NOTIFICATION_URL=https://tu-dominio.com/api/payment-webhook
```

### ⚠️ Importante

- **NUNCA** subas el archivo `.env.local` a tu repositorio Git
- Las credenciales de producción son **confidenciales** y deben mantenerse seguras
- Usa variables de entorno en tu plataforma de hosting para producción

---

## 📝 Endpoints Implementados

### 1. Crear Sesión de Pago
**Endpoint:** `POST /api/payment-session`

Crea una nueva sesión de pago con Evertec y devuelve la URL de procesamiento.

### 2. Verificar Estado de Pago
**Endpoint:** `POST /api/check-payment-session`

Consulta el estado actual de una sesión de pago usando el `requestId`.

### 3. Webhook de Notificaciones
**Endpoint:** `POST /api/payment-webhook`

Recibe notificaciones automáticas de Evertec cuando cambia el estado de un pago.

**Características:**
- Actualiza automáticamente el estado del pedido en la base de datos
- Registra todas las notificaciones recibidas
- Responde correctamente a Evertec para confirmar recepción

---

## 🔄 Flujo de Certificación

1. **Configuración Inicial**
   - Configura las variables de entorno con las credenciales de producción
   - Despliega la aplicación en producción
   - Verifica que todos los endpoints estén accesibles

2. **Proporcionar Información a Evertec**
   - Envía las URLs solicitadas (sitio, notificación, retorno)
   - Proporciona cuenta de prueba si es necesario
   - O agenda una sesión conjunta usando el link de Booking proporcionado

3. **Pruebas de Certificación**
   - Evertec realizará pruebas transaccionales
   - Verificarás que las notificaciones lleguen correctamente
   - Validarás que los estados de pago se actualicen en tu sistema

4. **Aprobación**
   - Una vez completadas las pruebas, Evertec aprobará la certificación
   - Tu plataforma estará lista para procesar pagos reales

---

## 🧪 Pruebas Locales

Para probar el webhook localmente, puedes usar herramientas como:

- **ngrok**: Para exponer tu servidor local
  ```bash
  ngrok http 3000
  ```
  Luego usa la URL de ngrok como `AVAL_NOTIFICATION_URL`

- **localhost.run**: Alternativa a ngrok
  ```bash
  ssh -R 80:localhost:3000 localhost.run
  ```

---

## 📊 Monitoreo

### Verificar que el Webhook Funciona

1. Revisa los logs del servidor para ver las notificaciones recibidas
2. Verifica en la base de datos que los pedidos se actualicen correctamente
3. Revisa la tabla `transacciones_pago` (si existe) para ver el historial

### Logs a Revisar

- `🔔 Webhook recibido de Evertec:` - Notificación recibida
- `✅ Pedido X actualizado a estado: Y` - Actualización exitosa
- `❌ Error...` - Errores que requieren atención

---

## 🆘 Solución de Problemas

### El webhook no recibe notificaciones

1. Verifica que la URL sea accesible públicamente (no localhost)
2. Asegúrate de que el endpoint responda correctamente (debe devolver 200)
3. Verifica que Evertec tenga configurada la URL correcta en su panel

### Los pedidos no se actualizan

1. Revisa los logs del servidor para ver errores
2. Verifica que la tabla `pedidos` exista y tenga la estructura correcta
3. Asegúrate de que el `reference` (orderId) coincida con el ID del pedido

### Errores de autenticación

1. Verifica que las credenciales de producción sean correctas
2. Asegúrate de que `AVAL_LOGIN` y `AVAL_SECRET_KEY` estén configurados
3. Confirma que estés usando la URL correcta (`AVAL_BASE_URL`)

---

## 📞 Contacto

**Evertec - Implementación**
- **Contacto:** Juan José Muñoz Muñoz
- **Cargo:** Analista de implementación
- **Teléfono:** +1(787)759 9999 ext. 253229
- **Email:** juan.munoz@evertecinc.com
- **Sitio Web:** https://evertecinc.com

---

## ✅ Checklist de Certificación

- [ ] Variables de entorno configuradas con credenciales de producción
- [ ] Aplicación desplegada en producción
- [ ] URL del sitio verificada y accesible
- [ ] Webhook endpoint (`/api/payment-webhook`) accesible públicamente
- [ ] URLs proporcionadas a Evertec:
  - [ ] URL del sitio
  - [ ] URL de notificación
  - [ ] URL de retorno
- [ ] Pruebas transaccionales completadas
- [ ] Notificaciones de webhook funcionando correctamente
- [ ] Estados de pedidos actualizándose en la base de datos
- [ ] Certificación aprobada por Evertec

---

**Última actualización:** $(date)


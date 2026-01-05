# Respuesta sobre Cronjob/Sonda - Evertec

## Pregunta de Evertec
"Por favor indicarnos cada cuanto se ejecuta la sonda en el ambiente."

## Respuesta

La sonda se ejecuta **cada 20 minutos** (`*/20 * * * *`).

### Sistema Implementado

El sistema funciona de la siguiente manera:

1. **Procesamiento en Tiempo Real**: Cuando Evertec envía una notificación de cambio de estado de pago al webhook (`/api/payment-webhook`), el sistema procesa inmediatamente la notificación y actualiza el estado del pedido en la base de datos.

2. **Sonda Periódica (Cronjob)**: Cada 20 minutos, el sistema ejecuta automáticamente una verificación de pagos pendientes que no han recibido notificación del webhook. Esto asegura que todos los pedidos se actualicen correctamente incluso en caso de problemas de conectividad.

3. **Verificación al Retorno**: Cuando el usuario regresa de la pasarela de pago a la URL de retorno (`/carrito?payment_return=true`), el sistema consulta el estado del pago usando el endpoint `/api/check-payment-session`.

### Detalles Técnicos

- **Endpoint de Sonda**: `/api/verify-pending-payments`
- **Frecuencia**: Cada 20 minutos (`*/20 * * * *`)
- **Implementación**: Vercel Cron Jobs
- **Función**: Consulta pagos pendientes en la base de datos y verifica su estado actual en la API de Evertec, actualizando automáticamente los pedidos si hay cambios.

### Ventajas del Sistema Dual

- ✅ **Tiempo Real**: Webhook procesa notificaciones inmediatamente
- ✅ **Respaldo**: Cronjob asegura que ningún pago se quede sin verificar
- ✅ **Confiabilidad**: Sistema redundante para máxima disponibilidad
- ✅ **Eficiencia**: Solo verifica pagos que realmente necesitan actualización

---

**Contacto para más información:**
- Desarrollador: [Tu información de contacto]
- Email: [Tu email]


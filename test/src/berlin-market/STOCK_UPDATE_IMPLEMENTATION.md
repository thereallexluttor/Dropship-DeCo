# Implementación de Actualización Automática de Stocks en Pedidos

## Resumen de Cambios

Se ha implementado la funcionalidad para que cuando un pedido cambia a estado "Pagado" en el AdminDashboard, se descuenten automáticamente las unidades compradas del campo `stocks` (JSONB) en la tabla `productos` de Supabase.

## Archivos Modificados

### 1. Base de Datos

#### `database_stock_update_migration.sql` (NUEVO)
Archivo de migración SQL que debe ejecutarse en Supabase. Incluye:
- Agregación del campo `tamano_index` a la tabla `detalle_pedido`
- Actualización de la función RPC `get_pedidos_with_details()` para incluir `tamano_index`
- Índices para mejorar el rendimiento
- Scripts de verificación

**IMPORTANTE**: Ejecuta este script en tu dashboard de Supabase → SQL Editor

#### `database_pedidos_function.sql`
- Actualizada la función RPC para incluir el campo `tamano_index` en los resultados
- Se usa `COALESCE(a.tamano_index, 0)` para valores predeterminados

### 2. Frontend

#### `app/carrito/page.tsx`
Modificaciones en el proceso de creación de pedidos:
- Los items del carrito ahora incluyen `tamano_index` (línea ~184)
- Al insertar en `detalle_pedido`, se guarda el `tamano_index` (línea ~220)

**Cambios específicos:**
```typescript
// Antes
const orderItems = items.map(item => ({
  producto_id: item.id!,
  cantidad: item.quantity,
  subtotal: item.unitPrice * item.quantity
}))

// Después
const orderItems = items.map(item => ({
  producto_id: item.id!,
  cantidad: item.quantity,
  subtotal: item.unitPrice * item.quantity,
  tamano_index: item.selectedSizeIndex || 0  // ← NUEVO
}))
```

#### `app/components/AdminDashboard.tsx`
Implementación principal de la actualización de stocks:

##### Función `handleUpdateEstadoPedido` (línea 251-358)
Nueva lógica agregada que:

1. **Detecta cambio a "Pagado"**: Verifica si `nuevoEstado === 'pagado'`

2. **Obtiene detalles del pedido**: 
   - Consulta `detalle_pedido` para obtener: `producto_id`, `cantidad`, `tamano_index`

3. **Actualiza stocks por cada producto**:
   - Lee el array `stocks` actual del producto
   - Identifica el tamaño correcto usando `tamano_index`
   - Resta la `cantidad` del stock actual
   - Guarda el array `stocks` actualizado

4. **Actualiza el estado del pedido**: Cambia el estado a "Pagado"

5. **Muestra confirmación**: Alert al usuario sobre el éxito de la operación

##### Carga de pedidos (línea 183-238)
- Actualizada la consulta para incluir `tamano_index` en los datos cargados
- La transformación de datos ahora incluye `tamano_index: detalle.tamano_index || 0`

## Flujo de Trabajo Completo

### 1. Usuario Compra Producto
```
Usuario → Selecciona tamaño → Agrega al carrito
          ↓
CartContext guarda selectedSizeIndex
```

### 2. Usuario Completa Compra
```
Carrito → Crea pedido con estado "pendiente"
         ↓
detalle_pedido guarda: producto_id, cantidad, tamano_index
```

### 3. Admin Procesa Pago
```
AdminDashboard → Admin cambia estado a "Pagado"
                ↓
handleUpdateEstadoPedido se ejecuta
                ↓
Para cada producto del pedido:
  1. Lee stocks actual del producto
  2. Identifica tamaño con tamano_index
  3. Resta cantidad comprada
  4. Actualiza stocks en DB
                ↓
Cambia estado del pedido a "Pagado"
```

## Ejemplo de Actualización de Stock

### Antes del pedido (stocks en producto):
```json
[
  {
    "id": "stock_1",
    "cantidad": 500,
    "unidad": "ML",
    "precio": 15000,
    "stock": 50    ← Stock actual
  },
  {
    "id": "stock_2",
    "cantidad": 1.5,
    "unidad": "KG",
    "precio": 28000,
    "stock": 25
  }
]
```

### Usuario compra 3 unidades del tamaño 0 (500 ML)

### Después del pago (stocks actualizados):
```json
[
  {
    "id": "stock_1",
    "cantidad": 500,
    "unidad": "ML",
    "precio": 15000,
    "stock": 47    ← 50 - 3 = 47
  },
  {
    "id": "stock_2",
    "cantidad": 1.5,
    "unidad": "KG",
    "precio": 28000,
    "stock": 25    ← Sin cambios
  }
]
```

## Instrucciones de Instalación

### Paso 1: Base de Datos
1. Abre tu dashboard de Supabase
2. Ve a SQL Editor
3. Ejecuta el contenido de `database_stock_update_migration.sql`
4. Verifica que todos los pasos se completaron exitosamente

### Paso 2: Código Frontend
Los archivos ya han sido actualizados:
- ✅ `app/carrito/page.tsx`
- ✅ `app/components/AdminDashboard.tsx`
- ✅ `database_pedidos_function.sql`

### Paso 3: Verificación
1. Realiza un pedido de prueba
2. Ve al AdminDashboard → Pestaña "Pedidos"
3. Cambia el estado del pedido a "Pagado"
4. Verifica que:
   - El pedido cambia a estado "Pagado"
   - Aparece un alert de confirmación
   - Los stocks se actualizan correctamente
   - Los logs en consola muestran el cambio de stock

## Logs de Consola

Durante la actualización de stocks, verás logs como:
```
✅ Stock actualizado para producto 15, tamaño 0: 50 -> 47
✅ Pedido 23 actualizado a: pagado
```

## Manejo de Errores

El sistema maneja varios casos de error:
- ❌ Producto sin stocks definidos (continúa con el siguiente)
- ❌ Índice de tamaño fuera de rango (muestra warning)
- ❌ Error al obtener producto (cancela operación)
- ❌ Error al actualizar stock (cancela operación)
- ❌ El stock nunca baja de 0 (usa `Math.max(0, stockActual - cantidad)`)

## Compatibilidad

- ✅ Compatible con productos que usan `stocks` (nuevo formato JSONB)
- ✅ Compatible con productos que usan `tamano` + `precios` (formato antiguo)
- ✅ Los pedidos antiguos sin `tamano_index` usan valor por defecto 0
- ✅ No afecta pedidos en otros estados (pendiente, enviado, entregado)

## Notas Técnicas

### Seguridad
- Se valida que el producto exista antes de actualizar
- Se verifica que el índice de tamaño esté dentro del rango válido
- Las transacciones se hacen de forma secuencial para evitar condiciones de carrera

### Performance
- Se usa un índice en `detalle_pedido(tamano_index)` para consultas rápidas
- Las actualizaciones se hacen por producto, no en lote, para mejor control de errores

### Futuras Mejoras Posibles
- Implementar transacciones atómicas para revertir cambios en caso de error
- Agregar un log de cambios de stock en una tabla separada
- Implementar verificación de stock disponible antes de permitir la compra
- Agregar notificaciones cuando un producto llegue a stock bajo

## Soporte

Si encuentras algún problema:
1. Verifica los logs de la consola del navegador
2. Revisa los logs de Supabase en el dashboard
3. Asegúrate de que la migración SQL se ejecutó correctamente
4. Verifica que los productos tengan el campo `stocks` correctamente configurado


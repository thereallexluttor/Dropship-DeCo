# Implementación de Actualización Automática de Stocks en Pedidos

## Resumen de Cambios

Se ha implementado la funcionalidad para que cuando un pedido cambia de estado en el AdminDashboard, se actualice automáticamente el inventario en el campo `stocks` (JSONB) de la tabla `productos` de Supabase:

- ✅ **Pago realizado**: "Pendiente" → "Pagado" = Descuento del stock
- ✅ **Pago revertido**: "Pagado" → "Pendiente" = Restitución del stock
- ✅ **Otros cambios**: No afectan el stock (Enviado, Entregado, etc.)

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

##### Función auxiliar `actualizarStocksPedido` (línea 252-327)
Función que maneja la lógica de actualización de inventario:

**Parámetros:**
- `pedidoId`: ID del pedido a procesar
- `operacion`: 'restar' | 'sumar' - Operación a realizar en el stock

**Funcionalidad:**
1. Obtiene todos los productos del pedido con sus cantidades y tamaños
2. Para cada producto:
   - Lee el array `stocks` actual
   - Identifica el tamaño correcto usando `tamano_index`
   - **Resta** la cantidad si `operacion === 'restar'`
   - **Suma** la cantidad si `operacion === 'sumar'`
   - Valida que el stock nunca baje de 0
   - Actualiza la base de datos

##### Función `handleUpdateEstadoPedido` (línea 329-384)
Función principal que detecta cambios de estado y actualiza stocks:

**Lógica de detección:**
```typescript
const necesitaActualizarStock =
  (estadoActual === 'pendiente' && nuevoEstado === 'pagado') || // Pago realizado
  (estadoActual === 'pagado' && nuevoEstado === 'pendiente');   // Pago revertido
```

**Operaciones realizadas:**
1. **Detecta el estado actual** del pedido antes del cambio
2. **Determina si necesita actualizar stock** basado en la transición de estados
3. **Llama a `actualizarStocksPedido`** con la operación correcta:
   - `nuevoEstado === 'pagado'` → `operacion = 'restar'`
   - `nuevoEstado === 'pendiente'` → `operacion = 'sumar'`
4. **Actualiza el estado del pedido** en la base de datos
5. **Actualiza el estado local** para reflejar el cambio en la UI
6. **Muestra mensajes de confirmación** según el tipo de cambio

**Mensajes de confirmación:**
- Pago realizado: "Pedido marcado como pagado y stocks actualizados correctamente"
- Pago revertido: "Estado cambiado a pendiente y stocks restituidos correctamente"

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
handleUpdateEstadoPedido detecta cambio "Pendiente" → "Pagado"
                ↓
Para cada producto del pedido:
  1. Lee stocks actual del producto
  2. Identifica tamaño con tamano_index
  3. Resta cantidad comprada (operación = 'restar')
  4. Actualiza stocks en DB
                ↓
Cambia estado del pedido a "Pagado"
                ↓
Muestra: "Pedido marcado como pagado y stocks actualizados correctamente"
```

### 4. Admin Revierte Pago (NUEVO)
```
AdminDashboard → Admin cambia estado de "Pagado" → "Pendiente"
                ↓
handleUpdateEstadoPedido detecta cambio "Pagado" → "Pendiente"
                ↓
Para cada producto del pedido:
  1. Lee stocks actual del producto
  2. Identifica tamaño con tamano_index
  3. Suma cantidad de vuelta (operación = 'sumar')
  4. Actualiza stocks en DB
                ↓
Cambia estado del pedido a "Pendiente"
                ↓
Muestra: "Estado cambiado a pendiente y stocks restituidos correctamente"
```

## Ejemplo de Actualización de Stock

### Estado inicial (stocks en producto):
```json
[
  {
    "id": "stock_1",
    "cantidad": 500,
    "unidad": "ML",
    "precio": 15000,
    "stock": 50    ← Stock inicial
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

### ✅ Escenario 1: Pago realizado (Descuento del stock)
```json
// Estado del pedido: "Pendiente" → "Pagado"
[
  {
    "id": "stock_1",
    "cantidad": 500,
    "unidad": "ML",
    "precio": 15000,
    "stock": 47    ← 50 - 3 = 47 ✅ DESCONTADO
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

### ✅ Escenario 2: Pago revertido (Restitución del stock)
```json
// Estado del pedido: "Pagado" → "Pendiente"
[
  {
    "id": "stock_1",
    "cantidad": 500,
    "unidad": "ML",
    "precio": 15000,
    "stock": 50    ← 47 + 3 = 50 ✅ RESTITUIDO
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

### ✅ Descuento de stock (Pago realizado):
```
✅ Stock restado para producto 15, tamaño 0: 50 -> 47
✅ Pedido 23 actualizado a: pagado
```

### ✅ Restitución de stock (Pago revertido):
```
✅ Stock sumado para producto 15, tamaño 0: 47 -> 50
✅ Pedido 23 actualizado a: pendiente
```

### ⚠️ Casos de error:
```
⚠️ Producto 12 no tiene stocks definidos
⚠️ Índice de tamaño 3 fuera de rango para producto 8
❌ Error actualizando stock del producto 5: [detalle del error]
```

## Manejo de Errores

El sistema maneja varios casos de error:
- ❌ Producto sin stocks definidos (continúa con el siguiente)
- ❌ Índice de tamaño fuera de rango (muestra warning)
- ❌ Error al obtener producto (cancela operación)
- ❌ Error al actualizar stock (cancela operación)
- ❌ El stock nunca baja de 0 (usa `Math.max(0, stockActual - cantidad)`)
- ❌ Estado actual del pedido no encontrado (muestra error)

**Comportamiento en errores:**
- Si un producto falla, **se detiene toda la operación** para evitar inconsistencias
- Los errores se muestran al usuario mediante `alert()`
- Los logs detallados aparecen en la consola del navegador
- El estado del pedido **NO se actualiza** si hay errores en el stock

## Compatibilidad

- ✅ Compatible con productos que usan `stocks` (nuevo formato JSONB)
- ✅ Compatible con productos que usan `tamano` + `precios` (formato antiguo)
- ✅ Los pedidos antiguos sin `tamano_index` usan valor por defecto 0
- ✅ **Solo actualiza stock** en transiciones: "Pendiente" ↔ "Pagado"
- ✅ **No afecta stock** en otros cambios: "Enviado", "Entregado", etc.

## Estados de Pedido y Comportamiento del Stock

| Transición de Estado | Actualiza Stock | Operación | Mensaje |
|---------------------|-----------------|-----------|---------|
| Pendiente → Pagado | ✅ Sí | Restar | "Pedido marcado como pagado y stocks actualizados" |
| Pagado → Pendiente | ✅ Sí | Sumar | "Estado cambiado a pendiente y stocks restituidos" |
| Pendiente → Enviado | ❌ No | - | Sin cambios en stock |
| Pagado → Enviado | ❌ No | - | Sin cambios en stock |
| Enviado → Entregado | ❌ No | - | Sin cambios en stock |
| Cualquier → Cualquier otro | ❌ No | - | Sin cambios en stock |

## Notas Técnicas

### Seguridad
- Se valida que el producto exista antes de actualizar
- Se verifica que el índice de tamaño esté dentro del rango válido
- Las transacciones se hacen de forma secuencial para evitar condiciones de carrera

### Performance
- Se usa un índice en `detalle_pedido(tamano_index)` para consultas rápidas
- Las actualizaciones se hacen por producto, no en lote, para mejor control de errores

### Características de la Implementación

#### Detección Bidireccional de Cambios
- La función detecta automáticamente la **dirección del cambio** de estado
- **Solo actualiza stock** cuando hay transiciones entre "Pendiente" y "Pagado"
- **Ignora otros cambios** de estado para evitar modificaciones innecesarias

#### Validación de Estado Anterior
- Obtiene el estado actual **antes** de realizar cualquier cambio
- Compara estados para determinar la operación correcta (sumar/restar)
- Si no puede determinar el estado anterior, **cancela la operación**

#### Mensajes Contextuales
- Muestra mensajes específicos según la operación realizada
- El usuario siempre sabe qué operación se completó correctamente

### Futuras Mejoras Posibles
- Implementar transacciones atómicas para revertir cambios en caso de error
- Agregar un log de cambios de stock en una tabla separada (con timestamp y usuario)
- Implementar verificación de stock disponible antes de permitir la compra
- Agregar notificaciones cuando un producto llegue a stock bajo
- Implementar bloqueo de cambios si el stock sería negativo

## Soporte

Si encuentras algún problema:

### ✅ Verificación de Funcionamiento
1. **Revisa los logs de la consola del navegador** - Deberías ver mensajes como:
   - `✅ Stock restado para producto X, tamaño Y: A -> B` (para pagos)
   - `✅ Stock sumado para producto X, tamaño Y: A -> B` (para reversiones)

2. **Verifica los logs de Supabase** en el dashboard → Table Editor → productos → stocks

3. **Asegúrate de que la migración SQL se ejecutó correctamente**:
   - El campo `tamano_index` existe en `detalle_pedido`
   - La función `get_pedidos_with_details()` incluye `tamano_index`

4. **Verifica que los productos tengan el campo `stocks` correctamente configurado**

### 🐛 Problemas Comunes

#### "No se pudo determinar el estado actual del pedido"
- **Causa**: El pedido no se encontró en la lista local
- **Solución**: Recarga la página para actualizar la lista de pedidos

#### "Error al actualizar el stock del producto ID X"
- **Causa**: Problema con la estructura del JSONB `stocks`
- **Solución**: Verifica que el campo `stocks` del producto tenga la estructura correcta

#### Los stocks no se actualizan
- **Causa**: Los productos no tienen el campo `stocks` configurado
- **Solución**: Asegúrate de que los productos usen el sistema de `stocks` JSONB (no solo `tamano` + `precios`)

#### El índice de tamaño está fuera de rango
- **Causa**: El `tamano_index` guardado es mayor que los tamaños disponibles
- **Solución**: Los pedidos nuevos deberían funcionar correctamente. Para pedidos antiguos, el sistema usa índice 0 por defecto.


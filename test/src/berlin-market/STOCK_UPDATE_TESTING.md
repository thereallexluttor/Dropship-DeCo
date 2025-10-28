# Guía de Pruebas - Sistema de Actualización de Stocks

## 📋 Casos de Prueba para Validar la Funcionalidad

### 🎯 Objetivo
Verificar que el sistema de actualización automática de stocks funcione correctamente en ambos sentidos:
- ✅ Descuento de stock cuando se marca un pedido como "Pagado"
- ✅ Restitución de stock cuando se cambia de "Pagado" a "Pendiente"

---

## 🚀 Preparación para las Pruebas

### 1. Configuración Inicial
1. **Ejecutar migración SQL**: Asegúrate de que `database_stock_update_migration.sql` se ejecutó correctamente
2. **Verificar productos con stock**: Asegúrate de tener productos con el campo `stocks` configurado
3. **Limpiar carrito**: Inicia con el carrito vacío

### 2. Datos de Prueba Necesarios
- ✅ Al menos 1 producto con stock disponible
- ✅ Usuario registrado para hacer pedidos
- ✅ Acceso al panel de administración

---

## 🧪 Casos de Prueba

### **Caso 1: Flujo Normal - Pago Realizado**
**Objetivo**: Verificar que el stock se descuente correctamente

**Pasos:**
1. **Como usuario**:
   - Ve a la tienda y selecciona un producto
   - Elige un tamaño específico (ej: 500 ML)
   - Agrega 2 unidades al carrito
   - Completa el proceso de compra
   - Verifica que el pedido aparece como "Pendiente"

2. **Como administrador**:
   - Ve a AdminDashboard → Categoría "Pedidos"
   - Encuentra el pedido creado
   - **Cambia el estado de "Pendiente" a "Pagado"**

**Resultados Esperados:**
- ✅ El pedido cambia a estado "Pagado"
- ✅ Aparece el mensaje: "Pedido marcado como pagado y stocks actualizados correctamente"
- ✅ En consola: `✅ Stock restado para producto X, tamaño Y: A -> B`
- ✅ El stock del producto se redujo en 2 unidades

**Verificación Manual:**
```sql
-- Verificar stock actualizado en Supabase
SELECT nombre, stocks FROM productos WHERE id = [ID_DEL_PRODUCTO];
```

---

### **Caso 2: Flujo Inverso - Pago Revertido**
**Objetivo**: Verificar que el stock se restituya correctamente

**Pasos:**
1. **Como administrador**:
   - Ve a AdminDashboard → Categoría "Pedidos"
   - Encuentra un pedido en estado "Pagado" (del Caso 1 o existente)
   - **Cambia el estado de "Pagado" a "Pendiente"**

**Resultados Esperados:**
- ✅ El pedido cambia a estado "Pendiente"
- ✅ Aparece el mensaje: "Estado cambiado a pendiente y stocks restituidos correctamente"
- ✅ En consola: `✅ Stock sumado para producto X, tamaño Y: A -> B`
- ✅ El stock del producto se incrementó en las unidades originales

**Verificación Manual:**
```sql
-- Verificar stock restituido en Supabase
SELECT nombre, stocks FROM productos WHERE id = [ID_DEL_PRODUCTO];
```

---

### **Caso 3: Cambios de Estado sin Impacto en Stock**
**Objetivo**: Verificar que otros cambios de estado no afecten el stock

**Pasos:**
1. **Como administrador**:
   - Ve a AdminDashboard → Categoría "Pedidos"
   - Selecciona un pedido en cualquier estado
   - **Cambia entre estados que NO son "Pendiente" y "Pagado"**:
     - Pendiente → Enviado
     - Pagado → Enviado
     - Enviado → Entregado
     - Cualquier combinación similar

**Resultados Esperados:**
- ✅ El estado del pedido cambia correctamente
- ❌ **NO** aparece ningún mensaje sobre actualización de stocks
- ❌ **NO** hay logs en consola sobre cambios de stock
- ❌ El stock del producto **NO** cambia

---

### **Caso 4: Manejo de Errores**
**Objetivo**: Verificar que el sistema maneje errores correctamente

**Escenario A: Producto sin stocks definidos**
1. Crea un pedido con un producto que **NO** tenga el campo `stocks` configurado
2. Cambia el estado a "Pagado"

**Resultados Esperados:**
- ⚠️ En consola: `⚠️ Producto X no tiene stocks definidos`
- ✅ El sistema **continúa** con el siguiente producto
- ✅ El pedido se marca como "Pagado"

**Escenario B: Error de conexión**
1. Simula un error de conexión o base de datos
2. Intenta cambiar el estado de un pedido

**Resultados Esperados:**
- ❌ Error mostrado en `alert()`
- ❌ El estado del pedido **NO** se actualiza
- ❌ El stock **NO** se modifica

---

### **Caso 5: Stock en Cero**
**Objetivo**: Verificar que el stock nunca sea negativo

**Pasos:**
1. Encuentra un producto con stock bajo (ej: 1 unidad)
2. Compra más unidades de las disponibles (ej: 3 unidades)
3. Marca el pedido como "Pagado"

**Resultados Esperados:**
- ✅ El stock llega a 0 pero **NO** se hace negativo
- ✅ En consola: `✅ Stock restado para producto X, tamaño Y: 1 -> 0`

---

## 📊 Matriz de Casos de Prueba

| Caso | Estado Inicial | Estado Final | Stock Debería | Operación | Mensaje Esperado |
|------|----------------|--------------|---------------|-----------|------------------|
| 1 | Pendiente | Pagado | Disminuir | Restar | ✅ "Pedido marcado como pagado..." |
| 2 | Pagado | Pendiente | Aumentar | Sumar | ✅ "Estado cambiado a pendiente..." |
| 3 | Pendiente | Enviado | Sin cambios | - | ❌ Sin mensaje de stock |
| 4 | Pagado | Enviado | Sin cambios | - | ❌ Sin mensaje de stock |
| 5 | Enviado | Entregado | Sin cambios | - | ❌ Sin mensaje de stock |

---

## 🔧 Herramientas de Debug

### Comandos SQL para Verificación

```sql
-- Ver todos los pedidos con sus estados
SELECT p.id, p.estado, u.nombre as cliente, p.total, p.fecha
FROM pedidos p
LEFT JOIN usuarios u ON u.id = p.usuario_id
ORDER BY p.fecha DESC;

-- Ver detalles de un pedido específico
SELECT dp.*, pr.nombre as producto, dp.tamano_index
FROM detalle_pedido dp
LEFT JOIN productos pr ON pr.id = dp.producto_id
WHERE dp.pedido_id = [ID_DEL_PEDIDO];

-- Ver stocks de todos los productos
SELECT id, nombre, stocks FROM productos WHERE stocks IS NOT NULL;

-- Ver stocks de un producto específico
SELECT id, nombre, stocks FROM productos WHERE id = [ID_DEL_PRODUCTO];
```

### Logs del Navegador
Abre las DevTools (F12) y ve a la pestaña Console. Busca:
- ✅ `Stock restado para producto...` (para pagos)
- ✅ `Stock sumado para producto...` (para reversiones)
- ⚠️ Warnings para productos sin stock
- ❌ Errores para fallos en la actualización

---

## ✅ Criterios de Aceptación

### Para que el sistema sea considerado FUNCIONAL:

1. **✅ Funcionalidad Bidireccional**:
   - Los cambios "Pendiente" → "Pagado" descuentan stock
   - Los cambios "Pagado" → "Pendiente" restituyen stock

2. **✅ Integridad de Datos**:
   - El stock nunca se hace negativo
   - Los cambios son atómicos (todo o nada)
   - Se valida la existencia de productos antes de actualizar

3. **✅ Experiencia de Usuario**:
   - Mensajes claros de confirmación
   - Logs informativos en consola
   - Manejo elegante de errores

4. **✅ Performance**:
   - Operaciones rápidas (< 2 segundos)
   - Sin bloqueos en la interfaz
   - Consultas optimizadas con índices

5. **✅ Compatibilidad**:
   - Funciona con productos que tienen `stocks` JSONB
   - Compatible con pedidos existentes
   - No afecta otros cambios de estado

---

## 🚨 Reporte de Bugs

Si encuentras algún problema durante las pruebas:

1. **Captura de pantalla** del error
2. **Logs de consola** completos
3. **Estado de la base de datos** antes/después
4. **Pasos exactos** para reproducir el error

**Ejemplo de reporte:**
```
🐛 Bug encontrado: Stock no se actualiza correctamente

**Pasos para reproducir:**
1. Crear pedido con producto ID 15
2. Cambiar estado a "Pagado"
3. Verificar stock en base de datos

**Logs de consola:**
❌ Error actualizando stock del producto 15: [error details]

**Estado esperado:** Stock debería disminuir en 2
**Estado actual:** Stock sin cambios
```

---

## 🎉 ¡Listo para Probar!

Sigue los casos de prueba en orden y marca cada uno como completado. Si todos los casos pasan exitosamente, el sistema está funcionando correctamente.

**Recuerda**: Siempre prueba en un entorno de desarrollo primero antes de aplicar cambios en producción.



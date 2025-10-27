-- ========================================
-- MIGRACIÓN: Agregar soporte para actualización de stocks en pedidos
-- ========================================
-- Este script agrega el campo tamano_index a la tabla detalle_pedido
-- y actualiza la función RPC get_pedidos_with_details
-- Ejecuta este script en tu dashboard de Supabase en la sección SQL Editor

-- ========== 1. AGREGAR CAMPO TAMANO_INDEX ==========
-- Este campo almacena el índice del tamaño seleccionado del producto
ALTER TABLE detalle_pedido ADD COLUMN IF NOT EXISTS tamano_index INTEGER DEFAULT 0;

-- Crear índice para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_detalle_pedido_tamano_index ON detalle_pedido(tamano_index);

-- Comentario en la columna para documentación
COMMENT ON COLUMN detalle_pedido.tamano_index IS 'Índice del tamaño seleccionado del producto (0-based). Corresponde al índice en el array stocks o tamano del producto';

SELECT '✅ Campo tamano_index agregado a detalle_pedido' AS status;

-- ========== 2. ACTUALIZAR FUNCIÓN RPC ==========
-- Actualizar la función RPC para incluir el campo tamano_index

-- Eliminar la función existente
DROP FUNCTION IF EXISTS get_pedidos_with_details();

-- Crear la función RPC actualizada
CREATE OR REPLACE FUNCTION get_pedidos_with_details()
RETURNS TABLE (
  id_detalle_pedido INTEGER,
  pedido_id INTEGER,
  nombre TEXT,
  correo TEXT,
  telefono TEXT,
  direccion TEXT,
  producto_id INTEGER,
  nombre_producto TEXT,
  imagen_producto TEXT,
  cantidad INTEGER,
  subtotal DECIMAL(10,2),
  tamano_index INTEGER,
  estado_pedido VARCHAR(50),
  fecha TIMESTAMP WITH TIME ZONE,
  total DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  WITH pedido AS (
    SELECT 
        a.id AS pedido_id,
        a.usuario_id,
        b.nombre,
        b.correo,
        b.telefono,
        b.direccion,
        a.fecha,
        a.total,
        a.estado
    FROM pedidos a
    LEFT JOIN usuarios b ON b.id = a.usuario_id
  )
  SELECT 
    a.id AS id_detalle_pedido,
    a.pedido_id,
    c.nombre,
    c.correo,
    c.telefono,
    c.direccion,
    a.producto_id,
    b.nombre AS nombre_producto,
    b.imagen_url AS imagen_producto,
    a.cantidad,
    a.subtotal,
    COALESCE(a.tamano_index, 0) AS tamano_index,
    c.estado AS estado_pedido,
    c.fecha,
    c.total
  FROM detalle_pedido a
  LEFT JOIN productos b ON b.id = a.producto_id
  LEFT JOIN pedido c ON c.pedido_id = a.pedido_id
  ORDER BY a.pedido_id DESC, a.id;
END;
$$ LANGUAGE plpgsql;

-- Otorgar permisos de ejecución
GRANT EXECUTE ON FUNCTION get_pedidos_with_details() TO authenticated;
GRANT EXECUTE ON FUNCTION get_pedidos_with_details() TO anon;

SELECT '✅ Función get_pedidos_with_details() actualizada exitosamente' AS status;

-- ========== 3. VERIFICACIÓN ==========
-- Mostrar estructura actualizada de detalle_pedido
SELECT '=== ESTRUCTURA ACTUALIZADA DE DETALLE_PEDIDO ===' AS info;
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'detalle_pedido'
ORDER BY ordinal_position;

-- Probar la función RPC (opcional - muestra los primeros 5 pedidos)
SELECT '=== PRUEBA DE FUNCIÓN RPC ===' AS info;
SELECT * FROM get_pedidos_with_details() LIMIT 5;

SELECT '✅ Migración completada exitosamente' AS status;


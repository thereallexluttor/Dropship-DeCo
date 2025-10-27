-- Función RPC optimizada para obtener pedidos con detalles
-- Ejecuta este script en tu dashboard de Supabase en la sección SQL Editor

-- Eliminar la función si ya existe
DROP FUNCTION IF EXISTS get_pedidos_with_details();

-- Crear la función RPC
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

-- Verificar que la función se creó correctamente
SELECT '✅ Función get_pedidos_with_details() creada exitosamente' AS status;

-- Probar la función (opcional)
SELECT * FROM get_pedidos_with_details() LIMIT 5;


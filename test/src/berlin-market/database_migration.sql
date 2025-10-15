-- Migración completa para configurar las tablas necesarias
-- Ejecuta este script en tu dashboard de Supabase en la sección SQL Editor

-- ========== VERIFICACIÓN INICIAL ==========
-- Consulta para ver el estado actual de la tabla marcas
SELECT '=== ESTADO ACTUAL DE LA TABLA MARCAS ===' as info;
SELECT
    COUNT(*) as total_marcas,
    (SELECT COUNT(*) FROM marcas) as conteo_verificacion
FROM marcas;

-- Mostrar todas las marcas existentes (máximo 5 para no saturar)
SELECT '=== PRIMERAS 5 MARCAS ===' as info;
SELECT id, nombre_marca, created_at
FROM marcas
ORDER BY id
LIMIT 5;

-- 1. Crear tabla marcas (si no existe)
CREATE TABLE IF NOT EXISTS marcas (
  id SERIAL PRIMARY KEY,
  nombre_marca VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Insertar marcas de ejemplo (solo si la tabla está vacía)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM marcas LIMIT 1) THEN
        INSERT INTO marcas (nombre_marca) VALUES
            ('Royal Canin'),
            ('Purina Pro Plan'),
            ('Hill''s Science Diet'),
            ('Eukanuba'),
            ('Advance'),
            ('Acana'),
            ('Orijen'),
            ('Naturally Good'),
            ('Select Gold'),
            ('Ultima'),
            ('Real Nature'),
            ('Crave'),
            ('Whiskas'),
            ('Pedigree'),
            ('Iams'),
            ('Nutro'),
            ('Blue Buffalo'),
            ('Wellness'),
            ('Merrick'),
            ('Taste of the Wild');
        RAISE NOTICE '✅ Insertadas % marcas de ejemplo', (SELECT COUNT(*) FROM marcas);
    ELSE
        RAISE NOTICE 'ℹ️ La tabla marcas ya contiene datos, no se insertaron marcas adicionales';
    END IF;
END $$;

-- 3. Eliminar la columna stock antigua (si existe)
ALTER TABLE productos DROP COLUMN IF EXISTS stock;

-- 2. Añadir el nuevo campo stocks como jsonb
ALTER TABLE productos ADD COLUMN stocks jsonb;

-- 3. Crear índice para mejorar el rendimiento de consultas
CREATE INDEX IF NOT EXISTS idx_productos_stocks ON productos USING GIN (stocks);

-- 4. Si tienes productos existentes con tamaños y precios, puedes migrar los datos así:
-- (Este paso es opcional y solo si quieres mantener compatibilidad hacia atrás)

-- UPDATE productos
-- SET stocks = (
--   SELECT jsonb_agg(
--     jsonb_build_object(
--       'id', productos.id || '_' || row_number() OVER () || '_' || EXTRACT(EPOCH FROM NOW()),
--       'cantidad', tamano->>'cantidad',
--       'unidad', tamano->>'unidad',
--       'precio', precios->>(row_number() OVER () - 1),
--       'stock', 0  -- Valor por defecto, puedes ajustarlo según necesites
--     )
--   )
--   FROM productos p2
--   CROSS JOIN LATERAL jsonb_array_elements(CASE WHEN tamano IS NOT NULL THEN tamano ELSE '[]'::jsonb END) WITH ORDINALITY AS t(tamano, row_num)
--   WHERE p2.id = productos.id
--     AND productos.tamano IS NOT NULL
--     AND productos.precios IS NOT NULL
--     AND array_length(productos.precios, 1) >= t.row_num
--   GROUP BY productos.id
-- )
-- WHERE productos.tamano IS NOT NULL
--   AND productos.precios IS NOT NULL
--   AND array_length(productos.precios, 1) > 0;

-- 5. Verificar la estructura de la tabla
-- DESCRIBE productos;

-- 6. Ejemplo de cómo deberían verse los datos en el campo stocks:
/*
{
  "stocks": [
    {
      "id": "unique_id_1",
      "cantidad": 500,
      "unidad": "ML",
      "precio": 15000,
      "stock": 50
    },
    {
      "id": "unique_id_2",
      "cantidad": 1.5,
      "unidad": "KG",
      "precio": 28000,
      "stock": 25
    }
  ]
}
*/

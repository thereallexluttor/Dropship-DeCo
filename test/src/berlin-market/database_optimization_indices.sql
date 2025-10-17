-- Índices para mejorar el rendimiento de consultas en Supabase
-- Ejecuta estos comandos en tu dashboard de Supabase en la sección SQL Editor

-- Índices en la tabla productos para consultas más rápidas
CREATE INDEX IF NOT EXISTS idx_productos_subcategorias_id ON productos(subcategorias_id);
CREATE INDEX IF NOT EXISTS idx_productos_id_marca ON productos(id_marca);
CREATE INDEX IF NOT EXISTS idx_productos_descuento ON productos(descuento);
CREATE INDEX IF NOT EXISTS idx_productos_destacado ON productos(destacado);
CREATE INDEX IF NOT EXISTS idx_productos_novedad ON productos(novedad);

-- Índices en la tabla subcategories
CREATE INDEX IF NOT EXISTS idx_subcategories_categories_id ON subcategories(categories_id);

-- Índices en las tablas de lookup
CREATE INDEX IF NOT EXISTS idx_categories_id ON categories(id);
CREATE INDEX IF NOT EXISTS idx_marcas_id ON marcas(id);

-- Índice compuesto para consultas comunes de productos por subcategoría y marca
CREATE INDEX IF NOT EXISTS idx_productos_subcategoria_marca ON productos(subcategorias_id, id_marca);

-- Índice para búsquedas por nombre de producto (si necesitas búsqueda de texto)
-- CREATE INDEX IF NOT EXISTS idx_productos_nombre ON productos USING gin(to_tsvector('spanish', nombre));

COMMENT ON INDEX idx_productos_subcategorias_id IS 'Índice para consultas por subcategoría de productos';
COMMENT ON INDEX idx_productos_id_marca IS 'Índice para consultas por marca de productos';
COMMENT ON INDEX idx_productos_descuento IS 'Índice para filtrar productos con descuento';
COMMENT ON INDEX idx_productos_destacado IS 'Índice para filtrar productos destacados';
COMMENT ON INDEX idx_productos_novedad IS 'Índice para filtrar productos nuevos';

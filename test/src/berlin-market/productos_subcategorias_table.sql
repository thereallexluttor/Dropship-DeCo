-- Tabla de relación muchos-a-muchos entre productos y subcategorías
-- Ejecuta este script en tu dashboard de Supabase en la sección SQL Editor

CREATE TABLE IF NOT EXISTS productos_subcategorias (
  id SERIAL PRIMARY KEY,
  producto_id INTEGER NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  subcategoria_id INTEGER NOT NULL REFERENCES subcategories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(producto_id, subcategoria_id)
);

-- Crear índices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_productos_subcategorias_producto_id ON productos_subcategorias(producto_id);
CREATE INDEX IF NOT EXISTS idx_productos_subcategorias_subcategoria_id ON productos_subcategorias(subcategoria_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE productos_subcategorias ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a todos
CREATE POLICY "Las relaciones productos-subcategorías son visibles para todos"
  ON productos_subcategorias FOR SELECT
  TO authenticated, anon
  USING (true);

-- Política para permitir inserción solo a usuarios autenticados
CREATE POLICY "Solo usuarios autenticados pueden insertar relaciones productos-subcategorías"
  ON productos_subcategorias FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política para permitir actualización solo a usuarios autenticados
CREATE POLICY "Solo usuarios autenticados pueden actualizar relaciones productos-subcategorías"
  ON productos_subcategorias FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política para permitir eliminación solo a usuarios autenticados
CREATE POLICY "Solo usuarios autenticados pueden eliminar relaciones productos-subcategorías"
  ON productos_subcategorias FOR DELETE
  TO authenticated
  USING (true);


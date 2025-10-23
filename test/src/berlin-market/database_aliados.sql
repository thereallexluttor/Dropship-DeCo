-- Tabla para almacenar información de los aliados
CREATE TABLE IF NOT EXISTS aliados (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  imagen_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_aliados_nombre ON aliados(nombre);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_aliados_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER aliados_updated_at_trigger
BEFORE UPDATE ON aliados
FOR EACH ROW
EXECUTE FUNCTION update_aliados_updated_at();

-- Insertar datos iniciales con las imágenes actuales de aliados
INSERT INTO aliados (nombre, imagen_url) VALUES
  ('Royal Canin', '/brands/royal-canin.png'),
  ('Real Nature', '/brands/real-nature.png'),
  ('Naturally Good', '/brands/naturally-good.png'),
  ('Select Gold', '/brands/select-gold.png'),
  ('Purina', '/brands/purina.png'),
  ('Hill''s', '/brands/hills.png'),
  ('Acana', '/brands/acana.png'),
  ('Orijen', '/brands/orijen.png'),
  ('Eukanuba', '/brands/eukanuba.png'),
  ('Advance', '/brands/advance.png'),
  ('Crave', '/brands/crave.png'),
  ('Ultima', '/brands/ultima.png')
ON CONFLICT DO NOTHING;

-- Habilitar RLS (Row Level Security)
ALTER TABLE aliados ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a todos
CREATE POLICY "Los aliados son visibles para todos"
  ON aliados FOR SELECT
  TO authenticated, anon
  USING (true);

-- Política para permitir inserción solo a usuarios autenticados
CREATE POLICY "Solo usuarios autenticados pueden insertar aliados"
  ON aliados FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política para permitir actualización solo a usuarios autenticados
CREATE POLICY "Solo usuarios autenticados pueden actualizar aliados"
  ON aliados FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política para permitir eliminación solo a usuarios autenticados
CREATE POLICY "Solo usuarios autenticados pueden eliminar aliados"
  ON aliados FOR DELETE
  TO authenticated
  USING (true);

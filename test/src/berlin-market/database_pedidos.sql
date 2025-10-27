-- Migración para crear las tablas de pedidos y detalles de pedidos
-- Ejecuta este script en tu dashboard de Supabase en la sección SQL Editor

-- ========== TABLA PEDIDOS ==========
-- Tabla para almacenar los pedidos de los usuarios
CREATE TABLE IF NOT EXISTS pedidos (
  id SERIAL PRIMARY KEY,
  usuario_id UUID NOT NULL,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total DECIMAL(10, 2) NOT NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'pendiente',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_usuario
    FOREIGN KEY (usuario_id) 
    REFERENCES usuarios(id)
    ON DELETE CASCADE
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_pedidos_usuario_id ON pedidos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha ON pedidos(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(estado);

-- ========== TABLA DETALLE_PEDIDO ==========
-- Tabla para almacenar los detalles de cada pedido (productos, cantidades, etc.)
CREATE TABLE IF NOT EXISTS detalle_pedido (
  id SERIAL PRIMARY KEY,
  pedido_id INTEGER NOT NULL,
  producto_id INTEGER NOT NULL,
  cantidad INTEGER NOT NULL DEFAULT 1,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_pedido
    FOREIGN KEY (pedido_id) 
    REFERENCES pedidos(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_producto
    FOREIGN KEY (producto_id) 
    REFERENCES productos(id)
    ON DELETE CASCADE
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_detalle_pedido_pedido_id ON detalle_pedido(pedido_id);
CREATE INDEX IF NOT EXISTS idx_detalle_pedido_producto_id ON detalle_pedido(producto_id);

-- ========== POLÍTICAS RLS (Row Level Security) ==========
-- Habilitar RLS en las tablas
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalle_pedido ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios puedan ver solo sus propios pedidos
CREATE POLICY IF NOT EXISTS "Los usuarios pueden ver sus propios pedidos"
  ON pedidos
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM usuarios WHERE id = pedidos.usuario_id
    )
  );

-- Política para que los usuarios puedan crear pedidos
CREATE POLICY IF NOT EXISTS "Los usuarios pueden crear pedidos"
  ON pedidos
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM usuarios WHERE id = pedidos.usuario_id
    )
  );

-- Política para que los administradores puedan ver todos los pedidos
CREATE POLICY IF NOT EXISTS "Los administradores pueden ver todos los pedidos"
  ON pedidos
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM usuarios WHERE rol = 'admin'
    )
  );

-- Política para que los administradores puedan actualizar pedidos
CREATE POLICY IF NOT EXISTS "Los administradores pueden actualizar pedidos"
  ON pedidos
  FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM usuarios WHERE rol = 'admin'
    )
  );

-- Políticas para detalle_pedido
-- Los usuarios pueden ver los detalles de sus propios pedidos
CREATE POLICY IF NOT EXISTS "Los usuarios pueden ver detalles de sus pedidos"
  ON detalle_pedido
  FOR SELECT
  USING (
    pedido_id IN (
      SELECT id FROM pedidos WHERE usuario_id IN (
        SELECT id FROM usuarios WHERE id = auth.uid()
      )
    )
  );

-- Los usuarios pueden crear detalles de pedido
CREATE POLICY IF NOT EXISTS "Los usuarios pueden crear detalles de pedido"
  ON detalle_pedido
  FOR INSERT
  WITH CHECK (
    pedido_id IN (
      SELECT id FROM pedidos WHERE usuario_id IN (
        SELECT id FROM usuarios WHERE id = auth.uid()
      )
    )
  );

-- Los administradores pueden ver todos los detalles
CREATE POLICY IF NOT EXISTS "Los administradores pueden ver todos los detalles"
  ON detalle_pedido
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM usuarios WHERE rol = 'admin'
    )
  );

-- ========== FUNCIÓN PARA ACTUALIZAR updated_at ==========
-- Crear función para actualizar automáticamente el campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at en pedidos
DROP TRIGGER IF EXISTS update_pedidos_updated_at ON pedidos;
CREATE TRIGGER update_pedidos_updated_at
  BEFORE UPDATE ON pedidos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========== VERIFICACIÓN ==========
-- Mostrar información de las tablas creadas
SELECT '=== VERIFICACIÓN DE TABLAS ===' as info;

SELECT 
  'Tabla pedidos creada correctamente' as tabla,
  COUNT(*) as total_registros
FROM pedidos;

SELECT 
  'Tabla detalle_pedido creada correctamente' as tabla,
  COUNT(*) as total_registros
FROM detalle_pedido;

-- Mostrar las columnas de la tabla pedidos
SELECT '=== COLUMNAS DE PEDIDOS ===' as info;
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'pedidos'
ORDER BY ordinal_position;

-- Mostrar las columnas de la tabla detalle_pedido
SELECT '=== COLUMNAS DE DETALLE_PEDIDO ===' as info;
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'detalle_pedido'
ORDER BY ordinal_position;


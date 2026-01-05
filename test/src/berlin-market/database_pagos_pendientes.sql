-- Tabla para mapear requestId de Evertec con pedidos
-- Esto permite que el cronjob pueda verificar pagos pendientes
-- Ejecuta este script en tu dashboard de Supabase en la sección SQL Editor

-- ========== TABLA PAGOS_PENDIENTES ==========
CREATE TABLE IF NOT EXISTS pagos_pendientes (
  id SERIAL PRIMARY KEY,
  request_id VARCHAR(255) NOT NULL UNIQUE,
  pedido_id INTEGER NOT NULL,
  referencia VARCHAR(255),
  monto DECIMAL(10, 2) NOT NULL,
  estado VARCHAR(50) DEFAULT 'PENDING',
  ultima_verificacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_pedido
    FOREIGN KEY (pedido_id) 
    REFERENCES pedidos(id)
    ON DELETE CASCADE
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_pagos_pendientes_request_id ON pagos_pendientes(request_id);
CREATE INDEX IF NOT EXISTS idx_pagos_pendientes_pedido_id ON pagos_pendientes(pedido_id);
CREATE INDEX IF NOT EXISTS idx_pagos_pendientes_estado ON pagos_pendientes(estado);
CREATE INDEX IF NOT EXISTS idx_pagos_pendientes_ultima_verificacion ON pagos_pendientes(ultima_verificacion);

-- Índice compuesto para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_pagos_pendientes_estado_verificacion 
  ON pagos_pendientes(estado, ultima_verificacion) 
  WHERE estado IN ('PENDING', 'PENDING_VALIDATION');

-- ========== POLÍTICAS RLS (Row Level Security) ==========
-- Habilitar RLS en la tabla
ALTER TABLE pagos_pendientes ENABLE ROW LEVEL SECURITY;

-- Política para que solo los administradores puedan ver los pagos pendientes
CREATE POLICY "Solo administradores pueden ver pagos pendientes"
  ON pagos_pendientes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'admin'
    )
  );

-- Política para permitir inserción desde la API (sin autenticación para el cronjob)
-- Esto permite que el sistema inserte registros cuando se crea una sesión de pago
CREATE POLICY "Sistema puede insertar pagos pendientes"
  ON pagos_pendientes
  FOR INSERT
  WITH CHECK (true);

-- Política para permitir actualización desde la API (sin autenticación para el cronjob)
CREATE POLICY "Sistema puede actualizar pagos pendientes"
  ON pagos_pendientes
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_pagos_pendientes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_pagos_pendientes_updated_at ON pagos_pendientes;
CREATE TRIGGER trigger_update_pagos_pendientes_updated_at
  BEFORE UPDATE ON pagos_pendientes
  FOR EACH ROW
  EXECUTE FUNCTION update_pagos_pendientes_updated_at();

-- Verificar que la tabla se creó correctamente
SELECT '✅ Tabla pagos_pendientes creada exitosamente' AS status;

-- Mostrar estructura de la tabla
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'pagos_pendientes'
ORDER BY ordinal_position;


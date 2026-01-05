-- Tabla opcional para registrar todas las notificaciones de pago recibidas de Evertec
-- Ejecuta este script en tu dashboard de Supabase en la sección SQL Editor
-- Esta tabla es útil para auditoría y debugging

-- ========== TABLA TRANSACCIONES_PAGO ==========
CREATE TABLE IF NOT EXISTS transacciones_pago (
  id SERIAL PRIMARY KEY,
  request_id VARCHAR(255) NOT NULL,
  referencia VARCHAR(255),
  estado VARCHAR(100),
  estado_fecha TIMESTAMP WITH TIME ZONE,
  datos_completos JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_transacciones_request_id ON transacciones_pago(request_id);
CREATE INDEX IF NOT EXISTS idx_transacciones_referencia ON transacciones_pago(referencia);
CREATE INDEX IF NOT EXISTS idx_transacciones_estado ON transacciones_pago(estado);
CREATE INDEX IF NOT EXISTS idx_transacciones_created_at ON transacciones_pago(created_at DESC);

-- Índice GIN para búsquedas en el JSONB
CREATE INDEX IF NOT EXISTS idx_transacciones_datos_completos ON transacciones_pago USING GIN (datos_completos);

-- ========== POLÍTICAS RLS (Row Level Security) ==========
-- Habilitar RLS en la tabla
ALTER TABLE transacciones_pago ENABLE ROW LEVEL SECURITY;

-- Política para que solo los administradores puedan ver las transacciones
-- Ajusta según tus necesidades de seguridad
CREATE POLICY "Solo administradores pueden ver transacciones"
  ON transacciones_pago
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id = auth.uid()
      AND usuarios.rol = 'admin'
    )
  );

-- Política para permitir inserción desde el webhook (sin autenticación)
-- Esto permite que el endpoint del webhook inserte registros
CREATE POLICY "Webhook puede insertar transacciones"
  ON transacciones_pago
  FOR INSERT
  WITH CHECK (true);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_transacciones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_transacciones_updated_at ON transacciones_pago;
CREATE TRIGGER trigger_update_transacciones_updated_at
  BEFORE UPDATE ON transacciones_pago
  FOR EACH ROW
  EXECUTE FUNCTION update_transacciones_updated_at();

-- Verificar que la tabla se creó correctamente
SELECT '✅ Tabla transacciones_pago creada exitosamente' AS status;

-- Mostrar estructura de la tabla
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'transacciones_pago'
ORDER BY ordinal_position;



-- Migración para agregar la columna updated_at a la tabla pedidos
-- Ejecuta este script en tu dashboard de Supabase en la sección SQL Editor

-- ========== AGREGAR COLUMNA updated_at ==========
-- Agregar la columna updated_at si no existe
ALTER TABLE public.pedidos 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Actualizar los registros existentes con la fecha actual
UPDATE public.pedidos 
SET updated_at = NOW() 
WHERE updated_at IS NULL;

-- ========== FUNCIÓN PARA ACTUALIZAR updated_at ==========
-- Crear función para actualizar automáticamente el campo updated_at
CREATE OR REPLACE FUNCTION update_pedidos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========== TRIGGER PARA ACTUALIZAR updated_at ==========
-- Eliminar el trigger si existe (por si acaso)
DROP TRIGGER IF EXISTS trigger_update_pedidos_updated_at ON public.pedidos;

-- Crear trigger para actualizar updated_at automáticamente
CREATE TRIGGER trigger_update_pedidos_updated_at
  BEFORE UPDATE ON public.pedidos
  FOR EACH ROW
  EXECUTE FUNCTION update_pedidos_updated_at();

-- ========== VERIFICACIÓN ==========
-- Verificar que la columna se agregó correctamente
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'pedidos' 
  AND column_name = 'updated_at';

-- Verificar que el trigger existe
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'pedidos'
  AND trigger_name = 'trigger_update_pedidos_updated_at';

SELECT '✅ Migración completada: Columna updated_at agregada a la tabla pedidos' AS status;

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

-- ========================================
-- NUEVAS TABLAS PARA SISTEMA DE VACANTES
-- ========================================

-- ========== TABLA DE TRABAJOS (Jobs) ==========

-- Crear tabla de trabajos/ofertas laborales
CREATE TABLE IF NOT EXISTS trabajos (
    id BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    departamento VARCHAR(255) NOT NULL,
    ubicacion VARCHAR(255) NOT NULL,
    tipo_contrato VARCHAR(100) NOT NULL, -- 'Tiempo completo', 'Medio tiempo', etc.
    salario VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    requisitos TEXT[], -- Array de requisitos
    beneficios TEXT[], -- Array de beneficios
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice para búsquedas por departamento y estado activo
CREATE INDEX IF NOT EXISTS idx_trabajos_departamento ON trabajos(departamento);
CREATE INDEX IF NOT EXISTS idx_trabajos_activo ON trabajos(activo);
CREATE INDEX IF NOT EXISTS idx_trabajos_fecha_creacion ON trabajos(fecha_creacion DESC);

-- ========== TABLA DE APLICACIONES (Applications) ==========

-- Crear tabla de aplicaciones a trabajos
CREATE TABLE IF NOT EXISTS aplicaciones (
    id BIGSERIAL PRIMARY KEY,
    trabajo_id BIGINT NOT NULL REFERENCES trabajos(id) ON DELETE CASCADE,
    nombre_aplicante VARCHAR(255) NOT NULL,
    email_aplicante VARCHAR(255) NOT NULL,
    telefono_aplicante VARCHAR(50) NOT NULL,
    experiencia_laboral VARCHAR(100), -- '0-1', '1-3', '3-5', '5+'
    disponibilidad VARCHAR(100), -- 'inmediata', '2-semanas', '1-mes', 'flexible'
    mensaje TEXT,
    cv_url TEXT, -- URL del archivo CV subido
    estado VARCHAR(50) DEFAULT 'pendiente', -- 'pendiente', 'revisando', 'aceptado', 'rechazado'
    fecha_aplicacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_revision TIMESTAMP WITH TIME ZONE,
    notas_revision TEXT -- Para comentarios internos del equipo de RRHH
);

-- Crear índices para búsquedas eficientes
CREATE INDEX IF NOT EXISTS idx_aplicaciones_trabajo_id ON aplicaciones(trabajo_id);
CREATE INDEX IF NOT EXISTS idx_aplicaciones_estado ON aplicaciones(estado);
CREATE INDEX IF NOT EXISTS idx_aplicaciones_fecha_aplicacion ON aplicaciones(fecha_aplicacion DESC);
CREATE INDEX IF NOT EXISTS idx_aplicaciones_email ON aplicaciones(email_aplicante);

-- ========== FUNCIONES TRIGGER ==========

-- Función para actualizar fecha_actualizacion en trabajos
CREATE OR REPLACE FUNCTION update_trabajos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para trabajos
CREATE TRIGGER trigger_trabajos_updated_at
    BEFORE UPDATE ON trabajos
    FOR EACH ROW
    EXECUTE FUNCTION update_trabajos_updated_at();

-- ========== DATOS DE EJEMPLO ==========

-- Insertar trabajos de ejemplo
INSERT INTO trabajos (titulo, departamento, ubicacion, tipo_contrato, salario, descripcion, requisitos, beneficios) VALUES
(
    'Vendedor/a de Mascotas',
    'Ventas',
    'Unisantander - Centro',
    'Tiempo completo',
    '€1,800 - €2,200 mensuales',
    'Buscamos vendedores apasionados por las mascotas para unirse a nuestro equipo. Experiencia en atención al cliente y conocimiento de productos para animales es un plus.',
    ARRAY[
        'Experiencia mínima de 1 año en ventas',
        'Pasión por las mascotas',
        'Excelentes habilidades de comunicación',
        'Disponibilidad para trabajar fines de semana'
    ],
    ARRAY[
        'Seguro médico privado',
        'Descuentos en productos',
        'Formación continua',
        'Ambiente de trabajo agradable'
    ]
),
(
    'Veterinario/a',
    'Salud Animal',
    'Unisantander - Todas las sucursales',
    'Medio tiempo',
    '€2,500 - €3,500 mensuales',
    'Profesional veterinario para brindar atención médica de calidad a las mascotas de nuestros clientes. Servicio de consulta y atención de emergencias.',
    ARRAY[
        'Título en Medicina Veterinaria',
        'Colegiado/a activo',
        'Experiencia mínima de 2 años',
        'Habilidades de comunicación excelentes'
    ],
    ARRAY[
        'Horario flexible',
        'Seguro médico completo',
        'Formación especializada',
        'Equipo multidisciplinario'
    ]
),
(
    'Peluquero/a Canino',
    'Estética Animal',
    'Unisantander - Norte',
    'Tiempo completo',
    '€1,600 - €2,000 mensuales',
    'Especialista en peluquería y estética canina. Realizar corte de pelo, baño, limpieza de oídos y uñas para mantener a las mascotas saludables y hermosas.',
    ARRAY[
        'Certificación en peluquería canina',
        'Experiencia mínima de 6 meses',
        'Paciencia y amor por los animales',
        'Habilidades manuales precisas'
    ],
    ARRAY[
        'Equipo de trabajo joven',
        'Clientes frecuentes',
        'Productos profesionales incluidos',
        'Posibilidad de crecimiento'
    ]
);

-- ========== CONSULTAS ÚTILES ==========

-- 1. Obtener todos los trabajos activos
-- SELECT * FROM trabajos WHERE activo = true ORDER BY fecha_creacion DESC;

-- 2. Obtener un trabajo específico por ID
-- SELECT * FROM trabajos WHERE id = 1;

-- 3. Buscar trabajos por departamento
-- SELECT * FROM trabajos WHERE departamento ILIKE '%ventas%' AND activo = true;

-- 4. Insertar una nueva aplicación (ejemplo)
-- INSERT INTO aplicaciones (trabajo_id, nombre_aplicante, email_aplicante, telefono_aplicante, experiencia_laboral, disponibilidad, mensaje, cv_url, estado)
-- VALUES (1, 'Juan Pérez', 'juan.perez@email.com', '+34 600 123 456', '1-3', 'inmediata', 'Me interesa mucho esta posición...', 'https://storage.supabase.co/cv/juan-perez-cv.pdf', 'pendiente');

-- 5. Obtener aplicaciones para un trabajo específico
-- SELECT a.*, t.titulo as puesto_solicitado, t.departamento
-- FROM aplicaciones a JOIN trabajos t ON a.trabajo_id = t.id
-- WHERE a.trabajo_id = 1 ORDER BY a.fecha_aplicacion DESC;

-- 6. Obtener aplicaciones por estado
-- SELECT * FROM aplicaciones WHERE estado = 'pendiente' ORDER BY fecha_aplicacion ASC;

-- 7. Actualizar estado de una aplicación
-- UPDATE aplicaciones SET estado = 'aceptado', fecha_revision = NOW(), notas_revision = 'Candidato seleccionado para entrevista' WHERE id = 1;

-- 8. Contar aplicaciones por estado
-- SELECT estado, COUNT(*) as total FROM aplicaciones GROUP BY estado;

-- 9. Buscar aplicaciones por email
-- SELECT * FROM aplicaciones WHERE email_aplicante = 'juan.perez@email.com';

-- 10. Trabajos con conteo de aplicaciones
-- SELECT t.*, COUNT(a.id) as total_aplicaciones, COUNT(CASE WHEN a.estado = 'pendiente' THEN 1 END) as aplicaciones_pendientes
-- FROM trabajos t LEFT JOIN aplicaciones a ON t.id = a.trabajo_id WHERE t.activo = true GROUP BY t.id ORDER BY t.fecha_creacion DESC;

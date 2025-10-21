-- Tabla para gestionar el contenido de la página Sobre Nosotros
CREATE TABLE IF NOT EXISTS sobre_nosotros (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  
  -- Banner principal
  banner_texto TEXT DEFAULT 'Comprometidos con la excelencia',
  
  -- Misión
  mision_titulo TEXT DEFAULT 'Misión',
  mision_parrafo1 TEXT DEFAULT 'Brindar productos agropecuarios y farmacéuticos de alta calidad, junto con asesoría técnica y profesional, para mejorar la productividad del campo y la salud de nuestras comunidades.',
  mision_parrafo2 TEXT DEFAULT 'Nos enfocamos en atender con responsabilidad social y cercanía a nuestros clientes, impulsando el desarrollo rural, el mejoramiento de la salud y el crecimiento sostenible en los territorios donde hacemos presencia.',
  
  -- Visión
  vision_titulo TEXT DEFAULT 'Visión',
  vision_parrafo1 TEXT DEFAULT 'En el 2028 Ser una empresa reconocida en varios departamentos de Colombia por ofrecer soluciones integrales en insumos agropecuarios y productos farmacéuticos, destacándonos por la calidad, el servicio humano y la cercanía con nuestras comunidades.',
  vision_parrafo2 TEXT DEFAULT 'Nos proyectamos como un aliado estratégico para el desarrollo del campo y la salud, comprometidos con la sostenibilidad, la innovación y el bienestar de las personas y productores en las regiones donde operamos.',
  
  -- Identidad Corporativa
  identidad_titulo TEXT DEFAULT 'Identidad Corporativa',
  identidad_banner_texto TEXT DEFAULT 'Nuestros valores en acción',
  valores_titulo TEXT DEFAULT 'Valores Corporativos',
  
  -- Valores (6 valores)
  valor1_titulo TEXT DEFAULT 'Trabajo en equipo',
  valor1_descripcion TEXT DEFAULT 'Fomentamos un entorno colaborativo donde el respeto, la comunicación y la diversidad de ideas permiten alcanzar objetivos comunes. Creemos que los mejores resultados se logran cuando trabajamos unidos.',
  
  valor2_titulo TEXT DEFAULT 'Transparencia',
  valor2_descripcion TEXT DEFAULT 'Nos conducimos con claridad, honestidad y apertura en todas nuestras interacciones. Creemos que una comunicación veraz fortalece la confianza y genera relaciones duraderas.',
  
  valor3_titulo TEXT DEFAULT 'Integridad',
  valor3_descripcion TEXT DEFAULT 'Actuamos con ética, coherencia y responsabilidad en cada decisión. Mantenemos nuestro compromiso con lo correcto, porque sabemos que la confianza se construye con hechos.',
  
  valor4_titulo TEXT DEFAULT 'Sostenibilidad',
  valor4_descripcion TEXT DEFAULT 'Trabajamos pensando en el largo plazo. Promovemos prácticas responsables con el medio ambiente, la sociedad y la economía, comprometidos con generar un impacto positivo.',
  
  valor5_titulo TEXT DEFAULT 'Responsabilidad',
  valor5_descripcion TEXT DEFAULT 'Asumimos nuestras acciones con seriedad y compromiso. Cumplimos lo que prometemos, respondemos por nuestros resultados y buscamos mejorar continuamente.',
  
  valor6_titulo TEXT DEFAULT 'Creatividad',
  valor6_descripcion TEXT DEFAULT 'Impulsamos la innovación como motor de transformación. Fomentamos un entorno donde las ideas nuevas son bienvenidas y la solución de problemas se aborda con originalidad.',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insertar registro inicial con valores por defecto
INSERT INTO sobre_nosotros (id) 
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- Habilitar RLS (Row Level Security)
ALTER TABLE sobre_nosotros ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
-- Permitir SELECT a todos (lectura pública)
CREATE POLICY "Permitir lectura pública de sobre_nosotros"
ON sobre_nosotros FOR SELECT
TO public
USING (true);

-- Permitir UPDATE solo a usuarios autenticados (administradores)
CREATE POLICY "Permitir actualización a usuarios autenticados"
ON sobre_nosotros FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_sobre_nosotros_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_sobre_nosotros_updated_at
BEFORE UPDATE ON sobre_nosotros
FOR EACH ROW
EXECUTE FUNCTION update_sobre_nosotros_updated_at();


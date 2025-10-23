-- Tabla para almacenar información de las tiendas
CREATE TABLE IF NOT EXISTS tiendas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  direccion VARCHAR(255) NOT NULL,
  ciudad VARCHAR(100) NOT NULL,
  telefono VARCHAR(50) NOT NULL,
  contacto VARCHAR(255) NOT NULL,
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_tiendas_ciudad ON tiendas(ciudad);
CREATE INDEX idx_tiendas_nombre ON tiendas(nombre);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_tiendas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE TRIGGER tiendas_updated_at_trigger
BEFORE UPDATE ON tiendas
FOR EACH ROW
EXECUTE FUNCTION update_tiendas_updated_at();

-- Insertar datos iniciales desde stores.ts
INSERT INTO tiendas (nombre, direccion, ciudad, telefono, contacto, lat, lng) VALUES
  ('Distribuidora PETS', 'Av. Q. seca 21 - 59', 'Bucaramanga', '3112777907', 'Marsheri Lozano', 7.1249, -73.1229),
  ('Veterinaria El Hato', 'Cl 29 #17 – 03', 'Bucaramanga', '3134957572', 'Ana Milena Suárez Poches', 7.1234, -73.1266),
  ('Veterinaria El Hato SEDE I', 'Cl 14 #10 - 14', 'San Gil', '3102370476', 'Francisco Javier Pinzón Lozano', 6.5550, -73.1349),
  ('Veterinaria El Hato SEDE II', 'Cl 14 #10 - 14', 'San Gil', '3202316426', 'Mauricio Bravo', 6.5546, -73.1354),
  ('Veterinaria El Hato SEDE III', 'Cr 17 #33 – 47 L 107', 'San Gil', '3134063139', 'Arturo Gomez Chaves', 6.5542, -73.1512),
  ('Veterinaria Servicampo', 'Cr 17 #12 – 93', 'Socorro', '3118478504', 'Sandra Milena Corzo Beltran', 6.4695, -73.2637),
  ('Veterinaria El Hato', 'Cr 9 #10 – 38', 'Oiba', '3138832796', 'Jose Luis Cruz Luna', 6.2654, -73.30024),
  ('Veterinaria Santander', 'Dg 30 #13 - 19', 'Saravena', '3118478552', 'Alba Capacho Peñaloza', 6.95816, -71.87576),
  ('Droguería Santander', 'Dg 30 #14 - 45', 'Saravena', '3102544596', 'Juan Francisco Lozano', 6.958249, -71.876493),
  ('Farmacenter I', 'Dg 30 #16 - 04', 'Saravena', '3212041398', 'Liliana Delgado', 6.9582, -71.8784),
  ('Farmacenter II', 'Cr 16A #20 – 03', 'Saravena', '3144645385', 'Lilibeth Fernandez', 6.9509, -71.8747),
  ('Veterinaria El Hato', 'Cl 7 #12 – 91', 'Fortul', '3134068190', 'Anderson Daza', 6.798995, -71.76793),
  ('Droguería El Paisano', 'Cl 7 #24 - 32', 'Fortul', '3105640915', 'Carlos Aconcha', 6.7911, -71.7745),
  ('Veterinaria El Hato', 'Cr 14 #13 – 55', 'Tame', '3123023124', 'Javier Abril Portilla', 6.4606977, -71.7304),
  ('Veterinaria Santander', 'Cr 15 #13 – 68', 'Tame', '3118599045', 'Yimmy Brijaldo', 6.460286, -71.73121)
ON CONFLICT DO NOTHING;

-- Habilitar RLS (Row Level Security)
ALTER TABLE tiendas ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura a todos
CREATE POLICY "Las tiendas son visibles para todos"
  ON tiendas FOR SELECT
  TO authenticated, anon
  USING (true);

-- Política para permitir inserción solo a usuarios autenticados
CREATE POLICY "Solo usuarios autenticados pueden insertar tiendas"
  ON tiendas FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política para permitir actualización solo a usuarios autenticados
CREATE POLICY "Solo usuarios autenticados pueden actualizar tiendas"
  ON tiendas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política para permitir eliminación solo a usuarios autenticados
CREATE POLICY "Solo usuarios autenticados pueden eliminar tiendas"
  ON tiendas FOR DELETE
  TO authenticated
  USING (true);


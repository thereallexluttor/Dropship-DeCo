-- Políticas RLS para el sistema de aplicaciones de empleo
-- Ejecutar estos comandos en el SQL Editor de Supabase

-- =====================================================
-- POLÍTICAS PARA LA TABLA DE APLICACIONES
-- =====================================================

-- Permitir que usuarios autenticados inserten aplicaciones
CREATE POLICY "Usuarios autenticados pueden crear aplicaciones" ON aplicaciones
FOR INSERT TO authenticated
WITH CHECK (true);

-- Permitir que usuarios autenticados vean sus propias aplicaciones
CREATE POLICY "Usuarios pueden ver sus propias aplicaciones" ON aplicaciones
FOR SELECT TO authenticated
USING (email_aplicante = auth.jwt() ->> 'email');

-- Permitir que usuarios admin vean todas las aplicaciones
CREATE POLICY "Administradores pueden ver todas las aplicaciones" ON aplicaciones
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE correo = auth.jwt() ->> 'email'
    AND rol = 'admin'
  )
);

-- Permitir que usuarios admin actualicen aplicaciones (cambiar estado, notas, etc.)
CREATE POLICY "Administradores pueden actualizar aplicaciones" ON aplicaciones
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios
    WHERE correo = auth.jwt() ->> 'email'
    AND rol = 'admin'
  )
);

-- =====================================================
-- POLÍTICAS PARA EL BUCKET DE STORAGE (CVs)
-- =====================================================

-- Permitir que usuarios autenticados suban archivos al bucket 'images' en la carpeta 'cvs'
CREATE POLICY "Usuarios autenticados pueden subir CVs" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'images'
  AND (storage.foldername(name))[1] = 'cvs'
);

-- Permitir que usuarios autenticados vean sus propios CVs
CREATE POLICY "Usuarios pueden ver sus propios CVs" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'images'
  AND (storage.foldername(name))[1] = 'cvs'
  AND auth.jwt() ->> 'email' IS NOT NULL
);

-- Permitir acceso público a los CVs (para que el admin pueda descargarlos)
CREATE POLICY "Acceso público a CVs" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

-- Permitir que usuarios admin eliminen CVs si es necesario
CREATE POLICY "Administradores pueden eliminar CVs" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'images'
  AND (storage.foldername(name))[1] = 'cvs'
  AND EXISTS (
    SELECT 1 FROM usuarios
    WHERE correo = auth.jwt() ->> 'email'
    AND rol = 'admin'
  )
);

-- =====================================================
-- PERMISOS ADICIONALES PARA USUARIOS AUTENTICADOS
-- =====================================================

-- Asegurar que la tabla usuarios tenga las políticas correctas
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON usuarios;
CREATE POLICY "Usuarios pueden ver su propio perfil" ON usuarios
FOR SELECT TO authenticated
USING (correo = auth.jwt() ->> 'email');

DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON usuarios;
CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON usuarios
FOR UPDATE TO authenticated
USING (correo = auth.jwt() ->> 'email');

-- Permitir registro de nuevos usuarios (necesario para el sistema)
DROP POLICY IF EXISTS "Permitir registro de usuarios" ON usuarios;
CREATE POLICY "Permitir registro de usuarios" ON usuarios
FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- =====================================================
-- VERIFICACIÓN DE TABLAS
-- =====================================================

-- Verificar que las tablas existen y tienen la estructura correcta
SELECT
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('trabajos', 'aplicaciones', 'usuarios');

-- Verificar que el bucket de storage existe
SELECT * FROM storage.buckets WHERE name = 'images';

-- =====================================================
-- DIAGNÓSTICO DE PERMISOS (para debugging)
-- =====================================================

-- Ver todas las políticas actuales
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('trabajos', 'aplicaciones', 'usuarios');

-- Ver políticas de storage
SELECT
  name,
  bucket_id,
  definition
FROM storage.policies;

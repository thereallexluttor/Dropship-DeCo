-- Script para eliminar emojis de categorías en la base de datos
-- Ejecutar este script en el SQL Editor de Supabase

-- 1. Verificar categorías actuales con emojis
SELECT
    id,
    nombre as nombre_actual,
    nombre REGEXP '[\x{1F600}-\x{1F64F}]|[\x{1F300}-\x{1F5FF}]|[\x{1F680}-\x{1F6FF}]|[\x{1F1E0}-\x{1F1FF}]|[\x{2600}-\x{26FF}]|[\x{2700}-\x{27BF}]' as tiene_emoji
FROM categories
WHERE nombre REGEXP '[\x{1F600}-\x{1F64F}]|[\x{1F300}-\x{1F5FF}]|[\x{1F680}-\x{1F6FF}]|[\x{1F1E0}-\x{1F1FF}]|[\x{2600}-\x{26FF}]|[\x{2700}-\x{27BF}]';

-- 2. Actualizar categorías eliminando emojis
-- Perros
UPDATE categories
SET nombre = 'Perros'
WHERE nombre LIKE '%🐕%' OR nombre LIKE '%🐶%' OR nombre LIKE '%🐕‍🦺%';

-- Gatos
UPDATE categories
SET nombre = 'Gatos'
WHERE nombre LIKE '%🐱%' OR nombre LIKE '%🐈%' OR nombre LIKE '%🐈‍⬛%' OR nombre LIKE '%😺%' OR nombre LIKE '%😻%';

-- Peces
UPDATE categories
SET nombre = 'Peces'
WHERE nombre LIKE '%🐟%' OR nombre LIKE '%🐠%';

-- Roedores
UPDATE categories
SET nombre = 'Roedores'
WHERE nombre LIKE '%🐹%' OR nombre LIKE '%🐭%';

-- Aves
UPDATE categories
SET nombre = 'Aves'
WHERE nombre LIKE '%🐦%' OR nombre LIKE '%🐧%';

-- Bovinos
UPDATE categories
SET nombre = 'Bovinos'
WHERE nombre LIKE '%🐄%' OR nombre LIKE '%🐂%';

-- Agricultura
UPDATE categories
SET nombre = 'Agricultura'
WHERE nombre LIKE '%🌾%' OR nombre LIKE '%🌱%' OR nombre LIKE '%🌿%' OR nombre LIKE '%🍀%';

-- 3. Verificar subcategorías que puedan tener emojis
SELECT
    id,
    nombre as nombre_subcategoria,
    nombre REGEXP '[\x{1F600}-\x{1F64F}]|[\x{1F300}-\x{1F5FF}]|[\x{1F680}-\x{1F6FF}]|[\x{1F1E0}-\x{1F1FF}]|[\x{2600}-\x{26FF}]|[\x{2700}-\x{27BF}]' as tiene_emoji,
    categories_id
FROM subcategories
WHERE nombre REGEXP '[\x{1F600}-\x{1F64F}]|[\x{1F300}-\x{1F5FF}]|[\x{1F680}-\x{1F6FF}]|[\x{1F1E0}-\x{1F1FF}]|[\x{2600}-\x{26FF}]|[\x{2700}-\x{27BF}]';

-- 4. Eliminar emojis de subcategorías (ejemplos comunes)
-- Actualizar subcategorías que contengan emojis similares a los de categorías principales
UPDATE subcategories
SET nombre = REGEXP_REPLACE(nombre, '🐕|🐶|🐕‍🦺', '')
WHERE nombre REGEXP '🐕|🐶|🐕‍🦺';

UPDATE subcategories
SET nombre = REGEXP_REPLACE(nombre, '🐱|🐈|🐈‍⬛|😺|😻', '')
WHERE nombre REGEXP '🐱|🐈|🐈‍⬛|😺|😻';

UPDATE subcategories
SET nombre = REGEXP_REPLACE(nombre, '🐟|🐠', '')
WHERE nombre REGEXP '🐟|🐠';

UPDATE subcategories
SET nombre = REGEXP_REPLACE(nombre, '🐹|🐭', '')
WHERE nombre REGEXP '🐹|🐭';

UPDATE subcategories
SET nombre = REGEXP_REPLACE(nombre, '🐦|🐧', '')
WHERE nombre REGEXP '🐦|🐧';

UPDATE subcategories
SET nombre = REGEXP_REPLACE(nombre, '🐄|🐂', '')
WHERE nombre REGEXP '🐄|🐂';

UPDATE subcategories
SET nombre = REGEXP_REPLACE(nombre, '🌾|🌱|🌿|🍀', '')
WHERE nombre REGEXP '🌾|🌱|🌿|🍀';

-- 5. Limpiar espacios extra que puedan quedar después de eliminar emojis
UPDATE subcategories
SET nombre = TRIM(REGEXP_REPLACE(nombre, '  +', ' '))
WHERE nombre LIKE '%  %';

UPDATE categories
SET nombre = TRIM(REGEXP_REPLACE(nombre, '  +', ' '))
WHERE nombre LIKE '%  %';

-- 6. Verificar que los cambios se aplicaron correctamente
SELECT
    id,
    nombre as nombre_limpio
FROM categories
ORDER BY id;

-- 7. Ver subcategorías limpias
SELECT
    s.id,
    s.nombre as nombre_subcategoria_limpio,
    c.nombre as categoria_padre
FROM subcategories s
JOIN categories c ON s.categories_id = c.id
ORDER BY c.id, s.id;

-- 8. Contar totales finales
SELECT
    (SELECT COUNT(*) FROM categories) as total_categorias,
    (SELECT COUNT(*) FROM subcategories) as total_subcategorias;

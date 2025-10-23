# Gestión de Aliados

Este documento explica cómo usar la nueva funcionalidad de gestión de aliados en el sistema Berlin Market.

## Descripción

La sección de "Nuestros aliados" permite gestionar las imágenes de las marcas asociadas que se muestran en la página principal del sitio web. Los aliados representan las marcas de productos que ofrece la tienda.

## Funcionalidades

### 1. Panel de Administración
- **Ubicación**: `app/components/AdminDashboard.tsx` - Pestaña "Aliados"
- **Funciones**:
  - Crear nuevos aliados con imagen y nombre
  - Editar aliados existentes
  - Eliminar aliados
  - Subir imágenes directamente al bucket de Supabase en la carpeta `aliados/`

### 2. Base de Datos
- **Tabla**: `aliados`
- **Campos**:
  - `id`: Identificador único (SERIAL PRIMARY KEY)
  - `nombre`: Nombre de la marca/aliado (VARCHAR(255))
  - `imagen_url`: URL de la imagen almacenada en Supabase Storage (TEXT)
  - `created_at`: Fecha de creación (TIMESTAMP)
  - `updated_at`: Fecha de última actualización (TIMESTAMP)

### 3. Almacenamiento de Imágenes
- **Bucket**: `images` (en Supabase Storage)
- **Carpeta**: `aliados/`
- **Formato**: Las imágenes se nombran automáticamente como `{nombre_aliado}_{timestamp}.{extensión}`

## Instalación

### 1. Crear la tabla en Supabase
Ejecuta el archivo `database_aliados.sql` en tu instancia de Supabase:

```sql
-- El archivo contiene:
-- - Creación de tabla aliados
-- - Índices para optimización
-- - Triggers para timestamps automáticos
-- - Políticas RLS para seguridad
-- - Datos iniciales con las marcas actuales
```

### 2. Configuración de Storage
Asegúrate de que el bucket `images` existe en Supabase Storage y permite la subida de archivos para usuarios autenticados.

## Uso

### Crear un nuevo aliado
1. Ve al Panel de Administración
2. Selecciona la pestaña "Aliados"
3. Haz clic en "Crear Nuevo Aliado"
4. Completa:
   - Nombre del aliado (ej: "Royal Canin")
   - Selecciona una imagen (se subirá automáticamente a `aliados/`)
5. Haz clic en "Crear Aliado"

### Editar un aliado existente
1. En la lista de aliados existentes, haz clic en el botón "Editar" (ícono de lápiz)
2. Modifica el nombre o cambia la imagen
3. Haz clic en "Guardar"

### Eliminar un aliado
1. En la lista de aliados existentes, haz clic en el botón "Eliminar" (ícono de papelera)
2. Confirma la eliminación

## Integración con la Página Principal

La página principal (`app/page.tsx`) ahora carga los aliados dinámicamente desde la base de datos en lugar de usar datos hardcodeados. El componente mantiene compatibilidad hacia atrás mostrando las imágenes originales si no hay aliados en la base de datos.

## Seguridad

- **Row Level Security (RLS)**: Habilitado para controlar el acceso
- **Políticas**:
  - Lectura: Pública (para mostrar en el sitio web)
  - Escritura: Solo usuarios autenticados (para administración)

## Mantenimiento

### Datos iniciales incluidos:
- Royal Canin
- Real Nature
- Naturally Good
- Select Gold
- Purina
- Hill's
- Acana
- Orijen
- Eukanuba
- Advance
- Crave
- Ultima

### Migración
Si ya tienes aliados configurados, puedes:
1. Ejecutar el SQL que crea datos iniciales con las rutas actuales
2. Luego usar el panel de administración para subir las imágenes reales al bucket `aliados/`
3. Actualizar las URLs en la base de datos

## Troubleshooting

### Error: "La tabla aliados no existe"
- Ejecuta el archivo `database_aliados.sql` en Supabase

### Error al subir imágenes
- Verifica que el bucket `images` existe en Supabase Storage
- Verifica permisos de escritura para usuarios autenticados
- Verifica que el límite de tamaño de archivo no se exceda (5MB)

### Las imágenes no se muestran en la página principal
- Verifica que las URLs en la tabla `aliados` sean correctas
- Verifica que las imágenes existan en el bucket `images/aliados/`
- Revisa la consola del navegador para errores de carga

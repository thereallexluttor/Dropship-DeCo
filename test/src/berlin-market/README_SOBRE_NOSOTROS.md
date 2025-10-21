# Funcionalidad de Edición de "Sobre Nosotros"

## 📋 Resumen

Se ha implementado una funcionalidad completa para hacer editable el contenido de la página "Sobre Nosotros" desde el Panel de Administración. Ahora puedes modificar todos los textos de misión, visión, valores corporativos y más sin tocar código.

## 🎯 Características

- ✅ Edición de todos los textos de la página "Sobre Nosotros"
- ✅ Guardado persistente en Supabase
- ✅ Interfaz de edición en el AdminDashboard
- ✅ Organización en categorías: "Inicio" (Banners/Popups) y "Sobre Nosotros"
- ✅ Valores por defecto si no hay datos en la base de datos

## 📂 Archivos Modificados

### 1. Base de Datos
- **`database_sobre_nosotros.sql`** - Nuevo archivo con la estructura de la tabla

### 2. Backend/Tipos
- **`lib/supabase.ts`** - Agregado tipo `SobreNosotros`

### 3. Componentes
- **`app/components/AdminDashboard.tsx`** - Agregada sección de edición en pestaña UI
- **`app/sobre-nosotros/page.tsx`** - Actualizada para leer datos de Supabase

## 🚀 Instalación y Configuración

### Paso 1: Ejecutar el SQL en Supabase

1. Abre tu proyecto en [Supabase](https://supabase.com)
2. Ve a **SQL Editor**
3. Copia y pega el contenido del archivo `database_sobre_nosotros.sql`
4. Ejecuta el script (botón "Run")

Esto creará:
- La tabla `sobre_nosotros` con todos los campos necesarios
- Un registro inicial con los valores por defecto actuales
- Políticas de seguridad RLS (lectura pública, escritura solo para autenticados)

### Paso 2: Verificar la Instalación

1. Ve a **Table Editor** en Supabase
2. Busca la tabla `sobre_nosotros`
3. Deberías ver 1 registro con ID = 1 y todos los textos por defecto

## 📝 Cómo Usar

### Editar Contenido desde el Admin Dashboard

1. Ve al Panel de Administración de tu aplicación
2. Haz clic en la pestaña **"UI"**
3. Verás dos botones en la parte superior:
   - **"Inicio (Banners y Popups)"** - Para gestionar banners, videos y popups
   - **"Sobre Nosotros"** - Para editar textos de la página Sobre Nosotros
4. Haz clic en **"Sobre Nosotros"**
5. Haz clic en el botón **"Editar Contenido"**
6. Modifica los textos que desees:
   - Banner principal
   - Misión (título y 2 párrafos)
   - Visión (título y 2 párrafos)
   - Identidad Corporativa (título, banner y valores)
   - 6 Valores Corporativos (cada uno con título y descripción)
7. Haz clic en **"Guardar Cambios"**
8. Los cambios se reflejarán inmediatamente en la página "Sobre Nosotros"

## 📊 Estructura de Datos

La tabla `sobre_nosotros` contiene los siguientes campos:

### Banner Principal
- `banner_texto` - Texto que aparece sobre el video principal

### Misión
- `mision_titulo` - Título de la sección
- `mision_parrafo1` - Primer párrafo
- `mision_parrafo2` - Segundo párrafo

### Visión
- `vision_titulo` - Título de la sección
- `vision_parrafo1` - Primer párrafo
- `vision_parrafo2` - Segundo párrafo

### Identidad Corporativa
- `identidad_titulo` - Título principal
- `identidad_banner_texto` - Texto sobre el video secundario
- `valores_titulo` - Título de la sección de valores

### Valores Corporativos (6 valores)
Para cada valor (1-6):
- `valorN_titulo` - Título del valor
- `valorN_descripcion` - Descripción del valor

## 🔒 Seguridad

La tabla tiene configuradas las siguientes políticas de RLS:

- **Lectura pública**: Cualquiera puede ver el contenido
- **Escritura autenticada**: Solo usuarios autenticados pueden editar

Esto garantiza que el contenido sea visible para todos los visitantes, pero solo los administradores pueden modificarlo.

## 🎨 Personalización

### Agregar Más Campos

Si necesitas agregar más campos editables:

1. Agrega el campo a la tabla en Supabase:
```sql
ALTER TABLE sobre_nosotros 
ADD COLUMN nuevo_campo TEXT DEFAULT 'Valor por defecto';
```

2. Actualiza el tipo en `lib/supabase.ts`:
```typescript
export interface SobreNosotros {
  // ... campos existentes
  nuevo_campo?: string
}
```

3. Agrega el campo en el formulario de edición en `AdminDashboard.tsx`
4. Usa el campo en la página `sobre-nosotros/page.tsx`

## 🐛 Solución de Problemas

### La página muestra valores por defecto en lugar de los editados

**Causa**: La tabla no existe o no tiene datos

**Solución**:
1. Verifica que ejecutaste el archivo `database_sobre_nosotros.sql`
2. Verifica que existe el registro con `id = 1`
3. Revisa la consola del navegador para ver errores

### No puedo guardar cambios

**Causa**: Problemas de permisos o autenticación

**Solución**:
1. Verifica que estás autenticado como administrador
2. Revisa las políticas RLS en Supabase
3. Verifica la consola del navegador para errores específicos

### Los cambios no se reflejan inmediatamente

**Causa**: Cache del navegador

**Solución**:
1. Recarga la página con Ctrl+F5 (o Cmd+Shift+R en Mac)
2. Limpia el cache del navegador
3. Verifica que los cambios se guardaron en Supabase (Table Editor)

## 📖 Notas Adicionales

- Los valores por defecto están hardcodeados en `sobre-nosotros/page.tsx` como fallback
- Si la tabla no existe, la página mostrará los valores por defecto
- Los cambios son instantáneos y no requieren rebuild de la aplicación
- Solo hay UN registro en la tabla (ID = 1) que contiene todo el contenido

## ✨ Mejoras Futuras

Posibles mejoras que se pueden implementar:

1. **Múltiples idiomas**: Agregar soporte para español e inglés
2. **Historial de cambios**: Guardar versiones anteriores del contenido
3. **Preview en vivo**: Ver cambios antes de guardarlos
4. **Editor WYSIWYG**: Editor de texto enriquecido para formatear mejor
5. **Más valores**: Permitir agregar/eliminar valores dinámicamente

---

**Fecha de creación**: Octubre 2025  
**Versión**: 1.0.0


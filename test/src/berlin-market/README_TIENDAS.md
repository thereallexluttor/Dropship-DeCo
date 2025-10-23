# Gestión de Tiendas - Unisantander

## Descripción

Sistema de gestión de tiendas que permite administrar la información de todas las tiendas de Unisantander desde el panel de administración. Los datos se almacenan en Supabase y se cargan dinámicamente en el mapa de ubicaciones.

## Configuración de la Base de Datos

### 1. Ejecutar el Script SQL

Ejecuta el archivo `database_tiendas.sql` en tu proyecto de Supabase:

1. Ve a tu proyecto en [Supabase](https://supabase.com)
2. Navega a la sección **SQL Editor**
3. Crea una nueva query
4. Copia y pega el contenido de `database_tiendas.sql`
5. Ejecuta la query

Esto creará:
- La tabla `tiendas` con todos los campos necesarios
- Índices para mejorar el rendimiento
- Políticas de seguridad (RLS)
- Datos iniciales de las 15 tiendas existentes

### 2. Estructura de la Tabla

```sql
CREATE TABLE tiendas (
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
```

## Uso del Panel de Administración

### Acceder a la Pestaña Tiendas

1. Inicia sesión en el panel de administración
2. Navega a la pestaña **"Tiendas"** (icono de MapPin)

### Crear una Nueva Tienda

1. Completa el formulario con la información requerida:
   - **Nombre de la Tienda**: Ej. "Veterinaria El Hato"
   - **Ciudad**: Ej. "Bucaramanga"
   - **Dirección**: Ej. "Av. Q. seca 21 - 59"
   - **Teléfono**: Ej. "3112777907"
   - **Nombre de Contacto**: Ej. "Marsheri Lozano"
   - **Latitud (GPS)**: Ej. "7.1249"
   - **Longitud (GPS)**: Ej. "-73.1229"

2. Haz clic en **"Crear Tienda"**

#### Obtener Coordenadas GPS

Para obtener las coordenadas GPS de una ubicación:

1. Ve a [Google Maps](https://maps.google.com)
2. Busca la dirección de la tienda
3. Haz clic derecho en el marcador
4. Selecciona las coordenadas que aparecen en el menú
5. Copia y pega en los campos de Latitud y Longitud

### Editar una Tienda Existente

1. En la lista de tiendas existentes, haz clic en el botón **"Editar"** (icono de lápiz)
2. Modifica los campos que desees actualizar
3. Haz clic en **"Guardar"** para aplicar los cambios
4. O haz clic en **"Cancelar"** para descartar los cambios

### Eliminar una Tienda

1. En la lista de tiendas existentes, haz clic en el botón **"Eliminar"** (icono de basura)
2. Confirma la eliminación en el diálogo que aparece
3. La tienda será eliminada de la base de datos

## Visualización en el Mapa

Las tiendas se cargan automáticamente desde Supabase en:

- **Página de Inicio**: Mapa de tiendas
- **Componente StoreLocator**: Selector de tiendas con mapa interactivo

### Actualización Automática

Cuando editas, creas o eliminas una tienda desde el panel de administración, los cambios se reflejan automáticamente en:

1. El mapa de ubicaciones
2. El selector de tiendas
3. La lista de ciudades disponibles

## Características

### Funcionalidades Implementadas

✅ **CRUD Completo**: Crear, leer, actualizar y eliminar tiendas
✅ **Validación de Datos**: Campos requeridos y validación de coordenadas GPS
✅ **Ordenamiento**: Las tiendas se ordenan por ciudad y nombre
✅ **Integración con Mapa**: Los cambios se reflejan en tiempo real en el mapa
✅ **Datos de Respaldo**: Sistema de fallback si Supabase no está disponible
✅ **Políticas de Seguridad**: Row Level Security (RLS) configurado

### Información Almacenada

Para cada tienda se guarda:
- Nombre de la tienda
- Dirección completa
- Ciudad
- Número de teléfono
- Nombre del contacto
- Coordenadas GPS (latitud y longitud)
- Fechas de creación y actualización

## Archivos Modificados

### Backend/Base de Datos
- `database_tiendas.sql` - Script de creación de tabla e inserción de datos
- `lib/supabase.ts` - Tipo TypeScript para Tienda

### Componentes
- `app/components/AdminDashboard.tsx` - Pestaña de gestión de tiendas
- `app/components/StoreLocator.tsx` - Carga dinámica desde Supabase
- `app/lib/stores.ts` - Función de carga desde Supabase

### Tipos TypeScript

```typescript
export interface Tienda {
  id?: number
  nombre: string
  direccion: string
  ciudad: string
  telefono: string
  contacto: string
  lat: number
  lng: number
  created_at?: string
  updated_at?: string
}
```

## Solución de Problemas

### La tabla no existe

Si recibes un error indicando que la tabla `tiendas` no existe:

1. Verifica que ejecutaste el script `database_tiendas.sql` en Supabase
2. Confirma que estás conectado al proyecto correcto de Supabase
3. Revisa las credenciales en `.env.local`

### Las coordenadas GPS no funcionan

- Asegúrate de usar el formato decimal (Ej: 7.1249, no 7° 7' 29.64" N)
- La latitud debe estar entre -90 y 90
- La longitud debe estar entre -180 y 180
- Usa punto (.) como separador decimal, no coma (,)

### Los cambios no se reflejan en el mapa

1. Recarga la página completamente (Ctrl+F5 o Cmd+Shift+R)
2. Verifica que no haya errores en la consola del navegador
3. Confirma que la tienda se guardó correctamente en Supabase

## Próximas Mejoras

- [ ] Subir imágenes de las tiendas
- [ ] Horarios de atención
- [ ] Servicios disponibles por tienda
- [ ] Búsqueda y filtrado avanzado
- [ ] Exportar lista de tiendas a CSV/Excel
- [ ] Importación masiva de tiendas

## Soporte

Para preguntas o problemas, contacta al equipo de desarrollo.


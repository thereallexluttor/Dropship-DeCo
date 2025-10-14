# Configuración de Supabase

Para que el sistema de autenticación funcione correctamente, necesitas configurar las siguientes variables de entorno:

## Variables de entorno requeridas

1. `NEXT_PUBLIC_SUPABASE_URL` - La URL de tu proyecto de Supabase
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` - La clave anónima de tu proyecto de Supabase

## Cómo obtener estas variables

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. En el menú lateral, haz clic en "Settings" > "API"
3. Copia la "Project URL" y "anon/public" key

## Configuración en producción

Crea un archivo `.env.local` en la raíz del proyecto con:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Base de datos

Asegúrate de tener las siguientes tablas configuradas:

### Tabla `usuarios`

```sql
CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  correo VARCHAR(255) UNIQUE NOT NULL,
  telefono VARCHAR(50) NOT NULL,
  direccion TEXT NOT NULL,
  rol VARCHAR(50) DEFAULT 'cliente',
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabla `categories`

```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabla `subcategories`

```sql
CREATE TABLE subcategories (
  id SERIAL PRIMARY KEY,
  categorias_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabla `productos`

```sql
CREATE TABLE productos (
  id SERIAL PRIMARY KEY,
  subcategorias_id INTEGER NOT NULL REFERENCES subcategories(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  imagen_url TEXT,
  descuento BOOLEAN DEFAULT FALSE,
  descuento_valor DECIMAL(5,2) DEFAULT 0,
  destacado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Configuración del Bucket de Storage para Imágenes

Para habilitar la subida de imágenes de productos:

1. En tu proyecto de Supabase, ve a "Storage" en el menú lateral
2. Crea un nuevo bucket llamado "images" (o usa uno existente)
3. En la configuración del bucket, asegúrate de que:
   - "Allow public access" esté habilitado
   - Las políticas de acceso permitan subir archivos desde tu aplicación

### Políticas de Storage recomendadas:

```sql
-- Política para permitir que usuarios autenticados suban archivos
CREATE POLICY "Allow authenticated users to upload images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'images');

-- Política para permitir acceso público a las imágenes
CREATE POLICY "Allow public access to images" ON storage.objects
FOR SELECT USING (bucket_id = 'images');
```

## Configuración de Email Confirmation

Para habilitar el envío de emails de confirmación:

1. En tu proyecto de Supabase, ve a "Authentication" > "Settings"
2. En "Email Confirmation", selecciona "Enable email confirmations"
3. Configura el "Redirect URL" apuntando a tu dominio (ej: `https://your-domain.com/auth/callback`)

## Características implementadas

### Autenticación y Usuarios
✅ Formulario de registro con validación
✅ Inicio de sesión con autenticación
✅ Envío automático de email de confirmación
✅ Guardado de datos adicionales en tabla personalizada
✅ Toggle entre formularios de login/registro
✅ Validación de contraseñas coincidentes
✅ Indicadores de carga durante procesos

### Sistema de Roles y Administración
✅ Sistema de roles (cliente/admin) en usuarios
✅ Dashboard administrativo para usuarios con rol "admin"
✅ Gestión completa de categorías (CRUD)
✅ Gestión completa de subcategorías (CRUD)
✅ Gestión completa de productos (CRUD)
✅ Navegación condicional según rol del usuario

### Gestión de Productos e Imágenes
✅ Gestión completa de productos (CRUD)
✅ Subida automática de imágenes locales al bucket de Supabase
✅ Generación automática de URLs públicas para imágenes
✅ Validación de archivos de imagen (tipo y tamaño)
✅ Preview de imágenes seleccionadas
✅ Gestión de categorías y subcategorías

### Diseño y UX
✅ Header y Footer reutilizables
✅ Diseño responsivo completo
✅ Banner promocional animado
✅ Navegación consistente en todas las páginas

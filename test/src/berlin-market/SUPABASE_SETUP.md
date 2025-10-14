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
✅ Navegación condicional según rol del usuario

### Diseño y UX
✅ Header y Footer reutilizables
✅ Diseño responsivo completo
✅ Banner promocional animado
✅ Navegación consistente en todas las páginas

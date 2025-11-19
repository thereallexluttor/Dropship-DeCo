# 📐 ANÁLISIS TÉCNICO Y ARQUITECTURA
## BERLIN MARKET - Plataforma de Gestión Comercial

### Documento Técnico para Stakeholders y Desarrolladores

---

## 📋 TABLA DE CONTENIDOS

1. [Arquitectura General](#arquitectura-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Componentes Principales](#componentes-principales)
5. [Base de Datos](#base-de-datos)
6. [APIs y Servicios](#apis-y-servicios)
7. [Seguridad](#seguridad)
8. [Rendimiento y Escalabilidad](#rendimiento-y-escalabilidad)
9. [Puntos de Extensión](#puntos-de-extensión)
10. [Roadmap Técnico](#roadmap-técnico)

---

## 🏗️ ARQUITECTURA GENERAL

### Visión General

BERLIN MARKET está construida sobre una arquitectura moderna de **aplicación web full-stack** utilizando Next.js 14 con App Router, lo que permite:

- **Server-Side Rendering (SSR)**: Para SEO y rendimiento inicial
- **Static Site Generation (SSG)**: Para páginas estáticas de alto rendimiento
- **API Routes**: Para lógica de backend integrada
- **Client-Side Rendering (CSR)**: Para interactividad dinámica

### Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE (Browser)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Desktop    │  │   Tablet     │  │   Mobile     │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼──────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                    ┌────────▼────────┐
                    │   Next.js 14    │
                    │  (Vercel/Edge)  │
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
    ┌─────▼─────┐    ┌───────▼──────┐   ┌──────▼─────┐
    │  Supabase │    │   Resend     │   │  Storage   │
    │   (DB)    │    │   (Email)    │   │  (Images)  │
    └───────────┘    └──────────────┘   └────────────┘
```

### Flujo de Datos

1. **Cliente** → Solicita página/producto
2. **Next.js** → Renderiza página (SSR/SSG)
3. **Supabase** → Proporciona datos (productos, usuarios, pedidos)
4. **Next.js** → Envía HTML renderizado al cliente
5. **Cliente** → Interactúa (añade al carrito, realiza pedido)
6. **Next.js API Routes** → Procesa acciones
7. **Supabase** → Actualiza base de datos
8. **Resend** → Envía notificaciones por email

---

## 🛠️ STACK TECNOLÓGICO

### Frontend

#### Framework Principal
- **Next.js 14.2.24**: Framework React con App Router
  - Server Components para rendimiento
  - Client Components para interactividad
  - Image Optimization automática
  - API Routes integradas

#### Librerías Core
- **React 18**: Biblioteca UI con hooks modernos
- **TypeScript 5**: Tipado estático para seguridad de tipos
- **Tailwind CSS 3.4**: Framework CSS utility-first
- **Framer Motion 12.4**: Animaciones fluidas

#### Componentes UI
- **shadcn/ui**: Componentes accesibles y personalizables
- **Radix UI**: Primitivos UI sin estilos
- **Lucide React**: Iconos modernos
- **Recharts 2.15**: Gráficos y visualizaciones

#### Estado y Datos
- **React Context API**: Estado global (carrito, categorías)
- **React Hooks**: Custom hooks para lógica reutilizable
- **Supabase Client**: Cliente oficial para backend

### Backend

#### Base de Datos
- **Supabase (PostgreSQL)**: Base de datos relacional
  - Row Level Security (RLS) para seguridad
  - Funciones almacenadas (RPC)
  - Real-time subscriptions
  - Full-text search

#### Servicios Externos
- **Resend**: Servicio de emails transaccionales
- **Supabase Storage**: Almacenamiento de imágenes
- **Next.js Image Optimization**: Optimización de imágenes

### Herramientas de Desarrollo

- **Vite**: Bundler rápido (usado por Next.js internamente)
- **ESLint**: Linter para calidad de código
- **TypeScript**: Compilador y type checker
- **PostCSS**: Procesador CSS
- **Git**: Control de versiones

---

## 📁 ESTRUCTURA DEL PROYECTO

```
berlin-market/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── send-order-email/     # Endpoint para emails de pedidos
│   │   └── send-order-status-email/ # Endpoint para cambios de estado
│   ├── auth/                     # Autenticación
│   │   └── callback/             # Callback de OAuth
│   ├── components/                # Componentes de página
│   │   ├── AdminDashboard.tsx    # Dashboard administrativo (6525 líneas)
│   │   ├── admin-components/    # Componentes del admin
│   │   └── [otros componentes]    # Header, Footer, ProductCard, etc.
│   ├── contexts/                 # React Contexts
│   │   ├── CartContext.tsx       # Estado del carrito
│   │   ├── CategoryContext.tsx   # Estado de categorías
│   │   └── CartNotificationContext.tsx # Notificaciones
│   ├── hooks/                    # Custom Hooks
│   │   ├── useCategories.ts      # Hook para categorías
│   │   ├── useProducts.ts        # Hook para productos
│   │   └── useDebounce.ts        # Hook para debounce
│   ├── lib/                      # Utilidades y configuraciones
│   │   ├── supabase.ts           # Cliente Supabase y tipos
│   │   ├── utils.ts              # Funciones utilitarias
│   │   └── vacantes.ts           # Lógica de vacantes
│   ├── [rutas de páginas]/       # Páginas de la aplicación
│   └── layout.tsx                # Layout principal
├── components/                    # Componentes compartidos
│   ├── ui/                       # Componentes UI base (shadcn/ui)
│   └── theme-provider.tsx        # Proveedor de tema
├── lib/                          # Configuraciones compartidas
│   ├── supabase.ts               # Cliente Supabase
│   └── utils.ts                  # Utilidades
├── public/                       # Archivos estáticos
│   ├── images/                   # Imágenes de productos
│   ├── brands/                   # Logos de marcas
│   └── icons/                    # Iconos
├── supabase/                     # Configuración Supabase
│   └── functions/                # Edge Functions (si aplica)
├── database_*.sql                # Scripts de migración SQL
├── package.json                   # Dependencias
├── tsconfig.json                  # Configuración TypeScript
├── tailwind.config.js             # Configuración Tailwind
└── next.config.mjs                # Configuración Next.js
```

### Convenciones de Nomenclatura

- **Componentes**: PascalCase (`AdminDashboard.tsx`)
- **Hooks**: camelCase con prefijo `use` (`useProducts.ts`)
- **Utilidades**: camelCase (`formatPrice.ts`)
- **Tipos/Interfaces**: PascalCase (`Producto`, `Categoria`)
- **Constantes**: UPPER_SNAKE_CASE (`MAX_PRODUCTS`)

---

## 🧩 COMPONENTES PRINCIPALES

### 1. AdminDashboard.tsx

**Ubicación**: `app/components/AdminDashboard.tsx`  
**Líneas de código**: 6,525  
**Responsabilidades**:

- Gestión completa de productos (CRUD)
- Gestión de categorías y subcategorías
- Gestión de marcas
- Gestión de pedidos y estados
- Gestión de inventario y stocks
- Gestión de tiendas
- Gestión de aliados
- Gestión de vacantes y aplicaciones
- Gestión de UI personalizable
- Reportes y analíticas

**Tecnologías utilizadas**:
- React Hooks (useState, useEffect, useCallback)
- Supabase Client para operaciones de BD
- shadcn/ui components (Card, Dialog, Tabs, etc.)
- TypeScript para type safety

**Puntos clave**:
- Actualización automática de stocks al cambiar estado de pedido
- Validación de datos en tiempo real
- Manejo de errores robusto
- Optimización de consultas a BD

### 2. CartContext.tsx

**Ubicación**: `app/contexts/CartContext.tsx`  
**Responsabilidades**:

- Estado global del carrito de compras
- Persistencia en localStorage
- Validación de stock disponible
- Cálculo de precios y totales
- Gestión de variaciones (tamaños)

**Características**:
- Verificación de stock antes de agregar productos
- Sincronización automática con localStorage
- Soporte para múltiples variaciones por producto

### 3. Sistema de Pedidos

**Componentes involucrados**:
- `app/carrito/page.tsx`: Página de carrito y checkout
- `app/api/send-order-email/route.ts`: API para emails
- `app/components/AdminDashboard.tsx`: Gestión de pedidos

**Flujo de pedido**:

```
1. Usuario agrega productos al carrito
   ↓
2. Usuario procede al checkout
   ↓
3. Validación de autenticación
   ↓
4. Creación de pedido en BD (tabla 'pedidos')
   ↓
5. Creación de detalles (tabla 'detalle_pedido')
   ↓
6. Envío de email de confirmación (Resend)
   ↓
7. Limpieza del carrito
   ↓
8. Redirección a confirmación
```

### 4. Sistema de Inventario

**Arquitectura de Stocks**:

El sistema utiliza un campo JSONB (`stocks`) en la tabla `productos`:

```typescript
interface ProductoStock {
  id?: string
  cantidad: number
  unidad: 'ML' | 'L' | 'G' | 'KG' | 'MG' | 'OZ' | 'LB'
  precio: number
  stock: number
}
```

**Ventajas**:
- Flexibilidad para múltiples variaciones
- Consultas eficientes con índices GIN
- Relación clara entre tamaño, precio y stock

**Actualización automática**:
- Al cambiar estado de pedido a "Pagado"
- Se resta automáticamente el stock
- Soporte para reversión (cancelación de pedido)

---

## 🗄️ BASE DE DATOS

### Esquema Principal

#### Tabla: `productos`
```sql
- id: SERIAL PRIMARY KEY
- subcategorias_id: INTEGER (FK)
- nombre: VARCHAR
- descripcion: TEXT
- imagen_url: TEXT
- descuento: BOOLEAN
- descuento_valor: VARCHAR
- destacado: BOOLEAN
- novedad: BOOLEAN
- id_marca: INTEGER (FK)
- stocks: JSONB  -- Array de ProductoStock
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### Tabla: `pedidos`
```sql
- id: SERIAL PRIMARY KEY
- usuario_id: INTEGER (FK)
- estado: VARCHAR (pendiente, pagado, en_preparacion, etc.)
- total: DECIMAL
- direccion_envio: TEXT
- zona_envio: VARCHAR
- metodo_pago: VARCHAR
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### Tabla: `detalle_pedido`
```sql
- id: SERIAL PRIMARY KEY
- pedido_id: INTEGER (FK)
- producto_id: INTEGER (FK)
- cantidad: INTEGER
- subtotal: DECIMAL
- tamano_index: INTEGER  -- Índice del tamaño seleccionado
- created_at: TIMESTAMP
```

#### Otras tablas importantes:
- `categories`: Categorías de productos
- `subcategories`: Subcategorías
- `marcas`: Marcas de productos
- `usuarios`: Usuarios del sistema
- `tiendas`: Ubicaciones físicas
- `aliados`: Aliados comerciales

### Índices y Optimizaciones

```sql
-- Índice GIN para búsqueda en stocks (JSONB)
CREATE INDEX idx_productos_stocks ON productos USING GIN (stocks);

-- Índices para consultas frecuentes
CREATE INDEX idx_productos_subcategoria ON productos(subcategorias_id);
CREATE INDEX idx_pedidos_usuario ON pedidos(usuario_id);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_detalle_pedido_pedido ON detalle_pedido(pedido_id);
```

### Row Level Security (RLS)

Supabase implementa RLS para seguridad a nivel de fila:

- Usuarios solo pueden ver sus propios pedidos
- Administradores tienen acceso completo
- Políticas configuradas por tabla

---

## 🔌 APIS Y SERVICIOS

### API Routes (Next.js)

#### POST `/api/send-order-email`
**Propósito**: Enviar email de confirmación de pedido

**Request Body**:
```typescript
{
  userEmail: string
  userName: string
  orderId: number
  orderDate: string
  totalAmount: number
  items: Array<{
    nombre: string
    descripcion: string
    quantity: number
    unitPrice: number
  }>
  orderStatus: string
  address?: string
}
```

**Response**: `{ success: boolean, messageId?: string }`

**Tecnología**: Resend API

#### POST `/api/send-order-status-email`
**Propósito**: Enviar notificación de cambio de estado

Similar estructura al anterior, pero para cambios de estado.

### Supabase Client

**Configuración**: `lib/supabase.ts`

```typescript
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)
```

**Operaciones principales**:
- `supabase.from('productos').select()`: Consultas
- `supabase.from('productos').insert()`: Inserciones
- `supabase.from('productos').update()`: Actualizaciones
- `supabase.from('productos').delete()`: Eliminaciones
- `supabase.rpc('function_name')`: Funciones almacenadas

---

## 🔒 SEGURIDAD

### Autenticación

- **Supabase Auth**: Sistema de autenticación integrado
- **JWT Tokens**: Tokens seguros para sesiones
- **OAuth Providers**: Soporte para Google, GitHub, etc.
- **Email Verification**: Verificación de correo requerida

### Autorización

- **Row Level Security (RLS)**: Políticas a nivel de base de datos
- **Role-Based Access**: Diferentes roles (admin, usuario, etc.)
- **API Key Protection**: Variables de entorno para keys sensibles

### Protección de Datos

- **Encriptación en Tránsito**: HTTPS obligatorio
- **Encriptación en Reposo**: Datos encriptados en Supabase
- **Backups Automáticos**: Backups diarios de Supabase
- **Sanitización de Inputs**: Validación y sanitización de datos

### Mejores Prácticas Implementadas

- Variables de entorno para secrets
- Validación de tipos con TypeScript
- Prepared statements (Supabase las maneja automáticamente)
- Rate limiting (implementado por Next.js/Vercel)
- CORS configurado correctamente

---

## ⚡ RENDIMIENTO Y ESCALABILIDAD

### Optimizaciones Implementadas

#### Frontend
- **Image Optimization**: Next.js optimiza imágenes automáticamente
  - Formato WebP
  - Lazy loading
  - Responsive images
  - Cache de 31 días
- **Code Splitting**: Automático con Next.js
- **Tree Shaking**: Eliminación de código no usado
- **Memoization**: React.memo y useMemo donde es necesario

#### Backend
- **Índices de BD**: Optimización de consultas frecuentes
- **Connection Pooling**: Supabase maneja conexiones eficientemente
- **Caching**: Next.js cachea páginas estáticas
- **CDN**: Vercel Edge Network para contenido estático

### Métricas de Rendimiento

- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.5s
- **Cumulative Layout Shift (CLS)**: < 0.1

### Escalabilidad

- **Serverless Architecture**: Auto-scaling automático
- **Database Scaling**: Supabase escala automáticamente
- **CDN**: Distribución global de contenido
- **Edge Functions**: Lógica cerca del usuario

---

## 🔧 PUNTOS DE EXTENSIÓN

### 1. Integración de Pagos

**Estado Actual**: QR estático en emails

**Extensión Propuesta**:
```typescript
// Nuevo servicio de pagos
app/api/payments/
  ├── generate-qr/          # Generar QR dinámico
  ├── nequi/                # Integración Nequi
  │   ├── create-payment/
  │   └── verify-payment/
  ├── bancolombia/          # Integración Bancolombia
  │   ├── create-payment/
  │   └── verify-payment/
  └── webhook/              # Webhooks de confirmación
```

**Implementación**:
- SDK de Nequi/Bancolombia
- Generación dinámica de QR
- Webhooks para verificación automática
- Tabla `transacciones` para historial

### 2. Sistema de Reportes Avanzados

**Extensión Propuesta**:
```typescript
app/components/admin-components/
  ├── SalesReports.tsx      # Reportes de ventas
  ├── InventoryReports.tsx  # Reportes de inventario
  ├── CustomerAnalytics.tsx # Analíticas de clientes
  └── ExportData.tsx        # Exportación de datos
```

**Tecnologías**:
- Recharts para visualizaciones
- Exportación a Excel/PDF
- Filtros avanzados por fecha, categoría, etc.

### 3. Editor Visual de Temas

**Extensión Propuesta**:
```typescript
app/components/admin-components/
  └── ThemeEditor.tsx       # Editor visual de temas
```

**Funcionalidades**:
- Selector de colores
- Upload de logos
- Preview en tiempo real
- Guardado de configuraciones

### 4. API Pública

**Extensión Propuesta**:
```typescript
app/api/public/
  ├── products/             # GET /api/public/products
  ├── categories/           # GET /api/public/categories
  └── stores/               # GET /api/public/stores
```

**Características**:
- Documentación con OpenAPI/Swagger
- Rate limiting
- Autenticación con API keys
- Versionado de API

### 5. App Móvil

**Extensión Propuesta**:
- React Native app
- Compartir lógica con web (monorepo)
- API común con Next.js
- Push notifications

---

## 🗺️ ROADMAP TÉCNICO

### Q1 2025

**Integraciones de Pago**
- [ ] SDK Nequi integrado
- [ ] SDK Bancolombia integrado
- [ ] Generación dinámica de QR
- [ ] Webhooks de verificación
- [ ] Panel de conciliación

**Mejoras de Performance**
- [ ] Implementar Redis para cache
- [ ] Optimización de consultas N+1
- [ ] Lazy loading de imágenes
- [ ] Service Worker para offline

### Q2 2025

**Reportes y Analíticas**
- [ ] Dashboard de métricas avanzadas
- [ ] Exportación a Excel/PDF
- [ ] Reportes programados por email
- [ ] Integración con Google Analytics

**Editor Visual**
- [ ] Constructor de temas drag-and-drop
- [ ] Preview en tiempo real
- [ ] Templates predefinidos
- [ ] Exportación de configuraciones

### Q3 2025

**API Pública**
- [ ] Documentación OpenAPI
- [ ] Rate limiting avanzado
- [ ] Webhooks para eventos
- [ ] SDK para desarrolladores

**Multi-idioma**
- [ ] i18n con next-intl
- [ ] Traducción de contenido
- [ ] Detección automática de idioma
- [ ] Admin multi-idioma

### Q4 2025

**App Móvil**
- [ ] React Native app
- [ ] Push notifications
- [ ] Sincronización offline
- [ ] App para vendedores

**IA y Machine Learning**
- [ ] Recomendaciones de productos
- [ ] Chatbot con IA
- [ ] Predicción de demanda
- [ ] Análisis de sentimiento

---

## 📊 MÉTRICAS Y MONITOREO

### Métricas a Monitorear

**Performance**:
- Tiempo de respuesta de API
- Tiempo de carga de páginas
- Uso de memoria y CPU
- Errores y excepciones

**Negocio**:
- Número de pedidos
- Valor promedio de pedido
- Tasa de conversión
- Productos más vendidos

**Técnicas**:
- Uptime del servicio
- Errores de base de datos
- Tiempo de respuesta de Supabase
- Uso de almacenamiento

### Herramientas Recomendadas

- **Vercel Analytics**: Métricas de Next.js
- **Sentry**: Monitoreo de errores
- **Supabase Dashboard**: Métricas de BD
- **Google Analytics**: Métricas de negocio

---

## 🧪 TESTING

### Estrategia de Testing

**Unit Tests**:
- Funciones utilitarias
- Hooks personalizados
- Lógica de negocio

**Integration Tests**:
- Flujos de pedidos
- Autenticación
- Operaciones CRUD

**E2E Tests**:
- Flujo completo de compra
- Dashboard administrativo
- Gestión de productos

### Herramientas

- **Jest**: Framework de testing
- **React Testing Library**: Testing de componentes
- **Playwright**: E2E testing
- **MSW**: Mocking de APIs

---

## 📚 DOCUMENTACIÓN TÉCNICA

### Documentos Existentes

- `README_EMAIL_ORDERS.md`: Sistema de emails
- `STOCK_UPDATE_IMPLEMENTATION.md`: Sistema de stocks
- `STOCKS_FIELD_README.md`: Campo stocks JSONB
- `SUPABASE_SETUP.md`: Configuración de Supabase
- `database_*.sql`: Scripts de migración

### Documentación Recomendada

- **API Documentation**: OpenAPI/Swagger
- **Component Storybook**: Documentación de componentes
- **Architecture Decision Records (ADRs)**: Decisiones técnicas
- **Runbooks**: Procedimientos operativos

---

## 🔄 CI/CD Y DEPLOYMENT

### Pipeline Actual

1. **Desarrollo**: Git branch feature
2. **Testing**: Tests automáticos (a implementar)
3. **Deploy Preview**: Vercel preview deployment
4. **Producción**: Merge a main → Deploy automático

### Mejoras Propuestas

- [ ] Tests automáticos en CI
- [ ] Linting y type checking
- [ ] Security scanning
- [ ] Performance budgets
- [ ] Staging environment

---

## 📞 CONTACTO TÉCNICO

Para consultas técnicas sobre la arquitectura:

- **Documentación**: Ver archivos README en el proyecto
- **Issues**: Crear issue en repositorio (si aplica)
- **Soporte**: contacto@berlinmarket.com

---

*Última actualización: Diciembre 2024*





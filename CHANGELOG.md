# Changelog

Todos los cambios notables de este proyecto serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [1.3.0] - 2026-01-14

### 🎯 Resumen Ejecutivo

Implementación completa del **Sistema de Gestión de Inventario** con control de stock, trazabilidad de movimientos, integración con tareas y notificaciones automáticas. Este release transforma la aplicación en una solución integral para viveros, agregando capacidades de gestión de materiales, proveedores y análisis de costos.

---

### ✨ Nuevas Funcionalidades

#### 📦 Sistema de Inventario Completo

**Gestión de Items**
- CRUD completo de items de inventario con validaciones robustas
- Soporte para código/SKU, categorización y ubicación física
- Control de stock con niveles mínimos y máximos configurables
- Unidades de medida flexibles (kg, L, unidades, m², etc.)
- **Gestión de Precios Dual**:
  - Precio de costo (compra/adquisición)
  - Precio de venta al cliente
  - Cálculo automático de margen de ganancia (%)
  - Indicadores visuales de rentabilidad (verde/azul/naranja/rojo)
- Imágenes de items (preparado para futura implementación)
- Soft delete con campo `activo`

**Categorías de Inventario**
- Sistema de categorización con iconos y colores personalizables
- 6 categorías predefinidas con seed automático:
  - Macetas y Contenedores
  - Sustratos y Tierras
  - Fertilizantes y Nutrientes
  - Herramientas
  - Semillas y Plantas
  - Productos Fitosanitarios
- CRUD completo de categorías
- Validación de unicidad por tenant

**Gestión de Proveedores**
- Registro completo de proveedores con datos fiscales
- Información de contacto (teléfono, email, sitio web)
- Ubicación geográfica (dirección, ciudad, país)
- Relación N:N con items (múltiples proveedores por item)
- Precio de compra y tiempo de entrega por proveedor
- Designación de proveedor principal
- Soft delete con campo `activo`

**Control de Stock y Movimientos**
- **Tipos de movimientos**:
  - `entrada`: Compras, devoluciones, producción
  - `salida`: Ventas, consumo en tareas, mermas
  - `ajuste`: Correcciones de inventario
- Registro automático de stock anterior y nuevo
- Cálculo de costo total por movimiento
- Vinculación con proveedores (entradas)
- **Vinculación con tareas** (salidas por consumo)
- Motivo y referencia para trazabilidad
- Trigger automático para actualización de stock
- Historial completo e inmutable de movimientos

**Estadísticas y Reportes**
- Dashboard de inventario con métricas clave:
  - Total de items activos
  - Items con stock bajo
  - Valor total del inventario (basado en precio de costo)
  - Total de categorías
- Filtros avanzados:
  - Búsqueda por nombre, código o descripción
  - Filtro por categoría
  - Filtro por estado de stock (bajo/ok)
  - Combinación de múltiples criterios
- Indicadores visuales de stock bajo
- Tabla con margen de ganancia por item

---

#### 🔔 Sistema de Notificaciones Automáticas Multi-Tenant

**Notificaciones de Inventario**
- **Stock Bajo**: Alerta cuando `stock_actual ≤ stock_minimo`
  - Lista de hasta 3 items afectados
  - Contador total de items con stock bajo
  - Frecuencia máxima: 1 notificación cada 24 horas
- **Stock Crítico**: Alerta cuando `stock_actual = 0`
  - Items completamente agotados
  - Prioridad alta para reabastecimiento
  - Frecuencia máxima: 1 notificación cada 24 horas

**Infraestructura de Notificaciones**
- **Procesamiento Multi-Tenant**:
  - Función `runNotificationChecksForAllTenants()`
  - Procesa automáticamente todos los tenants del sistema
  - Genera notificaciones para cada usuario de cada tenant
  - No requiere autenticación (ideal para cron jobs)
- **API Endpoint**: `GET /api/notifications/check`
  - Ejecuta verificaciones para todos los tenants
  - Retorna estadísticas detalladas por tenant
  - Manejo de errores por tenant (no bloquea otros)
- **Configuración de Cron Jobs**:
  - Archivo `vercel.json` para Vercel Cron Jobs
  - Documentación para servicios externos (cron-job.org, EasyCron)
  - Ejemplo de GitHub Actions workflow
  - Horario configurable (default: diariamente a las 9:00 AM UTC)
- **Prevención de Spam**:
  - Verificación de notificaciones existentes
  - Límite de 1 notificación por tipo cada 24 horas
  - Por usuario, no por tenant

**Documentación**
- Guía completa en `docs/notificaciones-automaticas.md`:
  - Configuración de cron jobs
  - Múltiples opciones de deployment
  - Ejemplos de horarios cron
  - Troubleshooting
  - Mejores prácticas

---

#### 📊 Widget de Inventario en Dashboard

**Componente InventoryWidget**
- Integrado en dashboard principal (grid 3 columnas)
- **Estadísticas en tiempo real**:
  - Total de items activos
  - Valor total del inventario (formato moneda ARS)
  - Ícono de tendencia para valor
- **Alertas Visuales**:
  - Alerta naranja para stock bajo con lista de items
  - Mensaje verde cuando todo está en niveles óptimos
  - Estado vacío cuando no hay items
- **Acceso Rápido**:
  - Botón directo a `/inventario`
  - Diseño consistente con otros widgets
- **Características Técnicas**:
  - Server component (sin JavaScript en cliente)
  - Manejo de errores con UI amigable
  - Responsive y dark mode compatible

---

#### 🔗 Integración Inventario-Tareas

**Registro de Consumo de Materiales**
- **Server Action** `registrarConsumoTarea()`:
  - Registra múltiples materiales en una transacción
  - Validación de stock disponible antes de registrar
  - Crea movimientos de tipo "salida" automáticamente
  - Actualiza stock mediante trigger de base de datos
  - Vincula movimientos con tarea específica (`id_tarea`)
  - Genera motivo automático: "Consumo en tarea: [nombre]"
  - Manejo de errores con mensajes descriptivos

**Componente MaterialConsumoDialog**
- Dialog modal para registrar materiales consumidos
- **Características**:
  - Soporte para múltiples materiales en un solo registro
  - Selector de items con stock visible en tiempo real
  - Validación de stock disponible
  - Campo de cantidad con decimales
  - Motivo opcional por material
  - Botón "Agregar otro material" dinámico
  - Botón "Eliminar" para cada material (mínimo 1)
  - Estados de carga y feedback con toasts

**Componente MaterialesConsumidosCard**
- Card completo con historial de materiales por tarea
- **Funcionalidades**:
  - Botón "Registrar Materiales" en header
  - Resumen con estadísticas (total items, cantidad total)
  - Lista detallada de cada consumo
  - Muestra: item, cantidad, motivo, fecha, usuario
  - Indicador visual de stock (antes → después)
  - Estado vacío con call-to-action
  - Integración con MaterialConsumoDialog
  - Recarga automática después de registrar

**Historial y Trazabilidad**
- Función `getMaterialesConsumidosPorTarea()` para consultar historial
- Filtrado automático de movimientos de salida
- Incluye detalles del item y usuario que registró
- Formato de fecha localizado (español)

---

### 🔧 Mejoras

#### Interfaz de Usuario

**Página de Inventario** (`/inventario`)
- Diseño profesional con PageHeader
- Grid de 4 stats cards con métricas clave
- **Sistema de Filtros Avanzado**:
  - Búsqueda en tiempo real (nombre, código, descripción)
  - Filtro por categoría con dropdown
  - Filtro por estado de stock (bajo/ok/todos)
  - Indicador de filtros activos con contador
  - Botón "Limpiar filtros" visible cuando hay filtros
  - Búsqueda combinada (AND logic)
- **Tabla de Items**:
  - Columnas: Código, Nombre, Categoría, Stock, Mínimo, P. Costo, P. Venta, Margen %, Estado, Acciones
  - Indicadores de stock bajo (badge naranja)
  - Margen con colores semánticos (verde/azul/naranja/rojo)
  - Acciones: Registrar Movimiento, Editar, Eliminar
- **Estados Vacíos**:
  - Sin items: Mensaje con botón para agregar
  - Sin resultados de filtros: Mensaje específico con botón limpiar
- Botón "Nuevo Item" prominente en header
- Botón "Seed Categorías" para inicialización rápida

**Formularios y Diálogos**
- `InventoryItemSheet`: Formulario completo de items
  - Modo creación y edición
  - Validaciones en cliente y servidor
  - Campos: código, nombre, descripción, categoría, unidad, stocks, precios, ubicación
  - useEffect para sincronizar estado con props
  - Reseteo automático al abrir/cerrar
- `MovementDialog`: Registro de movimientos
  - Selector de tipo (entrada/salida/ajuste)
  - Validación de stock para salidas
  - Cálculo automático de nuevo stock
  - Campos opcionales: precio, proveedor, motivo, notas

#### Performance y Optimización

- **Filtrado en Cliente**: Uso de `useMemo` para evitar re-cálculos
- **Carga Paralela**: `Promise.all` para múltiples queries
- **Server Components**: Widgets y cards sin JavaScript en cliente
- **Índices de Base de Datos**:
  - Índice compuesto en `(stock_actual, stock_minimo)` para stock bajo
  - Índices en `id_tenant`, `id_categoria`, `codigo`, `activo`
  - Índices en movimientos por `tipo`, `fecha`, `id_tarea`, `id_proveedor`

#### Validaciones y Seguridad

- **Row Level Security (RLS)** en todas las tablas de inventario
- Políticas de SELECT, INSERT, UPDATE, DELETE por tenant
- Validaciones de stock en triggers:
  - Stock no puede ser negativo
  - Stock máximo ≥ stock mínimo
  - Precios no pueden ser negativos
- Validaciones de negocio:
  - Stock suficiente para salidas
  - Cantidades positivas
  - Unicidad de código por tenant
- Soft delete para preservar historial

---

### 🗄️ Base de Datos

#### Nuevas Tablas

**`categorias_inventario`**
- Categorización de items con iconos y colores
- Campos: `id_categoria`, `id_tenant`, `nombre`, `descripcion`, `icono`, `color`
- Constraint único: `(id_tenant, nombre)`
- RLS completo por tenant

**`items_inventario`**
- Items de inventario con control de stock
- Campos principales:
  - Identificación: `id_item`, `id_tenant`, `codigo`, `nombre`, `descripcion`
  - Categorización: `id_categoria`, `ubicacion`
  - Stock: `stock_actual`, `stock_minimo`, `stock_maximo`, `unidad_medida`
  - Precios: `precio_costo`, `precio_venta`
  - Metadata: `imagen_url`, `activo`, `created_at`, `updated_at`
- Constraints:
  - `stock_actual >= 0`
  - `stock_minimo >= 0`
  - `stock_maximo >= stock_minimo` (si existe)
  - `precio_costo >= 0` (si existe)
  - `precio_venta >= 0` (si existe)
  - Código único por tenant
- Índices optimizados para búsquedas y stock bajo

**`proveedores`**
- Gestión de proveedores de materiales
- Campos: `id_proveedor`, `id_tenant`, `codigo`, `nombre`, `razon_social`, `rut_cuit`
- Contacto: `contacto`, `telefono`, `email`, `sitio_web`
- Ubicación: `direccion`, `ciudad`, `pais`
- Metadata: `notas`, `activo`, `created_at`
- Constraint único: `(id_tenant, codigo)`

**`items_proveedores`**
- Relación N:N entre items y proveedores
- Campos: `id_item`, `id_proveedor`, `precio_compra`, `tiempo_entrega_dias`
- `es_proveedor_principal`: Boolean para designar proveedor preferido
- Primary key compuesta: `(id_item, id_proveedor)`
- RLS basado en items del tenant

**`movimientos_inventario`**
- Historial completo de movimientos de stock
- Campos principales:
  - Identificación: `id_movimiento`, `id_tenant`, `id_item`
  - Tipo y cantidad: `tipo`, `cantidad`
  - Stock: `stock_anterior`, `stock_nuevo`
  - Costos: `precio_unitario`, `costo_total`
  - Trazabilidad: `motivo`, `referencia`, `fecha`
  - Relaciones: `id_proveedor`, `id_tarea`, `id_usuario`
  - Notas: `notas`
- Constraints:
  - `tipo IN ('entrada', 'salida', 'ajuste')`
  - `cantidad > 0`
  - `stock_anterior >= 0`
  - `stock_nuevo >= 0`
- Índices en tipo, fecha, tarea, proveedor

#### Modificaciones a Tablas Existentes

**`items_inventario`** (migración de precios)
- Renombrado: `precio_unitario` → `precio_costo`
- Agregado: `precio_venta` (DECIMAL(10,2), nullable)
- Comentarios actualizados para claridad

#### Triggers y Funciones

**`actualizar_stock_item()`**
- Trigger AFTER INSERT en `movimientos_inventario`
- Actualiza automáticamente `stock_actual` del item
- Actualiza `updated_at` timestamp
- Garantiza consistencia de datos

#### Migraciones

- `supabase/migrations/20260114_add_inventario.sql`:
  - Creación de 5 tablas con RLS
  - Índices optimizados
  - Trigger de actualización de stock
  - Seed de categorías (comentado)
  - Comentarios en tablas y columnas
- `supabase/migrations/20260114_add_precio_venta.sql`:
  - Separación de precio de costo y venta
  - Renombrado de columna
  - Comentarios actualizados

---

### 📝 Documentación

#### Nuevos Archivos

**`docs/notificaciones-automaticas.md`**
- Guía completa del sistema de notificaciones
- Configuración de cron jobs (Vercel, servicios externos, GitHub Actions)
- Ejemplos de horarios cron
- Troubleshooting y mejores prácticas
- Tabla de tipos de notificaciones
- Ejemplos de uso del API

**`docs/plan-maestro.md`** (actualizado)
- Estado de implementación de inventario: ✅ Completado
- Fases 1, 2 y 3 documentadas
- Próximas fases sugeridas

**`README.md`** (actualizado)
- Sección de inventario agregada
- Funcionalidades documentadas
- Instrucciones de configuración

#### Server Actions Documentados

**`src/app/actions/inventario.ts`**
- CRUD completo de categorías, items, proveedores
- Gestión de movimientos con validaciones
- Relaciones items-proveedores
- Estadísticas y reportes
- Comentarios JSDoc en todas las funciones

**`src/app/actions/inventario-seed.ts`**
- Función de seed para categorías predefinidas
- Verificación de existencia antes de insertar
- Soporte multi-tenant

**`src/app/actions/inventario-tareas.ts`**
- Integración con sistema de tareas
- Registro de consumo de materiales
- Historial por tarea
- Tipo `ConsumoMaterial` exportado

**`src/app/actions/notification-generator-multi-tenant.ts`**
- Sistema de notificaciones multi-tenant
- Funciones por tipo de verificación
- Procesamiento paralelo de tenants
- Manejo de errores robusto

---

### 🎨 Componentes

#### Nuevos Componentes

**Inventario**
- `InventoryItemSheet`: Formulario de items (creación/edición)
- `MovementDialog`: Registro de movimientos
- `InventoryWidget`: Widget para dashboard
- `MaterialConsumoDialog`: Registro de materiales en tareas
- `MaterialesConsumidosCard`: Historial de materiales por tarea
- `NotificationCheckButton`: Botón manual para verificar notificaciones

**Utilidades**
- Funciones de formateo de moneda
- Helpers de cálculo de margen
- Validadores de stock

---

### 🐛 Correcciones

- **Formulario de Items**: Corregido bug donde el formulario aparecía vacío al editar
  - Implementado `useEffect` para sincronizar estado con props
  - Eliminado código duplicado de reseteo
- **Tipos TypeScript**: Actualizados para incluir `precio_costo` y `precio_venta`
- **Lint Warnings**: Corregidos warnings de React hooks
  - Uso de `useCallback` para funciones en dependencias
  - Prefijo `_` para parámetros no usados
- **Try/Catch con JSX**: Refactorizado para cumplir con reglas de React
  - Early returns en lugar de try/catch alrededor de JSX

---

### 📦 Dependencias

#### Sin Cambios
- No se agregaron nuevas dependencias externas
- Uso de bibliotecas existentes (shadcn/ui, date-fns, etc.)

---

### 🔐 Seguridad

- **Row Level Security (RLS)** implementado en todas las tablas
- Políticas de acceso por tenant en todas las operaciones
- Validaciones de stock en triggers (no bypasseables desde cliente)
- Soft delete para preservar integridad referencial
- API de notificaciones sin autenticación (diseñado para cron jobs)
- Validación de tenant en todas las server actions

---

### ⚡ Performance

- **Índices Optimizados**:
  - Índice compuesto para consultas de stock bajo
  - Índices en foreign keys
  - Índices en campos de búsqueda frecuente
- **Queries Optimizadas**:
  - Uso de `Promise.all` para queries paralelas
  - Filtrado en cliente con `useMemo`
  - Límites en consultas de historial
- **Server Components**:
  - Widgets renderizados en servidor
  - Reducción de JavaScript en cliente

---

### 🧪 Testing

- Lint: ✅ Sin errores
- Build: ✅ Compilación exitosa
- Funcionalidad: ✅ Probado manualmente
- Multi-tenant: ✅ Verificado con múltiples tenants

---

### 📊 Métricas del Release

- **Archivos Nuevos**: 15+
- **Archivos Modificados**: 40+
- **Líneas de Código**: ~3,500+
- **Tablas de BD**: 5 nuevas
- **Migraciones**: 2
- **Componentes**: 6 nuevos
- **Server Actions**: 30+ funciones
- **Documentación**: 3 archivos actualizados/creados

---

### 🚀 Próximos Pasos Sugeridos

1. Página de detalles de item (`/inventario/[id]`)
2. Página de gestión de proveedores (`/inventario/proveedores`)
3. Códigos de barras/QR para items
4. Reportes y exportación a Excel
5. Integración con ventas (cuando se implemente)
6. Alertas de reabastecimiento automático
7. Historial de precios (tracking de cambios)

---

## [1.2.0] - 2026-01-13

### ✨ Nuevas Funcionalidades

#### Sistema de Subgéneros
- **Clasificación Jerárquica de Plantas**: Implementado sistema de subgéneros para una taxonomía más detallada
  - Nueva tabla `subgeneros_planta` con relación a géneros
  - CRUD completo de subgéneros con validación
  - Integración en formulario de plantas con carga dinámica
  - Componentes: `SubgenerosTable`, `SubgeneroSheet`
  - Server actions para gestión de subgéneros

#### PWA (Progressive Web App)
- **Aplicación Instalable**: Convertida la aplicación en PWA
  - Manifest configurado con iconos y shortcuts
  - Service Worker con estrategias de caché optimizadas
  - Componente `InstallPrompt` con lógica de descarte (7 días)
  - Componente `OfflineIndicator` con notificaciones de estado
  - Soporte offline para datos de Supabase, imágenes y fuentes
  - Configuración con `next-pwa` y webpack

#### Creación Rápida de Géneros
- **Flujo Optimizado**: Dialog de creación rápida para género + subgénero en un solo paso
  - Botón "Creación Rápida" con ícono de rayo
  - Soporte para Enter key
  - Consulta directa a base de datos para evitar problemas de estado
  - Mensajes específicos de éxito/error

### 🔧 Mejoras

#### Formulario de Macetas
- **Unidades Configurables**: Permitir selección de unidades de medida
  - Diámetro: cm, in, mm
  - Altura: cm, in, mm
  - Volumen: L, ml, gal
  - Nuevas columnas en BD: `diametro_unidad`, `altura_unidad`, `volumen_unidad`
  - Visualización de unidades en tabla de macetas

- **Material como Select**: Cambiado de input libre a select con opciones predefinidas
  - 9 materiales comunes: Plástico, Cerámica, Barro, Terracota, etc.
  - Opción "Sin especificar"
  - Datos más consistentes y estandarizados

#### Formulario de Plantas
- **Mejoras UX en Género/Subgénero**:
  - Limpieza automática de subgénero al cambiar género
  - Contador de subgéneros disponibles
  - Textos de ayuda contextuales
  - Mensaje informativo cuando no hay subgéneros
  - Guía para crear subgéneros desde catálogos

#### Página de Géneros
- **Interfaz con Tabs**: Separación clara entre géneros y subgéneros
  - Tab "Géneros" y tab "Subgéneros"
  - Stats cards independientes
  - Recarga automática al cambiar de tab
  - Botón contextual según tab activo

### 🐛 Correcciones

- **Rutas de Notificaciones**: Eliminado prefijo `/dashboard` de URLs (grupo de rutas)
- **Creación de Subgéneros**: Corregida query SQL que fallaba por columna `created_at` inexistente
- **Recarga de Géneros**: Agregado delay y recarga al abrir sheet de subgéneros
- **PWA con Turbopack**: Configurado para usar webpack explícitamente
- **Toast Notifications**: Cambiado `showToast.warning` a `showToast.error` (método no existente)

### 📦 Dependencias

#### Agregadas
- `next-pwa`: Soporte para Progressive Web App
- `@radix-ui/react-tabs`: Componente de tabs
- `@radix-ui/react-dialog`: Componente de dialog (ya existente, verificado)

### 🗄️ Base de Datos

#### Nuevas Tablas
- `subgeneros_planta`: Subgéneros de plantas con relación a géneros

#### Modificaciones
- `plantas`: Agregada columna `id_subgenero` (opcional, nullable)
- `macetas`: Agregadas columnas `diametro_unidad`, `altura_unidad`, `volumen_unidad`

#### Migraciones
- `supabase/migrations/add_subgeneros.sql` (ejecutar en Supabase)
- `supabase/migrations/add_macetas_units.sql` (ejecutar en Supabase)

### 📝 Documentación
- Actualizado README con nuevas funcionalidades
- Actualizado PRD con estado de implementación
- Creado CHANGELOG.md completo

---

## [1.1.0] - 2026-01-XX

### ✨ Nuevas Funcionalidades

#### Sistema de Notificaciones Inteligentes
- Notificaciones in-app con centro de notificaciones
- Preferencias configurables por tipo
- Generación automática basada en eventos
- Componentes: `NotificationCenter`, `NotificationBadge`, `NotificationItem`, `NotificationPreferences`
- Server actions para CRUD de notificaciones
- Página de configuración `/configuracion/notificaciones`

#### Dashboard Avanzado con Analytics
- Gráficos de tendencias de salud de plantas
- Distribución por género (pie chart)
- Tasa de completitud de tareas (bar chart)
- Filtros de rango de fechas
- Exportación a Excel y PDF
- Componentes de gráficos reutilizables: `LineChart`, `BarChart`, `PieChart`

### 🔧 Mejoras
- Filtros de fecha en analytics
- Exportación de reportes
- UI mejorada en dashboard

---

## [1.0.0] - 2025-XX-XX

### ✨ Lanzamiento Inicial (MVP)

#### Funcionalidades Core
- **Autenticación y Multi-tenancy**: Sistema completo con Supabase Auth
- **Gestión de Plantas**: CRUD completo con imágenes
- **Sistema de Tareas**: Programación y seguimiento
- **Historia Clínica**: Registro de tratamientos
- **Catálogos**: Géneros, Tipos, Macetas
- **Dashboard**: Estadísticas básicas y acciones rápidas
- **Perfil de Usuario**: Gestión de cuenta

#### Tecnologías
- Next.js 16 (App Router)
- Supabase (PostgreSQL + Auth + Storage)
- Tailwind CSS + shadcn/ui
- TypeScript
- React Hook Form + Zod

#### Base de Datos
- 8 tablas principales con RLS
- Políticas de seguridad multi-tenant
- Índices optimizados

---

## Formato de Versiones

- **MAJOR**: Cambios incompatibles en la API
- **MINOR**: Nueva funcionalidad compatible con versiones anteriores
- **PATCH**: Correcciones de bugs compatibles con versiones anteriores

## Enlaces

- [Repositorio](https://github.com/usuario/vivero-saas)
- [Documentación](./README.md)
- [PRD](./PRD.md)

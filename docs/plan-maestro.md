# 🚀 Plan Maestro de Implementaciones - Vivero SaaS

## 📊 Visión General

Este documento contiene el roadmap completo de implementaciones y mejoras planificadas para Vivero SaaS. El proyecto se divide en 8 fases principales, cada una enfocada en agregar valor significativo a la plataforma.

**Estado actual:** 3 de 8 fases completadas (37.5%)  
**Última actualización:** Enero 2026

---

## ✅ Fase 1 - Base del Sistema (COMPLETADO)

### Características Implementadas
- ✅ Autenticación y autorización con Supabase
- ✅ CRUD completo de plantas
- ✅ Sistema de tareas y mantenimiento
- ✅ Historial clínico de plantas
- ✅ Gestión de géneros y macetas
- ✅ Upload de imágenes de plantas
- ✅ Dashboard básico con métricas

---

## ✅ Fase 2 - Dashboard Avanzado con Analytics (COMPLETADO)

### Implementaciones Realizadas

#### 📈 Componentes de Gráficos
- ✅ LineChart reutilizable para tendencias temporales
- ✅ BarChart para comparativas mensuales
- ✅ PieChart para distribuciones porcentuales

#### 📊 Métricas Implementadas
- ✅ **Tendencias de salud de plantas** - Evolución temporal del estado de las plantas
- ✅ **Distribución por género** - Porcentaje de plantas por cada género
- ✅ **Tasa de completado de tareas** - Comparativa mensual de tareas completadas vs pendientes
- ✅ **Evolución de plantas enfermas** - Seguimiento de plantas con problemas de salud

#### 🔧 Funcionalidades Adicionales
- ✅ Filtros de fecha para análisis personalizado
- ✅ Exportación de reportes (preparado para PDF/Excel)
- ✅ Server actions optimizadas para analytics
- ✅ Caché de datos para mejor rendimiento

### Archivos Creados
- `src/components/charts/line-chart.tsx`
- `src/components/charts/bar-chart.tsx`
- `src/components/charts/pie-chart.tsx`
- `src/components/dashboard/analytics-section.tsx`
- `src/app/actions/analytics.ts`

---

## ✅ Fase 3 - Notificaciones Inteligentes (COMPLETADO)

### Implementaciones Realizadas

#### 🗄️ Esquema de Base de Datos
- ✅ Tabla `notificaciones` con tipos, estados y metadata
- ✅ Tabla `preferencias_notificaciones` por usuario
- ✅ Políticas RLS para seguridad multi-tenant

#### 🔔 Sistema de Notificaciones In-App
- ✅ **NotificationCenter** - Panel deslizable con lista de notificaciones
- ✅ **Badge de contador** - Indicador visual en header
- ✅ **Acciones en notificaciones** - Marcar como leído, eliminar, navegar
- ✅ **Estados de notificación** - No leída, leída, archivada

#### 🤖 Generación Automática
- ✅ **Tareas próximas a vencer** - Alertas 24h antes
- ✅ **Plantas enfermas sin tratamiento** - Recordatorio cada 7 días
- ✅ **Tareas vencidas** - Notificación de tareas atrasadas
- ✅ **Resumen diario** - Digest de actividades pendientes

#### ⚙️ Preferencias de Usuario
- ✅ Configuración por tipo de notificación
- ✅ Activar/desactivar notificaciones específicas
- ✅ Interfaz de gestión de preferencias

### Archivos Creados
- `src/components/notification-center.tsx`
- `src/components/notification-item.tsx`
- `src/components/notification-preferences.tsx`
- `src/app/actions/notifications.ts`
- `src/app/actions/notification-generator.ts`
- `supabase/migrations/add_notifications.sql`

### Pendiente (Opcional)
- ⏳ Notificaciones por email con Resend/SendGrid
- ⏳ Templates de emails personalizados
- ⏳ Configuración de frecuencia de emails

---

## ✅ Fase 4 - PWA (Progressive Web App) (COMPLETADO)

### Implementaciones Realizadas

#### 📱 Configuración PWA
- ✅ Instalación y configuración de `next-pwa`
- ✅ Manifest.json con metadata de la app
- ✅ Service worker con estrategias de caché
- ✅ Iconos en múltiples tamaños (192x192, 512x512)
- ✅ Splash screens para diferentes dispositivos

#### 💾 Estrategias de Caché
- ✅ **Cache-first** para assets estáticos (CSS, JS, imágenes)
- ✅ **Network-first** para datos dinámicos (API calls)
- ✅ Precaching de rutas principales
- ✅ Runtime caching de imágenes

#### 🔌 Funcionalidad Offline
- ✅ Detección de estado de conexión
- ✅ Mensaje visual cuando está offline
- ✅ Queue de acciones pendientes (preparado)
- ✅ Sincronización al recuperar conexión

### Archivos Modificados
- `next.config.ts` - Configuración de PWA
- `public/manifest.json` - Metadata de la aplicación
- `public/icons/` - Iconos y splash screens

### Pendiente (Opcional)
- ⏳ Notificaciones push del navegador
- ⏳ Background sync avanzado
- ⏳ Actualización automática de la app

---

## 🔄 Fase 5 - Gestión de Inventario (PARCIALMENTE COMPLETADO)

### Objetivos
Implementar un sistema completo de gestión de inventario para materiales de jardinería, herramientas y suministros.

### Esquema de Base de Datos Propuesto

#### Tabla `categorias_inventario`
```sql
CREATE TABLE categorias_inventario (
  id_categoria SERIAL PRIMARY KEY,
  id_tenant UUID NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  icono VARCHAR(50)
);
```

#### Tabla `items_inventario`
```sql
CREATE TABLE items_inventario (
  id_item SERIAL PRIMARY KEY,
  id_tenant UUID NOT NULL,
  id_categoria INTEGER REFERENCES categorias_inventario(id_categoria),
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  unidad_medida VARCHAR(50), -- kg, litros, unidades, etc.
  stock_actual DECIMAL(10,2) DEFAULT 0,
  stock_minimo DECIMAL(10,2) DEFAULT 0,
  precio_unitario DECIMAL(10,2),
  ubicacion VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Tabla `movimientos_inventario`
```sql
CREATE TABLE movimientos_inventario (
  id_movimiento SERIAL PRIMARY KEY,
  id_tenant UUID NOT NULL,
  id_item INTEGER REFERENCES items_inventario(id_item),
  tipo VARCHAR(20) NOT NULL, -- 'entrada' o 'salida'
  cantidad DECIMAL(10,2) NOT NULL,
  motivo TEXT,
  id_tarea INTEGER REFERENCES tareas(id_tarea), -- opcional
  fecha TIMESTAMP DEFAULT NOW()
);
```

#### Tabla `proveedores`
```sql
CREATE TABLE proveedores (
  id_proveedor SERIAL PRIMARY KEY,
  id_tenant UUID NOT NULL,
  nombre VARCHAR(200) NOT NULL,
  contacto VARCHAR(100),
  telefono VARCHAR(50),
  email VARCHAR(100),
  direccion TEXT,
  notas TEXT
);
```

### Funcionalidades a Implementar

#### Módulo de Inventario
- [x] Página de listado de items con filtros
- [x] Formulario de creación/edición de items
- [x] Vista de detalles con historial de movimientos
- [x] Gestión de categorías
- [x] Indicadores visuales de stock bajo

#### Alertas de Stock
- [x] Configurar niveles mínimos por item
- [ ] Notificaciones automáticas cuando stock < mínimo
- [x] Dashboard de items críticos (Widget básico implementado)
- [ ] Sugerencias de reabastecimiento

#### Módulo de Proveedores
- [ ] CRUD completo de proveedores
- [ ] Asociar items con proveedores
- [ ] Historial de compras por proveedor
- [ ] Información de contacto y notas

#### Integración con Tareas
- [x] Registrar consumo de materiales en tareas
- [x] Actualizar stock automáticamente
- [x] Reportes de consumo por período (parcial en historial)
- [ ] Costos asociados a tareas

### Estimación
**Duración:** 6-8 horas  
**Complejidad:** Alta  
**Prioridad:** Media

---

## 🔍 Fase 6 - Búsqueda Avanzada y Filtros (PENDIENTE)

### Objetivos
Mejorar significativamente la experiencia de búsqueda y filtrado en toda la aplicación.

### Funcionalidades a Implementar

#### Búsqueda Global
- [ ] Barra de búsqueda en header (Cmd+K / Ctrl+K)
- [ ] Búsqueda en plantas, tareas, historial clínico
- [ ] Resultados agrupados por tipo de entidad
- [ ] Navegación con teclado (↑↓ Enter Esc)
- [ ] Highlighting de términos encontrados
- [ ] Búsqueda reciente y sugerencias

#### Filtros Avanzados
- [ ] Filtros combinados (estado + género + maceta + fecha)
- [ ] Rangos de fechas con calendario
- [ ] Búsqueda por texto en múltiples campos
- [ ] Operadores lógicos (AND, OR, NOT)
- [ ] Filtros numéricos (mayor que, menor que, entre)

#### Filtros Guardados
- [ ] Tabla `filtros_guardados` en base de datos
- [ ] Guardar combinaciones de filtros con nombre
- [ ] Aplicar filtros guardados con un click
- [ ] Compartir filtros entre usuarios del mismo tenant
- [ ] Filtros predefinidos del sistema

#### Optimización de Búsqueda
- [ ] Índices en columnas frecuentemente buscadas
- [ ] Full-text search con PostgreSQL (tsvector)
- [ ] Debouncing en búsqueda en tiempo real
- [ ] Caché de resultados frecuentes
- [ ] Paginación eficiente de resultados

### Estimación
**Duración:** 5-7 horas  
**Complejidad:** Media-Alta  
**Prioridad:** Alta

---

## 📤 Fase 7 - Exportación e Importación de Datos (PENDIENTE)

### Objetivos
Facilitar la gestión masiva de datos mediante importación y exportación en múltiples formatos.

### Funcionalidades a Implementar

#### Exportación a Excel/CSV
- [ ] Instalar biblioteca `xlsx` o `exceljs`
- [ ] Exportar listado completo de plantas
- [ ] Exportar tareas con filtros aplicados
- [ ] Exportar historial clínico
- [ ] Exportar reportes de inventario
- [ ] Formato personalizable (columnas seleccionables)

#### Importación Masiva
- [ ] Template Excel descargable para plantas
- [ ] Validación de datos importados (tipos, formatos, referencias)
- [ ] Preview de datos antes de importar
- [ ] Manejo de errores con reporte detallado
- [ ] Importación parcial (continuar con válidos)
- [ ] Rollback en caso de error crítico

#### Exportación de Reportes PDF
- [ ] Integrar `react-pdf` o `jsPDF`
- [ ] Templates profesionales con logo
- [ ] Reporte de plantas con imágenes
- [ ] Reporte de tareas por período
- [ ] Gráficos incluidos en PDF
- [ ] Configuración de header/footer

### Estimación
**Duración:** 4-6 horas  
**Complejidad:** Media  
**Prioridad:** Media

---

## 👥 Fase 8 - Sistema de Roles y Permisos Avanzado (PENDIENTE)

### Objetivos
Implementar un sistema robusto de roles y permisos para equipos de trabajo.

### Esquema de Base de Datos Propuesto

#### Tabla `roles`
```sql
CREATE TABLE roles (
  id_rol SERIAL PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL, -- Admin, Manager, Operador, Viewer
  descripcion TEXT,
  es_sistema BOOLEAN DEFAULT false -- roles predefinidos
);
```

#### Tabla `permisos`
```sql
CREATE TABLE permisos (
  id_permiso SERIAL PRIMARY KEY,
  recurso VARCHAR(50) NOT NULL, -- plantas, tareas, inventario, etc.
  accion VARCHAR(20) NOT NULL, -- crear, leer, actualizar, eliminar
  descripcion TEXT
);
```

#### Tabla `roles_permisos`
```sql
CREATE TABLE roles_permisos (
  id_rol INTEGER REFERENCES roles(id_rol),
  id_permiso INTEGER REFERENCES permisos(id_permiso),
  PRIMARY KEY (id_rol, id_permiso)
);
```

#### Modificar Tabla `users`
```sql
ALTER TABLE users
ADD COLUMN id_rol INTEGER REFERENCES roles(id_rol) DEFAULT 4; -- Viewer por defecto
```

### Funcionalidades a Implementar

#### Roles Predefinidos
- **Admin** - Acceso total al sistema
- **Manager** - Gestión de plantas, tareas, reportes
- **Operador** - Crear/editar plantas y tareas asignadas
- **Viewer** - Solo lectura

#### Middleware de Autorización
- [ ] Verificar permisos en rutas API
- [ ] HOC `withPermission` para proteger componentes
- [ ] Hook `usePermission` para verificar permisos
- [ ] Middleware de Next.js para rutas protegidas

#### UI de Gestión de Roles
- [ ] Página de administración de roles
- [ ] Asignar roles a usuarios
- [ ] Configurar permisos por rol
- [ ] Vista de permisos efectivos por usuario

#### Logs de Auditoría
- [ ] Tabla `audit_logs` con acciones críticas
- [ ] Registrar: quién, qué, cuándo, desde dónde
- [ ] Vista de logs para administradores
- [ ] Filtros por usuario, acción, fecha
- [ ] Exportación de logs

### Estimación
**Duración:** 8-10 horas  
**Complejidad:** Alta  
**Prioridad:** Media (para equipos grandes)

---

## ✅ Fase 9 - Testing E2E (PENDIENTE)

### Objetivos
Garantizar la calidad del código mediante tests end-to-end automatizados.

### Funcionalidades a Implementar

#### Configuración de Playwright
- [ ] Instalar `@playwright/test`
- [ ] Configurar `playwright.config.ts`
- [ ] Setup de base de datos de prueba
- [ ] Fixtures para datos de prueba

#### Tests E2E Críticos
- [ ] **Autenticación**
  - Login exitoso
  - Login con credenciales incorrectas
  - Registro de nuevo usuario
  - Logout
- [ ] **CRUD de Plantas**
  - Crear planta con todos los campos
  - Editar planta existente
  - Eliminar planta
  - Listar y filtrar plantas
- [ ] **Tareas**
  - Crear tarea
  - Marcar como completada
  - Editar tarea
  - Filtrar por estado
- [ ] **Upload de Imágenes**
  - Subir imagen de planta
  - Validación de formato
  - Previsualización

#### Integración con CI/CD
- [ ] Agregar step en GitHub Actions
- [ ] Ejecutar tests en cada PR
- [ ] Screenshots automáticos en caso de fallo
- [ ] Reportes de cobertura

### Estimación
**Duración:** 6-8 horas  
**Complejidad:** Media  
**Prioridad:** Alta (para producción)

---

## 🎨 Fase 10 - Mejoras de UX/UI (PENDIENTE)

### Objetivos
Elevar la experiencia de usuario con animaciones, interacciones y mejoras visuales.

### Funcionalidades a Implementar

#### Animaciones con Framer Motion
- [ ] Instalar `framer-motion`
- [ ] Transiciones suaves entre páginas
- [ ] Micro-interacciones en botones y cards
- [ ] Animaciones de entrada/salida de modales
- [ ] Efectos de hover mejorados

#### Skeletons en lugar de Spinners
- [ ] Skeleton para tablas de datos
- [ ] Skeleton para cards de dashboard
- [ ] Skeleton para formularios
- [ ] Skeleton para listas
- [ ] Estados de carga más naturales

#### Drag & Drop
- [ ] Instalar `@dnd-kit/core`
- [ ] Reordenar tareas por prioridad
- [ ] Organizar plantas en vistas personalizadas
- [ ] Arrastrar para asignar tareas
- [ ] Feedback visual durante drag

#### Onboarding Interactivo
- [ ] Tour guiado para nuevos usuarios
- [ ] Tips contextuales en primera visita
- [ ] Wizard de configuración inicial
- [ ] Checklist de primeros pasos
- [ ] Video tutoriales embebidos

### Estimación
**Duración:** 5-7 horas  
**Complejidad:** Media  
**Prioridad:** Baja (mejora incremental)

---

## 📈 Métricas de Progreso

### Estado Actual
- **Fases completadas:** 4 de 10 (40%)
- **Características implementadas:** ~45
- **Características pendientes:** ~60
- **Tiempo invertido:** ~20 horas
- **Tiempo estimado restante:** ~45 horas

### Próximos Pasos Recomendados
1. **Gestión de Inventario** - Alto impacto para usuarios avanzados
2. **Búsqueda Avanzada** - Mejora significativa de UX
3. **Testing E2E** - Fundamental para estabilidad

---

## 🎯 Conclusión

Este plan maestro proporciona una hoja de ruta clara para el desarrollo continuo de Vivero SaaS. Cada fase está diseñada para agregar valor incremental y puede ser implementada de forma independiente.

**Última actualización:** Enero 2026  
**Próxima revisión:** Febrero 2026

# 📋 Product Requirements Document (PRD)
## Vivero SaaS - Sistema de Gestión para Viveros

**Versión:** 1.2.0
**Fecha:** Enero 2026
**Estado:** Implementado (Fase 1 + Analytics + Notificaciones + PWA + Subgéneros Completos)

---

## 🎯 Visión del Producto

**Vivero SaaS** es una plataforma multi-tenant completa para la gestión integral de viveros, diseñada para viveristas profesionales que necesitan herramientas eficientes para el manejo de grandes colecciones de plantas.

### Objetivos Principales
- ✅ **Digitalizar** la gestión tradicional de viveros
- ✅ **Optimizar** procesos de mantenimiento y cuidado
- ✅ **Proporcionar** información histórica y predictiva
- ✅ **Escalar** operaciones con arquitectura multi-tenant

---

## 👥 Personas y Usuarios

### 👤 Viverista Profesional (Usuario Principal)
- **Perfil**: Propietario o encargado de vivero
- **Necesidades**: Gestión eficiente de 100-1000+ plantas
- **Dolor actual**: Seguimiento manual, pérdida de información
- **Beneficio esperado**: Sistema centralizado y automatizado

### 👥 Equipo de Mantenimiento
- **Perfil**: Personal encargado del cuidado diario
- **Necesidades**: Tareas claras, historial de tratamientos
- **Dolor actual**: Comunicación verbal, olvidos
- **Beneficio esperado**: Asignación clara y seguimiento

### 📊 Administrador de Vivero
- **Perfil**: Gerente o propietario
- **Necesidades**: Reportes, estadísticas, planificación
- **Dolor actual**: Falta de métricas objetivas
- **Beneficio esperado**: Insights basados en datos

---

## 📋 Requerimientos Funcionales

### 🔐 RF-001: Autenticación y Autorización
**Prioridad:** Crítica
**Estado:** ✅ Implementado

**Descripción:**
- Sistema de registro e inicio de sesión seguro
- Recuperación de contraseña
- Protección de rutas sensibles
- Sesiones persistentes

**Criterios de Aceptación:**
- ✅ Autenticación con Supabase Auth
- ✅ Middleware de protección de rutas
- ✅ Redirección automática post-login
- ✅ Manejo de errores de credenciales

### 🏢 RF-002: Arquitectura Multi-Tenant
**Prioridad:** Crítica
**Estado:** ✅ Implementado

**Descripción:**
- Aislamiento completo de datos por tenant
- Gestión de usuarios por organización
- Seguridad a nivel de base de datos
- Escalabilidad horizontal

**Criterios de Aceptación:**
- ✅ RLS implementado en todas las tablas
- ✅ Asociación automática usuario-tenant
- ✅ Filtros automáticos por tenant_id
- ✅ Políticas de seguridad auditables

### 🌿 RF-003: Gestión de Plantas (CRUD Completo)
**Prioridad:** Crítica
**Estado:** ✅ Implementado

**Descripción:**
- Alta, baja, modificación y consulta de plantas
- Información completa: nombre, tipo, género, maceta
- Estados de salud: Normal, Enferma, Muerta
- Eliminación suave (soft delete)

**Funcionalidades Específicas:**
- ✅ Formulario de creación con validaciones
- ✅ Tabla responsive con filtros
- ✅ Estados visuales diferenciados
- ✅ Vista detallada por planta
- ✅ Edición in-place
- ✅ Eliminación con confirmación

**Criterios de Aceptación:**
- ✅ Todos los campos requeridos validados
- ✅ Estados de carga apropiados
- ✅ Feedback visual de operaciones
- ✅ Persistencia en base de datos

### 📋 RF-004: Sistema de Tareas
**Prioridad:** Alta
**Estado:** ✅ Implementado

**Descripción:**
- Gestión completa de tareas de mantenimiento
- Fechas programadas con validación
- Estados: Pendiente, Completada
- Asociación opcional con plantas

**Funcionalidades Específicas:**
- ✅ CRUD completo de tareas
- ✅ Filtros por estado (Todas, Pendientes, Completadas)
- ✅ Acceso directo desde tabla de plantas
- ✅ Preselección automática de planta
- ✅ Validación de fechas futuras
- ✅ Estados visuales diferenciados

**Criterios de Aceptación:**
- ✅ Creación rápida desde múltiples puntos
- ✅ Validación de fecha programada
- ✅ Actualización de estado optimista
- ✅ Persistencia en tiempo real

### 🩺 RF-005: Historial Clínico
**Prioridad:** Alta
**Estado:** ✅ Implementado

**Descripción:**
- Registro cronológico del estado de salud
- Tratamientos aplicados y observaciones
- Indicadores de enfermedad
- Historial completo por planta

**Funcionalidades Específicas:**
- ✅ Registro médico por planta
- ✅ Historial cronológico ordenado
- ✅ Estados visuales (Saludable/Enfermo)
- ✅ Acceso directo desde plantas
- ✅ Preselección automática de planta
- ✅ Validación de fechas pasadas

**Criterios de Aceptación:**
- ✅ Asociación correcta con plantas
- ✅ Ordenamiento cronológico
- ✅ Estados visuales diferenciados
- ✅ Validación de fechas históricas

### 👤 RF-006: Perfil de Usuario
**Prioridad:** Alta
**Estado:** ✅ Implementado

**Descripción:**
- Gestión completa del perfil de usuario
- Avatar personalizado con upload
- Información personal editable
- Seguridad en manejo de archivos

**Funcionalidades Específicas:**
- ✅ Página de perfil protegida (/perfil)
- ✅ Visualización de avatar, email y nombre
- ✅ Edición del nombre de usuario
- ✅ Upload de avatar con preview
- ✅ Conversión automática a WebP
- ✅ Almacenamiento privado en Supabase Storage
- ✅ Estados de carga y validaciones
- ✅ Notificaciones toast para feedback

**Criterios de Aceptación:**
- ✅ Avatar se muestra en menú de usuario
- ✅ Preview antes de guardar cambios
- ✅ Validación de tipos de archivo (JPG, PNG, WebP)
- ✅ Límite de tamaño de archivo (5MB)
- ✅ Procesamiento de imagen (redimensionamiento 400x400px)
- ✅ Signed URLs para acceso privado
- ✅ Revalidación automática de caché

### 🎨 RF-007: Interfaz de Usuario Moderna
**Prioridad:** Alta
**Estado:** ✅ Implementado

**Descripción:**
- UI/UX moderna y responsiva
- Componentes accesibles
- Tema claro/oscuro
- Feedback visual consistente

**Funcionalidades Específicas:**
- ✅ Diseño responsive (mobile-first)
- ✅ Componentes shadcn/ui
- ✅ Tema integrado
- ✅ Estados de carga informativos
- ✅ Notificaciones toast
- ✅ Iconografía consistente

**Criterios de Aceptación:**
- ✅ Navegación intuitiva
- ✅ Feedback inmediato
- ✅ Accesibilidad WCAG 2.1
- ✅ Performance >90 en Lighthouse

### 📊 RF-008: Dashboard y Reportes
**Prioridad:** Media
**Estado:** ✅ Implementado (Básico)

**Descripción:**
- Vista general del estado del vivero
- Estadísticas en tiempo real
- KPIs principales
- Reportes básicos

**Funcionalidades Específicas:**
- ✅ Conteo de plantas por estado
- ✅ Tareas pendientes y completadas
- ✅ Historial médico resumido
- ✅ Accesos directos a módulos

**Criterios de Aceptación:**
- ✅ Datos actualizados en tiempo real
- ✅ Métricas relevantes para viveristas
- ✅ Navegación intuitiva

---

## 🔧 Requerimientos No Funcionales

### 🛡️ RNF-001: Seguridad
**Prioridad:** Crítica

- ✅ Autenticación JWT con Supabase
- ✅ Encriptación de datos sensibles
- ✅ Validación de entrada en múltiples capas
- ✅ Protección contra ataques comunes (XSS, CSRF)
- ✅ Auditoría de operaciones críticas

### ⚡ RNF-002: Performance
**Prioridad:** Alta

- ✅ Tiempo de carga < 2 segundos
- ✅ Optimización con React.memo
- ✅ Lazy loading de componentes
- ✅ Consultas de BD optimizadas
- ✅ Caché inteligente

### 📱 RNF-003: Compatibilidad
**Prioridad:** Alta

- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Navegadores modernos (Chrome, Firefox, Safari, Edge)
- ✅ Node.js 20+ para desarrollo
- ✅ Next.js 16+ compatible

### 🔄 RNF-004: Mantenibilidad
**Prioridad:** Alta

- ✅ TypeScript estricto (sin any)
- ✅ ESLint configurado
- ✅ Arquitectura modular
- ✅ Documentación actualizada
- ✅ Tests preparados (estructura)

---

## 🗂️ Estructura de Base de Datos

### Tablas Implementadas

#### `tenants` - Organizaciones
```sql
- id_tenant: UUID (PK)
- nombre: TEXT
- plan: TEXT
- activo: BOOLEAN
- created_at: TIMESTAMP
```

#### `users` - Usuarios
```sql
- id_user: UUID (PK, FK auth.users)
- id_tenant: UUID (FK)
- nombre: TEXT
- avatar_url: TEXT
- rol: TEXT
- activo: BOOLEAN
- created_at: TIMESTAMP
```

#### `plantas` - Plantas
```sql
- id_planta: BIGINT (PK)
- id_tenant: UUID (FK)
- nombre: TEXT
- floracion: BOOLEAN
- fecha_compra: DATE
- fecha_transplante: DATE
- iluminacion: TEXT
- esta_enferma: BOOLEAN
- esta_muerta: BOOLEAN
- id_maceta: BIGINT (FK)
- id_genero: BIGINT (FK)
- id_tipo: SMALLINT (FK)
- observaciones: TEXT
- created_at: TIMESTAMP
- deleted_at: TIMESTAMP
```

#### `tareas` - Tareas de Mantenimiento
```sql
- id_tarea: BIGINT (PK)
- id_tenant: UUID (FK)
- titulo: TEXT
- descripcion: TEXT
- fecha_programada: DATE
- completada: BOOLEAN
- id_planta: BIGINT (FK, opcional)
- created_at: TIMESTAMP
```

#### `historia_clinica` - Registros Médicos
```sql
- id_historia: BIGINT (PK)
- id_tenant: UUID (FK)
- id_planta: BIGINT (FK)
- fecha: DATE
- descripcion: TEXT
- tratamiento: TEXT
- estuvo_enferma: BOOLEAN
- created_at: TIMESTAMP
```

---

## 🔄 Estados de Implementación

### ✅ Fase 1 - MVP Completo (100% Implementado)
- [x] **Autenticación completa** con Supabase Auth
- [x] **Arquitectura multi-tenant** con RLS
- [x] **CRUD completo de plantas** con estados de salud
- [x] **Sistema de tareas avanzado** con filtros
- [x] **Historial clínico integral** con tratamientos
- [x] **Dashboard básico** con estadísticas
- [x] **UI/UX moderna** con shadcn/ui
- [x] **Perfil de usuario** con avatar y gestión personal
- [x] **Testing completo** con 27 tests automatizados
- [x] **CI/CD pipeline** con GitHub Actions
- [x] **Build limpio** sin errores de TypeScript

### 🔄 Fase 2 - Testing & Calidad Avanzada
- [ ] **Tests E2E** con Playwright/Cypress
- [ ] **Performance testing** con Lighthouse CI
- [ ] **Accessibility testing** con axe-core
- [ ] **Load testing** para múltiples tenants
- [ ] **Security testing** automatizado

### 🔄 Fase 3 - Características Avanzadas
- [ ] **Sistema de inventario** (macetas, materiales)
- [ ] **Upload de imágenes** para plantas
- [ ] **Reportes avanzados** con gráficos
- [ ] **Notificaciones push** inteligentes
- [ ] **API REST completa** para integraciones
- [ ] **Dashboard avanzado** con analytics

### 🔄 Fase 3 - Escalabilidad (Futuro)
- [ ] **Roles avanzados**
- [ ] **Multi-tenancy avanzado**
- [ ] **Integraciones externas**
- [ ] **Analytics avanzado**
- [ ] **Machine Learning**

---

## 🧪 Plan de Testing

### ✅ Pruebas Unitarias (Implementadas)
**Estado:** ✅ Completo - 27 tests implementados
- ✅ **Componentes React** con Testing Library
- ✅ **Server Actions** con mocks de Supabase
- ✅ **Páginas** con integración completa
- ✅ **Validaciones de formularios** automatizadas
- ✅ **Gestión de estado** probada
- ✅ **Interacciones de usuario** simuladas

### ✅ Pruebas de Integración
- ✅ **Flujos completos** probados automáticamente
- ✅ **Operaciones CRUD** verificadas
- ✅ **Relaciones de datos** validadas
- ✅ **Estados de UI** confirmados
- ✅ **Autenticación** probada
- ✅ **Multi-tenancy** validado

### 🔄 Pruebas E2E (Próximas Fases)
- [ ] **Playwright/Cypress** para flujos críticos
- [ ] **Autenticación completa** end-to-end
- [ ] **Operaciones multi-tenant** integrales
- [ ] **Performance testing** con Lighthouse CI

### 📊 Cobertura de Testing
- **27 tests** activos y pasando
- **Jest + Testing Library** configurado
- **CI/CD** con testing automático
- **Cobertura configurada** con reportes
- **Git hooks** con pre-commit validation

---

## 📊 Métricas de Éxito

### KPIs Técnicos
- **Performance**: Lighthouse Score > 90 ✅
- **Tiempo de carga**: < 2 segundos ✅
- **Build**: 0 errores de TypeScript ✅
- **Testing**: 27 tests pasando ✅
- **Cobertura**: Framework configurado ✅
- **CI/CD**: Pipeline automatizado ✅
- **Disponibilidad**: 99.9% uptime
- **Errores**: < 0.1% de requests con error

### KPIs de Negocio
- **Adopción**: 80% de flujos principales usados
- **Eficiencia**: 60% reducción en tiempo de tareas administrativas
- **Satisfacción**: NPS > 70
- **Retención**: 85% de usuarios activos mensuales

---

## 🚀 Estrategia de Lanzamiento

### Lanzamiento Alfa (Interno)
- ✅ **Funcionalidades core** implementadas
- ✅ **Testing automático** implementado (27 tests)
- ✅ **CI/CD pipeline** configurado
- ✅ **Build limpio** sin errores
- ✅ **Documentación** preparada
- ✅ **Perfil de usuario** funcional

### Lanzamiento Beta (Usuarios Piloto)
- [ ] **Feedback de usuarios reales**
- [ ] **Ajustes basados en uso real**
- [ ] **Performance en producción**

### Lanzamiento General
- [ ] **Marketing y adquisición**
- [ ] **Soporte preparado**
- [ ] **Monitoreo continuo**

---

## 📞 Contactos y Responsabilidades

### Equipo de Desarrollo
- **Arquitectura**: Diseño de sistema y base de datos
- **Frontend**: UI/UX y experiencia de usuario
- **Backend**: APIs y lógica de negocio
- **DevOps**: Despliegue y monitoreo

### Stakeholders
- **Product Owner**: Definición de requerimientos
- **Usuarios Piloto**: Validación de funcionalidades
- **Equipo de Soporte**: Asistencia post-lanzamiento

---

## 🔄 Plan de Mantenimiento

### Actualizaciones Programadas
- **Semanal**: Parches de seguridad
- **Mensual**: Mejoras menores
- **Trimestral**: Nuevas funcionalidades
- **Anual**: Actualizaciones mayores

### Monitoreo Continuo
- **Performance**: Métricas de velocidad
- **Disponibilidad**: Uptime y latencia
- **Errores**: Logs y alertas
- **Uso**: Analytics de usuario

---

*Este PRD se actualiza conforme evoluciona el producto. Última actualización: Enero 2026 - v1.2.0 con PWA, Subgéneros y Mejoras en Macetas*

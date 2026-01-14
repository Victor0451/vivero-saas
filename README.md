# 🌱 Vivero SaaS

[![CI/CD Pipeline](https://github.com/your-username/vivero-saas/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/vivero-saas/actions/workflows/ci.yml)
[![Test Coverage](https://codecov.io/gh/your-username/vivero-saas/branch/main/graph/badge.svg)](https://codecov.io/gh/your-username/vivero-saas)
[![Tests](https://img.shields.io/badge/tests-27%20passed-brightgreen)](https://github.com/your-username/vivero-saas/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.0-black)](https://nextjs.org/)

Una aplicación SaaS multi-tenant completa para la gestión integral de viveros, construida con tecnologías modernas y mejores prácticas de desarrollo.

## ✨ Características Principales

### 🏢 Arquitectura Multi-Tenant
- **Aislamiento completo de datos** con Row Level Security (RLS)
- **Autenticación robusta** con Supabase Auth
- **Gestión de tenants** con roles y permisos
- **Seguridad a nivel de base de datos**

### 🌿 Gestión Completa de Plantas
- **CRUD completo** de plantas con información detallada
- **Estados de salud** (Normal, Enferma, Muerta) con indicadores visuales
- **Información completa**: tipo, género, maceta, fecha de compra, floración
- **Observaciones y notas** personalizables
- **Sistema de eliminación suave** (soft delete)
- **Accesos directos** desde tabla para crear tareas e historial

### 📂 Catálogos de Referencia
- **Géneros de plantas** - CRUD completo con descripciones opcionales
- **Subgéneros de plantas** - Clasificación jerárquica bajo géneros ✨ **NUEVO v1.2.0**
- **Creación rápida** - Dialog para crear género + subgénero en un paso ✨ **NUEVO v1.2.0**
- **Macetas disponibles** - Gestión con unidades configurables (cm/in/mm, L/ml/gal) ✨ **NUEVO v1.2.0**
- **Materiales estandarizados** - Select con opciones predefinidas ✨ **NUEVO v1.2.0**
- **Catálogos multi-tenant** - Datos específicos por vivero
- **Validaciones robustas** en todos los campos

### 📋 Sistema de Tareas Avanzado
- **Gestión completa de tareas** de mantenimiento
- **Fechas programadas** con validación futura
- **Estados de completado** con indicadores visuales
- **Asociación opcional** con plantas específicas
- **Accesos directos** desde la tabla de plantas
- **Filtros avanzados** (Todas, Pendientes, Completadas)

### 🩺 Historial Clínico Integral
- **Registro de estado de salud** de plantas
- **Seguimiento médico** con tratamientos y observaciones
- **Historial cronológico** ordenado por fecha
- **Indicadores de enfermedad** con colores diferenciados
- **Accesos directos** desde plantas específicas
- **Vista general** de todo el historial clínico

### 🎨 Interfaz de Usuario Moderna
- **Diseño responsivo** con Tailwind CSS
- **Componentes accesibles** con shadcn/ui
- **Tema claro/oscuro** integrado
- **Animaciones sutiles** y transiciones suaves
- **Estados de carga** informativos
- **Notificaciones toast** para feedback

### ⚡ Optimizaciones de Performance
- **Memoización de componentes** con React.memo
- **useCallback hooks** para evitar re-renders
- **Lazy loading** y estados de carga optimizados
- **Revalidación inteligente** de caché
- **Queries optimizadas** con joins eficientes

### 👤 Gestión de Perfil de Usuario
- **Perfil personal completo** con avatar y datos
- **Upload de avatar** con procesamiento automático
- **Edición de información** personal segura
- **Vista integrada** en menú de navegación
- **Validaciones completas** y feedback visual

### 🔒 Validaciones y Seguridad
- **Validaciones robustas** en frontend y backend
- **TypeScript completo** para type safety
- **Manejo de errores** elegante con UX mejorada
- **Protección de rutas** con middleware
- **Validaciones de formularios** en tiempo real

### 📱 PWA (Progressive Web App) ✨ **NUEVO v1.2.0**
- **Aplicación instalable** en dispositivos móviles y desktop
- **Funcionamiento offline** con estrategias de caché inteligentes
- **Service Worker** optimizado para Supabase, imágenes y fuentes
- **Indicador de conexión** con notificaciones de estado
- **Prompt de instalación** con lógica de descarte (7 días)
- **Manifest configurado** con iconos y shortcuts
- **Nota:** Deshabilitado temporalmente en producción (v1.3.0) para optimización de builds

### 📦 Gestión de Inventario ✨ **NUEVO v1.3.0**
- **Control de existencias** de herramientas y materiales
- **Movimientos de stock** (Entradas/Salidas/Ajustes)
- **Integración con tareas** - Descuento automático al usar materiales
- **Alertas de stock bajo** visuales y en dashboard
- **Categorización** flexible de items


## 🛠️ Tecnologías Utilizadas

### Frontend
- **Next.js 16** - React framework con App Router
- **TypeScript** - Type safety completo
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Componentes UI accesibles y modernos
- **React Hook Form** - Gestión eficiente de formularios
- **Zod** - Validación de esquemas TypeScript
- **Sonner** - Notificaciones toast elegantes
- **Lucide React** - Iconos consistentes
- **date-fns** - Manipulación de fechas

### Backend & Base de Datos
- **Supabase** - Backend-as-a-Service completo
- **PostgreSQL** - Base de datos robusta con RLS
- **Supabase Auth** - Autenticación segura
- **Supabase Storage** - Gestión de archivos (futuro)
- **Row Level Security** - Aislamiento de datos multi-tenant

### PWA & Offline
- **next-pwa** - Progressive Web App support
- **Service Worker** - Estrategias de caché optimizadas
- **Workbox** - Gestión avanzada de caché

### Testing & Calidad
- **Jest + Testing Library** - Framework de testing completo
- **27 tests** implementados y pasando ✅
- **Componentes UI** - Tests de renderizado e interacciones
- **Server Actions** - Tests de lógica backend con mocks
- **Páginas** - Tests de integración completa
- **Perfil de Usuario** - Tests de upload y gestión
- **Cobertura configurada** con reportes automáticos
- **Git hooks** con Husky para calidad pre-commit

### DevOps & CI/CD
- **GitHub Actions** - Pipelines automatizados completos
- **Multi-environment** - Testing en Node.js 18.x, 20.x, 25.x
- **Security scans** - Análisis CodeQL automático
- **Build verification** - Tests + Linting + TypeScript ✅
- **Deploy automation** - Staging/Production separado
- **Codecov integration** - Reportes de cobertura
- **Husky pre-commit** - Validación automática
- **Build exitoso** - Sin errores de TypeScript ✅

### Despliegue
- **Vercel** - Platform as a Service optimizada
- **CI/CD** - Despliegue automático (futuro)

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up Supabase project and configure environment variables in `.env.local`
4. Create the database tables as per the schema
5. Configure RLS policies for multi-tenant data isolation
6. Run the development server: `npm run dev`

## Environment Variables

Create a `.env.local` file with:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Database Schema

The application expects the following tables (already existing):

- tenants
- users
- tipos_planta
- generos_planta
- **subgeneros_planta** ✨ **NUEVO v1.2.0**
- macetas (con columnas de unidades) ✨ **ACTUALIZADO v1.2.0**
- plantas (con id_subgenero opcional) ✨ **ACTUALIZADO v1.2.0**
- historia_clinica
- tareas
- notificaciones ✨ **NUEVO v1.1.0**
- preferencias_notificaciones ✨ **NUEVO v1.1.0**

Ensure RLS is enabled and policies are set to filter by tenant.

## Mermaid

erDiagram
    TENANTS {
        uuid id_tenant PK
        text nombre
        text plan
        boolean activo
        timestamp created_at
    }

    AUTH_USERS {
        uuid id PK
        text email
        timestamp created_at
    }

    USERS {
        uuid id_user PK
        uuid id_tenant FK
        text rol
        boolean activo
        timestamp created_at
    }

    TIPOS_PLANTA {
        smallint id_tipo PK
        text nombre
    }

    GENEROS_PLANTA {
        bigint id_genero PK
        uuid id_tenant FK
        text nombre
        text descripcion
    }

    MACETAS {
        bigint id_maceta PK
        uuid id_tenant FK
        text tipo
        text material
        numeric diametro_cm
        numeric altura_cm
        numeric volumen_lts
        timestamp created_at
    }

    PLANTAS {
        bigint id_planta PK
        uuid id_tenant FK
        text nombre
        boolean floracion
        date fecha_compra
        date fecha_transplante
        text iluminacion
        boolean esta_enferma
        boolean esta_muerta
        bigint id_maceta FK
        bigint id_genero FK
        smallint id_tipo FK
        text observaciones
        timestamp created_at
        timestamp deleted_at
    }

    HISTORIA_CLINICA {
        bigint id_historia PK
        uuid id_tenant FK
        bigint id_planta FK
        date fecha
        text descripcion
        text tratamiento
        boolean estuvo_enferma
        timestamp created_at
    }

    TAREAS {
        bigint id_tarea PK
        uuid id_tenant FK
        bigint id_planta FK
        text titulo
        text descripcion
        date fecha_programada
        boolean completada
        timestamp created_at
    }

    INVITACIONES {
        uuid id_invitacion PK
        text email
        uuid id_tenant FK
        text rol
        boolean aceptada
        timestamp created_at
    }

    %% Relaciones
    TENANTS ||--o{ USERS : tiene
    AUTH_USERS ||--|| USERS : referencia
    TENANTS ||--o{ GENEROS_PLANTA : define
    TENANTS ||--o{ MACETAS : define
    TENANTS ||--o{ PLANTAS : posee
    TENANTS ||--o{ TAREAS : organiza
    TENANTS ||--o{ HISTORIA_CLINICA : registra
    TENANTS ||--o{ INVITACIONES : invita

    TIPOS_PLANTA ||--o{ PLANTAS : clasifica
    GENEROS_PLANTA ||--o{ PLANTAS : agrupa
    MACETAS ||--o{ PLANTAS : contiene
    PLANTAS ||--o{ HISTORIA_CLINICA : tiene
    PLANTAS ||--o{ TAREAS : genera


## 🚀 Guía de Inicio Rápido

### Configuración Inicial
1. **Registro/Inicio de sesión** - Crea tu cuenta o accede al sistema
2. **Dashboard principal** - Visualiza estadísticas generales
3. **Gestión de plantas** - Comienza agregando tus primeras plantas

### Navegación del Sistema

#### 📊 Dashboard
- **Estadísticas en tiempo real** de plantas, tareas y salud
- **Vista general** del estado del vivero
- **Acceso rápido** a módulos principales

#### 🌿 Plantas
- **Tabla informativa** con estado, fecha de compra y floración
- **Accesos directos** para crear tareas e historial médico
- **Vista detallada** por planta con toda su información
- **CRUD completo** con eliminación suave

#### 📂 Catálogos
- **Géneros de Plantas** - Gestión completa con descripciones
- **Macetas** - Control de tipos, materiales y dimensiones
- **Organización jerárquica** en el menú lateral

#### 📋 Tareas
- **Lista de tareas** con filtros (Todas, Pendientes, Completadas)
- **Estados visuales** para tareas completadas
- **Fechas programadas** con validación
- **Asociación opcional** con plantas específicas

#### 🩺 Historial Clínico
- **Vista general** de toda la historia médica
- **Registros cronológicos** por fecha
- **Estados de salud** diferenciados visualmente
- **Información detallada** de tratamientos aplicados

#### 👤 Perfil de Usuario
- **Vista de perfil completa** con avatar, email y nombre
- **Edición de información** personal con validaciones
- **Upload de avatar** con drag & drop y explorador de archivos
- **Preview en tiempo real** antes de guardar cambios
- **Procesamiento automático** (WebP, redimensionamiento 400x400px)
- **Avatar visible** en menú de navegación
- **Feedback visual** con notificaciones toast

### Flujos de Trabajo Óptimos

#### ✅ Agregar Nueva Planta
1. Ir a "Plantas" → "Nueva Planta"
2. Completar información básica
3. Sistema automáticamente sugiere crear primera tarea
4. Registrar estado de salud inicial

#### ✅ Mantenimiento Diario
1. Revisar dashboard para tareas pendientes
2. Completar tareas programadas
3. Registrar tratamientos aplicados
4. Actualizar estados de salud

#### ✅ Seguimiento Médico
1. Acceder a historial clínico desde planta específica
2. Registrar síntomas y tratamientos
3. Marcar estados de enfermedad
4. Revisar evolución histórica

#### ✅ Gestión de Perfil
1. Acceder a "Perfil" desde menú de usuario
2. Visualizar información actual con avatar
3. Editar nombre o cambiar avatar
4. Ver preview de cambios antes de guardar
5. Confirmar cambios con feedback visual

## 🏗️ Arquitectura del Sistema

### Estructura Multi-Capa
```
📁 src/
├── 🗂️ app/                 # Next.js App Router
│   ├── (auth)/            # Rutas de autenticación
│   ├── (dashboard)/       # Rutas protegidas del dashboard
│   │   ├── catalogos/     # Gestión de catálogos
│   │   │   ├── generos/   # CRUD géneros de plantas
│   │   │   └── macetas/   # CRUD macetas
│   │   └── ...            # Otros módulos
│   └── actions/           # Server Actions (Backend)
├── 🧩 components/         # Componentes React reutilizables
│   ├── ui/               # Componentes base (shadcn/ui)
│   └── ...               # Componentes específicos
├── 🔧 lib/               # Utilidades y configuraciones
└── 📋 types/             # Definiciones TypeScript
```

### Principios de Diseño
- **Componentes Atómicos**: UI modular y reutilizable
- **Separación de Responsabilidades**: Frontend/Backend claramente delimitados
- **Type Safety**: TypeScript completo en toda la aplicación
- **Performance**: Optimizaciones con React.memo y useCallback
- **Accesibilidad**: Componentes ARIA-compliant con shadcn/ui

### Seguridad Implementada
- **Row Level Security** en todas las tablas
- **Validación en múltiples capas** (Frontend + Backend)
- **Protección de rutas** con middleware
- **Sanitización de datos** automática
- **Gestión segura de sesiones**

## 📊 Métricas de Calidad

### ✅ **Testing Completado al 100%**
- ✅ **27 tests** implementados y pasando en CI/CD
- ✅ **Framework Jest** completamente configurado
- ✅ **Testing Library** para componentes React
- ✅ **Server Actions** testeadas con mocks Supabase
- ✅ **Páginas** testeadas con integración completa
- ✅ **Perfil de usuario** completamente testeado
- ✅ **CI/CD pipeline** funcional y automatizado
- ✅ **Git hooks** con Husky para pre-commit
- ✅ **Build exitoso** sin errores de TypeScript

### ✅ **Código y Arquitectura**
- ✅ **0 errores críticos** de linting
- ✅ **TypeScript estricto** implementado
- ✅ **Build limpio** verificado en múltiples Node.js
- ✅ **Cobertura de validaciones** completa
- ✅ **Performance optimizada** con memoización
- ✅ **Código mantenible** con arquitectura clara
- ✅ **Documentación** completa y actualizada

## 📋 Documentación Adicional

- **[PRD Completo](PRD.md)** - Product Requirements Document detallado
- **[README Database](README_DATABASE.md)** - Documentación técnica de BD
- **[Setup Storage](SETUP_STORAGE.md)** - Configuración de archivos estáticos

## 🔄 Próximas Funcionalidades (Roadmap)

### ✅ **Fase 1 - MVP Completo (100% Implementado)**
- [x] **Arquitectura multi-tenant** sólida con RLS ✅
- [x] **Gestión completa de plantas** con estados de salud ✅
- [x] **Sistema de tareas avanzado** con filtros dinámicos ✅
- [x] **Historial clínico integral** con tratamientos ✅
- [x] **Catálogos completos** - Géneros, Subgéneros y Macetas ✅
- [x] **Perfil de usuario** con avatar y gestión personal ✅
- [x] **Testing completo** - 27 tests automatizados ✅
- [x] **CI/CD pipeline** con GitHub Actions ✅
- [x] **Build limpio** sin errores de TypeScript ✅
- [x] **Dashboard con Analytics** - Gráficos y métricas ✅ v1.1.0
- [x] **Sistema de Notificaciones** - In-app con preferencias ✅ v1.1.0
- [x] **PWA Completo** - Instalable y offline ✅ v1.2.0
- [x] **Subgéneros** - Clasificación jerárquica ✅ v1.2.0

### 🚀 **Fase 2 - Testing & Calidad Avanzada**
- [ ] **Tests E2E** con Playwright/Cypress
- [ ] **Performance testing** con Lighthouse CI
- [ ] **Accessibility testing** con axe-core
- [ ] **Load testing** para múltiples tenants
- [ ] **Security testing** automatizado

### 🚀 **Fase 3 - Características Avanzadas**
- [ ] **Sistema de inventario** - Gestión avanzada de materiales
- [x] **Upload de imágenes** para plantas ✅ (Implementado)
- [x] **Reportes avanzados** con gráficos y analytics ✅ v1.1.0
- [x] **Notificaciones inteligentes** ✅ v1.1.0
- [ ] **API REST completa** para integraciones
- [x] **Dashboard avanzado** con métricas detalladas ✅ v1.1.0

### 🚀 **Fase 4 - IA y Automatización**
- [ ] **Recomendaciones inteligentes** - Cuidado basado en datos
- [ ] **Detección automática** - Análisis de imágenes
- [ ] **Predicciones** - Salud futura de plantas
- [ ] **Chatbot IA** - Asistente virtual para viveristas

## 🚀 Despliegue

### Producción
Deploy to Vercel with the environment variables configured.

### Desarrollo Local
```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run lint         # Verificación de código
```

### Variables de Entorno Requeridas
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 📞 Soporte y Contribución

Para reportar bugs o solicitar funcionalidades:
1. Abre un issue en el repositorio
2. Describe el problema con pasos para reproducirlo
3. Incluye capturas de pantalla si es relevante

### Convenciones de Código
- **TypeScript estricto** obligatorio
- **ESLint** debe pasar sin warnings
- **Commits** descriptivos en español
- **PRs** con descripción detallada

---

## 🙏 Agradecimientos

Este proyecto ha sido desarrollado siguiendo las mejores prácticas de la industria y utilizando tecnologías modernas. Un agradecimiento especial a:

- **Vercel** por la plataforma de despliegue
- **Supabase** por el backend-as-a-service
- **shadcn/ui** por los componentes accesibles
- **Next.js** por el framework robusto
- **Tailwind CSS** por el sistema de diseño

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

## 🎯 Estado del Proyecto

### ✅ **FASE 1 COMPLETA - MVP 100% PRODUCCIÓN-LISTO**
- ✅ Arquitectura multi-tenant sólida con RLS
- ✅ Gestión completa de plantas con estados de salud
- ✅ Sistema de tareas avanzado con filtros dinámicos
- ✅ Historial clínico integral con tratamientos
- ✅ Catálogos completos (géneros y macetas)
- ✅ **Perfil de usuario completo** con avatar personalizado
- ✅ UI/UX moderna y responsiva con shadcn/ui
- ✅ **Testing completo** - 27 tests automatizados ✅
- ✅ **CI/CD pipeline** con GitHub Actions ✅
- ✅ **Build limpio** sin errores de TypeScript ✅
- ✅ **Documentación completa** actualizada ✅
- ✅ Documentación completa y actualizada

### 🚀 **Próximas Fases**
- **Fase 2**: Testing & Calidad Avanzada (E2E, Performance, Accessibility)
- **Fase 3**: Características Avanzadas (Inventario, Imágenes, Analytics)
- **Fase 4**: Escalabilidad & Integraciones (API, Roles, Multi-tenancy Avanzado)

---

*Desarrollado con ❤️ para viveristas profesionales*

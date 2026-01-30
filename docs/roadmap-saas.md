# 🗺️ Roadmap de Madurez SaaS: Vivero SaaS

Este documento detalla la hoja de ruta técnica y de negocio para transformar **Vivero SaaS** en una plataforma comercial robusta y escalable.

---

## ✅ Pillar 0: Seguridad e Infraestructura Crítica (COMPLETADO)
*Aislamiento total de datos y base técnica sólida.*

- [x] **Corrección de Seguridad RLS**: Migración a `ANON_KEY` y eliminación de recursión en políticas.
- [x] **Aislamiento Multi-Tenant**: Implementación de `get_current_tenant_id()` con `SECURITY DEFINER`.
- [x] **Middleware Guard**: Control de acceso robusto y redirección inteligente con `redirectTo`.

---

## 💳 Fase 1: Infraestructura de Negocio (En Progreso)
*Elementos fundacionales para comenzar a monetizar.*

### 1. Facturación y Suscripciones (Stripe)
- [ ] Integración con Stripe Billing.
- [ ] Definición de planes: **Free** (hasta 50 plantas), **Pro** (Inventario completo), **Enterprise** (Multiusuario).
- [ ] Middleware de suscripción para bloquear funciones según el plan.

### 2. Onboarding y Marketing (Completado)
- [x] **Landing Page**: Rediseño profesional y moderno con propuesta de valor.
- [x] **Centro de Aprendizaje**: Guía de usuario interactiva integrada con visuales premium.
- [ ] **Wizard de Configuración**: Proceso guiado para nuevos viveros (Pendiente).

---

## 🌿 Fase 2: Especialización del Nicho (The "Wow" Factor)
*Funcionalidades que diferencian a Vivero SaaS de un Excel genérico.*

### 🤳 Puente Físico-Digital (Mobile First) - COMPLETADO
- [x] **Generación de códigos QR**: Etiquetas profesionales escaneables por cada planta.
- [x] **Escaneo Rápido**: Scanner integrado en la app y soporte para escaneo nativo desde cámara del móvil.
- [x] **Login Redirect**: Flujo fluido desde el escaneo físico hasta la ficha digital post-autenticación.

### 📦 Operaciones Avanzadas
- [x] **Acciones Masivas (Bulk)**: Riego, Cambio de Estado y Eliminación en lote desde el inventario.
- [x] **Gestión de Stock Enlazada**: El uso de materiales en tareas se descuenta automáticamente.
- [ ] **Modo Offline**: Mejoras PWA para operar en áreas sin señal (Pendiente).

---

## 📊 Fase 3: Inteligencia y Ecosistema
*De la entrada de datos a la toma de decisiones basada en información.*

### 📈 Analítica Predictiva
- [ ] **Tendencias de Salud**: Mapas de calor para detectar sectores o géneros con mayor mortalidad.
- [ ] **Proyección de Insumos**: Predicción de faltante de sustrato o macetas basándose en el historial.

### 🛒 Escaparate Público (Storefront)
- [ ] **Catálogo Digital**: Enlace público "solo lectura" para compartir stock con clientes finales.

---

## 🚀 Próximos Pasos Inmediatos
1. **Configuración de Stripe**: Preparar webhooks y tabla de suscripciones.
2. **Mejoras Mobile**: Optimizar el scanner para condiciones de baja luz.
3. **Internacionalización**: Preparar el sistema para multi-lenguaje (i18n).

> [!TIP]
> La estabilidad lograda en el sistema de RLS y Middleware ahora permite escalar a la Fase 1 (Monetización) con total confianza.

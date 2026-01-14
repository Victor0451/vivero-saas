# 🌱 Plan de Implementación - Subgéneros de Plantas

## 📋 Resumen Ejecutivo

Agregar funcionalidad de **subgéneros** para permitir una clasificación jerárquica más detallada de las plantas. Los subgéneros pertenecen a un género padre y permiten categorización más específica.

**Duración estimada:** 3-4 horas  
**Complejidad:** Media  
**Impacto:** Mejora la organización y clasificación de plantas

---

## 🎯 Objetivo

Implementar una relación jerárquica **Género → Subgénero** que permita:
1. Crear subgéneros asociados a un género padre
2. Asignar plantas a subgéneros (opcional)
3. Gestionar CRUD completo de subgéneros
4. Mantener compatibilidad con plantas existentes

---

## 📊 Estructura Actual

### Tabla `generos_planta`
```sql
CREATE TABLE generos_planta (
  id_genero SERIAL PRIMARY KEY,
  id_tenant UUID NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT
);
```

### Tabla `plantas`
```sql
CREATE TABLE plantas (
  id_planta SERIAL PRIMARY KEY,
  id_genero INTEGER REFERENCES generos_planta(id_genero),
  -- otros campos...
);
```

---

## 🔧 Cambios Propuestos

### 1. Esquema de Base de Datos

#### [NEW] Tabla `subgeneros_planta`

```sql
CREATE TABLE subgeneros_planta (
  id_subgenero SERIAL PRIMARY KEY,
  id_tenant UUID NOT NULL,
  id_genero INTEGER NOT NULL REFERENCES generos_planta(id_genero) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(id_tenant, id_genero, nombre)
);

-- Índices
CREATE INDEX idx_subgeneros_genero ON subgeneros_planta(id_genero);
CREATE INDEX idx_subgeneros_tenant ON subgeneros_planta(id_tenant);

-- RLS Policies
ALTER TABLE subgeneros_planta ENABLE ROW LEVEL SECURITY;

CREATE POLICY subgeneros_tenant_access ON subgeneros_planta
  FOR ALL
  USING (id_tenant = (SELECT id_tenant FROM users WHERE id_user = auth.uid()));
```

#### [MODIFY] Tabla `plantas`

```sql
-- Agregar columna opcional para subgénero
ALTER TABLE plantas
ADD COLUMN id_subgenero INTEGER REFERENCES subgeneros_planta(id_subgenero) ON DELETE SET NULL;

-- Índice
CREATE INDEX idx_plantas_subgenero ON plantas(id_subgenero);
```

> [!IMPORTANT]
> La columna `id_subgenero` es **opcional**. Las plantas pueden tener solo género o género + subgénero.

---

### 2. Tipos TypeScript

#### [MODIFY] `src/types/index.ts`

```typescript
// Nuevo tipo para Subgénero
export type SubgeneroPlanta = {
  id_subgenero: number
  id_tenant: string
  id_genero: number
  nombre: string
  descripcion?: string
  created_at: string
}

// Tipo extendido con género padre
export type SubgeneroConGenero = SubgeneroPlanta & {
  generos_planta?: GeneroPlanta
}

// Opción para select
export type SubgeneroPlantaOption = {
  id_subgenero: number
  id_genero: number
  nombre: string
  descripcion?: string
}

// Actualizar PlantaConDetalles
export type PlantaConDetalles = Planta & {
  tipos_planta?: TipoPlanta
  generos_planta?: GeneroPlanta
  subgeneros_planta?: SubgeneroPlanta  // NUEVO
  macetas?: Maceta
}

// Actualizar Planta
export type Planta = {
  // ... campos existentes
  id_genero: number
  id_subgenero?: number  // NUEVO - opcional
  // ... resto de campos
}
```

---

### 3. Server Actions

#### [NEW] `src/app/actions/subgeneros.ts`

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { SubgeneroPlanta, SubgeneroConGenero } from '@/types'

/**
 * Obtiene todos los subgéneros con información del género padre
 */
export async function getSubgeneros(): Promise<SubgeneroConGenero[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('subgeneros_planta')
    .select(`
      *,
      generos_planta (
        id_genero,
        nombre,
        descripcion
      )
    `)
    .order('nombre')

  if (error) throw error
  return data || []
}

/**
 * Obtiene subgéneros de un género específico
 */
export async function getSubgenerosByGenero(id_genero: number): Promise<SubgeneroPlanta[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('subgeneros_planta')
    .select('*')
    .eq('id_genero', id_genero)
    .order('nombre')

  if (error) throw error
  return data || []
}

/**
 * Crea un nuevo subgénero
 */
export async function createSubgenero(data: {
  id_genero: number
  nombre: string
  descripcion?: string
}): Promise<boolean> {
  const supabase = await createClient()
  
  const { data: userData } = await supabase
    .from('users')
    .select('id_tenant')
    .eq('id_user', (await supabase.auth.getUser()).data.user?.id)
    .single()

  if (!userData) throw new Error('Usuario no encontrado')

  const { error } = await supabase
    .from('subgeneros_planta')
    .insert({
      id_tenant: userData.id_tenant,
      ...data
    })

  if (error) throw error
  
  revalidatePath('/catalogos/generos')
  return true
}

/**
 * Actualiza un subgénero
 */
export async function updateSubgenero(
  id_subgenero: number,
  data: { nombre: string; descripcion?: string }
): Promise<boolean> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('subgeneros_planta')
    .update(data)
    .eq('id_subgenero', id_subgenero)

  if (error) throw error
  
  revalidatePath('/catalogos/generos')
  return true
}

/**
 * Elimina un subgénero
 */
export async function deleteSubgenero(id_subgenero: number): Promise<boolean> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('subgeneros_planta')
    .delete()
    .eq('id_subgenero', id_subgenero)

  if (error) throw error
  
  revalidatePath('/catalogos/generos')
  return true
}
```

---

### 4. Componentes UI

#### [MODIFY] `src/app/(dashboard)/catalogos/generos/page.tsx`

- Agregar tab para "Subgéneros"
- Mostrar lista de subgéneros agrupados por género
- Botones para crear/editar/eliminar subgéneros

#### [NEW] `src/components/subgeneros-table.tsx`

- Tabla de subgéneros con columnas: Nombre, Género Padre, Descripción, Acciones
- Filtro por género
- Acciones: Editar, Eliminar

#### [NEW] `src/components/subgenero-sheet.tsx`

- Sheet para crear/editar subgénero
- Select para elegir género padre
- Campos: Nombre, Descripción
- Validación con Zod

#### [MODIFY] `src/components/planta-form.tsx`

- Agregar select de subgénero (opcional)
- Cargar subgéneros cuando se selecciona un género
- Limpiar subgénero si se cambia el género

#### [MODIFY] `src/components/generos-table.tsx`

- Agregar columna "Subgéneros" mostrando contador
- Click en contador abre lista de subgéneros de ese género

---

## 🔄 Flujo de Implementación

### Fase 1: Base de Datos (30 min)
1. Crear migración SQL
2. Ejecutar en Supabase
3. Verificar tablas e índices

### Fase 2: Tipos y Server Actions (45 min)
1. Actualizar tipos en `types/index.ts`
2. Crear `actions/subgeneros.ts`
3. Modificar `actions/plantas.ts` para incluir subgéneros en queries

### Fase 3: Componentes UI (1.5 horas)
1. Crear `subgeneros-table.tsx`
2. Crear `subgenero-sheet.tsx`
3. Modificar `catalogos/generos/page.tsx` para agregar tab
4. Modificar `planta-form.tsx` para select de subgénero

### Fase 4: Testing y Ajustes (45 min)
1. Probar CRUD de subgéneros
2. Probar asignación en plantas
3. Verificar cascada de eliminación
4. Ajustar UI según sea necesario

---

## ✅ Checklist de Verificación

- [ ] Migración SQL ejecutada correctamente
- [ ] Tabla `subgeneros_planta` creada con RLS
- [ ] Columna `id_subgenero` agregada a `plantas`
- [ ] Tipos TypeScript actualizados
- [ ] Server actions de subgéneros funcionando
- [ ] Tabla de subgéneros muestra datos
- [ ] Sheet de crear/editar subgénero funciona
- [ ] Select de subgénero en formulario de planta
- [ ] Subgéneros se filtran por género seleccionado
- [ ] Eliminación de género elimina sus subgéneros (CASCADE)
- [ ] Eliminación de subgénero no afecta plantas (SET NULL)

---

## 🎨 Diseño de UI

### Página de Géneros con Tabs

```
┌─────────────────────────────────────────┐
│ Géneros de Plantas                      │
│ [Géneros] [Subgéneros]                  │
├─────────────────────────────────────────┤
│                                         │
│ Tab Subgéneros:                         │
│ ┌───────────────────────────────────┐   │
│ │ Género        │ Nombre │ Acciones │   │
│ ├───────────────────────────────────┤   │
│ │ Monstera      │ Deliciosa │ ✏️ 🗑️ │   │
│ │ Monstera      │ Adansonii │ ✏️ 🗑️ │   │
│ │ Snake Plant   │ Laurentii │ ✏️ 🗑️ │   │
│ └───────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Formulario de Planta con Subgénero

```
┌─────────────────────────────────────────┐
│ Género *                                │
│ [Monstera ▼]                            │
│                                         │
│ Subgénero (opcional)                    │
│ [Deliciosa ▼]                           │
│                                         │
│ Tipo *                                  │
│ [Interior ▼]                            │
└─────────────────────────────────────────┘
```

---

## 🔮 Mejoras Futuras

1. **Búsqueda de plantas por subgénero**
2. **Estadísticas de subgéneros** en analytics
3. **Importación masiva** de subgéneros
4. **Jerarquía de 3 niveles** (Género → Subgénero → Variedad)
5. **Imágenes** para subgéneros

---

*Plan creado el 13 de enero de 2026*

# 📦 Plan de Implementación - Gestión de Inventario

## 📋 Resumen Ejecutivo

Implementar un sistema completo de gestión de inventario para materiales de jardinería, herramientas y suministros. Incluye control de stock, movimientos, alertas de reabastecimiento y gestión de proveedores.

**Duración estimada:** 6-8 horas  
**Complejidad:** Alta  
**Impacto:** Alto - Permite control completo de materiales y costos

---

## 🎯 Objetivos

1. **Gestión de Items de Inventario** - CRUD completo con categorías
2. **Control de Stock** - Entradas, salidas y niveles mínimos
3. **Alertas Automáticas** - Notificaciones cuando stock < mínimo
4. **Gestión de Proveedores** - Información de contacto y asociación con items
5. **Integración con Tareas** - Registro de consumo de materiales
6. **Reportes** - Análisis de consumo y costos

---

## 🗄️ Esquema de Base de Datos

### 1. Tabla `categorias_inventario`

```sql
CREATE TABLE categorias_inventario (
  id_categoria SERIAL PRIMARY KEY,
  id_tenant UUID NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  icono VARCHAR(50), -- lucide icon name
  color VARCHAR(20), -- hex color para UI
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(id_tenant, nombre)
);

-- Índices
CREATE INDEX idx_categorias_tenant ON categorias_inventario(id_tenant);

-- RLS
ALTER TABLE categorias_inventario ENABLE ROW LEVEL SECURITY;

CREATE POLICY categorias_tenant_access ON categorias_inventario
  FOR ALL
  USING (id_tenant = (SELECT id_tenant FROM users WHERE id_user = auth.uid()));
```

**Categorías predefinidas:**
- 🪴 Macetas y Contenedores
- 🌱 Sustratos y Tierras
- 💧 Fertilizantes y Nutrientes
- 🛠️ Herramientas
- 🌿 Semillas y Plantas
- 🧪 Productos Fitosanitarios

### 2. Tabla `items_inventario`

```sql
CREATE TABLE items_inventario (
  id_item SERIAL PRIMARY KEY,
  id_tenant UUID NOT NULL,
  id_categoria INTEGER REFERENCES categorias_inventario(id_categoria) ON DELETE SET NULL,
  codigo VARCHAR(50), -- código interno/SKU
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  unidad_medida VARCHAR(50) NOT NULL, -- kg, litros, unidades, metros, etc.
  stock_actual DECIMAL(10,2) DEFAULT 0,
  stock_minimo DECIMAL(10,2) DEFAULT 0,
  stock_maximo DECIMAL(10,2), -- opcional
  precio_unitario DECIMAL(10,2),
  ubicacion VARCHAR(100), -- estante, bodega, etc.
  imagen_url TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(id_tenant, codigo)
);

-- Índices
CREATE INDEX idx_items_tenant ON items_inventario(id_tenant);
CREATE INDEX idx_items_categoria ON items_inventario(id_categoria);
CREATE INDEX idx_items_codigo ON items_inventario(codigo);
CREATE INDEX idx_items_stock_bajo ON items_inventario(stock_actual, stock_minimo) 
  WHERE stock_actual <= stock_minimo;

-- RLS
ALTER TABLE items_inventario ENABLE ROW LEVEL SECURITY;

CREATE POLICY items_tenant_access ON items_inventario
  FOR ALL
  USING (id_tenant = (SELECT id_tenant FROM users WHERE id_user = auth.uid()));
```

### 3. Tabla `proveedores`

```sql
CREATE TABLE proveedores (
  id_proveedor SERIAL PRIMARY KEY,
  id_tenant UUID NOT NULL,
  codigo VARCHAR(50),
  nombre VARCHAR(200) NOT NULL,
  razon_social VARCHAR(200),
  rut_cuit VARCHAR(50),
  contacto VARCHAR(100),
  telefono VARCHAR(50),
  email VARCHAR(100),
  direccion TEXT,
  ciudad VARCHAR(100),
  pais VARCHAR(100) DEFAULT 'Argentina',
  sitio_web VARCHAR(200),
  notas TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(id_tenant, codigo)
);

-- Índices
CREATE INDEX idx_proveedores_tenant ON proveedores(id_tenant);

-- RLS
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;

CREATE POLICY proveedores_tenant_access ON proveedores
  FOR ALL
  USING (id_tenant = (SELECT id_tenant FROM users WHERE id_user = auth.uid()));
```

### 4. Tabla `items_proveedores` (relación N:N)

```sql
CREATE TABLE items_proveedores (
  id_item INTEGER REFERENCES items_inventario(id_item) ON DELETE CASCADE,
  id_proveedor INTEGER REFERENCES proveedores(id_proveedor) ON DELETE CASCADE,
  precio_compra DECIMAL(10,2),
  tiempo_entrega_dias INTEGER,
  es_proveedor_principal BOOLEAN DEFAULT false,
  notas TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (id_item, id_proveedor)
);

-- RLS
ALTER TABLE items_proveedores ENABLE ROW LEVEL SECURITY;

CREATE POLICY items_proveedores_access ON items_proveedores
  FOR ALL
  USING (
    id_item IN (
      SELECT id_item FROM items_inventario 
      WHERE id_tenant = (SELECT id_tenant FROM users WHERE id_user = auth.uid())
    )
  );
```

### 5. Tabla `movimientos_inventario`

```sql
CREATE TABLE movimientos_inventario (
  id_movimiento SERIAL PRIMARY KEY,
  id_tenant UUID NOT NULL,
  id_item INTEGER NOT NULL REFERENCES items_inventario(id_item) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('entrada', 'salida', 'ajuste')),
  cantidad DECIMAL(10,2) NOT NULL,
  stock_anterior DECIMAL(10,2) NOT NULL,
  stock_nuevo DECIMAL(10,2) NOT NULL,
  precio_unitario DECIMAL(10,2),
  costo_total DECIMAL(10,2),
  motivo TEXT,
  referencia VARCHAR(100), -- número de factura, orden, etc.
  id_proveedor INTEGER REFERENCES proveedores(id_proveedor) ON DELETE SET NULL,
  id_tarea INTEGER REFERENCES tareas(id_tarea) ON DELETE SET NULL,
  id_usuario UUID REFERENCES users(id_user) ON DELETE SET NULL,
  fecha TIMESTAMP DEFAULT NOW(),
  notas TEXT
);

-- Índices
CREATE INDEX idx_movimientos_tenant ON movimientos_inventario(id_tenant);
CREATE INDEX idx_movimientos_item ON movimientos_inventario(id_item);
CREATE INDEX idx_movimientos_tipo ON movimientos_inventario(tipo);
CREATE INDEX idx_movimientos_fecha ON movimientos_inventario(fecha DESC);
CREATE INDEX idx_movimientos_tarea ON movimientos_inventario(id_tarea);

-- RLS
ALTER TABLE movimientos_inventario ENABLE ROW LEVEL SECURITY;

CREATE POLICY movimientos_tenant_access ON movimientos_inventario
  FOR ALL
  USING (id_tenant = (SELECT id_tenant FROM users WHERE id_user = auth.uid()));
```

### 6. Trigger para actualizar stock automáticamente

```sql
-- Función para actualizar stock
CREATE OR REPLACE FUNCTION actualizar_stock_item()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar stock_actual del item
  UPDATE items_inventario
  SET 
    stock_actual = NEW.stock_nuevo,
    updated_at = NOW()
  WHERE id_item = NEW.id_item;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger después de insertar movimiento
CREATE TRIGGER trigger_actualizar_stock
  AFTER INSERT ON movimientos_inventario
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_stock_item();
```

---

## 📝 Tipos TypeScript

### `src/types/index.ts`

```typescript
// Categorías de Inventario
export type CategoriaInventario = {
  id_categoria: number
  id_tenant: string
  nombre: string
  descripcion?: string
  icono?: string
  color?: string
  created_at: string
}

// Items de Inventario
export type ItemInventario = {
  id_item: number
  id_tenant: string
  id_categoria?: number
  codigo?: string
  nombre: string
  descripcion?: string
  unidad_medida: string
  stock_actual: number
  stock_minimo: number
  stock_maximo?: number
  precio_unitario?: number
  ubicacion?: string
  imagen_url?: string
  activo: boolean
  created_at: string
  updated_at: string
}

// Item con detalles de categoría
export type ItemInventarioConDetalles = ItemInventario & {
  categorias_inventario?: CategoriaInventario
  proveedores?: ProveedorConRelacion[]
  stock_bajo?: boolean // calculado
}

// Proveedores
export type Proveedor = {
  id_proveedor: number
  id_tenant: string
  codigo?: string
  nombre: string
  razon_social?: string
  rut_cuit?: string
  contacto?: string
  telefono?: string
  email?: string
  direccion?: string
  ciudad?: string
  pais: string
  sitio_web?: string
  notas?: string
  activo: boolean
  created_at: string
}

// Relación Item-Proveedor
export type ItemProveedor = {
  id_item: number
  id_proveedor: number
  precio_compra?: number
  tiempo_entrega_dias?: number
  es_proveedor_principal: boolean
  notas?: string
  created_at: string
}

export type ProveedorConRelacion = Proveedor & ItemProveedor

// Movimientos de Inventario
export type MovimientoInventario = {
  id_movimiento: number
  id_tenant: string
  id_item: number
  tipo: 'entrada' | 'salida' | 'ajuste'
  cantidad: number
  stock_anterior: number
  stock_nuevo: number
  precio_unitario?: number
  costo_total?: number
  motivo?: string
  referencia?: string
  id_proveedor?: number
  id_tarea?: number
  id_usuario?: string
  fecha: string
  notas?: string
}

// Movimiento con detalles
export type MovimientoConDetalles = MovimientoInventario & {
  items_inventario?: ItemInventario
  proveedores?: Proveedor
  tareas?: { id_tarea: number; titulo: string }
  users?: { id_user: string; nombre: string }
}

// Tipos para formularios
export type CreateItemInventarioData = Omit<
  ItemInventario,
  'id_item' | 'id_tenant' | 'created_at' | 'updated_at' | 'stock_actual'
>

export type CreateMovimientoData = {
  id_item: number
  tipo: 'entrada' | 'salida' | 'ajuste'
  cantidad: number
  precio_unitario?: number
  motivo?: string
  referencia?: string
  id_proveedor?: number
  id_tarea?: number
  notas?: string
}
```

---

## 🔧 Server Actions

### `src/app/actions/inventario.ts`

```typescript
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type {
  ItemInventario,
  ItemInventarioConDetalles,
  CategoriaInventario,
  CreateItemInventarioData,
  MovimientoInventario,
  MovimientoConDetalles,
  CreateMovimientoData,
  Proveedor
} from '@/types'

// ============================================
// CATEGORÍAS
// ============================================

export async function getCategorias(): Promise<CategoriaInventario[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('categorias_inventario')
    .select('*')
    .order('nombre')

  if (error) throw error
  return data || []
}

export async function createCategoria(data: {
  nombre: string
  descripcion?: string
  icono?: string
  color?: string
}): Promise<CategoriaInventario> {
  const supabase = await createClient()
  
  const { data: userData } = await supabase
    .from('users')
    .select('id_tenant')
    .eq('id_user', (await supabase.auth.getUser()).data.user?.id)
    .single()

  if (!userData) throw new Error('Usuario no encontrado')

  const { data: categoria, error } = await supabase
    .from('categorias_inventario')
    .insert({
      id_tenant: userData.id_tenant,
      ...data
    })
    .select()
    .single()

  if (error) throw error
  
  revalidatePath('/inventario')
  return categoria
}

// ============================================
// ITEMS DE INVENTARIO
// ============================================

export async function getItems(): Promise<ItemInventarioConDetalles[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('items_inventario')
    .select(`
      *,
      categorias_inventario (
        id_categoria,
        nombre,
        icono,
        color
      )
    `)
    .eq('activo', true)
    .order('nombre')

  if (error) throw error
  
  // Agregar indicador de stock bajo
  return (data || []).map(item => ({
    ...item,
    stock_bajo: item.stock_actual <= item.stock_minimo
  }))
}

export async function getItemById(id_item: number): Promise<ItemInventarioConDetalles | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('items_inventario')
    .select(`
      *,
      categorias_inventario (
        id_categoria,
        nombre,
        descripcion,
        icono,
        color
      )
    `)
    .eq('id_item', id_item)
    .single()

  if (error) throw error
  return data
}

export async function getItemsStockBajo(): Promise<ItemInventarioConDetalles[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('items_inventario')
    .select(`
      *,
      categorias_inventario (
        id_categoria,
        nombre,
        icono,
        color
      )
    `)
    .lte('stock_actual', supabase.raw('stock_minimo'))
    .eq('activo', true)
    .order('stock_actual')

  if (error) throw error
  
  return (data || []).map(item => ({
    ...item,
    stock_bajo: true
  }))
}

export async function createItem(data: CreateItemInventarioData): Promise<ItemInventario> {
  const supabase = await createClient()
  
  const { data: userData } = await supabase
    .from('users')
    .select('id_tenant')
    .eq('id_user', (await supabase.auth.getUser()).data.user?.id)
    .single()

  if (!userData) throw new Error('Usuario no encontrado')

  const { data: item, error } = await supabase
    .from('items_inventario')
    .insert({
      id_tenant: userData.id_tenant,
      stock_actual: 0,
      ...data
    })
    .select()
    .single()

  if (error) throw error
  
  revalidatePath('/inventario')
  return item
}

export async function updateItem(
  id_item: number,
  data: Partial<CreateItemInventarioData>
): Promise<ItemInventario> {
  const supabase = await createClient()
  
  const { data: item, error } = await supabase
    .from('items_inventario')
    .update({
      ...data,
      updated_at: new Date().toISOString()
    })
    .eq('id_item', id_item)
    .select()
    .single()

  if (error) throw error
  
  revalidatePath('/inventario')
  return item
}

export async function deleteItem(id_item: number): Promise<boolean> {
  const supabase = await createClient()
  
  // Soft delete
  const { error } = await supabase
    .from('items_inventario')
    .update({ activo: false })
    .eq('id_item', id_item)

  if (error) throw error
  
  revalidatePath('/inventario')
  return true
}

// ============================================
// MOVIMIENTOS DE INVENTARIO
// ============================================

export async function getMovimientos(id_item?: number): Promise<MovimientoConDetalles[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('movimientos_inventario')
    .select(`
      *,
      items_inventario (
        id_item,
        nombre,
        codigo,
        unidad_medida
      ),
      proveedores (
        id_proveedor,
        nombre
      ),
      tareas (
        id_tarea,
        titulo
      ),
      users (
        id_user,
        nombre
      )
    `)
    .order('fecha', { ascending: false })
    .limit(100)

  if (id_item) {
    query = query.eq('id_item', id_item)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function createMovimiento(data: CreateMovimientoData): Promise<MovimientoInventario> {
  const supabase = await createClient()
  
  // Obtener tenant y usuario
  const { data: authData } = await supabase.auth.getUser()
  const { data: userData } = await supabase
    .from('users')
    .select('id_tenant')
    .eq('id_user', authData.user?.id)
    .single()

  if (!userData) throw new Error('Usuario no encontrado')

  // Obtener stock actual del item
  const { data: item } = await supabase
    .from('items_inventario')
    .select('stock_actual')
    .eq('id_item', data.id_item)
    .single()

  if (!item) throw new Error('Item no encontrado')

  // Calcular nuevo stock
  const stock_anterior = item.stock_actual
  let stock_nuevo = stock_anterior

  switch (data.tipo) {
    case 'entrada':
      stock_nuevo = stock_anterior + data.cantidad
      break
    case 'salida':
      stock_nuevo = stock_anterior - data.cantidad
      if (stock_nuevo < 0) {
        throw new Error('Stock insuficiente')
      }
      break
    case 'ajuste':
      stock_nuevo = data.cantidad
      break
  }

  // Calcular costo total
  const costo_total = data.precio_unitario 
    ? data.precio_unitario * data.cantidad 
    : undefined

  // Crear movimiento
  const { data: movimiento, error } = await supabase
    .from('movimientos_inventario')
    .insert({
      id_tenant: userData.id_tenant,
      id_usuario: authData.user?.id,
      stock_anterior,
      stock_nuevo,
      costo_total,
      ...data
    })
    .select()
    .single()

  if (error) throw error
  
  revalidatePath('/inventario')
  return movimiento
}

// ============================================
// PROVEEDORES
// ============================================

export async function getProveedores(): Promise<Proveedor[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('proveedores')
    .select('*')
    .eq('activo', true)
    .order('nombre')

  if (error) throw error
  return data || []
}

export async function createProveedor(data: Omit<Proveedor, 'id_proveedor' | 'id_tenant' | 'created_at'>): Promise<Proveedor> {
  const supabase = await createClient()
  
  const { data: userData } = await supabase
    .from('users')
    .select('id_tenant')
    .eq('id_user', (await supabase.auth.getUser()).data.user?.id)
    .single()

  if (!userData) throw new Error('Usuario no encontrado')

  const { data: proveedor, error } = await supabase
    .from('proveedores')
    .insert({
      id_tenant: userData.id_tenant,
      ...data
    })
    .select()
    .single()

  if (error) throw error
  
  revalidatePath('/inventario/proveedores')
  return proveedor
}
```

---

## 🎨 Componentes UI

### Estructura de Páginas

```
/inventario
  ├── page.tsx              # Lista de items con filtros
  ├── [id]/
  │   └── page.tsx          # Detalles de item + historial
  ├── categorias/
  │   └── page.tsx          # Gestión de categorías
  ├── proveedores/
  │   └── page.tsx          # Lista de proveedores
  │   └── [id]/page.tsx     # Detalles de proveedor
  └── movimientos/
      └── page.tsx          # Historial completo de movimientos
```

### Componentes a Crear

1. **`inventory-table.tsx`** - Tabla de items con stock
2. **`inventory-item-sheet.tsx`** - Crear/editar item
3. **`movement-dialog.tsx`** - Registrar entrada/salida
4. **`stock-badge.tsx`** - Indicador visual de stock
5. **`category-manager.tsx`** - Gestión de categorías
6. **`provider-table.tsx`** - Lista de proveedores
7. **`provider-sheet.tsx`** - Crear/editar proveedor
8. **`movement-history.tsx`** - Historial de movimientos

---

## ✅ Checklist de Implementación

### Fase 1: Base de Datos (1.5 horas)
- [ ] Crear migración SQL completa
- [ ] Ejecutar en Supabase
- [ ] Verificar tablas, índices y RLS
- [ ] Probar triggers de stock
- [ ] Seed de categorías predefinidas

### Fase 2: Backend (2 horas)
- [ ] Actualizar tipos en `types/index.ts`
- [ ] Crear `actions/inventario.ts`
- [ ] Implementar CRUD de categorías
- [ ] Implementar CRUD de items
- [ ] Implementar sistema de movimientos
- [ ] Implementar CRUD de proveedores

### Fase 3: UI - Items (2 horas)
- [ ] Página principal `/inventario`
- [ ] Tabla de items con filtros
- [ ] Sheet de crear/editar item
- [ ] Página de detalles de item
- [ ] Dialog de movimientos
- [ ] Badges de stock bajo

### Fase 4: UI - Proveedores (1 hora)
- [ ] Página de proveedores
- [ ] Sheet de crear/editar proveedor
- [ ] Asociar proveedores con items

### Fase 5: Integraciones (1.5 horas)
- [ ] Notificaciones de stock bajo
- [ ] Integración con tareas
- [ ] Dashboard de inventario
- [ ] Reportes de consumo

---

## 🚀 Próximos Pasos

1. Crear migración de base de datos
2. Actualizar tipos TypeScript
3. Implementar server actions
4. Crear componentes UI
5. Integrar con sistema de notificaciones

**¿Comenzamos con la migración de base de datos?**

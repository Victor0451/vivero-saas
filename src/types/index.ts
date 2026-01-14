export type Tenant = {
  id_tenant: string; // UUID
  nombre: string;
  plan: string;
  activo: boolean;
  created_at: string; // timestamp
};

export type User = {
  id_user: string; // UUID FK auth.users
  id_tenant: string; // UUID
  rol: string;
  activo: boolean;
  created_at: string; // timestamp
};

export type TipoPlanta = {
  id_tipo: number; // SMALLINT
  nombre: string; // INTERIOR / EXTERIOR
};

export type GeneroPlanta = {
  id_genero: number; // assuming SERIAL or similar
  id_tenant: string; // UUID
  nombre: string;
  descripcion?: string;
};

export type SubgeneroPlanta = {
  id_subgenero: number;
  id_tenant: string;
  id_genero: number;
  nombre: string;
  descripcion?: string;
  created_at: string;
};

export type SubgeneroConGenero = SubgeneroPlanta & {
  generos_planta?: GeneroPlanta;
};

export type Maceta = {
  id_maceta: number;
  id_tenant: string; // UUID
  tipo: string;
  material?: string;
  diametro_cm?: number;
  diametro_unidad?: string; // cm, in, mm
  altura_cm?: number;
  altura_unidad?: string; // cm, in, mm
  volumen_lts?: number;
  volumen_unidad?: string; // L, ml, gal
  created_at: string;
};

export type Planta = {
  id_planta: number;
  id_tenant: string; // UUID
  nombre: string;
  floracion: boolean;
  fecha_compra?: string; // date
  fecha_transplante?: string; // date
  iluminacion?: string;
  esta_enferma: boolean;
  esta_muerta: boolean;
  id_maceta?: number;
  id_genero: number;
  id_subgenero?: number; // NUEVO - opcional
  id_tipo: number; // SMALLINT
  observaciones?: string;
  image_url?: string;
  created_at: string;
  deleted_at?: string;
};

// Tipo extendido para mostrar en la tabla con joins
export type PlantaConDetalles = Planta & {
  tipos_planta?: TipoPlanta;
  generos_planta?: GeneroPlanta;
  subgeneros_planta?: SubgeneroPlanta; // NUEVO
  macetas?: Maceta;
};

// Tipos simplificados para opciones de select
export type TipoPlantaOption = {
  id_tipo: number;
  nombre: string;
};

export type GeneroPlantaOption = {
  id_genero: number;
  nombre: string;
  descripcion?: string;
};

export type SubgeneroPlantaOption = {
  id_subgenero: number;
  id_genero: number;
  nombre: string;
  descripcion?: string;
};

export type MacetaOption = {
  id_maceta: number;
  tipo: string;
  material?: string;
  diametro_cm?: number;
  altura_cm?: number;
};

export type HistoriaClinica = {
  id_historia: number;
  id_tenant: string; // UUID
  id_planta: number;
  fecha: string; // date
  descripcion: string;
  tratamiento?: string;
  estuvo_enferma: boolean;
};

export type Tarea = {
  id_tarea: number;
  id_tenant: string; // UUID
  id_planta?: number;
  titulo: string;
  descripcion?: string;
  fecha_programada: string; // date
  completada: boolean;
  created_at: string; // timestamp
};

// Additional types for auth
export type AuthUser = {
  id: string;
  email: string;
  // other auth fields as needed
};

// ============================================
// TIPOS DE INVENTARIO
// ============================================

// Categorías de Inventario
export type CategoriaInventario = {
  id_categoria: number;
  id_tenant: string;
  nombre: string;
  descripcion?: string;
  icono?: string;
  color?: string;
  created_at: string;
};

// Items de Inventario
export type ItemInventario = {
  id_item: number;
  id_tenant: string;
  id_categoria?: number;
  codigo?: string;
  nombre: string;
  descripcion?: string;
  unidad_medida: string;
  stock_actual: number;
  stock_minimo: number;
  stock_maximo?: number;
  precio_costo?: number;
  precio_venta?: number;
  ubicacion?: string;
  imagen_url?: string;
  activo: boolean;
  created_at: string;
  updated_at: string;
};

// Item con detalles de categoría y proveedores
export type ItemInventarioConDetalles = ItemInventario & {
  categorias_inventario?: CategoriaInventario;
  proveedores?: ProveedorConRelacion[];
  stock_bajo?: boolean; // calculado en el cliente
  margen_porcentaje?: number; // calculado en el cliente
};

// Proveedores
export type Proveedor = {
  id_proveedor: number;
  id_tenant: string;
  codigo?: string;
  nombre: string;
  razon_social?: string;
  rut_cuit?: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  ciudad?: string;
  pais: string;
  sitio_web?: string;
  notas?: string;
  activo: boolean;
  created_at: string;
};

// Relación Item-Proveedor
export type ItemProveedor = {
  id_item: number;
  id_proveedor: number;
  precio_compra?: number;
  tiempo_entrega_dias?: number;
  es_proveedor_principal: boolean;
  notas?: string;
  created_at: string;
};

// Proveedor con datos de relación
export type ProveedorConRelacion = Proveedor & Partial<ItemProveedor>;

// Movimientos de Inventario
export type MovimientoInventario = {
  id_movimiento: number;
  id_tenant: string;
  id_item: number;
  tipo: 'entrada' | 'salida' | 'ajuste';
  cantidad: number;
  stock_anterior: number;
  stock_nuevo: number;
  precio_unitario?: number;
  costo_total?: number;
  motivo?: string;
  referencia?: string;
  id_proveedor?: number;
  id_tarea?: number;
  id_usuario?: string;
  fecha: string;
  notas?: string;
};

// Movimiento con detalles relacionados
export type MovimientoConDetalles = MovimientoInventario & {
  items_inventario?: ItemInventario;
  proveedores?: Proveedor;
  tareas?: { id_tarea: number; titulo: string };
  users?: { id_user: string; nombre: string };
};

// Tipos para formularios de creación
export type CreateItemInventarioData = Omit<
  ItemInventario,
  'id_item' | 'id_tenant' | 'created_at' | 'updated_at' | 'stock_actual'
>;

export type CreateCategoriaInventarioData = Omit<
  CategoriaInventario,
  'id_categoria' | 'id_tenant' | 'created_at'
>;

export type CreateProveedorData = Omit<
  Proveedor,
  'id_proveedor' | 'id_tenant' | 'created_at'
>;

export type CreateMovimientoData = {
  id_item: number;
  tipo: 'entrada' | 'salida' | 'ajuste';
  cantidad: number;
  precio_unitario?: number;
  motivo?: string;
  referencia?: string;
  id_proveedor?: number;
  id_tarea?: number;
  notas?: string;
};

// Tipos para opciones de select
export type CategoriaInventarioOption = {
  id_categoria: number;
  nombre: string;
  icono?: string;
  color?: string;
};

export type ItemInventarioOption = {
  id_item: number;
  codigo?: string;
  nombre: string;
  unidad_medida: string;
  stock_actual: number;
};

export type ProveedorOption = {
  id_proveedor: number;
  nombre: string;
  codigo?: string;
};
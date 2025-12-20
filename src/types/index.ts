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

export type Maceta = {
  id_maceta: number;
  id_tenant: string; // UUID
  tipo: string;
  material?: string;
  diametro_cm?: number;
  altura_cm?: number;
  volumen_lts?: number;
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
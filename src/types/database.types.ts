// Tipos manuales alineados con supabase/migrations/*.sql
// Si el schema cambia, actualiza este archivo (o genera uno con `supabase gen types typescript`).

export type Rol =
  | "admin"
  | "cocina"
  | "bar"
  | "limpieza"
  | "housekeeping"
  | "mantenimiento"
  | "oficina"
  | "piscina_jardin"
  | "compras";

export type TipoMovimiento = "entrada" | "salida" | "merma";

export type EstadoActivo = "operativo" | "mantenimiento" | "dañado" | "baja";

export interface Area {
  id: string;
  nombre: string;
}

export interface Categoria {
  id: string;
  area_id: string | null;
  nombre: string;
}

export interface Proveedor {
  id: string;
  nombre: string | null;
  contacto: string | null;
  whatsapp: string | null;
}

export interface Producto {
  id: string;
  nombre: string;
  categoria_id: string | null;
  unidad_medida: string;
  stock_actual: number;
  stock_minimo: number;
  dias_reposicion: number;
  consumo_promedio_diario: number;
  costo_unitario: number | null;
  proveedor_id: string | null;
  activo: boolean;
}

export interface Usuario {
  id: string;
  nombre: string;
  rol: Rol;
  area_id: string | null;
  auth_user_id: string | null;
}

export interface Movimiento {
  id: string;
  producto_id: string | null;
  usuario_id: string | null;
  tipo: TipoMovimiento;
  cantidad: number;
  fecha: string;
  nota: string | null;
}

export interface CategoriaActivo {
  id: string;
  nombre: string;
}

export interface Ubicacion {
  id: string;
  nombre: string;
  area_id: string | null;
}

export interface Activo {
  id: string;
  nombre: string;
  categoria_id: string | null;
  ubicacion_id: string | null;
  numero_serie: string | null;
  proveedor_id: string | null;
  fecha_compra: string | null;
  costo: number | null;
  estado: EstadoActivo;
  activo: boolean;
}

export interface Mantenimiento {
  id: string;
  activo_id: string | null;
  usuario_id: string | null;
  tipo: string;
  descripcion: string | null;
  costo: number | null;
  fecha: string;
  proximo_mantenimiento: string | null;
}

export interface Platillo {
  id: string;
  nombre: string;
  activo: boolean;
}

export interface RecetaItem {
  id: string;
  platillo_id: string | null;
  producto_id: string | null;
  cantidad: number;
}

export interface StockBajoRow {
  id: string;
  nombre: string;
  stock_actual: number;
  stock_minimo: number;
  whatsapp: string | null;
  contacto: string | null;
  proveedor_nombre: string | null;
}

export interface MantenimientoPendienteRow {
  id: string;
  nombre: string;
  ubicacion: string | null;
  proximo_mantenimiento: string | null;
}

// `Relationships: []` es requerido por el tipo GenericTable de @supabase/postgrest-js
// para que el cliente tipado infiera bien Insert/Update. Al dejarlo vacío, las
// selects con recursos embebidos (ej. "productos(nombre)") no se tipan de forma
// precisa — por eso esas consultas puntuales se castean explícitamente en el
// código (ver historial/page.tsx, activos/page.tsx, activos/[id]/page.tsx).
export interface Database {
  public: {
    Tables: {
      areas: {
        Row: Area;
        Insert: Partial<Area>;
        Update: Partial<Area>;
        Relationships: [];
      };
      categorias: {
        Row: Categoria;
        Insert: Partial<Categoria>;
        Update: Partial<Categoria>;
        Relationships: [];
      };
      proveedores: {
        Row: Proveedor;
        Insert: Partial<Proveedor>;
        Update: Partial<Proveedor>;
        Relationships: [];
      };
      productos: {
        Row: Producto;
        Insert: Partial<Producto>;
        Update: Partial<Producto>;
        Relationships: [];
      };
      usuarios: {
        Row: Usuario;
        Insert: Partial<Usuario>;
        Update: Partial<Usuario>;
        Relationships: [];
      };
      movimientos: {
        Row: Movimiento;
        Insert: Partial<Movimiento>;
        Update: Partial<Movimiento>;
        Relationships: [];
      };
      categorias_activos: {
        Row: CategoriaActivo;
        Insert: Partial<CategoriaActivo>;
        Update: Partial<CategoriaActivo>;
        Relationships: [];
      };
      ubicaciones: {
        Row: Ubicacion;
        Insert: Partial<Ubicacion>;
        Update: Partial<Ubicacion>;
        Relationships: [];
      };
      activos: {
        Row: Activo;
        Insert: Partial<Activo>;
        Update: Partial<Activo>;
        Relationships: [];
      };
      mantenimientos: {
        Row: Mantenimiento;
        Insert: Partial<Mantenimiento>;
        Update: Partial<Mantenimiento>;
        Relationships: [];
      };
      platillos: {
        Row: Platillo;
        Insert: Partial<Platillo>;
        Update: Partial<Platillo>;
        Relationships: [];
      };
      receta_items: {
        Row: RecetaItem;
        Insert: Partial<RecetaItem>;
        Update: Partial<RecetaItem>;
        Relationships: [];
      };
    };
    Views: {
      stock_bajo: { Row: StockBajoRow; Relationships: [] };
      mantenimiento_pendiente: { Row: MantenimientoPendienteRow; Relationships: [] };
    };
    Functions: Record<string, never>;
  };
}

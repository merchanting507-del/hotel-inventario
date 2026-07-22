-- Inventario de consumibles: areas, categorias, proveedores, productos, usuarios, movimientos

create extension if not exists "pgcrypto";

create table areas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null
);

create table categorias (
  id uuid primary key default gen_random_uuid(),
  area_id uuid references areas(id),
  nombre text not null
);

create table proveedores (
  id uuid primary key default gen_random_uuid(),
  nombre text,
  contacto text,
  whatsapp text
);

create table productos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  categoria_id uuid references categorias(id),
  unidad_medida text not null,
  stock_actual numeric default 0,
  stock_minimo numeric default 0,
  dias_reposicion numeric default 2,
  consumo_promedio_diario numeric default 0,
  costo_unitario numeric,
  proveedor_id uuid references proveedores(id),
  activo boolean default true
);

-- usuarios.auth_user_id es el unico campo agregado sobre lo pedido por el cliente,
-- para enlazar cada usuario del sistema con Supabase Auth.
create table usuarios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  rol text not null,
  area_id uuid references areas(id),
  auth_user_id uuid references auth.users(id)
);

create table movimientos (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid references productos(id),
  usuario_id uuid references usuarios(id),
  tipo text not null,
  cantidad numeric not null,
  fecha timestamptz default now(),
  nota text
);

create view stock_bajo as
select p.id, p.nombre, p.stock_actual, p.stock_minimo, pr.whatsapp, pr.contacto, pr.nombre as proveedor_nombre
from productos p
left join proveedores pr on p.proveedor_id = pr.id
where p.stock_actual <= p.stock_minimo and p.activo = true;

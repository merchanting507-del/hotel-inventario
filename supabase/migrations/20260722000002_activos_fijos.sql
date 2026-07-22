-- Activos fijos: categorias_activos, ubicaciones, activos, mantenimientos

create table categorias_activos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null
);

create table ubicaciones (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  area_id uuid references areas(id)
);

create table activos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  categoria_id uuid references categorias_activos(id),
  ubicacion_id uuid references ubicaciones(id),
  numero_serie text,
  proveedor_id uuid references proveedores(id),
  fecha_compra date,
  costo numeric,
  estado text not null default 'operativo',
  activo boolean default true,
  constraint activos_estado_check check (estado in ('operativo', 'mantenimiento', 'dañado', 'baja'))
);

create table mantenimientos (
  id uuid primary key default gen_random_uuid(),
  activo_id uuid references activos(id),
  usuario_id uuid references usuarios(id),
  tipo text not null,
  descripcion text,
  costo numeric,
  fecha timestamptz default now(),
  proximo_mantenimiento date
);

create view mantenimiento_pendiente as
select a.id, a.nombre, u.nombre as ubicacion, m.proximo_mantenimiento
from activos a
left join ubicaciones u on a.ubicacion_id = u.id
left join lateral (
  select proximo_mantenimiento from mantenimientos
  where activo_id = a.id order by fecha desc limit 1
) m on true
where a.activo = true and m.proximo_mantenimiento <= current_date + interval '7 days';

-- Inventario local por area (hoy solo se usa para Cocina): un area puede
-- tener su propio conteo de stock, separado del stock de bodega
-- (productos.stock_actual), que se arma unicamente a partir de lo que se
-- le transfiere desde bodega. Un movimiento tipo "transferencia" resta de
-- bodega y suma al area destino en un solo paso.
--
-- movimientos.area_id nulo = movimiento de bodega (comportamiento actual,
-- sin cambios). movimientos.area_id con valor = movimiento local de esa
-- area, afecta stock_area en vez de productos.stock_actual.

create table stock_area (
  id uuid primary key default gen_random_uuid(),
  area_id uuid references areas(id) not null,
  producto_id uuid references productos(id) not null,
  cantidad numeric not null default 0,
  unique (area_id, producto_id)
);

alter table movimientos add column area_id uuid references areas(id);

alter table stock_area enable row level security;

create policy "stock_area_select" on stock_area for select to authenticated using (true);
create policy "stock_area_write" on stock_area for all to authenticated using (true) with check (true);

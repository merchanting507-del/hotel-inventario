-- Platillos con receta: cada platillo se compone de N productos (ingredientes)
-- en una cantidad fija. Al "vender" un platillo, se generan movimientos de
-- salida por cada ingrediente (cantidad_receta * cantidad_vendida) y se
-- descuenta stock_actual de cada producto. Se permite que el stock quede
-- en negativo (aviso de que faltó comprar), no se bloquea la venta.

create table platillos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  activo boolean default true
);

create table receta_items (
  id uuid primary key default gen_random_uuid(),
  platillo_id uuid references platillos(id) on delete cascade,
  producto_id uuid references productos(id),
  cantidad numeric not null
);

alter table platillos enable row level security;
alter table receta_items enable row level security;

create policy "platillos_select" on platillos for select to authenticated using (true);
create policy "platillos_write" on platillos for all to authenticated using (true) with check (true);

create policy "receta_items_select" on receta_items for select to authenticated using (true);
create policy "receta_items_write" on receta_items for all to authenticated using (true) with check (true);

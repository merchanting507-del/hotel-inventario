-- Row Level Security
--
-- TODO (simplificado a propósito): el requisito ideal es que un usuario no-admin
-- solo pueda insertar/actualizar movimientos y mantenimientos de su propia área
-- (usuarios.area_id). Resolver eso correctamente requiere leer usuarios.rol y
-- usuarios.area_id del usuario autenticado dentro de la política (vía una función
-- auxiliar tipo current_usuario_id()/current_rol()), lo cual se deja pendiente.
-- Por ahora se usa una política permisiva: cualquier usuario autenticado puede
-- leer todo e insertar/actualizar/eliminar todo. La restricción real por rol/área
-- debe implementarse antes de ir a producción con múltiples clientes/hoteles.

alter table areas enable row level security;
alter table categorias enable row level security;
alter table proveedores enable row level security;
alter table productos enable row level security;
alter table usuarios enable row level security;
alter table movimientos enable row level security;
alter table categorias_activos enable row level security;
alter table ubicaciones enable row level security;
alter table activos enable row level security;
alter table mantenimientos enable row level security;

-- areas
create policy "areas_select" on areas for select to authenticated using (true);
create policy "areas_write" on areas for all to authenticated using (true) with check (true);

-- categorias
create policy "categorias_select" on categorias for select to authenticated using (true);
create policy "categorias_write" on categorias for all to authenticated using (true) with check (true);

-- proveedores
create policy "proveedores_select" on proveedores for select to authenticated using (true);
create policy "proveedores_write" on proveedores for all to authenticated using (true) with check (true);

-- productos
create policy "productos_select" on productos for select to authenticated using (true);
create policy "productos_write" on productos for all to authenticated using (true) with check (true);

-- usuarios
create policy "usuarios_select" on usuarios for select to authenticated using (true);
create policy "usuarios_write" on usuarios for all to authenticated using (true) with check (true);

-- movimientos
create policy "movimientos_select" on movimientos for select to authenticated using (true);
create policy "movimientos_write" on movimientos for all to authenticated using (true) with check (true);

-- categorias_activos
create policy "categorias_activos_select" on categorias_activos for select to authenticated using (true);
create policy "categorias_activos_write" on categorias_activos for all to authenticated using (true) with check (true);

-- ubicaciones
create policy "ubicaciones_select" on ubicaciones for select to authenticated using (true);
create policy "ubicaciones_write" on ubicaciones for all to authenticated using (true) with check (true);

-- activos
create policy "activos_select" on activos for select to authenticated using (true);
create policy "activos_write" on activos for all to authenticated using (true) with check (true);

-- mantenimientos
create policy "mantenimientos_select" on mantenimientos for select to authenticated using (true);
create policy "mantenimientos_write" on mantenimientos for all to authenticated using (true) with check (true);

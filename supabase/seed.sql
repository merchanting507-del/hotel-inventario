-- Seed data de ejemplo para hotel-inventario
-- stock_actual, stock_minimo, consumo_promedio_diario y costo_unitario quedan en
-- placeholders (0 / null) — el cliente los completa con datos reales después.

-- =========================================================
-- AREAS
-- =========================================================
insert into areas (nombre) values
  ('Cocina'),
  ('Bar'),
  ('Limpieza'),
  ('Housekeeping'),
  ('Mantenimiento'),
  ('Oficina'),
  ('Piscina y Jardín');

-- =========================================================
-- CATEGORIAS
-- =========================================================
insert into categorias (area_id, nombre)
select a.id, c.nombre
from areas a
join (values
  ('Cocina', 'Proteínas'),
  ('Cocina', 'Lácteos y Huevos'),
  ('Cocina', 'Frutas'),
  ('Cocina', 'Vegetales'),
  ('Cocina', 'Abarrotes'),
  ('Cocina', 'Congelados'),
  ('Cocina', 'Bebidas'),
  ('Bar', 'General'),
  ('Limpieza', 'General'),
  ('Housekeeping', 'Lencería'),
  ('Housekeeping', 'Toallas'),
  ('Housekeeping', 'Amenidades'),
  ('Mantenimiento', 'General'),
  ('Oficina', 'General'),
  ('Piscina y Jardín', 'General')
) as c(area_nombre, nombre) on c.area_nombre = a.nombre;

-- =========================================================
-- PRODUCTOS
-- =========================================================

-- Cocina / Proteínas
insert into productos (nombre, categoria_id, unidad_medida)
select v.nombre, cat.id, v.unidad
from (values
  ('Pollo entero', 'kg'),
  ('Pechuga de pollo', 'kg'),
  ('Muslo encuentro', 'kg'),
  ('Alas de pollo', 'kg'),
  ('Carne molida', 'kg'),
  ('Filete de res', 'kg'),
  ('New York', 'kg'),
  ('Falda', 'kg'),
  ('Entrada de res', 'kg'),
  ('Corvina entera', 'kg'),
  ('Róbalo entero', 'kg'),
  ('Pargo entero', 'kg'),
  ('Filete de corvina', 'kg'),
  ('Filete de róbalo', 'kg'),
  ('Filete de pargo', 'kg'),
  ('Filete de cazón', 'kg'),
  ('Camarón blanco', 'kg'),
  ('Langostino', 'kg')
) as v(nombre, unidad)
cross join (
  select c.id from categorias c join areas a on c.area_id = a.id
  where c.nombre = 'Proteínas' and a.nombre = 'Cocina'
) as cat;

-- Cocina / Lácteos y Huevos
insert into productos (nombre, categoria_id, unidad_medida)
select v.nombre, cat.id, v.unidad
from (values
  ('Leche', 'litro'),
  ('Queso mozzarella', 'kg'),
  ('Queso cheddar', 'kg'),
  ('Queso parmesano', 'kg'),
  ('Mantequilla', 'kg'),
  ('Crema de leche', 'litro'),
  ('Yogur', 'litro'),
  ('Huevos', 'unidad')
) as v(nombre, unidad)
cross join (
  select c.id from categorias c join areas a on c.area_id = a.id
  where c.nombre = 'Lácteos y Huevos' and a.nombre = 'Cocina'
) as cat;

-- Cocina / Frutas
insert into productos (nombre, categoria_id, unidad_medida)
select v.nombre, cat.id, v.unidad
from (values
  ('Piña', 'unidad'),
  ('Papaya', 'unidad'),
  ('Sandía', 'unidad'),
  ('Melón', 'unidad'),
  ('Banano', 'kg'),
  ('Limón', 'kg'),
  ('Naranja', 'kg'),
  ('Manzana', 'kg'),
  ('Uvas', 'kg')
) as v(nombre, unidad)
cross join (
  select c.id from categorias c join areas a on c.area_id = a.id
  where c.nombre = 'Frutas' and a.nombre = 'Cocina'
) as cat;

-- Cocina / Vegetales
insert into productos (nombre, categoria_id, unidad_medida)
select v.nombre, cat.id, v.unidad
from (values
  ('Lechuga', 'unidad'),
  ('Tomate', 'kg'),
  ('Cebolla blanca', 'kg'),
  ('Cebolla morada', 'kg'),
  ('Zanahoria', 'kg'),
  ('Papa', 'kg'),
  ('Pepino', 'kg'),
  ('Brócoli', 'kg'),
  ('Coliflor', 'unidad'),
  ('Pimentón rojo', 'kg'),
  ('Pimentón verde', 'kg'),
  ('Ajo', 'kg'),
  ('Culantro', 'manojo'),
  ('Perejil', 'manojo')
) as v(nombre, unidad)
cross join (
  select c.id from categorias c join areas a on c.area_id = a.id
  where c.nombre = 'Vegetales' and a.nombre = 'Cocina'
) as cat;

-- Cocina / Abarrotes
insert into productos (nombre, categoria_id, unidad_medida)
select v.nombre, cat.id, v.unidad
from (values
  ('Arroz', 'kg'),
  ('Pasta', 'kg'),
  ('Harina', 'kg'),
  ('Azúcar', 'kg'),
  ('Sal', 'kg'),
  ('Aceite', 'litro'),
  ('Vinagre', 'litro'),
  ('Especias', 'kg'),
  ('Salsas', 'litro'),
  ('Enlatados', 'unidad')
) as v(nombre, unidad)
cross join (
  select c.id from categorias c join areas a on c.area_id = a.id
  where c.nombre = 'Abarrotes' and a.nombre = 'Cocina'
) as cat;

-- Cocina / Congelados
insert into productos (nombre, categoria_id, unidad_medida)
select v.nombre, cat.id, v.unidad
from (values
  ('Papas fritas', 'kg'),
  ('Vegetales congelados', 'kg'),
  ('Carnes congeladas', 'kg'),
  ('Mariscos congelados', 'kg'),
  ('Hielo', 'kg')
) as v(nombre, unidad)
cross join (
  select c.id from categorias c join areas a on c.area_id = a.id
  where c.nombre = 'Congelados' and a.nombre = 'Cocina'
) as cat;

-- Cocina / Bebidas
insert into productos (nombre, categoria_id, unidad_medida)
select v.nombre, cat.id, v.unidad
from (values
  ('Agua', 'litro'),
  ('Gaseosas', 'litro'),
  ('Jugos', 'litro'),
  ('Café', 'kg'),
  ('Té', 'caja')
) as v(nombre, unidad)
cross join (
  select c.id from categorias c join areas a on c.area_id = a.id
  where c.nombre = 'Bebidas' and a.nombre = 'Cocina'
) as cat;

-- Bar / General
insert into productos (nombre, categoria_id, unidad_medida)
select v.nombre, cat.id, v.unidad
from (values
  ('Whisky', 'botella'),
  ('Ron', 'botella'),
  ('Vodka', 'botella'),
  ('Gin', 'botella'),
  ('Tequila', 'botella'),
  ('Brandy', 'botella'),
  ('Vinos', 'botella'),
  ('Cervezas', 'unidad'),
  ('Refrescos', 'litro'),
  ('Jugos', 'litro'),
  ('Jarabes', 'litro'),
  ('Garnituras', 'kg'),
  ('Hielo', 'kg')
) as v(nombre, unidad)
cross join (
  select c.id from categorias c join areas a on c.area_id = a.id
  where c.nombre = 'General' and a.nombre = 'Bar'
) as cat;

-- Limpieza / General
insert into productos (nombre, categoria_id, unidad_medida)
select v.nombre, cat.id, v.unidad
from (values
  ('Cloro', 'litro'),
  ('Desengrasante', 'litro'),
  ('Detergente', 'kg'),
  ('Desinfectante', 'litro'),
  ('Limpiavidrios', 'litro'),
  ('Limpiador multiuso', 'litro'),
  ('Limpiador para baños', 'litro'),
  ('Limpiador para pisos', 'litro'),
  ('Ambientadores', 'unidad'),
  ('Jabón líquido', 'litro'),
  ('Papel toalla', 'rollo'),
  ('Papel higiénico', 'rollo'),
  ('Bolsas de basura', 'paquete'),
  ('Esponjas', 'unidad'),
  ('Trapos de limpieza', 'unidad'),
  ('Paños de microfibra', 'unidad'),
  ('Escobas', 'unidad'),
  ('Trapeadores', 'unidad'),
  ('Baldes', 'unidad'),
  ('Guantes', 'par'),
  ('Cepillos', 'unidad')
) as v(nombre, unidad)
cross join (
  select c.id from categorias c join areas a on c.area_id = a.id
  where c.nombre = 'General' and a.nombre = 'Limpieza'
) as cat;

-- Housekeeping / Lencería
insert into productos (nombre, categoria_id, unidad_medida)
select v.nombre, cat.id, v.unidad
from (values
  ('Sábanas individuales', 'unidad'),
  ('Sábanas matrimoniales', 'unidad'),
  ('Fundas para almohadas', 'unidad'),
  ('Almohadas', 'unidad'),
  ('Protectores de almohadas', 'unidad'),
  ('Protectores de colchón', 'unidad'),
  ('Cobijas', 'unidad'),
  ('Edredones', 'unidad'),
  ('Cubrecamas', 'unidad'),
  ('Faldones de cama', 'unidad')
) as v(nombre, unidad)
cross join (
  select c.id from categorias c join areas a on c.area_id = a.id
  where c.nombre = 'Lencería' and a.nombre = 'Housekeeping'
) as cat;

-- Housekeeping / Toallas
insert into productos (nombre, categoria_id, unidad_medida)
select v.nombre, cat.id, v.unidad
from (values
  ('Toallas de baño', 'unidad'),
  ('Toallas de mano', 'unidad'),
  ('Toallas faciales', 'unidad'),
  ('Toallas de piscina', 'unidad'),
  ('Alfombras de baño', 'unidad')
) as v(nombre, unidad)
cross join (
  select c.id from categorias c join areas a on c.area_id = a.id
  where c.nombre = 'Toallas' and a.nombre = 'Housekeeping'
) as cat;

-- Housekeeping / Amenidades
insert into productos (nombre, categoria_id, unidad_medida)
select v.nombre, cat.id, v.unidad
from (values
  ('Jabón de baño', 'unidad'),
  ('Shampoo', 'unidad'),
  ('Acondicionador', 'unidad'),
  ('Gel de baño', 'unidad'),
  ('Crema corporal', 'unidad'),
  ('Gorro de baño', 'unidad'),
  ('Kit dental', 'unidad'),
  ('Kit de afeitar', 'unidad'),
  ('Hisopos', 'paquete'),
  ('Pañuelos desechables', 'paquete'),
  ('Bolsa para lavandería', 'unidad'),
  ('Papel higiénico', 'rollo')
) as v(nombre, unidad)
cross join (
  select c.id from categorias c join areas a on c.area_id = a.id
  where c.nombre = 'Amenidades' and a.nombre = 'Housekeeping'
) as cat;

-- Mantenimiento / General
insert into productos (nombre, categoria_id, unidad_medida)
select v.nombre, cat.id, v.unidad
from (values
  ('Pintura', 'galón'),
  ('Thinner', 'litro'),
  ('Brochas', 'unidad'),
  ('Rodillos', 'unidad'),
  ('Bombillos', 'unidad'),
  ('Tornillos', 'caja'),
  ('Clavos', 'caja'),
  ('Cables eléctricos', 'metro'),
  ('Tuberías PVC', 'unidad'),
  ('Silicona', 'unidad'),
  ('Herramientas', 'unidad')
) as v(nombre, unidad)
cross join (
  select c.id from categorias c join areas a on c.area_id = a.id
  where c.nombre = 'General' and a.nombre = 'Mantenimiento'
) as cat;

-- Oficina / General
insert into productos (nombre, categoria_id, unidad_medida)
select v.nombre, cat.id, v.unidad
from (values
  ('Resmas de papel', 'unidad'),
  ('Lapiceros', 'unidad'),
  ('Carpetas', 'unidad'),
  ('Tinta para impresora', 'unidad'),
  ('Grapadora', 'unidad'),
  ('Grapas', 'caja'),
  ('Cinta adhesiva', 'unidad'),
  ('Marcadores', 'unidad')
) as v(nombre, unidad)
cross join (
  select c.id from categorias c join areas a on c.area_id = a.id
  where c.nombre = 'General' and a.nombre = 'Oficina'
) as cat;

-- Piscina y Jardín / General
insert into productos (nombre, categoria_id, unidad_medida)
select v.nombre, cat.id, v.unidad
from (values
  ('Cloro para piscina', 'kg'),
  ('Regulador de pH', 'litro'),
  ('Red para piscina', 'unidad'),
  ('Cepillos', 'unidad'),
  ('Fertilizantes', 'kg'),
  ('Mangueras', 'unidad'),
  ('Herramientas de jardinería', 'unidad')
) as v(nombre, unidad)
cross join (
  select c.id from categorias c join areas a on c.area_id = a.id
  where c.nombre = 'General' and a.nombre = 'Piscina y Jardín'
) as cat;

-- =========================================================
-- ACTIVOS FIJOS
-- =========================================================

insert into categorias_activos (nombre) values
  ('Refrigeración'),
  ('Cocina Industrial'),
  ('Electrónica'),
  ('Climatización'),
  ('Mobiliario/Habitación');

-- Activos de ejemplo, sin ubicacion_id (null) — el cliente los ubica después.
insert into activos (nombre, categoria_id, estado)
select v.nombre, cat.id, 'operativo'
from (values
  ('Refrigeración', 'Refrigeradores'),
  ('Refrigeración', 'Congeladores'),
  ('Cocina Industrial', 'Estufas'),
  ('Cocina Industrial', 'Hornos'),
  ('Cocina Industrial', 'Microondas'),
  ('Cocina Industrial', 'Licuadoras'),
  ('Cocina Industrial', 'Cafeteras'),
  ('Electrónica', 'Televisores'),
  ('Electrónica', 'Computadoras'),
  ('Electrónica', 'Impresoras'),
  ('Climatización', 'Aires acondicionados'),
  ('Mobiliario/Habitación', 'Camas'),
  ('Mobiliario/Habitación', 'Colchones'),
  ('Mobiliario/Habitación', 'Mesas'),
  ('Mobiliario/Habitación', 'Sillas')
) as v(categoria_nombre, nombre)
cross join lateral (
  select id from categorias_activos where nombre = v.categoria_nombre
) as cat;

-- =========================================================
-- USUARIOS (sin auth_user_id todavía — se enlaza al crear el usuario en Supabase Auth)
-- =========================================================
insert into usuarios (nombre, rol, area_id)
select v.nombre, v.rol, a.id
from (values
  ('Usuario Cocina', 'cocina', 'Cocina'),
  ('Usuario Bar', 'bar', 'Bar'),
  ('Usuario Limpieza', 'limpieza', 'Limpieza'),
  ('Usuario Housekeeping', 'housekeeping', 'Housekeeping'),
  ('Usuario Mantenimiento', 'mantenimiento', 'Mantenimiento'),
  ('Usuario Oficina', 'oficina', 'Oficina'),
  ('Usuario Piscina y Jardín', 'piscina_jardin', 'Piscina y Jardín')
) as v(nombre, rol, area_nombre)
join areas a on a.nombre = v.area_nombre;

-- admin y compras no pertenecen a un área operativa fija
insert into usuarios (nombre, rol, area_id) values
  ('Administrador', 'admin', null),
  ('Usuario Compras', 'compras', null);

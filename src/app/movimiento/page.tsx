import { requireUsuario } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import MovimientoForm from "./MovimientoForm";

export default async function MovimientoPage() {
  const usuario = await requireUsuario();
  const supabase = await createClient();

  // "compras" no pertenece a un área física fija: necesita ver todos los
  // productos para poder registrar movimientos de cualquier área.
  const isAdmin = usuario.rol === "admin" || usuario.rol === "compras";

  const { data: categorias } = await supabase
    .from("categorias")
    .select("*")
    .order("nombre");

  const categoriasDelArea = isAdmin
    ? categorias ?? []
    : (categorias ?? []).filter((c) => c.area_id === usuario.area_id);

  const categoriaIds = categoriasDelArea.map((c) => c.id);

  const productosQuery = supabase
    .from("productos")
    .select("*")
    .eq("activo", true)
    .order("nombre");

  const { data: productos } = isAdmin
    ? await productosQuery
    : await productosQuery.in("categoria_id", categoriaIds.length ? categoriaIds : ["-"]);

  // Cocina tiene su propio inventario local: el "stock actual" que ve y
  // registra es el de stock_area, no el de bodega.
  let productosParaMostrar = productos ?? [];
  if (usuario.rol === "cocina" && usuario.area_id) {
    const { data: stockCocina } = await supabase
      .from("stock_area")
      .select("*")
      .eq("area_id", usuario.area_id);

    const cantidadPorProducto = new Map(
      (stockCocina ?? []).map((s) => [s.producto_id, s.cantidad])
    );

    productosParaMostrar = productosParaMostrar.map((p) => ({
      ...p,
      stock_actual: cantidadPorProducto.get(p.id) ?? 0,
    }));
  }

  return (
    <div className="px-4 py-4">
      <h1 className="mb-4 font-display text-2xl font-semibold text-ink">Registrar movimiento</h1>
      <MovimientoForm
        productos={productosParaMostrar}
        categorias={categoriasDelArea}
      />
    </div>
  );
}

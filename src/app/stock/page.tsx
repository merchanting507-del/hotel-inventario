import Link from "next/link";
import { requireUsuario } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Producto } from "@/types/database.types";

function semaforo(producto: Producto): { color: string; label: string } {
  if (producto.stock_actual <= producto.stock_minimo) {
    return { color: "bg-wine", label: "Bajo" };
  }
  if (producto.stock_actual <= producto.stock_minimo * 1.5) {
    return { color: "bg-gold", label: "Medio" };
  }
  return { color: "bg-pine", label: "OK" };
}

// El stock_minimo de un producto es un umbral de bodega; en el inventario
// local de Cocina (cantidades mucho más chicas) no aplica, así que ahí solo
// marcamos si hay o no hay existencia.
function semaforoLocal(cantidad: number): { color: string; label: string } {
  return cantidad <= 0
    ? { color: "bg-wine", label: "Sin existencia" }
    : { color: "bg-pine", label: "Hay" };
}

export default async function StockPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const usuario = await requireUsuario();
  const supabase = await createClient();
  // "compras" no pertenece a un área física fija: necesita ver el stock
  // de todos los productos, no solo los de un área.
  const isAdmin = usuario.rol === "admin" || usuario.rol === "compras";
  const esCocina = usuario.rol === "cocina";
  // Admin/compras puede alternar a ver el inventario local de Cocina con
  // ?vista=cocina, ya que ellos son quienes hacen las transferencias pero
  // no tienen su propia fila de stock_area.
  const verCocina = esCocina || (isAdmin && params.vista === "cocina");

  const { data: categorias } = await supabase.from("categorias").select("*");

  let areaId = usuario.area_id;
  if (isAdmin && verCocina) {
    const { data: areaCocina } = await supabase
      .from("areas")
      .select("id")
      .eq("nombre", "Cocina")
      .maybeSingle();
    areaId = areaCocina?.id ?? null;
  }

  const categoriaIds = isAdmin && !verCocina
    ? (categorias ?? []).map((c) => c.id)
    : (categorias ?? []).filter((c) => c.area_id === areaId).map((c) => c.id);

  const query = supabase
    .from("productos")
    .select("*")
    .eq("activo", true)
    .order("nombre");

  const { data: productos } =
    isAdmin && !verCocina
      ? await query
      : await query.in("categoria_id", categoriaIds.length ? categoriaIds : ["-"]);

  // Cocina (o admin viendo "Cocina") ve el inventario local (stock_area),
  // no el de bodega.
  let productosParaMostrar = productos ?? [];
  if (verCocina && areaId) {
    const { data: stockCocina } = await supabase
      .from("stock_area")
      .select("*")
      .eq("area_id", areaId);

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
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Stock</h1>
        {isAdmin && (
          <div className="flex overflow-hidden rounded-lg border border-line text-sm">
            <Link
              href="/stock"
              className={`px-3 py-1.5 font-medium ${
                !verCocina ? "bg-gold text-white" : "bg-white text-ink-light/70"
              }`}
            >
              Bodega
            </Link>
            <Link
              href="/stock?vista=cocina"
              className={`px-3 py-1.5 font-medium ${
                verCocina ? "bg-gold text-white" : "bg-white text-ink-light/70"
              }`}
            >
              Cocina
            </Link>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {productosParaMostrar.map((producto) => {
          const { color, label } = verCocina ? semaforoLocal(producto.stock_actual) : semaforo(producto);
          return (
            <div
              key={producto.id}
              className="flex items-center justify-between rounded-xl border border-line bg-paper-card px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white ${color}`}
                  aria-label={label}
                />
                <div>
                  <p className="font-medium text-ink">{producto.nombre}</p>
                  {!verCocina && (
                    <p className="figures text-xs text-ink-light/50">
                      Mínimo: {producto.stock_minimo} {producto.unidad_medida}
                    </p>
                  )}
                </div>
              </div>
              <p className="figures text-lg font-semibold text-ink">
                {producto.stock_actual}
                <span className="ml-1 text-sm font-normal text-ink-light/50">
                  {producto.unidad_medida}
                </span>
              </p>
            </div>
          );
        })}
        {productosParaMostrar.length === 0 && (
          <p className="py-8 text-center text-sm text-ink-light/40">
            {verCocina
              ? "Cocina todavía no tiene productos transferidos."
              : "No hay productos registrados para tu área."}
          </p>
        )}
      </div>
    </div>
  );
}

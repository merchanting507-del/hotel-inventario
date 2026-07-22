import { requireUsuario } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Producto } from "@/types/database.types";

function semaforo(producto: Producto): { color: string; label: string } {
  if (producto.stock_actual <= producto.stock_minimo) {
    return { color: "bg-red-500", label: "Bajo" };
  }
  if (producto.stock_actual <= producto.stock_minimo * 1.5) {
    return { color: "bg-yellow-500", label: "Medio" };
  }
  return { color: "bg-green-500", label: "OK" };
}

export default async function StockPage() {
  const usuario = await requireUsuario();
  const supabase = await createClient();
  const isAdmin = usuario.rol === "admin";

  const { data: categorias } = await supabase.from("categorias").select("*");

  const categoriaIds = isAdmin
    ? (categorias ?? []).map((c) => c.id)
    : (categorias ?? [])
        .filter((c) => c.area_id === usuario.area_id)
        .map((c) => c.id);

  const query = supabase
    .from("productos")
    .select("*")
    .eq("activo", true)
    .order("nombre");

  const { data: productos } = isAdmin
    ? await query
    : await query.in("categoria_id", categoriaIds.length ? categoriaIds : ["-"]);

  return (
    <div className="px-4 py-4">
      <h1 className="mb-4 text-xl font-bold">Stock</h1>
      <div className="flex flex-col gap-2">
        {(productos ?? []).map((producto) => {
          const { color, label } = semaforo(producto);
          return (
            <div
              key={producto.id}
              className="flex items-center justify-between rounded-xl border bg-white px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span className={`h-3 w-3 shrink-0 rounded-full ${color}`} aria-label={label} />
                <div>
                  <p className="font-medium">{producto.nombre}</p>
                  <p className="text-xs text-gray-500">
                    Mínimo: {producto.stock_minimo} {producto.unidad_medida}
                  </p>
                </div>
              </div>
              <p className="text-lg font-semibold tabular-nums">
                {producto.stock_actual}
                <span className="ml-1 text-sm font-normal text-gray-500">
                  {producto.unidad_medida}
                </span>
              </p>
            </div>
          );
        })}
        {(productos ?? []).length === 0 && (
          <p className="py-8 text-center text-sm text-gray-400">
            No hay productos registrados para tu área.
          </p>
        )}
      </div>
    </div>
  );
}

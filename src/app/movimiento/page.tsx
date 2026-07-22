import Link from "next/link";
import { requireUsuario } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import MovimientoForm from "./MovimientoForm";

export default async function MovimientoPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const usuario = await requireUsuario();
  const supabase = await createClient();

  // "compras" no pertenece a un área física fija: necesita ver todos los
  // productos para poder registrar movimientos de cualquier área.
  const isAdmin = usuario.rol === "admin" || usuario.rol === "compras";
  const esCocina = usuario.rol === "cocina";
  // Admin/compras puede alternar a registrar movimientos como si fuera
  // Cocina, para poder probar y supervisar sin necesitar esa cuenta.
  const verCocina = esCocina || (isAdmin && params.vista === "cocina");

  const { data: categorias } = await supabase
    .from("categorias")
    .select("*")
    .order("nombre");

  let areaId = usuario.area_id;
  if (isAdmin && verCocina) {
    const { data: areaCocina } = await supabase
      .from("areas")
      .select("id")
      .eq("nombre", "Cocina")
      .maybeSingle();
    areaId = areaCocina?.id ?? null;
  }

  const categoriasDelArea =
    isAdmin && !verCocina
      ? categorias ?? []
      : (categorias ?? []).filter((c) => c.area_id === areaId);

  const categoriaIds = categoriasDelArea.map((c) => c.id);

  const productosQuery = supabase
    .from("productos")
    .select("*")
    .eq("activo", true)
    .order("nombre");

  const { data: productos } =
    isAdmin && !verCocina
      ? await productosQuery
      : await productosQuery.in("categoria_id", categoriaIds.length ? categoriaIds : ["-"]);

  // Cocina (o admin viendo "Cocina") tiene su propio inventario local: el
  // "stock actual" que ve y registra es el de stock_area, no el de bodega.
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
        <h1 className="font-display text-2xl font-semibold text-ink">Registrar movimiento</h1>
        {isAdmin && (
          <div className="flex overflow-hidden rounded-lg border border-line text-sm">
            <Link
              href="/movimiento"
              className={`px-3 py-1.5 font-medium ${
                !verCocina ? "bg-gold text-white" : "bg-white text-ink-light/70"
              }`}
            >
              Bodega
            </Link>
            <Link
              href="/movimiento?vista=cocina"
              className={`px-3 py-1.5 font-medium ${
                verCocina ? "bg-gold text-white" : "bg-white text-ink-light/70"
              }`}
            >
              Cocina
            </Link>
          </div>
        )}
      </div>
      <MovimientoForm
        key={verCocina ? "cocina" : "bodega"}
        productos={productosParaMostrar}
        categorias={categoriasDelArea}
        areaId={verCocina ? areaId : null}
      />
    </div>
  );
}

import { requireUsuario } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import MovimientoForm from "./MovimientoForm";

export default async function MovimientoPage() {
  const usuario = await requireUsuario();
  const supabase = await createClient();

  const isAdmin = usuario.rol === "admin";

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

  return (
    <div className="px-4 py-4">
      <h1 className="mb-4 font-display text-2xl font-semibold text-ink">Registrar movimiento</h1>
      <MovimientoForm
        productos={productos ?? []}
        categorias={categoriasDelArea}
      />
    </div>
  );
}

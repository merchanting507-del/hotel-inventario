import { requireUsuario } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

interface MovimientoConRelaciones {
  id: string;
  tipo: string;
  cantidad: number;
  fecha: string;
  nota: string | null;
  productos: { nombre: string } | null;
  usuarios: { nombre: string } | null;
}

export default async function HistorialPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  const usuario = await requireUsuario();
  const supabase = await createClient();
  const isAdmin = usuario.rol === "admin";

  const { data: areas } = await supabase.from("areas").select("*").order("nombre");
  const { data: categorias } = await supabase.from("categorias").select("*");
  const { data: usuarios } = await supabase
    .from("usuarios")
    .select("*")
    .order("nombre");

  // Área efectiva a filtrar: admin puede elegir cualquiera; el resto solo la suya.
  const areaFiltro = isAdmin ? params.area || "" : usuario.area_id ?? "";

  const categoriaIdsDelArea = (categorias ?? [])
    .filter((c) => (areaFiltro ? c.area_id === areaFiltro : true))
    .map((c) => c.id);

  const { data: productosDisponibles } = await supabase
    .from("productos")
    .select("id, nombre, categoria_id")
    .order("nombre");

  const productosFiltroArea = areaFiltro
    ? (productosDisponibles ?? []).filter((p) =>
        categoriaIdsDelArea.includes(p.categoria_id ?? "")
      )
    : productosDisponibles ?? [];

  let query = supabase
    .from("movimientos")
    .select("id, tipo, cantidad, fecha, nota, productos(nombre), usuarios(nombre)")
    .order("fecha", { ascending: false })
    .limit(200);

  if (!isAdmin) {
    const idsPermitidos = productosFiltroArea.map((p) => p.id);
    query = query.in("producto_id", idsPermitidos.length ? idsPermitidos : ["-"]);
  } else if (areaFiltro) {
    const idsArea = productosFiltroArea.map((p) => p.id);
    query = query.in("producto_id", idsArea.length ? idsArea : ["-"]);
  }

  if (params.producto) query = query.eq("producto_id", params.producto);
  if (params.usuario) query = query.eq("usuario_id", params.usuario);
  if (params.desde) query = query.gte("fecha", params.desde);
  if (params.hasta) query = query.lte("fecha", `${params.hasta}T23:59:59`);

  const { data: movimientos } = await query;

  return (
    <div className="px-4 py-4">
      <h1 className="mb-4 font-display text-2xl font-semibold text-ink">Historial</h1>

      <form method="get" className="mb-4 flex flex-col gap-2 rounded-xl border border-line bg-paper-card p-3">
        {isAdmin && (
          <select
            name="area"
            defaultValue={params.area || ""}
            className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink"
          >
            <option value="">Todas las áreas</option>
            {(areas ?? []).map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre}
              </option>
            ))}
          </select>
        )}

        <select
          name="producto"
          defaultValue={params.producto || ""}
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink"
        >
          <option value="">Todos los productos</option>
          {productosFiltroArea.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>

        <select
          name="usuario"
          defaultValue={params.usuario || ""}
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink"
        >
          <option value="">Todos los usuarios</option>
          {(usuarios ?? []).map((u) => (
            <option key={u.id} value={u.id}>
              {u.nombre}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <input
            type="date"
            name="desde"
            defaultValue={params.desde || ""}
            className="w-1/2 rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink"
          />
          <input
            type="date"
            name="hasta"
            defaultValue={params.hasta || ""}
            className="w-1/2 rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink"
          />
        </div>

        <button
          type="submit"
          className="rounded-lg bg-gold px-3 py-2 text-sm font-semibold text-white active:bg-gold-dark"
        >
          Filtrar
        </button>
      </form>

      <div className="flex flex-col gap-2">
        {((movimientos as unknown as MovimientoConRelaciones[]) ?? []).map((m) => (
          <div key={m.id} className="rounded-xl border border-line bg-paper-card px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="font-medium text-ink">{m.productos?.nombre ?? "Producto eliminado"}</p>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  m.tipo === "entrada"
                    ? "bg-pine/10 text-pine-dark"
                    : m.tipo === "salida"
                      ? "bg-gold/15 text-gold-dark"
                      : "bg-wine/10 text-wine-dark"
                }`}
              >
                {m.tipo}
              </span>
            </div>
            <p className="figures text-sm text-ink-light/60">
              {m.cantidad} · {m.usuarios?.nombre ?? "Usuario eliminado"} ·{" "}
              {new Date(m.fecha).toLocaleString("es")}
            </p>
            {m.nota && <p className="mt-1 text-sm text-ink-light/70">{m.nota}</p>}
          </div>
        ))}
        {((movimientos as unknown as MovimientoConRelaciones[]) ?? []).length === 0 && (
          <p className="py-8 text-center text-sm text-ink-light/40">
            No hay movimientos que coincidan con el filtro.
          </p>
        )}
      </div>
    </div>
  );
}

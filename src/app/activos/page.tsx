import Link from "next/link";
import { requireRol } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

interface ActivoConRelaciones {
  id: string;
  nombre: string;
  estado: string;
  numero_serie: string | null;
  categorias_activos: { nombre: string } | null;
  ubicaciones: { nombre: string } | null;
}

const ESTADO_CLASSES: Record<string, string> = {
  operativo: "bg-pine/10 text-pine-dark",
  mantenimiento: "bg-gold/15 text-gold-dark",
  dañado: "bg-wine/10 text-wine-dark",
  baja: "bg-ink/10 text-ink-light/70",
};

export default async function ActivosPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const params = await searchParams;
  await requireRol(["admin", "mantenimiento"]);
  const supabase = await createClient();

  const [{ data: categorias }, { data: ubicaciones }] = await Promise.all([
    supabase.from("categorias_activos").select("*").order("nombre"),
    supabase.from("ubicaciones").select("*").order("nombre"),
  ]);

  let query = supabase
    .from("activos")
    .select(
      "id, nombre, estado, numero_serie, categorias_activos(nombre), ubicaciones(nombre)"
    )
    .eq("activo", true)
    .order("nombre");

  if (params.categoria) query = query.eq("categoria_id", params.categoria);
  if (params.estado) query = query.eq("estado", params.estado);
  if (params.ubicacion) query = query.eq("ubicacion_id", params.ubicacion);

  const { data: activos } = await query;

  return (
    <div className="px-4 py-4">
      <h1 className="mb-4 font-display text-2xl font-semibold text-ink">Activos fijos</h1>

      <form method="get" className="mb-4 flex flex-col gap-2 rounded-xl border border-line bg-paper-card p-3">
        <select
          name="categoria"
          defaultValue={params.categoria || ""}
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink"
        >
          <option value="">Todas las categorías</option>
          {(categorias ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>

        <select
          name="ubicacion"
          defaultValue={params.ubicacion || ""}
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink"
        >
          <option value="">Todas las ubicaciones</option>
          {(ubicaciones ?? []).map((u) => (
            <option key={u.id} value={u.id}>
              {u.nombre}
            </option>
          ))}
        </select>

        <select
          name="estado"
          defaultValue={params.estado || ""}
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink"
        >
          <option value="">Todos los estados</option>
          <option value="operativo">Operativo</option>
          <option value="mantenimiento">Mantenimiento</option>
          <option value="dañado">Dañado</option>
          <option value="baja">Baja</option>
        </select>

        <button
          type="submit"
          className="rounded-lg bg-gold px-3 py-2 text-sm font-semibold text-white active:bg-gold-dark"
        >
          Filtrar
        </button>
      </form>

      <div className="flex flex-col gap-2">
        {((activos as unknown as ActivoConRelaciones[]) ?? []).map((a) => (
          <Link
            key={a.id}
            href={`/activos/${a.id}`}
            className="flex items-center justify-between rounded-xl border border-line bg-paper-card px-4 py-3"
          >
            <div>
              <p className="font-medium text-ink">{a.nombre}</p>
              <p className="text-xs text-ink-light/60">
                {a.categorias_activos?.nombre ?? "Sin categoría"} ·{" "}
                {a.ubicaciones?.nombre ?? "Sin ubicación"}
              </p>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                ESTADO_CLASSES[a.estado] ?? "bg-ink/10 text-ink-light/70"
              }`}
            >
              {a.estado}
            </span>
          </Link>
        ))}
        {((activos as unknown as ActivoConRelaciones[]) ?? []).length === 0 && (
          <p className="py-8 text-center text-sm text-ink-light/40">
            No hay activos que coincidan con el filtro.
          </p>
        )}
      </div>
    </div>
  );
}

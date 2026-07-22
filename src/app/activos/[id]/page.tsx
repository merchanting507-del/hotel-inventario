import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRol } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import EstadoSelector from "./EstadoSelector";

interface MantenimientoConUsuario {
  id: string;
  tipo: string;
  descripcion: string | null;
  costo: number | null;
  fecha: string;
  proximo_mantenimiento: string | null;
  usuarios: { nombre: string } | null;
}

export default async function ActivoDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireRol(["admin", "mantenimiento"]);
  const supabase = await createClient();

  const { data: activo } = await supabase
    .from("activos")
    .select(
      "*, categorias_activos(nombre), ubicaciones(nombre), proveedores(nombre)"
    )
    .eq("id", id)
    .maybeSingle();

  if (!activo) notFound();

  const { data: mantenimientos } = await supabase
    .from("mantenimientos")
    .select("id, tipo, descripcion, costo, fecha, proximo_mantenimiento, usuarios(nombre)")
    .eq("activo_id", id)
    .order("fecha", { ascending: false });

  return (
    <div className="px-4 py-4">
      <Link href="/activos" className="text-sm text-ink-light/60">
        ← Activos
      </Link>

      <div className="arch-card mt-2 border border-line bg-paper-card p-4">
        <h1 className="font-display text-xl font-semibold text-ink">{activo.nombre}</h1>
        <p className="text-sm text-ink-light/60">
          {(activo as any).categorias_activos?.nombre ?? "Sin categoría"} ·{" "}
          {(activo as any).ubicaciones?.nombre ?? "Sin ubicación"}
        </p>

        <dl className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
          <dt className="text-ink-light/50">Número de serie</dt>
          <dd className="figures text-ink">{activo.numero_serie ?? "—"}</dd>
          <dt className="text-ink-light/50">Proveedor</dt>
          <dd className="text-ink">{(activo as any).proveedores?.nombre ?? "—"}</dd>
          <dt className="text-ink-light/50">Fecha de compra</dt>
          <dd className="figures text-ink">{activo.fecha_compra ?? "—"}</dd>
          <dt className="text-ink-light/50">Costo</dt>
          <dd className="figures text-ink">{activo.costo ?? "—"}</dd>
        </dl>

        <div className="mt-3">
          <p className="eyebrow mb-1">Estado</p>
          <EstadoSelector activoId={activo.id} estadoActual={activo.estado} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-ink">Mantenimientos</h2>
        <Link
          href={`/activos/${id}/mantenimiento`}
          className="rounded-lg bg-gold px-3 py-1.5 text-sm font-semibold text-white active:bg-gold-dark"
        >
          + Registrar
        </Link>
      </div>

      <div className="mt-2 flex flex-col gap-2">
        {((mantenimientos as unknown as MantenimientoConUsuario[]) ?? []).map((m) => (
          <div key={m.id} className="rounded-xl border border-line bg-paper-card px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="font-medium capitalize text-ink">{m.tipo}</p>
              <p className="figures text-xs text-ink-light/50">
                {new Date(m.fecha).toLocaleDateString("es")}
              </p>
            </div>
            {m.descripcion && (
              <p className="mt-1 text-sm text-ink-light/70">{m.descripcion}</p>
            )}
            <p className="figures mt-1 text-xs text-ink-light/50">
              {m.usuarios?.nombre ?? "Usuario eliminado"}
              {m.costo != null && ` · Costo: ${m.costo}`}
              {m.proximo_mantenimiento &&
                ` · Próximo: ${m.proximo_mantenimiento}`}
            </p>
          </div>
        ))}
        {((mantenimientos as unknown as MantenimientoConUsuario[]) ?? []).length === 0 && (
          <p className="py-8 text-center text-sm text-ink-light/40">
            Sin mantenimientos registrados.
          </p>
        )}
      </div>
    </div>
  );
}

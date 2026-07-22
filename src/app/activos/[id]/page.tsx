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
      <Link href="/activos" className="text-sm text-gray-500">
        ← Activos
      </Link>

      <div className="mt-2 rounded-xl border bg-white p-4">
        <h1 className="text-xl font-bold">{activo.nombre}</h1>
        <p className="text-sm text-gray-500">
          {(activo as any).categorias_activos?.nombre ?? "Sin categoría"} ·{" "}
          {(activo as any).ubicaciones?.nombre ?? "Sin ubicación"}
        </p>

        <dl className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
          <dt className="text-gray-500">Número de serie</dt>
          <dd>{activo.numero_serie ?? "—"}</dd>
          <dt className="text-gray-500">Proveedor</dt>
          <dd>{(activo as any).proveedores?.nombre ?? "—"}</dd>
          <dt className="text-gray-500">Fecha de compra</dt>
          <dd>{activo.fecha_compra ?? "—"}</dd>
          <dt className="text-gray-500">Costo</dt>
          <dd>{activo.costo ?? "—"}</dd>
        </dl>

        <div className="mt-3">
          <p className="mb-1 text-sm font-medium text-gray-600">Estado</p>
          <EstadoSelector activoId={activo.id} estadoActual={activo.estado} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Mantenimientos</h2>
        <Link
          href={`/activos/${id}/mantenimiento`}
          className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white"
        >
          + Registrar
        </Link>
      </div>

      <div className="mt-2 flex flex-col gap-2">
        {((mantenimientos as unknown as MantenimientoConUsuario[]) ?? []).map((m) => (
          <div key={m.id} className="rounded-xl border bg-white px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="font-medium capitalize">{m.tipo}</p>
              <p className="text-xs text-gray-500">
                {new Date(m.fecha).toLocaleDateString("es")}
              </p>
            </div>
            {m.descripcion && (
              <p className="mt-1 text-sm text-gray-600">{m.descripcion}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {m.usuarios?.nombre ?? "Usuario eliminado"}
              {m.costo != null && ` · Costo: ${m.costo}`}
              {m.proximo_mantenimiento &&
                ` · Próximo: ${m.proximo_mantenimiento}`}
            </p>
          </div>
        ))}
        {((mantenimientos as unknown as MantenimientoConUsuario[]) ?? []).length === 0 && (
          <p className="py-8 text-center text-sm text-gray-400">
            Sin mantenimientos registrados.
          </p>
        )}
      </div>
    </div>
  );
}

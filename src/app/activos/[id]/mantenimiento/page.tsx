import { notFound } from "next/navigation";
import { requireRol } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import MantenimientoForm from "./MantenimientoForm";

export default async function NuevoMantenimientoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await requireRol(["admin", "mantenimiento"]);
  const supabase = await createClient();

  const { data: activo } = await supabase
    .from("activos")
    .select("id, nombre")
    .eq("id", id)
    .maybeSingle();

  if (!activo) notFound();

  return (
    <div className="px-4 py-4">
      <h1 className="mb-1 text-xl font-bold">Registrar mantenimiento</h1>
      <p className="mb-4 text-sm text-gray-500">{activo.nombre}</p>
      <MantenimientoForm activoId={activo.id} />
    </div>
  );
}

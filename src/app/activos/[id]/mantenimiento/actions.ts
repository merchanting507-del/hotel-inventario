"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRol } from "@/lib/auth";

export interface MantenimientoInput {
  tipo: string;
  descripcion: string | null;
  costo: number | null;
  proximo_mantenimiento: string | null;
}

export async function registrarMantenimiento(
  activoId: string,
  input: MantenimientoInput
) {
  const usuario = await requireRol(["admin", "mantenimiento"]);
  const supabase = await createClient();

  const { error } = await supabase.from("mantenimientos").insert({
    activo_id: activoId,
    usuario_id: usuario.id,
    tipo: input.tipo,
    descripcion: input.descripcion,
    costo: input.costo,
    proximo_mantenimiento: input.proximo_mantenimiento,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath(`/activos/${activoId}`);
  redirect(`/activos/${activoId}`);
}

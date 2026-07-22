"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRol } from "@/lib/auth";
import type { EstadoActivo } from "@/types/database.types";

export async function actualizarEstadoActivo(id: string, estado: EstadoActivo) {
  await requireRol(["admin", "mantenimiento"]);
  const supabase = await createClient();
  const { error } = await supabase.from("activos").update({ estado }).eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath(`/activos/${id}`);
  revalidatePath("/activos");
  return { success: true };
}

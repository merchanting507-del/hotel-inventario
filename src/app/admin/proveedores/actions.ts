"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRol } from "@/lib/auth";

export interface ProveedorInput {
  nombre: string;
  contacto: string | null;
  whatsapp: string | null;
}

export async function crearProveedor(input: ProveedorInput) {
  await requireRol(["admin", "compras"]);
  const supabase = await createClient();
  const { error } = await supabase.from("proveedores").insert(input);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/proveedores");
  return { success: true };
}

export async function actualizarProveedor(id: string, input: ProveedorInput) {
  await requireRol(["admin", "compras"]);
  const supabase = await createClient();
  const { error } = await supabase.from("proveedores").update(input).eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/proveedores");
  return { success: true };
}

export async function eliminarProveedor(id: string) {
  await requireRol(["admin", "compras"]);
  const supabase = await createClient();
  const { error } = await supabase.from("proveedores").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/proveedores");
  return { success: true };
}

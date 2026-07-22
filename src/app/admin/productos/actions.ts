"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRol } from "@/lib/auth";

export interface ProductoInput {
  nombre: string;
  categoria_id: string | null;
  unidad_medida: string;
  stock_actual: number;
  stock_minimo: number;
  dias_reposicion: number;
  consumo_promedio_diario: number;
  costo_unitario: number | null;
  proveedor_id: string | null;
  activo: boolean;
}

export async function crearProducto(input: ProductoInput) {
  await requireRol(["admin", "compras"]);
  const supabase = await createClient();
  const { error } = await supabase.from("productos").insert(input);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/productos");
  return { success: true };
}

export async function actualizarProducto(id: string, input: ProductoInput) {
  await requireRol(["admin", "compras"]);
  const supabase = await createClient();
  const { error } = await supabase.from("productos").update(input).eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/productos");
  return { success: true };
}

export async function eliminarProducto(id: string) {
  await requireRol(["admin", "compras"]);
  const supabase = await createClient();
  const { error } = await supabase.from("productos").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/productos");
  return { success: true };
}

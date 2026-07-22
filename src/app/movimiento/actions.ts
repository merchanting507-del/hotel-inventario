"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUsuario } from "@/lib/auth";
import type { TipoMovimiento } from "@/types/database.types";

export interface RegistrarMovimientoResult {
  success: boolean;
  nuevoStock?: number;
  error?: string;
}

export async function registrarMovimiento(
  productoId: string,
  tipo: TipoMovimiento,
  cantidad: number,
  nota?: string
): Promise<RegistrarMovimientoResult> {
  if (!productoId) return { success: false, error: "Selecciona un producto." };
  if (!cantidad || cantidad <= 0) {
    return { success: false, error: "La cantidad debe ser mayor a cero." };
  }

  const usuario = await requireUsuario();
  const supabase = await createClient();

  const { data: producto, error: productoError } = await supabase
    .from("productos")
    .select("id, stock_actual")
    .eq("id", productoId)
    .single();

  if (productoError || !producto) {
    return { success: false, error: "Producto no encontrado." };
  }

  const delta = tipo === "entrada" ? cantidad : -cantidad;
  const nuevoStock = Number(producto.stock_actual) + delta;

  const { error: movError } = await supabase.from("movimientos").insert({
    producto_id: productoId,
    usuario_id: usuario.id,
    tipo,
    cantidad,
    nota: nota || null,
  });

  if (movError) {
    return { success: false, error: "No se pudo registrar el movimiento." };
  }

  const { error: stockError } = await supabase
    .from("productos")
    .update({ stock_actual: nuevoStock })
    .eq("id", productoId);

  if (stockError) {
    return { success: false, error: "Movimiento guardado, pero no se pudo actualizar el stock." };
  }

  revalidatePath("/movimiento");
  revalidatePath("/stock");
  revalidatePath("/historial");

  return { success: true, nuevoStock };
}

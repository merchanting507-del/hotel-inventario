"use server";

import { revalidatePath } from "next/cache";
import { requireRol } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export interface TransferirResult {
  success: boolean;
  error?: string;
  nuevoStockBodega?: number;
  nuevoStockArea?: number;
}

export async function transferirACocina(
  productoId: string,
  cantidad: number
): Promise<TransferirResult> {
  if (!cantidad || cantidad <= 0) {
    return { success: false, error: "La cantidad debe ser mayor a cero." };
  }

  const usuario = await requireRol(["admin", "compras"]);
  const supabase = await createClient();

  const { data: area } = await supabase
    .from("areas")
    .select("id")
    .eq("nombre", "Cocina")
    .maybeSingle();

  if (!area) {
    return { success: false, error: "No se encontró el área de Cocina." };
  }

  const { data: producto, error: productoError } = await supabase
    .from("productos")
    .select("id, nombre, stock_actual")
    .eq("id", productoId)
    .single();

  if (productoError || !producto) {
    return { success: false, error: "Producto no encontrado." };
  }

  const nuevoStockBodega = Number(producto.stock_actual) - cantidad;

  const { data: filaExistente } = await supabase
    .from("stock_area")
    .select("id, cantidad")
    .eq("area_id", area.id)
    .eq("producto_id", productoId)
    .maybeSingle();

  const nuevoStockArea = Number(filaExistente?.cantidad ?? 0) + cantidad;

  const { error: movError } = await supabase.from("movimientos").insert({
    producto_id: productoId,
    usuario_id: usuario.id,
    tipo: "transferencia",
    cantidad,
    area_id: area.id,
    nota: `Transferencia de bodega a Cocina: ${producto.nombre}`,
  });
  if (movError) return { success: false, error: "No se pudo registrar la transferencia." };

  const { error: bodegaError } = await supabase
    .from("productos")
    .update({ stock_actual: nuevoStockBodega })
    .eq("id", productoId);
  if (bodegaError) {
    return { success: false, error: "No se pudo actualizar el stock de bodega." };
  }

  const { error: areaError } = filaExistente
    ? await supabase
        .from("stock_area")
        .update({ cantidad: nuevoStockArea })
        .eq("id", filaExistente.id)
    : await supabase
        .from("stock_area")
        .insert({ area_id: area.id, producto_id: productoId, cantidad: nuevoStockArea });
  if (areaError) {
    return { success: false, error: "No se pudo actualizar el stock de Cocina." };
  }

  revalidatePath("/admin/transferencias");
  revalidatePath("/stock");
  revalidatePath("/movimiento");
  revalidatePath("/historial");

  return { success: true, nuevoStockBodega, nuevoStockArea };
}

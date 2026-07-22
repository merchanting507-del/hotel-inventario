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
  nota?: string,
  // areaId explícito: lo usa admin/compras cuando prueban/registran en
  // nombre de Cocina desde el selector "Bodega/Cocina" de la pantalla.
  areaIdParam?: string
): Promise<RegistrarMovimientoResult> {
  if (!productoId) return { success: false, error: "Selecciona un producto." };
  if (!cantidad || cantidad <= 0) {
    return { success: false, error: "La cantidad debe ser mayor a cero." };
  }

  const usuario = await requireUsuario();
  const supabase = await createClient();
  const delta = tipo === "entrada" ? cantidad : -cantidad;

  // Un usuario cocina siempre usa su propia área, sin importar lo que
  // llegue del cliente; admin/compras usan la que eligieron en el toggle.
  const areaId = usuario.rol === "cocina" ? usuario.area_id : areaIdParam;

  // Cocina (o admin/compras probando "como Cocina") tiene su propio
  // inventario local (stock_area), separado del stock de bodega: estos
  // movimientos no tocan productos.stock_actual.
  if (areaId) {
    const { data: fila } = await supabase
      .from("stock_area")
      .select("id, cantidad")
      .eq("area_id", areaId)
      .eq("producto_id", productoId)
      .maybeSingle();

    const nuevoStock = Number(fila?.cantidad ?? 0) + delta;

    const { error: movError } = await supabase.from("movimientos").insert({
      producto_id: productoId,
      usuario_id: usuario.id,
      tipo,
      cantidad,
      area_id: areaId,
      nota: nota || null,
    });
    if (movError) return { success: false, error: "No se pudo registrar el movimiento." };

    const { error: stockError } = fila
      ? await supabase.from("stock_area").update({ cantidad: nuevoStock }).eq("id", fila.id)
      : await supabase
          .from("stock_area")
          .insert({ area_id: areaId, producto_id: productoId, cantidad: nuevoStock });
    if (stockError) {
      return { success: false, error: "Movimiento guardado, pero no se pudo actualizar el stock." };
    }

    revalidatePath("/movimiento");
    revalidatePath("/stock");
    revalidatePath("/historial");
    return { success: true, nuevoStock };
  }

  const { data: producto, error: productoError } = await supabase
    .from("productos")
    .select("id, stock_actual")
    .eq("id", productoId)
    .single();

  if (productoError || !producto) {
    return { success: false, error: "Producto no encontrado." };
  }

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

"use server";

import { revalidatePath } from "next/cache";
import { requireRol, requireUsuario } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export interface RecetaItemInput {
  producto_id: string;
  cantidad: number;
}

export interface PlatilloInput {
  nombre: string;
  items: RecetaItemInput[];
}

interface GuardarResult {
  success: boolean;
  error?: string;
}

export async function guardarPlatillo(
  id: string | null,
  input: PlatilloInput
): Promise<GuardarResult> {
  await requireRol(["admin"]);

  if (!input.nombre.trim()) return { success: false, error: "El nombre es obligatorio." };
  if (input.items.length === 0) {
    return { success: false, error: "Agrega al menos un ingrediente." };
  }

  const supabase = await createClient();

  let platilloId = id;

  if (platilloId) {
    const { data: actualizado, error } = await supabase
      .from("platillos")
      .update({ nombre: input.nombre })
      .eq("id", platilloId)
      .select("id")
      .maybeSingle();
    if (error) return { success: false, error: error.message };
    if (!actualizado) {
      return {
        success: false,
        error:
          "Este platillo ya no existe — puede que otro admin lo haya eliminado. Actualiza la página.",
      };
    }

    const { error: deleteError } = await supabase
      .from("receta_items")
      .delete()
      .eq("platillo_id", platilloId);
    if (deleteError) return { success: false, error: deleteError.message };
  } else {
    const { data, error } = await supabase
      .from("platillos")
      .insert({ nombre: input.nombre })
      .select("id")
      .single();
    if (error || !data) return { success: false, error: error?.message ?? "No se pudo crear." };
    platilloId = data.id;
  }

  const { error: itemsError } = await supabase.from("receta_items").insert(
    input.items.map((item) => ({
      platillo_id: platilloId,
      producto_id: item.producto_id,
      cantidad: item.cantidad,
    }))
  );
  if (itemsError) return { success: false, error: itemsError.message };

  revalidatePath("/admin/platillos");
  return { success: true };
}

export async function eliminarPlatillo(id: string): Promise<GuardarResult> {
  await requireRol(["admin"]);
  const supabase = await createClient();
  const { error } = await supabase.from("platillos").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/platillos");
  return { success: true };
}

export interface VenderResult {
  success: boolean;
  error?: string;
  detalle?: { producto: string; descontado: number; nuevoStock: number }[];
}

export async function venderPlatillo(
  platilloId: string,
  cantidadVendida: number
): Promise<VenderResult> {
  if (!cantidadVendida || cantidadVendida <= 0) {
    return { success: false, error: "La cantidad debe ser mayor a cero." };
  }

  const usuario = await requireUsuario();
  const supabase = await createClient();

  // Los platillos se preparan en Cocina: los ingredientes se descuentan de
  // su inventario local (stock_area), no del stock de bodega.
  const { data: area } = await supabase
    .from("areas")
    .select("id")
    .eq("nombre", "Cocina")
    .maybeSingle();

  if (!area) {
    return { success: false, error: "No se encontró el área de Cocina." };
  }

  const { data: platillo } = await supabase
    .from("platillos")
    .select("nombre")
    .eq("id", platilloId)
    .single();

  const { data: items, error: itemsError } = await supabase
    .from("receta_items")
    .select("cantidad, productos(id, nombre, unidad_medida)")
    .eq("platillo_id", platilloId);

  if (itemsError || !items || items.length === 0) {
    return { success: false, error: "Este platillo no tiene ingredientes configurados." };
  }

  const nota = `Venta: ${platillo?.nombre ?? "platillo"} x${cantidadVendida}`;
  const detalle: VenderResult["detalle"] = [];

  type ItemConProducto = {
    cantidad: number;
    productos: { id: string; nombre: string; unidad_medida: string } | null;
  };

  for (const item of items as unknown as ItemConProducto[]) {
    const producto = item.productos;
    if (!producto) continue;

    const descontado = item.cantidad * cantidadVendida;

    const { data: filaExistente } = await supabase
      .from("stock_area")
      .select("id, cantidad")
      .eq("area_id", area.id)
      .eq("producto_id", producto.id)
      .maybeSingle();

    const nuevoStock = Number(filaExistente?.cantidad ?? 0) - descontado;

    const { error: movError } = await supabase.from("movimientos").insert({
      producto_id: producto.id,
      usuario_id: usuario.id,
      tipo: "salida",
      cantidad: descontado,
      area_id: area.id,
      nota,
    });
    if (movError) return { success: false, error: `No se pudo registrar ${producto.nombre}.` };

    const { error: stockError } = filaExistente
      ? await supabase
          .from("stock_area")
          .update({ cantidad: nuevoStock })
          .eq("id", filaExistente.id)
      : await supabase
          .from("stock_area")
          .insert({ area_id: area.id, producto_id: producto.id, cantidad: nuevoStock });
    if (stockError) {
      return { success: false, error: `No se pudo actualizar el stock de ${producto.nombre}.` };
    }

    detalle.push({ producto: producto.nombre, descontado, nuevoStock });
  }

  revalidatePath("/admin/platillos");
  revalidatePath("/stock");
  revalidatePath("/historial");
  revalidatePath("/movimiento");

  return { success: true, detalle };
}

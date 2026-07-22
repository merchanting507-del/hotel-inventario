import { requireRol } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import ProductosAdmin from "./ProductosAdmin";

export default async function AdminProductosPage() {
  await requireRol(["admin", "compras"]);
  const supabase = await createClient();

  const [{ data: productos }, { data: categorias }, { data: proveedores }] =
    await Promise.all([
      supabase.from("productos").select("*").order("nombre"),
      supabase.from("categorias").select("*").order("nombre"),
      supabase.from("proveedores").select("*").order("nombre"),
    ]);

  return (
    <div className="px-4 py-4">
      <h1 className="mb-4 font-display text-2xl font-semibold text-ink">Productos</h1>
      <ProductosAdmin
        productosIniciales={productos ?? []}
        categorias={categorias ?? []}
        proveedores={proveedores ?? []}
      />
    </div>
  );
}

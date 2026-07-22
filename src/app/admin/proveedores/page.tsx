import { requireRol } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import ProveedoresAdmin from "./ProveedoresAdmin";

export default async function AdminProveedoresPage() {
  await requireRol(["admin", "compras"]);
  const supabase = await createClient();
  const { data: proveedores } = await supabase
    .from("proveedores")
    .select("*")
    .order("nombre");

  return (
    <div className="px-4 py-4">
      <h1 className="mb-4 font-display text-2xl font-semibold text-ink">Proveedores</h1>
      <ProveedoresAdmin proveedoresIniciales={proveedores ?? []} />
    </div>
  );
}

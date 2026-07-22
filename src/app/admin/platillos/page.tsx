import { requireRol } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import PlatillosAdmin from "./PlatillosAdmin";

export default async function AdminPlatillosPage() {
  await requireRol(["admin"]);
  const supabase = await createClient();

  const [{ data: platillos }, { data: productos }, { data: items }] = await Promise.all([
    supabase.from("platillos").select("*").order("nombre"),
    supabase.from("productos").select("*").eq("activo", true).order("nombre"),
    supabase.from("receta_items").select("*"),
  ]);

  return (
    <div className="px-4 py-4">
      <h1 className="mb-4 font-display text-2xl font-semibold text-ink">Platillos</h1>
      <PlatillosAdmin
        platillosIniciales={platillos ?? []}
        productos={productos ?? []}
        itemsIniciales={items ?? []}
      />
    </div>
  );
}

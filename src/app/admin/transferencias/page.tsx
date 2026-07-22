import { requireRol } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import TransferenciasAdmin from "./TransferenciasAdmin";

export default async function AdminTransferenciasPage() {
  await requireRol(["admin", "compras"]);
  const supabase = await createClient();

  const { data: area } = await supabase
    .from("areas")
    .select("id")
    .eq("nombre", "Cocina")
    .maybeSingle();

  const [{ data: productos }, { data: stockCocina }] = await Promise.all([
    supabase.from("productos").select("*").eq("activo", true).order("nombre"),
    area
      ? supabase.from("stock_area").select("*").eq("area_id", area.id)
      : Promise.resolve({ data: [] }),
  ]);

  return (
    <div className="px-4 py-4">
      <h1 className="mb-1 font-display text-2xl font-semibold text-ink">
        Transferir a Cocina
      </h1>
      <p className="mb-4 text-sm text-ink-light/60">
        Resta de bodega y arma el inventario propio de Cocina.
      </p>
      <TransferenciasAdmin
        productos={productos ?? []}
        stockCocinaInicial={stockCocina ?? []}
      />
    </div>
  );
}

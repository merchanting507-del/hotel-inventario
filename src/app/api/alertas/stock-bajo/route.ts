import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/alertas/stock-bajo
// Devuelve el contenido de la vista `stock_bajo` en JSON, para que n8n lo
// consuma vía un HTTP Request node y dispare las alertas por correo.
//
// Usa la service role key (bypass RLS) porque n8n llama a este endpoint
// server-to-server, sin sesión de usuario de Supabase Auth.
// TODO: este endpoint no tiene autenticación propia; si queda expuesto a
// internet sin restricción de red, agregar un shared secret (header) antes
// de ir a producción.
export async function GET() {
  const supabase = createAdminClient();

  const { data, error } = await supabase.from("stock_bajo").select("*");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

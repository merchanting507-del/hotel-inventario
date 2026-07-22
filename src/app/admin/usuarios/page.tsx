import { requireRol } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import UsuariosAdmin from "./UsuariosAdmin";

export default async function AdminUsuariosPage() {
  await requireRol(["admin"]);
  const supabase = await createClient();

  const [{ data: usuarios }, { data: areas }] = await Promise.all([
    supabase.from("usuarios").select("*").order("nombre"),
    supabase.from("areas").select("*").order("nombre"),
  ]);

  // El correo real vive en Supabase Auth, no en la tabla `usuarios`.
  const admin = createAdminClient();
  const { data: authList } = await admin.auth.admin.listUsers({ perPage: 200 });
  const emailPorAuthId = new Map(
    (authList?.users ?? []).map((u) => [u.id, u.email ?? ""])
  );

  const usuariosConEmail = (usuarios ?? []).map((u) => ({
    ...u,
    email: u.auth_user_id ? emailPorAuthId.get(u.auth_user_id) ?? null : null,
  }));

  return (
    <div className="px-4 py-4">
      <h1 className="mb-4 font-display text-2xl font-semibold text-ink">Usuarios</h1>
      <UsuariosAdmin usuariosIniciales={usuariosConEmail} areas={areas ?? []} />
    </div>
  );
}

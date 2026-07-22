import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Rol, Usuario } from "@/types/database.types";

/**
 * Devuelve el usuario autenticado (fila de `usuarios`, enlazada por auth_user_id)
 * o null si no hay sesión o el auth_user_id no está enlazado a ningún usuario.
 *
 * Memoizado con `cache()`: el layout raíz y cada página llaman esto por su
 * cuenta, y sin memoizar cada uno dispara su propio round-trip a Supabase
 * Auth. En frío (primera carga en un dispositivo) una de esas llamadas
 * podía fallar/tardar mientras la otra sí resolvía, dejando la barra de
 * navegación en blanco aunque la página sí cargara datos. Con `cache()`
 * ambos comparten el mismo resultado dentro del mismo request.
 */
export const getCurrentUsuario = cache(async (): Promise<Usuario | null> => {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  return usuario ?? null;
});

/**
 * Para usar en Server Components/páginas: exige sesión + usuario enlazado,
 * redirige a /login si no hay sesión.
 */
export async function requireUsuario(): Promise<Usuario> {
  const usuario = await getCurrentUsuario();
  if (!usuario) {
    redirect("/login");
  }
  return usuario;
}

/**
 * Exige que el usuario autenticado tenga uno de los roles permitidos.
 * Redirige a "/" si no tiene el rol adecuado. Debe usarse en el servidor
 * (página o layout), no solo ocultando enlaces en el cliente.
 */
export async function requireRol(rolesPermitidos: Rol[]): Promise<Usuario> {
  const usuario = await requireUsuario();
  if (!rolesPermitidos.includes(usuario.rol)) {
    redirect("/");
  }
  return usuario;
}

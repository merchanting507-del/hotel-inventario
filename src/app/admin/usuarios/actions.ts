"use server";

import { revalidatePath } from "next/cache";
import { requireRol } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Rol } from "@/types/database.types";

export interface InvitarResult {
  success: boolean;
  error?: string;
  code?: string;
  email?: string;
}

async function generarCodigo(email: string) {
  const admin = createAdminClient();

  const invite = await admin.auth.admin.generateLink({
    type: "invite",
    email,
  });

  if (!invite.error && invite.data.user) {
    return invite;
  }

  // Si el correo ya tiene una cuenta, generamos un código de recuperación
  // en su lugar (mismo mecanismo, sirve para reactivar acceso).
  return admin.auth.admin.generateLink({ type: "recovery", email });
}

// Crea una fila nueva en `usuarios` y la invita en un solo paso.
export async function crearYInvitarUsuario(input: {
  nombre: string;
  rol: Rol;
  area_id: string | null;
  email: string;
}): Promise<InvitarResult> {
  await requireRol(["admin"]);

  const { data, error } = await generarCodigo(input.email);
  if (error || !data.user) {
    return { success: false, error: error?.message ?? "No se pudo invitar." };
  }

  const supabase = await createClient();
  const { error: insertError } = await supabase.from("usuarios").insert({
    nombre: input.nombre,
    rol: input.rol,
    area_id: input.area_id,
    auth_user_id: data.user.id,
  });

  if (insertError) {
    return { success: false, error: "Invitado, pero no se pudo crear su usuario interno." };
  }

  revalidatePath("/admin/usuarios");
  return { success: true, code: data.properties?.email_otp, email: input.email };
}

// Enlaza una fila de `usuarios` ya existente (ej. los "Usuario Cocina" de ejemplo)
// con una invitación real por correo.
export async function invitarUsuarioExistente(
  usuarioId: string,
  email: string
): Promise<InvitarResult> {
  await requireRol(["admin"]);

  const { data, error } = await generarCodigo(email);
  if (error || !data.user) {
    return { success: false, error: error?.message ?? "No se pudo invitar." };
  }

  const supabase = await createClient();
  const { error: updateError } = await supabase
    .from("usuarios")
    .update({ auth_user_id: data.user.id })
    .eq("id", usuarioId);

  if (updateError) {
    return { success: false, error: "No se pudo enlazar el usuario." };
  }

  revalidatePath("/admin/usuarios");
  return { success: true, code: data.properties?.email_otp, email };
}

// Genera un código nuevo para alguien que ya tiene cuenta (ej. olvidó su contraseña).
export async function reenviarCodigo(email: string): Promise<InvitarResult> {
  await requireRol(["admin"]);

  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
  });

  if (error || !data.user) {
    return { success: false, error: error?.message ?? "No se pudo generar el código." };
  }

  return { success: true, code: data.properties?.email_otp, email };
}

export async function eliminarUsuario(usuarioId: string) {
  await requireRol(["admin"]);
  const supabase = await createClient();
  const { error } = await supabase.from("usuarios").delete().eq("id", usuarioId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/usuarios");
  return { success: true };
}

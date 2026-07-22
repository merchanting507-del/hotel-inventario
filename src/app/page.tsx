import { redirect } from "next/navigation";
import { requireUsuario } from "@/lib/auth";

const HOME_BY_ROL: Record<string, string> = {
  admin: "/admin/productos",
  compras: "/admin/productos",
  mantenimiento: "/activos",
};

export default async function HomePage() {
  const usuario = await requireUsuario();
  redirect(HOME_BY_ROL[usuario.rol] ?? "/movimiento");
}

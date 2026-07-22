import Link from "next/link";
import type { Usuario } from "@/types/database.types";
import LogoutButton from "@/components/LogoutButton";

const LINKS: { href: string; label: string; roles?: string[] }[] = [
  { href: "/movimiento", label: "Movimiento" },
  { href: "/stock", label: "Stock" },
  { href: "/historial", label: "Historial" },
  { href: "/activos", label: "Activos", roles: ["admin", "mantenimiento"] },
  { href: "/admin/productos", label: "Productos", roles: ["admin"] },
  { href: "/admin/proveedores", label: "Proveedores", roles: ["admin"] },
];

export default function NavBar({ usuario }: { usuario: Usuario }) {
  const links = LINKS.filter((l) => !l.roles || l.roles.includes(usuario.rol));

  return (
    <header className="sticky top-0 z-10 border-b bg-white">
      <div className="flex items-center justify-between gap-2 overflow-x-auto px-3 py-2">
        <nav className="flex items-center gap-1 overflow-x-auto">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2 whitespace-nowrap pl-2">
          <span className="text-xs text-gray-500">{usuario.nombre}</span>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}

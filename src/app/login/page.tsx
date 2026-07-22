"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

const HOME_BY_ROL: Record<string, string> = {
  admin: "/admin/productos",
  compras: "/admin/productos",
  mantenimiento: "/activos",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !data.user) {
      setError("Correo o contraseña incorrectos.");
      setLoading(false);
      return;
    }

    const { data: usuario } = await supabase
      .from("usuarios")
      .select("rol")
      .eq("auth_user_id", data.user.id)
      .maybeSingle();

    router.refresh();
    router.push(usuario ? HOME_BY_ROL[usuario.rol] ?? "/movimiento" : "/movimiento");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Image
            src="/brand/marvella-logo.png"
            alt="The Marvella Club"
            width={160}
            height={160}
            priority
            className="mx-auto"
          />
          <h1 className="mt-2 font-display text-3xl font-semibold text-ink">
            Inventario
          </h1>
          <div className="gold-rule mx-auto mt-4 w-24" />
          <p className="mt-4 text-sm text-ink-light/70">
            Inicia sesión para registrar movimientos
          </p>
        </div>

        <div className="arch-card border border-line bg-paper-card px-6 py-8 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink">
                Correo
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-line bg-white px-4 py-3 text-base text-ink focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-ink">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-line bg-white px-4 py-3 text-base text-ink focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>

            {error && <p className="text-sm text-wine">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn-touch mt-2 rounded-lg bg-gold px-4 py-3 text-base font-semibold text-white transition-colors active:bg-gold-dark disabled:opacity-50"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

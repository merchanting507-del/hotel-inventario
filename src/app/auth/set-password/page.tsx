"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function SetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    // El enlace de invitación/recuperación deja la sesión en el hash de la URL;
    // el cliente de Supabase la procesa solo al inicializarse (detectSessionInUrl).
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setReady(true);
      } else {
        setError("El enlace no es válido o ya expiró. Pide que te reenvíen la invitación.");
      }
    });
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError("No se pudo guardar la contraseña. Intenta de nuevo.");
      setLoading(false);
      return;
    }

    router.refresh();
    router.push("/");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Image
            src="/brand/marvella-logo.png"
            alt="The Marvella Club"
            width={120}
            height={120}
            className="mx-auto"
          />
          <h1 className="mt-2 font-display text-2xl font-semibold text-ink">
            Crea tu contraseña
          </h1>
          <div className="gold-rule mx-auto mt-4 w-24" />
          <p className="mt-4 text-sm text-ink-light/70">
            Actívala para entrar al inventario
          </p>
        </div>

        <div className="arch-card border border-line bg-paper-card px-6 py-8 shadow-sm">
          {ready ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label htmlFor="password" className="mb-1 block text-sm font-medium text-ink">
                  Nueva contraseña
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-line bg-white px-4 py-3 text-base text-ink focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                />
              </div>

              <div>
                <label htmlFor="confirm" className="mb-1 block text-sm font-medium text-ink">
                  Confirmar contraseña
                </label>
                <input
                  id="confirm"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full rounded-lg border border-line bg-white px-4 py-3 text-base text-ink focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
                />
              </div>

              {error && <p className="text-sm text-wine">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="btn-touch mt-2 rounded-lg bg-gold px-4 py-3 text-base font-semibold text-white transition-colors active:bg-gold-dark disabled:opacity-50"
              >
                {loading ? "Guardando..." : "Guardar y entrar"}
              </button>
            </form>
          ) : (
            <p className="text-center text-sm text-wine">
              {error ?? "Verificando enlace..."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

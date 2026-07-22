"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function VerifyCodePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: "recovery",
    });

    if (verifyError) {
      setError("Código incorrecto o expirado. Pide que te generen uno nuevo.");
      setLoading(false);
      return;
    }

    router.push("/auth/set-password");
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
            Verificar código
          </h1>
          <div className="gold-rule mx-auto mt-4 w-24" />
          <p className="mt-4 text-sm text-ink-light/70">
            Ingresa el código de un solo uso que te dieron
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
              <label htmlFor="code" className="mb-1 block text-sm font-medium text-ink">
                Código
              </label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="figures w-full rounded-lg border border-line bg-white px-4 py-3 text-center text-xl tracking-widest text-ink focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
              />
            </div>

            {error && <p className="text-sm text-wine">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn-touch mt-2 rounded-lg bg-gold px-4 py-3 text-base font-semibold text-white transition-colors active:bg-gold-dark disabled:opacity-50"
            >
              {loading ? "Verificando..." : "Verificar"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

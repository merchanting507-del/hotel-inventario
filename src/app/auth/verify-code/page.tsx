"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
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
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-center text-2xl font-bold text-gray-900">
          Hotel Inventario
        </h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          Ingresa el código de 6 dígitos que te dieron
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Correo
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="code" className="mb-1 block text-sm font-medium">
              Código
            </label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-xl tracking-widest focus:border-brand-500 focus:outline-none"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-touch mt-2 rounded-lg bg-brand-600 px-4 py-3 text-base font-semibold text-white active:bg-brand-700 disabled:opacity-50"
          >
            {loading ? "Verificando..." : "Verificar"}
          </button>
        </form>
      </div>
    </div>
  );
}

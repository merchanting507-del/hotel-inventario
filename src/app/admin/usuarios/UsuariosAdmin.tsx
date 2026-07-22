"use client";

import { useState, useTransition } from "react";
import type { Area, Rol, Usuario } from "@/types/database.types";
import {
  crearYInvitarUsuario,
  invitarUsuarioExistente,
  reenviarCodigo,
  eliminarUsuario,
} from "./actions";

type UsuarioConEmail = Usuario & { email: string | null };

const ROLES: { value: Rol; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "compras", label: "Compras" },
  { value: "cocina", label: "Cocina" },
  { value: "bar", label: "Bar" },
  { value: "limpieza", label: "Limpieza" },
  { value: "housekeeping", label: "Housekeeping" },
  { value: "mantenimiento", label: "Mantenimiento" },
  { value: "oficina", label: "Oficina" },
  { value: "piscina_jardin", label: "Piscina y Jardín" },
];

function CodigoBanner({
  code,
  email,
  onClose,
}: {
  code: string;
  email: string;
  onClose: () => void;
}) {
  const [copiado, setCopiado] = useState(false);

  return (
    <div className="arch-card border border-gold bg-gold-light/40 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="eyebrow">Código para {email}</p>
          <p className="figures mt-1 text-3xl font-semibold tracking-widest text-ink">
            {code}
          </p>
        </div>
        <button onClick={onClose} className="text-sm text-ink-light/50">
          ✕
        </button>
      </div>
      <p className="mt-2 text-sm text-ink-light/70">
        Compárteselo directamente (WhatsApp, en persona) — no le pidas que revise su
        correo, el enlace del email puede invalidarse solo. Debe entrar a{" "}
        <span className="font-medium text-ink">/auth/verify-code</span> con su correo y
        este código, y ahí crea su propia contraseña.
      </p>
      <button
        onClick={() => {
          navigator.clipboard.writeText(code);
          setCopiado(true);
        }}
        className="btn-touch mt-3 rounded-lg bg-gold px-4 text-sm font-semibold text-white active:bg-gold-dark"
      >
        {copiado ? "Copiado ✓" : "Copiar código"}
      </button>
    </div>
  );
}

export default function UsuariosAdmin({
  usuariosIniciales,
  areas,
}: {
  usuariosIniciales: UsuarioConEmail[];
  areas: Area[];
}) {
  const [usuarios, setUsuarios] = useState(usuariosIniciales);
  const [resultado, setResultado] = useState<{ code: string; email: string } | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [emailPorInvitar, setEmailPorInvitar] = useState<Record<string, string>>({});

  const [nuevo, setNuevo] = useState({
    nombre: "",
    rol: "cocina" as Rol,
    area_id: "" as string,
    email: "",
  });

  function invitarExistente(usuarioId: string) {
    const email = emailPorInvitar[usuarioId]?.trim();
    if (!email) return;
    setError(null);
    startTransition(async () => {
      const result = await invitarUsuarioExistente(usuarioId, email);
      if (!result.success) {
        setError(result.error ?? "Error al invitar.");
        return;
      }
      setUsuarios((prev) =>
        prev.map((u) => (u.id === usuarioId ? { ...u, email } : u))
      );
      setResultado({ code: result.code!, email: result.email! });
    });
  }

  function reenviar(email: string) {
    setError(null);
    startTransition(async () => {
      const result = await reenviarCodigo(email);
      if (!result.success) {
        setError(result.error ?? "Error al generar el código.");
        return;
      }
      setResultado({ code: result.code!, email: result.email! });
    });
  }

  function eliminar(usuarioId: string) {
    if (!confirm("¿Eliminar este usuario?")) return;
    startTransition(async () => {
      const result = await eliminarUsuario(usuarioId);
      if (result.success) {
        setUsuarios((prev) => prev.filter((u) => u.id !== usuarioId));
      }
    });
  }

  function crearNuevo() {
    if (!nuevo.nombre.trim() || !nuevo.email.trim()) {
      setError("Nombre y correo son obligatorios.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await crearYInvitarUsuario({
        nombre: nuevo.nombre,
        rol: nuevo.rol,
        area_id: nuevo.area_id || null,
        email: nuevo.email,
      });
      if (!result.success) {
        setError(result.error ?? "Error al crear usuario.");
        return;
      }
      setResultado({ code: result.code!, email: result.email! });
      setNuevo({ nombre: "", rol: "cocina", area_id: "", email: "" });
      window.location.reload();
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {resultado && (
        <CodigoBanner
          code={resultado.code}
          email={resultado.email}
          onClose={() => setResultado(null)}
        />
      )}

      {error && <p className="text-sm text-wine">{error}</p>}

      <div className="arch-card border border-line bg-paper-card p-4">
        <h2 className="mb-3 font-display text-lg font-semibold text-ink">
          Nuevo usuario
        </h2>
        <div className="flex flex-col gap-2">
          <input
            placeholder="Nombre"
            value={nuevo.nombre}
            onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
            className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink"
          />
          <input
            placeholder="Correo"
            type="email"
            value={nuevo.email}
            onChange={(e) => setNuevo({ ...nuevo, email: e.target.value })}
            className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink"
          />
          <select
            value={nuevo.rol}
            onChange={(e) => setNuevo({ ...nuevo, rol: e.target.value as Rol })}
            className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <select
            value={nuevo.area_id}
            onChange={(e) => setNuevo({ ...nuevo, area_id: e.target.value })}
            className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink"
          >
            <option value="">Sin área fija</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nombre}
              </option>
            ))}
          </select>
          <button
            onClick={crearNuevo}
            disabled={pending}
            className="btn-touch rounded-lg bg-gold px-4 text-sm font-semibold text-white active:bg-gold-dark disabled:opacity-50"
          >
            {pending ? "Creando..." : "Crear e invitar"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {usuarios.map((u) => (
          <div
            key={u.id}
            className="rounded-xl border border-line bg-paper-card px-4 py-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-ink">{u.nombre}</p>
                <p className="text-xs text-ink-light/60">
                  {ROLES.find((r) => r.value === u.rol)?.label ?? u.rol}
                  {u.email && ` · ${u.email}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {u.email && (
                  <button
                    onClick={() => reenviar(u.email!)}
                    disabled={pending}
                    className="rounded-lg border border-line px-2 py-1 text-xs font-semibold text-ink-light/70"
                  >
                    Reenviar código
                  </button>
                )}
                <button
                  onClick={() => eliminar(u.id)}
                  disabled={pending}
                  className="rounded-lg border border-wine/30 px-2 py-1 text-xs font-semibold text-wine"
                >
                  Eliminar
                </button>
              </div>
            </div>

            {!u.email && (
              <div className="mt-2 flex gap-2">
                <input
                  placeholder="Correo para invitar"
                  type="email"
                  value={emailPorInvitar[u.id] ?? ""}
                  onChange={(e) =>
                    setEmailPorInvitar({ ...emailPorInvitar, [u.id]: e.target.value })
                  }
                  className="flex-1 rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink"
                />
                <button
                  onClick={() => invitarExistente(u.id)}
                  disabled={pending}
                  className="rounded-lg bg-gold px-3 py-2 text-sm font-semibold text-white active:bg-gold-dark disabled:opacity-50"
                >
                  Invitar
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

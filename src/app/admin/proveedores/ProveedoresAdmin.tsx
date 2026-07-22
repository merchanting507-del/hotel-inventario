"use client";

import { useState, useTransition } from "react";
import type { Proveedor } from "@/types/database.types";
import {
  actualizarProveedor,
  crearProveedor,
  eliminarProveedor,
  type ProveedorInput,
} from "./actions";

const VACIO: ProveedorInput = { nombre: "", contacto: null, whatsapp: null };

export default function ProveedoresAdmin({
  proveedoresIniciales,
}: {
  proveedoresIniciales: Proveedor[];
}) {
  const [proveedores, setProveedores] = useState(proveedoresIniciales);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState<ProveedorInput>(VACIO);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function editar(proveedor: Proveedor) {
    setEditandoId(proveedor.id);
    setForm({
      nombre: proveedor.nombre ?? "",
      contacto: proveedor.contacto,
      whatsapp: proveedor.whatsapp,
    });
  }

  function cancelar() {
    setEditandoId(null);
    setForm(VACIO);
    setError(null);
  }

  function guardar() {
    if (!form.nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    setError(null);

    startTransition(async () => {
      const result = editandoId
        ? await actualizarProveedor(editandoId, form)
        : await crearProveedor(form);

      if (!result.success) {
        setError(result.error ?? "Error al guardar.");
        return;
      }

      if (editandoId) {
        setProveedores((prev) =>
          prev.map((p) => (p.id === editandoId ? { ...p, ...form } : p))
        );
        cancelar();
      } else {
        window.location.reload();
      }
    });
  }

  function eliminar(id: string) {
    if (!confirm("¿Eliminar este proveedor?")) return;
    startTransition(async () => {
      const result = await eliminarProveedor(id);
      if (result.success) {
        setProveedores((prev) => prev.filter((p) => p.id !== id));
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border bg-white p-4">
        <h2 className="mb-3 font-semibold">
          {editandoId ? "Editar proveedor" : "Nuevo proveedor"}
        </h2>
        <div className="flex flex-col gap-2">
          <input
            placeholder="Nombre"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Contacto"
            value={form.contacto ?? ""}
            onChange={(e) => setForm({ ...form, contacto: e.target.value || null })}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="WhatsApp"
            value={form.whatsapp ?? ""}
            onChange={(e) => setForm({ ...form, whatsapp: e.target.value || null })}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2">
            <button
              onClick={guardar}
              disabled={pending}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {pending ? "Guardando..." : editandoId ? "Guardar cambios" : "Crear proveedor"}
            </button>
            {editandoId && (
              <button
                onClick={cancelar}
                className="rounded-lg border px-4 py-2 text-sm font-semibold text-gray-600"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {proveedores.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-xl border bg-white px-4 py-3"
          >
            <div>
              <p className="font-medium">{p.nombre}</p>
              <p className="text-xs text-gray-500">
                {p.contacto} {p.whatsapp && `· ${p.whatsapp}`}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => editar(p)}
                className="rounded-lg border px-3 py-1.5 text-xs font-semibold text-gray-600"
              >
                Editar
              </button>
              <button
                onClick={() => eliminar(p.id)}
                className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { registrarMantenimiento } from "./actions";

export default function MantenimientoForm({ activoId }: { activoId: string }) {
  const [tipo, setTipo] = useState("preventivo");
  const [descripcion, setDescripcion] = useState("");
  const [costo, setCosto] = useState("");
  const [proximo, setProximo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function guardar() {
    if (!tipo.trim()) {
      setError("El tipo es obligatorio.");
      return;
    }
    setError(null);

    startTransition(async () => {
      const result = await registrarMantenimiento(activoId, {
        tipo,
        descripcion: descripcion || null,
        costo: costo ? Number(costo) : null,
        proximo_mantenimiento: proximo || null,
      });
      // Si hay error, registrarMantenimiento lo devuelve; si tiene éxito, redirige.
      if (result && !result.success) {
        setError(result.error ?? "Error al guardar.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium">
        Tipo
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-3 text-base"
        >
          <option value="preventivo">Preventivo</option>
          <option value="correctivo">Correctivo</option>
          <option value="revision">Revisión</option>
        </select>
      </label>

      <label className="text-sm font-medium">
        Descripción
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-3 text-base"
        />
      </label>

      <label className="text-sm font-medium">
        Costo
        <input
          type="number"
          value={costo}
          onChange={(e) => setCosto(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-3 text-base"
        />
      </label>

      <label className="text-sm font-medium">
        Próximo mantenimiento
        <input
          type="date"
          value={proximo}
          onChange={(e) => setProximo(e.target.value)}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-3 text-base"
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        onClick={guardar}
        disabled={pending}
        className="btn-touch mt-2 rounded-xl bg-brand-600 text-lg font-bold text-white active:bg-brand-700 disabled:opacity-50"
      >
        {pending ? "Guardando..." : "Guardar mantenimiento"}
      </button>
    </div>
  );
}

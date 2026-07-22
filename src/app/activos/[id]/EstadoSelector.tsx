"use client";

import { useTransition } from "react";
import type { EstadoActivo } from "@/types/database.types";
import { actualizarEstadoActivo } from "../actions";

const ESTADOS: EstadoActivo[] = ["operativo", "mantenimiento", "dañado", "baja"];

export default function EstadoSelector({
  activoId,
  estadoActual,
}: {
  activoId: string;
  estadoActual: EstadoActivo;
}) {
  const [pending, startTransition] = useTransition();

  function cambiar(estado: EstadoActivo) {
    startTransition(async () => {
      await actualizarEstadoActivo(activoId, estado);
    });
  }

  return (
    <select
      defaultValue={estadoActual}
      disabled={pending}
      onChange={(e) => cambiar(e.target.value as EstadoActivo)}
      className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink"
    >
      {ESTADOS.map((e) => (
        <option key={e} value={e}>
          {e}
        </option>
      ))}
    </select>
  );
}

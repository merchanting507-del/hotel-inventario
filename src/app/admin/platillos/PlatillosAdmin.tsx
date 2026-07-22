"use client";

import { useMemo, useState, useTransition } from "react";
import type { Platillo, Producto, RecetaItem } from "@/types/database.types";
import {
  eliminarPlatillo,
  guardarPlatillo,
  venderPlatillo,
  type RecetaItemInput,
} from "./actions";

type Fila = { producto_id: string; cantidad: string };

const FILA_VACIA: Fila = { producto_id: "", cantidad: "" };

export default function PlatillosAdmin({
  platillosIniciales,
  productos,
  itemsIniciales,
}: {
  platillosIniciales: Platillo[];
  productos: Producto[];
  itemsIniciales: RecetaItem[];
}) {
  const [platillos, setPlatillos] = useState(platillosIniciales);
  const [items, setItems] = useState(itemsIniciales);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [nombre, setNombre] = useState("");
  const [filas, setFilas] = useState<Fila[]>([FILA_VACIA]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const [ventaCantidad, setVentaCantidad] = useState<Record<string, string>>({});
  const [ventaResultado, setVentaResultado] = useState<{
    platilloId: string;
    detalle: { producto: string; descontado: number; nuevoStock: number }[];
  } | null>(null);
  const [ventaError, setVentaError] = useState<{ platilloId: string; mensaje: string } | null>(
    null
  );

  const productoPorId = useMemo(
    () => new Map(productos.map((p) => [p.id, p])),
    [productos]
  );

  const itemsPorPlatillo = useMemo(() => {
    const map = new Map<string, RecetaItem[]>();
    for (const item of items) {
      if (!item.platillo_id) continue;
      const lista = map.get(item.platillo_id) ?? [];
      lista.push(item);
      map.set(item.platillo_id, lista);
    }
    return map;
  }, [items]);

  function nuevoPlatillo() {
    setEditandoId(null);
    setNombre("");
    setFilas([FILA_VACIA]);
    setError(null);
  }

  function editar(platillo: Platillo) {
    setEditandoId(platillo.id);
    setNombre(platillo.nombre);
    const propios = itemsPorPlatillo.get(platillo.id) ?? [];
    setFilas(
      propios.length
        ? propios.map((i) => ({
            producto_id: i.producto_id ?? "",
            cantidad: String(i.cantidad),
          }))
        : [FILA_VACIA]
    );
    setError(null);
  }

  function actualizarFila(index: number, cambio: Partial<Fila>) {
    setFilas((prev) => prev.map((f, i) => (i === index ? { ...f, ...cambio } : f)));
  }

  function agregarFila() {
    setFilas((prev) => [...prev, FILA_VACIA]);
  }

  function quitarFila(index: number) {
    setFilas((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  }

  function guardar() {
    if (!nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    const itemsValidos: RecetaItemInput[] = [];
    for (const fila of filas) {
      if (!fila.producto_id) continue;
      const cantidad = parseFloat(fila.cantidad);
      if (!cantidad || cantidad <= 0) {
        setError("Cada ingrediente necesita una cantidad mayor a cero.");
        return;
      }
      itemsValidos.push({ producto_id: fila.producto_id, cantidad });
    }

    if (itemsValidos.length === 0) {
      setError("Agrega al menos un ingrediente.");
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await guardarPlatillo(editandoId, { nombre, items: itemsValidos });
      if (!result.success) {
        setError(result.error ?? "Error al guardar.");
        return;
      }
      window.location.reload();
    });
  }

  function eliminar(id: string) {
    if (!confirm("¿Eliminar este platillo?")) return;
    startTransition(async () => {
      const result = await eliminarPlatillo(id);
      if (result.success) {
        setPlatillos((prev) => prev.filter((p) => p.id !== id));
      }
    });
  }

  function vender(platilloId: string) {
    const cantidad = parseFloat(ventaCantidad[platilloId] ?? "");
    if (!cantidad || cantidad <= 0) {
      setVentaError({ platilloId, mensaje: "Ingresa cuántos platillos se vendieron." });
      return;
    }
    setVentaError(null);
    setVentaResultado(null);
    startTransition(async () => {
      const result = await venderPlatillo(platilloId, cantidad);
      if (!result.success) {
        setVentaError({
          platilloId,
          mensaje: result.error ?? "No se pudo registrar la venta.",
        });
        return;
      }
      setVentaResultado({ platilloId, detalle: result.detalle ?? [] });
      setVentaCantidad((prev) => ({ ...prev, [platilloId]: "" }));
      setPlatillos((prev) => [...prev]);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="arch-card border border-line bg-paper-card p-4">
        <h2 className="mb-3 font-display text-lg font-semibold text-ink">
          {editandoId ? "Editar platillo" : "Nuevo platillo"}
        </h2>
        <div className="flex flex-col gap-3">
          <input
            placeholder="Nombre del platillo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink"
          />

          <p className="eyebrow">Ingredientes</p>
          <div className="flex flex-col gap-2">
            {filas.map((fila, i) => (
              <div key={i} className="flex gap-2">
                <select
                  value={fila.producto_id}
                  onChange={(e) => actualizarFila(i, { producto_id: e.target.value })}
                  className="flex-1 rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink"
                >
                  <option value="">Producto...</option>
                  {productos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} ({p.unidad_medida})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  step="any"
                  placeholder="Cant."
                  value={fila.cantidad}
                  onChange={(e) => actualizarFila(i, { cantidad: e.target.value })}
                  className="figures w-20 rounded-lg border border-line bg-white px-2 py-2 text-sm text-ink"
                />
                <button
                  onClick={() => quitarFila(i)}
                  className="rounded-lg border border-wine/30 px-2 text-wine"
                  aria-label="Quitar ingrediente"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={agregarFila}
            className="self-start text-sm font-medium text-gold-dark"
          >
            + Agregar ingrediente
          </button>

          {error && <p className="text-sm text-wine">{error}</p>}

          <div className="flex gap-2">
            <button
              onClick={guardar}
              disabled={pending}
              className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-white active:bg-gold-dark disabled:opacity-50"
            >
              {pending ? "Guardando..." : editandoId ? "Guardar cambios" : "Crear platillo"}
            </button>
            {editandoId && (
              <button
                onClick={nuevoPlatillo}
                className="rounded-lg border border-line px-4 py-2 text-sm font-semibold text-ink-light/70"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {platillos.map((platillo) => {
          const propios = itemsPorPlatillo.get(platillo.id) ?? [];
          return (
            <div
              key={platillo.id}
              className="rounded-xl border border-line bg-paper-card px-4 py-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-ink">{platillo.nombre}</p>
                  <p className="text-xs text-ink-light/60">
                    {propios
                      .map((i) => {
                        const p = i.producto_id ? productoPorId.get(i.producto_id) : null;
                        return p ? `${i.cantidad} ${p.unidad_medida} ${p.nombre}` : null;
                      })
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => editar(platillo)}
                    className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink-light/70"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => eliminar(platillo.id)}
                    className="rounded-lg border border-wine/30 px-3 py-1.5 text-xs font-semibold text-wine"
                  >
                    Eliminar
                  </button>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <input
                  type="number"
                  step="any"
                  placeholder="Cuántos se vendieron"
                  value={ventaCantidad[platillo.id] ?? ""}
                  onChange={(e) =>
                    setVentaCantidad((prev) => ({ ...prev, [platillo.id]: e.target.value }))
                  }
                  className="figures flex-1 rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink"
                />
                <button
                  onClick={() => vender(platillo.id)}
                  disabled={pending}
                  className="rounded-lg bg-pine px-4 py-2 text-sm font-semibold text-white active:bg-pine-dark disabled:opacity-50"
                >
                  Vender
                </button>
              </div>

              {ventaResultado?.platilloId === platillo.id && (
                <div className="mt-2 rounded-lg bg-pine/10 px-3 py-2 text-xs text-pine-dark">
                  <p className="font-semibold">Descontado del inventario de Cocina:</p>
                  {ventaResultado.detalle.map((d) => (
                    <p key={d.producto} className="figures">
                      {d.producto}: -{d.descontado} (queda {d.nuevoStock})
                    </p>
                  ))}
                </div>
              )}
              {ventaError?.platilloId === platillo.id && (
                <p className="mt-1 text-xs text-wine">{ventaError.mensaje}</p>
              )}
            </div>
          );
        })}
        {platillos.length === 0 && (
          <p className="py-8 text-center text-sm text-ink-light/40">
            Aún no hay platillos registrados.
          </p>
        )}
      </div>
    </div>
  );
}

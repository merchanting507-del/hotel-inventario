"use client";

import { useMemo, useState, useTransition } from "react";
import type { Producto, StockArea } from "@/types/database.types";
import { transferirACocina } from "./actions";

export default function TransferenciasAdmin({
  productos,
  stockCocinaInicial,
}: {
  productos: Producto[];
  stockCocinaInicial: StockArea[];
}) {
  const [stockCocina, setStockCocina] = useState(
    new Map(stockCocinaInicial.map((s) => [s.producto_id, s.cantidad]))
  );
  const [search, setSearch] = useState("");
  const [cantidades, setCantidades] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const [mensaje, setMensaje] = useState<{
    productoId: string;
    tipo: "ok" | "error";
    texto: string;
  } | null>(null);

  const productosFiltrados = useMemo(() => {
    return productos.filter((p) =>
      p.nombre.toLowerCase().includes(search.trim().toLowerCase())
    );
  }, [productos, search]);

  function transferir(producto: Producto) {
    const cantidad = parseFloat(cantidades[producto.id] ?? "");
    if (!cantidad || cantidad <= 0) {
      setMensaje({
        productoId: producto.id,
        tipo: "error",
        texto: "Ingresa una cantidad mayor a cero.",
      });
      return;
    }

    setMensaje(null);
    startTransition(async () => {
      const result = await transferirACocina(producto.id, cantidad);
      if (!result.success) {
        setMensaje({
          productoId: producto.id,
          tipo: "error",
          texto: result.error ?? "No se pudo transferir.",
        });
        return;
      }
      setStockCocina((prev) => {
        const copia = new Map(prev);
        copia.set(producto.id, result.nuevoStockArea ?? 0);
        return copia;
      });
      setCantidades((prev) => ({ ...prev, [producto.id]: "" }));
      setMensaje({
        productoId: producto.id,
        tipo: "ok",
        texto: `Transferido. Bodega: ${result.nuevoStockBodega} · Cocina: ${result.nuevoStockArea}`,
      });
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        type="text"
        placeholder="Buscar producto..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border border-line bg-white px-4 py-3 text-base text-ink focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
      />

      <div className="flex flex-col gap-2">
        {productosFiltrados.map((producto) => (
          <div
            key={producto.id}
            className="rounded-xl border border-line bg-paper-card px-4 py-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-ink">{producto.nombre}</p>
                <p className="figures text-xs text-ink-light/60">
                  Bodega: {producto.stock_actual} {producto.unidad_medida} · Cocina:{" "}
                  {stockCocina.get(producto.id) ?? 0} {producto.unidad_medida}
                </p>
              </div>
            </div>
            <div className="mt-2 flex gap-2">
              <input
                type="number"
                step="any"
                placeholder="Cantidad"
                value={cantidades[producto.id] ?? ""}
                onChange={(e) =>
                  setCantidades((prev) => ({ ...prev, [producto.id]: e.target.value }))
                }
                className="figures flex-1 rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink"
              />
              <button
                onClick={() => transferir(producto)}
                disabled={pending}
                className="rounded-lg bg-pine px-4 py-2 text-sm font-semibold text-white active:bg-pine-dark disabled:opacity-50"
              >
                Transferir
              </button>
            </div>
            {mensaje?.productoId === producto.id && (
              <p
                className={`mt-1 text-xs ${
                  mensaje.tipo === "ok" ? "text-pine-dark" : "text-wine"
                }`}
              >
                {mensaje.texto}
              </p>
            )}
          </div>
        ))}
        {productosFiltrados.length === 0 && (
          <p className="py-8 text-center text-sm text-ink-light/40">
            No hay productos que coincidan.
          </p>
        )}
      </div>
    </div>
  );
}

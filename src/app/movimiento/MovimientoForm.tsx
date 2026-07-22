"use client";

import { useMemo, useState, useTransition } from "react";
import type { Categoria, Producto, TipoMovimiento } from "@/types/database.types";
import Keypad from "@/components/Keypad";
import { registrarMovimiento } from "./actions";

type Step = "producto" | "tipo" | "cantidad";

const TIPOS: { value: TipoMovimiento; label: string; classes: string }[] = [
  {
    value: "entrada",
    label: "Entrada",
    classes: "bg-green-600 active:bg-green-700",
  },
  {
    value: "salida",
    label: "Salida",
    classes: "bg-brand-600 active:bg-brand-700",
  },
  {
    value: "merma",
    label: "Merma",
    classes: "bg-red-600 active:bg-red-700",
  },
];

export default function MovimientoForm({
  productos,
  categorias,
}: {
  productos: Producto[];
  categorias: Categoria[];
}) {
  const [productosState, setProductosState] = useState(productos);
  const [step, setStep] = useState<Step>("producto");
  const [search, setSearch] = useState("");
  const [categoriaId, setCategoriaId] = useState<string | "todas">("todas");
  const [seleccionado, setSeleccionado] = useState<Producto | null>(null);
  const [tipo, setTipo] = useState<TipoMovimiento | null>(null);
  const [cantidad, setCantidad] = useState("0");
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(
    null
  );
  const [pending, startTransition] = useTransition();

  const productosFiltrados = useMemo(() => {
    return productosState.filter((p) => {
      const coincideCategoria =
        categoriaId === "todas" || p.categoria_id === categoriaId;
      const coincideBusqueda = p.nombre
        .toLowerCase()
        .includes(search.trim().toLowerCase());
      return coincideCategoria && coincideBusqueda;
    });
  }, [productosState, categoriaId, search]);

  function elegirProducto(producto: Producto) {
    setSeleccionado(producto);
    setStep("tipo");
    setMensaje(null);
  }

  function elegirTipo(t: TipoMovimiento) {
    setTipo(t);
    setCantidad("0");
    setStep("cantidad");
  }

  function volver() {
    if (step === "cantidad") setStep("tipo");
    else if (step === "tipo") setStep("producto");
  }

  function confirmar() {
    if (!seleccionado || !tipo) return;
    const cantidadNum = parseFloat(cantidad);
    if (!cantidadNum || cantidadNum <= 0) return;

    const stockAnterior = seleccionado.stock_actual;
    const delta = tipo === "entrada" ? cantidadNum : -cantidadNum;
    const stockOptimista = stockAnterior + delta;

    // Optimistic UI: reflejamos el nuevo stock de inmediato.
    setProductosState((prev) =>
      prev.map((p) =>
        p.id === seleccionado.id ? { ...p, stock_actual: stockOptimista } : p
      )
    );

    startTransition(async () => {
      const result = await registrarMovimiento(seleccionado.id, tipo, cantidadNum);

      if (!result.success) {
        // revertir optimismo
        setProductosState((prev) =>
          prev.map((p) =>
            p.id === seleccionado.id ? { ...p, stock_actual: stockAnterior } : p
          )
        );
        setMensaje({ tipo: "error", texto: result.error ?? "Error al guardar." });
        return;
      }

      setMensaje({
        tipo: "ok",
        texto: `${tipo === "entrada" ? "Entrada" : tipo === "salida" ? "Salida" : "Merma"} de ${cantidadNum} ${seleccionado.unidad_medida} registrada.`,
      });
      setSeleccionado(null);
      setTipo(null);
      setCantidad("0");
      setStep("producto");
    });
  }

  if (step === "tipo" && seleccionado) {
    return (
      <div className="flex flex-col gap-4">
        <button onClick={volver} className="text-sm text-gray-500">
          ← Cambiar producto
        </button>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-lg font-semibold">{seleccionado.nombre}</p>
          <p className="text-sm text-gray-500">
            Stock actual: {seleccionado.stock_actual} {seleccionado.unidad_medida}
          </p>
        </div>
        <p className="text-sm font-medium text-gray-600">¿Qué tipo de movimiento es?</p>
        <div className="flex flex-col gap-3">
          {TIPOS.map((t) => (
            <button
              key={t.value}
              onClick={() => elegirTipo(t.value)}
              className={`btn-touch rounded-xl text-lg font-bold text-white ${t.classes}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (step === "cantidad" && seleccionado && tipo) {
    return (
      <div className="flex flex-col gap-4">
        <button onClick={volver} className="text-sm text-gray-500">
          ← Cambiar tipo
        </button>
        <div className="rounded-xl border bg-white p-4 text-center">
          <p className="text-lg font-semibold">{seleccionado.nombre}</p>
          <p className="text-sm capitalize text-gray-500">{tipo}</p>
          <p className="mt-2 text-4xl font-bold tabular-nums">
            {cantidad} <span className="text-lg font-normal">{seleccionado.unidad_medida}</span>
          </p>
        </div>

        <Keypad value={cantidad} onChange={setCantidad} />

        {mensaje && mensaje.tipo === "error" && (
          <p className="text-sm text-red-600">{mensaje.texto}</p>
        )}

        <button
          onClick={confirmar}
          disabled={pending || !parseFloat(cantidad)}
          className="btn-touch rounded-xl bg-brand-600 text-lg font-bold text-white active:bg-brand-700 disabled:opacity-40"
        >
          {pending ? "Guardando..." : "Confirmar"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {mensaje && (
        <p
          className={`rounded-lg px-3 py-2 text-sm ${
            mensaje.tipo === "ok"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {mensaje.texto}
        </p>
      )}

      <input
        type="text"
        placeholder="Buscar producto..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-brand-500 focus:outline-none"
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setCategoriaId("todas")}
          className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm ${
            categoriaId === "todas"
              ? "bg-brand-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          Todas
        </button>
        {categorias.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategoriaId(c.id)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm ${
              categoriaId === c.id
                ? "bg-brand-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {c.nombre}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {productosFiltrados.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-400">
            No hay productos que coincidan.
          </p>
        )}
        {productosFiltrados.map((producto) => (
          <button
            key={producto.id}
            onClick={() => elegirProducto(producto)}
            className="btn-touch flex items-center justify-between rounded-xl border bg-white px-4 py-3 text-left active:bg-gray-50"
          >
            <span className="font-medium">{producto.nombre}</span>
            <span className="text-sm text-gray-500">
              {producto.stock_actual} {producto.unidad_medida}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

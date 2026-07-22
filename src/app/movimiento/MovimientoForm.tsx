"use client";

import { useMemo, useState, useTransition } from "react";
import type { Categoria, Producto, TipoMovimiento } from "@/types/database.types";
import Keypad from "@/components/Keypad";
import { registrarMovimiento } from "./actions";

type Step = "producto" | "tipo" | "cantidad";

const STEPS: { key: Step; label: string }[] = [
  { key: "producto", label: "Producto" },
  { key: "tipo", label: "Tipo" },
  { key: "cantidad", label: "Cantidad" },
];

const TIPOS: { value: TipoMovimiento; label: string; classes: string }[] = [
  {
    value: "entrada",
    label: "Entrada",
    classes: "bg-pine active:bg-pine-dark",
  },
  {
    value: "salida",
    label: "Salida",
    classes: "bg-gold active:bg-gold-dark",
  },
  {
    value: "merma",
    label: "Merma",
    classes: "bg-wine active:bg-wine-dark",
  },
];

function StepIndicator({ current }: { current: Step }) {
  const currentIndex = STEPS.findIndex((s) => s.key === current);
  return (
    <div className="mb-5 flex items-center">
      {STEPS.map((step, i) => (
        <div key={step.key} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`figures flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                i <= currentIndex
                  ? "bg-gold text-white"
                  : "border border-line bg-white text-ink-light/50"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`eyebrow !text-[0.6rem] ${
                i <= currentIndex ? "!text-gold-dark" : "!text-ink-light/40"
              }`}
            >
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={`mx-2 mb-4 h-px flex-1 ${i < currentIndex ? "bg-gold" : "bg-line"}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function MovimientoForm({
  productos,
  categorias,
  areaId,
}: {
  productos: Producto[];
  categorias: Categoria[];
  areaId?: string | null;
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

  function cancelar() {
    setSeleccionado(null);
    setTipo(null);
    setCantidad("0");
    setStep("producto");
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
      const result = await registrarMovimiento(
        seleccionado.id,
        tipo,
        cantidadNum,
        undefined,
        areaId ?? undefined
      );

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
        <StepIndicator current={step} />
        <button
          onClick={volver}
          className="btn-touch self-start rounded-lg border border-line px-4 text-sm font-medium text-ink-light/70 active:bg-paper-card"
        >
          ← Cambiar producto
        </button>
        <div className="arch-card border border-line bg-paper-card p-4">
          <p className="font-display text-lg font-semibold text-ink">{seleccionado.nombre}</p>
          <p className="figures text-sm text-ink-light/60">
            Stock actual: {seleccionado.stock_actual} {seleccionado.unidad_medida}
          </p>
        </div>
        <p className="eyebrow">¿Qué tipo de movimiento es?</p>
        <div className="flex flex-col gap-3">
          {TIPOS.map((t) => (
            <button
              key={t.value}
              onClick={() => elegirTipo(t.value)}
              className={`btn-touch rounded-xl text-lg font-semibold text-white transition-colors ${t.classes}`}
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
        <StepIndicator current={step} />
        <div className="flex gap-2">
          <button
            onClick={volver}
            className="btn-touch flex-1 rounded-lg border border-line px-4 text-sm font-medium text-ink-light/70 active:bg-paper-card"
          >
            ← Cambiar tipo
          </button>
          <button
            onClick={cancelar}
            className="btn-touch flex-1 rounded-lg border border-wine/30 px-4 text-sm font-medium text-wine active:bg-wine/10"
          >
            Cancelar
          </button>
        </div>
        <div className="arch-card border border-line bg-paper-card p-4 text-center">
          <p className="font-display text-lg font-semibold text-ink">{seleccionado.nombre}</p>
          <p className="eyebrow mt-1">{tipo}</p>
          <p className="figures mt-2 text-4xl font-semibold text-ink">
            {cantidad} <span className="text-lg font-normal text-ink-light/60">{seleccionado.unidad_medida}</span>
          </p>
        </div>

        <Keypad value={cantidad} onChange={setCantidad} />

        {mensaje && mensaje.tipo === "error" && (
          <p className="text-sm text-wine">{mensaje.texto}</p>
        )}

        <button
          onClick={confirmar}
          disabled={pending || !parseFloat(cantidad)}
          className="btn-touch rounded-xl bg-gold text-lg font-semibold text-white transition-colors active:bg-gold-dark disabled:opacity-40"
        >
          {pending ? "Guardando..." : "Confirmar"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <StepIndicator current={step} />
      {mensaje && (
        <p
          className={`rounded-lg px-3 py-2 text-sm ${
            mensaje.tipo === "ok"
              ? "bg-pine/10 text-pine-dark"
              : "bg-wine/10 text-wine-dark"
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
        className="w-full rounded-lg border border-line bg-white px-4 py-3 text-base text-ink focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold"
      />

      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setCategoriaId("todas")}
          className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            categoriaId === "todas"
              ? "bg-gold text-white"
              : "bg-paper-card text-ink-light/70 border border-line"
          }`}
        >
          Todas
        </button>
        {categorias.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategoriaId(c.id)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              categoriaId === c.id
                ? "bg-gold text-white"
                : "bg-paper-card text-ink-light/70 border border-line"
            }`}
          >
            {c.nombre}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {productosFiltrados.length === 0 && (
          <p className="py-8 text-center text-sm text-ink-light/40">
            No hay productos que coincidan.
          </p>
        )}
        {productosFiltrados.map((producto) => (
          <button
            key={producto.id}
            onClick={() => elegirProducto(producto)}
            className="btn-touch flex items-center justify-between rounded-xl border border-line bg-paper-card px-4 py-3 text-left transition-colors active:bg-gold-light/30"
          >
            <span className="font-medium text-ink">{producto.nombre}</span>
            <span className="figures text-sm text-ink-light/60">
              {producto.stock_actual} {producto.unidad_medida}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

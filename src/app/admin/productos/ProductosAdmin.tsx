"use client";

import { useState, useTransition } from "react";
import type { Categoria, Producto, Proveedor } from "@/types/database.types";
import { actualizarProducto, crearProducto, eliminarProducto, type ProductoInput } from "./actions";

const VACIO: ProductoInput = {
  nombre: "",
  categoria_id: null,
  unidad_medida: "unidad",
  stock_actual: 0,
  stock_minimo: 0,
  dias_reposicion: 2,
  consumo_promedio_diario: 0,
  costo_unitario: null,
  proveedor_id: null,
  activo: true,
};

export default function ProductosAdmin({
  productosIniciales,
  categorias,
  proveedores,
}: {
  productosIniciales: Producto[];
  categorias: Categoria[];
  proveedores: Proveedor[];
}) {
  const [productos, setProductos] = useState(productosIniciales);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductoInput>(VACIO);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function editar(producto: Producto) {
    setEditandoId(producto.id);
    setForm({
      nombre: producto.nombre,
      categoria_id: producto.categoria_id,
      unidad_medida: producto.unidad_medida,
      stock_actual: producto.stock_actual,
      stock_minimo: producto.stock_minimo,
      dias_reposicion: producto.dias_reposicion,
      consumo_promedio_diario: producto.consumo_promedio_diario,
      costo_unitario: producto.costo_unitario,
      proveedor_id: producto.proveedor_id,
      activo: producto.activo,
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
        ? await actualizarProducto(editandoId, form)
        : await crearProducto(form);

      if (!result.success) {
        setError(result.error ?? "Error al guardar.");
        return;
      }

      if (editandoId) {
        setProductos((prev) =>
          prev.map((p) => (p.id === editandoId ? { ...p, ...form } : p))
        );
      } else {
        // No tenemos el id real hasta refrescar; recargamos la lista simple.
        window.location.reload();
        return;
      }
      cancelar();
    });
  }

  function eliminar(id: string) {
    if (!confirm("¿Eliminar este producto?")) return;
    startTransition(async () => {
      const result = await eliminarProducto(id);
      if (result.success) {
        setProductos((prev) => prev.filter((p) => p.id !== id));
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border bg-white p-4">
        <h2 className="mb-3 font-semibold">
          {editandoId ? "Editar producto" : "Nuevo producto"}
        </h2>

        <div className="flex flex-col gap-2">
          <input
            placeholder="Nombre"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />

          <select
            value={form.categoria_id ?? ""}
            onChange={(e) =>
              setForm({ ...form, categoria_id: e.target.value || null })
            }
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Sin categoría</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>

          <input
            placeholder="Unidad de medida (kg, litro, unidad...)"
            value={form.unidad_medida}
            onChange={(e) => setForm({ ...form, unidad_medida: e.target.value })}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />

          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs text-gray-500">
              Stock actual
              <input
                type="number"
                value={form.stock_actual}
                onChange={(e) =>
                  setForm({ ...form, stock_actual: Number(e.target.value) })
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs text-gray-500">
              Stock mínimo
              <input
                type="number"
                value={form.stock_minimo}
                onChange={(e) =>
                  setForm({ ...form, stock_minimo: Number(e.target.value) })
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs text-gray-500">
              Días reposición
              <input
                type="number"
                value={form.dias_reposicion}
                onChange={(e) =>
                  setForm({ ...form, dias_reposicion: Number(e.target.value) })
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs text-gray-500">
              Consumo prom. diario
              <input
                type="number"
                value={form.consumo_promedio_diario}
                onChange={(e) =>
                  setForm({
                    ...form,
                    consumo_promedio_diario: Number(e.target.value),
                  })
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs text-gray-500">
              Costo unitario
              <input
                type="number"
                value={form.costo_unitario ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    costo_unitario: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
          </div>

          <select
            value={form.proveedor_id ?? ""}
            onChange={(e) =>
              setForm({ ...form, proveedor_id: e.target.value || null })
            }
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">Sin proveedor</option>
            {proveedores.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.activo}
              onChange={(e) => setForm({ ...form, activo: e.target.checked })}
            />
            Activo
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-2">
            <button
              onClick={guardar}
              disabled={pending}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {pending ? "Guardando..." : editandoId ? "Guardar cambios" : "Crear producto"}
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
        {productos.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between rounded-xl border bg-white px-4 py-3"
          >
            <div>
              <p className="font-medium">{p.nombre}</p>
              <p className="text-xs text-gray-500">
                {p.stock_actual} {p.unidad_medida} · mín {p.stock_minimo}
                {!p.activo && " · inactivo"}
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

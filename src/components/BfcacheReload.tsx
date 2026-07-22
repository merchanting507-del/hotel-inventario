"use client";

import { useEffect } from "react";

/**
 * Cuando el navegador restaura una página desde su caché de atrás/adelante
 * (bfcache) en vez de recargarla, a veces queda "congelada": se ve pero no
 * responde a clics hasta refrescar a mano. Forzamos una recarga real en ese
 * caso, para que el botón de atrás del teléfono nunca deje la app pegada.
 */
export default function BfcacheReload() {
  useEffect(() => {
    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        window.location.reload();
      }
    }
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  return null;
}

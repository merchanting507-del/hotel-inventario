import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getCurrentUsuario } from "@/lib/auth";
import NavBar from "@/components/NavBar";
import RegisterServiceWorker from "@/components/RegisterServiceWorker";

export const metadata: Metadata = {
  title: "Hotel Inventario",
  description: "Control de inventario y activos fijos del hotel",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1d4ed8",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await getCurrentUsuario();

  return (
    <html lang="es">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        {usuario && <NavBar usuario={usuario} />}
        <main className="mx-auto w-full max-w-lg pb-8">{children}</main>
        <RegisterServiceWorker />
      </body>
    </html>
  );
}

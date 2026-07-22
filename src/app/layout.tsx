import type { Metadata, Viewport } from "next";
import { Playfair_Display, Work_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { getCurrentUsuario } from "@/lib/auth";
import NavBar from "@/components/NavBar";
import RegisterServiceWorker from "@/components/RegisterServiceWorker";

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700"],
});

const sans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600"],
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  title: "Marvella Club · Inventario",
  description: "Control de inventario y activos fijos de The Marvella Club",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1E2530",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await getCurrentUsuario();

  return (
    <html lang="es" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">
        {usuario && <NavBar usuario={usuario} />}
        <main className="mx-auto w-full max-w-lg pb-8">{children}</main>
        <RegisterServiceWorker />
      </body>
    </html>
  );
}

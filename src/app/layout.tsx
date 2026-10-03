import type { Metadata, Viewport } from "next";
import { Baloo_2, Plus_Jakarta_Sans } from "next/font/google";
import { PwaRegister } from "@/components/PwaRegister";
import "./globals.css";

const baloo2 = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#071e49",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "SPPG — Sistem Informasi Dapur MBG",
  description:
    "Satu sistem operasional dapur umum Makan Bergizi Gratis: presensi geofence, resep & BOM, stok FEFO, QC bahan, e-POD, hingga audit BGN.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SPPG Dapur",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${baloo2.variable} ${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-brand-canvas text-brand-dark font-sans selection:bg-brand-pastel selection:text-brand-dark">
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SPPG Mandiri Jaya — Dapur MBG",
    short_name: "SPPG Dapur",
    description: "Sistem Presensi, Monitoring Menu & Kalkulasi Stok Dapur MBG",
    start_url: "/presensi",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f8fafb",
    theme_color: "#071e49",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}

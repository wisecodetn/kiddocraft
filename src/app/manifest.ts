import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KiddoCraft",
    short_name: "KiddoCraft",
    description: "Jeux créatifs et tuiles magnétiques pour enfants en Tunisie",
    start_url: "/",
    display: "standalone",
    background_color: "#fffdf6",
    theme_color: "#048bdc",
    lang: "fr",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}

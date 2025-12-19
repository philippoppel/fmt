import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FindMyTherapy",
    short_name: "FMT",
    description: "Finde die richtige Therapie - nicht nur einen Therapeuten",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#4a7c59",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
